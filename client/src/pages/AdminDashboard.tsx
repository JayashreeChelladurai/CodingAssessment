import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Assessment } from "../types";
import {
  ShieldCheck,
  Plus,
  Play,
  FileSpreadsheet,
  Edit,
  Trash2,
  Copy,
  Users,
  Clock,
  Code2,
  Sparkles,
  GraduationCap,
  Download,
  Shield,
  Layers,
  HelpCircle
} from "lucide-react";

interface AdminDashboardProps {
  onNavigateToLive: (assessment: Assessment) => void;
  onNavigateToGradebook: (assessment: Assessment) => void;
  onNavigateToEditor: (assessment?: Assessment | null) => void;
  onNavigateToStudent: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToLive,
  onNavigateToGradebook,
  onNavigateToEditor,
  onNavigateToStudent,
}) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await api.getAssessments();
      setAssessments(data);
    } catch (err) {
      console.error("Failed to load assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (id: string) => {
    try {
      setLoading(true);
      const cloned = await api.cloneAssessment(id);
      await loadAssessments();
      alert(`Assessment cloned successfully as '${cloned.code}'!`);
    } catch (err: any) {
      alert(err.message || "Failed to clone assessment");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete assessment '${code}'? All student submissions and violations will be removed.`)) {
      try {
        await api.deleteAssessment(id);
        loadAssessments();
      } catch (err: any) {
        alert(err.message || "Failed to delete assessment");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">Instructor Exam Portal</h1>
            <p className="text-xs text-slate-400">SEB Lockdown, Hybrid MCQs + Coding, & Live Proctoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Student Exam View</span>
          </button>

          <button
            onClick={() => onNavigateToEditor(null)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assessment</span>
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("prof_admin_token");
              onNavigateToStudent();
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 transition border border-rose-800/40"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/40 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Safe Exam Browser (SEB) Assessment Hub</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Hosted Exams & Invigilation</h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Conduct secure exams with SEB configuration files, Section-Based MCQs, Java/C/C++ problems, and 1-Click live student unlocking.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-950/70 border border-slate-800 px-5 py-3 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Assessments</span>
              <span className="text-xl font-bold font-mono text-white">{assessments.length}</span>
            </div>
          </div>
        </div>

        {/* Assessments List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Active Assessments</h3>
            <span className="text-xs text-slate-400 font-mono">{assessments.length} Hosted</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">Loading assessments...</div>
          ) : assessments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Code2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">No Assessments Created Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click below to create your first hybrid exam with Sections, MCQs, Java/C/C++ coding questions, and SEB configuration.
              </p>
              <button
                onClick={() => onNavigateToEditor(null)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Assessment</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((ass) => {
                const totalAttempts = ass.attempts?.length || 0;
                const mcqCount = (ass.questions || []).filter((q) => q.type === "MCQ").length;
                const codingCount = (ass.questions || []).filter((q) => q.type === "CODING").length;
                const sebDownloadUrl = api.getSebConfigUrl(ass.id);

                return (
                  <div
                    key={ass.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition shadow-lg flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              {ass.code}
                            </span>
                            {ass.requireSeb && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                <Shield className="w-3 h-3 text-rose-400" />
                                <span>SEB Required</span>
                              </span>
                            )}
                            {ass.isReviewUnlocked && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Review Active
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-base text-white">{ass.title}</h4>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onNavigateToEditor(ass)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                            title="Edit Assessment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleClone(ass.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition"
                            title="Duplicate / Clone Assessment"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ass.id, ass.code)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                            title="Delete Assessment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {ass.description || "No description provided."}
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{ass.durationMinutes} mins</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>{mcqCount} MCQs</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{codingCount} Coding</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-emerald-400">{totalAttempts} Candidates</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onNavigateToLive(ass)}
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition shadow-md shadow-emerald-950/40"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Live Proctoring</span>
                        </button>

                        <button
                          onClick={() => onNavigateToGradebook(ass)}
                          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl transition border border-slate-700"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Gradebook</span>
                        </button>
                      </div>

                      {/* Download .seb file button */}
                      <a
                        href={sebDownloadUrl}
                        download
                        className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-rose-300 hover:text-white border border-rose-900/40 text-xs font-semibold py-2 px-3 rounded-xl transition"
                      >
                        <Download className="w-3.5 h-3.5 text-rose-400" />
                        <span>Download .{ass.code}.seb Config Launcher</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
