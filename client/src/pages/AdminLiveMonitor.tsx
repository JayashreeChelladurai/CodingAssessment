import React, { useState, useEffect } from "react";
import { getSocket } from "../services/socket";
import { StudentAttempt, Assessment } from "../types";
import {
  ArrowLeft,
  Unlock,
  AlertTriangle,
  Radio,
  Clock,
  CheckCircle2,
  Lock,
  User,
  Hash,
  Sparkles,
  Plus
} from "lucide-react";

interface AdminLiveMonitorProps {
  assessment: Assessment;
  onBack: () => void;
  onNavigateToGradebook: () => void;
}

export const AdminLiveMonitor: React.FC<AdminLiveMonitorProps> = ({
  assessment,
  onBack,
  onNavigateToGradebook,
}) => {
  const [students, setStudents] = useState<StudentAttempt[]>([]);
  const [violationAlerts, setViolationAlerts] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentAttempt | null>(null);
  const [extraMinutes, setExtraMinutes] = useState<number>(0);

  useEffect(() => {
    const socket = getSocket();

    socket.emit("admin:join", assessment.id);

    socket.on("admin:students_list", (list: StudentAttempt[]) => {
      setStudents(list);
    });

    socket.on("admin:student_updated", (updated: StudentAttempt) => {
      setStudents((prev) => {
        const idx = prev.findIndex((s) => s.id === updated.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [updated, ...prev];
      });

      if (selectedStudent?.id === updated.id) {
        setSelectedStudent(updated);
      }
    });

    socket.on("admin:violation_alert", ({ attempt, violation }: any) => {
      setViolationAlerts((prev) => [
        {
          id: violation.id,
          studentName: attempt.studentName,
          rollNo: attempt.rollNo,
          violationType: violation.violationType,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 10),
      ]);
    });

    return () => {
      socket.off("admin:students_list");
      socket.off("admin:student_updated");
      socket.off("admin:violation_alert");
    };
  }, [assessment.id, selectedStudent?.id]);

  const handleResumeStudent = (attemptId: string) => {
    const socket = getSocket();
    socket.emit("admin:resume_student", {
      attemptId,
      assessmentId: assessment.id,
      extraMinutes,
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  const activeCount = students.filter((s) => s.status === "IN_PROGRESS").length;
  const lockedCount = students.filter((s) => s.status === "LOCKED_OUT").length;
  const submittedCount = students.filter((s) => s.status === "SUBMITTED").length;

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
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Radio className="w-3 h-3 animate-pulse text-rose-500" />
                <span>LIVE PROCTORING</span>
              </span>
              <h1 className="font-bold text-base text-white">{assessment.title}</h1>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Test Code: {assessment.code}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToGradebook}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950/50"
          >
            View Gradebook & Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Joined</span>
              <p className="text-2xl font-bold font-mono text-white">{students.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-400 uppercase font-semibold">Working Actively</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/50 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-rose-400 uppercase font-semibold">Locked Out</span>
              <p className="text-2xl font-bold font-mono text-rose-400">{lockedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-950/50 text-rose-400 flex items-center justify-center border border-rose-800/40">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-400 uppercase font-semibold">Submitted</span>
              <p className="text-2xl font-bold font-mono text-blue-400">{submittedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-950/50 text-blue-400 flex items-center justify-center border border-blue-800/40">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Live Proctor Grid & Alert Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Students Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-white">Active Student Proctoring Grid</h2>
                <span className="text-xs text-slate-400 font-mono">{students.length} Candidates</span>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No students currently taking this assessment. Share test code <strong className="text-slate-300 font-mono">{assessment.code}</strong> to begin.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {students.map((st) => {
                    const isLocked = st.status === "LOCKED_OUT";
                    const isSubmitted = st.status === "SUBMITTED";
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStudent(st)}
                        className={`cursor-pointer p-4 rounded-xl border transition space-y-3 ${
                          isLocked
                            ? "bg-rose-950/20 border-rose-900/60 shadow-lg shadow-rose-950/30"
                            : isSubmitted
                            ? "bg-slate-900/60 border-slate-800 text-slate-400"
                            : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                              <span>{st.studentName}</span>
                            </h3>
                            <span className="font-mono text-xs text-slate-400">{st.rollNo}</span>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isLocked
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                                : isSubmitted
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {st.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-mono">{formatTimer(st.remainingSeconds)}</span>
                          </div>

                          {st.violationCount > 0 && (
                            <span className="flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{st.violationCount} Violations</span>
                            </span>
                          )}
                        </div>

                        {/* 1-Click Unlock Action if locked */}
                        {isLocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResumeStudent(st.id);
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 rounded-lg text-xs transition shadow-md shadow-rose-950/40"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>1-Click Unlock & Resume Student</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Violation Alert Feed & Student Details (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Live Infractions Stream */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Live Infraction Feed</span>
              </h3>

              {violationAlerts.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No security infractions detected yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {violationAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-2.5 text-xs text-rose-300 space-y-1"
                    >
                      <div className="flex justify-between items-center font-semibold">
                        <span>{alert.studentName} ({alert.rollNo})</span>
                        <span className="text-[10px] text-rose-400/80">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-rose-400 font-mono">
                        Violation: {alert.violationType}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Student Action Card */}
            {selectedStudent && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Student Management
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name:</span>
                    <span className="font-bold text-white">{selectedStudent.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Roll No:</span>
                    <span className="font-mono text-emerald-400">{selectedStudent.rollNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold">{selectedStudent.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Violations:</span>
                    <span className="text-rose-400 font-bold">{selectedStudent.violationCount}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Grant Extra Time upon Resume (optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExtraMinutes(0)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        extraMinutes === 0 ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      0m
                    </button>
                    <button
                      onClick={() => setExtraMinutes(5)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        extraMinutes === 5 ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      +5m
                    </button>
                    <button
                      onClick={() => setExtraMinutes(10)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        extraMinutes === 10 ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      +10m
                    </button>
                  </div>

                  <button
                    onClick={() => handleResumeStudent(selectedStudent.id)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-950/50"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unlock & Resume Assessment</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
