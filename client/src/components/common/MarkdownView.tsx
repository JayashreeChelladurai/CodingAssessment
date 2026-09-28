import React from "react";

interface MarkdownViewProps {
  content: string;
  className?: string;
}

/**
 * Clean, lightweight renderer for problem descriptions.
 * Converts markdown headings, lists, code fences, inline code, bold, and dividers
 * into cleanly styled Tailwind elements without leaking '#', '*', '**', or '$' symbols.
 */
export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Pre-clean LaTeX math notations: e.g. $1 \le n \le 1000$ -> 1 <= n <= 1000
  const sanitized = content
    .replace(/\$\\text\{([^}]+)\}\$/g, "$1")
    .replace(/\$([^$]+)\$/g, (_, math) => {
      return math
        .replace(/\\le/g, "<=")
        .replace(/\\ge/g, ">=")
        .replace(/\\ne/g, "!=")
        .replace(/\\text\{([^}]+)\}/g, "$1")
        .replace(/\\times/g, "x")
        .replace(/\\cdot/g, "·")
        .replace(/\\/g, "");
    });

  const lines = sanitized.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";
  let listBuffer: React.ReactNode[] = [];

  const flushList = (keyPrefix: number) => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${keyPrefix}`} className="space-y-1 my-1.5 pl-1">
          {listBuffer}
        </ul>
      );
      listBuffer = [];
    }
  };

  const renderInline = (text: string): React.ReactNode => {
    // Parse bold, inline code, italics
    // Tokenize text into inline parts
    const parts: React.ReactNode[] = [];
    // Regex matches: `code` or **bold** or *italic*
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800/90 text-emerald-300 font-mono text-[11px] border border-slate-700/60"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-semibold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={match.index} className="italic text-slate-200">
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = match.index + token.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Code Fence (```)
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 my-2 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed shadow-inner"
          >
            {codeBuffer.join("\n")}
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList(i);
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // 2. Horizontal Rule (--- or ***)
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList(i);
      elements.push(<hr key={`hr-${i}`} className="border-slate-800/80 my-3" />);
      continue;
    }

    // 3. Headings (#, ##, ###, ####)
    if (trimmed.startsWith("#")) {
      flushList(i);
      const level = (trimmed.match(/^#+/) || ["#"])[0].length;
      const headingText = trimmed.replace(/^#+\s*/, "");

      if (level === 1) {
        elements.push(
          <h2 key={`h1-${i}`} className="text-base font-extrabold text-white mt-4 mb-2 tracking-tight">
            {renderInline(headingText)}
          </h2>
        );
      } else if (level === 2) {
        elements.push(
          <h3 key={`h2-${i}`} className="text-sm font-bold text-white mt-3.5 mb-1.5 tracking-tight border-b border-slate-800 pb-1">
            {renderInline(headingText)}
          </h3>
        );
      } else {
        elements.push(
          <h4
            key={`h3-${i}`}
            className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 mt-3 mb-1"
          >
            {renderInline(headingText)}
          </h4>
        );
      }
      continue;
    }

    // 4. Bullet Lists (- item, * item, • item)
    if (/^[-*•]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*•]\s+/, "");
      listBuffer.push(
        <li key={`li-${i}`} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
          <span className="text-emerald-400 mt-0.5 select-none font-bold">•</span>
          <span className="flex-1">{renderInline(itemText)}</span>
        </li>
      );
      continue;
    }

    // 4b. Ordered Lists (1. item, 2. item)
    if (/^\d+\.\s+/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+/);
      const num = numMatch ? numMatch[1] : "1";
      const itemText = trimmed.replace(/^\d+\.\s+/, "");
      listBuffer.push(
        <li key={`li-${i}`} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
          <span className="text-emerald-400 mt-0.5 select-none font-mono font-bold text-[11px]">{num}.</span>
          <span className="flex-1">{renderInline(itemText)}</span>
        </li>
      );
      continue;
    }

    // If we reached here, line is not a list item: flush any pending list
    flushList(i);

    // 4c. Section Titles (e.g. Problem Statement:, Input Format:, Examples:, etc.)
    if (/^(Problem Statement|Input Format|Output Format|Constraints|Examples?|Example \d+|Explanation):?$/i.test(trimmed)) {
      const title = trimmed.endsWith(":") ? trimmed : `${trimmed}:`;
      elements.push(
        <h4
          key={`sec-${i}`}
          className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 mt-3.5 mb-1.5 flex items-center gap-1.5"
        >
          <span>{title}</span>
        </h4>
      );
      continue;
    }

    // 4d. Example Sub-Labels (e.g. Input:, Output:)
    if (/^(Input|Output):$/i.test(trimmed)) {
      elements.push(
        <span
          key={`sub-${i}`}
          className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-2 mb-0.5 font-mono"
        >
          {trimmed}
        </span>
      );
      continue;
    }

    // 5. Empty lines
    if (trimmed.length === 0) {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
      continue;
    }

    // 6. Regular Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-slate-300 text-xs leading-relaxed my-1">
        {renderInline(trimmed)}
      </p>
    );
  }

  // Flush any trailing buffers
  flushList(lines.length);
  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <pre
        key="code-trailing"
        className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 my-2 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed"
      >
        {codeBuffer.join("\n")}
      </pre>
    );
  }

  return <div className={`space-y-1 font-sans ${className}`}>{elements}</div>;
};
