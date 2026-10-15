import {
  prepareAndCompileCode,
  runCompiledBinary,
  cleanupSandbox,
  executionSemaphore,
  normalizeOutput,
  TestCaseEvaluationResult,
} from "./codeRunner.js";
import { prisma } from "../db.js";
import {
  executeSqlSandbox,
  compareSqlResults,
  generateExpectedOutput,
  ExpectedOutput,
  ComparisonDiff,
} from "./sqlRunner.js";

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

export interface FibBlankEvaluation {
  blankIndex: number;
  studentAnswer: string;
  acceptedAnswers: string[];
  isPassed: boolean;
}

export interface FibGradingResponse {
  status: "CORRECT" | "INCORRECT" | "UNATTEMPTED";
  score: number;
  maxScore: number;
  negativeMarks: number;
  studentAnswers: string[];
  evaluations: FibBlankEvaluation[];
  isCorrect: boolean;
  correctCount: number;
  totalBlanks: number;
}

/**
 * Normalizes text for fill-in-the-blank comparison:
 * Trims leading/trailing whitespace, collapses internal whitespace, and lowers case.
 */
export function normalizeFibText(val: any): string {
  if (val === null || val === undefined) return "";
  return String(val).trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Grade Fill-in-the-Blanks (FIB) question
 * Each blank can have multiple accepted answers (array, pipe-delimited, or comma-delimited).
 * Partial credit is awarded proportionally to the number of correct blanks.
 */
export function gradeFibQuestion(
  studentAnswers: string[] = [],
  correctAnswersRaw: any = [],
  marks: number = 10,
  negativeMarks: number = 0
): FibGradingResponse {
  // Normalize raw correctAnswers into array of acceptable answers per blank: string[][]
  let acceptedPerBlank: string[][] = [];

  if (Array.isArray(correctAnswersRaw)) {
    acceptedPerBlank = correctAnswersRaw.map((entry) => {
      if (Array.isArray(entry)) {
        return entry.map((s) => String(s).trim());
      }
      if (typeof entry === "string") {
        if (entry.includes("|")) {
          return entry.split("|").map((s) => s.trim()).filter(Boolean);
        }
        return [entry.trim()];
      }
      return [String(entry).trim()];
    });
  } else if (typeof correctAnswersRaw === "string") {
    try {
      const parsed = JSON.parse(correctAnswersRaw);
      return gradeFibQuestion(studentAnswers, parsed, marks, negativeMarks);
    } catch {
      if (correctAnswersRaw.includes("|")) {
        acceptedPerBlank = [correctAnswersRaw.split("|").map((s) => s.trim()).filter(Boolean)];
      } else {
        acceptedPerBlank = [[correctAnswersRaw.trim()]];
      }
    }
  }

  const totalBlanks = Math.max(acceptedPerBlank.length, 1);
  const normalizedStudent = Array.isArray(studentAnswers) ? studentAnswers : [];

  // Check if unattempted (all blanks empty)
  const hasAnyInput = normalizedStudent.some((ans) => typeof ans === "string" && ans.trim().length > 0);

  if (!hasAnyInput) {
    return {
      status: "UNATTEMPTED",
      score: 0,
      maxScore: marks,
      negativeMarks,
      studentAnswers: normalizedStudent,
      evaluations: acceptedPerBlank.map((accepted, idx) => ({
        blankIndex: idx,
        studentAnswer: normalizedStudent[idx] || "",
        acceptedAnswers: accepted,
        isPassed: false,
      })),
      isCorrect: false,
      correctCount: 0,
      totalBlanks,
    };
  }

  let correctCount = 0;
  const evaluations: FibBlankEvaluation[] = acceptedPerBlank.map((acceptedList, idx) => {
    const studentAns = normalizedStudent[idx] || "";
    const normStudent = normalizeFibText(studentAns);

    const isPassed = acceptedList.some((acc) => {
      const normAcc = normalizeFibText(acc);
      return normStudent === normAcc;
    });

    if (isPassed) {
      correctCount++;
    }

    return {
      blankIndex: idx,
      studentAnswer: studentAns,
      acceptedAnswers: acceptedList,
      isPassed,
    };
  });

  const isExactMatch = correctCount === totalBlanks;

  if (isExactMatch) {
    return {
      status: "CORRECT",
      score: marks,
      maxScore: marks,
      negativeMarks,
      studentAnswers: normalizedStudent,
      evaluations,
      isCorrect: true,
      correctCount,
      totalBlanks,
    };
  }

  // If partially correct, award proportional score
  if (correctCount > 0) {
    const partialScore = Number(((correctCount / totalBlanks) * marks).toFixed(2));
    return {
      status: "INCORRECT",
      score: partialScore,
      maxScore: marks,
      negativeMarks,
      studentAnswers: normalizedStudent,
      evaluations,
      isCorrect: false,
      correctCount,
      totalBlanks,
    };
  }

  // Completely incorrect
  const penalty = Math.abs(negativeMarks || 0);
  return {
    status: "INCORRECT",
    score: penalty > 0 ? -penalty : 0,
    maxScore: marks,
    negativeMarks,
    studentAnswers: normalizedStudent,
    evaluations,
    isCorrect: false,
    correctCount: 0,
    totalBlanks,
  };
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

    // Scope total weight denominator to the test cases actually run (fixes sample-run score scaling)
    const totalRunWeight = targetTestCases.reduce((sum, tc) => sum + (tc.weight ?? 1.0), 0) || 1;

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
            input: tc.input,
            expectedOutput: tc.expectedOutput,
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
            input: tc.input,
            expectedOutput: tc.expectedOutput,
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
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          status: passed ? "ACCEPTED" : "WRONG_ANSWER",
          stdout: execResult.stdout,
          stderr: execResult.stderr,
          executionTimeMs: execResult.executionTimeMs,
          passed,
          scoreAwarded: passed ? Number(((weight / totalRunWeight) * question.marks).toFixed(2)) : 0,
          weight,
        });
      }

      const score = Number(((passedWeight / totalRunWeight) * question.marks).toFixed(2));

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

