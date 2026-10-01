import { Router } from "express";
import { prisma } from "../db.js";
import { isSebRequest, generateSebConfig, generateSebToken, resolveRequestHost } from "../services/sebService.js";
import { gradeStudentCode, gradeMcqQuestion } from "../services/gradingService.js";
import {
  issueAttemptSessionToken,
  requireAttemptSession,
  AuthenticatedRequest,
  hashStudentPassword,
  verifyStudentPassword,
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

// Recursively retrieve all descendant folder IDs for a question folder
async function getDescendantFolderIds(rootFolderId: string): Promise<string[]> {
  const result: string[] = [rootFolderId];
  const children = await prisma.questionFolder.findMany({
    where: { parentId: rootFolderId },
    select: { id: true },
  });
  for (const child of children) {
    const descendants = await getDescendantFolderIds(child.id);
    result.push(...descendants);
  }
  return result;
}

// 0. Check student registration status by roll number
studentRouter.get("/check-student/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;
    const cleanRollNo = (rollNo || "").trim().toUpperCase();
    if (!cleanRollNo) {
      return res.status(400).json({ error: "Roll number is required" });
    }

    const student = await prisma.student.findUnique({
      where: { rollNo: cleanRollNo },
      select: { rollNo: true, name: true, createdAt: true },
    });

    if (student) {
      return res.json({
        exists: true,
        rollNo: student.rollNo,
        name: student.name,
      });
    }

    return res.json({
      exists: false,
      rollNo: cleanRollNo,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 0a. One-Time Student Registration (Irrespective of assessment)
studentRouter.post("/register", async (req, res) => {
  try {
    const { rollNo, name, password } = req.body;
    if (!rollNo || !name || !password) {
      return res.status(400).json({
        error: "Roll Number, Full Name, and Password are all required for registration.",
      });
    }

    const cleanRollNo = rollNo.trim().toUpperCase();
    const cleanName = name.trim();

    if (cleanRollNo.length < 2) {
      return res.status(400).json({ error: "Roll Number must be at least 2 characters long." });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({ error: "Full Name must be at least 2 characters long." });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long." });
    }

    const existing = await prisma.student.findUnique({
      where: { rollNo: cleanRollNo },
    });

    if (existing) {
      return res.status(409).json({
        error: `Roll number '${cleanRollNo}' is already registered. You can enter any assessment using your registered password. If you forgot your password, contact your instructor to reset it.`,
      });
    }

    const hashedPassword = hashStudentPassword(password);
    const student = await prisma.student.create({
      data: {
        rollNo: cleanRollNo,
        name: cleanName,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully. You can now enter any assessment using this roll number and password.",
      student: {
        rollNo: student.rollNo,
        name: student.name,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 0b. Download .seb Configuration File for Student / Safe Exam Browser
studentRouter.get("/seb-config/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const cleanCode = code.trim().toUpperCase();
    const assessment = await prisma.assessment.findFirst({
      where: {
        OR: [{ code: cleanCode }, { id: code }],
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

// 1. Get Assessment Public Info & Check SEB Status (Gatekeeper check)
studentRouter.get("/info/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const cleanCode = code.trim().toUpperCase();

    const assessment = await prisma.assessment.findUnique({
      where: { code: cleanCode },
      include: {
        sections: { select: { id: true, title: true, order: true } },
        questions: {
          where: { templateQuestionId: null },
          select: { id: true, type: true, marks: true, isRandom: true },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment code not found." });
    }

    const isSeb = isSebRequest(req, cleanCode);

    let totalQuestions = assessment.questions.length;
    let totalMarks = assessment.questions.reduce((sum, q) => sum + q.marks, 0);

    if (totalQuestions === 0 && assessment.isRandomized) {
      let cfg: any = {};
      try {
        cfg = JSON.parse(assessment.randomConfig || "{}");
      } catch {}
      const easyCount = Number(cfg.easyCount ?? 1);
      const mediumCount = Number(cfg.mediumCount ?? 1);
      const hardCount = Number(cfg.hardCount ?? 1);
      totalQuestions = easyCount + mediumCount + hardCount;
      const easyMarks = Number(cfg.easyMarks ?? 25);
      const mediumMarks = Number(cfg.mediumMarks ?? 35);
      const hardMarks = Number(cfg.hardMarks ?? 40);
      totalMarks = (easyCount * easyMarks) + (mediumCount * mediumMarks) + (hardCount * hardMarks);
    }

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
        totalQuestions,
        totalMarks,
        sections: assessment.sections,
        isRandomized: assessment.isRandomized,
      },
      isSeb,
      canStart: !assessment.requireSeb || isSeb,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to allocate randomized questions from Question Bank
export async function populateRandomQuestionsForAssessment(
  assessmentId: string,
  randomConfigStr?: string | null
): Promise<{ questionOrder: string[]; optionOrders: Record<string, string[]> }> {
  let cfg: any = {};
  try {
    cfg = JSON.parse(randomConfigStr || "{}");
  } catch {
    cfg = {};
  }

  const easyCount = Number(cfg.easyCount ?? 1);
  const mediumCount = Number(cfg.mediumCount ?? 1);
  const hardCount = Number(cfg.hardCount ?? 1);

  let folderIds: string[] = [];
  if (cfg.sourceFolderId) {
    folderIds = await getDescendantFolderIds(cfg.sourceFolderId);
  } else if (cfg.sourceFolderName) {
    const folder = await prisma.questionFolder.findFirst({
      where: { name: cfg.sourceFolderName },
    });
    if (folder) {
      folderIds = await getDescendantFolderIds(folder.id);
    }
  } else {
    const folder = await prisma.questionFolder.findFirst({
      where: { name: "Coding" },
    });
    if (folder) {
      folderIds = await getDescendantFolderIds(folder.id);
    } else {
      const allFolders = await prisma.questionFolder.findMany({ select: { id: true } });
      folderIds = allFolders.map((f) => f.id);
    }
  }

  const bankQuestions = await prisma.bankQuestion.findMany({
    where: {
      folderId: folderIds.length > 0 ? { in: folderIds } : undefined,
    },
    include: {
      testCases: { orderBy: { order: "asc" } },
    },
  });

  const easyPool = bankQuestions.filter((q) => q.difficulty === "EASY");
  const mediumPool = bankQuestions.filter((q) => q.difficulty === "MEDIUM");
  const hardPool = bankQuestions.filter((q) => q.difficulty === "HARD");

  const pickedEasy = shuffleArray(easyPool).slice(0, easyCount);
  const pickedMedium = shuffleArray(mediumPool).slice(0, mediumCount);
  const pickedHard = shuffleArray(hardPool).slice(0, hardCount);
  const chosenBank = [...pickedEasy, ...pickedMedium, ...pickedHard];

  const assignedQuestions: any[] = [];
  for (let i = 0; i < chosenBank.length; i++) {
    const bq = chosenBank[i];
    let qRecord = await prisma.question.findFirst({
      where: {
        assessmentId,
        title: bq.title,
      },
      include: {
        testCases: {
          where: { isPublic: true },
          orderBy: { order: "asc" },
        },
      },
    });

    let expectedMarks = bq.marks;
    if (bq.difficulty === "EASY") expectedMarks = Number(cfg.easyMarks ?? 25);
    else if (bq.difficulty === "MEDIUM") expectedMarks = Number(cfg.mediumMarks ?? 35);
    else if (bq.difficulty === "HARD") expectedMarks = Number(cfg.hardMarks ?? 40);

    if (!qRecord) {
      qRecord = await prisma.question.create({
        data: {
          assessmentId,
          type: bq.type,
          title: bq.title,
          description: bq.description,
          marks: expectedMarks,
          negativeMarks: bq.negativeMarks || 0,
          order: i,
          mcqType: bq.mcqType,
          options: bq.options,
          correctAnswers: bq.correctAnswers,
          explanation: bq.explanation,
          allowedLanguages: bq.allowedLanguages,
          starterCodes: bq.starterCodes,
          starterCode: bq.starterCode,
          timeLimitSeconds: bq.timeLimitSeconds,
          memoryLimitMb: bq.memoryLimitMb,
          testCases: {
            create: bq.testCases.map((tc, tcIdx) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isPublic: tc.isPublic,
              weight: tc.weight,
              order: tcIdx,
            })),
          },
        },
        include: {
          testCases: {
            where: { isPublic: true },
            orderBy: { order: "asc" },
          },
        },
      });
    } else if (qRecord.marks !== expectedMarks) {
      qRecord = await prisma.question.update({
        where: { id: qRecord.id },
        data: { marks: expectedMarks },
        include: {
          testCases: {
            where: { isPublic: true },
            orderBy: { order: "asc" },
          },
        },
      });
    }

    assignedQuestions.push(qRecord);
  }

  const questionOrder = assignedQuestions.map((q) => q.id);
  const optionOrders: Record<string, string[]> = {};
  assignedQuestions.forEach((q) => {
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

  return { questionOrder, optionOrders };
}

// Helper function to allocate standard questions with intra-section shuffling
export function allocateStandardQuestions(assessment: any): {
  questionOrder: string[];
  optionOrders: Record<string, string[]>;
} {
  let questionOrder: string[] = [];
  const optionOrders: Record<string, string[]> = {};

  const sections =
    assessment.sections && assessment.sections.length > 0
      ? [...assessment.sections].sort((a: any, b: any) => a.order - b.order)
      : [];

  if (sections.length > 0) {
    for (const sec of sections) {
      const secQuestions = (assessment.questions || [])
        .filter((q: any) => q.sectionId === sec.id)
        .sort((a: any, b: any) => a.order - b.order);

      let secQIds = secQuestions.map((q: any) => q.id);
      if (assessment.shuffleQuestions) {
        secQIds = shuffleArray(secQIds);
      }
      questionOrder.push(...secQIds);
    }

    const orphanQuestions = (assessment.questions || [])
      .filter((q: any) => !q.sectionId)
      .sort((a: any, b: any) => a.order - b.order);
    let orphanQIds = orphanQuestions.map((q: any) => q.id);
    if (assessment.shuffleQuestions) {
      orphanQIds = shuffleArray(orphanQIds);
    }
    questionOrder.push(...orphanQIds);
  } else {
    questionOrder = (assessment.questions || []).map((q: any) => q.id);
    if (assessment.shuffleQuestions) {
      questionOrder = shuffleArray(questionOrder);
    }
  }

  (assessment.questions || []).forEach((q: any) => {
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

  return { questionOrder, optionOrders };
}

// Comprehensive helper function to allocate questions per student attempt, supporting question-level folder random allocation
export async function allocateQuestionsForStudentAttempt(assessmentId: string): Promise<{
  questionOrder: string[];
  optionOrders: Record<string, string[]>;
}> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      sections: { orderBy: { order: "asc" } },
      questions: {
        where: { templateQuestionId: null },
        include: {
          testCases: { where: { isPublic: true }, orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!assessment) {
    return { questionOrder: [], optionOrders: {} };
  }

  // Fallback to legacy random allocation if no template questions exist but isRandomized is set
  if (assessment.questions.length === 0 && assessment.isRandomized) {
    return populateRandomQuestionsForAssessment(assessment.id, assessment.randomConfig);
  }

  const sections =
    assessment.sections && assessment.sections.length > 0
      ? [...assessment.sections].sort((a, b) => a.order - b.order)
      : [];

  const optionOrders: Record<string, string[]> = {};
  const assignedQuestionIds: string[] = [];
  const assignedBankQuestionIds = new Set<string>();

  // Process a question slot (either fixed or randomly picked from a Question Bank folder)
  const processSlot = async (slot: any): Promise<string> => {
    // 1. Fixed question
    if (!slot.isRandom) {
      if (slot.type === "MCQ") {
        try {
          const opts = JSON.parse(slot.options || "[]");
          const optIds = opts.map((o: any) => o.id);
          optionOrders[slot.id] = shuffleArray(optIds);
        } catch {
          optionOrders[slot.id] = [];
        }
      }
      return slot.id;
    }

    // 2. Random question from folder
    let folderIds: string[] = [];
    if (slot.randomFolderId) {
      folderIds = await getDescendantFolderIds(slot.randomFolderId);
    } else {
      const allFolders = await prisma.questionFolder.findMany({ select: { id: true } });
      folderIds = allFolders.map((f) => f.id);
    }

    let candidateFilter: any = {
      folderId: folderIds.length > 0 ? { in: folderIds } : undefined,
    };
    if (slot.randomDifficulty && slot.randomDifficulty !== "ANY") {
      candidateFilter.difficulty = slot.randomDifficulty;
    }
    if (slot.randomType && slot.randomType !== "ANY") {
      candidateFilter.type = slot.randomType;
    }

    let candidates = await prisma.bankQuestion.findMany({
      where: candidateFilter,
      include: {
        testCases: { orderBy: { order: "asc" } },
      },
    });

    // Fallback 1: Relax difficulty & type if none matched
    if (candidates.length === 0) {
      candidates = await prisma.bankQuestion.findMany({
        where: {
          folderId: folderIds.length > 0 ? { in: folderIds } : undefined,
        },
        include: {
          testCases: { orderBy: { order: "asc" } },
        },
      });
    }

    // Fallback 2: Any question in DB if folder empty
    if (candidates.length === 0) {
      candidates = await prisma.bankQuestion.findMany({
        include: {
          testCases: { orderBy: { order: "asc" } },
        },
        take: 20,
      });
    }

    if (candidates.length === 0) {
      return slot.id;
    }

    // Exclude questions already assigned to earlier slots for this student
    let availableCandidates = candidates.filter((bq) => !assignedBankQuestionIds.has(bq.id));
    if (availableCandidates.length === 0) {
      availableCandidates = candidates;
    }

    const chosenBq = shuffleArray(availableCandidates)[0];
    assignedBankQuestionIds.add(chosenBq.id);

    // Reuse or create question instance for this assessment slot
    let instQ = await prisma.question.findFirst({
      where: {
        assessmentId: assessment.id,
        templateQuestionId: slot.id,
        bankQuestionId: chosenBq.id,
      },
      include: {
        testCases: { where: { isPublic: true }, orderBy: { order: "asc" } },
      },
    });

    if (!instQ) {
      instQ = await prisma.question.create({
        data: {
          assessmentId: assessment.id,
          sectionId: slot.sectionId,
          templateQuestionId: slot.id,
          bankQuestionId: chosenBq.id,
          isRandom: false,
          type: chosenBq.type,
          title: chosenBq.title,
          description: chosenBq.description,
          marks: slot.marks, // Apply slot marks
          negativeMarks: chosenBq.negativeMarks || 0,
          order: slot.order,
          mcqType: chosenBq.mcqType,
          options: chosenBq.options,
          correctAnswers: chosenBq.correctAnswers,
          explanation: chosenBq.explanation,
          allowedLanguages: chosenBq.allowedLanguages,
          starterCodes: chosenBq.starterCodes,
          starterCode: chosenBq.starterCode,
          timeLimitSeconds: chosenBq.timeLimitSeconds,
          memoryLimitMb: chosenBq.memoryLimitMb,
          testCases: {
            create: chosenBq.testCases.map((tc, tcIdx) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isPublic: tc.isPublic,
              weight: tc.weight,
              order: tcIdx,
            })),
          },
        },
        include: {
          testCases: { where: { isPublic: true }, orderBy: { order: "asc" } },
        },
      });
    } else if (instQ.marks !== slot.marks) {
      instQ = await prisma.question.update({
        where: { id: instQ.id },
        data: { marks: slot.marks },
        include: {
          testCases: { where: { isPublic: true }, orderBy: { order: "asc" } },
        },
      });
    }

    if (instQ.type === "MCQ") {
      try {
        const opts = JSON.parse(instQ.options || "[]");
        const optIds = opts.map((o: any) => o.id);
        optionOrders[instQ.id] = shuffleArray(optIds);
      } catch {
        optionOrders[instQ.id] = [];
      }
    }

    return instQ.id;
  };

  if (sections.length > 0) {
    for (const sec of sections) {
      const secSlots = assessment.questions
        .filter((q) => q.sectionId === sec.id)
        .sort((a, b) => a.order - b.order);

      let secQIds: string[] = [];
      for (const slot of secSlots) {
        const qId = await processSlot(slot);
        secQIds.push(qId);
      }
      if (assessment.shuffleQuestions) {
        secQIds = shuffleArray(secQIds);
      }
      assignedQuestionIds.push(...secQIds);
    }

    const orphanSlots = assessment.questions
      .filter((q) => !q.sectionId)
      .sort((a, b) => a.order - b.order);

    let orphanQIds: string[] = [];
    for (const slot of orphanSlots) {
      const qId = await processSlot(slot);
      orphanQIds.push(qId);
    }
    if (assessment.shuffleQuestions) {
      orphanQIds = shuffleArray(orphanQIds);
    }
    assignedQuestionIds.push(...orphanQIds);
  } else {
    const orderedSlots = [...assessment.questions].sort((a, b) => a.order - b.order);
    for (const slot of orderedSlots) {
      const qId = await processSlot(slot);
      assignedQuestionIds.push(qId);
    }
    if (assessment.shuffleQuestions) {
      return { questionOrder: shuffleArray(assignedQuestionIds), optionOrders };
    }
  }

  return { questionOrder: assignedQuestionIds, optionOrders };
}

// 2. Start / Resume Assessment Attempt
studentRouter.post("/start", async (req, res) => {
  try {
    const { code, rollNo, studentName, password, deviceInfo } = req.body;

    if (!code || !rollNo || !studentName?.trim() || !password) {
      return res.status(400).json({
        error: "Assessment code, Roll Number, Full Name, and Password are all required.",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanRollNo = rollNo.trim().toUpperCase();
    const rawStudentName = studentName.trim();

    // 1. Student Authentication & Credential Verification
    // Registration is one-time and must be completed independently before entering exams.
    const existingStudent = await prisma.student.findUnique({
      where: { rollNo: cleanRollNo },
    });

    if (!existingStudent) {
      return res.status(404).json({
        error: `Roll number '${cleanRollNo}' is not registered. Please complete one-time registration first before entering the assessment.`,
        notRegistered: true,
      });
    }

    const isPasswordValid = verifyStudentPassword(password, existingStudent.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: `Incorrect password for roll number '${cleanRollNo}'. Please enter your valid student password.`,
        invalidPassword: true,
      });
    }

    // Roll number and password are exact matched. Name alone can have differences.
    // The attempt records the student-entered name for this session.
    const effectiveStudentName = rawStudentName || existingStudent.name;

    const rawIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
    const cleanIp = rawIp.replace(/^::ffff:/, "");

    const assessment = await prisma.assessment.findUnique({
      where: { code: cleanCode },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
        questions: {
          where: { templateQuestionId: null },
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

    const durationMinutes = assessment.durationMinutes || 90;
    let freshRemainingSeconds = durationMinutes * 60;
    if (assessment.endTime) {
      const secondsUntilEnd = Math.floor((assessment.endTime.getTime() - now.getTime()) / 1000);
      freshRemainingSeconds = Math.min(freshRemainingSeconds, Math.max(0, secondsUntilEnd));
    }

    if (attempt) {
      // The test got canceled in mid. Restart the timer freshly when they login again!
      await prisma.violation.updateMany({
        where: { attemptId: attempt.id, resolved: false },
        data: { resolved: true, resolvedAt: now },
      });

      // Clear any prior incomplete submissions from the canceled session
      await prisma.submission.deleteMany({
        where: { attemptId: attempt.id },
      });

      let questionOrder: string[] = [];
      let optionOrders: Record<string, string[]> = {};
      let needsQuestions = false;

      try {
        questionOrder = JSON.parse(attempt.questionOrder || "[]");
      } catch {
        questionOrder = [];
      }

      const templateQuestions = (assessment.questions || []).filter((q: any) => !q.templateQuestionId);
      const expectedCount = templateQuestions.length > 0 ? templateQuestions.length : (assessment.isRandomized ? 3 : 1);

      if (questionOrder.length < expectedCount) {
        needsQuestions = true;
      } else {
        const validCount = await prisma.question.count({
          where: { id: { in: questionOrder }, assessmentId: assessment.id },
        });
        if (validCount < expectedCount) {
          needsQuestions = true;
        }
      }

      if (needsQuestions) {
        const alloc = await allocateQuestionsForStudentAttempt(assessment.id);
        questionOrder = alloc.questionOrder;
        optionOrders = alloc.optionOrders;
      }

      const updateData: any = {
        remainingSeconds: freshRemainingSeconds,
        startedAt: now,
        lastHeartbeat: now,
        status: "IN_PROGRESS",
        submittedAt: null,
        violationCount: 0,
      };
      if (cleanIp) updateData.ipAddress = cleanIp;
      if (deviceInfo) updateData.deviceInfo = String(deviceInfo);
      if (effectiveStudentName) updateData.studentName = effectiveStudentName;
      if (needsQuestions) {
        updateData.questionOrder = JSON.stringify(questionOrder);
        updateData.optionOrders = JSON.stringify(optionOrders);
        updateData.drafts = "{}";
      }

      attempt = await prisma.studentAttempt.update({
        where: { id: attempt.id },
        data: updateData,
        include: { violations: true, submissions: true },
      });
    } else {
      let questionOrder: string[] = [];
      let optionOrders: Record<string, string[]> = {};

      const alloc = await allocateQuestionsForStudentAttempt(assessment.id);
      questionOrder = alloc.questionOrder;
      optionOrders = alloc.optionOrders;

      attempt = await prisma.studentAttempt.create({
        data: {
          assessmentId: assessment.id,
          rollNo: cleanRollNo,
          studentName: effectiveStudentName,
          remainingSeconds: Math.max(60, freshRemainingSeconds),
          status: "IN_PROGRESS",
          startedAt: now,
          questionOrder: JSON.stringify(questionOrder),
          optionOrders: JSON.stringify(optionOrders),
          ipAddress: cleanIp || null,
          deviceInfo: deviceInfo ? String(deviceInfo) : null,
          violationCount: 0,
        },
        include: { violations: true, submissions: true },
      });
    }

    // Resolve which questions belong to this student attempt
    let assignedQIds: string[] = [];
    try {
      assignedQIds = JSON.parse(attempt.questionOrder || "[]");
    } catch {
      assignedQIds = [];
    }

    const candidateQuestions = await prisma.question.findMany({
      where: {
        assessmentId: assessment.id,
        id: assignedQIds.length > 0 ? { in: assignedQIds } : undefined,
      },
      include: {
        testCases: {
          where: { isPublic: true },
          orderBy: { order: "asc" },
        },
      },
    });

    // Sort according to assignedQIds
    const sortedQuestions = [...candidateQuestions].sort((a, b) => {
      const idxA = assignedQIds.indexOf(a.id);
      const idxB = assignedQIds.indexOf(b.id);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    // Sanitize questions: strip correctAnswers for exam mode!
    const sanitizedQuestions = sortedQuestions.map((q) => ({
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
        totalQuestions: sanitizedQuestions.length,
        totalMarks: sanitizedQuestions.reduce((sum, q) => sum + q.marks, 0),
        isRandomized: assessment.isRandomized,
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
    const maxDurationSeconds = (attempt.assessment?.durationMinutes || 90) * 60;
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
      const totalAllowed = (attempt.assessment?.durationMinutes || 90) * 60;
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

  let assignedQIds: string[] = [];
  try {
    assignedQIds = JSON.parse(attempt.questionOrder || "[]");
  } catch {}

  const questionsToGrade = assignedQIds.length > 0
    ? attempt.assessment.questions.filter((q) => assignedQIds.includes(q.id))
    : attempt.assessment.questions;

  for (const q of questionsToGrade) {
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

    let assignedQIds: string[] = [];
    try {
      assignedQIds = JSON.parse(attempt.questionOrder || "[]");
    } catch {
      assignedQIds = [];
    }

    const reviewQuestions = assignedQIds.length > 0
      ? assessment.questions.filter((q) => assignedQIds.includes(q.id))
      : assessment.questions;

    res.json({
      isUnlocked: true,
      attemptToken: reviewAttemptToken,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        code: assessment.code,
        sections: assessment.sections,
        questions: reviewQuestions, // Includes all testcases and correctAnswers for review!
      },
      attempt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
