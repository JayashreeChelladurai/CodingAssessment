import {
  prepareAndCompileCode,
  runCompiledBinary,
  cleanupSandbox,
  executionSemaphore,
  normalizeOutput,
  TestCaseEvaluationResult,
} from "./codeRunner.js";

export interface TestCaseInput {
  id?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  weight?: number;
}

export interface QuestionGradingInput {
  id: string;
  type?: string;
  marks: number;
  negativeMarks?: number;
  timeLimitSeconds: number;
  memoryLimitMb: number;
  testCases: TestCaseInput[];
  options?: string; // JSON
  correctAnswers?: string; // JSON
}

export interface CodingGradingResponse {
  status: "ACCEPTED" | "WRONG_ANSWER" | "COMPILE_ERROR" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR";
  totalScore: number;
  maxScore: number;
  passedTestCases: number;
  totalTestCases: number;
  compilationError?: string;
  results: TestCaseEvaluationResult[];
}

export interface McqGradingResponse {
  status: "CORRECT" | "INCORRECT" | "UNATTEMPTED";
  score: number;
  maxScore: number;
  negativeMarks: number;
  selectedOptions: string[];
  correctAnswers: string[];
  isCorrect: boolean;
}

/**
 * Grade MCQ question with optional negative marking
 */
export function gradeMcqQuestion(
  selectedOptions: string[],
  correctAnswers: string[],
  marks: number,
  negativeMarks: number = 0
): McqGradingResponse {
  if (!selectedOptions || selectedOptions.length === 0) {
    return {
      status: "UNATTEMPTED",
      score: 0,
      maxScore: marks,
      negativeMarks,
      selectedOptions: [],
      correctAnswers,
      isCorrect: false,
    };
  }

  const normSelected = [...selectedOptions].sort();
  const normCorrect = [...correctAnswers].sort();

  const isExactMatch =
    normSelected.length === normCorrect.length &&
    normSelected.every((val, index) => val === normCorrect[index]);

  if (isExactMatch) {
    return {
      status: "CORRECT",
      score: marks,
      maxScore: marks,
      negativeMarks,
      selectedOptions,
      correctAnswers,
      isCorrect: true,
    };
  }

  // Incorrect response: apply negative mark penalty if configured
  const penalty = Math.abs(negativeMarks || 0);
  return {
    status: "INCORRECT",
    score: -penalty,
    maxScore: marks,
    negativeMarks,
    selectedOptions,
    correctAnswers,
    isCorrect: false,
  };
}

/**
 * Grade multi-language student code against test cases
 */
