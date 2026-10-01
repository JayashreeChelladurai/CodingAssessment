import { Router } from "express";
import { prisma } from "../db.js";
import { requireAdminSession } from "../services/auth.js";

export const questionBankRouter = Router();

// Protect all Question Bank endpoints with Admin authentication
questionBankRouter.use(requireAdminSession);

// Helper to seed default folder hierarchy if empty
async function seedDefaultFoldersIfEmpty() {
  const count = await prisma.questionFolder.count();
  if (count > 0) return;

  // Root folder: MCQ
  const mcqRoot = await prisma.questionFolder.create({
    data: {
      name: "MCQ",
      description: "Multiple choice conceptual & code output questions",
      order: 0,
    },
  });

  await prisma.questionFolder.createMany({
    data: [
      { name: "Easy", parentId: mcqRoot.id, description: "Basic concepts & syntax", order: 0 },
      { name: "Medium", parentId: mcqRoot.id, description: "Output prediction & algorithms", order: 1 },
      { name: "Hard", parentId: mcqRoot.id, description: "Advanced theory & edge cases", order: 2 },
    ],
  });

  // Root folder: Coding
  const codingRoot = await prisma.questionFolder.create({
    data: {
      name: "Coding",
      description: "Hands-on programming and algorithmic problems",
      order: 1,
    },
  });

  await prisma.questionFolder.createMany({
    data: [
      { name: "Easy", parentId: codingRoot.id, description: "Warm-up & fundamentals", order: 0 },
      { name: "Medium", parentId: codingRoot.id, description: "Data structures & classic algorithms", order: 1 },
      { name: "Hard", parentId: codingRoot.id, description: "Complex optimizations & dynamic programming", order: 2 },
    ],
  });
}

// -------------------------------------------------------------
// FOLDER ENDPOINTS
// -------------------------------------------------------------

