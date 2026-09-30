import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { SebGatekeeper } from "../components/seb/SebGatekeeper";
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  ArrowRight,
  User,
  Hash,
  KeyRound,
  Sparkles,
  Download,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

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
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isExistingStudent, setIsExistingStudent] = useState<boolean | null>(null);
  const [checkingStudent, setCheckingStudent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // SEB Gatekeeper state
  const [showSebGatekeeper, setShowSebGatekeeper] = useState<boolean>(false);
  const [assessmentInfo, setAssessmentInfo] = useState<any | null>(null);

  // Debounced roll number registration check
  useEffect(() => {
    const clean = rollNo.trim().toUpperCase();
    if (clean.length < 2) {
      setIsExistingStudent(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingStudent(true);
        const res = await api.checkStudent(clean);
        if (res.exists) {
          setIsExistingStudent(true);
          if (res.name) {
            setStudentName(res.name);
          }
        } else {
          setIsExistingStudent(false);
        }
      } catch {
        // ignore
      } finally {
        setCheckingStudent(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [rollNo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !rollNo || !password) {
      setError("Please fill in Assessment Code, Roll Number, and Password.");
      return;
    }

    if (!isExistingStudent && !studentName.trim()) {
      setError("Please enter your Full Name for registration.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const isClientSeb = typeof navigator !== "undefined" && /SafeExamBrowser|SEB/i.test(navigator.userAgent);

      // Check SEB status first
      const info = await api.getAssessmentInfo(code);
      if (info.assessment.requireSeb && !info.isSeb && !isClientSeb) {
        setAssessmentInfo(info.assessment);
        setShowSebGatekeeper(true);
        setLoading(false);
        return;
      }

      const res = await api.startAssessment(code, rollNo, studentName, password);
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
        onBack={() => setShowSebGatekeeper(false)}
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
            {typeof navigator !== "undefined" && /SafeExamBrowser|SEB/i.test(navigator.userAgent) ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Safe Exam Browser Detected</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
                <Shield className="w-3 h-3" />
                <span>SEB Required for Exam Entry</span>
              </div>
            )}
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

            {/* Roll Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Roll Number
                </label>
                {checkingStudent && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                    <span>Checking...</span>
                  </span>
                )}
                {isExistingStudent === true && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Registered Account</span>
                  </span>
                )}
                {isExistingStudent === false && rollNo.trim().length >= 2 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    <span>New Registration</span>
                  </span>
                )}
              </div>
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

            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Full Name
                </label>
                {isExistingStudent && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Bound to Roll No</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  readOnly={Boolean(isExistingStudent)}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 ${
                    isExistingStudent ? "bg-slate-900/60 text-slate-300 cursor-not-allowed border-slate-800" : ""
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {isExistingStudent ? "Student Password" : "Set Account Password"}
                </label>
                <span className="text-[10px] text-slate-400">
                  {isExistingStudent ? "Registered password" : "Min 4 characters"}
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isExistingStudent ? "Enter your password" : "Create password (remember for all exams)"}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isExistingStudent && rollNo.trim().length >= 2 && (
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  🔒 This password will be securely bound to your Roll Number so nobody else can take your exams.
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || checkingStudent}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-emerald-950/50"
              >
                <span>
                  {loading
                    ? "Authenticating..."
                    : isExistingStudent
                    ? "Verify & Enter Assessment"
                    : "Register & Enter Assessment"}
                </span>
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
