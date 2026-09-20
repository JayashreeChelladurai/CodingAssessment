import { Router } from "express";
import { prisma } from "../db.js";
import { generateSebConfig } from "../services/sebService.js";
import { requireAdminSession } from "../services/auth.js";
import {
  broadcastStudentUnlocked,
  broadcastStudentUpdated,
  broadcastStudentsList,
} from "../services/socketService.js";

export const assessmentRouter = Router();

assessmentRouter.use(requireAdminSession);

// 1. Get all assessments (Admin)
assessmentRouter.get("/", async (_req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        sections: {
          include: {
            questions: {
              include: { testCases: true },
            },
          },
          orderBy: { order: "asc" },
        },
        questions: {
          include: { testCases: true },
          orderBy: { order: "asc" },
        },
        attempts: {
          select: { id: true, rollNo: true, status: true, violationCount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(assessments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get single assessment by ID (Admin)
assessmentRouter.get("/:id", async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: {
        sections: {
          include: {
            questions: {
              include: { testCases: { orderBy: { order: "asc" } } },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        questions: {
          include: { testCases: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        attempts: {
          include: { violations: true, submissions: true },
          orderBy: { startedAt: "desc" },
        },
      },
    });
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    res.json(assessment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Download .seb Configuration File
assessmentRouter.get("/:id/seb-config", async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
    });
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol || "http";
    const startUrl = `${protocol}://${host}/?code=${encodeURIComponent(assessment.code)}`;

    const xml = generateSebConfig({
      assessmentCode: assessment.code,
      startUrl,
      quitPassword: assessment.sebQuitPassword || "exit123",
      title: `${assessment.title} (${assessment.code})`,
    });

    res.setHeader("Content-Type", "application/seb");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${assessment.code.replace(/[^a-zA-Z0-9_-]/g, "_")}.seb"`
    );
    res.send(xml);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create Assessment with Sections, MCQs & Coding Questions
assessmentRouter.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      durationMinutes,
      startTime,
      endTime,
      shuffleQuestions,
      requireSeb,
      sebQuitPassword,
      isReviewUnlocked,
      reviewUnlockTime,
      sections,
      questions,
    } = req.body;

    if (!title || !code) {
      return res.status(400).json({ error: "Title and unique test code are required" });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.assessment.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return res.status(400).json({ error: `Assessment code '${cleanCode}' is already in use.` });
    }

    // Process sections or standalone questions
    const assessment = await prisma.assessment.create({
      data: {
        title,
        description: description || "",
        code: cleanCode,
        durationMinutes: Number(durationMinutes) || 60,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        shuffleQuestions: shuffleQuestions ?? true,
        requireSeb: requireSeb ?? true,
        sebQuitPassword: sebQuitPassword || "exit123",
        isReviewUnlocked: !!isReviewUnlocked,
        reviewUnlockTime: reviewUnlockTime ? new Date(reviewUnlockTime) : null,
      },
    });

    // Create sections if provided
    if (sections && Array.isArray(sections) && sections.length > 0) {
      for (let sIdx = 0; sIdx < sections.length; sIdx++) {
        const sec = sections[sIdx];
        const createdSec = await prisma.section.create({
          data: {
            assessmentId: assessment.id,
            title: sec.title || `Section ${sIdx + 1}`,
            description: sec.description || "",
            order: sIdx,
          },
        });

        if (sec.questions && Array.isArray(sec.questions)) {
          for (let qIdx = 0; qIdx < sec.questions.length; qIdx++) {
            const q = sec.questions[qIdx];
            await createQuestionRecord(assessment.id, createdSec.id, q, qIdx);
          }
        }
      }
    } else if (questions && Array.isArray(questions)) {
      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        const q = questions[qIdx];
        await createQuestionRecord(assessment.id, null, q, qIdx);
      }
    }

    const fullAssessment = await prisma.assessment.findUnique({
      where: { id: assessment.id },
      include: {
        sections: {
          include: { questions: { include: { testCases: true } } },
        },
        questions: { include: { testCases: true } },
      },
    });

    res.status(201).json(fullAssessment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Update Assessment
assessmentRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      code,
      durationMinutes,
      startTime,
      endTime,
      shuffleQuestions,
      requireSeb,
      sebQuitPassword,
      isReviewUnlocked,
      reviewUnlockTime,
      sections,
      questions,
    } = req.body;

    if (!id || !title || !code) {
      return res.status(400).json({ error: "Title and unique test code are required" });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.assessment.findFirst({
      where: {
        code: cleanCode,
        NOT: { id },
      },
    });
    if (existing) {
      return res.status(409).json({ error: `Assessment code '${cleanCode}' is already in use.` });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { assessmentId: id } });
      await tx.section.deleteMany({ where: { assessmentId: id } });

      await tx.assessment.update({
        where: { id },
        data: {
          title,
          description: description || "",
          code: cleanCode,
          durationMinutes: Number(durationMinutes) || 60,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          shuffleQuestions: shuffleQuestions ?? true,
          requireSeb: requireSeb ?? true,
          sebQuitPassword: sebQuitPassword || "exit123",
          isReviewUnlocked: !!isReviewUnlocked,
          reviewUnlockTime: reviewUnlockTime ? new Date(reviewUnlockTime) : null,
        },
      });

      if (sections && Array.isArray(sections) && sections.length > 0) {
        for (let sIdx = 0; sIdx < sections.length; sIdx++) {
          const sec = sections[sIdx];
          const createdSec = await tx.section.create({
            data: {
              assessmentId: id,
              title: sec.title || `Section ${sIdx + 1}`,
              description: sec.description || "",
              order: sIdx,
            },
          });

          if (sec.questions && Array.isArray(sec.questions)) {
            for (let qIdx = 0; qIdx < sec.questions.length; qIdx++) {
              const q = sec.questions[qIdx];
              await createQuestionRecord(id, createdSec.id, q, qIdx, tx);
            }
          }
        }
      } else if (questions && Array.isArray(questions)) {
        for (let qIdx = 0; qIdx < questions.length; qIdx++) {
          const q = questions[qIdx];
          await createQuestionRecord(id, null, q, qIdx, tx);
        }
      }

      return tx.assessment.findUnique({
        where: { id },
        include: {
          sections: {
            include: { questions: { include: { testCases: true } } },
          },
          questions: { include: { testCases: true } },
        },
      });
    });

    if (!updated) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Toggle Review Mode
assessmentRouter.patch("/:id/review-mode", async (req, res) => {
  try {
    const { isReviewUnlocked, reviewUnlockTime } = req.body;
    const updated = await prisma.assessment.update({
      where: { id: req.params.id },
      data: {
        isReviewUnlocked: isReviewUnlocked !== undefined ? Boolean(isReviewUnlocked) : undefined,
        reviewUnlockTime: reviewUnlockTime !== undefined ? (reviewUnlockTime ? new Date(reviewUnlockTime) : null) : undefined,
      },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete Assessment
assessmentRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.assessment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Assessment deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Clone Assessment
assessmentRouter.post("/:id/clone", async (req, res) => {
  try {
    const { id } = req.params;
    const original = await prisma.assessment.findUnique({
      where: { id },
      include: {
        sections: {
          include: { questions: { include: { testCases: true } } },
        },
        questions: { include: { testCases: true } },
      },
    });

    if (!original) {
      return res.status(404).json({ error: "Original assessment not found" });
    }

    const newCode = `${original.code}-COPY-${Date.now().toString().slice(-4)}`;
    const cloned = await prisma.assessment.create({
      data: {
        title: `${original.title} (Copy)`,
        description: original.description,
        code: newCode,
        durationMinutes: original.durationMinutes,
        startTime: original.startTime,
        endTime: original.endTime,
        shuffleQuestions: original.shuffleQuestions,
        requireSeb: original.requireSeb,
        sebQuitPassword: original.sebQuitPassword,
        isReviewUnlocked: false,
      },
    });

    if (original.sections && original.sections.length > 0) {
      for (let sIdx = 0; sIdx < original.sections.length; sIdx++) {
        const sec = original.sections[sIdx];
        const newSec = await prisma.section.create({
          data: {
            assessmentId: cloned.id,
            title: sec.title,
            description: sec.description,
            order: sIdx,
          },
        });

        for (let qIdx = 0; qIdx < sec.questions.length; qIdx++) {
          const q = sec.questions[qIdx];
          await createQuestionRecord(cloned.id, newSec.id, q, qIdx);
        }
      }
    } else if (original.questions && original.questions.length > 0) {
      for (let qIdx = 0; qIdx < original.questions.length; qIdx++) {
        const q = original.questions[qIdx];
        await createQuestionRecord(cloned.id, null, q, qIdx);
      }
    }

    const fullCloned = await prisma.assessment.findUnique({
      where: { id: cloned.id },
      include: {
        sections: {
          include: { questions: { include: { testCases: true } } },
        },
        questions: { include: { testCases: true } },
      },
    });

    res.status(201).json(fullCloned);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Get Live Candidates for Proctoring (REST fallback for Live Monitor)
assessmentRouter.get("/:id/live-candidates", async (req, res) => {
  try {
    const { id } = req.params;
    const attempts = await prisma.studentAttempt.findMany({
      where: { assessmentId: id },
      include: {
        violations: { orderBy: { timestamp: "desc" } },
        submissions: true,
      },
      orderBy: { startedAt: "desc" },
    });
    res.json(attempts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Unlock All Locked Students for an Assessment
assessmentRouter.post("/:id/unlock-all", async (req, res) => {
  try {
    const { id } = req.params;
    const { extraMinutes } = req.body;
    const bonusSec = (Number(extraMinutes) || 0) * 60;

    // Find all locked attempts for this assessment
    const lockedAttempts = await prisma.studentAttempt.findMany({
      where: { assessmentId: id, status: "LOCKED_OUT" },
    });

    if (lockedAttempts.length === 0) {
      // Also fetch current list to return
      const allAttempts = await prisma.studentAttempt.findMany({
        where: { assessmentId: id },
        include: { violations: { orderBy: { timestamp: "desc" } }, submissions: true },
        orderBy: { startedAt: "desc" },
      });
      return res.json({ success: true, unlockedCount: 0, attempts: allAttempts });
    }

    // Resolve all open violations for these attempts
    const lockedIds = lockedAttempts.map((a) => a.id);
    await prisma.violation.updateMany({
      where: { attemptId: { in: lockedIds }, resolved: false },
      data: { resolved: true, resolvedAt: new Date() },
    });

    // Update each attempt to IN_PROGRESS and add any bonus seconds
    for (const attempt of lockedAttempts) {
      const newRemaining = Math.max(60, attempt.remainingSeconds + bonusSec);
      const updated = await prisma.studentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "IN_PROGRESS",
          remainingSeconds: newRemaining,
        },
      });

      // Broadcast unlock to the individual student
      broadcastStudentUnlocked(attempt.id, id, {
        remainingSeconds: newRemaining,
        drafts: updated.drafts,
        message: "Your exam has been unlocked by the instructor.",
      });
    }

    // Fetch updated list of all attempts
    const updatedAttempts = await prisma.studentAttempt.findMany({
      where: { assessmentId: id },
      include: { violations: { orderBy: { timestamp: "desc" } }, submissions: true },
      orderBy: { startedAt: "desc" },
    });

    // Broadcast updated list to admin room
    broadcastStudentsList(id, updatedAttempts);

    console.log(`[ADMIN UNLOCK ALL] Unlocked ${lockedAttempts.length} students for assessment ${id}`);
    res.json({ success: true, unlockedCount: lockedAttempts.length, attempts: updatedAttempts });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Resume / Unlock Single Student Attempt
assessmentRouter.post("/:id/resume/:attemptId", async (req, res) => {
  try {
    const { id, attemptId } = req.params;
    const { extraMinutes } = req.body;
    const bonusSec = (Number(extraMinutes) || 0) * 60;

    const attempt = await prisma.studentAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.assessmentId !== id) {
      return res.status(404).json({ error: "Student attempt not found for this assessment." });
    }

    const newRemaining = Math.max(60, attempt.remainingSeconds + bonusSec);

    // Mark violations as resolved
    await prisma.violation.updateMany({
      where: { attemptId, resolved: false },
      data: { resolved: true, resolvedAt: new Date() },
    });

    const updated = await prisma.studentAttempt.update({
      where: { id: attemptId },
      data: {
        status: "IN_PROGRESS",
        remainingSeconds: newRemaining,
      },
      include: {
        violations: { orderBy: { timestamp: "desc" } },
        submissions: true,
      },
    });

    // Broadcast unlock to student and admin
    broadcastStudentUnlocked(attemptId, id, {
      remainingSeconds: newRemaining,
      drafts: updated.drafts,
      message: "Your exam has been resumed by the instructor.",
    });
    broadcastStudentUpdated(id, updated);

    console.log(`[ADMIN RESUME] Unlocked student ${updated.rollNo} (${updated.studentName})`);
    res.json({ success: true, attempt: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function createQuestionRecord(
  assessmentId: string,
  sectionId: string | null,
  q: any,
  qIdx: number,
  tx: { question: typeof prisma.question } = prisma
) {
  const isMcq = q.type === "MCQ";
  const optionsStr = typeof q.options === "string" ? q.options : JSON.stringify(q.options || []);
  const correctAnswersStr = typeof q.correctAnswers === "string" ? q.correctAnswers : JSON.stringify(q.correctAnswers || []);
  const starterCodesStr = typeof q.starterCodes === "string" ? q.starterCodes : JSON.stringify(q.starterCodes || {});

  await tx.question.create({
    data: {
      assessmentId,
      sectionId,
      type: isMcq ? "MCQ" : "CODING",
      title: q.title || `Question ${qIdx + 1}`,
      description: q.description || "",
      marks: Number(q.marks) || (isMcq ? 2 : 50),
      negativeMarks: Number(q.negativeMarks) || 0,
      order: qIdx,
      mcqType: q.mcqType || "SINGLE",
      options: optionsStr,
      correctAnswers: correctAnswersStr,
      explanation: q.explanation || "",
      allowedLanguages: q.allowedLanguages || "JAVA,C,CPP",
      starterCodes: starterCodesStr,
      starterCode: q.starterCode || "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n",
      timeLimitSeconds: Number(q.timeLimitSeconds) || 3,
      memoryLimitMb: Number(q.memoryLimitMb) || 256,
      testCases: {
        create: !isMcq && q.testCases ? q.testCases.map((tc: any, tcIdx: number) => ({
          input: tc.input || "",
          expectedOutput: tc.expectedOutput || "",
          isPublic: tc.isPublic ?? true,
          weight: Number(tc.weight) || 1.0,
          order: tcIdx,
        })) : [],
      },
    },
  });
}
