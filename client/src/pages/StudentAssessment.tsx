import React, { useState, useEffect, useRef, useCallback } from "react";
import { Assessment, StudentAttempt, Question, CodingGradingResponse, Section } from "../types";
import { api } from "../services/api";
import { getSocket } from "../services/socket";
import { FullscreenLockdown } from "../components/proctor/FullscreenLockdown";
import { LockoutScreen } from "../components/proctor/LockoutScreen";
import { MonacoCodeEditor } from "../components/editor/MonacoCodeEditor";
import { TestResultViewer } from "../components/editor/TestResultViewer";
import { McqView } from "../components/mcq/McqView";
import { QuestionPalette } from "../components/palette/QuestionPalette";
import {
  Clock,
  Play,
  CheckCircle,
  Save,
  Shield,
  FileCode,
  Sparkles,
  AlertCircle,
  Terminal,
  Layers,
  ChevronRight,
  BookOpen,
  LogOut
} from "lucide-react";

interface StudentAssessmentProps {
  initialAssessment: Assessment;
  initialAttempt: StudentAttempt;
  onFinished: () => void;
}

export const StudentAssessment: React.FC<StudentAssessmentProps> = ({
  initialAssessment,
  initialAttempt,
  onFinished,
}) => {
  const [assessment] = useState<Assessment>(initialAssessment);
  const [attempt, setAttempt] = useState<StudentAttempt>(initialAttempt);

  // Parse questions in randomized student order if available
  const [orderedQuestions, setOrderedQuestions] = useState<Question[]>(() => {
    const rawQuestions = assessment.questions || [];
    let qOrder: string[] = [];
    try {
      qOrder = JSON.parse(initialAttempt.questionOrder || "[]");
    } catch {
      qOrder = [];
    }

    if (qOrder.length > 0) {
      const sorted = [...rawQuestions].sort((a, b) => {
        const idxA = qOrder.indexOf(a.id);
        const idxB = qOrder.indexOf(b.id);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
      return sorted;
    }
    return rawQuestions;
  });

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);

  // Parse option orders
  const [optionOrders] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(initialAttempt.optionOrders || "{}");
    } catch {
      return {};
    }
  });

  // Parse drafts & MCQ responses & flagged review questions
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(initialAttempt.drafts || "{}");
    } catch {
      return {};
    }
  });

  const [mcqResponses, setMcqResponses] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(initialAttempt.mcqResponses || "{}");
    } catch {
      return {};
    }
  });

  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>(() => {
    try {
      return JSON.parse(initialAttempt.flaggedQuestions || "[]");
    } catch {
      return [];
    }
  });

  // Coding language selection per question
  const [selectedLanguages, setSelectedLanguages] = useState<Record<string, string>>({});

  // State
  const isSebBrowser = typeof navigator !== "undefined" && (navigator.userAgent.includes("SafeExamBrowser") || navigator.userAgent.includes("SEB"));
  const [isFullscreen, setIsFullscreen] = useState<boolean>(isSebBrowser || !!document.fullscreenElement);
  const [isLocked, setIsLocked] = useState<boolean>(initialAttempt.status === "LOCKED_OUT");
  const [lockReason, setLockReason] = useState<string>("");
  const [violationCount, setViolationCount] = useState<number>(initialAttempt.violationCount || 0);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialAttempt.remainingSeconds || 3600);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [codingResult, setCodingResult] = useState<CodingGradingResponse | null>(null);
  const [customResult, setCustomResult] = useState<any | null>(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"testcases" | "custom">("testcases");
  const [customInput, setCustomInput] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(initialAttempt.status === "SUBMITTED");
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("All changes saved");

  const activeQuestion: Question | undefined = orderedQuestions[currentQuestionIdx];

  // Allowed languages for active coding question
  const allowedLanguagesList = activeQuestion?.allowedLanguages
    ? activeQuestion.allowedLanguages.split(",").map((l) => l.trim().toUpperCase())
    : ["JAVA", "C", "CPP"];

  const currentLanguage = activeQuestion
    ? selectedLanguages[activeQuestion.id] || allowedLanguagesList[0] || "JAVA"
    : "JAVA";

const DEFAULT_BOILERPLATES: Record<string, string> = {
  JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}`,
  C: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your solution here
    return 0;
}`,
  CPP: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    // Write your solution here
    return 0;
}`,
};

  // Retrieve draft code for a given question and language
  const getDraftFor = (questionId: string, lang: string): string | undefined => {
    // 1. Direct compound key: `${questionId}_${lang}`
    if (drafts[`${questionId}_${lang}`] !== undefined) {
      return drafts[`${questionId}_${lang}`];
    }
    // 2. Nested map: drafts[questionId][lang]
    const val = drafts[questionId];
    if (typeof val === "object" && val !== null && val[lang] !== undefined) {
      return val[lang];
    }
    // 3. Fallback: raw string if initial language matches
    if (typeof val === "string" && val.trim().length > 0) {
      return val;
    }
    return undefined;
  };

  // Get starter or draft code for active question and selected language
  const getCurrentCode = () => {
    if (!activeQuestion) return "";
    
    // 1. Check if user has an existing saved draft for this specific language
    const savedDraft = getDraftFor(activeQuestion.id, currentLanguage);
    if (savedDraft !== undefined && savedDraft.trim().length > 0) {
      return savedDraft;
    }

    // 2. Check question starterCodes JSON for this specific language
    try {
      const templates = JSON.parse(activeQuestion.starterCodes || "{}");
      if (templates[currentLanguage] && templates[currentLanguage].trim().length > 0) {
        return templates[currentLanguage];
      }
    } catch {
      // ignore
    }

    // 3. If question has a general starterCode and current language is JAVA
    if (currentLanguage === "JAVA" && activeQuestion.starterCode && activeQuestion.starterCode.trim().length > 0) {
      return activeQuestion.starterCode;
    }

    // 4. Default boilerplate for this language
    return DEFAULT_BOILERPLATES[currentLanguage] || activeQuestion.starterCode || "";
  };

  const currentCode = getCurrentCode();
  const socketRef = useRef<any>(null);

  // 1. Setup Socket.io listeners
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("student:join", {
      assessmentId: assessment.id,
      attemptId: attempt.id,
      rollNo: attempt.rollNo,
      studentName: attempt.studentName,
    });

    socket.on("student:lockout", (data: any) => {
      setIsLocked(true);
      setLockReason(data.reason || "Exam violation detected");
      setViolationCount((prev) => prev + 1);
    });

    socket.on("student:unlocked", (data: any) => {
      setIsLocked(false);
      setLockReason("");
      if (data.remainingSeconds) {
        setRemainingSeconds(data.remainingSeconds);
      }
      if (data.drafts) {
        try {
          const parsed = typeof data.drafts === "string" ? JSON.parse(data.drafts) : data.drafts;
          setDrafts(parsed);
        } catch {
          // ignore
        }
      }
    });

    return () => {
      socket.off("student:lockout");
      socket.off("student:unlocked");
    };
  }, [assessment.id, attempt.id, attempt.rollNo, attempt.studentName]);

  // 2. Countdown Timer
  useEffect(() => {
    if (isLocked || isSubmitted) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, isSubmitted]);

  // 3. Periodic Auto-Save Sync (every 15s)
  useEffect(() => {
    if (isLocked || isSubmitted) return;

    const interval = setInterval(() => {
      if (socketRef.current) {
        socketRef.current.emit("student:heartbeat", {
          attemptId: attempt.id,
          assessmentId: assessment.id,
          remainingSeconds,
          drafts,
        });
      }
      api.saveDraft(attempt.id, drafts, mcqResponses, flaggedQuestions, remainingSeconds).catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [attempt.id, assessment.id, drafts, mcqResponses, flaggedQuestions, remainingSeconds, isLocked, isSubmitted]);

  const handleEnterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch {
      setIsFullscreen(true);
    }
  };

  const handleViolation = useCallback((type: string, details?: string) => {
    if (isLocked || isSubmitted) return;

    setIsLocked(true);
    setLockReason(type);
    setViolationCount((c) => c + 1);

    if (socketRef.current) {
      socketRef.current.emit("student:violation", {
        attemptId: attempt.id,
        assessmentId: assessment.id,
        violationType: type,
        details,
        currentDrafts: drafts,
      });
    }
  }, [attempt.id, assessment.id, drafts, isLocked, isSubmitted]);

  // Handle MCQ Option Choice
  const handleSelectMcqOption = (optionId: string) => {
    if (!activeQuestion) return;
    const isMultiple = activeQuestion.mcqType === "MULTIPLE";
    const prevSelected = mcqResponses[activeQuestion.id] || [];

    let nextSelected: string[];
    if (isMultiple) {
      if (prevSelected.includes(optionId)) {
        nextSelected = prevSelected.filter((id) => id !== optionId);
      } else {
        nextSelected = [...prevSelected, optionId];
      }
    } else {
      nextSelected = [optionId];
    }

    setMcqResponses((prev) => ({
      ...prev,
      [activeQuestion.id]: nextSelected,
    }));

    // Auto submit MCQ answer to backend
    api.submitMcq(attempt.id, activeQuestion.id, nextSelected).catch(() => {});
    setSaveStatus("MCQ saved");
    setTimeout(() => setSaveStatus("All changes saved"), 800);
  };

  // Clear MCQ Response
  const handleClearMcqResponse = (questionId: string) => {
    setMcqResponses((prev) => ({
      ...prev,
      [questionId]: [],
    }));
    api.submitMcq(attempt.id, questionId, []).catch(() => {});
    setSaveStatus("Choice cleared");
    setTimeout(() => setSaveStatus("All changes saved"), 800);
  };

  // Toggle Mark for Review
  const handleToggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const next = prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      api.saveDraft(attempt.id, drafts, mcqResponses, next, remainingSeconds).catch(() => {});
      return next;
    });
  };

  // Handle Coding changes
  const handleCodeChange = (newCode: string) => {
    if (!activeQuestion) return;
    setDrafts((prev: Record<string, any>) => {
      const prevQ = prev[activeQuestion.id];
      const prevObj = typeof prevQ === "object" && prevQ !== null ? (prevQ as Record<string, string>) : {};
      return {
        ...prev,
        [`${activeQuestion.id}_${currentLanguage}`]: newCode,
        [activeQuestion.id]: {
          ...prevObj,
          [currentLanguage]: newCode,
        },
      };
    });
    setSaveStatus("Saving...");
    setTimeout(() => setSaveStatus("All changes saved"), 800);
  };

  // Language Change in Coding
  const handleLanguageChange = (lang: string) => {
    if (!activeQuestion) return;
    setSelectedLanguages((prev) => ({
      ...prev,
      [activeQuestion.id]: lang,
    }));
    setCodingResult(null);
    setCustomResult(null);
    setSaveStatus(`Switched to ${lang}`);
    setTimeout(() => setSaveStatus("All changes saved"), 1000);
  };

  // Run Code against Sample Test Cases
  const handleRunCode = async () => {
    if (!activeQuestion || isRunning) return;
    try {
      setIsRunning(true);
      setCodingResult(null);
      setCustomResult(null);

      if (activeConsoleTab === "custom") {
        const res = await api.runCode(currentLanguage, currentCode, activeQuestion.id, customInput);
        setCustomResult(res.result);
      } else {
        const res = await api.runCode(currentLanguage, currentCode, activeQuestion.id);
        setCodingResult(res.grading);
      }
    } catch (err: any) {
      alert(err.message || "Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution for Active Coding Question
  const handleSubmitCoding = async () => {
    if (!activeQuestion || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await api.submitCode(currentLanguage, currentCode, activeQuestion.id, attempt.id);
      setCodingResult(res.grading);
      setActiveConsoleTab("testcases");

      setAttempt((prev) => {
        const otherSubs = (prev.submissions || []).filter((s) => s.questionId !== activeQuestion.id);
        return {
          ...prev,
          submissions: [...otherSubs, res.submission],
        };
      });
    } catch (err: any) {
      alert(err.message || "Failed to submit solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    try {
      await api.saveDraft(attempt.id, drafts, mcqResponses, flaggedQuestions, 0);
      await api.finishAssessment(attempt.id);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Auto submit failed:", err);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      await api.saveDraft(attempt.id, drafts, mcqResponses, flaggedQuestions, remainingSeconds);
      await api.finishAssessment(attempt.id);
      setIsSubmitted(true);
      setShowSubmitModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to submit assessment");
    }
  };

  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Submission Complete Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Assessment Submitted!</h2>
            <p className="text-sm text-slate-400">
              Your MCQs and programming solutions have been safely submitted and recorded.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-left space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-semibold text-white">{attempt.studentName} ({attempt.rollNo})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assessment:</span>
              <span className="font-semibold text-white">{assessment.title}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                try {
                  window.location.href = "seb://quit";
                } catch {
                  window.close();
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-rose-950/50 text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Safe Exam Browser</span>
            </button>
            <button
              onClick={onFinished}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition text-xs"
            >
              Back to Home / Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100 select-none">
      {/* Fullscreen Lockdown Shield */}
      <FullscreenLockdown
        isFullscreen={isFullscreen}
        onEnterFullscreen={handleEnterFullscreen}
        onViolation={handleViolation}
        isLocked={isLocked}
        isCompleted={isSubmitted}
      />

      {/* Lockout Overlay */}
      {isLocked && (
        <LockoutScreen
          rollNo={attempt.rollNo}
          studentName={attempt.studentName}
          lockReason={lockReason}
          violationCount={violationCount}
        />
      )}

      {/* Top Navbar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-800/40 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>SEB PROCTORED</span>
          </div>
          <span className="font-bold text-sm text-white truncate max-w-xs">{assessment.title}</span>
        </div>

        {/* Right Section: Auto-Save, Timer & Finish / Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{saveStatus}</span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-sm font-bold border ${
              remainingSeconds < 300
                ? "bg-rose-950/50 text-rose-400 border-rose-800 animate-pulse"
                : "bg-slate-800 text-emerald-400 border-slate-700"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg transition shadow-md shadow-emerald-950/50"
          >
            <span>Finish Test</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 text-xs font-semibold py-1.5 px-3 rounded-lg transition border border-slate-700 hover:border-rose-800/60"
            title="Exit / Logout SEB"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Left/Middle Column: Active Question Workspace (MCQ or Coding) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activeQuestion?.type === "MCQ" ? (
            /* MCQ Question View */
            <McqView
              question={activeQuestion}
              selectedOptions={mcqResponses[activeQuestion.id] || []}
              optionOrder={optionOrders[activeQuestion.id]}
              onSelectOption={handleSelectMcqOption}
              onClearResponse={() => handleClearMcqResponse(activeQuestion.id)}
            />
          ) : (
            /* Coding Problem View (Split: Problem on left/top, Editor on right/bottom) */
            <div className="flex-1 flex flex-col lg:flex-row gap-2 overflow-hidden">
              {/* Problem Statement Card */}
              <section className="lg:w-2/5 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner exam-protected select-none">
                <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="font-bold text-sm text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>{activeQuestion ? activeQuestion.title : "No Question"}</span>
                  </h2>
                  {activeQuestion && (
                    <span className="text-xs bg-emerald-950/60 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                      {activeQuestion.marks} Marks
                    </span>
                  )}
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-4 text-slate-300 text-xs leading-relaxed">
                  {activeQuestion ? (
                    <>
                      <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans">
                        {activeQuestion.description}
                      </div>

                      <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Execution Constraints
                        </span>
                        <div className="flex gap-4 text-slate-400 text-xs">
                          <span>Time Limit: <strong className="text-slate-200">{activeQuestion.timeLimitSeconds}s</strong></span>
                          <span>Memory Limit: <strong className="text-slate-200">{activeQuestion.memoryLimitMb}MB</strong></span>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </section>

              {/* Code Editor & Test Console */}
              <section className="flex-1 flex flex-col gap-2 overflow-hidden">
                {/* Top Half: Multi-Language Monaco Editor */}
                <div className="flex-[3] flex flex-col min-h-0">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border border-slate-800 rounded-t-xl text-xs">
                    {/* Language Selector Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-semibold">Language:</span>
                      <select
                        value={currentLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-slate-950 text-emerald-400 font-bold border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
                      >
                        {allowedLanguagesList.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang === "CPP" ? "C++ (C++17)" : lang === "C" ? "C (C11)" : "Java (JDK 21)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRunCode}
                        disabled={isRunning || isSubmitting}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-1 rounded-lg text-xs font-semibold transition border border-slate-700"
                      >
                        <Play className="w-3 h-3 text-emerald-400" />
                        <span>Run Sample Cases</span>
                      </button>

                      <button
                        onClick={handleSubmitCoding}
                        disabled={isRunning || isSubmitting}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1 rounded-lg text-xs font-semibold transition shadow-md shadow-emerald-950/40"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>{isSubmitting ? "Grading..." : "Submit Solution"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0">
                    <MonacoCodeEditor
                      code={currentCode}
                      language={currentLanguage}
                      onChange={handleCodeChange}
                    />
                  </div>
                </div>

                {/* Bottom Half: Console Output & Test Cases */}
                <div className="flex-[2] min-h-0">
                  <TestResultViewer
                    gradingResult={codingResult}
                    customResult={customResult}
                    isRunning={isRunning}
                    activeTab={activeConsoleTab}
                    onTabChange={setActiveConsoleTab}
                    customInput={customInput}
                    onCustomInputChange={setCustomInput}
                    publicTestCases={activeQuestion?.testCases?.filter((tc) => tc.isPublic) as any}
                  />
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Right Column: Standard Question Palette (Palette, Navigation, Mark for Review) */}
        <aside className="w-72 shrink-0 hidden md:flex flex-col overflow-hidden">
          <QuestionPalette
            sections={assessment.sections || []}
            questions={orderedQuestions}
            currentQuestionIdx={currentQuestionIdx}
            onSelectQuestion={setCurrentQuestionIdx}
            mcqResponses={mcqResponses}
            drafts={drafts}
            flaggedQuestions={flaggedQuestions}
            onToggleFlagQuestion={handleToggleFlagQuestion}
            onClearResponse={handleClearMcqResponse}
            onNextQuestion={() => setCurrentQuestionIdx((i) => Math.min(orderedQuestions.length - 1, i + 1))}
            onPrevQuestion={() => setCurrentQuestionIdx((i) => Math.max(0, i - 1))}
          />
        </aside>
      </main>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Confirm Final Submission?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to finish your assessment? All MCQ answers and code drafts will be evaluated and submitted.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Continue Test
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50"
              >
                Yes, Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Exam Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-900/60 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <LogOut className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Exit Safe Exam Browser?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to exit the exam? Your current progress has been auto-saved.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Resume Exam
              </button>
              <button
                onClick={() => {
                  try {
                    window.location.href = "seb://quit";
                  } catch {
                    window.close();
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Safe Exam Browser</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