export interface SqlTestCaseEvaluation {
  testCaseId: string;
  title: string;
  isPublic: boolean;
  order: number;
  status: "PASSED" | "FAILED" | "ERROR";
  errorMessage: string | null;
  executionTimeMs: number;
  actualColumns: string[];
  expectedColumns: string[];
  actualRows: any[][];
  expectedRows: any[][];
  actualRowCount: number;
  expectedRowCount: number;
  diff: ComparisonDiff;
}

export interface SqlGradingResponse {
  questionId: string;
  status: "ACCEPTED" | "WRONG_ANSWER" | "SQL_SYNTAX_ERROR";
  score: number;
  totalScore: number;
  maxScore: number;
  passedTestCases: number;
  totalTestCases: number;
  executionTimeMs: number;
  testCaseResults: SqlTestCaseEvaluation[];
  results: SqlTestCaseEvaluation[];
}

/**
 * Grade candidate SQL query against test cases using in-memory SQLite sandbox
 */
export async function gradeSqlQuestion(
  question: any,
  candidateSql: string,
  evaluateOnlyPublic: boolean = false
): Promise<SqlGradingResponse> {
  const allTestCases: any[] = question.testCases || [];
  const targetTestCases = evaluateOnlyPublic
    ? allTestCases.filter((tc: any) => tc.isPublic)
    : allTestCases;

  if (targetTestCases.length === 0) {
    return {
      questionId: question.id,
      status: "ACCEPTED",
      score: question.marks || 10,
      totalScore: question.marks || 10,
      maxScore: question.marks || 10,
      passedTestCases: 0,
      totalTestCases: 0,
      executionTimeMs: 0,
      testCaseResults: [],
      results: [],
    };
  }

  let totalExecutionTime = 0;
  let passedCount = 0;
  let hasSyntaxError = false;
  let passedWeight = 0;
  const totalRunWeight = targetTestCases.reduce((sum, tc) => sum + (tc.weight ?? 1.0), 0) || 1;
  const evaluations: SqlTestCaseEvaluation[] = [];

  for (let idx = 0; idx < targetTestCases.length; idx++) {
    const tc = targetTestCases[idx];

    // 1. Resolve Expected Output
    let expected: ExpectedOutput;
    try {
      if (tc.expectedOutput && tc.expectedOutput.trim().length > 2 && tc.expectedOutput.trim() !== "{}") {
        expected = JSON.parse(tc.expectedOutput);
      } else {
        expected = generateExpectedOutput(
          question.schemaDdl || "",
          tc.seedData || "",
          question.solutionSql || ""
        );
        // Cache expected output back to database asynchronously if testCase has an ID
        if (tc.id) {
          prisma.testCase
            .update({
              where: { id: tc.id },
              data: { expectedOutput: JSON.stringify(expected) },
            })
            .catch(() => {});
        }
      }
    } catch {
      expected = {
        columns: [],
        rows: [],
        rowCount: 0,
      };
    }

    // 2. Execute Candidate Query in Sandbox
    const actual = executeSqlSandbox(question.schemaDdl || "", tc.seedData || "", candidateSql);
    totalExecutionTime += actual.executionTimeMs;

    if (!actual.success) {
      hasSyntaxError = true;
      evaluations.push({
        testCaseId: tc.id || `tc-${idx}`,
        title: tc.title || `Test Case ${idx + 1}`,
        isPublic: tc.isPublic !== false,
        order: tc.order ?? idx,
        status: "ERROR",
        errorMessage: actual.error || "Query execution failed",
        executionTimeMs: actual.executionTimeMs,
        actualColumns: [],
        expectedColumns: expected.columns || [],
        actualRows: [],
        expectedRows: tc.isPublic ? expected.rows || [] : [],
        actualRowCount: 0,
        expectedRowCount: expected.rowCount || 0,
        diff: {
          status: "FAILED",
          reason: actual.error,
        },
      });
      continue;
    }

    // 3. Compare with Expected Output
    const orderSensitive =
      tc.orderSensitive !== null && tc.orderSensitive !== undefined
        ? tc.orderSensitive
        : (question.orderSensitive ?? false);
    const diff = compareSqlResults(actual, expected, orderSensitive);

    const isPassed = diff.status === "PASSED";
    if (isPassed) {
      passedCount++;
      passedWeight += (tc.weight ?? 1.0);
    }

    evaluations.push({
      testCaseId: tc.id || `tc-${idx}`,
      title: tc.title || `Test Case ${idx + 1}`,
      isPublic: tc.isPublic !== false,
      order: tc.order ?? idx,
      status: isPassed ? "PASSED" : "FAILED",
      errorMessage: isPassed ? null : diff.reason || "Output does not match expected result",
      executionTimeMs: actual.executionTimeMs,
      actualColumns: actual.columns,
      expectedColumns: expected.columns,
      actualRows: actual.rows,
      expectedRows: tc.isPublic ? expected.rows : (isPassed ? actual.rows : []),
      actualRowCount: actual.rowCount,
      expectedRowCount: expected.rowCount,
      diff,
    });
  }

  const score = Number(((passedWeight / totalRunWeight) * (question.marks || 10)).toFixed(2));
  const finalStatus: SqlGradingResponse["status"] =
    hasSyntaxError && passedCount === 0
      ? "SQL_SYNTAX_ERROR"
      : passedCount === targetTestCases.length
      ? "ACCEPTED"
      : "WRONG_ANSWER";

  return {
    questionId: question.id,
    status: finalStatus,
    score,
    totalScore: score,
    maxScore: question.marks || 10,
    passedTestCases: passedCount,
    totalTestCases: targetTestCases.length,
    executionTimeMs: Math.round(totalExecutionTime * 100) / 100,
    testCaseResults: evaluations,
    results: evaluations,
  };
}
