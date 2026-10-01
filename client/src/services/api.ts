const API_BASE = "/api";

const ADMIN_TOKEN_KEY = "prof_admin_token";
const ATTEMPT_TOKEN_KEY = "student_attempt_token";
const SEB_TOKEN_KEY = "seb_assessment_token";

// Capture and persist sebToken from SEB start URL
try {
  if (typeof window !== "undefined" && window.location) {
    const urlSebToken = new URLSearchParams(window.location.search).get("sebToken");
    if (urlSebToken) {
      window.sessionStorage?.setItem(SEB_TOKEN_KEY, urlSebToken);
    }
  }
} catch {
  // ignore
}

function getSebToken(assessmentCode?: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    const urlToken = new URLSearchParams(window.location?.search || "").get("sebToken");
    const storedToken = window.sessionStorage?.getItem(SEB_TOKEN_KEY);
    const token = urlToken || storedToken || null;
    if (token && assessmentCode) {
      const codePart = token.split(":")[0];
      if (codePart && codePart.toUpperCase() !== assessmentCode.trim().toUpperCase()) {
        return null;
      }
    }
    return token;
  } catch {
    return null;
  }
}

function safeStorageGet(key: string): string | null {
  try {
    return window?.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function getClientDeviceInfo(): string {
  try {
    if (typeof window === "undefined" || !navigator) return "Browser Client";
    const ua = navigator.userAgent;
    let platform = "Unknown";
    if (navigator.platform) platform = navigator.platform;
    if ((navigator as any).userAgentData?.platform) platform = (navigator as any).userAgentData.platform;

    let os = "Desktop";
    if (/Windows/i.test(ua)) os = "Windows";
    else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
    else if (/Linux/i.test(ua)) os = "Linux";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";

    let browser = "Browser";
    if (/SEB/i.test(ua)) browser = "SafeExamBrowser";
    else if (/Edg/i.test(ua)) browser = "Edge";
    else if (/Chrome/i.test(ua)) browser = "Chrome";
    else if (/Firefox/i.test(ua)) browser = "Firefox";
    else if (/Safari/i.test(ua)) browser = "Safari";

    const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
    return `${os} (${platform}) • ${browser} • ${screenRes}`;
  } catch {
    return "Browser Client";
  }
}

function adminHeaders(extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    ...extra,
    "Content-Type": "application/json",
  };
  const token = safeStorageGet(ADMIN_TOKEN_KEY);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers["x-admin-token"] = token;
  }
  return headers;
}

function studentHeaders(attemptToken?: string, extra: Record<string, string> = {}, assessmentCode?: string): HeadersInit {
  const headers: Record<string, string> = {
    ...extra,
    "Content-Type": "application/json",
  };
  const token = attemptToken || safeStorageGet(ATTEMPT_TOKEN_KEY);
  if (token) {
    headers["x-attempt-token"] = token;
  }
  const sebToken = getSebToken(assessmentCode);
  if (sebToken) {
    headers["x-seb-token"] = sebToken;
  }
  return headers;
}

