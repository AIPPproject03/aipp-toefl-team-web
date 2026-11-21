import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  GripVertical,
  HelpCircle,
  Mail,
  MessageSquare,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import {
  AcademicDiscussionQuestion,
  BuildSentenceQuestion,
  ExamMode,
  WriteEmailQuestion,
  WritingEvaluationResult,
  WritingQuestion,
} from '../../types/toefl';
import { evaluateWritingLocally, formatTaskTypeLabel } from '../../utils/scoring';

interface WritingTaskViewProps {
  question: WritingQuestion;
  mode: ExamMode;
  answer: unknown;
  onChangeAnswer: (val: unknown) => void;
}

export const WritingTaskView: React.FC<WritingTaskViewProps> = ({
  question,
  mode,
  answer,
  onChangeAnswer,
}) => {
  if (question.taskType === 'build-a-sentence') {
    return (
      <BuildSentenceView
        question={question}
        mode={mode}
        ordered={(Array.isArray(answer) ? (answer as string[]) : [])}
        onChangeOrder={(arr) => onChangeAnswer(arr)}
      />
    );
  }

  return (
    <ExtendedWritingView
      question={question}
      mode={mode}
      text={typeof answer === 'string' ? answer : ''}
      onChangeText={(txt) => onChangeAnswer(txt)}
    />
  );
};

