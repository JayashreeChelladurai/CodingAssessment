import React from "react";
import { Question, Section } from "../../types";
import { Bookmark, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from "lucide-react";

interface QuestionPaletteProps {
  sections: Section[];
  questions: Question[];
  currentQuestionIdx: number;
  onSelectQuestion: (index: number) => void;
  mcqResponses: Record<string, string[]>;
  drafts: Record<string, any>;
  flaggedQuestions: string[];
  onToggleFlagQuestion: (questionId: string) => void;
  onClearResponse: (questionId: string) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  sections,
  questions,
  currentQuestionIdx,
  onSelectQuestion,
  mcqResponses,
  drafts,
  flaggedQuestions,
  onToggleFlagQuestion,
  onClearResponse,
  onNextQuestion,
  onPrevQuestion,
}) => {
  const currentQuestion = questions[currentQuestionIdx];
  const isFlagged = currentQuestion ? flaggedQuestions.includes(currentQuestion.id) : false;

  // Compute status for each question safely
  const getQuestionStatus = (q: Question) => {
    const isFl = flaggedQuestions.includes(q.id);
    let isAnswered = false;

    if (q.type === "MCQ") {
      isAnswered = (mcqResponses[q.id]?.length || 0) > 0;
    } else {
      const d = drafts ? drafts[q.id] : undefined;
      if (typeof d === "string") {
        isAnswered = d.trim().length > 0;
      } else if (typeof d === "object" && d !== null) {
        isAnswered = Object.values(d).some((v) => typeof v === "string" && v.trim().length > 0);
      } else if (drafts && typeof drafts === "object") {
        isAnswered = Object.keys(drafts).some(
          (k) => k.startsWith(`${q.id}_`) && typeof drafts[k] === "string" && drafts[k].trim().length > 0
        );
      }
    }

    if (isFl && isAnswered) return "ANSWERED_AND_MARKED";
    if (isFl) return "MARKED_FOR_REVIEW";
    if (isAnswered) return "ANSWERED";
    return "UNANSWERED";
  };

  const answeredCount = questions.filter((q) => {
    const status = getQuestionStatus(q);
    return status === "ANSWERED" || status === "ANSWERED_AND_MARKED";
  }).length;

  const markedCount = flaggedQuestions.length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-full space-y-4 text-xs">
      {/* Top Legend Stats */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Question Palette & Overview
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="bg-slate-950/80 border border-emerald-800/40 p-2 rounded-xl">
            <span className="font-bold text-emerald-400 block text-sm">{answeredCount}</span>
            <span className="text-slate-400 text-[10px]">Answered</span>
          </div>

          <div className="bg-slate-950/80 border border-purple-800/40 p-2 rounded-xl">
            <span className="font-bold text-purple-400 block text-sm">{markedCount}</span>
            <span className="text-slate-400 text-[10px]">Marked</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
            <span className="font-bold text-slate-300 block text-sm">{unansweredCount}</span>
            <span className="text-slate-400 text-[10px]">Unanswered</span>
          </div>
        </div>
      </div>

      {/* Section-wise Question Grid */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {(sections.length > 0 ? sections : [{ id: "sec-all", title: "All Questions", order: 0 }]).map((sec) => {
          const secQuestions = sections.length > 0
            ? questions.filter((q) => q.sectionId === sec.id)
            : questions;

          if (secQuestions.length === 0) return null;

          return (
            <div key={sec.id} className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block border-b border-slate-800/80 pb-1">
                {sec.title}
              </span>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {secQuestions.map((q) => {
                  const globalIdx = questions.findIndex((item) => item.id === q.id);
                  const status = getQuestionStatus(q);
                  const isCurrent = currentQuestionIdx === globalIdx;

                  let badgeColor = "bg-slate-800 text-slate-400 border-slate-700";
                  if (status === "ANSWERED") {
                    badgeColor = "bg-emerald-600 text-white border-emerald-500";
                  } else if (status === "MARKED_FOR_REVIEW") {
                    badgeColor = "bg-purple-600 text-white border-purple-400";
                  } else if (status === "ANSWERED_AND_MARKED") {
                    badgeColor = "bg-purple-700 text-emerald-300 border-emerald-400 ring-1 ring-emerald-400";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => onSelectQuestion(globalIdx)}
                      className={`h-9 rounded-xl font-bold font-mono text-xs flex items-center justify-center transition border relative ${badgeColor} ${
                        isCurrent ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105" : "hover:opacity-90"
                      }`}
                    >
                      <span>Q{globalIdx + 1}</span>
                      {q.type === "MCQ" && (
                        <span className="absolute -top-1 -right-1 text-[8px] bg-slate-950 px-1 rounded text-amber-400 font-sans border border-slate-800">
                          M
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Controllers */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex gap-2">
          {currentQuestion && (
            <button
              onClick={() => onToggleFlagQuestion(currentQuestion.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-[11px] transition border ${
                isFlagged
                  ? "bg-purple-950/60 text-purple-300 border-purple-800"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? "fill-purple-400" : ""}`} />
              <span>{isFlagged ? "Unmark Review" : "Mark for Review"}</span>
            </button>
          )}

          {currentQuestion?.type === "MCQ" && (
            <button
              onClick={() => onClearResponse(currentQuestion.id)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 rounded-xl transition border border-slate-700"
              title="Clear MCQ Choice"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPrevQuestion}
            disabled={currentQuestionIdx === 0}
            className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 py-2 rounded-xl font-semibold transition border border-slate-700 text-[11px]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={onNextQuestion}
            disabled={currentQuestionIdx === questions.length - 1}
            className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white py-2 rounded-xl font-semibold transition text-[11px]"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
