import React, { useState, useEffect, useRef } from "react";
import Editor, { loader, OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Code2, Terminal, RefreshCw, Layers } from "lucide-react";

// Configure @monaco-editor/react to use locally bundled monaco (offline support with ZERO CDN network latency!)
loader.config({ monaco });

interface MonacoCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  questionId?: string;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Map our internal language string to Monaco editor language identifiers
  const getMonacoLanguage = (lang: string) => {
    const l = lang.toUpperCase();
    if (l === "C") return "c";
    if (l === "CPP" || l === "C++") return "cpp";
    return "java";
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

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    setMonacoLoaded(true);
    setFallbackMode(false);

    // 1. Disable Ctrl+Z / Cmd+Z (Undo) to prevent undo operations across question switches
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyZ, () => {
      // No-op: Undo disabled
    });
    // 2. Disable Ctrl+Y / Cmd+Y (Redo)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyY, () => {
      // No-op: Redo disabled
    });
    // 3. Disable Ctrl+Shift+Z / Cmd+Shift+Z (Redo)
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyZ, () => {
      // No-op: Redo disabled
    });
  };

  // Handle Tab key in fallback textarea (insert 4 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Disable Ctrl+Z in fallback textarea as well
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z" || e.key === "y" || e.key === "Y")) {
      e.preventDefault();
      return;
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
    <div className="w-full h-full flex flex-col border border-slate-800 rounded-xl overflow-hidden shadow-inner bg-[#1e1e1e]">
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
              className="flex-1 p-3 bg-[#1e1e1e] text-slate-100 font-mono text-xs leading-[21px] focus:outline-none resize-none overflow-auto selection:bg-emerald-800 selection:text-white"
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
