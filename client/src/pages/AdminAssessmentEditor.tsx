import React, { useState } from "react";
import { Assessment, Question, Section } from "../types";
import { api } from "../services/api";
import { DateTimePicker } from "../components/common/DateTimePicker";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Code2,
  FileCode,
  Sparkles,
  Layers,
  Copy,
  Clock,
  Shield,
  RotateCcw,
  CheckCircle,
  Check
} from "lucide-react";

interface AdminAssessmentEditorProps {
  initialAssessment?: Assessment | null;
  onSaved: () => void;
  onBack: () => void;
}

export const AdminAssessmentEditor: React.FC<AdminAssessmentEditorProps> = ({
  initialAssessment,
  onSaved,
  onBack,
}) => {
  const [title, setTitle] = useState<string>(initialAssessment?.title || "");
  const [description, setDescription] = useState<string>(initialAssessment?.description || "");
  const [code, setCode] = useState<string>(initialAssessment?.code || "");
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialAssessment?.durationMinutes || 60
  );

  // Formatting date for HTML datetime-local or DateTimePicker
  const formatDateForPicker = (dateVal?: string | Date | null) => {
    if (!dateVal) return "";
    try {
      const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => n.toString().padStart(2, "0");
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const [startTime, setStartTime] = useState<string>(() => formatDateForPicker(initialAssessment?.startTime));
  const [endTime, setEndTime] = useState<string>(() => formatDateForPicker(initialAssessment?.endTime));

  const handleSyncEndTimeFromStart = () => {
    if (!startTime) return;
    try {
      const d = new Date(startTime);
      d.setMinutes(d.getMinutes() + (durationMinutes || 60));
      setEndTime(formatDateForPicker(d));
    } catch {
      // ignore
    }
  };

  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(
    initialAssessment?.shuffleQuestions ?? true
  );
  const [requireSeb, setRequireSeb] = useState<boolean>(
    initialAssessment?.requireSeb ?? true
  );
  const [sebQuitPassword, setSebQuitPassword] = useState<string>(
    initialAssessment?.sebQuitPassword || "exit123"
  );

  // Active Starter Code Tab per coding question
  const [starterCodeTabs, setStarterCodeTabs] = useState<Record<string, string>>({});

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

  const sanitizeQuestion = (q: any, idx: number) => {
    let options = [];
    try {
      if (q.options) {
        options = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
      }
    } catch {
      options = [];
    }

    let correctAnswers = [];
    try {
      if (q.correctAnswers) {
        correctAnswers = typeof q.correctAnswers === "string" ? JSON.parse(q.correctAnswers) : q.correctAnswers;
      }
    } catch {
      correctAnswers = [];
    }

    let starterCodes: Record<string, string> = { ...DEFAULT_BOILERPLATES };
    try {
      if (q.starterCodes) {
        const parsed = typeof q.starterCodes === "string" ? JSON.parse(q.starterCodes) : q.starterCodes;
        starterCodes = { ...starterCodes, ...parsed };
      }
    } catch {
      // ignore
    }

    return {
      id: q.id || `q-${Date.now()}-${idx}`,
      type: q.type || "CODING",
      title: q.title || `Question ${idx + 1}`,
      description: q.description || "",
      marks: q.marks !== undefined ? Number(q.marks) : (q.type === "MCQ" ? 2 : 48),
      negativeMarks: q.negativeMarks !== undefined ? Number(q.negativeMarks) : 0,
      order: idx,
      mcqType: q.mcqType || "SINGLE",
      options: options.length > 0 ? options : [
        { id: "opt-1", text: "Option A" },
        { id: "opt-2", text: "Option B" },
        { id: "opt-3", text: "Option C" },
        { id: "opt-4", text: "Option D" },
      ],
      correctAnswers: correctAnswers.length > 0 ? correctAnswers : ["opt-1"],
      explanation: q.explanation || "",
      allowedLanguages: q.allowedLanguages || "JAVA,C,CPP",
      starterCodes,
      starterCode: q.starterCode || starterCodes.JAVA,
      timeLimitSeconds: Number(q.timeLimitSeconds) || 3,
      memoryLimitMb: Number(q.memoryLimitMb) || 256,
      testCases: (q.testCases || []).map((tc: any, tcIdx: number) => ({
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
        isPublic: tc.isPublic ?? true,
        weight: Number(tc.weight) || 1.0,
        order: tcIdx,
      })),
    };
  };

  // Sections and Questions Initialization
  const [sections, setSections] = useState<any[]>(() => {
    if (initialAssessment?.sections && initialAssessment.sections.length > 0) {
      return initialAssessment.sections.map((s, sIdx) => ({
        id: s.id,
        title: s.title || `Section ${String.fromCharCode(65 + sIdx)}`,
        description: s.description || "",
        order: s.order ?? sIdx,
        questions: (s.questions || []).map((q: any, qIdx: number) => sanitizeQuestion(q, qIdx)),
      }));
    }

    if (initialAssessment?.questions && initialAssessment.questions.length > 0) {
      return [
        {
          id: "sec-default",
          title: "Section A: Questions",
          description: "",
          order: 0,
          questions: initialAssessment.questions.map((q: any, qIdx: number) => sanitizeQuestion(q, qIdx)),
        },
      ];
    }

    // Default template for brand new assessment
    return [
      {
        id: "sec-1",
        title: "Section A: Multiple Choice Questions",
        description: "Conceptual questions and code output predictions with negative marking.",
        order: 0,
        questions: [
          {
            id: "q-sample-mcq",
            type: "MCQ",
            title: "Q1: Sample Conceptual Question",
            description: "What is the result of the following expression in Java?\n\n```java\nint x = 5;\nSystem.out.println(x++ + ++x);\n```",
            marks: 2,
            negativeMarks: 0.5,
            mcqType: "SINGLE",
            options: [
              { id: "opt-1", text: "12" },
              { id: "opt-2", text: "11" },
              { id: "opt-3", text: "10" },
              { id: "opt-4", text: "13" },
            ],
            correctAnswers: ["opt-1"],
            explanation: "x++ evaluates to 5 and increments x to 6. ++x increments x to 7 and evaluates to 7. 5 + 7 = 12.",
          },
        ],
      },
      {
        id: "sec-2",
        title: "Section B: Hands-on Programming",
        description: "Solve algorithmic programming problems in Java, C, or C++.",
        order: 1,
        questions: [
          {
            id: "q-sample-coding",
            type: "CODING",
            title: "Problem 1: Array Sum Calculation",
            description: "Read an integer N, followed by N space-separated integers. Print their total sum.",
            marks: 48,
            timeLimitSeconds: 3,
            memoryLimitMb: 256,
            allowedLanguages: "JAVA,C,CPP",
            starterCodes: {
              JAVA: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int sum = 0;\n        for(int i=0; i<n; i++) sum += sc.nextInt();\n        System.out.println(sum);\n    }\n}\n",
              C: "#include <stdio.h>\n\nint main() {\n    int n, x, sum = 0;\n    if(scanf(\"%d\", &n) != 1) return 0;\n    for(int i=0; i<n; i++) { scanf(\"%d\", &x); sum += x; }\n    printf(\"%d\\n\", sum);\n    return 0;\n}\n",
              CPP: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n, sum = 0, x;\n    if(!(cin >> n)) return 0;\n    for(int i=0; i<n; i++) { cin >> x; sum += x; }\n    cout << sum << endl;\n    return 0;\n}\n",
            },
            testCases: [
              { input: "3\n1 2 3", expectedOutput: "6", isPublic: true, weight: 1 },
              { input: "4\n10 20 30 40", expectedOutput: "100", isPublic: false, weight: 1 },
            ],
          },
        ],
      },
    ];
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Pure Immutable Section & Question Handlers
  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `Section ${String.fromCharCode(65 + prev.length)}: New Section`,
        description: "",
        order: prev.length,
        questions: [],
      },
    ]);
  };

  const handleRemoveSection = (secIdx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== secIdx));
  };

  const handleCloneSection = (secIdx: number) => {
    setSections((prev) => {
      const targetSec = prev[secIdx];
      const clonedSec = {
        ...JSON.parse(JSON.stringify(targetSec)),
        id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `${targetSec.title} (Copy)`,
        order: prev.length,
      };
      return [...prev, clonedSec];
    });
  };

  const handleUpdateSectionTitle = (secIdx: number, val: string) => {
    setSections((prev) =>
      prev.map((sec, i) => (i === secIdx ? { ...sec, title: val } : sec))
    );
    if (fieldErrors[`section-title-${secIdx}`]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[`section-title-${secIdx}`];
        return copy;
      });
    }
  };

  const handleAddQuestion = (secIdx: number, type: "MCQ" | "CODING") => {
    const newQ = type === "MCQ" ? {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "MCQ",
      title: `MCQ Question`,
      description: "Enter question statement and code snippets...",
      marks: 2,
      negativeMarks: 0.5,
      mcqType: "SINGLE",
      options: [
        { id: `opt-${Date.now()}-1`, text: "Option A" },
        { id: `opt-${Date.now()}-2`, text: "Option B" },
        { id: `opt-${Date.now()}-3`, text: "Option C" },
        { id: `opt-${Date.now()}-4`, text: "Option D" },
      ],
      correctAnswers: [`opt-${Date.now()}-1`],
      explanation: "",
    } : {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "CODING",
      title: `Coding Problem`,
      description: "Enter problem statement, input/output formats, and constraints...",
      marks: 48,
      timeLimitSeconds: 3,
      memoryLimitMb: 256,
      allowedLanguages: "JAVA,C,CPP",
      starterCodes: {
        JAVA: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Java\n    }\n}\n",
        C: "#include <stdio.h>\n\nint main() {\n    // C\n    return 0;\n}\n",
        CPP: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // C++\n    return 0;\n}\n",
      },
      testCases: [
        { input: "", expectedOutput: "", isPublic: true, weight: 1 },
      ],
    };

    setSections((prev) =>
      prev.map((sec, sIdx) =>
        sIdx === secIdx
          ? { ...sec, questions: [...sec.questions, newQ] }
          : sec
      )
    );

    if (fieldErrors[`section-questions-${secIdx}`]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[`section-questions-${secIdx}`];
        return copy;
      });
    }
  };

  const handleRemoveQuestion = (secIdx: number, qIdx: number) => {
    setSections((prev) =>
      prev.map((sec, sIdx) =>
        sIdx === secIdx
          ? { ...sec, questions: sec.questions.filter((_: any, i: number) => i !== qIdx) }
          : sec
      )
    );
  };

  const handleCloneQuestion = (secIdx: number, qIdx: number) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        const targetQ = sec.questions[qIdx];
        const clonedQ = {
          ...JSON.parse(JSON.stringify(targetQ)),
          id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: `${targetQ.title} (Copy)`,
        };
        const nextQuestions = [...sec.questions];
        nextQuestions.splice(qIdx + 1, 0, clonedQ);
        return { ...sec, questions: nextQuestions };
      })
    );
  };

  const handleUpdateQuestion = (secIdx: number, qIdx: number, updates: Record<string, any>) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        return {
          ...sec,
          questions: sec.questions.map((q: any, qi: number) =>
            qi === qIdx ? { ...q, ...updates } : q
          ),
        };
      })
    );
  };

  const handleAddOption = (secIdx: number, qIdx: number) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        return {
          ...sec,
          questions: sec.questions.map((q: any, qi: number) => {
            if (qi !== qIdx) return q;
            const curOpts = q.options || [];
            const nextId = `opt-${Date.now()}-${curOpts.length + 1}`;
            return {
              ...q,
              options: [
                ...curOpts,
                { id: nextId, text: `Option ${String.fromCharCode(65 + curOpts.length)}` },
              ],
            };
          }),
        };
      })
    );
  };

  const handleRemoveOption = (secIdx: number, qIdx: number, optIdx: number) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        return {
          ...sec,
          questions: sec.questions.map((q: any, qi: number) => {
            if (qi !== qIdx) return q;
            const optToRemove = (q.options || [])[optIdx];
            const nextOpts = (q.options || []).filter((_: any, i: number) => i !== optIdx);
            const nextCorrect = (q.correctAnswers || []).filter((id: string) => id !== optToRemove?.id);
            return {
              ...q,
              options: nextOpts,
              correctAnswers: nextCorrect.length > 0 ? nextCorrect : (nextOpts[0] ? [nextOpts[0].id] : []),
            };
          }),
        };
      })
    );
  };

  const handleUpdateOptionText = (secIdx: number, qIdx: number, optIdx: number, text: string) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        return {
          ...sec,
          questions: sec.questions.map((q: any, qi: number) => {
            if (qi !== qIdx) return q;
            return {
              ...q,
              options: (q.options || []).map((opt: any, oi: number) =>
                oi === optIdx ? { ...opt, text } : opt
              ),
            };
          }),
        };
      })
    );
    const fieldId = `opt-text-${secIdx}-${qIdx}-${optIdx}`;
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const handleToggleCorrectAnswer = (secIdx: number, qIdx: number, optId: string, isMultiple: boolean) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        return {
          ...sec,
          questions: sec.questions.map((q: any, qi: number) => {
            if (qi !== qIdx) return q;
            const cur = q.correctAnswers || [];
            let nextCorrect: string[];
            if (isMultiple) {
              nextCorrect = cur.includes(optId)
                ? cur.filter((id: string) => id !== optId)
                : [...cur, optId];
            } else {
              nextCorrect = [optId];
            }
            return { ...q, correctAnswers: nextCorrect };
          }),
        };
      })
    );
    const fieldId = `mcq-correct-${secIdx}-${qIdx}`;
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  };

  const handleAddTestCase = (secIdx: number, qIdx: number) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        return {
          ...sec,
          questions: sec.questions.map((q: any, qi: number) => {
            if (qi !== qIdx) return q;
            return {
              ...q,
              testCases: [
                ...(q.testCases || []),
                { input: "", expectedOutput: "", isPublic: true, weight: 1 },
              ],
            };
          }),
        };
      })
    );
  };

  const handleUpdateTestCase = (secIdx: number, qIdx: number, tcIdx: number, updates: Record<string, any>) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        return {
          ...sec,
          questions: sec.questions.map((q: any, qi: number) => {
            if (qi !== qIdx) return q;
            return {
              ...q,
              testCases: (q.testCases || []).map((tc: any, ti: number) =>
                ti === tcIdx ? { ...tc, ...updates } : tc
              ),
            };
          }),
        };
      })
    );
  };

  const handleRemoveTestCase = (secIdx: number, qIdx: number, tcIdx: number) => {
    setSections((prev) =>
      prev.map((sec, sIdx) => {
        if (sIdx !== secIdx) return sec;
        return {
          ...sec,
          questions: sec.questions.map((q: any, qi: number) => {
            if (qi !== qIdx) return q;
            return {
              ...q,
              testCases: (q.testCases || []).filter((_: any, ti: number) => ti !== tcIdx),
            };
          }),
        };
      })
    );
  };

  // Comprehensive Form Validation
  const validateForm = (): { isValid: boolean; errors: Record<string, string>; firstElementId?: string } => {
    const errors: Record<string, string> = {};
    let firstElementId: string | undefined = undefined;

    const setFieldError = (id: string, msg: string) => {
      errors[id] = msg;
      if (!firstElementId) {
        firstElementId = id;
      }
    };

    if (!title.trim()) {
      setFieldError("field-title", "Assessment title is required.");
    }
    if (!code.trim()) {
      setFieldError("field-code", "Unique test code is required.");
    }
    if (!durationMinutes || Number(durationMinutes) <= 0) {
      setFieldError("field-duration", "Duration must be greater than 0 minutes.");
    }

    if (sections.length === 0) {
      setFieldError("sections-container", "Assessment must contain at least one section.");
    }

    sections.forEach((sec, sIdx) => {
      if (!sec.title || !sec.title.trim()) {
        setFieldError(`section-title-${sIdx}`, `Section ${sIdx + 1} title cannot be empty.`);
      }

      if (!sec.questions || sec.questions.length === 0) {
        setFieldError(`section-questions-${sIdx}`, `Section ${sIdx + 1} must contain at least one question.`);
      }

      (sec.questions || []).forEach((q: any, qIdx: number) => {
        if (!q.title || !q.title.trim()) {
          setFieldError(`q-title-${sIdx}-${qIdx}`, `Question title is required.`);
        }
        if (q.marks === undefined || Number(q.marks) <= 0) {
          setFieldError(`q-marks-${sIdx}-${qIdx}`, `Marks must be greater than 0.`);
        }

        if (q.type === "MCQ") {
          const opts = q.options || [];
          if (opts.length < 2) {
            setFieldError(`mcq-options-${sIdx}-${qIdx}`, `MCQ must contain at least 2 options.`);
          }
          opts.forEach((opt: any, optIdx: number) => {
            if (!opt.text || !opt.text.trim()) {
              setFieldError(`opt-text-${sIdx}-${qIdx}-${optIdx}`, `Option ${String.fromCharCode(65 + optIdx)} text cannot be empty.`);
            }
          });
          if (!q.correctAnswers || q.correctAnswers.length === 0) {
            setFieldError(`mcq-correct-${sIdx}-${qIdx}`, `Please select at least one correct answer.`);
          }
        }
      });
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstElementId,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError(`Please resolve the ${Object.keys(validation.errors).length} highlighted field(s) below before saving.`);
      
      // Auto-scroll to the first invalid field
      if (validation.firstElementId) {
        const el = document.getElementById(validation.firstElementId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus?.();
        }
      }
      return;
    }

    try {
      setSaving(true);
      setError("");
      setFieldErrors({});

      const payload = {
        title: title.trim(),
        description: description.trim(),
        code: code.trim(),
        durationMinutes: Number(durationMinutes),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        shuffleQuestions,
        requireSeb,
        sebQuitPassword,
        sections,
      };

      if (initialAssessment?.id) {
        await api.updateAssessment(initialAssessment.id, payload);
      } else {
        await api.createAssessment(payload);
      }

      setSaveToast("Assessment saved successfully!");
      setTimeout(() => {
        onSaved();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  const totalQuestions = sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
  const totalMcqs = sections.reduce(
    (acc, s) => acc + (s.questions?.filter((q: any) => q.type === "MCQ")?.length || 0),
    0
  );
  const totalCoding = sections.reduce(
    (acc, s) => acc + (s.questions?.filter((q: any) => q.type === "CODING")?.length || 0),
    0
  );
  const totalMarks = sections.reduce(
    (acc, s) =>
      acc + (s.questions?.reduce((qAcc: number, q: any) => qAcc + (Number(q.marks) || 0), 0) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header - Sticky */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-base text-white">
              {initialAssessment ? `Edit Assessment: ${initialAssessment.title}` : "Create Hybrid Assessment (SEB + MCQs + Coding)"}
            </h1>
            <p className="text-xs text-slate-400">Configure Sections, MCQs, Java/C/C++ problems, and SEB lockdown</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-950/50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Assessment"}</span>
        </button>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl p-4 flex items-start gap-2.5 shadow-lg animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <p className="font-bold text-rose-200">Validation Notice</p>
              <p className="text-rose-300">{error}</p>
            </div>
          </div>
        )}

        {/* Basic Configuration Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Basic Details & Exam Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Assessment Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="field-title"
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors["field-title"]) {
                    setFieldErrors((prev) => {
                      const c = { ...prev };
                      delete c["field-title"];
                      return c;
                    });
                  }
                }}
                placeholder="e.g. Data Structures & OOP Midterm Exam"
                className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none transition ${
                  fieldErrors["field-title"]
                    ? "border-rose-500 ring-1 ring-rose-500/50 bg-rose-950/20"
                    : "border-slate-800 focus:border-emerald-500"
                }`}
              />
              {fieldErrors["field-title"] && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors["field-title"]}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Test Code <span className="text-rose-400">*</span>
              </label>
              <input
                id="field-code"
                type="text"
                required
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (fieldErrors["field-code"]) {
                    setFieldErrors((prev) => {
                      const c = { ...prev };
                      delete c["field-code"];
                      return c;
                    });
                  }
                }}
                placeholder="JAVA-101"
                className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs font-mono uppercase text-white focus:outline-none transition ${
                  fieldErrors["field-code"]
                    ? "border-rose-500 ring-1 ring-rose-500/50 bg-rose-950/20"
                    : "border-slate-800 focus:border-emerald-500"
                }`}
              />
              {fieldErrors["field-code"] && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{fieldErrors["field-code"]}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Instructions & Overview
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Guidelines for students regarding negative marking, allowed languages, etc..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Date, Time & Calendar Selection Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Exam Timing, Calendar & Duration Control</span>
            </h2>
            <div className={`flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border ${
              fieldErrors["field-duration"] ? "border-rose-500 ring-1 ring-rose-500/50" : "border-slate-800"
            } text-slate-300`}>
              <span className="text-slate-500">Duration:</span>
              <input
                id="field-duration"
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value));
                  if (fieldErrors["field-duration"]) {
                    setFieldErrors((prev) => {
                      const c = { ...prev };
                      delete c["field-duration"];
                      return c;
                    });
                  }
                }}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 text-center"
              />
              <span>Minutes</span>
            </div>
          </div>
          {fieldErrors["field-duration"] && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 justify-end">
              <AlertCircle className="w-3 h-3" />
              <span>{fieldErrors["field-duration"]}</span>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateTimePicker
              label="Exam Start Time"
              value={startTime}
              onChange={setStartTime}
              helperText="Students cannot open the test before this scheduled timestamp."
            />

            <DateTimePicker
              label="Exam Cut-off / End Time"
              value={endTime}
              onChange={setEndTime}
              helperText="After this deadline, the assessment closes and auto-submits."
              onSyncWithStart={startTime ? handleSyncEndTimeFromStart : undefined}
              syncButtonLabel={`+ ${durationMinutes || 60} Mins (Start + Duration)`}
            />
          </div>
        </div>

        {/* Safe Exam Browser & Anti-Cheat Toggles */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Security & Anti-Cheat Lockdown Settings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <input
                type="checkbox"
                id="requireSeb"
                checked={requireSeb}
                onChange={(e) => setRequireSeb(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="requireSeb" className="text-xs font-semibold text-slate-200 cursor-pointer">
                Require Safe Exam Browser (SEB)
              </label>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <input
                type="checkbox"
                id="shuffleQuestions"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="shuffleQuestions" className="text-xs font-semibold text-slate-200 cursor-pointer">
                Shuffle Questions (Within Sections)
              </label>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                SEB Invigilator Quit Password
              </label>
              <input
                type="text"
                value={sebQuitPassword}
                onChange={(e) => setSebQuitPassword(e.target.value)}
                placeholder="e.g. exit123"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Sections & Questions Builder */}
        <div id="sections-container" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Assessment Sections ({sections.length})</span>
            </h2>
            <button
              type="button"
              onClick={handleAddSection}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          </div>

          {fieldErrors["sections-container"] && (
            <p className="text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors["sections-container"]}</span>
            </p>
          )}

          {sections.map((sec, secIdx) => (
            <div key={sec.id || secIdx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex-1 min-w-[250px] flex flex-col gap-1">
                  <input
                    id={`section-title-${secIdx}`}
                    type="text"
                    value={sec.title}
                    onChange={(e) => handleUpdateSectionTitle(secIdx, e.target.value)}
                    placeholder="Section Title..."
                    className={`font-bold text-sm text-white bg-transparent border-b pb-0.5 focus:outline-none transition w-full ${
                      fieldErrors[`section-title-${secIdx}`]
                        ? "border-rose-500 text-rose-200"
                        : "border-dashed border-slate-700 focus:border-emerald-500"
                    }`}
                  />
                  {fieldErrors[`section-title-${secIdx}`] && (
                    <span className="text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors[`section-title-${secIdx}`]}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion(secIdx, "MCQ")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ MCQ Question</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion(secIdx, "CODING")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Coding Problem</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCloneSection(secIdx)}
                    className="p-2 text-slate-500 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition"
                    title="Duplicate / Clone Section"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(secIdx)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Questions in Section */}
              <div id={`section-questions-${secIdx}`} className="space-y-4">
                {fieldErrors[`section-questions-${secIdx}`] && (
                  <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{fieldErrors[`section-questions-${secIdx}`]}</span>
                  </div>
                )}

                {sec.questions.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No questions in this section yet. Click "+ MCQ Question" or "+ Coding Problem" above.
                  </p>
                ) : (
                  sec.questions.map((q: any, qIdx: number) => (
                    <div key={q.id || qIdx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-inner">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                            q.type === "MCQ" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {q.type}
                          </span>
                          <span className="font-bold text-xs text-white">Q{qIdx + 1}: {q.title}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCloneQuestion(secIdx, qIdx)}
                            className="p-1.5 text-slate-500 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition"
                            title="Duplicate / Clone Question"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(secIdx, qIdx)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                            title="Remove Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Question Title <span className="text-rose-400">*</span>
                          </label>
                          <input
                            id={`q-title-${secIdx}-${qIdx}`}
                            type="text"
                            value={q.title}
                            onChange={(e) => {
                              handleUpdateQuestion(secIdx, qIdx, { title: e.target.value });
                              const fieldId = `q-title-${secIdx}-${qIdx}`;
                              if (fieldErrors[fieldId]) {
                                setFieldErrors((prev) => {
                                  const c = { ...prev };
                                  delete c[fieldId];
                                  return c;
                                });
                              }
                            }}
                            className={`w-full px-3 py-1.5 bg-slate-900 border rounded-xl text-xs text-white focus:outline-none transition ${
                              fieldErrors[`q-title-${secIdx}-${qIdx}`]
                                ? "border-rose-500 ring-1 ring-rose-500/50 bg-rose-950/20"
                                : "border-slate-800 focus:border-emerald-500"
                            }`}
                          />
                          {fieldErrors[`q-title-${secIdx}-${qIdx}`] && (
                            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{fieldErrors[`q-title-${secIdx}-${qIdx}`]}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Marks Awarded <span className="text-rose-400">*</span>
                          </label>
                          <input
                            id={`q-marks-${secIdx}-${qIdx}`}
                            type="number"
                            value={q.marks}
                            onChange={(e) => {
                              handleUpdateQuestion(secIdx, qIdx, { marks: Number(e.target.value) });
                              const fieldId = `q-marks-${secIdx}-${qIdx}`;
                              if (fieldErrors[fieldId]) {
                                setFieldErrors((prev) => {
                                  const c = { ...prev };
                                  delete c[fieldId];
                                  return c;
                                });
                              }
                            }}
                            className={`w-full px-3 py-1.5 bg-slate-900 border rounded-xl text-xs text-white font-mono transition ${
                              fieldErrors[`q-marks-${secIdx}-${qIdx}`]
                                ? "border-rose-500 ring-1 ring-rose-500/50 bg-rose-950/20"
                                : "border-slate-800 focus:border-emerald-500"
                            }`}
                          />
                          {fieldErrors[`q-marks-${secIdx}-${qIdx}`] && (
                            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{fieldErrors[`q-marks-${secIdx}-${qIdx}`]}</span>
                            </p>
                          )}
                        </div>

                        {q.type === "MCQ" ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Negative Penalty</label>
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              value={q.negativeMarks || 0}
                              onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { negativeMarks: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-rose-400 font-mono"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Allowed Languages</label>
                            <input
                              type="text"
                              value={q.allowedLanguages || "JAVA,C,CPP"}
                              onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { allowedLanguages: e.target.value.toUpperCase() })}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400"
                            />
                          </div>
                        )}
                      </div>

                      {/* Execution Bounds for Coding */}
                      {q.type === "CODING" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Time Limit (Seconds)</label>
                            <input
                              type="number"
                              min={1}
                              max={15}
                              value={q.timeLimitSeconds || 3}
                              onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { timeLimitSeconds: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Memory Limit (MB)</label>
                            <input
                              type="number"
                              min={64}
                              max={1024}
                              step={64}
                              value={q.memoryLimitMb || 256}
                              onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { memoryLimitMb: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Question Description & Code Snippets (Markdown supported)
                        </label>
                        <textarea
                          rows={3}
                          value={q.description}
                          onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { description: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white"
                        />
                      </div>

                      {/* MCQ Options Config */}
                      {q.type === "MCQ" && (
                        <div id={`mcq-options-${secIdx}-${qIdx}`} className="space-y-3 pt-2 border-t border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase text-amber-400 block">
                              MCQ Options ({q.mcqType === "MULTIPLE" ? "Check all correct answers" : "Select the single correct answer"}):
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddOption(secIdx, qIdx)}
                              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                            >
                              + Add Option
                            </button>
                          </div>

                          {fieldErrors[`mcq-correct-${secIdx}-${qIdx}`] && (
                            <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium bg-rose-950/40 p-2 rounded-lg border border-rose-800/50">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>{fieldErrors[`mcq-correct-${secIdx}-${qIdx}`]}</span>
                            </p>
                          )}

                          <div className="space-y-2">
                            {(q.options || []).map((opt: any, optIdx: number) => {
                              const isCorrect = (q.correctAnswers || []).includes(opt.id);
                              const optErrorKey = `opt-text-${secIdx}-${qIdx}-${optIdx}`;
                              return (
                                <div key={opt.id || optIdx} className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {q.mcqType === "MULTIPLE" ? (
                                      <input
                                        type="checkbox"
                                        checked={isCorrect}
                                        onChange={() => handleToggleCorrectAnswer(secIdx, qIdx, opt.id, true)}
                                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                                      />
                                    ) : (
                                      <input
                                        type="radio"
                                        name={`correct-${secIdx}-${qIdx}`}
                                        checked={isCorrect}
                                        onChange={() => handleToggleCorrectAnswer(secIdx, qIdx, opt.id, false)}
                                        className="w-4 h-4 text-emerald-600 cursor-pointer"
                                      />
                                    )}
                                    <span className="font-bold font-mono text-xs w-5 text-slate-400">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <input
                                      id={optErrorKey}
                                      type="text"
                                      value={opt.text}
                                      onChange={(e) => handleUpdateOptionText(secIdx, qIdx, optIdx, e.target.value)}
                                      className={`flex-1 px-3 py-1.5 bg-slate-900 border rounded-xl text-xs text-white transition ${
                                        fieldErrors[optErrorKey]
                                          ? "border-rose-500 ring-1 ring-rose-500/50 bg-rose-950/20"
                                          : "border-slate-800 focus:border-emerald-500"
                                      }`}
                                    />
                                    {(q.options || []).length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(secIdx, qIdx, optIdx)}
                                        className="p-1 text-slate-500 hover:text-rose-400"
                                        title="Remove Option"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  {fieldErrors[optErrorKey] && (
                                    <p className="text-[10px] text-rose-400 pl-11 flex items-center gap-1">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      <span>{fieldErrors[optErrorKey]}</span>
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Solution Explanation (Shown to students in review mode)
                            </label>
                            <input
                              type="text"
                              value={q.explanation || ""}
                              onChange={(e) => handleUpdateQuestion(secIdx, qIdx, { explanation: e.target.value })}
                              placeholder="Explanation for why the correct option is right..."
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* Coding Test Cases & Starter Boilerplates */}
                      {q.type === "CODING" && (
                        <div className="space-y-4 pt-3 border-t border-slate-800">
                          {/* Language Starter Code Boilerplates */}
                          <div className="space-y-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
                              <div className="flex items-center gap-2">
                                <Code2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-white">
                                  Default Starter Code Boilerplates
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                                  (Students see this template pre-filled when they switch languages)
                                </span>
                              </div>

                              {/* Language Selector Tabs */}
                              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                                {[
                                  { id: "JAVA", label: "Java (JDK 21)", color: "text-amber-400 border-amber-500/40" },
                                  { id: "C", label: "C (C11)", color: "text-blue-400 border-blue-500/40" },
                                  { id: "CPP", label: "C++ (C++17)", color: "text-cyan-400 border-cyan-500/40" },
                                  { id: "SPLIT", label: "Split View (All 3)", color: "text-emerald-400 border-emerald-500/40" },
                                ].map((tab) => {
                                  const currentTab = starterCodeTabs[q.id || `${secIdx}-${qIdx}`] || "JAVA";
                                  const isActive = currentTab === tab.id;
                                  return (
                                    <button
                                      key={tab.id}
                                      type="button"
                                      onClick={() => {
                                        setStarterCodeTabs((prev) => ({
                                          ...prev,
                                          [q.id || `${secIdx}-${qIdx}`]: tab.id,
                                        }));
                                      }}
                                      className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition ${
                                        isActive
                                          ? `bg-slate-800 text-white border ${tab.color} shadow-sm`
                                          : "text-slate-400 hover:text-slate-200"
                                      }`}
                                    >
                                      {tab.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Active Tab View */}
                            {(() => {
                              const qKey = q.id || `${secIdx}-${qIdx}`;
                              const activeTab = starterCodeTabs[qKey] || "JAVA";

                              if (activeTab === "SPLIT") {
                                return (
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                    {/* Java */}
                                    <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                          <span>☕ Java Starter Code</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateQuestion(secIdx, qIdx, {
                                              starterCodes: {
                                                ...(q.starterCodes || {}),
                                                JAVA: DEFAULT_BOILERPLATES.JAVA,
                                              },
                                              starterCode: DEFAULT_BOILERPLATES.JAVA,
                                            });
                                          }}
                                          className="text-[10px] text-slate-500 hover:text-amber-300 flex items-center gap-1"
                                          title="Reset to clean Java template"
                                        >
                                          <RotateCcw className="w-2.5 h-2.5" />
                                          <span>Reset</span>
                                        </button>
                                      </div>
                                      <textarea
                                        rows={12}
                                        value={q.starterCodes?.JAVA || ""}
                                        onChange={(e) => {
                                          handleUpdateQuestion(secIdx, qIdx, {
                                            starterCodes: {
                                              ...(q.starterCodes || {}),
                                              JAVA: e.target.value,
                                            },
                                            starterCode: e.target.value,
                                          });
                                        }}
                                        placeholder="Enter default Java starter code for students..."
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-amber-500 resize-y min-h-[240px]"
                                        spellCheck={false}
                                      />
                                    </div>

                                    {/* C */}
                                    <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                                          <span>⚙️ C Starter Code</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateQuestion(secIdx, qIdx, {
                                              starterCodes: {
                                                ...(q.starterCodes || {}),
                                                C: DEFAULT_BOILERPLATES.C,
                                              },
                                            });
                                          }}
                                          className="text-[10px] text-slate-500 hover:text-blue-300 flex items-center gap-1"
                                          title="Reset to clean C template"
                                        >
                                          <RotateCcw className="w-2.5 h-2.5" />
                                          <span>Reset</span>
                                        </button>
                                      </div>
                                      <textarea
                                        rows={12}
                                        value={q.starterCodes?.C || ""}
                                        onChange={(e) => {
                                          handleUpdateQuestion(secIdx, qIdx, {
                                            starterCodes: {
                                              ...(q.starterCodes || {}),
                                              C: e.target.value,
                                            },
                                          });
                                        }}
                                        placeholder="Enter default C starter code for students..."
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-blue-500 resize-y min-h-[240px]"
                                        spellCheck={false}
                                      />
                                    </div>

                                    {/* C++ */}
                                    <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                                          <span>⚡ C++ Starter Code</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateQuestion(secIdx, qIdx, {
                                              starterCodes: {
                                                ...(q.starterCodes || {}),
                                                CPP: DEFAULT_BOILERPLATES.CPP,
                                              },
                                            });
                                          }}
                                          className="text-[10px] text-slate-500 hover:text-cyan-300 flex items-center gap-1"
                                          title="Reset to clean C++ template"
                                        >
                                          <RotateCcw className="w-2.5 h-2.5" />
                                          <span>Reset</span>
                                        </button>
                                      </div>
                                      <textarea
                                        rows={12}
                                        value={q.starterCodes?.CPP || ""}
                                        onChange={(e) => {
                                          handleUpdateQuestion(secIdx, qIdx, {
                                            starterCodes: {
                                              ...(q.starterCodes || {}),
                                              CPP: e.target.value,
                                            },
                                          });
                                        }}
                                        placeholder="Enter default C++ starter code for students..."
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-cyan-500 resize-y min-h-[240px]"
                                        spellCheck={false}
                                      />
                                    </div>
                                  </div>
                                );
                              }

                              // Single Tab Full-Width View (Java / C / C++)
                              const langKey = activeTab as "JAVA" | "C" | "CPP";
                              const langLabels = {
                                JAVA: { title: "☕ Java (OpenJDK 21 LTS)", color: "text-amber-400", border: "focus:border-amber-500" },
                                C: { title: "⚙️ C Language (C11 GCC)", color: "text-blue-400", border: "focus:border-blue-500" },
                                CPP: { title: "⚡ C++ (C++17 G++)", color: "text-cyan-400", border: "focus:border-cyan-500" },
                              }[langKey];

                              const currentVal = q.starterCodes?.[langKey] || "";
                              const lineCount = (currentVal.match(/\n/g) || []).length + 1;

                              return (
                                <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-bold ${langLabels.color}`}>
                                        {langLabels.title}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        ({lineCount} lines, {currentVal.length} chars)
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateQuestion(secIdx, qIdx, {
                                          starterCodes: {
                                            ...(q.starterCodes || {}),
                                            [langKey]: DEFAULT_BOILERPLATES[langKey],
                                          },
                                          ...(langKey === "JAVA" ? { starterCode: DEFAULT_BOILERPLATES.JAVA } : {}),
                                        });
                                      }}
                                      className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                                    >
                                      <RotateCcw className="w-3 h-3 text-slate-400" />
                                      <span>Reset to Clean Template</span>
                                    </button>
                                  </div>

                                  <textarea
                                    rows={14}
                                    value={currentVal}
                                    onChange={(e) => {
                                      handleUpdateQuestion(secIdx, qIdx, {
                                        starterCodes: {
                                          ...(q.starterCodes || {}),
                                          [langKey]: e.target.value,
                                        },
                                        ...(langKey === "JAVA" ? { starterCode: e.target.value } : {}),
                                      });
                                    }}
                                    placeholder={`Enter default starter code template for ${langKey}...`}
                                    className={`w-full p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-100 leading-relaxed focus:outline-none ${langLabels.border} resize-y min-h-[280px] shadow-inner`}
                                    spellCheck={false}
                                  />
                                </div>
                              );
                            })()}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <span className="text-[11px] font-bold uppercase text-emerald-400">
                              Test Cases (Open & Closed Evaluation)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddTestCase(secIdx, qIdx)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                            >
                              + Add Test Case
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(q.testCases || []).map((tc: any, tcIdx: number) => (
                              <div key={tcIdx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-wrap gap-2 items-center">
                                <div className="flex-1 min-w-[140px]">
                                  <span className="block text-[10px] text-slate-500 uppercase">Input (stdin)</span>
                                  <textarea
                                    rows={1}
                                    value={tc.input}
                                    onChange={(e) => handleUpdateTestCase(secIdx, qIdx, tcIdx, { input: e.target.value })}
                                    className="w-full p-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-white"
                                  />
                                </div>

                                <div className="flex-1 min-w-[140px]">
                                  <span className="block text-[10px] text-slate-500 uppercase">Expected Output</span>
                                  <textarea
                                    rows={1}
                                    value={tc.expectedOutput}
                                    onChange={(e) => handleUpdateTestCase(secIdx, qIdx, tcIdx, { expectedOutput: e.target.value })}
                                    className="w-full p-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-white"
                                  />
                                </div>

                                <div className="w-16">
                                  <span className="block text-[10px] text-slate-500 uppercase text-center">Weight</span>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    value={tc.weight || 1}
                                    onChange={(e) => handleUpdateTestCase(secIdx, qIdx, tcIdx, { weight: Number(e.target.value) })}
                                    className="w-full p-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-center text-emerald-400 font-bold"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateTestCase(secIdx, qIdx, tcIdx, { isPublic: !tc.isPublic })}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                    tc.isPublic ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-purple-950 text-purple-400 border-purple-800"
                                  }`}
                                >
                                  {tc.isPublic ? "Open (Sample)" : "Closed (Hidden)"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveTestCase(secIdx, qIdx, tcIdx)}
                                  className="p-1 text-slate-500 hover:text-rose-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Floating Save Bar */}
        <div className="sticky bottom-6 z-40 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[11px] tracking-wider">Exam Overview:</span>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-white font-mono">{sections.length}</span>
              <span className="text-slate-500">Sections</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-amber-400 font-mono">{totalMcqs}</span>
              <span className="text-slate-500">MCQs</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-emerald-400 font-mono">{totalCoding}</span>
              <span className="text-slate-500">Coding</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-bold text-blue-400 font-mono">{totalMarks}</span>
              <span className="text-slate-500">Total Marks</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-xl text-xs transition shadow-lg shadow-emerald-950/50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Assessment..." : "Save Assessment"}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-emerald-600 text-white font-bold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-200" />
          <span>{saveToast}</span>
        </div>
      )}
    </div>
  );
};
