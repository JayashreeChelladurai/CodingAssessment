import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  KeyRound,
  Trash2,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Copy,
  UserCheck,
} from "lucide-react";
import { api } from "../../services/api";

interface StudentAccount {
  id: string;
  rollNo: string;
  name: string;
  createdAt: string;
}

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Add Student State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newRollNo, setNewRollNo] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);

  // Reset Password State
  const [resettingRollNo, setResettingRollNo] = useState<string | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState<string>("");
  const [savingReset, setSavingReset] = useState<boolean>(false);

  // Copied indicator
  const [copiedRollNo, setCopiedRollNo] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getRegisteredStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load student roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      setShowAddForm(false);
      setResettingRollNo(null);
      setError("");
      setSuccessMsg("");
    }
  }, [isOpen]);

  const handleCopyRollNo = (rollNo: string) => {
    navigator.clipboard.writeText(rollNo);
    setCopiedRollNo(rollNo);
    setTimeout(() => setCopiedRollNo(null), 2000);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRollNo.trim() || !newName.trim() || !newPassword.trim()) {
      setError("Please fill in Roll Number, Full Name, and Password.");
      return;
    }

    try {
      setAdding(true);
      setError("");
      await api.createStudent(newRollNo.trim(), newName.trim(), newPassword.trim());
      setSuccessMsg(`Student '${newRollNo.trim().toUpperCase()}' created successfully!`);
      setNewRollNo("");
      setNewName("");
      setNewPassword("");
      setShowAddForm(false);
      await fetchStudents();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to register student");
    } finally {
      setAdding(false);
    }
  };

  const handleResetPassword = async (rollNo: string) => {
    if (!resetPasswordInput.trim() || resetPasswordInput.trim().length < 4) {
      setError("New password must be at least 4 characters long.");
      return;
    }

    try {
      setSavingReset(true);
      setError("");
      await api.resetStudentPassword(rollNo, resetPasswordInput.trim());
      setSuccessMsg(`Password for ${rollNo} updated successfully!`);
      setResettingRollNo(null);
      setResetPasswordInput("");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setSavingReset(false);
    }
  };

  const handleAllowReRegister = async (rollNo: string) => {
    if (!window.confirm(`Clear registration for ${rollNo}? The student will be allowed to re-register with a new password on their next login.`)) {
      return;
    }

    try {
      setSavingReset(true);
      setError("");
      await api.resetStudentPassword(rollNo, undefined);
      setSuccessMsg(`Registration for ${rollNo} cleared. The student can now re-register.`);
      setResettingRollNo(null);
      await fetchStudents();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to reset registration");
    } finally {
      setSavingReset(false);
    }
  };

  const handleDeleteStudent = async (rollNo: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete student account '${rollNo}'?`)) {
      return;
    }

    try {
      setError("");
      await api.deleteStudent(rollNo);
      setSuccessMsg(`Student '${rollNo}' removed.`);
      await fetchStudents();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to delete student");
    }
  };

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Student Accounts & Passwords</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {students.length} Registered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                View student roll numbers, reset forgotten passwords, or manually register new candidates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Roll Number or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStudents()}
              disabled={loading}
              title="Refresh roster"
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                showAddForm
                  ? "bg-slate-800 text-slate-300 border border-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
              }`}
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showAddForm ? "Cancel" : "Add Student"}</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-rose-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Collapsible Add Student Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddStudent}
            className="m-6 p-4 rounded-2xl bg-slate-800/60 border border-emerald-500/30 space-y-4"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>Register New Student Account</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 21CS004"
                  value={newRollNo}
                  onChange={(e) => setNewRollNo(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. David Miller"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="text"
                  placeholder="e.g. pass123"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
              >
                {adding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Create Student</span>
              </button>
            </div>
          </form>
        )}

        {/* Student List Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              <p className="text-xs">Loading registered students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No registered students found</p>
              <p className="text-xs text-slate-500">
                {searchQuery ? "Try searching with a different term." : "Students will appear here once they register or when you add them above."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/40">
              {filteredStudents.map((st) => {
                const isResetting = resettingRollNo === st.rollNo;

                return (
                  <div key={st.id} className="p-4 hover:bg-slate-800/30 transition flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            {st.rollNo}
                          </span>
                          <button
                            onClick={() => handleCopyRollNo(st.rollNo)}
                            title="Copy Roll Number"
                            className="p-1 rounded text-slate-500 hover:text-slate-300 transition"
                          >
                            {copiedRollNo === st.rollNo ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white">{st.name}</div>
                          <div className="text-xs text-slate-500">
                            Registered: {new Date(st.createdAt).toLocaleDateString()} at{" "}
                            {new Date(st.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isResetting) {
                              setResettingRollNo(null);
                              setResetPasswordInput("");
                            } else {
                              setResettingRollNo(st.rollNo);
                              setResetPasswordInput("");
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                            isResetting
                              ? "bg-amber-950/40 text-amber-300 border-amber-800/40"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                          }`}
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isResetting ? "Cancel Reset" : "Reset Password"}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteStudent(st.rollNo)}
                          title="Delete student"
                          className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition border border-transparent hover:border-rose-900/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Password Reset Box */}
                    {isResetting && (
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-amber-500/30 space-y-2 animate-fade-in">
                        <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Set New Password for {st.rollNo} ({st.name})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter new student password (min 4 chars)..."
                            value={resetPasswordInput}
                            onChange={(e) => setResetPasswordInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />

                          <button
                            onClick={() => handleResetPassword(st.rollNo)}
                            disabled={savingReset || !resetPasswordInput.trim()}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Password</span>
                          </button>

                          <button
                            onClick={() => handleAllowReRegister(st.rollNo)}
                            disabled={savingReset}
                            className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                            title="Deletes current password registration so the student can register again"
                          >
                            Allow Re-Register
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-500">
          <span>Student passwords are salted & hashed with PBKDF2 for privacy.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
