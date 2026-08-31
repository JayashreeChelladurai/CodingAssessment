import React from "react";
import { Question, McqOption } from "../../types";
import { CheckCircle2, Circle, CheckSquare, Square, AlertCircle } from "lucide-react";

interface McqViewProps {
  question: Question;
  selectedOptions: string[];
  optionOrder?: string[]; // Randomized option IDs for this student
  onSelectOption: (optionId: string) => void;
  onClearResponse: () => void;
}

export const McqView: React.FC<McqViewProps> = ({
  question,
  selectedOptions,
  optionOrder,
  onSelectOption,
}) => {
  let allOptions: McqOption[] = [];
  try {
    allOptions = typeof question.options === "string" ? JSON.parse(question.options || "[]") : (question.options || []);
  } catch {
    allOptions = [];
  }

  // If optionOrder is provided, sort options according to student's randomized sequence
  if (optionOrder && Array.isArray(optionOrder) && optionOrder.length > 0) {
    allOptions.sort((a, b) => {
      const idxA = optionOrder.indexOf(a.id);
      const idxB = optionOrder.indexOf(b.id);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }

  const isMultiple = question.mcqType === "MULTIPLE";
  const optionLetters = ["A", "B", "C", "D", "E", "F", "G"];

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-6 text-slate-100 exam-protected select-none">
      {/* Header with Title & Marks */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Multiple Choice Question ({isMultiple ? "Multiple Answers" : "Single Choice"})
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
        <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
          {question.description}
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Select Your Answer:
        </span>

        <div className="space-y-2.5">
          {allOptions.map((opt, idx) => {
            const isSelected = selectedOptions.includes(opt.id);
            const letter = optionLetters[idx] || `${idx + 1}`;

            return (
              <div
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className={`cursor-pointer flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40 text-white"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40"
                }`}
              >
                {/* Option Letter Bubble */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {letter}
                </div>

                {/* Option Text */}
                <div className="flex-1 text-xs font-medium leading-relaxed">
                  {opt.text}
                </div>

                {/* Check Icon */}
                <div className="shrink-0 text-emerald-400">
                  {isMultiple ? (
                    isSelected ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600" />
                    )
                  ) : isSelected ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
