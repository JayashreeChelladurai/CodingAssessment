import React from "react";
import { Question, FibBlank } from "../../types";
import { AlertCircle, CheckCircle2, Edit3, RotateCcw } from "lucide-react";
import { MarkdownView } from "../common/MarkdownView";

interface FibViewProps {
  question: Question;
  studentAnswers: string[];
  onChangeAnswer: (blankIndex: number, value: string) => void;
  onClearResponse: () => void;
}

export const FibView: React.FC<FibViewProps> = ({
  question,
  studentAnswers,
  onChangeAnswer,
  onClearResponse,
}) => {
  // Determine blanks from options (if defined) or correctAnswers (in review mode) or fallback to 1 blank
  let blanks: FibBlank[] = [];
  try {
    const parsedOpts = typeof question.options === "string" ? JSON.parse(question.options || "[]") : (question.options || []);
    if (Array.isArray(parsedOpts) && parsedOpts.length > 0) {
      blanks = parsedOpts.map((opt: any, idx: number) => ({
        id: opt.id || `blank-${idx + 1}`,
        label: opt.label || opt.text || `Blank ${idx + 1}`,
        acceptedAnswers: opt.acceptedAnswers || [],
      }));
    }
  } catch {
    blanks = [];
  }

  // Fallback: If no blanks defined in options, check correctAnswers or default to 1 blank
  if (blanks.length === 0) {
    try {
      const parsedCorrect = typeof question.correctAnswers === "string" ? JSON.parse(question.correctAnswers || "[]") : (question.correctAnswers || []);
      const count = Array.isArray(parsedCorrect) && parsedCorrect.length > 0 ? parsedCorrect.length : 1;
      blanks = Array.from({ length: count }, (_, idx) => ({
        id: `blank-${idx + 1}`,
        label: count === 1 ? "Your Answer" : `Blank ${idx + 1}`,
        acceptedAnswers: [],
      }));
    } catch {
      blanks = [{ id: "blank-1", label: "Your Answer", acceptedAnswers: [] }];
    }
  }

  const answeredCount = studentAnswers.filter((a) => typeof a === "string" && a.trim().length > 0).length;

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-6 text-slate-100 exam-protected select-none">
      {/* Header with Title & Marks */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400 block mb-1 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Fill in the Blanks ({blanks.length} {blanks.length === 1 ? "Blank" : "Blanks"})</span>
          </span>
          <h2 className="text-base font-bold text-white">{question.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-3 py-1 rounded-full text-xs font-bold">
            +{question.marks} Marks
          </span>
          {question.negativeMarks && question.negativeMarks > 0 ? (
            <span className="bg-rose-950/60 text-rose-400 border border-rose-800/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>-{question.negativeMarks} Negative</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Question Description / Code Snippet */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 text-xs leading-relaxed space-y-3">
        <MarkdownView content={question.description} />
      </div>

      {/* Fill in the Blanks Inputs */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Type Your Answer(s):
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {answeredCount} / {blanks.length} Filled
          </span>
        </div>

        <div className="space-y-3">
          {blanks.map((b, idx) => {
            const currentVal = studentAnswers[idx] || "";
            const isFilled = currentVal.trim().length > 0;

            return (
              <div
                key={b.id || idx}
                className={`p-4 rounded-xl border transition-all ${
                  isFilled
                    ? "bg-slate-950/90 border-violet-500/60 shadow-md shadow-violet-950/30"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label
                    htmlFor={`blank-input-${idx}`}
                    className="text-xs font-bold text-violet-300 flex items-center gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-violet-950 border border-violet-700 text-violet-300 text-[10px] flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span>{b.label || `Blank ${idx + 1}`}</span>
                  </label>

                  {isFilled && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Answer Entered</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    id={`blank-input-${idx}`}
                    type="text"
                    value={currentVal}
                    onChange={(e) => onChangeAnswer(idx, e.target.value)}
                    placeholder={`Enter answer for ${b.label || `Blank ${idx + 1}`}...`}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 rounded-xl text-xs font-mono text-white placeholder-slate-500 outline-none transition"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {answeredCount > 0 && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClearResponse}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition border border-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear My Answers</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
