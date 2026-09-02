import { Router } from "express";
import { prisma } from "../db.js";
import { requireAdminSession } from "../services/auth.js";

export const resultsRouter = Router();

resultsRouter.use(requireAdminSession);

function sanitizeCsvCell(raw: unknown): string {
  const value = raw === null || raw === undefined ? "" : String(raw);
  const normalized = value.replace(/\r/g, " ").replace(/\n/g, " ").replace(/"/g, "\"\"");
  const safeValue = /^[=+\-@]/.test(normalized.trimStart()) ? `'${normalized}` : normalized;
  return `"${safeValue}"`;
}

// 1. Get Gradebook Analytics & Combined Scores (Admin)
resultsRouter.get("/:assessmentId", async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            questions: {
              orderBy: { order: "asc" },
              select: { id: true, type: true, title: true, marks: true, order: true },
            },
          },
        },
        questions: {
          orderBy: { order: "asc" },
          select: { id: true, type: true, title: true, marks: true, order: true },
        },
        attempts: {
          include: {
            violations: { orderBy: { timestamp: "desc" } },
            submissions: {
              include: { question: { select: { id: true, type: true, title: true, marks: true } } },
            },
          },
          orderBy: { startedAt: "desc" },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const totalPossibleMarks = assessment.questions.reduce((sum, q) => sum + q.marks, 0);

    const students = assessment.attempts.map((att) => {
      const questionScores: Record<string, { score: number; maxScore: number; status: string; type: string }> = {};
      let totalEarnedScore = 0;
      let mcqScore = 0;
      let codingScore = 0;

      assessment.questions.forEach((q) => {
        const sub = att.submissions.find((s) => s.questionId === q.id);
        const score = sub ? sub.score : 0;
        totalEarnedScore += score;

        if (q.type === "MCQ") {
          mcqScore += score;
        } else {
          codingScore += score;
        }

        questionScores[q.id] = {
          score,
          maxScore: q.marks,
          status: sub ? sub.status : "NOT_SUBMITTED",
          type: q.type,
        };
      });

      return {
        id: att.id,
        rollNo: att.rollNo,
        studentName: att.studentName,
        status: att.status,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt,
        violationCount: att.violationCount,
        violations: att.violations,
        questionScores,
        mcqScore: Number(mcqScore.toFixed(2)),
        codingScore: Number(codingScore.toFixed(2)),
        totalScore: Number(totalEarnedScore.toFixed(2)),
        maxScore: totalPossibleMarks,
        percentage: totalPossibleMarks > 0 ? Number(((totalEarnedScore / totalPossibleMarks) * 100).toFixed(1)) : 0,
      };
    });

    res.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        code: assessment.code,
        durationMinutes: assessment.durationMinutes,
        isReviewUnlocked: assessment.isReviewUnlocked,
        sections: assessment.sections,
        questions: assessment.questions,
        totalPossibleMarks,
      },
      students,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Export Gradebook to CSV
resultsRouter.get("/:assessmentId/export", async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: { orderBy: { order: "asc" } },
        attempts: {
          include: {
            submissions: true,
          },
          orderBy: { rollNo: "asc" },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    const totalPossibleMarks = assessment.questions.reduce((sum, q) => sum + q.marks, 0);

    const headers = [
      "Roll Number",
      "Student Name",
      "Status",
      "Violations",
      "MCQ Marks",
      "Coding Marks",
      "Total Score",
      "Max Score",
      "Percentage (%)",
      ...assessment.questions.map((q, idx) => `Q${idx + 1} [${q.type}] (${q.title}) [${q.marks}m]`),
      "Started At",
      "Submitted At",
    ];

    const rows: string[][] = [headers];

    assessment.attempts.forEach((att) => {
      let totalEarnedScore = 0;
      let mcqScore = 0;
      let codingScore = 0;

      const qScores = assessment.questions.map((q) => {
        const sub = att.submissions.find((s) => s.questionId === q.id);
        const score = sub ? sub.score : 0;
        totalEarnedScore += score;
        if (q.type === "MCQ") mcqScore += score;
        else codingScore += score;
        return score.toFixed(1);
      });

      const percentage = totalPossibleMarks > 0 ? ((totalEarnedScore / totalPossibleMarks) * 100).toFixed(1) : "0";

      rows.push([
        sanitizeCsvCell(att.rollNo),
        sanitizeCsvCell(att.studentName),
        sanitizeCsvCell(att.status),
        sanitizeCsvCell(att.violationCount.toString()),
        sanitizeCsvCell(mcqScore.toFixed(2)),
        sanitizeCsvCell(codingScore.toFixed(2)),
        sanitizeCsvCell(totalEarnedScore.toFixed(2)),
        sanitizeCsvCell(totalPossibleMarks.toString()),
        sanitizeCsvCell(`${percentage}%`),
        ...qScores.map((score) => sanitizeCsvCell(score)),
        sanitizeCsvCell(att.startedAt.toISOString()),
        sanitizeCsvCell(att.submittedAt ? att.submittedAt.toISOString() : ""),
      ]);
    });

    const csvContent = rows.map((r) => r.join(",")).join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="Gradebook_${assessment.code}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
