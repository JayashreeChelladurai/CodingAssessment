import React, { useState } from "react";
import { api } from "../services/api";
import { SebGatekeeper } from "../components/seb/SebGatekeeper";
import { ShieldCheck, BookOpen, GraduationCap, ArrowRight, User, Hash, KeyRound, Sparkles, Download, Shield } from "lucide-react";

interface StudentLoginProps {
  onStartExam: (data: { attempt: any; assessment: any }) => void;
  onNavigateToPractice: () => void;
  onNavigateToAdmin: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onStartExam,
  onNavigateToPractice,
  onNavigateToAdmin,
}) => {
  const [code, setCode] = useState<string>(() => {
    try {
      const urlCode = new URLSearchParams(window.location.search).get("code");
      return urlCode ? urlCode.toUpperCase() : "JAVA-DEMO-101";
    } catch {
      return "JAVA-DEMO-101";
    }
  });
  const [rollNo, setRollNo] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // SEB Gatekeeper state
  const [showSebGatekeeper, setShowSebGatekeeper] = useState<boolean>(false);
  const [assessmentInfo, setAssessmentInfo] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !rollNo || !studentName) {
      setError("Please fill in all fields (Test Code, Roll Number, and Name).");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Check SEB status first
      const info = await api.getAssessmentInfo(code);
      if (info.assessment.requireSeb && !info.isSeb) {
        setAssessmentInfo(info.assessment);
        setShowSebGatekeeper(true);
        setLoading(false);
        return;
      }

      const res = await api.startAssessment(code, rollNo, studentName);
      api.setAttemptToken(res.attemptToken || null);
      onStartExam(res);
    } catch (err: any) {
      setError(err.message || "Failed to start assessment");
    } finally {
      setLoading(false);
    }
  };

  if (showSebGatekeeper && assessmentInfo) {
    return (
      <SebGatekeeper
        assessment={assessmentInfo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">ProctorExam Assessment Platform</h1>
            <p className="text-xs text-slate-400">Secure Institutional Exam Environment</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToPractice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Practice & Review</span>
          </button>

          <button
            onClick={onNavigateToAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 transition border border-emerald-800/40"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Professor Portal</span>
          </button>
        </div>
      </header>

      {/* Main Entry Card */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-950/80 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
              <Shield className="w-3 h-3" />
              <span>Safe Exam Browser Verified</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Student Exam Login</h2>
            <p className="text-xs text-slate-400">Enter your assessment code and roll number to enter the exam</p>
          </div>

          {error && (
            <div className="bg-rose-950/50 border border-rose-900/70 text-rose-300 text-xs rounded-xl p-3.5 leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Assessment Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. JAVA-DEMO-101"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono uppercase text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Roll Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  placeholder="e.g. 21CS042"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono uppercase text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-emerald-950/50"
              >
                <span>{loading ? "Verifying..." : "Enter Assessment"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4">
        ProctorExam Academic Platform &copy; 2026 &bull; Safe Exam Browser Kiosk Engine
      </footer>
    </div>
  );
};