const BuildSentenceView: React.FC<{
  question: BuildSentenceQuestion;
  mode: ExamMode;
  ordered: string[];
  onChangeOrder: (arr: string[]) => void;
}> = ({ question, mode, ordered, onChangeOrder }) => {
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const available = question.fragments.filter((frag) => !ordered.includes(frag));
  const isCorrect =
    ordered.length === question.correctOrder.length &&
    ordered.every((item, idx) => item === question.correctOrder[idx]);

  const handleAdd = (frag: string) => {
    setChecked(false);
    onChangeOrder([...ordered, frag]);
  };

  const handleRemove = (idx: number) => {
    setChecked(false);
    const next = [...ordered];
    next.splice(idx, 1);
    onChangeOrder(next);
  };

  const handleDropOnSlot = (targetIdx: number) => {
    if (dragIndex === null || dragIndex === targetIdx) return;
    const next = [...ordered];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIdx, 0, moved);
    setDragIndex(null);
    setChecked(false);
    onChangeOrder(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">
            Build a Sentence (2026 Format)
          </span>
          <span>·</span>
          <span>{question.topic}</span>
          <span>·</span>
          <span>{question.difficulty}</span>
          <span>·</span>
          <span>{question.skillFocus}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            onChangeOrder([]);
            setChecked(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Order
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5">
        <p className="text-sm text-slate-600 dark:text-slate-300">{question.promptContext}</p>

        {/* Constructed Sentence Zone */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-3">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Click word chunks below or drag placed chunks to reorder:
          </div>
          <div className="flex flex-wrap items-center gap-2 min-h-[52px]">
            <span className="px-3 py-2 rounded-lg bg-[#0B1733] text-white text-sm font-medium">
              {question.leadIn}
            </span>
            {ordered.map((frag, idx) => (
              <button
                key={`${frag}-${idx}`}
                type="button"
                draggable
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnSlot(idx)}
                onClick={() => handleRemove(idx)}
                title="Drag to reorder or click to remove"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1D4ED8] bg-blue-50 dark:bg-blue-600/20 text-[#0B1733] dark:text-white text-sm font-medium cursor-grab active:cursor-grabbing hover:bg-blue-100 dark:hover:bg-blue-600/30 transition-colors"
              >
                <GripVertical className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-300 shrink-0" />
                <span>{frag}</span>
              </button>
            ))}
            {ordered.length === 0 && (
              <span className="text-sm text-slate-400 italic px-2">
                Select fragments in order to complete the sentence...
              </span>
            )}
          </div>
        </div>

        {/* Word Bank */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Available Word Chunks ({available.length} remaining)
          </div>
          <div className="flex flex-wrap gap-2">
            {available.map((frag) => (
              <button
                key={frag}
                type="button"
                onClick={() => handleAdd(frag)}
                className="min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#1D4ED8] hover:bg-blue-50/60 dark:hover:bg-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 transition-colors"
              >
                {frag}
              </button>
            ))}
          </div>
        </div>

        {mode === 'practice' && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={ordered.length === 0}
                onClick={() => setChecked(true)}
                className="px-4 py-2 rounded-lg bg-[#0B1733] dark:bg-blue-600 disabled:opacity-40 text-white text-xs font-semibold"
              >
                Check Sentence Syntax
              </button>
              {question.hint && (
                <button
                  type="button"
                  onClick={() => setShowHint((h) => !h)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              )}
            </div>

            {showHint && question.hint && (
              <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3.5 py-2.5 text-xs text-blue-900 dark:text-blue-200">
                <strong>Hint:</strong> {question.hint}
              </div>
            )}

            {checked && (
              <div
                className={`rounded-lg border px-4 py-3 text-xs space-y-1.5 ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Grammatically Accurate!
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Not quite — review the correct order below.
                    </>
                  )}
                </div>
                <p className="font-medium">
                  Model Sentence: “{question.leadIn} {question.correctOrder.join(' ')}.”
                </p>
                <p className="opacity-90">{question.grammarRule}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ExtendedWritingView: React.FC<{
  question: WriteEmailQuestion | AcademicDiscussionQuestion;
  mode: ExamMode;
  text: string;
  onChangeText: (val: string) => void;
}> = ({ question, mode, text, onChangeText }) => {
  const [evaluation, setEvaluation] = useState<WritingEvaluationResult | null>(null);
  const [showSample, setShowSample] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleEvaluatePractice = () => {
    const local = evaluateWritingLocally(
      question.taskType,
      text,
      question.minWords,
      question.sampleHighScoreResponse
    );
    setEvaluation(local);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatTaskTypeLabel(question.taskType)}
          </span>
          <span>·</span>
          <span>{question.topic}</span>
          <span>·</span>
          <span>Target: {question.minWords}+ words</span>
        </div>
        <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
          Word Count: {wordCount}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Prompt Column */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
          {question.taskType === 'write-email' ? (
            <>
              <div className="flex items-center gap-2.5 text-[#1D4ED8] dark:text-cyan-400">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold">Campus Email Task</span>
              </div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {question.title}
              </h3>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">To:</span>{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-200">{question.recipient}</span>
                </div>
                <div>
                  <span className="text-slate-500">Subject:</span>{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-200">{question.subjectLine}</span>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {question.scenario}
              </p>
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Make sure your email addresses:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {question.bulletRequirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 text-[#1D4ED8] dark:text-cyan-400">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold">{question.courseName}</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {question.professorName}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mt-1">
                  {question.professorPrompt}
                </p>
              </div>
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {question.studentResponses.map((stu) => (
                  <div
                    key={stu.name}
                    className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">{stu.name}</span>
                      <span className="text-slate-500">{stu.stance}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {stu.message}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Editor & Feedback Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor={`wr-${question.id}`} className="font-semibold text-slate-800 dark:text-slate-200">
                Your Response
              </label>
              <span
                className={`font-mono tabular-nums ${
                  wordCount >= question.minWords
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {wordCount} / {question.minWords}+ recommended words
              </span>
            </div>

            <textarea
              id={`wr-${question.id}`}
              value={text}
              onChange={(e) => onChangeText(e.target.value)}
              rows={12}
              placeholder={
                question.taskType === 'write-email'
                  ? 'Dear Dr. ...\n\nI am writing to...'
                  : 'State your perspective clearly, engage with your classmates’ points, and develop specific supporting reasons...'
              }
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950/80 px-4 py-3 text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />

            {mode === 'practice' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={wordCount < 10}
                    onClick={handleEvaluatePractice}
                    className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-45 text-white text-xs font-semibold transition-colors"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    Check My Writing Score
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSample((s) => !s)}
                    className="min-h-[42px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {showSample ? 'Hide Model Example' : 'View High-Scoring Model'}
                  </button>
                </div>
                <span className="text-[11px] text-slate-500">
                  Autosaved · Instant built-in rubric check
                </span>
              </div>
            )}
          </div>

          {showSample && mode === 'practice' && (
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 p-5 space-y-2">
              <div className="text-xs font-bold text-[#1D4ED8] dark:text-cyan-300">
                Band 5.5–6.0 Reference Model Response
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {question.sampleHighScoreResponse}
              </p>
            </div>
          )}

          {evaluation && mode === 'practice' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="text-xs text-slate-500">
                    Built-in Analytical Writing Rubric
                  </div>
                  <div className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Estimated Writing Band: {evaluation.bandScore.toFixed(1)} / 6.0
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  Independent Estimate<br />Not an ETS Score
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(evaluation.criteria).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-3 py-2"
                  >
                    <div className="text-slate-500 capitalize">
                      {k.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {Number(v).toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {evaluation.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">Strengths</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-amber-700 dark:text-amber-400">
                    Actionable Improvements
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
