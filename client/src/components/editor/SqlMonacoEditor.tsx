import React, { useRef, useState, useEffect } from "react";
import Editor, { Monaco, loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { TableSchemaInfo } from "../../types";
import { Sparkles, RotateCcw, Code } from "lucide-react";

// Configure @monaco-editor/react to use locally bundled monaco (offline support with ZERO CDN network latency!)
loader.config({ monaco });

interface SqlMonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  schemaTables?: TableSchemaInfo[];
  starterCode?: string;
  readOnly?: boolean;
  height?: string;
  questionId?: string;
  hideToolbar?: boolean;
  onRunQuery?: () => void;
}

export const SqlMonacoEditor: React.FC<SqlMonacoEditorProps> = ({
  value,
  onChange,
  schemaTables = [],
  starterCode = "",
  readOnly = false,
  height = "100%",
  questionId,
  hideToolbar = false,
  onRunQuery,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const completionProviderRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);

  // Fallback timer if Monaco initialization takes longer than 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isEditorReady) {
        setFallbackMode(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isEditorReady]);

  // Clean up registered completion provider when unmounting
  useEffect(() => {
    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any, monacoInstance: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    setIsEditorReady(true);
    setFallbackMode(false);

    // Register Ctrl+Enter / Cmd+Enter shortcut to execute query
    if (onRunQuery) {
      editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
        onRunQuery();
      });
    }

    // Register Schema Table and Column Autocompletion
    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
    }

    completionProviderRef.current = monacoInstance.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: any[] = [];

        // Schema Tables
        for (const t of schemaTables) {
          suggestions.push({
            label: t.tableName,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: t.tableName,
            detail: `Table: ${t.tableName}`,
            range,
          });

          // Schema Columns
          for (const c of t.columns) {
            suggestions.push({
              label: c.name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: c.name,
              detail: `Column in ${t.tableName} (${c.type})`,
              range,
            });
          }
        }

        // Standard SQL Functions & Keywords
        const sqlKeywords = [
          "SELECT",
          "FROM",
          "WHERE",
          "GROUP BY",
          "HAVING",
          "ORDER BY",
          "LIMIT",
          "OFFSET",
          "JOIN",
          "LEFT JOIN",
          "INNER JOIN",
          "RIGHT JOIN",
          "CROSS JOIN",
          "ON",
          "WITH",
          "AS",
          "DENSE_RANK() OVER (PARTITION BY  ORDER BY )",
          "ROW_NUMBER() OVER (PARTITION BY  ORDER BY )",
          "RANK() OVER (PARTITION BY  ORDER BY )",
          "LAG(",
          "LEAD(",
          "COALESCE(",
          "ROUND(",
          "CASE WHEN  THEN  ELSE  END",
          "DISTINCT",
          "COUNT(",
          "SUM(",
          "AVG(",
          "MIN(",
          "MAX(",
          "UNION ALL",
          "IS NULL",
          "IS NOT NULL",
        ];

        for (const kw of sqlKeywords) {
          suggestions.push({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            detail: "SQL Keyword",
            range,
          });
        }

        return { suggestions };
      },
    });
  };

  // Lightweight SQL Prettifier: Uppercases SQL keywords and cleans spacing
  const formatSql = () => {
    if (!value) return;
    const keywords = [
      "select",
      "from",
      "where",
      "group by",
      "having",
      "order by",
      "limit",
      "offset",
      "join",
      "left join",
      "inner join",
      "on",
      "with",
      "as",
      "distinct",
      "and",
      "or",
      "case",
      "when",
      "then",
      "else",
      "end",
      "dense_rank()",
      "row_number()",
      "over",
      "partition by",
      "coalesce",
      "round",
      "count",
      "sum",
      "avg",
      "is null",
      "is not null",
      "union all",
    ];

    let formatted = value;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      formatted = formatted.replace(regex, kw.toUpperCase());
    }

    onChange(formatted);
  };

  const resetToStarter = () => {
    if (starterCode && window.confirm("Reset SQL editor to starter code?")) {
      onChange(starterCode);
    }
  };

  return (
    <div className="w-full h-full flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
      {/* Editor Toolbar */}
      {!hideToolbar && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] font-semibold">
            <Code className="w-3.5 h-3.5 text-sky-400" />
            <span>SQL Query Editor</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={formatSql}
              className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
              title="Uppercase SQL keywords and tidy query"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Format SQL</span>
            </button>

            {starterCode && !readOnly && (
              <button
                type="button"
                onClick={resetToStarter}
                className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition border border-slate-700"
                title="Reset query to original template"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor Container - Fills 100% of available height */}
      <div
        className="flex-1 w-full h-full min-h-[300px] relative"
        style={height && height !== "100%" ? { height } : undefined}
      >
        {fallbackMode && !isEditorReady ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            placeholder="-- Write your SQL query here..."
            className="w-full h-full min-h-[300px] p-4 bg-slate-950 text-sky-100 font-mono text-sm leading-relaxed resize-none focus:outline-none selection:bg-sky-900 border-none outline-none"
            spellCheck={false}
          />
        ) : (
          <Editor
            key={questionId ? `sql_editor_${questionId}` : undefined}
            height="100%"
            language="sql"
            theme="vs-dark"
            value={value}
            onChange={(val) => onChange(val || "")}
            onMount={handleEditorDidMount}
            loading={
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-950 text-slate-400 text-xs gap-3">
                <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading SQL editor environment...</span>
              </div>
            }
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
              fontLigatures: true,
              lineNumbers: "on",
              readOnly,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              suggestOnTriggerCharacters: true,
              padding: { top: 12, bottom: 12 },
              lineHeight: 22,
              renderLineHighlight: "all",
              cursorBlinking: "smooth",
              smoothScrolling: true,
            }}
          />
        )}
      </div>
    </div>
  );
};
