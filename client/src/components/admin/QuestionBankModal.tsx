import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { BankQuestion, QuestionFolder } from "../../types";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Code2,
  HelpCircle,
  X,
  Plus,
  Layers,
  ArrowRight,
  CheckCircle2,
  Check,
  FileCode,
  Tag,
  Loader2,
  Lock,
} from "lucide-react";

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (selectedQuestions: BankQuestion[]) => void;
  targetSectionTitle?: string;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  onImport,
  targetSectionTitle,
}) => {
  const [folders, setFolders] = useState<QuestionFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());

  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewQuestion, setPreviewQuestion] = useState<BankQuestion | null>(null);

  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "MCQ" | "CODING">("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">("ALL");

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
      loadQuestions();
      setSelectedIds(new Set());
      setPreviewQuestion(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [selectedFolderId, typeFilter, difficultyFilter]);

  const loadFolders = async () => {
    try {
      const data = await api.getQuestionFolders();
      setFolders(data);
      // Auto-expand all folders
      const allIds = new Set<string>(data.map((f: QuestionFolder) => f.id));
      setExpandedFolderIds(allIds);
    } catch (err) {
      console.error("Failed to load folders:", err);
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
      if (data.length > 0 && !previewQuestion) {
        setPreviewQuestion(data[0]);
      }
    } catch (err) {
      console.error("Failed to load bank questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-search when search term debounce or enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuestions();
  };

  // Toggle folder expanded
  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Toggle question selection
  const toggleSelectQuestion = (qId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  // Select all or deselect all visible
  const handleToggleSelectAll = () => {
    if (selectedIds.size === questions.length && questions.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  // Confirm import
  const handleConfirmImport = () => {
    const toImport = questions.filter((q) => selectedIds.has(q.id));
    if (toImport.length === 0) return;
    onImport(toImport);
    onClose();
  };

  // Build recursive folder tree
  const rootFolders = folders.filter((f) => !f.parentId);
  const getSubfolders = (parentId: string) => folders.filter((f) => f.parentId === parentId);

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
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
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

          {folder._count && folder._count.questions > 0 ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
              {folder._count.questions}
            </span>
          ) : null}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {subfolders.map((child) => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Import Questions from Question Bank</span>
                {targetSectionTitle && (
                  <span className="text-xs font-normal text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                    Target: {targetSectionTitle}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Browse folder hierarchy, select questions, and clone them as independent questions into your assessment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Column Body */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden divide-x divide-slate-800">
          {/* Left Column: Folder Tree (col-span-3) */}
          <div className="col-span-3 flex flex-col bg-slate-950/40 min-h-0 overflow-hidden">
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Folder Hierarchy
              </span>
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className={`text-[11px] px-2 py-0.5 rounded transition ${
                  selectedFolderId === null
                    ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Folders
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div
                onClick={() => setSelectedFolderId(null)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                  selectedFolderId === null
                    ? "bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>All Bank Questions</span>
              </div>

              {rootFolders.map((folder) => renderFolderItem(folder, 0))}

              {folders.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No folders created yet.
                </div>
              )}
            </div>
          </div>

          {/* Center Column: Questions List with Filters (col-span-5) */}
          <div className="col-span-5 flex flex-col min-h-0 overflow-hidden bg-slate-900/40">
            {/* Filter Toolbar */}
            <div className="p-3 border-b border-slate-800 space-y-2 flex-shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions or tags..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </form>

              <div className="flex items-center justify-between gap-2">
                {/* Type Filter */}
                <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px]">
                  {(["ALL", "MCQ", "CODING"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTypeFilter(t)}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        typeFilter === t
                          ? "bg-slate-800 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Difficulty Filter */}
                <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px]">
                  {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficultyFilter(d)}
                      className={`px-2 py-0.5 rounded-md font-medium transition ${
                        difficultyFilter === d
                          ? "bg-slate-800 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {d === "ALL" ? "All Diff" : d[0] + d.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select All Row */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-1.5 hover:text-slate-200 transition"
                >
                  {selectedIds.size === questions.length && questions.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>Select All ({questions.length})</span>
                </button>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {selectedIds.size} selected
                </span>
              </div>
            </div>

            {/* Questions List Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading && (
                <div className="flex items-center justify-center py-12 gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Loading questions...</span>
                </div>
              )}

              {!loading && questions.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No questions match your current filters or folder.
                </div>
              )}

              {!loading &&
                questions.map((q) => {
                  const isChecked = selectedIds.has(q.id);
                  const isCurrentPreview = previewQuestion?.id === q.id;

                  return (
                    <div
                      key={q.id}
                      onClick={() => setPreviewQuestion(q)}
                      className={`p-3 rounded-xl border cursor-pointer transition relative group ${
                        isCurrentPreview
                          ? "bg-slate-800/90 border-emerald-500/50 shadow-md"
                          : isChecked
                          ? "bg-slate-800/40 border-slate-700"
                          : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/30"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => toggleSelectQuestion(q.id, e)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-400 transition flex-shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            {q.type === "MCQ" ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                <HelpCircle className="w-2.5 h-2.5" />
                                <span>MCQ</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Code2 className="w-2.5 h-2.5" />
                                <span>Coding</span>
                              </span>
                            )}

                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                q.difficulty === "EASY"
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/50"
                                  : q.difficulty === "HARD"
                                  ? "bg-rose-950/80 text-rose-300 border border-rose-800/50"
                                  : "bg-amber-950/80 text-amber-300 border border-amber-800/50"
                              }`}
                            >
                              {q.difficulty}
                            </span>

                            <span className="text-[10px] font-mono text-slate-400">
                              {q.marks} pts
                            </span>

                            {q.folder && (
                              <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                                <Folder className="w-2.5 h-2.5 text-amber-500/60" />
                                <span>{q.folder.name}</span>
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-semibold text-white line-clamp-1">
                            {q.title}
                          </h4>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {q.description}
                          </p>

                          {q.tags && (
                            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                              {q.tags
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                                .map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Live Preview Panel (col-span-4) */}
          <div className="col-span-4 flex flex-col min-h-0 overflow-hidden bg-slate-950/50">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Question Preview
              </span>
              {previewQuestion && (
                <button
                  type="button"
                  onClick={() => toggleSelectQuestion(previewQuestion.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                    selectedIds.has(previewQuestion.id)
                      ? "bg-rose-950/60 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60"
                      : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                  }`}
                >
                  {selectedIds.has(previewQuestion.id) ? (
                    <>
                      <X className="w-3 h-3" />
                      <span>Deselect</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Select This</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!previewQuestion ? (
                <div className="text-center py-20 text-slate-500 text-xs">
                  Click any question to preview its full problem statement, test cases, and configuration.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Title & Badges */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        {previewQuestion.type}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                        {previewQuestion.difficulty}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {previewQuestion.marks} Marks
                      </span>
                      {previewQuestion.negativeMarks ? (
                        <span className="text-xs font-mono text-rose-400">
                          (-{previewQuestion.negativeMarks})
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {previewQuestion.title}
                    </h3>
                  </div>

                  {/* Problem Description */}
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                      Problem Statement
                    </span>
                    <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {previewQuestion.description}
                    </div>
                  </div>

                  {/* MCQ Options Details */}
                  {previewQuestion.type === "MCQ" && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                        Options ({previewQuestion.mcqType || "SINGLE"} Choice)
                      </span>
                      {(() => {
                        try {
                          const opts = JSON.parse(previewQuestion.options || "[]");
                          const correct = JSON.parse(previewQuestion.correctAnswers || "[]");
                          return (
                            <div className="space-y-1.5">
                              {opts.map((opt: any, idx: number) => {
                                const isCorrect = correct.includes(opt.id);
                                return (
                                  <div
                                    key={opt.id || idx}
                                    className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                                      isCorrect
                                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                                        : "bg-slate-900/60 border-slate-800 text-slate-300"
                                    }`}
                                  >
                                    <span>{opt.text}</span>
                                    {isCorrect && (
                                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        <span>Correct</span>
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        } catch {
                          return <div className="text-xs text-slate-500">Invalid options data</div>;
                        }
                      })()}
                    </div>
                  )}

                  {/* Coding Details & Testcases */}
                  {previewQuestion.type === "CODING" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Language: <strong className="text-white">Java (JDK 21)</strong></span>
                        <span>Time Limit: <strong className="text-white">{previewQuestion.timeLimitSeconds}s</strong></span>
                      </div>

                      {/* Starter Code Preview */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-semibold uppercase text-purple-300 flex items-center gap-1">
                            <Code2 className="w-3 h-3 text-purple-400" />
                            <span>Starter Code Harness</span>
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/60 flex items-center gap-1 shadow-sm">
                            <Lock className="w-2.5 h-2.5 text-purple-400" />
                            <span>Non-editable</span>
                          </span>
                        </div>
                        <pre className="p-3 bg-[#131722] border border-purple-800/40 rounded-xl text-[11px] font-mono text-purple-200/90 max-h-48 overflow-y-auto whitespace-pre leading-relaxed select-all">
                          {previewQuestion.starterCode || (previewQuestion.starterCodes ? JSON.parse(previewQuestion.starterCodes)?.JAVA : "") || "// Pre-configured driver code"}
                        </pre>
                      </div>

                      {previewQuestion.testCases && previewQuestion.testCases.length > 0 && (
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1.5">
                            Test Cases ({previewQuestion.testCases.length})
                          </span>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {previewQuestion.testCases.map((tc, tcIdx) => (
                              <div
                                key={tcIdx}
                                className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono space-y-1"
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-400 font-semibold">Case #{tcIdx + 1}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                      tc.isPublic
                                        ? "bg-sky-950 text-sky-400 border border-sky-800/40"
                                        : "bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    {tc.isPublic ? "Public / Sample" : "Hidden"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[10px]">Input:</span>
                                  <pre className="text-emerald-400 bg-slate-950 p-1 rounded mt-0.5 whitespace-pre-wrap">
                                    {tc.input || "<empty>"}
                                  </pre>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[10px]">Expected:</span>
                                  <pre className="text-cyan-400 bg-slate-950 p-1 rounded mt-0.5 whitespace-pre-wrap">
                                    {tc.expectedOutput}
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-400">
            {selectedIds.size > 0 ? (
              <span>
                <strong className="text-emerald-400">{selectedIds.size}</strong> question(s) selected to import into assessment.
              </span>
            ) : (
              <span>Select one or more questions from the list to import.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Import Selected ({selectedIds.size}) Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
