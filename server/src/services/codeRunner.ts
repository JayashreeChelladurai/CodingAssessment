import { spawn } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";
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

let cachedGccPath: string | null = null;
let cachedGppPath: string | null = null;

export function getGccPath(): string {
  if (cachedGccPath) return cachedGccPath;

  const potentialPaths = [
    path.resolve(__dirname, "../../compilers/w64devkit/bin/gcc.exe"),
    path.resolve(process.cwd(), "compilers/w64devkit/bin/gcc.exe"),
    path.resolve(__dirname, "../../../compilers/w64devkit/bin/gcc.exe"),
    "C:\\Program Files\\LLVM\\bin\\clang.exe",
    "C:\\msys64\\ucrt64\\bin\\gcc.exe",
    "C:\\MinGW\\bin\\gcc.exe",
    "gcc",
    "clang",
  ];

  for (const p of potentialPaths) {
    try {
      if (path.isAbsolute(p) && fsSync.existsSync(p)) {
        cachedGccPath = p;
        return p;
      }
    } catch {
      // ignore
    }
  }

  cachedGccPath = "gcc";
  return "gcc";
}

export function getGppPath(): string {
  if (cachedGppPath) return cachedGppPath;

  const potentialPaths = [
    path.resolve(__dirname, "../../compilers/w64devkit/bin/g++.exe"),
    path.resolve(process.cwd(), "compilers/w64devkit/bin/g++.exe"),
    path.resolve(__dirname, "../../../compilers/w64devkit/bin/g++.exe"),
    "C:\\Program Files\\LLVM\\bin\\clang++.exe",
    "C:\\msys64\\ucrt64\\bin\\g++.exe",
    "C:\\MinGW\\bin\\g++.exe",
    "g++",
    "clang++",
  ];

  for (const p of potentialPaths) {
    try {
      if (path.isAbsolute(p) && fsSync.existsSync(p)) {
        cachedGppPath = p;
        return p;
      }
    } catch {
      // ignore
    }
  }

  cachedGppPath = "g++";
  return "g++";
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

class ExecutionSemaphore {
  private running = 0;
  private maxConcurrent: number;
  private queue: (() => void)[] = [];

  constructor(maxConcurrent: number = 8) {
    this.maxConcurrent = maxConcurrent;
  }

  async acquire(): Promise<void> {
    if (this.running < this.maxConcurrent) {
      this.running++;
      return;
    }
    await new Promise<void>((resolve) => this.queue.push(resolve));
    this.running++;
  }

  release(): void {
    this.running--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    }
  }

  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

export const executionSemaphore = new ExecutionSemaphore(8);

export interface CompiledProgram {
  success: boolean;
  tempDir: string;
  runCmd: string;
  runArgs: string[];
  compilationError?: string;
}

/**
 * 1. Compile Source Code ONCE into bytecode/binary (Java, C, C++)
 */
export async function prepareAndCompileCode(
  language: SupportedLanguage | string,
  code: string,
  memoryLimitMb: number = 256
): Promise<CompiledProgram> {
  const normalizedLang = (language || "JAVA").toUpperCase();
  const execId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `sandbox_${normalizedLang.toLowerCase()}_${execId}`);

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
    compileCmd = getGccPath();
    compileArgs = ["-O2", "-Wall", "-std=c11", "Solution.c", "-o", exeName];

    runCmd = path.join(tempDir, exeName);
    runArgs = [];
  } else if (normalizedLang === "CPP" || normalizedLang === "C++") {
    const sourceFilePath = path.join(tempDir, "Solution.cpp");
    await fs.writeFile(sourceFilePath, code, "utf-8");

    const exeName = process.platform === "win32" ? "Solution.exe" : "Solution";
    compileCmd = getGppPath();
    compileArgs = ["-O2", "-Wall", "-std=c++17", "Solution.cpp", "-o", exeName];

    runCmd = path.join(tempDir, exeName);
    runArgs = [];
  } else {
    throw new Error(`Unsupported programming language: ${language}`);
  }

  // Execute compilation process
  const compileResult = await runProcess(
    compileCmd,
    compileArgs,
    tempDir,
    "",
    7000
  );

  if (compileResult.exitCode !== 0) {
    return {
      success: false,
      tempDir,
      runCmd: "",
      runArgs: [],
      compilationError: compileResult.stderr || compileResult.stdout || "Compilation failed",
    };
  }

  return {
    success: true,
    tempDir,
    runCmd,
    runArgs,
  };
}

/**
 * 2. Run Pre-Compiled Binary with stdin (executed in sub-second time for test cases)
 */
export async function runCompiledBinary(
  runCmd: string,
  runArgs: string[],
  tempDir: string,
  stdin: string,
  timeLimitSeconds: number = 3
): Promise<ExecutionResult> {
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
}

/**
 * Clean up isolated sandbox folder
 */
export async function cleanupSandbox(tempDir: string) {
  try {
    if (tempDir && fsSync.existsSync(tempDir)) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  } catch {
    // ignore
  }
}

/**
 * Universal Multi-Language Code Runner (Single-shot execution)
 */
export async function executeCode(
  language: SupportedLanguage | string,
  code: string,
  stdin: string,
  timeLimitSeconds: number = 3,
  memoryLimitMb: number = 256
): Promise<ExecutionResult> {
  return executionSemaphore.runExclusive(async () => {
    const compiled = await prepareAndCompileCode(language, code, memoryLimitMb);
    if (!compiled.success) {
      await cleanupSandbox(compiled.tempDir);
      return {
        status: "COMPILE_ERROR",
        stdout: "",
        stderr: compiled.compilationError || "Compilation error",
        compilationError: compiled.compilationError || "Compilation error",
        executionTimeMs: 0,
      };
    }

    try {
      return await runCompiledBinary(
        compiled.runCmd,
        compiled.runArgs,
        compiled.tempDir,
        stdin,
        timeLimitSeconds
      );
    } finally {
      await cleanupSandbox(compiled.tempDir);
    }
  });
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

    const gccDir = path.dirname(getGccPath());
    const pathSeparator = process.platform === "win32" ? ";" : ":";
    const customPath = `${gccDir}${pathSeparator}${process.env.PATH || ""}`;

    const child = spawn(command, args, {
      cwd,
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        PATH: customPath,
      },
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
