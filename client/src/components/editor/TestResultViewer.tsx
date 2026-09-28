import React, { useState } from "react";
import { CodingGradingResponse, TestCaseEvaluationResult } from "../../types";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Terminal, Code2 } from "lucide-react";

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

  const results: TestCaseEvaluationResult[] = gradingResult?.results || [];
  const activeTestCase = results[selectedCaseIdx] || (publicTestCases[selectedCaseIdx] ? {
    input: publicTestCases[selectedCaseIdx].input,
    expectedOutput: publicTestCases[selectedCaseIdx].expectedOutput,
    isPublic: true,
    passed: false,
    status: "UNTESTED",
    stdout: "",
    stderr: "",
    executionTimeMs: 0,
    scoreAwarded: 0,
    weight: 1,
  } : null);

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
              {gradingResult.status === "COMPILE_ERROR" && <AlertTriangle className="w-3.5 h-3.5" />}
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
            <p className="text-xs font-medium animate-pulse">Compiling & Executing Java Code against testcases...</p>
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
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Standard Output (stdout)</span>
                    <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 overflow-x-auto">
                      {customResult.stdout}
                    </pre>
                  </div>
                )}
                {customResult.stderr && (
                  <div>
                    <span className="block text-[11px] font-semibold text-rose-400 uppercase mb-1">Errors / Exceptions</span>
                    <pre className="bg-rose-950/40 p-3 rounded-lg font-mono text-xs text-rose-300 border border-rose-900/50 overflow-x-auto">
                      {customResult.stderr}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Test Case Selection Pills */}
            <div className="flex flex-wrap gap-2">
              {(results.length > 0 ? results : publicTestCases).map((tc: any, idx: number) => {
                const isPassed = tc.passed;
                const isTested = tc.status && tc.status !== "UNTESTED";
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCaseIdx(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      selectedCaseIdx === idx
                        ? "bg-slate-800 text-white border-slate-600"
                        : "bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/50"
                    }`}
                  >
                    {isTested && (
                      <span className={`w-2 h-2 rounded-full ${isPassed ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                    )}
                    <span>Case {idx + 1}</span>
                    {!tc.isPublic && <span className="text-[10px] text-slate-500">(Hidden)</span>}
                  </button>
                );
              })}
            </div>

            {/* Selected Case Details */}
            {activeTestCase && (
              <div className="space-y-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                {/* Compiler / Runtime error banner */}
                {activeTestCase.compilationError && (
                  <div className="bg-rose-950/40 border border-rose-900/60 rounded-lg p-3 text-xs font-mono text-rose-300 overflow-x-auto">
                    <strong className="block font-sans font-semibold mb-1 text-rose-400">Compilation Error:</strong>
                    {activeTestCase.compilationError}
                  </div>
                )}

                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Input
                  </span>
                  <pre className="bg-slate-950 p-2.5 rounded-lg font-mono text-xs text-slate-200 border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                    {activeTestCase.input || "(empty input)"}
                  </pre>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Expected Output
                  </span>
                  <pre className="bg-slate-950 p-2.5 rounded-lg font-mono text-xs text-slate-200 border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                    {activeTestCase.expectedOutput}
                  </pre>
                </div>

                {activeTestCase.stdout !== undefined && activeTestCase.stdout !== "" && (
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Your Output
                    </span>
                    <pre
                      className={`p-2.5 rounded-lg font-mono text-xs border overflow-x-auto whitespace-pre-wrap ${
                        activeTestCase.passed
                          ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/40"
                          : "bg-rose-950/20 text-rose-400 border-rose-900/40"
                      }`}
                    >
                      {activeTestCase.stdout}
                    </pre>
                  </div>
                )}

                {activeTestCase.stderr && (
                  <div>
                    <span className="block text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-1">
                      Execution Error / Stderr
                    </span>
                    <pre className="bg-rose-950/30 p-2.5 rounded-lg font-mono text-xs text-rose-300 border border-rose-900/40 overflow-x-auto whitespace-pre-wrap">
                      {activeTestCase.stderr}
                    </pre>
                  </div>
                )}

                {activeTestCase.executionTimeMs > 0 && (
                  <div className="text-[11px] text-slate-500 text-right pt-1">
                    Time: {activeTestCase.executionTimeMs} ms
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
