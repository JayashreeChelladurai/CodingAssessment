import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

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

/**
 * Extract public class name from Java code, or default to "Solution"
 */
function extractClassName(code: string): string {
  const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return "Solution";
}

/**
 * Clean and normalize output for comparison
 */
export function normalizeOutput(output: string): string {
  return output
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

/**
 * Compile and run Java code against a single input
 */
export async function executeJavaCode(
  code: string,
  stdin: string,
  timeLimitSeconds: number = 3,
  memoryLimitMb: number = 256
): Promise<ExecutionResult> {
  const execId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `java_sandbox_${execId}`);
  const className = extractClassName(code);
  const javaFilePath = path.join(tempDir, `${className}.java`);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(javaFilePath, code, "utf-8");

    // 1. Compile Java Code
    const compileResult = await runProcess(
      "javac",
      ["-encoding", "UTF-8", `${className}.java`],
      tempDir,
      "",
      7000 // 7s compile timeout
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

    // 2. Execute Compiled Java Class
    const jvmArgs = [
      `-Xmx${memoryLimitMb}m`,
      `-Xms32m`,
      `-Dfile.encoding=UTF-8`,
      "-cp",
      ".",
      className,
    ];

    const startTime = Date.now();
    const runResult = await runProcess(
      "java",
      jvmArgs,
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
    // Cleanup temporary execution directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
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
      // Cap maximum output length to prevent memory saturation (max 512KB)
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
