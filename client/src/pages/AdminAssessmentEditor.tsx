import React, { useState } from "react";
import { api } from "../services/api";
import { Assessment, Question, Section } from "../types";
import { DateTimePicker } from "../components/common/DateTimePicker";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Code,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Layers,
  FileCode,
  HelpCircle,
  AlertCircle,
  Clock,
  Shuffle,
  Calendar
} from "lucide-react";

interface AdminAssessmentEditorProps {
  initialAssessment?: Assessment | null;
  onBack: () => void;
  onSaved: () => void;
}

export const AdminAssessmentEditor: React.FC<AdminAssessmentEditorProps> = ({
  initialAssessment,
  onBack,
  onSaved,
}) => {
  const [title, setTitle] = useState<string>(initialAssessment?.title || "");
  const [description, setDescription] = useState<string>(initialAssessment?.description || "");
  const [code, setCode] = useState<string>(initialAssessment?.code || "");
  const [durationMinutes, setDurationMinutes] = useState<number>(initialAssessment?.durationMinutes || 60);

  // Parse ISO date string safely
  const formatIsoDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return "";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "";
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch {
      return "";
    }
  };

  const [startTime, setStartTime] = useState<string>(() => formatIsoDate(initialAssessment?.startTime));
  const [endTime, setEndTime] = useState<string>(() => formatIsoDate(initialAssessment?.endTime));

  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(
    initialAssessment?.shuffleQuestions ?? true
  );
  const [requireSeb, setRequireSeb] = useState<boolean>(
    initialAssessment?.requireSeb ?? true
  );
  const [sebQuitPassword, setSebQuitPassword] = useState<string>(
    initialAssessment?.sebQuitPassword || "exit123"
  );

  // Helper to sanitize questions from database/raw objects
  const sanitizeQuestion = (q: any, idx: number) => {
    let options = [];
    try {
      options = typeof q.options === "string" ? JSON.parse(q.options || "[]") : (q.options || []);
    } catch {
      options = [];
    }

    let correctAnswers = [];
    try {
      correctAnswers = typeof q.correctAnswers === "string" ? JSON.parse(q.correctAnswers || "[]") : (q.correctAnswers || []);
    } catch {
      correctAnswers = [];
    }

    let starterCodes: Record<string, string> = {
      JAVA: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n",
      C: "#include <stdio.h>\n\nint main() {\n    return 0;\n}\n",
      CPP: "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n",
    };
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

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
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

  const handleAddQuestion = (secIdx: number, type: "MCQ" | "CODING") => {
    setSections((prev) => {
      const copy = [...prev];
      if (type === "MCQ") {
        copy[secIdx].questions.push({
          type: "MCQ",
          title: `MCQ Question ${copy[secIdx].questions.length + 1}`,
          description: "Enter question statement and code snippets...",
          marks: 2,
          negativeMarks: 0.5,
          mcqType: "SINGLE",
          options: [
            { id: "opt-1", text: "Option A" },
            { id: "opt-2", text: "Option B" },
            { id: "opt-3", text: "Option C" },
            { id: "opt-4", text: "Option D" },
          ],
          correctAnswers: ["opt-1"],
          explanation: "",
        });
      } else {
        copy[secIdx].questions.push({
          type: "CODING",
          title: `Coding Problem ${copy[secIdx].questions.length + 1}`,
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
        });
      }
      return copy;
    });
  };

  const handleRemoveQuestion = (secIdx: number, qIdx: number) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[secIdx].questions = copy[secIdx].questions.filter((_: any, i: number) => i !== qIdx);
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !code) {
      setError("Title and unique test code are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title,
        description,
        code,
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
      onSaved();
    } catch (err: any) {
      setError(err.message || "Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

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
          <div className="bg-rose-950/50 border border-rose-900 text-rose-300 text-xs rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
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
                Assessment Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Data Structures & OOP Midterm Exam"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Test Code
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="JAVA-101"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono uppercase text-white focus:outline-none focus:border-emerald-500"
              />
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
            <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              <span className="text-slate-500">Duration:</span>
              <input
                type="number"
                min={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 text-center"
              />
              <span>Minutes</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Time with Calendar & Clock */}
            <DateTimePicker
              label="Exam Start Time"
              value={startTime}
              onChange={setStartTime}
              helperText="Students cannot open the test before this scheduled timestamp."
            />

            {/* End Cut-off Time with Calendar & Clock */}
            <DateTimePicker
              label="Exam Cut-off / End Time"
              value={endTime}
              onChange={setEndTime}
              helperText="After this deadline, the assessment closes and auto-submits."
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
                Shuffle Question Sequence per Student
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
        <div className="space-y-6">
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

          {sections.map((sec, secIdx) => (
            <div key={sec.id || secIdx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex-1 min-w-[250px] flex items-center gap-3">
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => {
                      const copy = [...sections];
                      copy[secIdx].title = e.target.value;
                      setSections(copy);
                    }}
                    className="font-bold text-sm text-white bg-transparent border-b border-dashed border-slate-700 pb-0.5 focus:outline-none focus:border-emerald-500 w-full"
                  />
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
              <div className="space-y-4">
                {sec.questions.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No questions in this section yet. Click "+ MCQ Question" or "+ Coding Problem" above.
                  </p>
                ) : (
                  sec.questions.map((q: any, qIdx: number) => (
                    <div key={q.id || qIdx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                            q.type === "MCQ" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {q.type}
                          </span>
                          <span className="font-bold text-xs text-white">Q{qIdx + 1}: {q.title}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(secIdx, qIdx)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Remove Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Question Title</label>
                          <input
                            type="text"
                            value={q.title}
                            onChange={(e) => {
                              const copy = [...sections];
                              copy[secIdx].questions[qIdx].title = e.target.value;
                              setSections(copy);
                            }}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Marks</label>
                          <input
                            type="number"
                            value={q.marks}
                            onChange={(e) => {
                              const copy = [...sections];
                              copy[secIdx].questions[qIdx].marks = Number(e.target.value);
                              setSections(copy);
                            }}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                          />
                        </div>

                        {q.type === "MCQ" ? (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Negative Penalty</label>
                            <input
                              type="number"
                              step="0.25"
                              value={q.negativeMarks || 0}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[secIdx].questions[qIdx].negativeMarks = Number(e.target.value);
                                setSections(copy);
                              }}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-rose-400 font-mono"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Allowed Languages</label>
                            <input
                              type="text"
                              value={q.allowedLanguages || "JAVA,C,CPP"}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[secIdx].questions[qIdx].allowedLanguages = e.target.value;
                                setSections(copy);
                              }}
                              placeholder="JAVA,C,CPP"
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Question Description & Code Snippets (Markdown supported)
                        </label>
                        <textarea
                          rows={3}
                          value={q.description}
                          onChange={(e) => {
                            const copy = [...sections];
                            copy[secIdx].questions[qIdx].description = e.target.value;
                            setSections(copy);
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white"
                        />
                      </div>

                      {/* MCQ Options Config */}
                      {q.type === "MCQ" && (
                        <div className="space-y-3 pt-2 border-t border-slate-800">
                          <span className="text-[11px] font-bold uppercase text-amber-400 block">
                            MCQ Options (Check radio button for the correct option):
                          </span>
                          <div className="space-y-2">
                            {(q.options || []).map((opt: any, optIdx: number) => {
                              const isCorrect = (q.correctAnswers || []).includes(opt.id);
                              return (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${secIdx}-${qIdx}`}
                                    checked={isCorrect}
                                    onChange={() => {
                                      const copy = [...sections];
                                      copy[secIdx].questions[qIdx].correctAnswers = [opt.id];
                                      setSections(copy);
                                    }}
                                    className="w-4 h-4 text-emerald-600 cursor-pointer"
                                  />
                                  <span className="font-bold font-mono text-xs w-5 text-slate-400">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => {
                                      const copy = [...sections];
                                      copy[secIdx].questions[qIdx].options[optIdx].text = e.target.value;
                                      setSections(copy);
                                    }}
                                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                                  />
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
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[secIdx].questions[qIdx].explanation = e.target.value;
                                setSections(copy);
                              }}
                              placeholder="Explanation for why the correct option is right..."
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* Coding Test Cases & Starter Boilerplates */}
                      {q.type === "CODING" && (
                        <div className="space-y-3 pt-2 border-t border-slate-800">
                          {/* Language Starter Code Boilerplates */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase text-slate-300 block">
                              Language Starter Boilerplates (Java, C, C++)
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-amber-400 block mb-1">Java Starter Code</span>
                                <textarea
                                  rows={4}
                                  value={q.starterCodes?.JAVA || ""}
                                  onChange={(e) => {
                                    const copy = [...sections];
                                    copy[secIdx].questions[qIdx].starterCodes = {
                                      ...(copy[secIdx].questions[qIdx].starterCodes || {}),
                                      JAVA: e.target.value,
                                    };
                                    copy[secIdx].questions[qIdx].starterCode = e.target.value;
                                    setSections(copy);
                                  }}
                                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-200"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-blue-400 block mb-1">C Starter Code</span>
                                <textarea
                                  rows={4}
                                  value={q.starterCodes?.C || ""}
                                  onChange={(e) => {
                                    const copy = [...sections];
                                    copy[secIdx].questions[qIdx].starterCodes = {
                                      ...(copy[secIdx].questions[qIdx].starterCodes || {}),
                                      C: e.target.value,
                                    };
                                    setSections(copy);
                                  }}
                                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-200"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-cyan-400 block mb-1">C++ Starter Code</span>
                                <textarea
                                  rows={4}
                                  value={q.starterCodes?.CPP || ""}
                                  onChange={(e) => {
                                    const copy = [...sections];
                                    copy[secIdx].questions[qIdx].starterCodes = {
                                      ...(copy[secIdx].questions[qIdx].starterCodes || {}),
                                      CPP: e.target.value,
                                    };
                                    setSections(copy);
                                  }}
                                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-200"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <span className="text-[11px] font-bold uppercase text-emerald-400">
                              Test Cases (Open & Closed Evaluation)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...sections];
                                copy[secIdx].questions[qIdx].testCases = [
                                  ...(copy[secIdx].questions[qIdx].testCases || []),
                                  { input: "", expectedOutput: "", isPublic: true, weight: 1 },
                                ];
                                setSections(copy);
                              }}
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
                                    onChange={(e) => {
                                      const copy = [...sections];
                                      copy[secIdx].questions[qIdx].testCases[tcIdx].input = e.target.value;
                                      setSections(copy);
                                    }}
                                    className="w-full p-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-white"
                                  />
                                </div>

                                <div className="flex-1 min-w-[140px]">
                                  <span className="block text-[10px] text-slate-500 uppercase">Expected Output</span>
                                  <textarea
                                    rows={1}
                                    value={tc.expectedOutput}
                                    onChange={(e) => {
                                      const copy = [...sections];
                                      copy[secIdx].questions[qIdx].testCases[tcIdx].expectedOutput = e.target.value;
                                      setSections(copy);
                                    }}
                                    className="w-full p-1 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-white"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = [...sections];
                                    copy[secIdx].questions[qIdx].testCases[tcIdx].isPublic = !copy[secIdx].questions[qIdx].testCases[tcIdx].isPublic;
                                    setSections(copy);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                    tc.isPublic ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-purple-950 text-purple-400 border-purple-800"
                                  }`}
                                >
                                  {tc.isPublic ? "Open (Sample)" : "Closed (Hidden)"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const copy = [...sections];
                                    copy[secIdx].questions[qIdx].testCases = copy[secIdx].questions[qIdx].testCases.filter((_: any, i: number) => i !== tcIdx);
                                    setSections(copy);
                                  }}
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
      </main>
    </div>
  );
};
