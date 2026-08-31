import React from "react";
import { Lock, AlertOctagon, RefreshCw, ShieldCheck } from "lucide-react";

interface LockoutScreenProps {
  rollNo: string;
  studentName: string;
  lockReason: string;
  violationCount: number;
}

export const LockoutScreen: React.FC<LockoutScreenProps> = ({
  rollNo,
  studentName,
  lockReason,
  violationCount,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-lg w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-rose-950/40 space-y-6 relative overflow-hidden">
        {/* Top Glowing Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500"></div>

        <div className="relative">
          <div className="w-20 h-20 bg-rose-500/10 text-rose-400 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/30 animate-pulse">
            <Lock className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 right-1/2 translate-x-8 bg-rose-600 text-white rounded-full p-1 border-2 border-slate-900">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Assessment Locked
          </h2>
          <p className="text-sm text-rose-300 font-medium">
            Proctor Security Triggered: {lockReason || "Window focus loss or tab switch detected"}
          </p>
        </div>

        <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 text-left space-y-3 text-sm">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
            <span className="text-slate-400">Student Name</span>
            <span className="font-semibold text-slate-200">{studentName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
            <span className="text-slate-400">Roll Number</span>
            <span className="font-mono font-semibold text-emerald-400">{rollNo}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total Violations</span>
            <span className="font-mono font-bold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800/50">
              {violationCount}
            </span>
          </div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 flex items-start gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-300 space-y-1">
            <p className="font-semibold text-emerald-200">Your code draft is safe</p>
            <p className="text-emerald-400/80">
              All your written code has been auto-saved to the server. Your timer is currently paused.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-2">
          <RefreshCw className="w-4 h-4 text-slate-500 animate-spin" />
          <span>Waiting for your professor to resume your assessment...</span>
        </div>
      </div>
    </div>
  );
};
