import React from "react";
import Editor from "@monaco-editor/react";

interface MonacoCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  onChange,
  language = "JAVA",
  readOnly = false,
}) => {
  // Map our internal language string to Monaco editor language identifiers
  const getMonacoLanguage = (lang: string) => {
    const l = lang.toUpperCase();
    if (l === "C") return "c";
    if (l === "CPP" || l === "C++") return "cpp";
    return "java";
  };

  return (
    <div className="w-full h-full border border-slate-800 rounded-xl overflow-hidden shadow-inner bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        theme="vs-dark"
        value={code}
        onChange={(val) => onChange(val || "")}
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
