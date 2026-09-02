import React, { useState } from "react";
import { api } from "../services/api";
import { Question, TestCaseEvaluationResult } from "../types";
import { MonacoCodeEditor } from "../components/editor/MonacoCodeEditor";
import {
  BookOpen,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Play,
  Award,
  AlertCircle,
  Clock,
  Terminal,
  FileCode,
  HelpCircle
} from "lucide-react";

interface StudentPracticeReviewProps {
  onBack: () => void;
}

export const StudentPracticeReview: React.FC<StudentPracticeReviewProps> = ({ onBack }) => {
  const [code, setCode] = useState<string>("JAVA-DEMO-101");
  const [rollNo, setRollNo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [reviewData, setReviewData] = useState<any | null>(null);
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number>(0);
  const [practiceCode, setPracticeCode] = useState<string>("");
  const [practiceLanguage, setPracticeLanguage] = useState<string>("JAVA");
  const [isPracticing, setIsPracticing] = useState<boolean>(false);
  const [practiceResults, setPracticeResults] = useState<any | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !rollNo) {
      setError("Please enter both Assessment Code and Roll Number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await api.getReviewData(code, rollNo);
      api.setAttemptToken(data.attemptToken || null);
      setReviewData(data);

      if (data.assessment?.questions?.length > 0) {
        const firstQ = data.assessment.questions[0];
        const sub = (data.attempt?.submissions || []).find((s: any) => s.questionId === firstQ.id);
        setPracticeCode(sub?.code || firstQ.starterCode || "");
        setPracticeLanguage(sub?.language || "JAVA");
      }
    } catch (err: any) {
      setError(err.message || "Could not retrieve review data.");
      setReviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (idx: number) => {
    setSelectedQuestionIdx(idx);
    setPracticeResults(null);
    const q = reviewData.assessment.questions[idx];
    const sub = (reviewData.attempt?.submissions || []).find((s: any) => s.questionId === q.id);
    setPracticeCode(sub?.code || q.starterCode || "");
    setPracticeLanguage(sub?.language || "JAVA");
  };

  const handleRunPractice = async () => {
    if (!activeQuestion || isPracticing) return;
    try {
      setIsPracticing(true);
      const attemptId = reviewData?.attempt?.id;
      if (!attemptId) {
        throw new Error("Review session is not initialized correctly.");
      }
      const res = await api.runCode(
        practiceLanguage,
        practiceCode,
        activeQuestion.id,
        attemptId,
        undefined,
        undefined
      );
      setPracticeResults(res.grading);
    } catch (err: any) {
      alert(err.message || "Execution error in practice mode");
    } finally {
      setIsPracticing(false);
    }
  };

  const activeQuestion: Question | undefined = reviewData?.assessment?.questions?.[selectedQuestionIdx];
  const activeSubmission = activeQuestion
    ? (reviewData?.attempt?.submissions || []).find((s: any) => s.questionId === activeQuestion.id)
    : null;

  let parsedSubmissionResults: TestCaseEvaluationResult[] = [];
  if (activeSubmission?.testCaseResults) {
    try {
      parsedSubmissionResults = JSON.parse(activeSubmission.testCaseResults);
    } catch {
      parsedSubmissionResults = [];
    }
  }

  // Parse MCQ options & correct answers for review
  let mcqOptions: any[] = [];
  let correctAnswers: string[] = [];
  let studentSelectedOptions: string[] = [];

  if (activeQuestion?.type === "MCQ") {
    try {
      mcqOptions = typeof activeQuestion.options === "string" ? JSON.parse(activeQuestion.options || "[]") : (activeQuestion.options || []);
      correctAnswers = typeof activeQuestion.correctAnswers === "string" ? JSON.parse(activeQuestion.correctAnswers || "[]") : (activeQuestion.correctAnswers || []);
      if (activeSubmission?.selectedOptions) {
        studentSelectedOptions = JSON.parse(activeSubmission.selectedOptions);
      } else if (reviewData?.attempt?.mcqResponses) {
        const mcqMap = JSON.parse(reviewData.attempt.mcqResponses);
        studentSelectedOptions = mcqMap[activeQuestion.id] || [];
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Post-Exam Practice & Review Mode (No SEB Required)</span>
            </h1>
            <p className="text-xs text-slate-400">
              Inspect your submitted solutions, learn from mistakes, and practice fixes in the sandbox.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {!reviewData ? (
          <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                <BookOpen className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">Find Your Exam Review</h2>
              <p className="text-xs text-slate-400">
                Enter your test details to access solution breakdowns and practice sandboxes.
              </p>
            </div>

            {error && (
              <div className="bg-rose-950/50 border border-rose-900 text-rose-300 text-xs rounded-xl p-3.5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Assessment Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. JAVA-DEMO-101"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono uppercase text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  placeholder="e.g. 21CS042"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono uppercase text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-amber-950/50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Looking up..." : "Load My Review & Practice"}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Score Summary Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                  Assessment Review & Practice
                </span>
                <h2 className="text-xl font-bold text-white">{reviewData.assessment.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Student: <strong className="text-slate-200">{reviewData.attempt.studentName}</strong> (Roll: {reviewData.attempt.rollNo})
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-slate-950 border border-slate-800 px-5 py-3 rounded-xl flex items-center gap-3">
                  <Award className="w-6 h-6 text-amber-400" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Score Earned</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {(reviewData.attempt.submissions || []).reduce((sum: number, s: any) => sum + s.score, 0).toFixed(1)} Marks
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setReviewData(null)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl transition"
                >
                  Change Student
                </button>
              </div>
            </div>

            {/* Question Selector Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
              {reviewData.assessment.questions.map((q: any, idx: number) => {
                const sub = (reviewData.attempt.submissions || []).find((s: any) => s.questionId === q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                      selectedQuestionIdx === idx
                        ? "bg-amber-600 text-white border-amber-500 shadow-md"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>Q{idx + 1} [{q.type}]</span>
                    <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded-full font-mono">
                      {sub ? `${sub.score}/${q.marks}m` : `0/${q.marks}m`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Question Review Workspace */}
            {activeQuestion && (
              activeQuestion.type === "MCQ" ? (
                /* MCQ Review View */
                <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                        MCQ Review
                      </span>
                      <h3 className="font-bold text-base text-white">{activeQuestion.title}</h3>
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      Score: {activeSubmission ? activeSubmission.score : 0} / {activeQuestion.marks}m
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap">
                    {activeQuestion.description}
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase text-slate-400 block">Options & Evaluation:</span>
                    {mcqOptions.map((opt, idx) => {
                      const isStudentSelected = studentSelectedOptions.includes(opt.id);
                      const isCorrect = correctAnswers.includes(opt.id);

                      let cardStyle = "bg-slate-950 border-slate-800 text-slate-300";
                      if (isCorrect) {
                        cardStyle = "bg-emerald-950/30 border-emerald-500/80 text-emerald-300";
                      } else if (isStudentSelected && !isCorrect) {
                        cardStyle = "bg-rose-950/30 border-rose-500/80 text-rose-300";
                      }

                      return (
                        <div key={opt.id} className={`p-4 rounded-xl border flex items-center justify-between text-xs ${cardStyle}`}>
                          <div className="flex items-center gap-3">
                            <span className="font-bold font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-200">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          <div className="flex items-center gap-2 font-semibold text-[11px]">
                            {isStudentSelected && (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">Your Choice</span>
                            )}
                            {isCorrect && (
                              <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Correct Answer</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activeQuestion.explanation && (
                    <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 text-xs space-y-1 text-amber-300">
                      <strong className="block font-bold text-amber-200">Explanation & Walkthrough:</strong>
                      <p className="leading-relaxed">{activeQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Coding Review & Interactive Sandbox View */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Problem & Test Case Diff */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <h3 className="font-bold text-base text-white">{activeQuestion.title}</h3>
                      <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {activeQuestion.description}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Exam Test Case Breakdown</span>
                        <span className="font-mono text-emerald-400">
                          {activeSubmission ? `${activeSubmission.passedTestCases}/${activeSubmission.totalTestCases} Passed` : "0 Passed"}
                        </span>
                      </h4>

                      <div className="space-y-3">
                        {parsedSubmissionResults.map((tc, idx) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                              tc.passed
                                ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                                : "bg-rose-950/20 border-rose-900/40 text-rose-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5">
                                {tc.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                                <span>Test Case {idx + 1} {!tc.isPublic && "(Hidden Case)"}</span>
                              </span>
                              <span className="font-mono text-[11px]">
                                {tc.passed ? `+${tc.scoreAwarded.toFixed(1)}m` : "0m"}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-semibold opacity-75 block">Input:</span>
                              <pre className="bg-slate-950/60 p-2 rounded font-mono text-[11px] overflow-x-auto">{tc.input}</pre>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-semibold opacity-75 block">Expected Output:</span>
                              <pre className="bg-slate-950/60 p-2 rounded font-mono text-[11px] overflow-x-auto">{tc.expectedOutput}</pre>
                            </div>

                            {!tc.passed && tc.stdout && (
                              <div>
                                <span className="text-[10px] uppercase font-semibold text-rose-400 block">Your Output:</span>
                                <pre className="bg-rose-950/40 p-2 rounded font-mono text-[11px] text-rose-300 overflow-x-auto">{tc.stdout}</pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Practice Sandbox */}
                  <div className="lg:col-span-7 space-y-4 flex flex-col">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col min-h-[500px]">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">Interactive Practice Sandbox</span>
                          <select
                            value={practiceLanguage}
                            onChange={(e) => setPracticeLanguage(e.target.value)}
                            className="bg-slate-950 text-amber-400 font-bold border border-slate-700 rounded-lg px-2.5 py-1 text-xs"
                          >
                            <option value="JAVA">Java (JDK 21)</option>
                            <option value="C">C (C11)</option>
                            <option value="CPP">C++ (C++17)</option>
                          </select>
                        </div>

                        <button
                          onClick={handleRunPractice}
                          disabled={isPracticing}
                          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-amber-950/50"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isPracticing ? "Running..." : "Test Practice Fix"}</span>
                        </button>
                      </div>

                      <div className="flex-1 my-3 min-h-[350px]">
                        <MonacoCodeEditor
                          code={practiceCode}
                          language={practiceLanguage}
                          onChange={setPracticeCode}
                        />
                      </div>

                      {practiceResults && (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-300">Practice Run Results:</span>
                            <span className={practiceResults.passedTestCases === practiceResults.totalTestCases ? "text-emerald-400" : "text-rose-400"}>
                              {practiceResults.passedTestCases}/{practiceResults.totalTestCases} Test Cases Passed
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
};
