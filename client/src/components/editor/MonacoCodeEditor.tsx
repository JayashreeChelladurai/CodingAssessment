import React, { useState, useEffect, useRef } from "react";
import Editor, { loader, OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Code2, Lock, Sparkles, AlertCircle } from "lucide-react";

// Configure @monaco-editor/react to use locally bundled monaco (offline support with ZERO CDN network latency!)
loader.config({ monaco });

interface MonacoCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  questionId?: string;
}

interface LockedRanges {
  topLockedEndLine: number; // 1-indexed: lines 1..topLockedEndLine are locked
  bottomLockedStartLine: number; // 1-indexed: lines bottomLockedStartLine..lines.length are locked
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  onChange,
  language = "JAVA",
  readOnly = false,
  questionId = "default",
}) => {
  const [monacoLoaded, setMonacoLoaded] = useState<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [hasLockedStarter, setHasLockedStarter] = useState<boolean>(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const lockedRangesRef = useRef<LockedRanges | null>(null);
  const noticeTimerRef = useRef<any>(null);

  const showLockedNotice = (msg?: string) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setLockedNotice(
      msg || "🔒 Starter code is non-editable. Please write your solution inside the active method."
    );
    noticeTimerRef.current = setTimeout(() => {
      setLockedNotice(null);
    }, 2800);
  };

  // Map our internal language string to Monaco editor language identifiers
  const getMonacoLanguage = (lang: string) => {
    const l = lang.toUpperCase();
    if (l === "C") return "c";
    if (l === "CPP" || l === "C++") return "cpp";
    return "java";
  };

  // Helper to dynamically calculate and apply locked styling and decorations on boilerplate scaffolding
  const applyStarterCodeDecorations = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco,
    currentCode: string
  ) => {
    if (!currentCode) return;
    const lines = currentCode.split("\n");
    const solClassIdx = lines.findIndex((l) =>
      /^\s*(?:public\s+)?class\s+(?:Solution|MedianFinder)\b/.test(l)
    );

    // If no standard solution class structure is detected, clear decorations & locks
    if (solClassIdx === -1) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      lockedRangesRef.current = null;
      setHasLockedStarter(false);
      return;
    }

    setHasLockedStarter(true);

    // Determine where the student's solution method begins
    let methodStartIdx = solClassIdx;
    if (!lines[solClassIdx].includes("MedianFinder")) {
      const nextMethod = lines.findIndex(
        (l, idx) => idx > solClassIdx && /^\s*public\s+(?!static\b)/.test(l)
      );
      if (nextMethod !== -1) {
        methodStartIdx = nextMethod;
      }
    }

    // Determine where the driver/static helper methods begin
    const firstStaticIdx = lines.findIndex(
      (l, idx) => idx > solClassIdx && /^\s*public\s+static\s+/.test(l)
    );

    // Top scaffolding: 1-indexed lines 1 to methodStartIdx + 1 (the method signature line itself is locked)
    const topEndLine = methodStartIdx + 1;
    // Active editable solution code: methodStartIdx + 2 to firstStaticIdx
    const activeStartLine = methodStartIdx + 2;
    const activeEndLine = firstStaticIdx !== -1 ? firstStaticIdx : lines.length;
    // Bottom driver: firstStaticIdx + 1 to lines.length
    const bottomStartLine = firstStaticIdx !== -1 ? firstStaticIdx + 1 : lines.length + 1;

    lockedRangesRef.current = {
      topLockedEndLine: topEndLine,
      bottomLockedStartLine: bottomStartLine,
    };

    const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

    // 1. Top Locked Starter Scaffolding (Imports, Helper Classes like TreeNode/ListNode/Node, Class & Method signature)
    if (topEndLine >= 1) {
      newDecorations.push({
        range: new monacoInstance.Range(1, 1, topEndLine, 1),
        options: {
          isWholeLine: true,
          className: "monaco-locked-starter-line",
          linesDecorationsClassName: "monaco-locked-gutter-marker",
          hoverMessage: {
            value:
              "🔒 **Starter Code (Non-editable)**  \nPre-configured imports, data structures, and class definitions. Write your solution in the active method below.",
          },
        },
      });

      // Boundary separator at the bottom of top scaffolding
      newDecorations.push({
        range: new monacoInstance.Range(topEndLine, 1, topEndLine, 1),
        options: {
          isWholeLine: true,
          className: "monaco-locked-boundary-top",
        },
      });
    }

    // 2. Active Solution Logic Gutter Marker (Emerald accent line in editor gutter)
    if (activeStartLine <= activeEndLine) {
      newDecorations.push({
        range: new monacoInstance.Range(activeStartLine, 1, activeEndLine, 1),
        options: {
          isWholeLine: true,
          linesDecorationsClassName: "monaco-active-gutter-marker",
        },
      });
    }

    // 3. Bottom Locked Driver (Static helpers, main method, test case parsing, closing brace)
    if (bottomStartLine <= lines.length) {
      // Boundary separator at the top of driver
      newDecorations.push({
        range: new monacoInstance.Range(bottomStartLine, 1, bottomStartLine, 1),
        options: {
          isWholeLine: true,
          className: "monaco-locked-boundary-bottom",
        },
      });

      newDecorations.push({
        range: new monacoInstance.Range(bottomStartLine, 1, lines.length, 1),
        options: {
          isWholeLine: true,
          className: "monaco-locked-starter-line",
          linesDecorationsClassName: "monaco-locked-gutter-marker",
          hoverMessage: {
            value:
              "🔒 **Test Driver & Runner (Non-editable)**  \nPre-configured automated test runner and input parser. Write your solution in the active method above.",
          },
        },
      });
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  };

  // Failsafe timeout: If Monaco doesn't mount within 2.5 seconds (e.g. low-end environment), enable instant fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!monacoLoaded) {
        setFallbackMode(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [monacoLoaded]);

  // Re-apply decorations whenever code changes externally or questionId switches
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      applyStarterCodeDecorations(editorRef.current, monacoRef.current, code);
    }
  }, [code, questionId]);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    setMonacoLoaded(true);
    setFallbackMode(false);

    // Apply locked starter decorations immediately on mount
    applyStarterCodeDecorations(editor, monacoInstance, code);

    // Smoothly scroll the editor so the student's solution method is centered
    const lines = code.split("\n");
    const solClassIdx = lines.findIndex((l) =>
      /^\s*(?:public\s+)?class\s+(?:Solution|MedianFinder)\b/.test(l)
    );
    if (solClassIdx !== -1) {
      const activeLine = solClassIdx + 3;
      setTimeout(() => {
        editor.revealLineInCenter(activeLine);
      }, 150);
    }

    // Dynamically update locked decorations in real time as the candidate types
    editor.onDidChangeModelContent(() => {
      applyStarterCodeDecorations(editor, monacoInstance, editor.getValue());
    });

    // 1. Intercept KeyDown to enforce NON-EDITABLE starter code
    editor.onKeyDown((e: monaco.IKeyboardEvent) => {
      if (readOnly) return;

      const keyCode = e.keyCode;

      // Allow navigation keys everywhere
      const isNavKey =
        keyCode === monacoInstance.KeyCode.LeftArrow ||
        keyCode === monacoInstance.KeyCode.RightArrow ||
        keyCode === monacoInstance.KeyCode.UpArrow ||
        keyCode === monacoInstance.KeyCode.DownArrow ||
        keyCode === monacoInstance.KeyCode.PageUp ||
        keyCode === monacoInstance.KeyCode.PageDown ||
        keyCode === monacoInstance.KeyCode.Home ||
        keyCode === monacoInstance.KeyCode.End ||
        keyCode === monacoInstance.KeyCode.Escape ||
        keyCode === monacoInstance.KeyCode.Shift ||
        keyCode === monacoInstance.KeyCode.Ctrl ||
        keyCode === monacoInstance.KeyCode.Alt ||
        keyCode === monacoInstance.KeyCode.Meta;

      // Allow copy (Ctrl+C / Cmd+C) & select all (Ctrl+A / Cmd+A)
      if ((e.ctrlKey || e.metaKey) && (keyCode === monacoInstance.KeyCode.KeyC || keyCode === monacoInstance.KeyCode.KeyA)) {
        return;
      }

      if (isNavKey) return;

      const selection = editor.getSelection();
      if (!selection || !lockedRangesRef.current) return;

      const { topLockedEndLine, bottomLockedStartLine } = lockedRangesRef.current;
      const touchesTopLocked = selection.startLineNumber <= topLockedEndLine;
      const touchesBottomLocked = selection.endLineNumber >= bottomLockedStartLine;

      if (touchesTopLocked || touchesBottomLocked) {
        e.preventDefault();
        e.stopPropagation();
        showLockedNotice();

        // Guide cursor back into the active editable region
        if (touchesTopLocked) {
          editor.setPosition({ lineNumber: topLockedEndLine + 1, column: 1 });
          editor.revealLine(topLockedEndLine + 1);
        } else if (touchesBottomLocked) {
          editor.setPosition({ lineNumber: Math.max(1, bottomLockedStartLine - 1), column: 1 });
          editor.revealLine(Math.max(1, bottomLockedStartLine - 1));
        }
      }
    });

    // 2. Intercept Paste to prevent pasting into non-editable regions
    editor.onDidPaste((e) => {
      if (!lockedRangesRef.current) return;
      const { topLockedEndLine, bottomLockedStartLine } = lockedRangesRef.current;
      if (e.range.startLineNumber <= topLockedEndLine || e.range.endLineNumber >= bottomLockedStartLine) {
        editor.trigger("lock", "undo", null);
        showLockedNotice();
      }
    });

    // 3. Disable Ctrl+Z / Cmd+Z (Undo) across question switches
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyZ, () => {
      // Handled cleanly
    });
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyY, () => {
      // Handled cleanly
    });
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyZ, () => {
      // Handled cleanly
    });
  };

  // Handle Tab and lock interception in fallback textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z" || e.key === "y" || e.key === "Y")) {
      e.preventDefault();
      return;
    }

    // Intercept editing in locked lines in fallback textarea
    if (lockedRangesRef.current && textareaRef.current) {
      const textarea = textareaRef.current;
      const textBefore = textarea.value.substring(0, textarea.selectionStart);
      const currentLineNum = textBefore.split("\n").length;
      const { topLockedEndLine, bottomLockedStartLine } = lockedRangesRef.current;

      const isNavKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(e.key);
      const isCopy = (e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C" || e.key === "a" || e.key === "A");

      if (!isNavKey && !isCopy) {
        if (currentLineNum <= topLockedEndLine || currentLineNum >= bottomLockedStartLine) {
          e.preventDefault();
          showLockedNotice();
          return;
        }
      }
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const updated = val.substring(0, start) + "    " + val.substring(end);
      onChange(updated);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lineCount = (code.match(/\n/g) || []).length + 1;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1);

  // Sync scroll between textarea and line numbers gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="w-full h-full flex flex-col border border-slate-800 rounded-xl overflow-hidden shadow-inner bg-[#1e1e1e] relative">
      {/* Top Status Bar with Lock Indicator */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#14171f] border-b border-slate-800 text-[11px] shrink-0">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Language: <strong className="text-white">{language}</strong></span>
        </div>
        {hasLockedStarter && (
          <div className="flex items-center gap-1.5 text-purple-300 font-mono text-[10px] bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/60 shadow-sm">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Starter Harness Locked (Non-editable)</span>
          </div>
        )}
      </div>

      {/* Floating Locked Notice Toast */}
      {lockedNotice && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 bg-purple-950/95 border border-purple-500/90 text-purple-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all">
          <Lock className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{lockedNotice}</span>
        </div>
      )}

      {/* Fallback Lightweight Editor when Monaco is unavailable or toggled */}
      {fallbackMode ? (
        <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] font-mono text-xs overflow-hidden">
          <div className="flex-1 flex overflow-hidden relative">
            {/* Line Numbers Gutter */}
            <div
              ref={lineNumbersRef}
              className="w-12 py-3 bg-[#181818] border-r border-slate-800 text-slate-500 text-right pr-3 select-none overflow-hidden font-mono leading-relaxed"
            >
              {lineNumbers.map((num) => (
                <div key={num} className="h-[21px] leading-[21px]">
                  {num}
                </div>
              ))}
            </div>

            {/* Code Textarea Area */}
            <textarea
              ref={textareaRef}
              value={code}
              readOnly={readOnly}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder="// Write your solution here..."
              spellCheck={false}
              className="flex-1 p-3 bg-[#1e1e1e] text-slate-100 font-mono text-xs leading-[21px] focus:outline-none resize-none overflow-auto selection:bg-purple-900 selection:text-white"
            />
          </div>
        </div>
      ) : (
        /* Primary Monaco IDE Editor */
        <div className="flex-1 h-full min-h-0 relative">
          <Editor
            key={`editor_${questionId}_${language}`}
            path={`file:///inmemory_question_${questionId}_${language}`}
            height="100%"
            language={getMonacoLanguage(language)}
            theme="vs-dark"
            value={code}
            onChange={(val) => onChange(val || "")}
            onMount={handleEditorDidMount}
            loading={
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#1e1e1e] text-slate-400 text-xs gap-3">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Initializing code editor environment...</span>
              </div>
            }
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
              fontLigatures: true,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              wordWrap: "on",
              padding: { top: 12, bottom: 12 },
              suggestOnTriggerCharacters: true,
              renderLineHighlight: "all",
              cursorBlinking: "smooth",
              smoothScrolling: true,
            }}
          />
        </div>
      )}
    </div>
  );
};
