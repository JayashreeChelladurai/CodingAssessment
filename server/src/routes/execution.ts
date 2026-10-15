import { Router } from "express";
import { prisma } from "../db.js";
import { gradeStudentCode, gradeSqlQuestion } from "../services/gradingService.js";
import { executeCode } from "../services/codeRunner.js";
import { executeSqlSandbox, generateExpectedOutput, compareSqlResults } from "../services/sqlRunner.js";
import { AuthenticatedRequest, requireAttemptSession } from "../services/auth.js";
import { enforceAttemptNotExpired } from "./student.js";

export const executionRouter = Router();

executionRouter.post("/run", requireAttemptSession, async (req: AuthenticatedRequest, res) => {
  try {
    const { language = "JAVA", code, questionId, customInput } = req.body;
    const attemptId = req.attemptSession?.attemptId;

    if (!attemptId) {
      return res.status(401).json({ error: "Attempt session is required." });
    }

    if (!code) {
      return res.status(400).json({ error: "Source code is required" });
    }

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: { select: { id: true, durationMinutes: true, endTime: true } } },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    if (!(await enforceAttemptNotExpired(attempt, res))) {
      return;
    }

    if (customInput !== undefined && customInput !== null) {
      const result = await executeCode(language, code, customInput, 3, 256);
      return res.json({
        type: "custom",
        result,
      });
    }

    if (!questionId) {
      return res.status(400).json({ error: "questionId is required when custom input is not provided" });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        testCases: {
          where: { isPublic: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!question || question.assessmentId !== attempt.assessmentId) {
      return res.status(404).json({ error: "Question not found" });
    }

    // SQL Question Execution
    if (question.type === "SQL") {
      const grading = await gradeSqlQuestion(question, code, true);
      return res.json({
        type: "sample_testcases",
        grading,
      });
    }

    // Coding Question Execution
    const grading = await gradeStudentCode(language, code, question, true);
    res.json({
      type: "sample_testcases",
      grading,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

executionRouter.post("/submit", requireAttemptSession, async (req: AuthenticatedRequest, res) => {
  try {
    const { language = "JAVA", code, questionId } = req.body;
    const attemptId = req.attemptSession?.attemptId;

    if (!attemptId || !code || !questionId) {
      return res.status(400).json({ error: "code, questionId, and attempt session are required" });
    }

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: { select: { id: true, durationMinutes: true, endTime: true } } },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    if (!(await enforceAttemptNotExpired(attempt, res))) {
      return;
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        testCases: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!question || question.assessmentId !== attempt.assessmentId) {
      return res.status(404).json({ error: "Question not found" });
    }

    // SQL Question Submission
    if (question.type === "SQL") {
      const grading = await gradeSqlQuestion(question, code, false);

      const existing = await prisma.submission.findFirst({
        where: { attemptId, questionId },
      });

      let submission;
      if (existing) {
        submission = await prisma.submission.update({
          where: { id: existing.id },
          data: {
            type: "SQL",
            language: "SQL",
            code,
            score: grading.totalScore,
            maxScore: grading.maxScore,
            passedTestCases: grading.passedTestCases,
            totalTestCases: grading.totalTestCases,
            status: grading.status,
            testCaseResults: JSON.stringify(grading.testCaseResults),
            submittedAt: new Date(),
          },
        });
      } else {
        submission = await prisma.submission.create({
          data: {
            attemptId,
            questionId,
            type: "SQL",
            language: "SQL",
            code,
            score: grading.totalScore,
            maxScore: grading.maxScore,
            passedTestCases: grading.passedTestCases,
            totalTestCases: grading.totalTestCases,
            status: grading.status,
            testCaseResults: JSON.stringify(grading.testCaseResults),
          },
        });
      }

      let drafts: Record<string, string> = {};
      try {
        drafts = JSON.parse(attempt.drafts || "{}");
      } catch {
        drafts = {};
      }
      drafts[questionId] = code;

      await prisma.studentAttempt.update({
        where: { id: attemptId },
        data: { drafts: JSON.stringify(drafts) },
      });

      return res.json({
        submission,
        grading,
      });
    }

    // Coding Question Submission
    const grading = await gradeStudentCode(language, code, question, false);

    const existing = await prisma.submission.findFirst({
      where: { attemptId, questionId },
    });

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          type: "CODING",
          language: language.toUpperCase(),
          code,
          score: grading.totalScore,
          maxScore: grading.maxScore,
          passedTestCases: grading.passedTestCases,
          totalTestCases: grading.totalTestCases,
          status: grading.status,
          testCaseResults: JSON.stringify(grading.results),
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          attemptId,
          questionId,
          type: "CODING",
          language: language.toUpperCase(),
          code,
          score: grading.totalScore,
          maxScore: grading.maxScore,
          passedTestCases: grading.passedTestCases,
          totalTestCases: grading.totalTestCases,
          status: grading.status,
          testCaseResults: JSON.stringify(grading.results),
        },
      });
    }

    let drafts: Record<string, string> = {};
    try {
      drafts = JSON.parse(attempt.drafts || "{}");
    } catch {
      drafts = {};
    }
    drafts[questionId] = code;

    await prisma.studentAttempt.update({
      where: { id: attemptId },
      data: { drafts: JSON.stringify(drafts) },
    });

    res.json({
      submission,
      grading,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin / Editor SQL sandbox preview endpoint
executionRouter.post("/test-sql", async (req, res) => {
  try {
    const { schemaDdl, seedData, querySql, solutionSql, orderSensitive } = req.body;
    if (!querySql && !solutionSql) {
      return res.status(400).json({ error: "Query SQL or Solution SQL is required" });
    }

    const queryToRun = querySql || solutionSql;
    const actual = executeSqlSandbox(schemaDdl || "", seedData || "", queryToRun);

    let expected = null;
    let diff = null;

    if (solutionSql && querySql) {
      expected = generateExpectedOutput(schemaDdl || "", seedData || "", solutionSql);
      diff = compareSqlResults(actual, expected, Boolean(orderSensitive));
    }

    res.json({
      actual,
      expected,
      diff,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
