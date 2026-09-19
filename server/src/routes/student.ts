import { Router } from "express";
import { prisma } from "../db.js";
import { isSebRequest } from "../services/sebService.js";
import { gradeStudentCode, gradeMcqQuestion } from "../services/gradingService.js";
import {
  issueAttemptSessionToken,
  requireAttemptSession,
  AuthenticatedRequest,
} from "../services/auth.js";

export const studentRouter = Router();

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 1. Get Assessment Public Info & Check SEB Status (Gatekeeper check)
studentRouter.get("/info/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const cleanCode = code.trim().toUpperCase();

    const assessment = await prisma.assessment.findUnique({
      where: { code: cleanCode },
      include: {
        sections: { select: { id: true, title: true, order: true } },
        questions: { select: { id: true, type: true, marks: true } },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment code not found." });
    }

    const isSeb = isSebRequest(req);

    res.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        code: assessment.code,
        durationMinutes: assessment.durationMinutes,
        startTime: assessment.startTime,
        endTime: assessment.endTime,
        requireSeb: assessment.requireSeb,
        totalQuestions: assessment.questions.length,
        totalMarks: assessment.questions.reduce((sum, q) => sum + q.marks, 0),
        sections: assessment.sections,
      },
      isSeb,
      canStart: !assessment.requireSeb || isSeb,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Start / Resume Assessment Attempt
studentRouter.post("/start", async (req, res) => {
  try {
    const { code, rollNo, studentName } = req.body;

    if (!code || !rollNo || !studentName) {
      return res.status(400).json({ error: "Assessment code, Roll Number, and Name are required" });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanRollNo = rollNo.trim().toUpperCase();

    const assessment = await prisma.assessment.findUnique({
      where: { code: cleanCode },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
        questions: {
          include: {
            testCases: {
              where: { isPublic: true }, // Only expose public/sample test cases!
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment code not found. Please verify with your professor." });
    }

    // Check SEB requirement if enabled
    const isSeb = isSebRequest(req);
    if (assessment.requireSeb && !isSeb && process.env.NODE_ENV === "production") {
      return res.status(403).json({
        error: "This assessment strictly requires Safe Exam Browser (SEB). Please launch via your .seb file.",
        requireSeb: true,
      });
    }

    const now = new Date();

    if (assessment.startTime && now < assessment.startTime) {
      return res.status(403).json({
        error: `Assessment has not started yet. Starts at: ${assessment.startTime.toLocaleString()}`,
      });
    }

    if (assessment.endTime && now > assessment.endTime) {
      return res.status(403).json({
        error: `Assessment window has closed. Ended at: ${assessment.endTime.toLocaleString()}`,
      });
    }

    let attempt = await prisma.studentAttempt.findUnique({
      where: {
        assessmentId_rollNo: {
          assessmentId: assessment.id,
          rollNo: cleanRollNo,
        },
      },
      include: { violations: true, submissions: true },
    });

    if (attempt) {
      if (attempt.status === "SUBMITTED") {
        return res.status(403).json({
          error: "You have already submitted this assessment.",
          isSubmitted: true,
        });
      }
      if (attempt.status === "TIME_EXPIRED") {
        return res.status(403).json({
          error: "Your assessment time has expired.",
          isExpired: true,
        });
      }
    } else {
      let remaining = assessment.durationMinutes * 60;
      if (assessment.endTime) {
        const secondsUntilEnd = Math.floor((assessment.endTime.getTime() - now.getTime()) / 1000);
        remaining = Math.min(remaining, secondsUntilEnd);
      }

      // Generate question order (shuffled ONLY within each specific section, preserving section sequence!)
      let questionOrder: string[] = [];
      const sections = assessment.sections && assessment.sections.length > 0
        ? [...assessment.sections].sort((a, b) => a.order - b.order)
        : [];

      if (sections.length > 0) {
        for (const sec of sections) {
          const secQuestions = assessment.questions
            .filter((q) => q.sectionId === sec.id)
            .sort((a, b) => a.order - b.order);

          let secQIds = secQuestions.map((q) => q.id);
          if (assessment.shuffleQuestions) {
            secQIds = shuffleArray(secQIds);
          }
          questionOrder.push(...secQIds);
        }

        // Include any orphan questions without sectionId if any
        const orphanQuestions = assessment.questions
          .filter((q) => !q.sectionId)
          .sort((a, b) => a.order - b.order);
        let orphanQIds = orphanQuestions.map((q) => q.id);
        if (assessment.shuffleQuestions) {
          orphanQIds = shuffleArray(orphanQIds);
        }
        questionOrder.push(...orphanQIds);
      } else {
        questionOrder = assessment.questions.map((q) => q.id);
        if (assessment.shuffleQuestions) {
          questionOrder = shuffleArray(questionOrder);
        }
      }

      // Generate option orders for MCQs (shuffled)
      const optionOrders: Record<string, string[]> = {};
      assessment.questions.forEach((q) => {
        if (q.type === "MCQ") {
          try {
            const opts = JSON.parse(q.options || "[]");
            const optIds = opts.map((o: any) => o.id);
            optionOrders[q.id] = shuffleArray(optIds);
          } catch {
            optionOrders[q.id] = [];
          }
        }
      });

      attempt = await prisma.studentAttempt.create({
        data: {
          assessmentId: assessment.id,
          rollNo: cleanRollNo,
          studentName: studentName.trim(),
          remainingSeconds: Math.max(60, remaining),
          status: "IN_PROGRESS",
          questionOrder: JSON.stringify(questionOrder),
          optionOrders: JSON.stringify(optionOrders),
        },
        include: { violations: true, submissions: true },
      });
    }

    // Sanitize questions: strip correctAnswers for exam mode!
    const sanitizedQuestions = assessment.questions.map((q) => ({
      id: q.id,
      sectionId: q.sectionId,
      type: q.type,
      title: q.title,
      description: q.description,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      mcqType: q.mcqType,
      options: q.options, // Options list (without correct answer tag)
      allowedLanguages: q.allowedLanguages,
      starterCodes: q.starterCodes,
      starterCode: q.starterCode,
      timeLimitSeconds: q.timeLimitSeconds,
      memoryLimitMb: q.memoryLimitMb,
      testCases: q.testCases,
    }));

      const attemptToken = issueAttemptSessionToken(attempt.id, assessment.id, cleanRollNo);
      res.json({
        attempt,
        attemptToken,
        assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        code: assessment.code,
        durationMinutes: assessment.durationMinutes,
        sections: assessment.sections,
        questions: sanitizedQuestions,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Save Drafts (Coding drafts, MCQ responses, flagged review questions)
studentRouter.post("/save-draft", requireAttemptSession, async (req: AuthenticatedRequest, res) => {
  try {
    const { attemptId, drafts, mcqResponses, flaggedQuestions, remainingSeconds } = req.body;
    if (req.attemptSession?.attemptId !== attemptId) {
      return res.status(401).json({ error: "Invalid attempt session." });
    }

    if (!attemptId) {
      return res.status(400).json({ error: "attemptId is required" });
    }

    const updateData: any = {
      lastHeartbeat: new Date(),
    };

    if (drafts !== undefined) {
      updateData.drafts = typeof drafts === "string" ? drafts : JSON.stringify(drafts);
    }
    if (mcqResponses !== undefined) {
      updateData.mcqResponses = typeof mcqResponses === "string" ? mcqResponses : JSON.stringify(mcqResponses);
    }
    if (flaggedQuestions !== undefined) {
      updateData.flaggedQuestions = typeof flaggedQuestions === "string" ? flaggedQuestions : JSON.stringify(flaggedQuestions);
    }
    if (remainingSeconds !== undefined) {
      updateData.remainingSeconds = Math.max(0, Number(remainingSeconds));
    }

    const attempt = await prisma.studentAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found." });
    }
    if (attempt.status === "SUBMITTED" || attempt.status === "TIME_EXPIRED") {
      return res.status(409).json({ error: "Attempt is already closed." });
    }

    const updated = await prisma.studentAttempt.update({
      where: { id: attemptId },
      data: updateData,
    });

    res.json({ success: true, updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Submit MCQ Answer
studentRouter.post("/submit-mcq", requireAttemptSession, async (req: AuthenticatedRequest, res) => {
  try {
    const { attemptId, questionId, selectedOptions } = req.body;
    if (req.attemptSession?.attemptId !== attemptId) {
      return res.status(401).json({ error: "Invalid attempt session." });
    }

    if (!attemptId || !questionId) {
      return res.status(400).json({ error: "attemptId and questionId are required" });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.type !== "MCQ") {
      return res.status(404).json({ error: "MCQ Question not found" });
    }

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: { select: { id: true } } },
    });
    if (!attempt || question.assessmentId !== attempt.assessmentId) {
      return res.status(404).json({ error: "Attempt not found." });
    }
    if (attempt.status === "SUBMITTED" || attempt.status === "TIME_EXPIRED") {
      return res.status(409).json({ error: "Attempt is already closed." });
    }

    let correctAnswers: string[] = [];
    try {
      correctAnswers = JSON.parse(question.correctAnswers || "[]");
    } catch {
      correctAnswers = [];
    }

    const selected = Array.isArray(selectedOptions) ? selectedOptions : [];
    const isCorrect =
      selected.length === correctAnswers.length &&
      [...selected].sort().every((v, i) => v === [...correctAnswers].sort()[i]);

    let score = 0;
    if (selected.length > 0) {
      score = isCorrect ? question.marks : -Math.abs(question.negativeMarks || 0);
    }

    const existing = await prisma.submission.findFirst({
      where: { attemptId, questionId },
    });

    let submission;
    if (existing) {
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          type: "MCQ",
          selectedOptions: JSON.stringify(selected),
          score,
          maxScore: question.marks,
          status: isCorrect ? "ACCEPTED" : "WRONG_ANSWER",
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          attemptId,
          questionId,
          type: "MCQ",
          selectedOptions: JSON.stringify(selected),
          score,
          maxScore: question.marks,
          status: isCorrect ? "ACCEPTED" : "WRONG_ANSWER",
        },
      });
    }

    // Save to mcqResponses in attempt
    const attemptState = await prisma.studentAttempt.findUnique({ where: { id: attemptId } });
    if (attemptState) {
      let currentMcq: Record<string, string[]> = {};
      try {
        currentMcq = JSON.parse(attemptState.mcqResponses || "{}");
      } catch {
        currentMcq = {};
      }
      currentMcq[questionId] = selected;

      await prisma.studentAttempt.update({
        where: { id: attemptId },
        data: { mcqResponses: JSON.stringify(currentMcq) },
      });
    }

    res.json({ success: true, submission });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export function extractDraftCodeForQuestion(
  drafts: any,
  questionId: string,
  allowedLanguages: string[] = ["JAVA"]
): { code: string; language: string } | null {
  if (!drafts || typeof drafts !== "object") return null;

  // 1. Check for compound keys: `${questionId}_${lang}`
  for (const lang of allowedLanguages) {
    const key = `${questionId}_${lang.toUpperCase()}`;
    if (typeof drafts[key] === "string" && drafts[key].trim().length > 0) {
      return { code: drafts[key], language: lang.toUpperCase() };
    }
  }

  // 2. Check for nested object drafts[questionId]
  const val = drafts[questionId];
  if (typeof val === "object" && val !== null) {
    for (const lang of allowedLanguages) {
      if (typeof val[lang] === "string" && val[lang].trim().length > 0) {
        return { code: val[lang], language: lang.toUpperCase() };
      }
    }
    for (const k of Object.keys(val)) {
      if (typeof val[k] === "string" && val[k].trim().length > 0) {
        return { code: val[k], language: k.toUpperCase() };
      }
    }
  }

  // 3. Check for direct string drafts[questionId]
  if (typeof val === "string" && val.trim().length > 0) {
    const lang = allowedLanguages[0] || "JAVA";
    return { code: val, language: lang.toUpperCase() };
  }

  return null;
}

export async function autoGradeAndFinalizeAttempt(
  attemptId: string,
  markStatus: "SUBMITTED" | "TIME_EXPIRED" = "SUBMITTED"
) {
  const attempt = await prisma.studentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: {
          questions: {
            include: {
              testCases: { orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
          },
        },
      },
      submissions: true,
    },
  });

  if (!attempt) return null;

  let drafts: any = {};
  try {
    drafts = typeof attempt.drafts === "string" ? JSON.parse(attempt.drafts || "{}") : (attempt.drafts || {});
  } catch {
    drafts = {};
  }

  let mcqResponses: Record<string, string[]> = {};
  try {
    mcqResponses = typeof attempt.mcqResponses === "string" ? JSON.parse(attempt.mcqResponses || "{}") : (attempt.mcqResponses || {});
  } catch {
    mcqResponses = {};
  }

  const existingSubmissions = attempt.submissions || [];
  let totalScore = 0;

  for (const q of attempt.assessment.questions) {
    const existingSub = existingSubmissions.find((s) => s.questionId === q.id);

    if (q.type === "CODING") {
      const allowedLangs = q.allowedLanguages
        ? q.allowedLanguages.split(",").map((l) => l.trim().toUpperCase())
        : ["JAVA", "C", "CPP"];

      const draftInfo = extractDraftCodeForQuestion(drafts, q.id, allowedLangs);

      if (draftInfo && draftInfo.code.trim().length > 0) {
        if (existingSub && existingSub.code === draftInfo.code) {
          totalScore += existingSub.score;
          continue;
        }

        const grading = await gradeStudentCode(draftInfo.language, draftInfo.code, q, false);
        totalScore += grading.totalScore;

        if (existingSub) {
          await prisma.submission.update({
            where: { id: existingSub.id },
            data: {
              type: "CODING",
              language: draftInfo.language,
              code: draftInfo.code,
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
          await prisma.submission.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              type: "CODING",
              language: draftInfo.language,
              code: draftInfo.code,
              score: grading.totalScore,
              maxScore: grading.maxScore,
              passedTestCases: grading.passedTestCases,
              totalTestCases: grading.totalTestCases,
              status: grading.status,
              testCaseResults: JSON.stringify(grading.results),
              submittedAt: new Date(),
            },
          });
        }
      } else {
        if (existingSub) {
          totalScore += existingSub.score;
        } else {
          const starterCode = q.starterCode || "";
          await prisma.submission.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              type: "CODING",
              language: allowedLangs[0] || "JAVA",
              code: starterCode,
              score: 0,
              maxScore: q.marks,
              passedTestCases: 0,
              totalTestCases: q.testCases.length,
              status: "NOT_SUBMITTED",
              testCaseResults: "[]",
              submittedAt: new Date(),
            },
          });
        }
      }
    } else if (q.type === "MCQ") {
      const selected = mcqResponses[q.id];
      if (selected && selected.length > 0) {
        let correctAnswers: string[] = [];
        try {
          correctAnswers = JSON.parse(q.correctAnswers || "[]");
        } catch {
          correctAnswers = [];
        }

        const grading = gradeMcqQuestion(selected, correctAnswers, q.marks, q.negativeMarks || 0);
        totalScore += grading.score;

        if (existingSub) {
          await prisma.submission.update({
            where: { id: existingSub.id },
            data: {
              type: "MCQ",
              selectedOptions: JSON.stringify(selected),
              score: grading.score,
              maxScore: q.marks,
              status: grading.isCorrect ? "ACCEPTED" : "WRONG_ANSWER",
              submittedAt: new Date(),
            },
          });
        } else {
          await prisma.submission.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              type: "MCQ",
              selectedOptions: JSON.stringify(selected),
              score: grading.score,
              maxScore: q.marks,
              status: grading.isCorrect ? "ACCEPTED" : "WRONG_ANSWER",
              submittedAt: new Date(),
            },
          });
        }
      } else {
        if (existingSub) {
          totalScore += existingSub.score;
        } else {
          await prisma.submission.create({
            data: {
              attemptId: attempt.id,
              questionId: q.id,
              type: "MCQ",
              selectedOptions: "[]",
              score: 0,
              maxScore: q.marks,
              status: "NOT_SUBMITTED",
              submittedAt: new Date(),
            },
          });
        }
      }
    }
  }

  const finalAttempt = await prisma.studentAttempt.update({
    where: { id: attempt.id },
    data: {
      status: markStatus,
      score: Number(totalScore.toFixed(2)),
      submittedAt: new Date(),
      remainingSeconds: 0,
    },
    include: {
      submissions: {
        include: { question: true },
      },
      violations: true,
    },
  });

  return finalAttempt;
}

// 5. Finish / Final Submit Assessment (Auto-grades all drafted coding & MCQ questions!)
studentRouter.post("/finish", requireAttemptSession, async (req: AuthenticatedRequest, res) => {
  try {
    const { attemptId } = req.body;
    if (req.attemptSession?.attemptId !== attemptId) {
      return res.status(401).json({ error: "Invalid attempt session." });
    }

    const attempt = await prisma.studentAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found." });
    }
    if (attempt.status === "SUBMITTED" || attempt.status === "TIME_EXPIRED") {
      return res.json({ success: true, attempt });
    }

    // Auto-grade whatever student has written across all questions!
    const finalizedAttempt = await autoGradeAndFinalizeAttempt(attemptId, "SUBMITTED");

    res.json({ success: true, attempt: finalizedAttempt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Post-Exam Review & Practice Mode (No SEB Required!)
studentRouter.get("/review/:code/:rollNo", async (req, res) => {
  try {
    const { code, rollNo } = req.params;
    const cleanCode = code.trim().toUpperCase();
    const cleanRollNo = rollNo.trim().toUpperCase();

    const assessment = await prisma.assessment.findUnique({
      where: { code: cleanCode },
      include: {
        sections: { orderBy: { order: "asc" } },
        questions: {
          include: { testCases: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const now = new Date();
    const isAutoUnlocked = assessment.reviewUnlockTime && now >= assessment.reviewUnlockTime;
    const isReviewAccessible = assessment.isReviewUnlocked || isAutoUnlocked;

    if (!isReviewAccessible) {
      return res.status(403).json({
        isUnlocked: false,
        message: assessment.reviewUnlockTime
          ? `Review and practice mode will open on ${assessment.reviewUnlockTime.toLocaleString()}`
          : "Review mode has not been enabled yet by your professor.",
      });
    }

    const attempt = await prisma.studentAttempt.findUnique({
      where: {
        assessmentId_rollNo: {
          assessmentId: assessment.id,
          rollNo: cleanRollNo,
        },
      },
      include: {
        violations: true,
        submissions: {
          include: { question: true },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: `No test record found for Roll Number '${cleanRollNo}' in this assessment.` });
    }

    const reviewAttemptToken = issueAttemptSessionToken(attempt.id, assessment.id, attempt.rollNo);

    res.json({
      isUnlocked: true,
      attemptToken: reviewAttemptToken,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        code: assessment.code,
        sections: assessment.sections,
        questions: assessment.questions, // Includes all testcases and correctAnswers for review!
      },
      attempt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
