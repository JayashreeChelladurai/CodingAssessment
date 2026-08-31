import { Router } from "express";
import { prisma } from "../db.js";
import { gradeStudentCode } from "../services/gradingService.js";
import { executeCode } from "../services/codeRunner.js";

export const executionRouter = Router();

// 1. Run Code against Sample Cases or Custom Input
executionRouter.post("/run", async (req, res) => {
  try {
    const { language = "JAVA", code, questionId, customInput } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Source code is required" });
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

    if (!question) {
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

// 2. Submit Question Solution (Multi-Language)
executionRouter.post("/submit", async (req, res) => {
  try {
    const { language = "JAVA", code, questionId, attemptId } = req.body;

    if (!code || !questionId || !attemptId) {
      return res.status(400).json({ error: "code, questionId, and attemptId are required" });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        testCases: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!question) {
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

    // Update draft in attempt
    const attempt = await prisma.studentAttempt.findUnique({ where: { id: attemptId } });
    if (attempt) {
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
    }

    res.json({
      submission,
      grading,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
