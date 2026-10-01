import { Router } from "express";
import { prisma } from "../db.js";
import { generateSebConfig, generateSebToken, resolveRequestHost } from "../services/sebService.js";
import { requireAdminSession, hashStudentPassword } from "../services/auth.js";
import {
  broadcastStudentUnlocked,
  broadcastStudentUpdated,
  broadcastStudentsList,
} from "../services/socketService.js";

export const assessmentRouter = Router();

// 1. Download .seb Configuration File (Public route for Safe Exam Browser & candidates)
// Must be defined BEFORE requireAdminSession so SEB can fetch config without admin JWT
assessmentRouter.get("/:id/seb-config", async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await prisma.assessment.findFirst({
      where: {
        OR: [{ id }, { code: id.trim().toUpperCase() }],
      },
    });
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const { host, protocol } = resolveRequestHost(req);
    const sebToken = generateSebToken(assessment.code);
    const startUrl = `${protocol}://${host}/?code=${encodeURIComponent(assessment.code)}&sebToken=${encodeURIComponent(sebToken)}`;

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

// All following routes strictly require Professor / Administrator Authentication
assessmentRouter.use(requireAdminSession);

// 2. Get all assessments (Admin)
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

// 3. Get single assessment by ID (Admin)
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
      isRandomized,
      randomConfig,
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
        isRandomized: !!isRandomized,
        randomConfig: typeof randomConfig === "string" ? randomConfig : JSON.stringify(randomConfig || {}),
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
      isRandomized,
      randomConfig,
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
      // 1. Update Assessment meta
      const updateData: any = {
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
      };
      if (isRandomized !== undefined) {
        updateData.isRandomized = !!isRandomized;
      }
      if (randomConfig !== undefined) {
        updateData.randomConfig = typeof randomConfig === "string" ? randomConfig : JSON.stringify(randomConfig);
      }

      await tx.assessment.update({
        where: { id },
        data: updateData,
      });

      // 2. Fetch existing sections and questions to diff against
      const existingSections = await tx.section.findMany({
        where: { assessmentId: id },
      });
      const existingQuestions = await tx.question.findMany({
        where: { assessmentId: id },
      });

      const keptSectionIds = new Set<string>();
      const keptQuestionIds = new Set<string>();

      // 3. Upsert sections and questions
      if (sections && Array.isArray(sections) && sections.length > 0) {
        for (let sIdx = 0; sIdx < sections.length; sIdx++) {
          const sec = sections[sIdx];
          let secId = sec.id;

          const existingSec = secId ? existingSections.find((s) => s.id === secId) : null;
          if (existingSec) {
            await tx.section.update({
              where: { id: secId },
              data: {
                title: sec.title || `Section ${sIdx + 1}`,
                description: sec.description || "",
                order: sIdx,
              },
            });
            keptSectionIds.add(secId);
          } else {
            const createdSec = await tx.section.create({
              data: {
                assessmentId: id,
                title: sec.title || `Section ${sIdx + 1}`,
                description: sec.description || "",
                order: sIdx,
              },
            });
            secId = createdSec.id;
            keptSectionIds.add(secId);
          }

          if (sec.questions && Array.isArray(sec.questions)) {
            for (let qIdx = 0; qIdx < sec.questions.length; qIdx++) {
              const q = sec.questions[qIdx];
              const qId = await upsertQuestionRecord(id, secId, q, qIdx, tx);
              keptQuestionIds.add(qId);
            }
          }
        }
      } else if (questions && Array.isArray(questions)) {
        for (let qIdx = 0; qIdx < questions.length; qIdx++) {
          const q = questions[qIdx];
          const qId = await upsertQuestionRecord(id, null, q, qIdx, tx);
          keptQuestionIds.add(qId);
        }
      }

      // 4. Safely delete ONLY questions and sections that the instructor actually removed
      // For randomized assessments from Question Bank, do NOT delete dynamic student questions
      const isRandomExam = Boolean(isRandomized !== undefined ? isRandomized : updateData.isRandomized);
      if (!isRandomExam) {
        const questionsToDelete = existingQuestions.filter((q) => !keptQuestionIds.has(q.id));
        if (questionsToDelete.length > 0) {
          await tx.question.deleteMany({
            where: { id: { in: questionsToDelete.map((q) => q.id) } },
          });
        }
      }

      const sectionsToDelete = existingSections.filter((s) => !keptSectionIds.has(s.id));
      if (sectionsToDelete.length > 0) {
        await tx.section.deleteMany({
          where: { id: { in: sectionsToDelete.map((s) => s.id) } },
        });
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

    // Fetch assessment duration
    const assessmentRec = await prisma.assessment.findUnique({
      where: { id },
      select: { durationMinutes: true },
    });
    const totalAllowed = (assessmentRec?.durationMinutes || 60) * 60;
    const now = new Date();

    // Update each attempt to IN_PROGRESS and add any bonus seconds
    for (const attempt of lockedAttempts) {
      const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000));
      const accurateRemaining = Math.max(0, totalAllowed - elapsedSeconds);
      const newRemaining = Math.max(30, accurateRemaining + bonusSec);

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
        drafts: updated.drafts && updated.drafts !== "{}" ? updated.drafts : undefined,
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
      include: { assessment: true },
    });

    if (!attempt || attempt.assessmentId !== id) {
      return res.status(404).json({ error: "Student attempt not found for this assessment." });
    }

    // Authoritative elapsed time calculation based on startedAt
    const now = new Date();
    const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000));
    const totalAllowed = (attempt.assessment?.durationMinutes || 60) * 60;
    const accurateRemaining = Math.max(0, totalAllowed - elapsedSeconds);
    const newRemaining = Math.max(30, accurateRemaining + bonusSec);

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
      drafts: updated.drafts && updated.drafts !== "{}" ? updated.drafts : undefined,
      message: "Your exam has been resumed by the instructor.",
    });
    broadcastStudentUpdated(id, updated);

    console.log(`[ADMIN RESUME] Unlocked student ${updated.rollNo} (${updated.studentName})`);
    res.json({ success: true, attempt: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. List all registered students (Admin)
assessmentRouter.get("/admin/students", async (_req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { rollNo: "asc" },
      select: {
        id: true,
        rollNo: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(students);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Reset student password or delete registration (Admin)
assessmentRouter.post("/admin/students/:rollNo/reset-password", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const { newPassword } = req.body;
    const cleanRollNo = (rollNo || "").trim().toUpperCase();

    const student = await prisma.student.findUnique({
      where: { rollNo: cleanRollNo },
    });
    if (!student) {
      return res.status(404).json({ error: "Student account not found." });
    }

    if (newPassword) {
      if (newPassword.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters long." });
      }
      const hashedPassword = hashStudentPassword(newPassword);
      await prisma.student.update({
        where: { rollNo: cleanRollNo },
        data: { password: hashedPassword },
      });
      return res.json({ success: true, message: `Password updated for student ${cleanRollNo}` });
    } else {
      // Clear password registration so student can reset their password on next login
      await prisma.student.delete({
        where: { rollNo: cleanRollNo },
      });
      return res.json({ success: true, message: `Student registration for ${cleanRollNo} reset. Student can re-register.` });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Admin manually register new student
assessmentRouter.post("/admin/students", async (req, res) => {
  try {
    const { rollNo, name, password } = req.body;
    if (!rollNo || !name || !password) {
      return res.status(400).json({ error: "Roll number, name, and password are all required." });
    }
    const cleanRollNo = rollNo.trim().toUpperCase();
    const cleanName = name.trim();

    if (cleanRollNo.length < 2) {
      return res.status(400).json({ error: "Roll number must be at least 2 characters." });
    }
    if (cleanName.length < 2) {
      return res.status(400).json({ error: "Full name must be at least 2 characters." });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long." });
    }

    const existing = await prisma.student.findUnique({ where: { rollNo: cleanRollNo } });
    if (existing) {
      return res.status(409).json({ error: `Roll number '${cleanRollNo}' is already registered.` });
    }

    const hashedPassword = hashStudentPassword(password);
    const created = await prisma.student.create({
      data: {
        rollNo: cleanRollNo,
        name: cleanName,
        password: hashedPassword,
      },
      select: {
        id: true,
        rollNo: true,
        name: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, student: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Admin delete student account
assessmentRouter.delete("/admin/students/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const cleanRollNo = (rollNo || "").trim().toUpperCase();
    await prisma.student.delete({
      where: { rollNo: cleanRollNo },
    });
    res.json({ success: true, message: `Student '${cleanRollNo}' deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Automatically sanitizes question content across titles, descriptions, and explanations:
 * 1. Strips markdown header tags (#)
 * 2. Strips LaTeX math delimiters ($)
 * 3. Replaces mathematical multiplication asterisks (*) with 'x' and strips markdown formatting asterisks
 * This guarantees questions contain zero *, $, or # symbols in student views.
 */
export function sanitizeQuestionContent(text: string | null | undefined): string {
  if (!text) return "";
  return text
    // Replace markdown bold/italic markers: **word** -> word, *word* -> word
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    // Replace mathematical multiplication: e.g. "2 * 3" -> "2 x 3", "(-2) * 3" -> "(-2) x 3"
    .replace(/(\S)\s*\*\s*(\S)/g, "$1 x $2")
    // Remove any remaining asterisks
    .replace(/\*/g, "x")
    // Remove LaTeX math delimiters ($)
    .replace(/\$/g, "")
    // Remove markdown headers (#)
    .replace(/^#+\s*/gm, "")
    .replace(/#/g, "");
}

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

  const created = await tx.question.create({
    data: {
      assessmentId,
      sectionId,
      type: isMcq ? "MCQ" : "CODING",
      title: sanitizeQuestionContent(q.title || `Question ${qIdx + 1}`),
      description: sanitizeQuestionContent(q.description || ""),
      marks: Number(q.marks) || (isMcq ? 2 : 50),
      negativeMarks: Number(q.negativeMarks) || 0,
      order: qIdx,
      mcqType: q.mcqType || "SINGLE",
      options: optionsStr,
      correctAnswers: correctAnswersStr,
      explanation: sanitizeQuestionContent(q.explanation || ""),
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
  return created.id;
}

async function upsertQuestionRecord(
  assessmentId: string,
  sectionId: string | null,
  q: any,
  qIdx: number,
  tx: any
): Promise<string> {
  const isMcq = q.type === "MCQ";
  const optionsStr = typeof q.options === "string" ? q.options : JSON.stringify(q.options || []);
  const correctAnswersStr = typeof q.correctAnswers === "string" ? q.correctAnswers : JSON.stringify(q.correctAnswers || []);
  const starterCodesStr = typeof q.starterCodes === "string" ? q.starterCodes : JSON.stringify(q.starterCodes || {});

  const qData = {
    assessmentId,
    sectionId,
    type: isMcq ? "MCQ" : "CODING",
    title: sanitizeQuestionContent(q.title || `Question ${qIdx + 1}`),
    description: sanitizeQuestionContent(q.description || ""),
    marks: Number(q.marks) || (isMcq ? 2 : 50),
    negativeMarks: Number(q.negativeMarks) || 0,
    order: qIdx,
    mcqType: q.mcqType || "SINGLE",
    options: optionsStr,
    correctAnswers: correctAnswersStr,
    explanation: sanitizeQuestionContent(q.explanation || ""),
    allowedLanguages: q.allowedLanguages || "JAVA,C,CPP",
    starterCodes: starterCodesStr,
    starterCode: q.starterCode || "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n",
    timeLimitSeconds: Number(q.timeLimitSeconds) || 3,
    memoryLimitMb: Number(q.memoryLimitMb) || 256,
  };

  const testCasesData = (!isMcq && q.testCases && Array.isArray(q.testCases))
    ? q.testCases.map((tc: any, tcIdx: number) => ({
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
        isPublic: tc.isPublic ?? true,
        weight: Number(tc.weight) || 1.0,
        order: tcIdx,
      }))
    : [];

  // If question already exists in this assessment, UPDATE it to preserve Question ID and Submissions
  if (q.id) {
    const existing = await tx.question.findUnique({ where: { id: q.id } });
    if (existing && existing.assessmentId === assessmentId) {
      await tx.question.update({
        where: { id: q.id },
        data: qData,
      });

      // Refresh testcases
      await tx.testCase.deleteMany({ where: { questionId: q.id } });
      if (testCasesData.length > 0) {
        await tx.testCase.createMany({
          data: testCasesData.map((tc: any) => ({ ...tc, questionId: q.id })),
        });
      }
      return q.id;
    }
  }

  // Create newly added question
  const created = await tx.question.create({
    data: {
      ...qData,
      testCases: {
        create: testCasesData,
      },
    },
  });
  return created.id;
}
