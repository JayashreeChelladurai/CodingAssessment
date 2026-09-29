import { Router } from "express";
import { prisma } from "../db.js";
import { isSebRequest } from "../services/sebService.js";
import { gradeStudentCode, gradeMcqQuestion } from "../services/gradingService.js";
import {
  issueAttemptSessionToken,
  requireAttemptSession,
  AuthenticatedRequest,
} from "../services/auth.js";
import { getIO } from "../services/socketService.js";

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

    const isSeb = isSebRequest(req, cleanCode);

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
    const { code, rollNo, studentName, deviceInfo } = req.body;

    if (!code || !rollNo || !studentName) {
      return res.status(400).json({ error: "Assessment code, Roll Number, and Name are required" });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanRollNo = rollNo.trim().toUpperCase();

    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
    const cleanIp = rawIp.replace(/^::ffff:/, "");

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

    // Check SEB requirement if enabled (strict cryptographic HMAC enforcement - zero override allowed)
    const isSeb = isSebRequest(req, cleanCode);
    if (assessment.requireSeb && !isSeb) {
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

      // Calculate strictly elapsed server time so the timer can NEVER restart or reset
      const elapsedSeconds = Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000);
      const totalAllowedSeconds = assessment.durationMinutes * 60;
      let accurateRemaining = Math.max(0, totalAllowedSeconds - elapsedSeconds);
      if (assessment.endTime) {
        const secondsUntilEnd = Math.floor((assessment.endTime.getTime() - now.getTime()) / 1000);
        accurateRemaining = Math.min(accurateRemaining, Math.max(0, secondsUntilEnd));
      }

      if (accurateRemaining <= 0) {
        attempt = await autoGradeAndFinalizeAttempt(attempt.id, "TIME_EXPIRED");
        return res.status(403).json({
          error: "Your assessment time has expired.",
          isExpired: true,
        });
      }

      // Sync the accurate countdown in DB
      const updateData: any = {
        remainingSeconds: accurateRemaining,
        lastHeartbeat: now,
      };
      if (cleanIp) updateData.ipAddress = cleanIp;
      if (deviceInfo) updateData.deviceInfo = String(deviceInfo);

      attempt = await prisma.studentAttempt.update({
        where: { id: attempt.id },
        data: updateData,
        include: { violations: true, submissions: true },
      });
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
          ipAddress: cleanIp || null,
          deviceInfo: deviceInfo ? String(deviceInfo) : null,
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

export interface AttemptExpiryContext {
  id: string;
  startedAt?: Date | string | null;
  status: string;
  remainingSeconds?: number;
  assessment?: {
    durationMinutes: number;
    endTime?: Date | string | null;
  } | null;
}

/**
 * Checks whether an attempt has exceeded allowed duration or assessment end time on the server clock.
 * Includes a 60s network latency grace window.
 */
export function isAttemptTimeExpired(
  attempt: AttemptExpiryContext,
  graceSeconds: number = 60
): boolean {
  if (attempt.status === "TIME_EXPIRED" || attempt.status === "SUBMITTED") {
    return true;
  }
  if (!attempt.startedAt || !attempt.assessment?.durationMinutes) {
    return false;
  }

  const nowMs = Date.now();
  const startedMs = new Date(attempt.startedAt).getTime();
  const durationSeconds = attempt.assessment.durationMinutes * 60;
  const elapsedSeconds = (nowMs - startedMs) / 1000;

  if (elapsedSeconds > durationSeconds + graceSeconds) {
    return true;
  }

  if (attempt.assessment.endTime) {
    const endMs = new Date(attempt.assessment.endTime).getTime();
    if (nowMs > endMs + (graceSeconds * 1000)) {
      return true;
    }
  }

  return false;
}

/**
 * Enforces that an attempt is not expired on server time.
 * If expired, updates database status to TIME_EXPIRED and sends 409.
 */
export async function enforceAttemptNotExpired(
  attempt: AttemptExpiryContext,
  res: any
): Promise<boolean> {
  if (isAttemptTimeExpired(attempt)) {
    if (attempt.status !== "TIME_EXPIRED" && attempt.status !== "SUBMITTED") {
      try {
        await prisma.studentAttempt.update({
          where: { id: attempt.id },
          data: { status: "TIME_EXPIRED", remainingSeconds: 0 },
        });
      } catch (err) {
        console.error("Error marking attempt as TIME_EXPIRED:", err);
      }
    }
    res.status(409).json({ error: "Assessment time limit has expired.", isExpired: true });
    return false;
  }
  return true;
}

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

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: { select: { durationMinutes: true, endTime: true } } },
    });
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found." });
    }
    if (!(await enforceAttemptNotExpired(attempt, res))) {
      return;
    }

    const updateData: any = {
      lastHeartbeat: new Date(),
    };

    if (drafts !== undefined) {
      const draftsStr = typeof drafts === "string" ? drafts : JSON.stringify(drafts);
      if (draftsStr !== "{}" && draftsStr !== "" && draftsStr !== "null") {
        updateData.drafts = draftsStr;
      }
    }
    if (mcqResponses !== undefined) {
      updateData.mcqResponses = typeof mcqResponses === "string" ? mcqResponses : JSON.stringify(mcqResponses);
    }
    if (flaggedQuestions !== undefined) {
      updateData.flaggedQuestions = typeof flaggedQuestions === "string" ? flaggedQuestions : JSON.stringify(flaggedQuestions);
    }

    // Authoritative server clock calculation
    const maxDurationSeconds = (attempt.assessment?.durationMinutes || 60) * 60;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));
    const serverRemaining = Math.max(0, maxDurationSeconds - elapsedSeconds);

    if (remainingSeconds !== undefined) {
      updateData.remainingSeconds = Math.min(
        attempt.remainingSeconds,
        Math.min(serverRemaining, Math.max(0, Number(remainingSeconds)))
      );
    } else {
      updateData.remainingSeconds = serverRemaining;
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

// 3b. Check Attempt Status (Used by LockoutScreen & polling fallback to instantly self-resume)
studentRouter.get("/attempt-status/:attemptId", requireAttemptSession, async (req: AuthenticatedRequest, res) => {
  try {
    const { attemptId } = req.params;
    if (req.attemptSession?.attemptId !== attemptId) {
      return res.status(401).json({ error: "Invalid attempt session." });
    }

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        status: true,
        remainingSeconds: true,
        violationCount: true,
        drafts: true,
        lastHeartbeat: true,
        startedAt: true,
        assessment: {
          select: {
            durationMinutes: true,
            endTime: true,
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found." });
    }

    let accurateRemaining = attempt.remainingSeconds;
    if (attempt.status === "IN_PROGRESS") {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000);
      const totalAllowed = (attempt.assessment?.durationMinutes || 60) * 60;
      accurateRemaining = Math.max(0, totalAllowed - elapsedSeconds);
      if (attempt.assessment?.endTime) {
        const untilEnd = Math.floor((attempt.assessment.endTime.getTime() - now.getTime()) / 1000);
        accurateRemaining = Math.min(accurateRemaining, Math.max(0, untilEnd));
      }
      if (accurateRemaining <= 0) {
        await autoGradeAndFinalizeAttempt(attempt.id, "TIME_EXPIRED");
        return res.json({
          attemptId: attempt.id,
          status: "TIME_EXPIRED",
          isLocked: false,
          isSubmitted: false,
          isExpired: true,
          remainingSeconds: 0,
          violationCount: attempt.violationCount,
          drafts: attempt.drafts,
        });
      }
    }

    res.json({
      attemptId: attempt.id,
      status: attempt.status,
      isLocked: attempt.status === "LOCKED_OUT",
      isSubmitted: attempt.status === "SUBMITTED",
      isExpired: attempt.status === "TIME_EXPIRED",
      remainingSeconds: accurateRemaining,
      violationCount: attempt.violationCount,
      drafts: attempt.drafts && attempt.drafts !== "{}" ? attempt.drafts : undefined,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3b. SEB Exit / Turn-off Lockout
studentRouter.post("/seb-exit", async (req, res) => {
  try {
    let attemptId = req.body?.attemptId;
    if (!attemptId && typeof req.body === "string") {
      try {
        const parsed = JSON.parse(req.body);
        attemptId = parsed.attemptId;
      } catch {}
    }

    if (!attemptId) {
      return res.status(400).json({ error: "attemptId is required." });
    }

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: true },
    });

    if (!attempt || attempt.status === "SUBMITTED" || attempt.status === "TIME_EXPIRED") {
      return res.json({ success: true, message: "No action needed" });
    }

    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
    const cleanIp = rawIp.replace(/^::ffff:/, "");

    const violation = await prisma.violation.create({
      data: {
        attemptId: attempt.id,
        violationType: "SEB_EXIT",
        details: "Student turned off or exited Safe Exam Browser without submitting.",
        ipAddress: cleanIp || null,
      },
    });

    const updated = await prisma.studentAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "LOCKED_OUT",
        violationCount: { increment: 1 },
      },
      include: {
        violations: { orderBy: { timestamp: "desc" } },
        submissions: true,
      },
    });

    // Alert instructor in real-time
    const io = getIO() || (global as any).io;
    if (io) {
      io.to(`admin:${attempt.assessmentId}`).emit("admin:violation_alert", {
        attempt: updated,
        violation,
      });
      io.to(`admin:${attempt.assessmentId}`).emit("admin:student_updated", updated);
    }

    res.json({ success: true, status: "LOCKED_OUT" });
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
      include: { assessment: { select: { id: true, durationMinutes: true, endTime: true } } },
    });
    if (!attempt || question.assessmentId !== attempt.assessmentId) {
      return res.status(404).json({ error: "Attempt not found." });
    }
    if (!(await enforceAttemptNotExpired(attempt, res))) {
      return;
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

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: { select: { durationMinutes: true, endTime: true } } },
    });
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found." });
    }
    if (attempt.status === "SUBMITTED" || attempt.status === "TIME_EXPIRED") {
      return res.json({ success: true, attempt });
    }

    const markStatus = isAttemptTimeExpired(attempt) ? "TIME_EXPIRED" : "SUBMITTED";
    // Auto-grade whatever student has written across all questions!
    const finalizedAttempt = await autoGradeAndFinalizeAttempt(attemptId, markStatus);

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
