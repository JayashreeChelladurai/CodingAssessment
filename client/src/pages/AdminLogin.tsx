import React, { useState } from "react";
import { api } from "../services/api";
import { ShieldCheck, Lock, ArrowLeft, KeyRound, AlertCircle, Sparkles } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [passcode, setPasscode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setError("Please enter the professor security passcode.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.adminLogin(passcode);
      if (res.success && res.token) {
        localStorage.setItem("prof_admin_token", res.token);
        onLoginSuccess(res.token);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Access restricted to authorized instructors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Portal</span>
        </button>
      </header>

      {/* Main Card */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-900/40 rounded-3xl p-8 shadow-2xl shadow-slate-950/80 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Instructor Access</h2>
            <p className="text-xs text-slate-400">
              Enter your master passcode to access the exam invigilation dashboard and gradebook.
            </p>
          </div>

          {error && (
            <div className="bg-rose-950/50 border border-rose-900 text-rose-300 text-xs rounded-xl p-3.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Professor Security Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-emerald-950/50"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Unlock Instructor Portal"}</span>
            </button>
          </form>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-slate-500">Default Lab Passcode:</span>
            <span className="font-mono text-emerald-400 font-bold">admin123</span>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4">
        Protected Instructor Subsystem &bull; ProctorJava Platform
      </footer>
    </div>
  );
};
