import { executeCode, normalizeOutput, TestCaseEvaluationResult } from "./codeRunner.js";

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

  const results: TestCaseEvaluationResult[] = [];
  let totalWeight = 0;
  let passedWeight = 0;
  let hasCompileError = false;
  let compileErrorMsg = "";
  let hasRuntimeError = false;
  let hasTLE = false;
  let passedCount = 0;

  for (const tc of targetTestCases) {
    const weight = tc.weight ?? 1.0;
    totalWeight += weight;

    if (hasCompileError) {
      results.push({
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
        weight,
        compilationError: compileErrorMsg,
      });
      continue;
    }

    const execResult = await executeCode(
      language,
      code,
      tc.input,
      question.timeLimitSeconds,
      question.memoryLimitMb
    );

    if (execResult.status === "COMPILE_ERROR") {
      hasCompileError = true;
      compileErrorMsg = execResult.compilationError || "Compilation error";
      results.push({
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
        weight,
        compilationError: compileErrorMsg,
      });
      continue;
    }

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
      scoreAwarded: passed ? (weight / (question.testCases.reduce((a, b) => a + (b.weight ?? 1), 0))) * question.marks : 0,
      weight,
    });
  }

  const totalQuestionWeight = question.testCases.reduce((sum, tc) => sum + (tc.weight ?? 1.0), 0) || 1;
  const score = Number(((passedWeight / totalQuestionWeight) * question.marks).toFixed(2));

  let finalStatus: CodingGradingResponse["status"] = "ACCEPTED";
  if (hasCompileError) {
    finalStatus = "COMPILE_ERROR";
  } else if (passedCount === targetTestCases.length) {
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
    compilationError: hasCompileError ? compileErrorMsg : undefined,
    results,
  };
}