export const api = {
  // Admin Auth
  adminLogin: async (passcode: string, username?: string) => {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode, username }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Invalid credentials" }));
      throw new Error(err.error || "Invalid credentials");
    }
    return res.json();
  },

  // Assessment routes
  getAssessments: async () => {
    const res = await fetch(`${API_BASE}/assessments`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getAssessmentById: async (id: string) => {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  createAssessment: async (data: any) => {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create assessment" }));
      throw new Error(err.error || "Failed to create assessment");
    }
    return res.json();
  },

  updateAssessment: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to update assessment" }));
      throw new Error(err.error || "Failed to update assessment");
    }
    return res.json();
  },

  getSebConfigUrl: (id: string) => {
    const host = typeof window !== "undefined" ? window.location.host : "";
    const protocol = typeof window !== "undefined" ? window.location.protocol.replace(":", "") : "http";
    const query = host ? `?clientHost=${encodeURIComponent(host)}&clientProtocol=${encodeURIComponent(protocol)}` : "";
    return `${API_BASE}/assessments/${encodeURIComponent(id)}/seb-config${query}`;
  },

  toggleReviewMode: async (id: string, isReviewUnlocked: boolean, reviewUnlockTime?: string | null) => {
    const res = await fetch(`${API_BASE}/assessments/${id}/review-mode`, {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ isReviewUnlocked, reviewUnlockTime }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteAssessment: async (id: string) => {
    const res = await fetch(`${API_BASE}/assessments/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  cloneAssessment: async (id: string) => {
    const res = await fetch(`${API_BASE}/assessments/${id}/clone`, {
      method: "POST",
      headers: adminHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to clone assessment" }));
      throw new Error(err.error || "Failed to clone assessment");
    }
    return res.json();
  },

  // Student routes
  checkStudent: async (rollNo: string) => {
    try {
      const res = await fetch(`${API_BASE}/student/check-student/${encodeURIComponent(rollNo)}`);
      if (!res.ok) return { exists: false, rollNo };
      return res.json();
    } catch {
      return { exists: false, rollNo };
    }
  },

  registerStudent: async (rollNo: string, name: string, password: string) => {
    const res = await fetch(`${API_BASE}/student/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rollNo, name, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Registration failed" }));
      throw new Error(err.error || "Registration failed");
    }
    return res.json();
  },

  getAssessmentInfo: async (code: string) => {
    const sebToken = getSebToken(code);
    const query = sebToken ? `?sebToken=${encodeURIComponent(sebToken)}` : "";
    const res = await fetch(`${API_BASE}/student/info/${encodeURIComponent(code)}${query}`, {
      headers: studentHeaders(undefined, {}, code),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Assessment not found" }));
      throw new Error(err.error || "Assessment not found");
    }
    return res.json();
  },

  startAssessment: async (code: string, rollNo: string, studentName: string, password?: string) => {
    const sebToken = getSebToken(code);
    const deviceInfo = getClientDeviceInfo();
    const res = await fetch(`${API_BASE}/student/start`, {
      method: "POST",
      headers: studentHeaders(undefined, {}, code),
      body: JSON.stringify({ code, rollNo, studentName, password, sebToken, deviceInfo }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to start assessment" }));
      throw new Error(err.error || "Failed to start assessment");
    }
    return res.json();
  },

  getRegisteredStudents: async () => {
    const res = await fetch(`${API_BASE}/assessments/admin/students`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  resetStudentPassword: async (rollNo: string, newPassword?: string) => {
    const res = await fetch(`${API_BASE}/assessments/admin/students/${encodeURIComponent(rollNo)}/reset-password`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to reset student password" }));
      throw new Error(err.error || "Failed to reset student password");
    }
    return res.json();
  },

  createStudent: async (rollNo: string, name: string, password: string) => {
    const res = await fetch(`${API_BASE}/assessments/admin/students`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ rollNo, name, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to create student" }));
      throw new Error(err.error || "Failed to create student");
    }
    return res.json();
  },

  deleteStudent: async (rollNo: string) => {
    const res = await fetch(`${API_BASE}/assessments/admin/students/${encodeURIComponent(rollNo)}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to delete student" }));
      throw new Error(err.error || "Failed to delete student");
    }
    return res.json();
  },

  setAttemptToken: (attemptToken: string | null) => {
    if (attemptToken) {
      localStorage.setItem(ATTEMPT_TOKEN_KEY, attemptToken);
    } else {
      localStorage.removeItem(ATTEMPT_TOKEN_KEY);
    }
  },

  saveDraft: async (
    attemptId: string,
    attemptToken: string | undefined,
    drafts?: any,
    mcqResponses?: any,
    flaggedQuestions?: any,
    remainingSeconds?: number
  ) => {
    const res = await fetch(`${API_BASE}/student/save-draft`, {
      method: "POST",
      headers: studentHeaders(attemptToken),
      body: JSON.stringify({ attemptId, drafts, mcqResponses, flaggedQuestions, remainingSeconds }),
    });
    return res.json();
  },

  submitMcq: async (attemptId: string, questionId: string, selectedOptions: string[], attemptToken?: string) => {
    const res = await fetch(`${API_BASE}/student/submit-mcq`, {
      method: "POST",
      headers: studentHeaders(attemptToken),
      body: JSON.stringify({ attemptId, questionId, selectedOptions }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to submit MCQ" }));
      throw new Error(err.error || "Failed to submit MCQ");
    }
    return res.json();
  },

  finishAssessment: async (attemptId: string, attemptToken?: string) => {
    const res = await fetch(`${API_BASE}/student/finish`, {
      method: "POST",
      headers: studentHeaders(attemptToken),
      body: JSON.stringify({ attemptId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getReviewData: async (code: string, rollNo: string) => {
    const res = await fetch(`${API_BASE}/student/review/${encodeURIComponent(code)}/${encodeURIComponent(rollNo)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to load review mode" }));
      throw new Error(err.error || err.message || "Failed to load review mode");
    }
    return res.json();
  },

  // Multi-Language Execution
  runCode: async (
    language: string,
    code: string,
    questionId: string,
    attemptId: string,
    customInput?: string,
    attemptToken?: string
  ) => {
    const res = await fetch(`${API_BASE}/execution/run`, {
      method: "POST",
      headers: studentHeaders(attemptToken),
      body: JSON.stringify({
        language,
        code,
        questionId,
        customInput,
        attemptId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Execution failed" }));
      throw new Error(err.error || "Execution failed");
    }
    return res.json();
  },

  submitCode: async (
    language: string,
    code: string,
    questionId: string,
    attemptId: string,
    attemptToken?: string
  ) => {
    const res = await fetch(`${API_BASE}/execution/submit`, {
      method: "POST",
      headers: studentHeaders(attemptToken),
      body: JSON.stringify({ language, code, questionId, attemptId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Submission failed" }));
      throw new Error(err.error || "Submission failed");
    }
    return res.json();
  },

  // Results & Gradebook
  getResults: async (assessmentId: string) => {
    const res = await fetch(`${API_BASE}/results/${assessmentId}`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getExportUrl: (assessmentId: string, mode: "detailed" | "summary" = "detailed") => {
    return `${API_BASE}/results/${assessmentId}/export?mode=${mode}`;
  },

  exportResultsCsv: async (assessmentId: string, mode: "detailed" | "summary" = "detailed") => {
    const res = await fetch(`${API_BASE}/results/${assessmentId}/export?mode=${mode}`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.blob();
  },

  autogradeAll: async (assessmentId: string) => {
    const res = await fetch(`${API_BASE}/results/${assessmentId}/autograde-all`, {
      method: "POST",
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Live Proctoring & Unlocking
  getLiveCandidates: async (assessmentId: string) => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/live-candidates`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  unlockAllStudents: async (assessmentId: string, extraMinutes: number = 0) => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/unlock-all`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ extraMinutes }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  resumeStudent: async (assessmentId: string, attemptId: string, extraMinutes: number = 0) => {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/resume/${attemptId}`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ extraMinutes }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getAttemptStatus: async (attemptId: string, attemptToken?: string) => {
    const res = await fetch(`${API_BASE}/student/attempt-status/${attemptId}`, {
      headers: studentHeaders(attemptToken),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Question Bank API
  getQuestionFolders: async () => {
    const res = await fetch(`${API_BASE}/question-bank/folders`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  createQuestionFolder: async (data: { name: string; parentId?: string | null; description?: string; order?: number }) => {
    const res = await fetch(`${API_BASE}/question-bank/folders`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateQuestionFolder: async (id: string, data: { name?: string; parentId?: string | null; description?: string; order?: number }) => {
    const res = await fetch(`${API_BASE}/question-bank/folders/${id}`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteQuestionFolder: async (id: string) => {
    const res = await fetch(`${API_BASE}/question-bank/folders/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getBankQuestions: async (params?: { folderId?: string; type?: string; difficulty?: string; search?: string; includeSubfolders?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.folderId) query.set("folderId", params.folderId);
    if (params?.type) query.set("type", params.type);
    if (params?.difficulty) query.set("difficulty", params.difficulty);
    if (params?.search) query.set("search", params.search);
    if (params?.includeSubfolders) query.set("includeSubfolders", "true");

    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE}/question-bank/questions${qs}`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getBankQuestion: async (id: string) => {
    const res = await fetch(`${API_BASE}/question-bank/questions/${id}`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  createBankQuestion: async (data: any) => {
    const res = await fetch(`${API_BASE}/question-bank/questions`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  updateBankQuestion: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/question-bank/questions/${id}`, {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  deleteBankQuestion: async (id: string) => {
    const res = await fetch(`${API_BASE}/question-bank/questions/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  bulkUploadBankQuestions: async (folderId: string | null, questions: any[]) => {
    const res = await fetch(`${API_BASE}/question-bank/questions/bulk-upload`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ folderId, questions }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to upload questions" }));
      throw new Error(err.error || "Failed to upload questions");
    }
    return res.json();
  },

  moveBankQuestions: async (questionIds: string[], targetFolderId: string | null) => {
    const res = await fetch(`${API_BASE}/question-bank/questions/move`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ questionIds, targetFolderId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
