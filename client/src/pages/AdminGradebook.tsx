import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Assessment, Question, Submission } from "../types";
import {
  ArrowLeft,
  Download,
  BookOpen,
  Check,
  FileSpreadsheet,
  Award,
  Code2,
  Search,
  RefreshCw,
  X,
  Copy,
  CheckCheck,
  AlertCircle,
  Clock,
  Terminal,
  FileCode,
  Layers,
  ChevronRight,
  ExternalLink
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
  const [isAutograding, setIsAutograding] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Code Inspector Modal State
  const [inspectStudent, setInspectStudent] = useState<any | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

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

  const handleAutogradeAll = async () => {
    try {
      setIsAutograding(true);
      const res = await api.autogradeAll(assessment.id);
      await loadResults();
      alert(`Auto-grading completed! Processed ${res.gradedCount || 0} candidate attempts.`);
    } catch (err: any) {
      alert(err.message || "Failed to auto-grade attempts");
    } finally {
      setIsAutograding(false);
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
    api
      .exportResultsCsv(assessment.id)
      .then(async (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `gradebook-${assessment.code || assessment.id}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        alert(err.message || "Failed to download CSV");
      });
  };

  const openCodeInspector = (student: any, questionId?: string) => {
    setInspectStudent(student);
    const targetQId = questionId || data?.assessment?.questions?.[0]?.id || "";
    setActiveQuestionId(targetQId);
    setCopiedCode(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filter students by search
  const filteredStudents = (data?.students || []).filter((st: any) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      st.rollNo?.toLowerCase().includes(q) ||
      st.studentName?.toLowerCase().includes(q) ||
      st.status?.toLowerCase().includes(q)
    );
  });

  const activeQuestion = data?.assessment?.questions?.find((q: any) => q.id === activeQuestionId);
  const activeSubmission = inspectStudent?.submissions?.find((s: any) => s.questionId === activeQuestionId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
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
              <span>Gradebook & Submitted Code Collector</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{assessment.title} ({assessment.code})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutogradeAll}
            disabled={isAutograding}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/50 transition"
            title="Grade all unsubmitted or drafted questions across all candidates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutograding ? "animate-spin" : ""}`} />
            <span>{isAutograding ? "Auto-Grading..." : "Auto-Grade All Drafts"}</span>
          </button>

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
            <span>Export CSV</span>
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

        {/* Gradebook Table Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Candidate Performance & Submitted Code Records</span>
              </h3>
              <p className="text-xs text-slate-400">
                Click on any student row or question score cell to view their full submitted code, test cases, and answers.
              </p>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Roll No or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-60"
                />
              </div>

              <button
                onClick={loadResults}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title="Refresh Gradebook"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">Loading gradebook & submission records...</div>
          ) : !data || data.students?.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No student submissions or test attempts recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">MCQ Score</th>
                    <th className="p-3 text-center">Coding Score</th>
                    {data.assessment.questions.map((q: any, idx: number) => (
                      <th key={q.id} className="p-3 text-center">
                        <span className="block text-[10px] text-slate-500">{q.type}</span>
                        <span>Q{idx + 1} ({q.marks}m)</span>
                      </th>
                    ))}
                    <th className="p-3 text-right">Total Marks</th>
                    <th className="p-3 text-right">Percentage</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((st: any) => (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition group">
                      <td className="p-3 font-mono font-bold text-emerald-400">{st.rollNo}</td>
                      <td className="p-3 font-semibold text-white">{st.studentName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            st.status === "SUBMITTED"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : st.status === "TIME_EXPIRED"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : st.status === "LOCKED_OUT"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
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
                        const qInfo = st.questionScores[q.id] || { score: 0, status: "NOT_SUBMITTED" };
                        const hasSubmission = !!qInfo.submissionId || (st.submissions && st.submissions.some((s: any) => s.questionId === q.id));

                        return (
                          <td key={q.id} className="p-3 text-center font-mono">
                            <button
                              onClick={() => openCodeInspector(st, q.id)}
                              className={`px-2 py-1 rounded-lg border transition text-xs font-semibold ${
                                qInfo.score === q.marks
                                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/60"
                                  : qInfo.score > 0
                                  ? "bg-amber-950/40 text-amber-300 border-amber-800/50 hover:bg-amber-900/60"
                                  : qInfo.score < 0
                                  ? "bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/60"
                                  : hasSubmission
                                  ? "bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800"
                                  : "bg-slate-950/20 text-slate-600 border-transparent hover:border-slate-800"
                              }`}
                              title="Click to inspect student's code and test case results"
                            >
                              <span>{qInfo.score}</span>
                              <span className="text-[10px] text-slate-500">/{q.marks}</span>
                            </button>
                          </td>
                        );
                      })}

                      <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                        {st.totalScore} <span className="text-[11px] text-slate-500 font-normal">/ {st.maxScore}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        {st.percentage}%
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openCodeInspector(st)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold transition text-xs mx-auto"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>View Code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 🔍 CODE & SUBMISSION INSPECTOR MODAL                                      */}
      {/* ========================================================================= */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-white">{inspectStudent.studentName}</h2>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                      {inspectStudent.rollNo}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {inspectStudent.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Total Earned Score: <strong className="text-emerald-400">{inspectStudent.totalScore} / {inspectStudent.maxScore}</strong> ({inspectStudent.percentage}%) • Violations: {inspectStudent.violationCount}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectStudent(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Selector Tabs */}
            <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex gap-2 overflow-x-auto shrink-0">
              {data?.assessment?.questions?.map((q: any, idx: number) => {
                const qScore = inspectStudent.questionScores?.[q.id] || { score: 0, status: "NONE" };
                const isSelected = activeQuestionId === q.id;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQuestionId(q.id);
                      setCopiedCode(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/50"
                        : "bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <span>Q{idx + 1}: {q.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        isSelected
                          ? "bg-emerald-700 text-white"
                          : qScore.score === q.marks
                          ? "bg-emerald-950 text-emerald-400"
                          : qScore.score > 0
                          ? "bg-amber-950 text-amber-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {qScore.score}/{q.marks}m
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeQuestion ? (
                <>
                  {/* Active Question Info Card */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-bold text-sm text-white">{activeQuestion.title}</h3>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {activeQuestion.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Max Marks: {activeQuestion.marks} • Time Limit: {activeQuestion.timeLimitSeconds || 3}s • Memory: {activeQuestion.memoryLimitMb || 256}MB
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className="text-xs text-slate-400 block">Score Awarded</span>
                        <span className="text-base font-bold text-emerald-400">
                          {activeSubmission ? activeSubmission.score : 0} / {activeQuestion.marks}
                        </span>
                      </div>

                      {activeSubmission && (
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                            activeSubmission.status === "ACCEPTED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : activeSubmission.status === "COMPILE_ERROR"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {activeSubmission.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CODING QUESTION CONTENT */}
                  {activeQuestion.type === "CODING" ? (
                    <div className="space-y-4">
                      {/* Code Block */}
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-300 font-semibold font-mono">
                            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Submitted {activeSubmission?.language || "JAVA"} Solution</span>
                          </div>

                          {activeSubmission?.code && (
                            <button
                              onClick={() => handleCopyCode(activeSubmission.code)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium text-[11px]"
                            >
                              {copiedCode ? (
                                <>
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {activeSubmission?.code ? (
                          <pre className="p-4 text-xs font-mono leading-relaxed text-emerald-300/90 overflow-x-auto max-h-96 select-text whitespace-pre">
                            {activeSubmission.code}
                          </pre>
                        ) : (
                          <div className="p-8 text-center text-slate-500 text-xs">
                            No code submitted for this question.
                          </div>
                        )}
                      </div>

                      {/* Test Case Evaluation Results */}
                      {activeSubmission && activeSubmission.testCaseResults && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              Test Cases Breakdown ({activeSubmission.passedTestCases || 0} / {activeSubmission.totalTestCases || 0} Passed)
                            </span>
                          </h4>

                          {(() => {
                            let results: any[] = [];
                            try {
                              results = JSON.parse(activeSubmission.testCaseResults || "[]");
                            } catch {
                              results = [];
                            }

                            if (results.length === 0) {
                              return <p className="text-xs text-slate-500">No test case telemetry available.</p>;
                            }

                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {results.map((r: any, rIdx: number) => (
                                  <div
                                    key={rIdx}
                                    className={`p-3.5 rounded-xl border space-y-2 text-xs font-mono ${
                                      r.passed
                                        ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                                        : "bg-rose-950/20 border-rose-900/40 text-rose-300"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold">
                                        Test Case #{rIdx + 1} {r.isPublic ? "(Public Sample)" : "(Closed Evaluation)"}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                          r.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                        }`}
                                      >
                                        {r.status || (r.passed ? "PASSED" : "FAILED")} ({r.executionTimeMs || 0}ms)
                                      </span>
                                    </div>

                                    {r.input && (
                                      <div>
                                        <span className="text-[10px] text-slate-500 block">Input:</span>
                                        <div className="bg-slate-950/80 p-1.5 rounded text-[11px] text-slate-300 whitespace-pre-wrap">
                                          {r.input}
                                        </div>
                                      </div>
                                    )}

                                    {r.expectedOutput && (
                                      <div>
                                        <span className="text-[10px] text-slate-500 block">Expected Output:</span>
                                        <div className="bg-slate-950/80 p-1.5 rounded text-[11px] text-slate-300 whitespace-pre-wrap">
                                          {r.expectedOutput}
                                        </div>
                                      </div>
                                    )}

                                    {r.stdout !== undefined && (
                                      <div>
                                        <span className="text-[10px] text-slate-500 block">Student's Output:</span>
                                        <div className="bg-slate-950/80 p-1.5 rounded text-[11px] text-slate-300 whitespace-pre-wrap">
                                          {r.stdout || "<No Output>"}
                                        </div>
                                      </div>
                                    )}

                                    {r.stderr && (
                                      <div>
                                        <span className="text-[10px] text-rose-400 block">Stderr / Diagnostics:</span>
                                        <div className="bg-rose-950/60 p-1.5 rounded text-[11px] text-rose-300 whitespace-pre-wrap">
                                          {r.stderr}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* MCQ QUESTION CONTENT */
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
                      <h4 className="font-bold text-white">MCQ Responses</h4>
                      {(() => {
                        let selected: string[] = [];
                        try {
                          selected = JSON.parse(activeSubmission?.selectedOptions || "[]");
                        } catch {
                          selected = [];
                        }

                        let options: any[] = [];
                        try {
                          options = JSON.parse(activeQuestion.options || "[]");
                        } catch {
                          options = [];
                        }

                        return (
                          <div className="space-y-2">
                            {options.map((opt: any) => {
                              const isChosen = selected.includes(opt.id);
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-xl border flex items-center justify-between ${
                                    isChosen
                                      ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300 font-semibold"
                                      : "bg-slate-900 border-slate-800 text-slate-400"
                                  }`}
                                >
                                  <span>{opt.text}</span>
                                  {isChosen && (
                                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                                      Selected
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
