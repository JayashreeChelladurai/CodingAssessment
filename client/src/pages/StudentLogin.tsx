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
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus,
  LogIn,
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
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Assessment entry state
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

  // Registration state
  const [regRollNo, setRegRollNo] = useState<string>("");
  const [regName, setRegName] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>("");
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  // Status & feedback
  const [isExistingStudent, setIsExistingStudent] = useState<boolean | null>(null);
  const [checkingStudent, setCheckingStudent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // SEB Gatekeeper state
  const [showSebGatekeeper, setShowSebGatekeeper] = useState<boolean>(false);
  const [assessmentInfo, setAssessmentInfo] = useState<any | null>(null);

  // Debounced roll number registration check (for Enter Assessment tab)
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
          // Pre-populate name if empty, but leave it completely editable!
          if (res.name && !studentName.trim()) {
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

  // Handle Assessment Entry
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!code.trim() || !rollNo.trim() || !studentName.trim() || !password) {
      setError("Please fill in Assessment Code, Roll Number, Full Name, and Password.");
      return;
    }

    try {
      setLoading(true);
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
      const msg = err.message || "Failed to start assessment";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle One-Time Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const cleanRoll = regRollNo.trim().toUpperCase();
    const cleanName = regName.trim();

    if (!cleanRoll || !cleanName || !regPassword) {
      setError("Please fill in Roll Number, Full Name, and Password.");
      return;
    }

    if (cleanRoll.length < 2) {
      setError("Roll Number must be at least 2 characters.");
      return;
    }

    if (cleanName.length < 2) {
      setError("Full Name must be at least 2 characters.");
      return;
    }

    if (regPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.registerStudent(cleanRoll, cleanName, regPassword);
      setSuccessMessage(
        `Roll number '${res.student?.rollNo || cleanRoll}' registered successfully! You can now enter your assessment.`
      );
      // Transfer registered credentials to login form
      setRollNo(cleanRoll);
      setStudentName(cleanName);
      setPassword(regPassword);
      setIsExistingStudent(true);
      // Clear registration passwords
      setRegPassword("");
      setRegConfirmPassword("");
      // Switch back to assessment entry tab
      setActiveTab("login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchToRegistration = (initialRoll?: string) => {
    setError("");
    setSuccessMessage("");
    if (initialRoll) {
      setRegRollNo(initialRoll);
    } else if (rollNo) {
      setRegRollNo(rollNo);
    }
    if (studentName) {
      setRegName(studentName);
    }
    setActiveTab("register");
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
      <main className="max-w-md w-full mx-auto my-6">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/80 space-y-6">
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
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Student Portal</h2>
            <p className="text-xs text-slate-400">
              {activeTab === "login"
                ? "Enter your assessment code, roll number, and password"
                : "Register your student credentials once for all assessments"}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError("");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "login"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Enter Assessment</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setError("");
                setSuccessMessage("");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "register"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>One-Time Registration</span>
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs rounded-xl p-3.5 flex items-start gap-2.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-rose-950/50 border border-rose-900/70 text-rose-300 text-xs rounded-xl p-3.5 flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {error.toLowerCase().includes("not registered") && activeTab === "login" && (
                  <button
                    type="button"
                    onClick={() => switchToRegistration(rollNo)}
                    className="block mt-2 text-xs font-semibold text-emerald-400 underline hover:text-emerald-300"
                  >
                    Click here to register roll number '{rollNo}' &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: Enter Assessment */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Assessment Code */}
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
                      <span>Registered</span>
                    </span>
                  )}
                  {isExistingStudent === false && rollNo.trim().length >= 2 && (
                    <button
                      type="button"
                      onClick={() => switchToRegistration(rollNo)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full hover:bg-amber-900/60 transition"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Not registered &bull; Click to Register</span>
                    </button>
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
                  <span className="text-[10px] text-slate-400">
                    Spelling/initial differences accepted
                  </span>
                </div>
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

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Exact registered password
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your student password"
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
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || checkingStudent}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-emerald-950/50"
                >
                  <span>{loading ? "Authenticating..." : "Enter Assessment"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchToRegistration()}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  First time taking an exam? <span className="font-semibold text-emerald-400 underline">Register once here</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: One-Time Registration */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 leading-relaxed">
                💡 <span className="text-slate-200 font-medium">One-Time Registration:</span> You only register once. Your Roll Number and Password will be used to access all assessments securely.
              </div>

              {/* Registration Roll Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Roll Number
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regRollNo}
                    onChange={(e) => setRegRollNo(e.target.value.toUpperCase())}
                    placeholder="e.g. 21CS042"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono uppercase text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Registration Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Registration Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Create Password
                  </label>
                  <span className="text-[10px] text-slate-400">Min 4 characters</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                    tabIndex={-1}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
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
                  <span>{loading ? "Registering..." : "Complete One-Time Registration"}</span>
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setError("");
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition"
                >
                  Already registered? <span className="font-semibold text-emerald-400 underline">Enter Assessment</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4">
        ProctorExam Academic Platform &copy; 2026 &bull; Safe Exam Browser Kiosk Engine
      </footer>
    </div>
  );
};
