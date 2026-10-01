import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { BankQuestion, QuestionFolder, TestCase } from "../types";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit2,
  MoveRight,
  Layers,
  ArrowLeft,
  Code2,
  HelpCircle,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  Tag,
  Loader2,
  MoreVertical,
  Lock,
} from "lucide-react";

interface AdminQuestionBankProps {
  onBack: () => void;
}

export const AdminQuestionBank: React.FC<AdminQuestionBankProps> = ({ onBack }) => {
  const [folders, setFolders] = useState<QuestionFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());

  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "MCQ" | "CODING">("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">("ALL");

  // Selection for bulk actions
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Modal States
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null);

  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [editingFolder, setEditingFolder] = useState<QuestionFolder | null>(null);
  const [parentFolderForNew, setParentFolderForNew] = useState<string | null>(null);

  const [showBulkUploadModal, setShowBulkUploadModal] = useState<boolean>(false);
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);

  // Notifications
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedFolderId, typeFilter, difficultyFilter]);

  const showBanner = (type: "success" | "error", text: string) => {
    setBannerMessage({ type, text });
    setTimeout(() => setBannerMessage(null), 5000);
  };

  const loadFolders = async () => {
    try {
      const data = await api.getQuestionFolders();
      setFolders(data);
      // Auto-expand all folders
      const allIds = new Set<string>(data.map((f: QuestionFolder) => f.id));
      setExpandedFolderIds(allIds);
    } catch (err: any) {
      console.error("Failed to load folders:", err);
      showBanner("error", "Failed to load folders: " + (err.message || "Unknown error"));
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const params: any = {
        includeSubfolders: true,
      };
      if (selectedFolderId) params.folderId = selectedFolderId;
      if (typeFilter !== "ALL") params.type = typeFilter;
      if (difficultyFilter !== "ALL") params.difficulty = difficultyFilter;
      if (search.trim()) params.search = search.trim();

      const data = await api.getBankQuestions(params);
      setQuestions(data);
      setSelectedQuestionIds(new Set());
    } catch (err: any) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuestions();
  };

  // Toggle folder expand
  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  // Delete question
  const handleDeleteQuestion = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete question "${title}" from the bank?`)) return;
    try {
      await api.deleteBankQuestion(id);
      showBanner("success", `Question "${title}" deleted successfully.`);
      loadQuestions();
      loadFolders();
    } catch (err: any) {
      showBanner("error", err.message || "Failed to delete question");
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folder: QuestionFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete folder "${folder.name}" and all of its subfolders and questions? This action cannot be undone.`)) return;
    try {
      await api.deleteQuestionFolder(folder.id);
      showBanner("success", `Folder "${folder.name}" deleted successfully.`);
      if (selectedFolderId === folder.id) setSelectedFolderId(null);
      loadFolders();
      loadQuestions();
    } catch (err: any) {
      showBanner("error", err.message || "Failed to delete folder");
    }
  };

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    if (!selectedFolderId) return ["All Bank Questions"];
    const crumbs: string[] = [];
    let curId: string | null | undefined = selectedFolderId;
    while (curId) {
      const f = folders.find((item) => item.id === curId);
      if (f) {
        crumbs.unshift(f.name);
        curId = f.parentId;
      } else {
        break;
      }
    }
    return ["Question Bank", ...crumbs];
  };

  const rootFolders = folders.filter((f) => !f.parentId);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  // Render recursive folder tree item
  const renderFolderItem = (folder: QuestionFolder, depth: number = 0) => {
    const subfolders = getSubfolders(folder.id);
    const hasChildren = subfolders.length > 0;
    const isExpanded = expandedFolderIds.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} className="select-none">
        <div
          onClick={() => setSelectedFolderId(folder.id)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs font-medium cursor-pointer transition ${
            isSelected
              ? "bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleFolderExpand(folder.id, e)}
                className="p-0.5 text-slate-500 hover:text-slate-300 transition"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-4" />
            )}

            {isExpanded || isSelected ? (
              <FolderOpen className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-emerald-400" : "text-amber-400"}`} />
            ) : (
              <Folder className="w-3.5 h-3.5 flex-shrink-0 text-amber-500/70" />
            )}

            <span className="truncate">{folder.name}</span>
          </div>

          <div className="flex items-center gap-1">
            {folder._count && folder._count.questions > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 group-hover:hidden">
                {folder._count.questions}
              </span>
            ) : null}

            {/* Hover action icons */}
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                type="button"
                title="Add Subfolder"
                onClick={(e) => {
                  e.stopPropagation();
                  setParentFolderForNew(folder.id);
                  setEditingFolder(null);
                  setShowFolderModal(true);
                }}
                className="p-1 hover:text-emerald-400 text-slate-500 rounded"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                title="Rename Folder"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolder(folder);
                  setParentFolderForNew(folder.parentId || null);
                  setShowFolderModal(true);
                }}
                className="p-1 hover:text-white text-slate-500 rounded"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                title="Delete Folder"
                onClick={(e) => handleDeleteFolder(folder, e)}
                className="p-1 hover:text-rose-400 text-slate-500 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {subfolders.map((child) => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Download Sample JSON
  const handleDownloadSampleJson = () => {
    const sample = [
      {
        type: "MCQ",
        title: "Java Exception Hierarchy",
        description: "Which class is the superclass of all Exception classes in Java?",
        difficulty: "EASY",
        tags: "Java, OOP, Exceptions",
        marks: 2,
        negativeMarks: 0.5,
        mcqType: "SINGLE",
        options: [
          { id: "opt-1", text: "java.lang.Object" },
          { id: "opt-2", text: "java.lang.Throwable" },
          { id: "opt-3", text: "java.lang.Error" },
          { id: "opt-4", text: "java.lang.RuntimeException" },
        ],
        correctAnswers: ["opt-2"],
        explanation: "Throwable is the superclass of both Exception and Error in Java.",
      },
      {
        type: "CODING",
        title: "Two Sum Target",
        description: "Given an array of integers `nums` and an integer `target`, return the two indices that add up to target.\n\n### Input Format:\nFirst line contains integer N.\nSecond line contains N integers.\nThird line contains target integer.\n\n### Output Format:\nPrint the two indices separated by a space.",
        difficulty: "MEDIUM",
        tags: "Arrays, Hash Table, Algorithms",
        marks: 10,
        allowedLanguages: "JAVA",
        starterCodes: {
          JAVA: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int target = sc.nextInt();\n        // Write logic here\n    }\n}\n",
          C: "#include <stdio.h>\nint main() {\n    // C solution\n    return 0;\n}\n",
          CPP: "#include <iostream>\nusing namespace std;\nint main() {\n    // C++ solution\n    return 0;\n}\n",
        },
        timeLimitSeconds: 3,
        memoryLimitMb: 256,
        testCases: [
          { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isPublic: true, weight: 1 },
          { input: "3\n3 2 4\n6", expectedOutput: "1 2", isPublic: false, weight: 2 },
        ],
      },
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question_bank_sample_template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Assessments</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">Question Bank Repository</h1>
              <p className="text-xs text-slate-400">
                Organize reusable MCQ and Coding questions in nested folders and import them into any exam
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadSampleJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Sample JSON Template</span>
          </button>

          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-950/40"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Upload Questions</span>
          </button>

          <button
            onClick={() => {
              setEditingQuestion(null);
              setShowQuestionModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </header>

      {/* Banner */}
      {bannerMessage && (
        <div
          className={`px-6 py-2.5 text-xs flex items-center justify-between ${
            bannerMessage.type === "success"
              ? "bg-emerald-950/80 text-emerald-300 border-b border-emerald-800"
              : "bg-rose-950/80 text-rose-300 border-b border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace (Left: Folders, Right: Questions) */}
      <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden divide-x divide-slate-800">
        {/* Left Column: Folders Tree */}
        <aside className="col-span-3 flex flex-col bg-slate-900/50 min-h-0 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Folder Structure
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setParentFolderForNew(null);
                setEditingFolder(null);
                setShowFolderModal(true);
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded-md transition"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New Root Folder</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div
              onClick={() => setSelectedFolderId(null)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                selectedFolderId === null
                  ? "bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>All Bank Questions</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {questions.length}
              </span>
            </div>

            <div className="pt-2 pb-1 px-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Folders & Subfolders
              </span>
            </div>

            {rootFolders.map((folder) => renderFolderItem(folder, 0))}

            {folders.length === 0 && (
              <div className="text-center py-10 text-xs text-slate-500">
                No folders created yet. Click "+ New Root Folder" above.
              </div>
            )}
          </div>
        </aside>

        {/* Right Column: Questions Grid / Explorer */}
        <main className="col-span-9 flex flex-col min-h-0 overflow-hidden bg-slate-950">
          {/* Action & Filter Toolbar */}
          <div className="p-4 border-b border-slate-800 space-y-3 flex-shrink-0">
            {/* Breadcrumb row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {getBreadcrumbs().map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                    <span className={idx === getBreadcrumbs().length - 1 ? "text-white font-semibold" : ""}>
                      {crumb}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              {selectedQuestionIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    <strong>{selectedQuestionIds.size}</strong> selected
                  </span>
                  <button
                    onClick={() => setShowMoveModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition border border-slate-700"
                  >
                    <MoveRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Move to Folder...</span>
                  </button>
                </div>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex items-center justify-between gap-3">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions by title, description, or tags..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </form>

              <div className="flex items-center gap-2">
                {/* Type Filter */}
                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
                  {(["ALL", "MCQ", "CODING"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTypeFilter(t)}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        typeFilter === t
                          ? "bg-slate-800 text-white shadow-sm font-semibold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Difficulty Filter */}
                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
                  {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficultyFilter(d)}
                      className={`px-3 py-1 rounded-lg font-medium transition ${
                        difficultyFilter === d
                          ? "bg-slate-800 text-white shadow-sm font-semibold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {d === "ALL" ? "All Diff" : d[0] + d.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-2 text-xs text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span>Loading question bank...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-24 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">No Questions in this Folder</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click "+ Add Question" to create one interactively, or "Bulk Upload Questions" to import multiple from a JSON file.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setEditingQuestion(null);
                      setShowQuestionModal(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                  >
                    + Add Question
                  </button>
                  <button
                    onClick={() => setShowBulkUploadModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
                  >
                    Upload JSON
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((q) => {
                  const isChecked = selectedQuestionIds.has(q.id);

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition group relative flex flex-col justify-between ${
                        isChecked
                          ? "bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/30"
                          : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top row: Badges & Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedQuestionIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(q.id)) next.delete(q.id);
                                  else next.add(q.id);
                                  return next;
                                });
                              }}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
                            />

                            {q.type === "MCQ" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                <HelpCircle className="w-3 h-3" />
                                <span>MCQ</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Code2 className="w-3 h-3" />
                                <span>CODING</span>
                              </span>
                            )}

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                q.difficulty === "EASY"
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/50"
                                  : q.difficulty === "HARD"
                                  ? "bg-rose-950/80 text-rose-300 border border-rose-800/50"
                                  : "bg-amber-950/80 text-amber-300 border border-amber-800/50"
                              }`}
                            >
                              {q.difficulty}
                            </span>

                            <span className="text-xs font-mono font-bold text-amber-400">
                              {q.marks} pts
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestion(q);
                                setShowQuestionModal(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="Edit Question"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id, q.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{q.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {q.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row: Folder & Tags */}
                      <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 truncate">
                          <Folder className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{q.folder?.name || "Root"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {q.type === "CODING" && (
                            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-purple-400" />
                              <span>Locked Starter</span>
                            </span>
                          )}
                          {q.type === "CODING" && q.testCases && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {q.testCases.length} test cases
                            </span>
                          )}
                          {q.type === "MCQ" && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {q.mcqType || "SINGLE"} Choice
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL 1: Create / Edit Question Modal */}
      {showQuestionModal && (
        <QuestionEditorModal
          isOpen={showQuestionModal}
          initialQuestion={editingQuestion}
          defaultFolderId={selectedFolderId}
          folders={folders}
          onClose={() => setShowQuestionModal(false)}
          onSaved={() => {
            setShowQuestionModal(false);
            showBanner("success", editingQuestion ? "Question updated successfully!" : "Question created successfully!");
            loadQuestions();
            loadFolders();
          }}
        />
      )}

      {/* MODAL 2: Create / Edit Folder Modal */}
      {showFolderModal && (
        <FolderEditorModal
          isOpen={showFolderModal}
          folder={editingFolder}
          parentId={parentFolderForNew}
          folders={folders}
          onClose={() => setShowFolderModal(false)}
          onSaved={() => {
            setShowFolderModal(false);
            showBanner("success", editingFolder ? "Folder updated!" : "Folder created!");
            loadFolders();
          }}
        />
      )}

      {/* MODAL 3: Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUploadModal
          isOpen={showBulkUploadModal}
          targetFolderId={selectedFolderId}
          folders={folders}
          onClose={() => setShowBulkUploadModal(false)}
          onUploaded={(count) => {
            setShowBulkUploadModal(false);
            showBanner("success", `Successfully uploaded ${count} question(s) into the Question Bank!`);
            loadQuestions();
            loadFolders();
          }}
        />
      )}

      {/* MODAL 4: Move Questions Modal */}
      {showMoveModal && (
        <MoveQuestionsModal
          isOpen={showMoveModal}
          questionIds={Array.from(selectedQuestionIds)}
          folders={folders}
          onClose={() => setShowMoveModal(false)}
          onMoved={() => {
            setShowMoveModal(false);
            showBanner("success", `Moved ${selectedQuestionIds.size} question(s) successfully.`);
            setSelectedQuestionIds(new Set());
            loadQuestions();
            loadFolders();
          }}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// SUB-COMPONENT: Question Editor Modal (MCQ & CODING)
// -------------------------------------------------------------
interface QuestionEditorModalProps {
  isOpen: boolean;
  initialQuestion?: BankQuestion | null;
  defaultFolderId?: string | null;
  folders: QuestionFolder[];
  onClose: () => void;
  onSaved: () => void;
}

const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  isOpen,
  initialQuestion,
  defaultFolderId,
  folders,
  onClose,
  onSaved,
}) => {
  const [type, setType] = useState<"MCQ" | "CODING">(initialQuestion?.type || "CODING");
  const [folderId, setFolderId] = useState<string>(initialQuestion?.folderId || defaultFolderId || "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(initialQuestion?.difficulty || "MEDIUM");
  const [title, setTitle] = useState<string>(initialQuestion?.title || "");
  const [description, setDescription] = useState<string>(initialQuestion?.description || "");
  const [marks, setMarks] = useState<number>(initialQuestion?.marks ?? 10);
  const [negativeMarks, setNegativeMarks] = useState<number>(initialQuestion?.negativeMarks ?? 0);
  const [tags, setTags] = useState<string>(initialQuestion?.tags || "");

  // MCQ State
  const [mcqType, setMcqType] = useState<"SINGLE" | "MULTIPLE">(
    (initialQuestion?.mcqType as any) || "SINGLE"
  );
  const [options, setOptions] = useState<{ id: string; text: string }[]>(() => {
    try {
      return initialQuestion?.options ? JSON.parse(initialQuestion.options) : [
        { id: "opt-1", text: "Option A" },
        { id: "opt-2", text: "Option B" },
        { id: "opt-3", text: "Option C" },
        { id: "opt-4", text: "Option D" },
      ];
    } catch {
      return [
        { id: "opt-1", text: "Option A" },
        { id: "opt-2", text: "Option B" },
      ];
    }
  });
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(() => {
    try {
      return initialQuestion?.correctAnswers ? JSON.parse(initialQuestion.correctAnswers) : ["opt-1"];
    } catch {
      return ["opt-1"];
    }
  });
  const [explanation, setExplanation] = useState<string>(initialQuestion?.explanation || "");

  // Coding State
  const [allowedLanguages, setAllowedLanguages] = useState<string>(
    initialQuestion?.allowedLanguages || "JAVA"
  );
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(
    initialQuestion?.timeLimitSeconds ?? 3
  );
  const [memoryLimitMb, setMemoryLimitMb] = useState<number>(
    initialQuestion?.memoryLimitMb ?? 256
  );
  const [starterCodes, setStarterCodes] = useState<Record<string, string>>(() => {
    try {
      return initialQuestion?.starterCodes
        ? JSON.parse(initialQuestion.starterCodes)
        : {
            JAVA: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Code\n    }\n}\n",
            C: "#include <stdio.h>\n\nint main() {\n    return 0;\n}\n",
            CPP: "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n",
          };
    } catch {
      return {};
    }
  });
  const [activeCodeTab, setActiveCodeTab] = useState<string>("JAVA");

  const [testCases, setTestCases] = useState<TestCase[]>(() => {
    if (initialQuestion?.testCases && initialQuestion.testCases.length > 0) {
      return initialQuestion.testCases;
    }
    return [{ input: "", expectedOutput: "", isPublic: true, weight: 1 }];
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Question Title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        folderId: folderId || null,
        type,
        difficulty,
        title: title.trim(),
        description,
        marks: Number(marks) || 0,
        negativeMarks: Number(negativeMarks) || 0,
        tags: tags.trim(),

        // MCQ
        mcqType,
        options,
        correctAnswers,
        explanation,

        // Coding
        allowedLanguages,
        starterCodes,
        timeLimitSeconds: Number(timeLimitSeconds) || 3,
        memoryLimitMb: Number(memoryLimitMb) || 256,
        testCases,
      };

      if (initialQuestion?.id) {
        await api.updateBankQuestion(initialQuestion.id, payload);
      } else {
        await api.createBankQuestion(payload);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              {type === "MCQ" ? <HelpCircle className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialQuestion ? "Edit Bank Question" : "Create Bank Question"}
              </h3>
              <p className="text-xs text-slate-400">
                Define reusable question parameters, test cases, and difficulty
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Top metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Question Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="CODING">Coding Problem</option>
                <option value="MCQ">Multiple Choice (MCQ)</option>
              </select>
            </div>

            {/* Folder */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Folder</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Root (No Folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Marks */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Marks</label>
              <input
                type="number"
                min="1"
                max="100"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Question Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Reverse a Linked List"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Problem Statement / Description (Markdown Supported)
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter comprehensive problem statement, input/output formats, and constraints..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Arrays, Two Pointers, Dynamic Programming, Java"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* MCQ SPECIFIC SECTION */}
          {type === "MCQ" && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Options & Correct Answer
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mcqType"
                      checked={mcqType === "SINGLE"}
                      onChange={() => setMcqType("SINGLE")}
                    />
                    <span>Single Choice</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="mcqType"
                      checked={mcqType === "MULTIPLE"}
                      onChange={() => setMcqType("MULTIPLE")}
                    />
                    <span>Multiple Choice</span>
                  </label>
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-2">
                {options.map((opt, idx) => {
                  const isCorrect = correctAnswers.includes(opt.id);
                  return (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (mcqType === "SINGLE") {
                            setCorrectAnswers([opt.id]);
                          } else {
                            setCorrectAnswers((prev) =>
                              prev.includes(opt.id) ? prev.filter((id) => id !== opt.id) : [...prev, opt.id]
                            );
                          }
                        }}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition border ${
                          isCorrect
                            ? "bg-emerald-600 border-emerald-500 text-white"
                            : "bg-slate-950 border-slate-800 text-transparent hover:border-slate-600"
                        }`}
                        title="Mark as correct answer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOptions((prev) => prev.map((o) => (o.id === opt.id ? { ...o, text: val } : o)));
                        }}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setOptions((prev) => prev.filter((o) => o.id !== opt.id));
                            setCorrectAnswers((prev) => prev.filter((id) => id !== opt.id));
                          }}
                          className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    const newId = `opt-${Date.now()}`;
                    setOptions((prev) => [...prev, { id: newId, text: "" }]);
                  }}
                  className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Option</span>
                </button>
              </div>

              {/* Negative Marks & Explanation */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Negative Penalty
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Solution Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Explanation displayed in review mode"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CODING SPECIFIC SECTION */}
          {type === "CODING" && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Coding Execution & Starter Code
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center gap-1.5 shadow-sm">
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>Non-editable (Read-Only)</span>
                </span>
              </div>

              {/* Languages & Boilerplates */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {(["JAVA", "C", "CPP"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveCodeTab(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                        activeCodeTab === lang
                          ? "bg-purple-900/60 text-purple-200 border border-purple-700/60"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {lang} Starter Code
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <textarea
                    rows={8}
                    readOnly
                    value={starterCodes[activeCodeTab] || ""}
                    className="w-full p-3.5 bg-[#131722] border border-purple-800/40 rounded-xl text-xs text-purple-200/90 font-mono select-all focus:outline-none cursor-not-allowed selection:bg-purple-900 selection:text-white"
                  />
                  <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>
                      <strong className="text-purple-300">Question Bank Driver:</strong> Starter code includes the standardized automated test runner & driver. It is locked across all questions in QB to guarantee evaluation integrity.
                    </span>
                  </div>
                </div>
              </div>

              {/* Test Cases Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Test Cases ({testCases.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTestCases((prev) => [
                        ...prev,
                        { input: "", expectedOutput: "", isPublic: false, weight: 1 },
                      ]);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Test Case</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {testCases.map((tc, tcIdx) => (
                    <div key={tcIdx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                          Case #{tcIdx + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.isPublic}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setTestCases((prev) =>
                                  prev.map((c, i) => (i === tcIdx ? { ...c, isPublic: checked } : c))
                                );
                              }}
                            />
                            <span>Public / Sample Test Case</span>
                          </label>

                          {testCases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setTestCases((prev) => prev.filter((_, i) => i !== tcIdx));
                              }}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Standard Input</label>
                          <textarea
                            rows={2}
                            value={tc.input}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTestCases((prev) =>
                                prev.map((c, i) => (i === tcIdx ? { ...c, input: val } : c))
                              );
                            }}
                            placeholder="e.g. 5\n1 2 3 4 5"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Expected Output</label>
                          <textarea
                            rows={2}
                            value={tc.expectedOutput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTestCases((prev) =>
                                prev.map((c, i) => (i === tcIdx ? { ...c, expectedOutput: val } : c))
                              );
                            }}
                            placeholder="e.g. 15"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition shadow-lg shadow-emerald-950/40 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{saving ? "Saving..." : initialQuestion ? "Update Question" : "Create Question"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// SUB-COMPONENT: Folder Editor Modal (Create / Rename / Move)
// -------------------------------------------------------------
interface FolderEditorModalProps {
  isOpen: boolean;
  folder?: QuestionFolder | null;
  parentId?: string | null;
  folders: QuestionFolder[];
  onClose: () => void;
  onSaved: () => void;
}

const FolderEditorModal: React.FC<FolderEditorModalProps> = ({
  isOpen,
  folder,
  parentId,
  folders,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState<string>(folder?.name || "");
  const [description, setDescription] = useState<string>(folder?.description || "");
  const [targetParentId, setTargetParentId] = useState<string>(folder?.parentId || parentId || "");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Folder Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: name.trim(),
        description: description.trim(),
        parentId: targetParentId || null,
      };

      if (folder?.id) {
        await api.updateQuestionFolder(folder.id, payload);
      } else {
        await api.createQuestionFolder(payload);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || "Failed to save folder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-amber-400" />
            <span>{folder ? "Edit Folder" : "New Folder"}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dynamic Programming, Java MCQ, Hard"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Parent Folder (Optional)
            </label>
            <select
              value={targetParentId}
              onChange={(e) => setTargetParentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">None (Root Level Folder)</option>
              {folders
                .filter((f) => !folder || f.id !== folder.id)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of questions inside this folder"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : folder ? "Save Changes" : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// SUB-COMPONENT: Bulk Upload Modal (JSON / CSV)
// -------------------------------------------------------------
interface BulkUploadModalProps {
  isOpen: boolean;
  targetFolderId?: string | null;
  folders: QuestionFolder[];
  onClose: () => void;
  onUploaded: (count: number) => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  targetFolderId,
  folders,
  onClose,
  onUploaded,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>(targetFolderId || "");
  const [jsonText, setJsonText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Validate JSON
        JSON.parse(content);
        setJsonText(content);
        setError("");
      } catch (err: any) {
        setError("Invalid JSON format in uploaded file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async () => {
    if (!jsonText.trim()) {
      setError("Please paste or select a JSON file containing an array of questions.");
      return;
    }

    let parsedQuestions: any[];
    try {
      parsedQuestions = JSON.parse(jsonText);
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("JSON root must be an array of questions: [ { ... }, { ... } ]");
      }
    } catch (err: any) {
      setError("JSON Parsing Error: " + err.message);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.bulkUploadBankQuestions(selectedFolder || null, parsedQuestions);
      onUploaded(res.count || parsedQuestions.length);
    } catch (err: any) {
      setError(err.message || "Bulk upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span>Bulk Upload Questions to Question Bank</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Target Folder */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
            Destination Folder
          </label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Root Level (No Folder)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* File chooser */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
            Upload .json File
          </label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
          />
        </div>

        {/* JSON textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
            Or Paste JSON Array Here
          </label>
          <textarea
            rows={10}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='[ { "title": "Example Problem", "type": "CODING", "marks": 10, ... } ]'
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || !jsonText.trim()}
            onClick={handleUploadSubmit}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition flex items-center gap-2 shadow-lg shadow-indigo-950/40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{loading ? "Uploading..." : "Import into Bank"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// SUB-COMPONENT: Move Questions Modal
// -------------------------------------------------------------
interface MoveQuestionsModalProps {
  isOpen: boolean;
  questionIds: string[];
  folders: QuestionFolder[];
  onClose: () => void;
  onMoved: () => void;
}

const MoveQuestionsModal: React.FC<MoveQuestionsModalProps> = ({
  isOpen,
  questionIds,
  folders,
  onClose,
  onMoved,
}) => {
  const [targetFolderId, setTargetFolderId] = useState<string>("");
  const [moving, setMoving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleMove = async () => {
    try {
      setMoving(true);
      setError("");
      await api.moveBankQuestions(questionIds, targetFolderId || null);
      onMoved();
    } catch (err: any) {
      setError(err.message || "Failed to move questions");
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MoveRight className="w-5 h-5 text-emerald-400" />
            <span>Move Questions to Folder</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <p className="text-xs text-slate-400">
          Moving <strong className="text-white">{questionIds.length}</strong> selected question(s) to:
        </p>

        <div>
          <select
            value={targetFolderId}
            onChange={(e) => setTargetFolderId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">Root Level (No Folder)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={moving}
            onClick={handleMove}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition"
          >
            {moving ? "Moving..." : "Confirm Move"}
          </button>
        </div>
      </div>
    </div>
  );
};
