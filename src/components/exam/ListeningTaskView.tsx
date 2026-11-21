import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  FileText,
  Headphones,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  XCircle,
} from 'lucide-react';
import { ExamMode, ListeningQuestion } from '../../types/toefl';
import { audioController } from '../../utils/audio';
import { formatTaskTypeLabel } from '../../utils/scoring';

interface ListeningTaskViewProps {
  question: ListeningQuestion;
  mode: ExamMode;
  answer: unknown;
  onChangeAnswer: (val: number | null) => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  defaultRate?: number;
}

export const ListeningTaskView: React.FC<ListeningTaskViewProps> = ({
  question,
  mode,
  answer,
  onChangeAnswer,
  bookmarked,
  onToggleBookmark,
  defaultRate = 1.0,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [rate, setRate] = useState(mode === 'strict' ? 1.0 : defaultRate);
  const [volume, setVolume] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [checkedPractice, setCheckedPractice] = useState(false);

  const selectedIndex = typeof answer === 'number' ? answer : null;

  useEffect(() => {
    audioController.stop();
    setIsPlaying(false);
    setProgressPct(0);
    setHasPlayedOnce(false);
    setShowTranscript(false);
    setShowHint(false);
    setCheckedPractice(false);
    return () => {
      audioController.stop();
    };
  }, [question.id]);

  const strictReplayLocked = mode === 'strict' && hasPlayedOnce && !isPlaying;

  const handlePlay = () => {
    if (strictReplayLocked) return;
    audioController.playScript(
      question.script,
      { rate: mode === 'strict' ? 1.0 : rate, volume },
      {
        onStart: () => {
          setIsPlaying(true);
          setProgressPct(4);
        },
        onProgress: (pct) => {
          setProgressPct(pct);
        },
        onEnd: () => {
          setIsPlaying(false);
          setHasPlayedOnce(true);
          setProgressPct(100);
        },
      }
    );
  };

  const handleStop = () => {
    if (mode === 'strict') return;
    audioController.stop();
    setIsPlaying(false);
  };

  const bars = [26, 48, 72, 36, 84, 60, 42, 90, 54, 70, 38, 82, 58, 44, 76, 62, 34, 68, 52, 40];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatTaskTypeLabel(question.taskType)}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Audio Console Panel */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0B1733] text-cyan-300 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {question.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {question.contextLabel}
              </p>
            </div>
          </div>

          {/* Animated Waveform Deck */}
          <div className="rounded-xl bg-[#0B1733] p-5 text-white space-y-4">
            <div className="h-14 flex items-center justify-center gap-1.5" aria-hidden="true">
              {bars.map((h, i) => {
                const active = (i / bars.length) * 100 <= progressPct;
                return (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-200 ${
                      active ? 'bg-cyan-400' : 'bg-white/20'
                    }`}
                    style={{
                      height: `${isPlaying ? Math.max(20, ((h + ((i * 19 + progressPct) % 45)) % 95)) : Math.round(h * 0.45)}%`,
                    }}
                  />
                );
              })}
            </div>

            {/* Progress Track */}
            <div className="space-y-1.5">
              <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono tabular-nums">
                <span>
                  {isPlaying
                    ? 'Playing Audio Prompt...'
                    : hasPlayedOnce
                    ? 'Playback Complete'
                    : 'Ready to Play'}
                </span>
                <span>{progressPct}%</span>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                {!isPlaying ? (
                  <button
                    type="button"
                    disabled={strictReplayLocked}
                    onClick={handlePlay}
                    className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-lg bg-[#2563EB] hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-xs font-semibold transition-colors"
                  >
                    {hasPlayedOnce ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {strictReplayLocked
                      ? 'Single Play Complete (Strict)'
                      : hasPlayedOnce
                      ? 'Replay Audio'
                      : 'Play Audio'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={mode === 'strict'}
                    onClick={handleStop}
                    className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-lg bg-white/15 hover:bg-white/25 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    {mode === 'strict' ? 'Playing (Pause Locked)' : 'Stop'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Volume */}
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                  <Volume2 className="w-3.5 h-3.5" />
                  <input
                    type="range"
                    min={0.2}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="Audio volume"
                    className="w-16 accent-cyan-400"
                  />
                </label>

                {/* Playback speed (Practice mode only) */}
                {mode === 'practice' ? (
                  <select
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    aria-label="Playback speed"
                    className="bg-white/10 border border-white/15 rounded-md px-2 py-1 text-xs text-white font-mono"
                  >
                    <option value={0.85} className="text-slate-900">0.85x</option>
                    <option value={1.0} className="text-slate-900">1.0x</option>
                    <option value={1.15} className="text-slate-900">1.15x</option>
                  </select>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">1.0x Fixed</span>
                )}
              </div>
            </div>
          </div>

          {/* Strict vs Practice Transcript Governance */}
          {mode === 'strict' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Strict Exam Mode: Transcripts and replays are restricted to mirror realistic TOEFL iBT listening conditions.
            </p>
          ) : (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setShowTranscript((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-cyan-400 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                {showTranscript ? 'Hide Audio Transcript' : 'Review Transcript (Practice Mode)'}
              </button>
              {showTranscript && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {question.script.map((line, i) => (
                    <p key={i}>
                      <strong className="text-slate-900 dark:text-white">{line.speaker}:</strong>{' '}
                      {line.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Question & Options Panel */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Skill Focus: <span className="font-medium text-slate-800 dark:text-slate-200">{question.skillFocus}</span>
          </div>

          <h4 className="font-display text-base font-semibold text-slate-900 dark:text-white leading-snug">
            {question.question}
          </h4>

          <div className="space-y-2.5">
            {question.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedIndex === idx;
              const showFeedback = mode === 'practice' && checkedPractice;
              const isCorrectOpt = idx === question.correctAnswerIndex;

              let style =
                'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-950/60';
              if (showFeedback) {
                if (isCorrectOpt) style = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-500/10';
                else if (isSelected) style = 'border-rose-500 bg-rose-50/70 dark:bg-rose-500/10';
              } else if (isSelected) {
                style = 'border-[#1D4ED8] bg-blue-50/70 dark:bg-blue-600/15 ring-1 ring-[#1D4ED8]';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChangeAnswer(idx);
                    if (mode === 'practice') setCheckedPractice(false);
                  }}
                  className={`w-full text-left rounded-lg border px-4 py-3 min-h-[48px] text-sm transition-colors flex items-start gap-3 ${style}`}
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
                  className="px-3.5 py-2 rounded-lg bg-[#0B1733] dark:bg-blue-600 disabled:opacity-40 text-white text-xs font-semibold"
                >
                  Check Answer
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

              {checkedPractice && (
                <div
                  className={`rounded-lg border px-4 py-3 text-xs leading-relaxed ${
                    selectedIndex === question.correctAnswerIndex
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="font-semibold mb-1">
                    {selectedIndex === question.correctAnswerIndex
                      ? 'Correct!'
                      : `Correct Answer: ${String.fromCharCode(65 + question.correctAnswerIndex)}`}
                  </div>
                  <p>{question.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
