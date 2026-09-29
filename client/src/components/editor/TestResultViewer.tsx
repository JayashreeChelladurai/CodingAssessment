import React, { useState, useEffect } from "react";
import { CodingGradingResponse, TestCaseEvaluationResult } from "../../types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Terminal,
  Code2,
  Maximize2,
  Copy,
  Check,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  AlertOctagon,
  FileCode2,
} from "lucide-react";

interface TestResultViewerProps {
  gradingResult: CodingGradingResponse | null;
  customResult: any | null;
  isRunning: boolean;
  activeTab: "testcases" | "custom";
  onTabChange: (tab: "testcases" | "custom") => void;
  customInput: string;
  onCustomInputChange: (val: string) => void;
  publicTestCases?: { input: string; expectedOutput: string; isPublic: boolean }[];
}

export interface ParsedCompilerErrorItem {
  file?: string;
  line?: number;
  column?: number;
  type: string;
  message: string;
  codeSnippet?: string;
}

export interface CompilerErrorBrief {
  summary: string;
  errorCount: number;
  parsedErrors: ParsedCompilerErrorItem[];
  raw: string;
}

export function parseCompilerError(rawError: string): CompilerErrorBrief {
  if (!rawError) return { summary: "Compilation failed", errorCount: 0, parsedErrors: [], raw: "" };

  const lines = rawError.split("\n");
  const parsedErrors: ParsedCompilerErrorItem[] = [];

  // Match standard Java, GCC (C/C++) error patterns:
  // e.g. "Solution.java:5: error: ';' expected"
  // e.g. "Solution.c:7:12: error: expected ';' before 'return'"
  const errorRegex = /(?:([a-zA-Z0-9_.]+\.(?:java|c|cpp|cc)):)?(\d+)(?::(\d+))?:\s*(?:fatal\s+)?error:\s*(.+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(errorRegex);
    if (match) {
      const file = match[1];
      const lineNum = parseInt(match[2], 10);
      const colNum = match[3] ? parseInt(match[3], 10) : undefined;
      const rawMsg = match[4].trim();

      // Gather snippet (next 1-3 lines if they contain code and pointer ^)
      let snippet = "";
      if (i + 1 < lines.length && !lines[i + 1].match(errorRegex)) {
        snippet += lines[i + 1] + "\n";
        if (i + 2 < lines.length && lines[i + 2].includes("^")) {
          snippet += lines[i + 2];
        }
      }

      // Generate human-friendly brief description
      let friendlyType = "Syntax Error";
      let friendlyDesc = rawMsg;

      if (/';'\s*expected/i.test(rawMsg)) {
        friendlyType = "Missing Semicolon";
        friendlyDesc = `Missing semicolon ';' at line ${lineNum}`;
      } else if (/cannot find symbol/i.test(rawMsg)) {
        friendlyType = "Undefined Identifier / Variable";
        const symbolLine = lines.slice(i, i + 4).find((l) => l.includes("symbol:"));
        if (symbolLine) {
          friendlyDesc = `Undefined identifier (${symbolLine.trim()}) at line ${lineNum}`;
        } else {
          friendlyDesc = `Symbol or variable cannot be found at line ${lineNum}`;
        }
      } else if (/incompatible types/i.test(rawMsg)) {
        friendlyType = "Type Mismatch";
        friendlyDesc = `Incompatible data types at line ${lineNum}: ${rawMsg}`;
      } else if (/class.*is public, should be declared in a file/i.test(rawMsg)) {
        friendlyType = "Class Name Mismatch";
        friendlyDesc = "Public class name must match 'Solution'";
      } else if (/missing return statement/i.test(rawMsg)) {
        friendlyType = "Missing Return Statement";
        friendlyDesc = `Method requires a return statement at line ${lineNum}`;
      } else if (/reached end of file while parsing/i.test(rawMsg) || /expected '\}'/i.test(rawMsg)) {
        friendlyType = "Unclosed Bracket / Block";
        friendlyDesc = "Missing closing brace '}' or parenthesis";
      } else if (/illegal start of expression/i.test(rawMsg)) {
        friendlyType = "Syntax Expression Error";
        friendlyDesc = `Illegal start of expression at line ${lineNum}`;
      }

      parsedErrors.push({
        file,
        line: lineNum,
        column: colNum,
        type: friendlyType,
        message: friendlyDesc,
        codeSnippet: snippet.trim() || undefined,
      });
    }
  }

  const errorCount = parsedErrors.length > 0 ? parsedErrors.length : 1;
  const mainBrief =
    parsedErrors.length > 0
      ? parsedErrors.map((e) => `Line ${e.line}: ${e.message}`).join(" • ")
      : rawError.split("\n")[0] || "Compilation failed";

  return {
    summary: mainBrief,
    errorCount,
    parsedErrors,
    raw: rawError,
  };
}

