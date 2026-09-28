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
import { api } from "./services/api";

type ViewMode =
  | "student-login"
  | "student-assessment"
  | "student-practice"
  | "admin-login"
  | "admin-dashboard"
  | "admin-live"
  | "admin-gradebook"
  | "admin-editor";

export function App() {
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(() => {
    try {
      const saved = sessionStorage.getItem("active_assessment") || localStorage.getItem("active_assessment");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeAttempt, setActiveAttempt] = useState<StudentAttempt | null>(() => {
    try {
      const saved = sessionStorage.getItem("active_attempt") || localStorage.getItem("active_attempt");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [view, setView] = useState<ViewMode>(() => {
    try {
      const savedView = sessionStorage.getItem("active_view") || localStorage.getItem("active_view");
      const savedAttempt = sessionStorage.getItem("active_attempt") || localStorage.getItem("active_attempt");
      const savedAssessment = sessionStorage.getItem("active_assessment") || localStorage.getItem("active_assessment");
      if (savedView === "student-assessment" && savedAttempt && savedAssessment) {
        const parsed = JSON.parse(savedAttempt);
        if (parsed.status !== "SUBMITTED" && parsed.status !== "TIME_EXPIRED") {
          return "student-assessment";
        }
      }
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
        />
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
