import { Router } from "express";
import { prisma } from "../db.js";
import { gradeStudentCode } from "../services/gradingService.js";
import { executeCode } from "../services/codeRunner.js";
import { AuthenticatedRequest, requireAttemptSession } from "../services/auth.js";

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
      include: { assessment: { select: { id: true } } },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    if (attempt.status === "SUBMITTED" || attempt.status === "TIME_EXPIRED") {
      return res.status(409).json({ error: "Attempt is not active." });
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
      include: { assessment: { select: { id: true } } },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    if (attempt.status === "SUBMITTED" || attempt.status === "TIME_EXPIRED") {
      return res.status(409).json({ error: "Attempt is not active." });
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
