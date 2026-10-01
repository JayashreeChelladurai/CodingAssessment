import React, { useState } from "react";
import { Assessment, StudentAttempt } from "./types";
import { StudentLogin } from "./pages/StudentLogin";
import { StudentAssessment } from "./pages/StudentAssessment";
import { StudentPracticeReview } from "./pages/StudentPracticeReview";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminLiveMonitor } from "./pages/AdminLiveMonitor";
import { AdminGradebook } from "./pages/AdminGradebook";
import { AdminAssessmentEditor } from "./pages/AdminAssessmentEditor";
import { AdminQuestionBank } from "./pages/AdminQuestionBank";
import { api } from "./services/api";

type ViewMode =
  | "student-login"
  | "student-assessment"
  | "student-practice"
  | "admin-login"
  | "admin-dashboard"
  | "admin-live"
  | "admin-gradebook"
  | "admin-editor"
  | "admin-question-bank";

const isAttemptValid = (att: any, asmt: any): boolean => {
  if (!att || !asmt) return false;
  if (att.status === "SUBMITTED" || att.status === "TIME_EXPIRED") return false;
  if (typeof att.remainingSeconds === "number" && att.remainingSeconds <= 0) return false;
  return true;
};

export function App() {
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(() => {
    try {
      const urlCode = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("code") : null;
      const saved = sessionStorage.getItem("active_assessment") || localStorage.getItem("active_assessment");
      const parsed = saved ? JSON.parse(saved) : null;
      if (urlCode && parsed && parsed.code && parsed.code.toUpperCase() !== urlCode.toUpperCase()) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [activeAttempt, setActiveAttempt] = useState<StudentAttempt | null>(() => {
    try {
      const urlCode = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("code") : null;
      const savedAsmt = sessionStorage.getItem("active_assessment") || localStorage.getItem("active_assessment");
      const parsedAsmt = savedAsmt ? JSON.parse(savedAsmt) : null;
      if (urlCode && parsedAsmt && parsedAsmt.code && parsedAsmt.code.toUpperCase() !== urlCode.toUpperCase()) {
        return null;
      }
      const saved = sessionStorage.getItem("active_attempt") || localStorage.getItem("active_attempt");
      const parsed = saved ? JSON.parse(saved) : null;
      if (!isAttemptValid(parsed, parsedAsmt)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [view, setView] = useState<ViewMode>(() => {
    try {
      const urlCode = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("code") : null;
      const savedView = sessionStorage.getItem("active_view") || localStorage.getItem("active_view");
      const savedAttempt = sessionStorage.getItem("active_attempt") || localStorage.getItem("active_attempt");
      const savedAssessment = sessionStorage.getItem("active_assessment") || localStorage.getItem("active_assessment");
      
      const parsedAsmt = savedAssessment ? JSON.parse(savedAssessment) : null;
      const parsedAtt = savedAttempt ? JSON.parse(savedAttempt) : null;

      if (urlCode && parsedAsmt && parsedAsmt.code && parsedAsmt.code.toUpperCase() !== urlCode.toUpperCase()) {
        // Different assessment opened in URL, reset stale attempt
        sessionStorage.removeItem("active_attempt");
        sessionStorage.removeItem("active_assessment");
        sessionStorage.removeItem("active_view");
        localStorage.removeItem("active_attempt");
        localStorage.removeItem("active_assessment");
        localStorage.removeItem("active_view");
        return "student-login";
      }

      if (savedView === "student-assessment" && isAttemptValid(parsedAtt, parsedAsmt)) {
        return "student-assessment";
      }

      // If invalid/expired attempt, clear storage
      sessionStorage.removeItem("active_attempt");
      sessionStorage.removeItem("active_assessment");
      sessionStorage.removeItem("active_view");
      localStorage.removeItem("active_attempt");
      localStorage.removeItem("active_assessment");
      localStorage.removeItem("active_view");
    } catch {}
    return "student-login";
  });

  const [editorAssessment, setEditorAssessment] = useState<Assessment | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem("prof_admin_token"));

  // Student Starts Exam
  const handleStartExam = (data: { attempt: StudentAttempt; assessment: Assessment }) => {
    try {
      sessionStorage.setItem("active_attempt", JSON.stringify(data.attempt));
      sessionStorage.setItem("active_assessment", JSON.stringify(data.assessment));
      sessionStorage.setItem("active_view", "student-assessment");
      localStorage.setItem("active_attempt", JSON.stringify(data.attempt));
      localStorage.setItem("active_assessment", JSON.stringify(data.assessment));
      localStorage.setItem("active_view", "student-assessment");
    } catch {}
    setActiveAttempt(data.attempt);
    setActiveAssessment(data.assessment);
    setView("student-assessment");
  };

  const handleNavigateToAdmin = () => {
    if (adminToken) {
      setView("admin-dashboard");
    } else {
      setView("admin-login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {view === "student-login" && (
        <StudentLogin
          onStartExam={handleStartExam}
          onNavigateToPractice={() => setView("student-practice")}
          onNavigateToAdmin={handleNavigateToAdmin}
        />
      )}

      {view === "student-assessment" && activeAssessment && activeAttempt && (
        <StudentAssessment
          initialAssessment={activeAssessment}
          initialAttempt={activeAttempt}
          onFinished={() => {
            try {
              sessionStorage.removeItem("active_attempt");
              sessionStorage.removeItem("active_assessment");
              sessionStorage.removeItem("active_view");
              localStorage.removeItem("active_attempt");
              localStorage.removeItem("active_assessment");
              localStorage.removeItem("active_view");
            } catch {}
            api.setAttemptToken(null);
            setActiveAttempt(null);
            setActiveAssessment(null);
            setView("student-login");
          }}
        />
      )}

      {view === "student-practice" && (
        <StudentPracticeReview onBack={() => setView("student-login")} />
      )}

      {view === "admin-login" && (
        <AdminLogin
          onLoginSuccess={(token) => {
            setAdminToken(token);
            setView("admin-dashboard");
          }}
          onBack={() => setView("student-login")}
        />
      )}

      {view === "admin-dashboard" && (
        <AdminDashboard
          onNavigateToLive={(ass) => {
            setActiveAssessment(ass);
            setView("admin-live");
          }}
          onNavigateToGradebook={(ass) => {
            setActiveAssessment(ass);
            setView("admin-gradebook");
          }}
          onNavigateToEditor={(ass) => {
            setEditorAssessment(ass || null);
            setView("admin-editor");
          }}
          onNavigateToStudent={() => {
            setAdminToken(null);
            api.setAttemptToken(null);
            setView("student-login");
          }}
          onNavigateToQuestionBank={() => {
            setView("admin-question-bank");
          }}
        />
      )}

      {view === "admin-question-bank" && (
        <AdminQuestionBank onBack={() => setView("admin-dashboard")} />
      )}

      {view === "admin-live" && activeAssessment && (
        <AdminLiveMonitor
          assessment={activeAssessment}
          onBack={() => setView("admin-dashboard")}
          onNavigateToGradebook={() => setView("admin-gradebook")}
        />
      )}

      {view === "admin-gradebook" && activeAssessment && (
        <AdminGradebook
          assessment={activeAssessment}
          onBack={() => setView("admin-dashboard")}
          onNavigateToLive={() => setView("admin-live")}
        />
      )}

      {view === "admin-editor" && (
        <AdminAssessmentEditor
          initialAssessment={editorAssessment}
          onBack={() => setView("admin-dashboard")}
          onSaved={() => setView("admin-dashboard")}
        />
      )}
    </div>
  );
}

export default App;