// 1. Get all folders (flat with parentId and question counts)
questionBankRouter.get("/folders", async (_req, res) => {
  try {
    await seedDefaultFoldersIfEmpty();

    const folders = await prisma.questionFolder.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    res.json(folders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create a folder (root or subfolder)
questionBankRouter.post("/folders", async (req, res) => {
  try {
    const { name, parentId, description, order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    if (parentId) {
      const parent = await prisma.questionFolder.findUnique({ where: { id: parentId } });
      if (!parent) {
        return res.status(404).json({ error: "Parent folder not found" });
      }
    }

    const folder = await prisma.questionFolder.create({
      data: {
        name: name.trim(),
        parentId: parentId || null,
        description: description ? description.trim() : "",
        order: typeof order === "number" ? order : 0,
      },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    res.status(201).json(folder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update folder (rename / change description / order / parentId)
questionBankRouter.put("/folders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, description, order } = req.body;

    const existing = await prisma.questionFolder.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Prevent making a folder its own parent or moving to its own descendants
    if (parentId === id) {
      return res.status(400).json({ error: "A folder cannot be its own parent" });
    }

    const updated = await prisma.questionFolder.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(parentId !== undefined ? { parentId: parentId || null } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(typeof order === "number" ? { order } : {}),
      },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete folder (cascades to subfolders, bank questions get deleted or set null)
questionBankRouter.delete("/folders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.questionFolder.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Folder not found" });
    }

    // Recursively collect all descendant folder IDs to clean up bank questions
    const allFolders = await prisma.questionFolder.findMany();
    const folderIdsToDelete: string[] = [id];

    function collectDescendants(parent: string) {
      const children = allFolders.filter((f) => f.parentId === parent);
      for (const child of children) {
        folderIdsToDelete.push(child.id);
        collectDescendants(child.id);
      }
    }
    collectDescendants(id);

    // Delete questions in these folders
    await prisma.bankQuestion.deleteMany({
      where: { folderId: { in: folderIdsToDelete } },
    });

    // Delete root folder (cascade deletes child QuestionFolder records)
    await prisma.questionFolder.delete({
      where: { id },
    });

    res.json({ success: true, deletedFolderIds: folderIdsToDelete });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// QUESTION ENDPOINTS
// -------------------------------------------------------------

// Helper to gather all descendant folder IDs
async function getDescendantFolderIds(folderId: string): Promise<string[]> {
  const allFolders = await prisma.questionFolder.findMany({ select: { id: true, parentId: true } });
  const ids: string[] = [folderId];

  function collect(currentId: string) {
    const children = allFolders.filter((f) => f.parentId === currentId);
    for (const c of children) {
      ids.push(c.id);
      collect(c.id);
    }
  }
  collect(folderId);
  return ids;
}

// 5. Get questions with filters (folderId, type, difficulty, search, includeSubfolders)
questionBankRouter.get("/questions", async (req, res) => {
  try {
    const { folderId, type, difficulty, search, includeSubfolders } = req.query;

    const where: any = {};

    if (folderId && typeof folderId === "string") {
      if (includeSubfolders === "true") {
        const folderIds = await getDescendantFolderIds(folderId);
        where.folderId = { in: folderIds };
      } else {
        where.folderId = folderId;
      }
    }

    if (type && typeof type === "string") {
      where.type = type.toUpperCase();
    }

    if (difficulty && typeof difficulty === "string") {
      where.difficulty = difficulty.toUpperCase();
    }

    if (search && typeof search === "string" && search.trim()) {
      const term = search.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
        { tags: { contains: term } },
      ];
    }

    const questions = await prisma.bankQuestion.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        folder: {
          select: { id: true, name: true, parentId: true },
        },
        testCases: {
          orderBy: { order: "asc" },
        },
      },
    });

    res.json(questions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get single question by ID
questionBankRouter.get("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const question = await prisma.bankQuestion.findUnique({
      where: { id },
      include: {
        folder: true,
        testCases: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(question);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Create a single question
questionBankRouter.post("/questions", async (req, res) => {
  try {
    const qData = req.body;
    if (!qData.title || !qData.title.trim()) {
      return res.status(400).json({ error: "Question title is required" });
    }

    const type = (qData.type || "CODING").toUpperCase();
    const difficulty = (qData.difficulty || "MEDIUM").toUpperCase();

    const created = await prisma.bankQuestion.create({
      data: {
        folderId: qData.folderId || null,
        type,
        title: qData.title.trim(),
        description: qData.description || "",
        difficulty,
        tags: qData.tags ? String(qData.tags).trim() : "",
        marks: typeof qData.marks === "number" ? qData.marks : 10,
        negativeMarks: typeof qData.negativeMarks === "number" ? qData.negativeMarks : 0,
        order: typeof qData.order === "number" ? qData.order : 0,

        // MCQ
        mcqType: qData.mcqType || "SINGLE",
        options: typeof qData.options === "string" ? qData.options : JSON.stringify(qData.options || []),
        correctAnswers: typeof qData.correctAnswers === "string" ? qData.correctAnswers : JSON.stringify(qData.correctAnswers || []),
        explanation: qData.explanation || "",

        // Coding
        allowedLanguages: qData.allowedLanguages || "JAVA,C,CPP",
        starterCodes: typeof qData.starterCodes === "string" ? qData.starterCodes : JSON.stringify(qData.starterCodes || {}),
        starterCode: qData.starterCode || "",
        timeLimitSeconds: typeof qData.timeLimitSeconds === "number" ? qData.timeLimitSeconds : 3,
        memoryLimitMb: typeof qData.memoryLimitMb === "number" ? qData.memoryLimitMb : 256,

        // Test Cases
        testCases: {
          create: Array.isArray(qData.testCases)
            ? qData.testCases.map((tc: any, idx: number) => ({
                input: tc.input || "",
                expectedOutput: tc.expectedOutput || "",
                isPublic: tc.isPublic !== false,
                weight: typeof tc.weight === "number" ? tc.weight : 1.0,
                order: typeof tc.order === "number" ? tc.order : idx,
              }))
            : [],
        },
      },
      include: {
        folder: true,
        testCases: { orderBy: { order: "asc" } },
      },
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Update a question
questionBankRouter.put("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const qData = req.body;

    const existing = await prisma.bankQuestion.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Question not found" });
    }

    const type = qData.type ? qData.type.toUpperCase() : existing.type;
    const difficulty = qData.difficulty ? qData.difficulty.toUpperCase() : existing.difficulty;

    // Use transaction to update question and re-create test cases if supplied
    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(qData.testCases)) {
        await tx.bankTestCase.deleteMany({ where: { bankQuestionId: id } });
        if (qData.testCases.length > 0) {
          await tx.bankTestCase.createMany({
            data: qData.testCases.map((tc: any, idx: number) => ({
              bankQuestionId: id,
              input: tc.input || "",
              expectedOutput: tc.expectedOutput || "",
              isPublic: tc.isPublic !== false,
              weight: typeof tc.weight === "number" ? tc.weight : 1.0,
              order: typeof tc.order === "number" ? tc.order : idx,
            })),
          });
        }
      }

      return tx.bankQuestion.update({
        where: { id },
        data: {
          ...(qData.folderId !== undefined ? { folderId: qData.folderId || null } : {}),
          ...(qData.title ? { title: qData.title.trim() } : {}),
          ...(qData.description !== undefined ? { description: qData.description } : {}),
          type,
          difficulty,
          ...(qData.tags !== undefined ? { tags: String(qData.tags).trim() } : {}),
          ...(typeof qData.marks === "number" ? { marks: qData.marks } : {}),
          ...(typeof qData.negativeMarks === "number" ? { negativeMarks: qData.negativeMarks } : {}),
          ...(typeof qData.order === "number" ? { order: qData.order } : {}),

          // MCQ
          ...(qData.mcqType ? { mcqType: qData.mcqType } : {}),
          ...(qData.options !== undefined ? { options: typeof qData.options === "string" ? qData.options : JSON.stringify(qData.options) } : {}),
          ...(qData.correctAnswers !== undefined ? { correctAnswers: typeof qData.correctAnswers === "string" ? qData.correctAnswers : JSON.stringify(qData.correctAnswers) } : {}),
          ...(qData.explanation !== undefined ? { explanation: qData.explanation } : {}),

          // Coding
          ...(qData.allowedLanguages ? { allowedLanguages: qData.allowedLanguages } : {}),
          ...(qData.starterCodes !== undefined ? { starterCodes: typeof qData.starterCodes === "string" ? qData.starterCodes : JSON.stringify(qData.starterCodes) } : {}),
          ...(qData.starterCode !== undefined ? { starterCode: qData.starterCode } : {}),
          ...(typeof qData.timeLimitSeconds === "number" ? { timeLimitSeconds: qData.timeLimitSeconds } : {}),
          ...(typeof qData.memoryLimitMb === "number" ? { memoryLimitMb: qData.memoryLimitMb } : {}),
        },
        include: {
          folder: true,
          testCases: { orderBy: { order: "asc" } },
        },
      });
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Delete a question
questionBankRouter.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.bankQuestion.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Question not found" });
    }

    await prisma.bankQuestion.delete({ where: { id } });
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Bulk Upload questions into a folder
questionBankRouter.post("/questions/bulk-upload", async (req, res) => {
  try {
    const { folderId, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "A non-empty 'questions' array is required." });
    }

    if (folderId) {
      const folder = await prisma.questionFolder.findUnique({ where: { id: folderId } });
      if (!folder) {
        return res.status(404).json({ error: "Target folder not found." });
      }
    }

    const createdList = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.title || !String(q.title).trim()) continue;

      const type = (q.type || (q.testCases ? "CODING" : "MCQ")).toUpperCase();
      const difficulty = (q.difficulty || "MEDIUM").toUpperCase();

      const created = await prisma.bankQuestion.create({
        data: {
          folderId: folderId || null,
          type,
          title: String(q.title).trim(),
          description: q.description || "",
          difficulty,
          tags: q.tags ? String(q.tags).trim() : "",
          marks: typeof q.marks === "number" ? q.marks : 10,
          negativeMarks: typeof q.negativeMarks === "number" ? q.negativeMarks : 0,
          order: typeof q.order === "number" ? q.order : i,

          // MCQ
          mcqType: q.mcqType || "SINGLE",
          options: typeof q.options === "string" ? q.options : JSON.stringify(q.options || []),
          correctAnswers: typeof q.correctAnswers === "string" ? q.correctAnswers : JSON.stringify(q.correctAnswers || []),
          explanation: q.explanation || "",

          // Coding
          allowedLanguages: q.allowedLanguages || "JAVA,C,CPP",
          starterCodes: typeof q.starterCodes === "string" ? q.starterCodes : JSON.stringify(q.starterCodes || {}),
          starterCode: q.starterCode || "",
          timeLimitSeconds: typeof q.timeLimitSeconds === "number" ? q.timeLimitSeconds : 3,
          memoryLimitMb: typeof q.memoryLimitMb === "number" ? q.memoryLimitMb : 256,

          testCases: {
            create: Array.isArray(q.testCases)
              ? q.testCases.map((tc: any, tcIdx: number) => ({
                  input: tc.input || "",
                  expectedOutput: String(tc.expectedOutput ?? ""),
                  isPublic: tc.isPublic !== false,
                  weight: typeof tc.weight === "number" ? tc.weight : 1.0,
                  order: typeof tc.order === "number" ? tc.order : tcIdx,
                }))
              : [],
          },
        },
      });

      createdList.push(created);
    }

    res.status(201).json({
      success: true,
      count: createdList.length,
      message: `Successfully uploaded ${createdList.length} question(s) into folder.`,
      createdQuestions: createdList,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Move multiple questions to a target folder
questionBankRouter.post("/questions/move", async (req, res) => {
  try {
    const { questionIds, targetFolderId } = req.body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ error: "questionIds must be a non-empty array" });
    }

    if (targetFolderId) {
      const folder = await prisma.questionFolder.findUnique({ where: { id: targetFolderId } });
      if (!folder) {
        return res.status(404).json({ error: "Target folder not found" });
      }
    }

    const updated = await prisma.bankQuestion.updateMany({
      where: { id: { in: questionIds } },
      data: { folderId: targetFolderId || null },
    });

    res.json({
      success: true,
      movedCount: updated.count,
      targetFolderId: targetFolderId || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
