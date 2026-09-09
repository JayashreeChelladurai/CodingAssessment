import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";

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
  // Map our internal language string to Monaco editor language identifiers
  const getMonacoLanguage = (lang: string) => {
    const l = lang.toUpperCase();
    if (l === "C") return "c";
    if (l === "CPP" || l === "C++") return "cpp";
    return "java";
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // 1. Disable Ctrl+Z / Cmd+Z (Undo) to prevent undo operations across question switches
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
      // No-op: Undo disabled
    });
    // 2. Disable Ctrl+Y / Cmd+Y (Redo)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY, () => {
      // No-op: Redo disabled
    });
    // 3. Disable Ctrl+Shift+Z / Cmd+Shift+Z (Redo)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
      // No-op: Redo disabled
    });
  };

  return (
    <div className="w-full h-full border border-slate-800 rounded-xl overflow-hidden shadow-inner bg-[#1e1e1e]">
      <Editor
        key={`editor_${questionId}_${language}`}
        path={`file:///inmemory_question_${questionId}_${language}`}
        height="100%"
        language={getMonacoLanguage(language)}
        theme="vs-dark"
        value={code}
        onChange={(val) => onChange(val || "")}
        onMount={handleEditorDidMount}
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
  );
};
