const API_BASE = "/api";

const ADMIN_TOKEN_KEY = "prof_admin_token";
const ATTEMPT_TOKEN_KEY = "student_attempt_token";

function safeStorageGet(key: string): string | null {
  try {
    return window?.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
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

function studentHeaders(attemptToken?: string, extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    ...extra,
    "Content-Type": "application/json",
  };
  const token = attemptToken || safeStorageGet(ATTEMPT_TOKEN_KEY);
  if (token) {
    headers["x-attempt-token"] = token;
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
    return `${API_BASE}/assessments/${id}/seb-config`;
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
  getAssessmentInfo: async (code: string) => {
    const res = await fetch(`${API_BASE}/student/info/${encodeURIComponent(code)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Assessment not found" }));
      throw new Error(err.error || "Assessment not found");
    }
    return res.json();
  },

  startAssessment: async (code: string, rollNo: string, studentName: string) => {
    const res = await fetch(`${API_BASE}/student/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, rollNo, studentName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to start assessment" }));
      throw new Error(err.error || "Failed to start assessment");
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
};
