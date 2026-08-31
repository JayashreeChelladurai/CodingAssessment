import React from "react";
import { ShieldCheck, Play, Download, ExternalLink, Sparkles, Laptop, Rocket, KeyRound, Monitor } from "lucide-react";
import { api } from "../../services/api";

interface SebGatekeeperProps {
  assessment: any;
  onBypassForTesting: () => void;
}

export const SebGatekeeper: React.FC<SebGatekeeperProps> = ({
  assessment,
  onBypassForTesting,
}) => {
  const sebDownloadUrl = api.getSebConfigUrl(assessment.id);

  // Construct seb:// protocol link for 1-click launch of pre-installed SEB without file download
  const host = window.location.host;
  const protocol = window.location.protocol.replace(":", "");
  const sebProtocolUrl = `${protocol === "https" ? "sebs" : "seb"}://${host}/?code=${encodeURIComponent(assessment.code)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-4 sm:p-8 text-slate-100">
      <div className="max-w-2xl w-full mx-auto my-auto space-y-6">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-900/50 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-950/30 space-y-6 text-center relative overflow-hidden">
          {/* Top banner strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>

          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Safe Exam Browser (SEB) Direct Launch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {assessment.title}
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              This exam is locked to Safe Exam Browser. You can launch your pre-installed SEB directly or open SEB from your Applications.
            </p>
          </div>

          {/* Assessment Badges */}
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Assessment Code</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{assessment.code}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Duration</span>
              <span className="font-bold text-white text-sm">{assessment.durationMinutes} Minutes</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Marks</span>
              <span className="font-bold text-emerald-400 text-sm">{assessment.totalMarks || 100} Marks</span>
            </div>
          </div>

          {/* Option 1: 1-Click Launch Pre-installed SEB */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span>Option 1: Open Pre-Installed SEB Automatically</span>
              </h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-800/40">
                Recommended
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Click below to launch the Safe Exam Browser application installed on this PC directly (no file download needed):
            </p>

            <a
              href={sebProtocolUrl}
              className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-emerald-950/60 text-sm"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Launch Pre-Installed Safe Exam Browser</span>
            </a>
          </div>

          {/* Option 2: Open SEB from Start Menu / Applications */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 text-left space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-teal-400" />
              <span>Option 2: Open SEB Manually from Start Menu / Applications</span>
            </h3>

            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <li>
                Open <strong>Safe Exam Browser</strong> from your computer's Desktop, Start Menu, or Applications folder.
              </li>
              <li>
                Enter your Assessment Code: <strong className="text-emerald-400 font-mono">{assessment.code}</strong> and your Roll Number to begin.
              </li>
            </ol>
          </div>

          {/* Fallback download & install links */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <a
              href={sebDownloadUrl}
              download
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 text-[11px] underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .seb File (Fallback)</span>
            </a>

            <a
              href="https://safeexambrowser.org/download_en.html"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold underline text-[11px]"
            >
              <span>Download SEB Installer for Windows / Mac</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Dev/Preview bypass */}
          <div className="pt-1">
            <button
              onClick={onBypassForTesting}
              className="text-[11px] text-slate-500 hover:text-slate-300 underline transition"
            >
              Preview & Test in Standard Browser (Development Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
