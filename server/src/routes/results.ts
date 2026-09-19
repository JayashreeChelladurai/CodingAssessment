import { Router } from "express";
import { prisma } from "../db.js";
import { requireAdminSession } from "../services/auth.js";
import { autoGradeAndFinalizeAttempt } from "./student.js";

export const resultsRouter = Router();

resultsRouter.use(requireAdminSession);

function sanitizeCsvCell(raw: unknown): string {
  const value = raw === null || raw === undefined ? "" : String(raw);
  const normalized = value.replace(/\r/g, " ").replace(/\n/g, " ").replace(/"/g, "\"\"");
  const safeValue = /^[=+\-@]/.test(normalized.trimStart()) ? `'${normalized}` : normalized;
  return `"${safeValue}"`;
}

// 1. Get Gradebook Analytics, Submissions & Code (Admin)
resultsRouter.get("/:assessmentId", async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Check for any in-progress attempts that have expired time and finalize them
    const inProgressAttempts = await prisma.studentAttempt.findMany({
      where: {
        assessmentId,
        status: "IN_PROGRESS",
      },
      include: { assessment: true },
    });

    const now = Date.now();
    for (const att of inProgressAttempts) {
      const durationMs = (att.assessment.durationMinutes || 60) * 60 * 1000;
      const startedMs = new Date(att.startedAt).getTime();
      const isExpiredByClock = now - startedMs > durationMs + 60000; // 1 min grace buffer
      const isExpiredBySeconds = att.remainingSeconds <= 0;

      if (isExpiredByClock || isExpiredBySeconds) {
        await autoGradeAndFinalizeAttempt(att.id, "TIME_EXPIRED");
      }
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: {
                testCases: { orderBy: { order: "asc" } },
              },
            },
          },
        },
        questions: {
          orderBy: { order: "asc" },
          include: {
            testCases: { orderBy: { order: "asc" } },
          },
        },
        attempts: {
          include: {
            violations: { orderBy: { timestamp: "desc" } },
            submissions: {
              include: { question: true },
              orderBy: { submittedAt: "desc" },
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
      const questionScores: Record<string, { score: number; maxScore: number; status: string; type: string; submissionId?: string }> = {};
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
          submissionId: sub ? sub.id : undefined,
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
        submissions: att.submissions.map((s) => ({
          id: s.id,
          questionId: s.questionId,
          type: s.type,
          language: s.language,
          code: s.code,
          score: s.score,
          maxScore: s.maxScore,
          passedTestCases: s.passedTestCases,
          totalTestCases: s.totalTestCases,
          status: s.status,
          testCaseResults: s.testCaseResults,
          selectedOptions: s.selectedOptions,
          submittedAt: s.submittedAt,
        })),
        drafts: att.drafts,
        mcqResponses: att.mcqResponses,
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

// 2. Force Auto-Grade All Attempts for this assessment
resultsRouter.post("/:assessmentId/autograde-all", async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const attempts = await prisma.studentAttempt.findMany({
      where: { assessmentId },
    });

    let gradedCount = 0;
    for (const att of attempts) {
      await autoGradeAndFinalizeAttempt(att.id, att.status === "IN_PROGRESS" ? "TIME_EXPIRED" : (att.status as any));
      gradedCount++;
    }

    res.json({ success: true, gradedCount });
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
