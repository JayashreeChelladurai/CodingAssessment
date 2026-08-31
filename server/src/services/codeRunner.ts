import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export type SupportedLanguage = "JAVA" | "C" | "CPP";

export interface ExecutionResult {
  status: "ACCEPTED" | "WRONG_ANSWER" | "COMPILE_ERROR" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "MEMORY_LIMIT_EXCEEDED";
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  compilationError?: string;
}

export interface TestCaseEvaluationResult extends ExecutionResult {
  testCaseId?: string;
  isPublic: boolean;
  input: string;
  expectedOutput: string;
  passed: boolean;
  scoreAwarded: number;
  weight: number;
}

function extractJavaClassName(code: string): string {
  const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return "Solution";
}

export function normalizeOutput(output: string): string {
  return output
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

/**
 * Universal Multi-Language Code Runner (Java, C, C++)
 */
export async function executeCode(
  language: SupportedLanguage | string,
  code: string,
  stdin: string,
  timeLimitSeconds: number = 3,
  memoryLimitMb: number = 256
): Promise<ExecutionResult> {
  const normalizedLang = (language || "JAVA").toUpperCase();
  const execId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `sandbox_${normalizedLang.toLowerCase()}_${execId}`);

  try {
    await fs.mkdir(tempDir, { recursive: true });

    let sourceFileName = "Solution";
    let compileCmd = "";
    let compileArgs: string[] = [];
    let runCmd = "";
    let runArgs: string[] = [];

    if (normalizedLang === "JAVA") {
      sourceFileName = extractJavaClassName(code);
      const sourceFilePath = path.join(tempDir, `${sourceFileName}.java`);
      await fs.writeFile(sourceFilePath, code, "utf-8");

      compileCmd = "javac";
      compileArgs = ["-encoding", "UTF-8", `${sourceFileName}.java`];

      runCmd = "java";
      runArgs = [
        `-Xmx${memoryLimitMb}m`,
        "-Xms32m",
        "-Dfile.encoding=UTF-8",
        "-cp",
        ".",
        sourceFileName,
      ];
    } else if (normalizedLang === "C") {
      const sourceFilePath = path.join(tempDir, "Solution.c");
      await fs.writeFile(sourceFilePath, code, "utf-8");

      const exeName = process.platform === "win32" ? "Solution.exe" : "Solution";
      compileCmd = "gcc";
      compileArgs = ["-O2", "-Wall", "-std=c11", "Solution.c", "-o", exeName];

      runCmd = path.join(tempDir, exeName);
      runArgs = [];
    } else if (normalizedLang === "CPP" || normalizedLang === "C++") {
      const sourceFilePath = path.join(tempDir, "Solution.cpp");
      await fs.writeFile(sourceFilePath, code, "utf-8");

      const exeName = process.platform === "win32" ? "Solution.exe" : "Solution";
      compileCmd = "g++";
      compileArgs = ["-O2", "-Wall", "-std=c++17", "Solution.cpp", "-o", exeName];

      runCmd = path.join(tempDir, exeName);
      runArgs = [];
    } else {
      throw new Error(`Unsupported programming language: ${language}`);
    }

    // 1. Compilation Step
    const compileResult = await runProcess(
      compileCmd,
      compileArgs,
      tempDir,
      "",
      7000
    );

    if (compileResult.exitCode !== 0) {
      return {
        status: "COMPILE_ERROR",
        stdout: "",
        stderr: compileResult.stderr || compileResult.stdout,
        compilationError: compileResult.stderr || compileResult.stdout,
        executionTimeMs: 0,
      };
    }

    // 2. Execution Step
    const startTime = Date.now();
    const runResult = await runProcess(
      runCmd,
      runArgs,
      tempDir,
      stdin,
      timeLimitSeconds * 1000
    );
    const executionTimeMs = Date.now() - startTime;

    if (runResult.timedOut) {
      return {
        status: "TIME_LIMIT_EXCEEDED",
        stdout: runResult.stdout,
        stderr: `Time Limit Exceeded (${timeLimitSeconds}s)`,
        executionTimeMs,
      };
    }

    if (runResult.exitCode !== 0) {
      return {
        status: "RUNTIME_ERROR",
        stdout: runResult.stdout,
        stderr: runResult.stderr || `Process exited with code ${runResult.exitCode}`,
        executionTimeMs,
      };
    }

    return {
      status: "ACCEPTED",
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      executionTimeMs,
    };
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

interface ProcessOutput {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
}

function runProcess(
  command: string,
  args: string[],
  cwd: string,
  input: string,
  timeoutMs: number
): Promise<ProcessOutput> {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let isSettled = false;

    const child = spawn(command, args, {
      cwd,
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const killProcess = () => {
      try {
        if (child.pid) {
          if (process.platform === "win32") {
            spawn("taskkill", ["/pid", child.pid.toString(), "/T", "/F"]);
          } else {
            child.kill("SIGKILL");
          }
        }
      } catch {
        // ignore
      }
    };

    const timer = setTimeout(() => {
      timedOut = true;
      killProcess();
    }, timeoutMs);

    if (child.stdin) {
      if (input) {
        child.stdin.write(input);
        if (!input.endsWith("\n")) {
          child.stdin.write("\n");
        }
      }
      child.stdin.end();
    }

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
      if (stdout.length > 512 * 1024) {
        killProcess();
      }
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
      if (stderr.length > 512 * 1024) {
        killProcess();
      }
    });

    child.on("error", (err) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: stderr || err.message,
        exitCode: 1,
        timedOut: false,
      });
    });

    child.on("close", (code) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        exitCode: code,
        timedOut,
      });
    });
  });
}
