import React, { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  HelpCircle,
  Highlighter,
  NotebookPen,
  XCircle,
} from 'lucide-react';
import {
  CompleteWordsQuestion,
  ExamMode,
  ReadingMCQQuestion,
  ReadingQuestion,
} from '../../types/toefl';
import { formatTaskTypeLabel } from '../../utils/scoring';

interface ReadingTaskViewProps {
  question: ReadingQuestion;
  mode: ExamMode;
  answer: unknown;
  onChangeAnswer: (val: unknown) => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  note: string;
  onChangeNote: (note: string) => void;
  highlights: string[];
  onAddHighlight: (text: string) => void;
  onRemoveHighlight: (text: string) => void;
}

export const ReadingTaskView: React.FC<ReadingTaskViewProps> = ({
  question,
  mode,
  answer,
  onChangeAnswer,
  bookmarked,
  onToggleBookmark,
  note,
  onChangeNote,
  highlights,
  onAddHighlight,
  onRemoveHighlight,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [checkedPractice, setCheckedPractice] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);

  const handleTextSelection = () => {
    if (!highlightMode) return;
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length >= 3 && sel.length <= 160) {
      onAddHighlight(sel);
      window.getSelection()?.removeAllRanges();
    }
  };

  const renderHighlightedText = (text: string) => {
    if (!highlights.length) return text;
    let parts: React.ReactNode[] = [text];
    highlights.forEach((hl) => {
      const next: React.ReactNode[] = [];
      parts.forEach((part, idx) => {
        if (typeof part !== 'string') {
          next.push(part);
          return;
        }
        const split = part.split(hl);
        split.forEach((seg, sIdx) => {
          if (seg) next.push(seg);
          if (sIdx < split.length - 1) {
            next.push(
              <mark
                key={`${hl}-${idx}-${sIdx}`}
                className="bg-amber-200/80 dark:bg-amber-500/30 text-inherit rounded px-0.5"
              >
                {hl}
              </mark>
            );
          }
        });
      });
      parts = next;
    });
    return parts;
  };

  if (question.taskType === 'complete-the-words') {
    return (
      <CompleteTheWordsView
        question={question}
        mode={mode}
        answer={(answer as Record<string, string>) || {}}
        onChangeAnswer={onChangeAnswer}
        bookmarked={bookmarked}
        onToggleBookmark={onToggleBookmark}
        showHint={showHint}
        setShowHint={setShowHint}
        checkedPractice={checkedPractice}
        setCheckedPractice={setCheckedPractice}
      />
    );
  }

  const mcq = question as ReadingMCQQuestion;
  const selectedIndex = typeof answer === 'number' ? answer : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatTaskTypeLabel(mcq.taskType)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{mcq.topic}</span>
          <span aria-hidden="true">·</span>
          <span>{mcq.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>CEFR {mcq.cefr}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHighlightMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              highlightMode
                ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-400 text-amber-900 dark:text-amber-200'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            {highlightMode ? 'Select Text to Highlight' : 'Highlighter'}
          </button>
          <button
            type="button"
            onClick={() => setShowNotes((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showNotes
                ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-400 text-blue-800 dark:text-blue-200'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <NotebookPen className="w-3.5 h-3.5" />
            Notes
          </button>
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              bookmarked
                ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Personal Reading Scratchpad (Autosaved)
          </label>
          <textarea
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            rows={2}
            placeholder="Jot down paragraph main ideas, contrast markers, or key dates..."
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      )}

      {/* Split Layout: Passage Left, Question Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <article
          onMouseUp={handleTextSelection}
          className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-5 sm:p-7 space-y-4"
        >
          <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            {mcq.passageMeta && (
              <div className="text-xs font-medium text-[#1D4ED8] dark:text-cyan-400">
                {mcq.passageMeta}
              </div>
            )}
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {mcq.passageTitle}
            </h3>
          </div>

          <div className="space-y-4 exam-prose text-slate-700 dark:text-slate-200">
            {mcq.passageParagraphs.map((para, idx) => (
              <p key={idx}>{renderHighlightedText(para)}</p>
            ))}
          </div>

          {highlights.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Highlights:</span>
              {highlights.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onRemoveHighlight(h)}
                  title="Click to remove highlight"
                  className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 hover:line-through truncate max-w-[180px]"
                >
                  “{h}” ×
                </button>
              ))}
            </div>
          )}
        </article>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Skill Focus: <span className="font-medium text-slate-800 dark:text-slate-200">{mcq.skillFocus}</span>
          </div>

          <h4 className="font-display text-base font-semibold text-slate-900 dark:text-white leading-snug">
            {mcq.question}
          </h4>

          <div className="space-y-2.5" role="radiogroup" aria-label={mcq.question}>
            {mcq.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedIndex === idx;
              const showFeedback = mode === 'practice' && checkedPractice;
              const isCorrectOpt = idx === mcq.correctAnswerIndex;

              let borderClass =
                'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-950/60';
              if (showFeedback) {
                if (isCorrectOpt) {
                  borderClass = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10';
                } else if (isSelected && !isCorrectOpt) {
                  borderClass = 'border-rose-500 bg-rose-50/70 dark:bg-rose-500/10';
                }
              } else if (isSelected) {
                borderClass = 'border-[#1D4ED8] bg-blue-50/70 dark:bg-blue-600/15 ring-1 ring-[#1D4ED8]';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChangeAnswer(idx);
                    if (mode === 'practice') setCheckedPractice(false);
                  }}
                  className={`w-full text-left rounded-lg border px-4 py-3 min-h-[48px] text-sm transition-colors flex items-start gap-3 ${borderClass}`}
                >
                  <span
                    className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#1D4ED8] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-slate-800 dark:text-slate-100 leading-relaxed flex-1">
                    {opt}
                  </span>
                  {showFeedback && isCorrectOpt && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                  )}
                  {showFeedback && isSelected && !isCorrectOpt && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {mode === 'practice' && (
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={selectedIndex === null}
                  onClick={() => setCheckedPractice(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#0B1733] dark:bg-blue-600 hover:bg-[#132652] disabled:opacity-40 text-white text-xs font-semibold transition-colors"
                >
                  Check Answer
                </button>
                {mcq.hint && (
                  <button
                    type="button"
                    onClick={() => setShowHint((h) => !h)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                )}
                {selectedIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      onChangeAnswer(null);
                      setCheckedPractice(false);
                    }}
                    className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {showHint && mcq.hint && (
                <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3.5 py-2.5 text-xs text-blue-900 dark:text-blue-200">
                  <strong>Hint:</strong> {mcq.hint}
                </div>
              )}

              {checkedPractice && (
                <div
                  className={`rounded-lg border px-4 py-3 text-xs leading-relaxed ${
                    selectedIndex === mcq.correctAnswerIndex
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="font-semibold mb-1">
                    {selectedIndex === mcq.correctAnswerIndex
                      ? 'Correct — Well reasoned.'
                      : `Incorrect — Correct option is ${String.fromCharCode(65 + mcq.correctAnswerIndex)}.`}
                  </div>
                  <p>{mcq.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CompleteTheWordsView: React.FC<{
  question: CompleteWordsQuestion;
  mode: ExamMode;
  answer: Record<string, string>;
  onChangeAnswer: (val: Record<string, string>) => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  showHint: boolean;
  setShowHint: React.Dispatch<React.SetStateAction<boolean>>;
  checkedPractice: boolean;
  setCheckedPractice: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  question,
  mode,
  answer,
  onChangeAnswer,
  bookmarked,
  onToggleBookmark,
  showHint,
  setShowHint,
  checkedPractice,
  setCheckedPractice,
}) => {
  const segments = question.passageTemplate.split(/(\{\{b\d+\}\})/g);

  const isBlankCorrect = (blankId: string) => {
    const blank = question.blanks.find((b) => b.blankId === blankId);
    if (!blank) return false;
    const raw = (answer[blankId] || '').trim().toLowerCase();
    const fullAttempt = raw.startsWith(blank.prefix.toLowerCase())
      ? raw
      : `${blank.prefix.toLowerCase()}${raw}`;
    const valid = [blank.answer, ...(blank.acceptedVariants || [])].map((v) => v.toLowerCase());
    return valid.includes(fullAttempt) || valid.includes(raw);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">
            Complete the Words (2026 Format)
          </span>
          <span>·</span>
          <span>{question.topic}</span>
          <span>·</span>
          <span>{question.difficulty}</span>
          <span>·</span>
          <span>CEFR {question.cefr}</span>
        </div>
        <button
          type="button"
          onClick={onToggleBookmark}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            bookmarked
              ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-7 space-y-5">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {question.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Type the missing letters to complete each academic word based on sentence grammar and context.
          </p>
        </div>

        <div className="text-[16px] leading-9 text-slate-800 dark:text-slate-100">
          {segments.map((seg, idx) => {
            const match = seg.match(/^\{\{(b\d+)\}\}$/);
            if (!match) return <span key={idx}>{seg}</span>;
            const blankId = match[1];
            const blank = question.blanks.find((b) => b.blankId === blankId);
            if (!blank) return null;
            const remainingLen = Math.max(3, blank.answer.length - blank.prefix.length);
            const val = answer[blankId] || '';
            const showCheck = mode === 'practice' && checkedPractice;
            const correct = isBlankCorrect(blankId);

            return (
              <span
                key={blankId}
                className={`inline-flex items-baseline mx-1 px-2 py-0.5 rounded-md border align-baseline ${
                  showCheck
                    ? correct
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15'
                      : 'border-rose-500 bg-rose-50 dark:bg-rose-500/15'
                    : 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/40'
                }`}
              >
                <span className="font-mono font-semibold text-[#0B1733] dark:text-cyan-300 text-sm">
                  {blank.prefix}
                </span>
                <input
                  type="text"
                  value={val}
                  aria-label={`Complete word starting with ${blank.prefix}`}
                  onChange={(e) => {
                    onChangeAnswer({ ...answer, [blankId]: e.target.value });
                    if (mode === 'practice') setCheckedPractice(false);
                  }}
                  style={{ width: `${Math.max(remainingLen + 2, 6)}ch` }}
                  placeholder={'_'.repeat(Math.min(remainingLen, 6))}
                  className="bg-transparent font-mono text-sm text-blue-700 dark:text-white focus:outline-none border-b border-blue-400/70 ml-0.5 px-0.5"
                />
              </span>
            );
          })}
        </div>

        {mode === 'practice' && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCheckedPractice(true)}
                className="px-4 py-2 rounded-lg bg-[#0B1733] dark:bg-blue-600 text-white text-xs font-semibold hover:bg-[#132652]"
              >
                Validate Spelling &amp; Context
              </button>
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'Hide Contextual Hints' : 'Show Contextual Hints'}
              </button>
            </div>

            {showHint && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {question.blanks.map((b, i) => (
                  <div
                    key={b.blankId}
                    className="rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-3 py-2"
                  >
                    <span className="font-mono font-semibold text-blue-700 dark:text-cyan-300">
                      {i + 1}. {b.prefix}___
                    </span>{' '}
                    — {b.contextHint}
                  </div>
                ))}
              </div>
            )}

            {checkedPractice && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-2 text-xs">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Answer Key &amp; Contextual Explanation
                </div>
                <div className="flex flex-wrap gap-3">
                  {question.blanks.map((b, i) => {
                    const ok = isBlankCorrect(b.blankId);
                    return (
                      <span
                        key={b.blankId}
                        className={`inline-flex items-center gap-1 font-mono font-medium ${
                          ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {i + 1}. {b.answer}
                      </span>
                    );
                  })}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
