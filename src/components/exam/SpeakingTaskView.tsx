import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ClipboardCheck,
  Mic,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react';
import {
  ExamMode,
  SpeakingEvaluationResult,
  SpeakingQuestion,
} from '../../types/toefl';
import { audioController } from '../../utils/audio';
import { evaluateSpeakingLocally, formatTaskTypeLabel } from '../../utils/scoring';

interface SpeakingAnswerPayload {
  transcript: string;
  durationSec: number;
  recordedAt?: string;
}

interface SpeakingTaskViewProps {
  question: SpeakingQuestion;
  mode: ExamMode;
  answer: unknown;
  onChangeAnswer: (val: SpeakingAnswerPayload) => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export const SpeakingTaskView: React.FC<SpeakingTaskViewProps> = ({
  question,
  mode,
  answer,
  onChangeAnswer,
}) => {
  const saved = (answer as SpeakingAnswerPayload | undefined) || {
    transcript: '',
    durationSec: 0,
  };

  const [promptPlaying, setPromptPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(Array(18).fill(18));
  const [evaluation, setEvaluation] = useState<SpeakingEvaluationResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const transcriptRef = useRef<string>(saved.transcript);

  useEffect(() => {
    transcriptRef.current = saved.transcript;
  }, [saved.transcript]);

  useEffect(() => {
    stopRecordingInternal();
    audioController.stop();
    setAudioUrl(null);
    setRecordElapsed(0);
    setMicError(null);
    setEvaluation(null);
    return () => {
      stopRecordingInternal();
      audioController.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const stopRecordingInternal = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setRecording(false);
    setLevels(Array(18).fill(18));
  };

  const handlePlayPrompt = () => {
    const text =
      question.taskType === 'listen-and-repeat'
        ? question.targetSentence
        : question.questionPrompt;
    const role =
      question.taskType === 'listen-and-repeat' ? question.voiceRole : 'female-academic';
    audioController.playScript(
      [{ speaker: 'Interviewer', voiceRole: role, text }],
      { rate: 0.96 },
      {
        onStart: () => setPromptPlaying(true),
        onEnd: () => setPromptPlaying(false),
      }
    );
  };

  const startRecording = async () => {
    setMicError(null);
    setEvaluation(null);
    setAudioUrl(null);
    chunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Live audio waveform analyser
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          const src = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          src.connect(analyser);
          const data = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            analyser.getByteFrequencyData(data);
            const bars = Array.from({ length: 18 }, (_, i) =>
              Math.max(16, Math.min(96, Math.round((data[i % data.length] / 255) * 100)))
            );
            setLevels(bars);
            rafRef.current = requestAnimationFrame(tick);
          };
          tick();
        }

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            setAudioUrl(URL.createObjectURL(blob));
          }
        };
        recorder.start();
      }
    } catch {
      setMicError(
        'Microphone access was unavailable or denied. You can still type or edit your spoken response transcript below for rubric evaluation.'
      );
    }

    // Start browser SpeechRecognition if available
    const Win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const RecCtor = Win.SpeechRecognition || Win.webkitSpeechRecognition;
    if (RecCtor) {
      try {
        const rec = new RecCtor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        let finalized = '';
        rec.onresult = (ev: SpeechRecognitionEventLike) => {
          let interim = '';
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const chunk = ev.results[i][0]?.transcript || '';
            if (ev.results[i].isFinal) finalized += `${chunk} `;
            else interim += chunk;
          }
          const combined = `${finalized}${interim}`.trim();
          if (combined) {
            onChangeAnswer({
              transcript: combined,
              durationSec: recordElapsed + 1,
              recordedAt: new Date().toISOString(),
            });
          }
        };
        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      } catch {
        // Ignore STT start issues
      }
    }

    setRecording(true);
    setRecordElapsed(0);
    const maxSec = question.responseTimeSec;
    timerRef.current = window.setInterval(() => {
      setRecordElapsed((prev) => {
        const next = prev + 1;
        if (next >= maxSec) {
          stopRecordingInternal();
          return maxSec;
        }
        return next;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    const dur = recordElapsed;
    stopRecordingInternal();
    onChangeAnswer({
      transcript: transcriptRef.current,
      durationSec: Math.max(1, dur),
      recordedAt: new Date().toISOString(),
    });
  };

  const handleEvaluatePractice = () => {
    const local = evaluateSpeakingLocally(
      question.taskType,
      saved.transcript,
      question.taskType === 'listen-and-repeat' ? question.targetSentence : undefined
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
          <span>Response Limit: {question.responseTimeSec}s</span>
        </div>
        <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
          CEFR {question.cefr}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Prompt Side */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
          {question.taskType === 'listen-and-repeat' ? (
            <>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Listen and Repeat Prompt
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{question.contextLabel}</p>
              <button
                type="button"
                onClick={handlePlayPrompt}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1733] hover:bg-[#132652] text-white text-xs font-semibold transition-colors"
              >
                <Volume2 className="w-4 h-4 text-cyan-300" />
                {promptPlaying ? 'Playing Sentence...' : 'Play Spoken Sentence'}
              </button>
              {mode === 'practice' && (
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">
                    Practice Reference Text
                  </div>
                  “{question.targetSentence}”
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400">
                {question.interviewerRole}
              </div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {question.topicTitle}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {question.questionPrompt}
              </p>
              <button
                type="button"
                onClick={handlePlayPrompt}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {promptPlaying ? 'Reading Prompt...' : 'Listen to Interviewer'}
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Focus: {question.followUpFocus}
              </p>
              {mode === 'practice' && (
                <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Suggested 45-Second Structure
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                    {question.sampleOutline.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recording Console Side */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
            {/* Dark Acoustic Studio Deck */}
            <div className="rounded-xl bg-[#0B1733] p-5 text-white space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  {recording ? 'Recording Active' : audioUrl ? 'Recording Saved' : 'Microphone Standby'}
                </span>
                <span className="font-mono tabular-nums text-cyan-300 font-semibold">
                  00:{String(recordElapsed).padStart(2, '0')} / 00:{String(question.responseTimeSec).padStart(2, '0')}
                </span>
              </div>

              <div className="h-14 flex items-center justify-center gap-1.5" aria-hidden="true">
                {levels.map((lvl, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 rounded-full transition-all duration-75 ${
                      recording ? 'bg-cyan-400' : 'bg-white/20'
                    }`}
                    style={{ height: `${lvl}%` }}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {!recording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-lg bg-[#2563EB] hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                    {audioUrl ? 'Retake Recording' : 'Start Recording'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                    Stop Recording
                  </button>
                )}

                {audioUrl && !recording && (
                  <audio controls src={audioUrl} className="h-9 w-full sm:w-auto sm:max-w-[240px]" />
                )}

                {saved.transcript && !recording && (
                  <button
                    type="button"
                    onClick={() => {
                      setAudioUrl(null);
                      setRecordElapsed(0);
                      setEvaluation(null);
                      onChangeAnswer({ transcript: '', durationSec: 0 });
                    }}
                    className="inline-flex items-center gap-1.5 min-h-[42px] px-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {micError && (
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{micError}</span>
              </div>
            )}

            {/* Speech-to-Text Transcript Capture (Editable Fallback for Reliability) */}
            <div className="space-y-1.5">
              <label
                htmlFor={`sp-txt-${question.id}`}
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Captured Speech Transcript (Auto-filled via Speech Recognition or editable if mic STT is unavailable)
              </label>
              <textarea
                id={`sp-txt-${question.id}`}
                rows={4}
                value={saved.transcript}
                onChange={(e) =>
                  onChangeAnswer({
                    transcript: e.target.value,
                    durationSec: saved.durationSec || 12,
                    recordedAt: new Date().toISOString(),
                  })
                }
                placeholder="Click Start Recording and speak clearly, or type your spoken response here if your browser blocks Speech Recognition..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            {mode === 'practice' && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={saved.transcript.trim().length < 4}
                  onClick={handleEvaluatePractice}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-45 text-white text-xs font-semibold transition-colors"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Check My Speaking Score
                </button>
                <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                  <Play className="w-3 h-3" /> Saved automatically for final report
                </span>
              </div>
            )}
          </div>

          {evaluation && mode === 'practice' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="text-xs text-slate-500">
                    Built-in Speaking Rubric · Transcript Analysis
                  </div>
                  <div className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Estimated Band: {evaluation.bandScore.toFixed(1)} / 6.0
                  </div>
                </div>
                {typeof evaluation.wordAccuracyPct === 'number' && (
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs text-slate-500">Word Accuracy</div>
                    <div className="text-base font-bold text-[#1D4ED8] dark:text-cyan-300">
                      {evaluation.wordAccuracyPct}%
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200">{evaluation.summary}</p>

              {evaluation.omissions && evaluation.omissions.length > 0 && (
                <div className="text-xs text-rose-700 dark:text-rose-300">
                  <strong>Omitted words:</strong> {evaluation.omissions.join(', ')}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Strengths</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    Focus Recommendations
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                <strong>Transparency Note:</strong> {evaluation.disclosure}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