export const TestResultViewer: React.FC<TestResultViewerProps> = ({
  gradingResult,
  customResult,
  isRunning,
  activeTab,
  onTabChange,
  customInput,
  onCustomInputChange,
  publicTestCases = [],
}) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [filter, setFilter] = useState<"ALL" | "FAILED" | "PASSED">("ALL");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showFullRawCompilerLog, setShowFullRawCompilerLog] = useState<boolean>(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState<boolean>(false);

  const results: TestCaseEvaluationResult[] = gradingResult?.results || [];
  const allCases = results.length > 0 ? results : publicTestCases;
  const failedCount = results.filter((r) => !r.passed).length;
  const passedCount = results.filter((r) => r.passed).length;

  // Failing cases index list for quick navigation
  const failingCaseIndices = results
    .map((r, idx) => (!r.passed ? idx : -1))
    .filter((idx) => idx !== -1);

  // Auto-focus first failing case when grading results arrive with failures
  useEffect(() => {
    if (gradingResult) {
      if (gradingResult.status === "COMPILE_ERROR") {
        // compiler error: stay on top panel
      } else {
        const firstFailed = results.findIndex((r) => !r.passed);
        if (firstFailed >= 0) {
          setSelectedCaseIdx(firstFailed);
        }
      }
    }
  }, [gradingResult]);

  const filteredCases = allCases
    .map((tc, originalIdx) => ({ tc, originalIdx }))
    .filter(({ tc }) => {
      const anyTc = tc as any;
      if (filter === "FAILED") return anyTc.passed === false;
      if (filter === "PASSED") return anyTc.passed === true;
      return true;
    });

  const activeTestCase =
    results[selectedCaseIdx] ||
    (publicTestCases[selectedCaseIdx]
      ? {
          input: publicTestCases[selectedCaseIdx].input,
          expectedOutput: publicTestCases[selectedCaseIdx].expectedOutput,
          isPublic: true,
          passed: false,
          status: "UNTESTED" as any,
          stdout: "",
          stderr: "",
          executionTimeMs: 0,
          scoreAwarded: 0,
          weight: 1,
        }
      : null);

  const isCurrentCaseFailed = activeTestCase ? !activeTestCase.passed && (activeTestCase.status as string) !== "UNTESTED" : false;

  const handleCopyText = (key: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const handleDebugInCustomInput = (inputVal: string) => {
    onCustomInputChange(inputVal);
    onTabChange("custom");
    setIsInspectModalOpen(false);
  };

  const handleNavigateFailing = (direction: "prev" | "next") => {
    if (failingCaseIndices.length === 0) return;
    const currentPos = failingCaseIndices.indexOf(selectedCaseIdx);
    if (direction === "prev") {
      const prevPos = currentPos > 0 ? currentPos - 1 : failingCaseIndices.length - 1;
      setSelectedCaseIdx(failingCaseIndices[prevPos]);
    } else {
      const nextPos = currentPos < failingCaseIndices.length - 1 ? currentPos + 1 : 0;
      setSelectedCaseIdx(failingCaseIndices[nextPos]);
    }
  };

  // Compile Error Parser
  const compileErrorBrief =
    gradingResult?.status === "COMPILE_ERROR" || gradingResult?.compilationError
      ? parseCompilerError(gradingResult.compilationError || activeTestCase?.compilationError || "")
      : null;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-sm">
      {/* Top Header Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange("testcases")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "testcases"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Test Cases</span>
            {gradingResult && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded text-[10px] ${
                  gradingResult.passedTestCases === gradingResult.totalTestCases
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {gradingResult.passedTestCases}/{gradingResult.totalTestCases}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange("custom")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "custom"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Custom Input</span>
          </button>
        </div>

        {/* Global Status Badge */}
        {gradingResult && activeTab === "testcases" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Score: <strong className="text-emerald-400">{gradingResult.totalScore}</strong> / {gradingResult.maxScore}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                gradingResult.status === "ACCEPTED"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : gradingResult.status === "TIME_LIMIT_EXCEEDED"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {gradingResult.status === "ACCEPTED" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {gradingResult.status === "WRONG_ANSWER" && <XCircle className="w-3.5 h-3.5" />}
              {gradingResult.status === "TIME_LIMIT_EXCEEDED" && <Clock className="w-3.5 h-3.5" />}
              {gradingResult.status === "COMPILE_ERROR" && <AlertOctagon className="w-3.5 h-3.5" />}
              {gradingResult.status === "RUNTIME_ERROR" && <AlertTriangle className="w-3.5 h-3.5" />}
              {gradingResult.status.replace(/_/g, " ")}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isRunning ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium animate-pulse">Compiling & Executing Code against testcases...</p>
          </div>
        ) : activeTab === "custom" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Standard Input (stdin)
              </label>
              <textarea
                value={customInput}
                onChange={(e) => onCustomInputChange(e.target.value)}
                placeholder="Enter input here (e.g. array elements, strings)..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {customResult && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Execution Result:</span>
                  <span className="font-mono text-slate-400">{customResult.executionTimeMs || 0} ms</span>
                </div>
                {customResult.stdout && (
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      Standard Output (stdout)
                    </span>
                    <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                      {customResult.stdout}
                    </pre>
                  </div>
                )}
                {customResult.stderr && (
                  <div>
                    <span className="block text-[11px] font-semibold text-rose-400 uppercase mb-1">
                      Errors / Exceptions
                    </span>
                    <pre className="bg-rose-950/40 p-3 rounded-lg font-mono text-xs text-rose-300 border border-rose-900/50 overflow-x-auto whitespace-pre-wrap">
                      {customResult.stderr}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. DEDICATED COMPILER ERROR BRIEF PANEL */}
            {compileErrorBrief && (
              <div className="bg-gradient-to-r from-rose-950/70 via-rose-900/30 to-slate-950 border border-rose-800/80 rounded-2xl p-4 space-y-3 shadow-lg shadow-rose-950/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-rose-400">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Compilation Error</h4>
                      <p className="text-xs text-rose-300">
                        {compileErrorBrief.errorCount > 1
                          ? `${compileErrorBrief.errorCount} errors detected during compilation`
                          : "1 error detected during compilation"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowFullRawCompilerLog((prev) => !prev)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition"
                  >
                    {showFullRawCompilerLog ? "Hide Full Log" : "View Full Log"}
                  </button>
                </div>

                {/* Brief Summary Box */}
                <div className="bg-slate-950/90 border border-rose-900/50 rounded-xl p-3 space-y-2">
                  <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Brief Error Summary:</span>
                  </div>
                  {compileErrorBrief.parsedErrors.length > 0 ? (
                    <div className="space-y-2">
                      {compileErrorBrief.parsedErrors.map((err, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                              {err.type}
                            </span>
                            {err.line && <span className="font-mono text-amber-300 font-bold">Line {err.line}</span>}
                            <span className="text-slate-200">{err.message}</span>
                          </div>
                          {err.codeSnippet && (
                            <pre className="bg-slate-900 p-2 rounded text-[11px] font-mono text-slate-300 border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                              {err.codeSnippet}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-rose-200">{compileErrorBrief.summary}</p>
                  )}
                </div>

                {/* Collapsible Raw Compiler Output */}
                {showFullRawCompilerLog && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Raw Compiler Trace (javac/gcc)
                    </span>
                    <pre className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-rose-300 border border-rose-950 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {compileErrorBrief.raw}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* 2. FAILING CASES QUICK ALERT BANNER & OPEN ACTION */}
            {failedCount > 0 && (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-rose-300">
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>
                    <strong>{failedCount}</strong> of <strong>{allCases.length}</strong> test cases failed. Inspect
                    input, expected output, and stdout to fix your logic.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFilter("FAILED");
                      const firstFailed = results.findIndex((r) => !r.passed);
                      if (firstFailed >= 0) setSelectedCaseIdx(firstFailed);
                      setIsInspectModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Open Failing Case #{selectedCaseIdx + 1}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Filter Tabs & Test Case Counter */}
            <div className="flex items-center justify-between gap-2 pb-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Test Cases ({allCases.length} Total)
              </span>
              {results.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setFilter("ALL")}
                    className={`px-2 py-0.5 rounded font-semibold transition ${
                      filter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({results.length})
                  </button>
                  {failedCount > 0 && (
                    <button
                      onClick={() => {
                        setFilter("FAILED");
                        const firstFailed = results.findIndex((r) => !r.passed);
                        if (firstFailed >= 0) setSelectedCaseIdx(firstFailed);
                      }}
                      className={`px-2 py-0.5 rounded font-semibold transition flex items-center gap-1 ${
                        filter === "FAILED"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "text-rose-400 hover:bg-rose-950/40"
                      }`}
                    >
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span>Failed ({failedCount})</span>
                    </button>
                  )}
                  {passedCount > 0 && (
                    <button
                      onClick={() => setFilter("PASSED")}
                      className={`px-2 py-0.5 rounded font-semibold transition flex items-center gap-1 ${
                        filter === "PASSED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "text-emerald-400 hover:bg-emerald-950/40"
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Passed ({passedCount})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Test Case Selection Pills */}
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {filteredCases.map(({ tc, originalIdx }) => {
                const anyTc = tc as any;
                const isPassed = anyTc.passed;
                const isTested = anyTc.status && anyTc.status !== "UNTESTED";
                const isSelected = selectedCaseIdx === originalIdx;
                return (
                  <button
                    key={originalIdx}
                    onClick={() => setSelectedCaseIdx(originalIdx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      isSelected
                        ? isPassed
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow-sm"
                          : "bg-rose-950/80 text-rose-300 border-rose-600 shadow-sm"
                        : "bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/50"
                    }`}
                  >
                    {isTested && (
                      <span className={`w-2 h-2 rounded-full ${isPassed ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                    )}
                    <span>Case {originalIdx + 1}</span>
                    {!tc.isPublic && <span className="text-[10px] text-slate-500">(Hidden)</span>}
                  </button>
                );
              })}
            </div>

            {/* 4. Selected Case Details Card */}
            {activeTestCase && (
              <div
                className={`space-y-3 rounded-2xl p-4 border transition ${
                  isCurrentCaseFailed
                    ? "bg-slate-950/80 border-rose-900/60"
                    : "bg-slate-950/60 border-slate-800/80"
                }`}
              >
                {/* Case Header & Quick Actions */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">Test Case #{selectedCaseIdx + 1}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        activeTestCase.passed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : (activeTestCase.status as string) === "UNTESTED"
                          ? "bg-slate-800 text-slate-400"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {activeTestCase.status}
                    </span>
                    {activeTestCase.executionTimeMs > 0 && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {activeTestCase.executionTimeMs} ms
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsInspectModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                      title="Open full expanded view of this test case"
                    >
                      <Maximize2 className="w-3 h-3 text-slate-400" />
                      <span>Open Case Inspector</span>
                    </button>
                  </div>
                </div>

                {/* Input with Copy & Debug buttons */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Input</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyText("input", activeTestCase.input)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                      >
                        {copiedKey === "input" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "input" ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        onClick={() => handleDebugInCustomInput(activeTestCase.input)}
                        className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 transition font-medium"
                      >
                        <Play className="w-3 h-3" />
                        <span>Debug in Custom Input</span>
                      </button>
                    </div>
                  </div>
                  <pre className="bg-slate-950 p-2.5 rounded-lg font-mono text-xs text-slate-200 border border-slate-800/80 overflow-x-auto whitespace-pre-wrap max-h-32">
                    {activeTestCase.input || "(empty input)"}
                  </pre>
                </div>

                {/* Expected Output */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expected Output</span>
                    <button
                      onClick={() => handleCopyText("expected", activeTestCase.expectedOutput)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                    >
                      {copiedKey === "expected" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "expected" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-2.5 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800/80 overflow-x-auto whitespace-pre-wrap max-h-32">
                    {activeTestCase.expectedOutput}
                  </pre>
                </div>

                {/* Your Output */}
                {activeTestCase.stdout !== undefined && activeTestCase.stdout !== "" && (
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Your Output
                    </span>
                    <pre
                      className={`p-2.5 rounded-lg font-mono text-xs border overflow-x-auto whitespace-pre-wrap max-h-32 ${
                        activeTestCase.passed
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40"
                          : "bg-rose-950/20 text-rose-300 border-rose-900/40"
                      }`}
                    >
                      {activeTestCase.stdout}
                    </pre>
                  </div>
                )}

                {/* Stderr / Execution Error */}
                {activeTestCase.stderr && (
                  <div>
                    <span className="block text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1">
                      Execution Error / Stderr
                    </span>
                    <pre className="bg-rose-950/30 p-2.5 rounded-lg font-mono text-xs text-rose-300 border border-rose-900/40 overflow-x-auto whitespace-pre-wrap max-h-32">
                      {activeTestCase.stderr}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. INTERACTIVE FAILING TEST CASE INSPECTOR MODAL */}
      {isInspectModalOpen && activeTestCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm ${
                    activeTestCase.passed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  #{selectedCaseIdx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>Test Case #{selectedCaseIdx + 1} Details</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        activeTestCase.passed
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {activeTestCase.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeTestCase.passed ? "Test case passed successfully" : "Test case failed comparison check"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Failing Case Quick Flip */}
                {failingCaseIndices.length > 1 && (
                  <div className="flex items-center gap-1 mr-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => handleNavigateFailing("prev")}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition"
                      title="Previous failing testcase"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-bold px-1 text-slate-400">
                      {failingCaseIndices.indexOf(selectedCaseIdx) + 1} / {failingCaseIndices.length} Failing
                    </span>
                    <button
                      onClick={() => handleNavigateFailing("next")}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition"
                      title="Next failing testcase"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setIsInspectModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">Test Case Input:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopyText("modal_input", activeTestCase.input)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      {copiedKey === "modal_input" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "modal_input" ? "Copied" : "Copy Input"}</span>
                    </button>
                    <button
                      onClick={() => handleDebugInCustomInput(activeTestCase.input)}
                      className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold transition"
                    >
                      <Play className="w-3 h-3" />
                      <span>Debug with this Input</span>
                    </button>
                  </div>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto whitespace-pre-wrap max-h-40">
                  {activeTestCase.input || "(empty input)"}
                </pre>
              </div>

              {/* Side-by-Side or Stacked Expected vs Actual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Expected */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 uppercase tracking-wider">Expected Output</span>
                    <button
                      onClick={() => handleCopyText("modal_expected", activeTestCase.expectedOutput)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      {copiedKey === "modal_expected" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "modal_expected" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-emerald-400 border border-emerald-950/60 overflow-x-auto whitespace-pre-wrap max-h-48">
                    {activeTestCase.expectedOutput}
                  </pre>
                </div>

                {/* Actual */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-rose-400 uppercase tracking-wider">Your Output</span>
                  <pre
                    className={`p-3 rounded-xl font-mono text-xs border overflow-x-auto whitespace-pre-wrap max-h-48 ${
                      activeTestCase.passed
                        ? "bg-slate-950 text-emerald-400 border-emerald-950/60"
                        : "bg-rose-950/20 text-rose-300 border-rose-900/50"
                    }`}
                  >
                    {activeTestCase.stdout !== undefined && activeTestCase.stdout !== ""
                      ? activeTestCase.stdout
                      : "(no output produced)"}
                  </pre>
                </div>
              </div>

              {/* Stderr / Runtime Exception */}
              {activeTestCase.stderr && (
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-rose-400 uppercase tracking-wider">
                    Error Log / Exception Trace:
                  </span>
                  <pre className="bg-rose-950/30 p-3 rounded-xl font-mono text-xs text-rose-300 border border-rose-900/50 overflow-x-auto whitespace-pre-wrap max-h-36">
                    {activeTestCase.stderr}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-shrink-0">
              <span className="text-xs text-slate-400">
                Execution Time: <strong className="text-white font-mono">{activeTestCase.executionTimeMs} ms</strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDebugInCustomInput(activeTestCase.input)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Copy to Custom Input & Debug</span>
                </button>
                <button
                  onClick={() => setIsInspectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
