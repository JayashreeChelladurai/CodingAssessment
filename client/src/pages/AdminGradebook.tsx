import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Assessment } from "../types";
import {
  ArrowLeft,
  Download,
  BookOpen,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Award,
  HelpCircle,
  Code2
} from "lucide-react";

interface AdminGradebookProps {
  assessment: Assessment;
  onBack: () => void;
  onNavigateToLive: () => void;
}

export const AdminGradebook: React.FC<AdminGradebookProps> = ({
  assessment,
  onBack,
  onNavigateToLive,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isReviewUnlocked, setIsReviewUnlocked] = useState<boolean>(!!assessment.isReviewUnlocked);
  const [isUpdatingReview, setIsUpdatingReview] = useState<boolean>(false);

  useEffect(() => {
    loadResults();
  }, [assessment.id]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const res = await api.getResults(assessment.id);
      setData(res);
      setIsReviewUnlocked(!!res.assessment?.isReviewUnlocked);
    } catch (err) {
      console.error("Failed to load results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReviewMode = async () => {
    try {
      setIsUpdatingReview(true);
      const nextState = !isReviewUnlocked;
      await api.toggleReviewMode(assessment.id, nextState);
      setIsReviewUnlocked(nextState);
    } catch (err: any) {
      alert(err.message || "Failed to update review mode");
    } finally {
      setIsUpdatingReview(false);
    }
  };

  const handleExportCSV = () => {
    window.open(api.getExportUrl(assessment.id), "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-base text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Gradebook & Section Performance</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{assessment.title} ({assessment.code})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToLive}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            Switch to Live Monitor
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950/50"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Post-Test Student Practice Mode Controller */}
        <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-900/40 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-base text-white">Post-Exam Student Practice & Review Mode</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              When enabled, students can look up their Roll Number from any regular browser (no SEB needed) to view their MCQ answers, examine hidden test cases, and practice fixing code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleReviewMode}
              disabled={isUpdatingReview}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
                isReviewUnlocked
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
            >
              {isReviewUnlocked ? <Check className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              <span>{isReviewUnlocked ? "Review Mode Active (Open to Students)" : "Enable Review & Practice Mode"}</span>
            </button>
          </div>
        </div>

        {/* Gradebook Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Candidate Marks Breakdown (MCQs + Coding)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Max Marks: {data?.assessment?.totalPossibleMarks || 100}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading gradebook data...</div>
          ) : !data || data.students?.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No student submissions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">MCQ Marks</th>
                    <th className="p-3 text-center">Coding Marks</th>
                    {data.assessment.questions.map((q: any, idx: number) => (
                      <th key={q.id} className="p-3 text-center">
                        <span className="block text-[10px] text-slate-500">{q.type}</span>
                        <span>Q{idx + 1} ({q.marks}m)</span>
                      </th>
                    ))}
                    <th className="p-3 text-right">Total Score</th>
                    <th className="p-3 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.students.map((st: any) => (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-emerald-400">{st.rollNo}</td>
                      <td className="p-3 font-semibold text-white">{st.studentName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.status === "SUBMITTED"
                              ? "bg-blue-500/20 text-blue-400"
                              : st.status === "LOCKED_OUT"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-amber-400">
                        {st.mcqScore}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-400">
                        {st.codingScore}
                      </td>

                      {data.assessment.questions.map((q: any) => {
                        const qInfo = st.questionScores[q.id] || { score: 0, status: "NONE" };
                        return (
                          <td key={q.id} className="p-3 text-center font-mono">
                            <span
                              className={`font-semibold ${
                                qInfo.score === q.marks
                                  ? "text-emerald-400"
                                  : qInfo.score > 0
                                  ? "text-amber-400"
                                  : qInfo.score < 0
                                  ? "text-rose-400"
                                  : "text-slate-500"
                              }`}
                            >
                              {qInfo.score}
                            </span>
                            <span className="text-[10px] text-slate-500">/{q.marks}</span>
                          </td>
                        );
                      })}

                      <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                        {st.totalScore} <span className="text-[11px] text-slate-500 font-normal">/ {st.maxScore}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        {st.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