export async function gradeStudentCode(
  language: string,
  code: string,
  question: QuestionGradingInput,
  evaluateOnlyPublic: boolean = false
): Promise<CodingGradingResponse> {
  const targetTestCases = evaluateOnlyPublic
    ? question.testCases.filter((tc) => tc.isPublic)
    : question.testCases;

  if (targetTestCases.length === 0) {
    return {
      status: "ACCEPTED",
      totalScore: question.marks,
      maxScore: question.marks,
      passedTestCases: 0,
      totalTestCases: 0,
      results: [],
    };
  }

  return executionSemaphore.runExclusive(async () => {
    // 1. Compile Source Code ONCE
    const compiled = await prepareAndCompileCode(language, code, question.memoryLimitMb || 256);

    const totalQuestionWeight = question.testCases.reduce((sum, tc) => sum + (tc.weight ?? 1.0), 0) || 1;

    // Handle Compilation Failure immediately across all test cases
    if (!compiled.success) {
      await cleanupSandbox(compiled.tempDir);
      const compileErrorMsg = compiled.compilationError || "Compilation error";
      const results: TestCaseEvaluationResult[] = targetTestCases.map((tc) => ({
        testCaseId: tc.id,
        isPublic: tc.isPublic,
        input: tc.isPublic ? tc.input : "[Hidden Test Case]",
        expectedOutput: tc.isPublic ? tc.expectedOutput : "[Hidden Test Case]",
        status: "COMPILE_ERROR",
        stdout: "",
        stderr: compileErrorMsg,
        executionTimeMs: 0,
        passed: false,
        scoreAwarded: 0,
        weight: tc.weight ?? 1.0,
        compilationError: compileErrorMsg,
      }));

      return {
        status: "COMPILE_ERROR",
        totalScore: 0,
        maxScore: question.marks,
        passedTestCases: 0,
        totalTestCases: targetTestCases.length,
        compilationError: compileErrorMsg,
        results,
      };
    }

    try {
      const results: TestCaseEvaluationResult[] = [];
      let passedWeight = 0;
      let passedCount = 0;
      let hasRuntimeError = false;
      let hasTLE = false;

      // 2. Run Pre-Compiled Binary for each test case (sub-second evaluation)
      for (const tc of targetTestCases) {
        const weight = tc.weight ?? 1.0;

        const execResult = await runCompiledBinary(
          compiled.runCmd,
          compiled.runArgs,
          compiled.tempDir,
          tc.input,
          question.timeLimitSeconds || 3
        );

        if (execResult.status === "TIME_LIMIT_EXCEEDED") {
          hasTLE = true;
          results.push({
            testCaseId: tc.id,
            isPublic: tc.isPublic,
            input: tc.isPublic ? tc.input : "[Hidden Test Case]",
            expectedOutput: tc.isPublic ? tc.expectedOutput : "[Hidden Test Case]",
            status: "TIME_LIMIT_EXCEEDED",
            stdout: execResult.stdout,
            stderr: execResult.stderr,
            executionTimeMs: execResult.executionTimeMs,
            passed: false,
            scoreAwarded: 0,
            weight,
          });
          continue;
        }

        if (execResult.status === "RUNTIME_ERROR") {
          hasRuntimeError = true;
          results.push({
            testCaseId: tc.id,
            isPublic: tc.isPublic,
            input: tc.isPublic ? tc.input : "[Hidden Test Case]",
            expectedOutput: tc.isPublic ? tc.expectedOutput : "[Hidden Test Case]",
            status: "RUNTIME_ERROR",
            stdout: execResult.stdout,
            stderr: execResult.stderr,
            executionTimeMs: execResult.executionTimeMs,
            passed: false,
            scoreAwarded: 0,
            weight,
          });
          continue;
        }

        const actualNorm = normalizeOutput(execResult.stdout);
        const expectedNorm = normalizeOutput(tc.expectedOutput);
        const passed = actualNorm === expectedNorm;

        if (passed) {
          passedCount++;
          passedWeight += weight;
        }

        results.push({
          testCaseId: tc.id,
          isPublic: tc.isPublic,
          input: tc.isPublic ? tc.input : "[Hidden Test Case]",
          expectedOutput: tc.isPublic ? tc.expectedOutput : "[Hidden Test Case]",
          status: passed ? "ACCEPTED" : "WRONG_ANSWER",
          stdout: tc.isPublic || passed ? execResult.stdout : "[Output hidden for evaluation test case]",
          stderr: execResult.stderr,
          executionTimeMs: execResult.executionTimeMs,
          passed,
          scoreAwarded: passed ? Number(((weight / totalQuestionWeight) * question.marks).toFixed(2)) : 0,
          weight,
        });
      }

      const score = Number(((passedWeight / totalQuestionWeight) * question.marks).toFixed(2));

      let finalStatus: CodingGradingResponse["status"] = "ACCEPTED";
      if (passedCount === targetTestCases.length) {
        finalStatus = "ACCEPTED";
      } else if (hasTLE) {
        finalStatus = "TIME_LIMIT_EXCEEDED";
      } else if (hasRuntimeError) {
        finalStatus = "RUNTIME_ERROR";
      } else {
        finalStatus = "WRONG_ANSWER";
      }

      return {
        status: finalStatus,
        totalScore: score,
        maxScore: question.marks,
        passedTestCases: passedCount,
        totalTestCases: targetTestCases.length,
        results,
      };
    } finally {
      // 3. Clean up sandbox folder
      await cleanupSandbox(compiled.tempDir);
    }
  });
}
