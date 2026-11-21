import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Headphones,
  Lightbulb,
  Mic,
  PenTool,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type GuideTab = 'format' | 'grammar' | 'writing' | 'speaking';

interface QuickDrillItem {
  id: string;
  ruleTitle: string;
  ruleSummary: string;
  formula: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const GRAMMAR_DRILLS: QuickDrillItem[] = [
  {
    id: 'gd-inversion',
    ruleTitle: 'Negative Inversion ("Not only...", "Rarely...")',
    ruleSummary:
      'When a sentence starts with a negative or limiting adverbial, put the auxiliary verb before the subject.',
    formula: 'Not only + do/does/did/has + Subject + Verb..., but + Subject + also...',
    prompt: 'Which sentence is grammatically accurate for TOEFL Build-a-Sentence?',
    options: [
      'Not only urban parks reduce heat, but they also absorb rainwater.',
      'Not only do urban parks reduce heat, but they also absorb rainwater.',
      'Not only reduce urban parks heat, but also they absorb rainwater.',
      'Not only do urban parks reduces heat, but they also absorb rainwater.',
    ],
    correctIndex: 1,
    explanation:
      '"Not only" at the start triggers auxiliary inversion ("do urban parks reduce"), keeping the main verb in base form.',
  },
  {
    id: 'gd-indirect',
    ruleTitle: 'Indirect / Embedded Questions',
    ruleSummary:
      'Inside a polite lead-in like "Could you tell me..." or "I wonder...", use normal statement word order (Subject + Verb).',
    formula: 'Could you let me know + wh-word / whether + Subject + Verb?',
    prompt: 'Choose the best sentence for a formal campus email to a professor:',
    options: [
      'Could you let me know when will the revised syllabus be posted?',
      'Could you let me know when is the revised syllabus posted?',
      'Could you let me know when the revised syllabus will be posted?',
      'Could you let me know that when the revised syllabus will be posted?',
    ],
    correctIndex: 2,
    explanation:
      'Embedded questions never invert the verb before the subject: "when the revised syllabus will be posted".',
  },
  {
    id: 'gd-participle',
    ruleTitle: 'Participial Modifiers (Avoiding Dangling Modifiers)',
    ruleSummary:
      'The subject right after an opening participial phrase must be the person or thing performing that action.',
    formula: 'Having analyzed the data, + [the researcher] + revised the model.',
    prompt: 'Which opening sentence avoids a dangling modifier?',
    options: [
      'Having calibrated the microscope, the slides became much clearer.',
      'Having calibrated the microscope, the lab assistant photographed the slides.',
      'Calibrating the microscope carefully, clear images were produced.',
      'After calibrating the microscope, the results showed higher accuracy.',
    ],
    correctIndex: 1,
    explanation:
      'Only a person ("the lab assistant") can calibrate a microscope; slides, images, and results cannot.',
  },
  {
    id: 'gd-concession',
    ruleTitle: 'Concession Connectors ("Although" vs. "Despite")',
    ruleSummary:
      'Use "Although / Even though" before a full clause (Subject + Verb), and "Despite / In spite of" before a noun or -ing phrase.',
    formula: 'Although + Subject + Verb  |  Despite + Noun / Verb-ing',
    prompt: 'Select the sentence that uses a concession connector correctly:',
    options: [
      'Despite the rainfall was heavy, attendance at the symposium remained high.',
      'Although the heavy rainfall, attendance at the symposium remained high.',
      'Despite the heavy rainfall, attendance at the symposium remained high.',
      'Although the rainfall was heavy, but attendance remained high.',
    ],
    correctIndex: 2,
    explanation:
      '"Despite" takes a noun phrase ("the heavy rainfall"). Also never combine "Although" and "but" in the same sentence.',
  },
  {
    id: 'gd-subjunctive',
    ruleTitle: 'Academic Recommendations (Subjunctive Mood)',
    ruleSummary:
      'After verbs like recommend, suggest, insist, or require + that, use the base verb without -s or past tense.',
    formula: 'The committee recommended that + Subject + [base verb]...',
    prompt: 'Which sentence follows standard academic English?',
    options: [
      'The dean recommended that every applicant submits a portfolio by Friday.',
      'The dean recommended that every applicant submit a portfolio by Friday.',
      'The dean recommended that every applicant submitted a portfolio by Friday.',
      'The dean recommended every applicant should submits a portfolio by Friday.',
    ],
    correctIndex: 1,
    explanation:
      'In formal academic English, "recommend that + subject + base verb (submit)" is preferred.',
  },
];

const SPEAKING_DRILLS: QuickDrillItem[] = [
  {
    id: 'sd-chunking',
    ruleTitle: 'Listen & Repeat — Meaning Chunking',
    ruleSummary:
      'Instead of memorizing 16 individual words, group the sentence into 2–3 natural meaning chunks as you listen.',
    formula: '[Who / What]  +  [Action]  +  [When / Where / Why]',
    prompt:
      'You hear: "Students who register before Friday / will receive a free lab manual / at the science bookstore." What is the best way to hold it in memory?',
    options: [
      'Try to spell every word mentally letter by letter while the speaker is talking',
      'Hold 3 short meaning blocks: who registers early -> what they get -> where to pick it up',
      'Focus only on the last three words and guess the opening clause',
      'Speak as fast as possible so you finish in two seconds',
    ],
    correctIndex: 1,
    explanation:
      'Chunking by meaning preserves exact grammar, articles, and prepositions without overloading short-term memory.',
  },
  {
    id: 'sd-are',
    ruleTitle: 'Take an Interview — The 45-Second A-R-E Blueprint',
    ruleSummary:
      'Strong 45-second interview answers follow three clear steps so you never run out of things to say.',
    formula: 'Answer (0–8s) → Reason (8–22s) → Specific Example (22–40s) → Wrap-up (40–45s)',
    prompt: 'Which opening best sets up a Band 5.5+ TOEFL Interview answer?',
    options: [
      '"Um, well, that is a very interesting question and there are many sides to think about..."',
      '"I prefer small seminar classes because direct discussion helps me retain complex ideas faster."',
      '"Maybe yes, maybe no, it depends on the day and the weather."',
      '"First, let me repeat the interviewer’s question word for word."',
    ],
    correctIndex: 1,
    explanation:
      'Answering directly in the first 8 seconds with your main reason immediately demonstrates clarity and leaves time for a concrete example.',
  },
];

export const StudyGuidePage: React.FC = () => {
  const { state, completeGuideDrill } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<GuideTab>('format');
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [awardedIds, setAwardedIds] = useState<Record<string, boolean>>({});

  const handleCheckDrill = (drill: QuickDrillItem) => {
    const chosen = picks[drill.id];
    if (chosen === undefined) return;
    setCheckedIds((prev) => ({ ...prev, [drill.id]: true }));
    if (chosen === drill.correctIndex && !awardedIds[drill.id]) {
      setAwardedIds((prev) => ({ ...prev, [drill.id]: true }));
      completeGuideDrill(25);
    }
  };

  const renderDrillCard = (drill: QuickDrillItem) => {
    const picked = picks[drill.id];
    const isChecked = !!checkedIds[drill.id];
    const isCorrect = picked === drill.correctIndex;

    return (
      <div
        key={drill.id}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4"
      >
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {drill.ruleTitle}
            </h3>
            {awardedIds[drill.id] && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> +25 XP
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {drill.ruleSummary}
          </p>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 font-mono text-xs text-[#1D4ED8] dark:text-cyan-300 overflow-x-auto">
            Pattern: {drill.formula}
          </div>
        </div>

        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Quick Check: {drill.prompt}
          </div>
          <div className="space-y-2">
            {drill.options.map((opt, idx) => {
              const selected = picked === idx;
              let cls =
                'border-slate-200 dark:border-slate-700 hover:border-[#1D4ED8] text-slate-700 dark:text-slate-200';
              if (isChecked) {
                if (idx === drill.correctIndex) {
                  cls =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200';
                } else if (selected) {
                  cls =
                    'border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-900 dark:text-rose-200';
                }
              } else if (selected) {
                cls =
                  'border-[#1D4ED8] bg-blue-50 dark:bg-blue-600/20 text-slate-900 dark:text-white';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isChecked}
                  onClick={() => setPicks((prev) => ({ ...prev, [drill.id]: idx }))}
                  className={`w-full text-left rounded-lg border px-3.5 py-2.5 min-h-[44px] text-xs leading-relaxed transition-colors ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1">
            {!isChecked ? (
              <button
                type="button"
                disabled={picked === undefined}
                onClick={() => handleCheckDrill(drill)}
                className="min-h-[40px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-45 text-white text-xs font-semibold transition-colors"
              >
                Check Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCheckedIds((prev) => ({ ...prev, [drill.id]: false }));
                  setPicks((prev) => {
                    const copy = { ...prev };
                    delete copy[drill.id];
                    return copy;
                  });
                }}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </button>
            )}
          </div>

          {isChecked && (
            <div
              className={`rounded-lg border px-3.5 py-2.5 text-xs space-y-1 ${
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Correct!
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Review the rule below:
                  </>
                )}
              </div>
              <p className="leading-relaxed">{drill.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#1D4ED8] dark:text-cyan-400 tabular-nums">
            100% Built-in Self-Study Reference · {state.guideDrillsCompleted} Quick Drills Completed
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Study Guide &amp; Quick Drills
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Clear guides for the 2026 TOEFL iBT format, high-impact grammar patterns, writing
            blueprints, and speaking frameworks — completely self-contained.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/practice')}
          className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold shrink-0 self-start sm:self-auto transition-colors"
        >
          Open Practice Center
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal-Scrollable 4-Tab Bar on Mobile */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/75 dark:bg-slate-800/80 overflow-x-auto no-scrollbar max-w-full sm:w-fit">
        {(
          [
            { id: 'format', label: '2026 Format & Scoring' },
            { id: 'grammar', label: 'Grammar Quick Drills' },
            { id: 'writing', label: 'Writing Blueprints' },
            { id: 'speaking', label: 'Speaking Frameworks' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              tab === t.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 2026 FORMAT & SCORE SCALE */}
      {tab === 'format' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: BookOpen,
                sec: 'reading',
                title: '1. Reading Section (Adaptive)',
                time: '~18 minutes',
                tasks: [
                  'Complete the Words — Fill missing letters in academic paragraphs using context & word forms.',
                  'Read in Daily Life — Campus emails, notices, event schedules, and everyday information.',
                  'Read an Academic Passage — University-level texts testing main ideas, inference, and structure.',
                ],
                tip: 'Stage 1 routes you into Stage 2 difficulty. Read steadily and avoid rushing Stage 1!',
              },
              {
                icon: Headphones,
                sec: 'listening',
                title: '2. Listening Section (Adaptive)',
                time: '~16 minutes',
                tasks: [
                  'Listen & Choose a Response — Pick the most natural reply to a short spoken statement.',
                  'Listen to a Conversation — Campus service or advising dialogues.',
                  'Listen to an Announcement — Short campus briefings and schedule changes.',
                  'Listen to an Academic Talk — Mini-lectures on science, history, and social studies.',
                ],
                tip: 'Take short keyword notes on problem, solution, and contrast words ("however", "actually").',
              },
              {
                icon: PenTool,
                sec: 'writing',
                title: '3. Writing Section',
                time: '~22 minutes',
                tasks: [
                  'Build a Sentence — Arrange word chunks into grammatically accurate sentences.',
                  'Write an Email — Clear, polite campus communication hitting every bullet requirement (85+ words).',
                  'Write for an Academic Discussion — Join an online class thread and engage with peers (110+ words).',
                ],
                tip: 'Leave 1 minute at the end of each task to check verb tense, subject-verb agreement, and transitions.',
              },
              {
                icon: Mic,
                sec: 'speaking',
                title: '4. Speaking Section',
                time: '~8 minutes',
                tasks: [
                  'Listen and Repeat — Hear a sentence once and repeat it accurately with clear rhythm.',
                  'Take an Interview — Answer direct 45-second academic or campus lifestyle questions naturally.',
                ],
                tip: 'Speak at a calm, steady pace. A brief 0.5-second silent pause sounds much better than "um" or "uh".',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.sec}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1D4ED8] dark:text-cyan-400 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                          {card.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-slate-500 tabular-nums shrink-0">
                        {card.time}
                      </span>
                    </div>

                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {card.tasks.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>

                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400 shrink-0 mt-0.5" />
                      <span>{card.tip}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/section-practice?section=${card.sec}`)}
                    className="inline-flex items-center gap-1.5 min-h-[36px] text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400 hover:underline self-start"
                  >
                    Practice {card.sec.charAt(0).toUpperCase() + card.sec.slice(1)} Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* 1.0 - 6.0 Band Scale Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-3">
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Understanding the 2026 Band Scale (1.0 – 6.0)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each section receives a band from 1.0 to 6.0 in 0.5 increments. Your overall score is
              the average of all four sections rounded to the nearest 0.5.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
              {[
                { band: '6.0', cefr: 'C2', legacy: '~119', label: 'Mastery' },
                { band: '5.5', cefr: 'C1+', legacy: '~114', label: 'Distinguished' },
                { band: '5.0', cefr: 'C1', legacy: '~106', label: 'Advanced' },
                { band: '4.5', cefr: 'B2+', legacy: '~96', label: 'High-Interm.' },
                { band: '4.0', cefr: 'B2', legacy: '~86', label: 'Upper-Interm.' },
                { band: '3.0', cefr: 'B1+', legacy: '~66', label: 'Intermediate' },
              ].map((row) => (
                <div
                  key={row.band}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-center"
                >
                  <div className="font-display text-lg font-extrabold text-[#0B1733] dark:text-white tabular-nums">
                    Band {row.band}
                  </div>
                  <div className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400 mt-0.5">
                    CEFR {row.cefr}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                    {row.label} · {row.legacy} ref
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRAMMAR QUICK DRILLS */}
      {tab === 'grammar' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/30 px-4 py-3 text-xs text-slate-700 dark:text-slate-200">
            Master these 5 high-frequency grammar structures to ace <strong>Build a Sentence</strong>{' '}
            and write error-free academic responses. Each correct check awards +25 XP.
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {GRAMMAR_DRILLS.map((d) => renderDrillCard(d))}
          </div>
        </div>
      )}

      {/* TAB 3: WRITING BLUEPRINTS */}
      {tab === 'writing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400">
                Task 2 · Target 85–120 Words
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Write an Email Blueprint
              </h2>
            </div>

            <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5">
                <div className="font-semibold text-slate-900 dark:text-white">
                  1. Polite Greeting + Purpose (1–2 sentences)
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  “Dear Dr. [Name], I am writing regarding [course/event] to ask about [main purpose].”
                </p>
              </li>
              <li className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5">
                <div className="font-semibold text-slate-900 dark:text-white">
                  2. Cover Every Bullet Point Clearly (3–4 sentences)
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Dedicate one crisp sentence to each requirement in the prompt (context, specific
                  request/question, and practical proposal).
                </p>
              </li>
              <li className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5">
                <div className="font-semibold text-slate-900 dark:text-white">
                  3. Courteous Sign-Off (1 sentence)
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  “Thank you very much for your time and assistance. Best regards, [Your Name]”
                </p>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => navigate('/section-practice?pack=pack-email-discussion')}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-lg bg-[#0B1733] dark:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors"
            >
              Practice Email &amp; Discussion Pack
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400">
                Task 3 · Target 110–150 Words
              </div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Academic Discussion Blueprint
              </h2>
            </div>

            <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5">
                <div className="font-semibold text-slate-900 dark:text-white">
                  1. Clear Stance + Engage a Classmate
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  “While [Student A] raises a fair concern about X, I agree with [Student B] that Y
                  is far more effective in practice.”
                </p>
              </li>
              <li className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5">
                <div className="font-semibold text-slate-900 dark:text-white">
                  2. Original Reason + Concrete Example
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  “For instance, in [specific field or scenario], ... Consequently, this leads to...”
                </p>
              </li>
              <li className="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5">
                <div className="font-semibold text-slate-900 dark:text-white">
                  3. High-Impact Academic Transitions
                </div>
                <p className="mt-1 font-mono text-[11px] text-[#1D4ED8] dark:text-cyan-300">
                  However · Moreover · Consequently · For instance · In contrast · Whereas · Therefore
                </p>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => navigate('/section-practice?pack=pack-build-sentence')}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Practice Build-a-Sentence Pack
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SPEAKING FRAMEWORKS */}
      {tab === 'speaking' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SPEAKING_DRILLS.map((d) => renderDrillCard(d))}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Ready to practice out loud?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Launch an 8-sentence Listen &amp; Repeat warmup or a 6-prompt Interview drill pack.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/section-practice?pack=pack-listen-repeat')}
                className="min-h-[40px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors"
              >
                Listen &amp; Repeat Warmup
              </button>
              <button
                type="button"
                onClick={() => navigate('/section-practice?pack=pack-speaking-interview')}
                className="min-h-[40px] px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Interview Practice Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
