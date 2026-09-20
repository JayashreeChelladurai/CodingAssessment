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

// 2. Export Gradebook to CSV / Excel (Detailed Choices & Answers + Summary)
resultsRouter.get("/:assessmentId/export", async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const mode = (req.query.mode as string) || "detailed"; // "detailed" | "summary"

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

    const letterMap = ["A", "B", "C", "D", "E", "F", "G"];

    // Build header row based on export mode
    const headers: string[] = [
      "Roll Number",
      "Student Name",
      "Status",
      "Violations",
      "MCQ Marks",
      "Coding Marks",
      "Total Score",
      "Max Score",
      "Percentage (%)",
    ];

    if (mode === "summary") {
      // Summary mode: only numeric marks per question
      assessment.questions.forEach((q, idx) => {
        headers.push(`Q${idx + 1} Score [${q.type}] (${q.marks}m)`);
      });
    } else {
      // Detailed mode: Selected choice, correct answer, and score per question
      assessment.questions.forEach((q, idx) => {
        if (q.type === "MCQ") {
          headers.push(`Q${idx + 1} Selected Choice`);
          headers.push(`Q${idx + 1} Correct Answer`);
          headers.push(`Q${idx + 1} Score (${q.marks}m)`);
        } else {
          headers.push(`Q${idx + 1} Coding Submission`);
          headers.push(`Q${idx + 1} Score (${q.marks}m)`);
        }
      });
    }

    headers.push("Started At", "Submitted At");

    const rows: string[][] = [headers];

    assessment.attempts.forEach((att) => {
      let totalEarnedScore = 0;
      let mcqScore = 0;
      let codingScore = 0;

      let mcqResponsesMap: Record<string, string[]> = {};
      try {
        mcqResponsesMap = JSON.parse(att.mcqResponses || "{}");
      } catch {
        mcqResponsesMap = {};
      }

      const questionColumns: string[] = [];

      assessment.questions.forEach((q, idx) => {
        const sub = att.submissions.find((s) => s.questionId === q.id);
        const score = sub ? sub.score : 0;
        totalEarnedScore += score;
        if (q.type === "MCQ") mcqScore += score;
        else codingScore += score;

        if (mode === "summary") {
          questionColumns.push(sanitizeCsvCell(score.toFixed(1)));
        } else {
          if (q.type === "MCQ") {
            // Parse options
            let options: Array<{ id: string; text: string }> = [];
            try {
              options = JSON.parse(q.options || "[]");
            } catch {
              options = [];
            }

            // Parse correct answers
            let correctAnswers: string[] = [];
            try {
              correctAnswers = JSON.parse(q.correctAnswers || "[]");
            } catch {
              correctAnswers = [];
            }

            // Parse selected answers
            let selected: string[] = [];
            if (sub && sub.selectedOptions) {
              try {
                selected = JSON.parse(sub.selectedOptions);
              } catch {
                selected = [];
              }
            } else if (mcqResponsesMap[q.id]) {
              selected = mcqResponsesMap[q.id];
            }

            // Format selected choice string
            let selectedText = "[Unanswered]";
            if (selected.length > 0) {
              selectedText = selected
                .map((selId) => {
                  const optIdx = options.findIndex((o) => o.id === selId);
                  const letter = optIdx >= 0 ? letterMap[optIdx] : selId;
                  const optObj = options.find((o) => o.id === selId);
                  return optObj ? `${letter}: ${optObj.text}` : letter;
                })
                .join(" | ");
            }

            // Format correct answer string
            let correctText = "";
            if (correctAnswers.length > 0) {
              correctText = correctAnswers
                .map((ansId) => {
                  const optIdx = options.findIndex((o) => o.id === ansId);
                  const letter = optIdx >= 0 ? letterMap[optIdx] : ansId;
                  const optObj = options.find((o) => o.id === ansId);
                  return optObj ? `${letter}: ${optObj.text}` : letter;
                })
                .join(" | ");
            }

            questionColumns.push(sanitizeCsvCell(selectedText));
            questionColumns.push(sanitizeCsvCell(correctText));
            questionColumns.push(sanitizeCsvCell(score.toFixed(1)));
          } else {
            // Coding question
            const statusText = sub
              ? `${sub.status} (${sub.passedTestCases || 0}/${sub.totalTestCases || 0} passed)`
              : "[Not Submitted]";
            questionColumns.push(sanitizeCsvCell(statusText));
            questionColumns.push(sanitizeCsvCell(score.toFixed(1)));
          }
        }
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
        ...questionColumns,
        sanitizeCsvCell(att.startedAt.toISOString()),
        sanitizeCsvCell(att.submittedAt ? att.submittedAt.toISOString() : ""),
      ]);
    });

    const csvContent = "\uFEFF" + rows.map((r) => r.join(",")).join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${assessment.code}_Student_Responses_${mode}.csv"`
    );
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
