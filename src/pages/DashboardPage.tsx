import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  Headphones,
  Layers,
  Mic,
  PenTool,
  Play,
  RotateCcw,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getBankCounts } from '../utils/questionEngine';
import { formatTaskTypeLabel } from '../utils/scoring';
import {
  AnimatedProgressBar,
  CountUpValue,
  CustomChartTooltip,
  ScoreRing,
} from '../components/ui/MotionPrimitives';

const DAILY_CHALLENGE_Q = {
  prompt:
    'In a 2026 TOEFL iBT Academic Discussion, which strategy most reliably raises your Organization and Development score from Band 4.0 to Band 5.5?',
  options: [
    'Repeating the professor’s question word-for-word before listing five unrelated bullet points',
    'Directly engaging with at least one classmate’s reasoning and extending the argument with a concrete example',
    'Avoiding any mention of the other students so your response sounds completely independent',
    'Writing under 60 words to eliminate the possibility of minor grammatical slips',
  ],
  correctIndex: 1,
  explanation:
    'High-scoring Academic Discussion posts explicitly build on or contrast with peers’ ideas and support a focused point with a concrete example.',
};

type ChartView = 'trend' | 'skills' | 'activity';

export const DashboardPage: React.FC = () => {
  const {
    state,
    latestAttempt,
    previousAttempt,
    weakestSection,
    completeDailyChallenge,
  } = useApp();
  const navigate = useNavigate();
  const bankCounts = useMemo(() => getBankCounts(), []);

  const [challengePick, setChallengePick] = useState<number | null>(null);
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [chartView, setChartView] = useState<ChartView>('trend');

  const today = new Date().toISOString().slice(0, 10);
  const challengeAlreadyDone = state.dailyChallengeCompletedDate === today;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const scoreDelta =
    latestAttempt && previousAttempt
      ? Number((latestAttempt.overallBand - previousAttempt.overallBand).toFixed(1))
      : null;

  const todayMinutes = state.weeklyActivity[state.weeklyActivity.length - 1]?.minutes || 0;
  const dailyGoalPct = Math.min(
    100,
    Math.round((todayMinutes / Math.max(1, state.profile.dailyGoalMinutes)) * 100)
  );

  const trendData = useMemo(() => {
    return [...state.attempts]
      .reverse()
      .map((a, idx) => ({
        name: `Test ${idx + 1}`,
        date: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        overall: a.overallBand,
      }));
  }, [state.attempts]);

  const radarData = useMemo(() => {
    const s = latestAttempt?.sectionScores || {
      reading: 3.5,
      listening: 3.5,
      writing: 3.5,
      speaking: 3.5,
    };
    return [
      { skill: 'Reading', value: s.reading },
      { skill: 'Listening', value: s.listening },
      { skill: 'Writing', value: s.writing },
      { skill: 'Speaking', value: s.speaking },
    ];
  }, [latestAttempt]);

  const taskAccuracyData = useMemo(() => {
    const agg: Record<string, { correct: number; total: number }> = {};
    state.attempts.forEach((a) => {
      a.taskTypeStats.forEach((t) => {
        if (!agg[t.taskType]) agg[t.taskType] = { correct: 0, total: 0 };
        agg[t.taskType].correct += t.correct;
        agg[t.taskType].total += t.total;
      });
    });
    return Object.entries(agg)
      .slice(0, 6)
      .map(([k, v]) => ({
        task: formatTaskTypeLabel(k)
          .replace('Listen to an ', '')
          .replace('Listen to a ', '')
          .replace('Read an ', ''),
        accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
      }));
  }, [state.attempts]);

  const handleSubmitChallenge = () => {
    if (challengePick === null) return;
    setChallengeSubmitted(true);
    if (challengePick === DAILY_CHALLENGE_Q.correctIndex) {
      completeDailyChallenge(75);
    }
  };

  const skillCards = [
    {
      key: 'reading' as const,
      label: 'Reading',
      icon: BookOpen,
      count: bankCounts.reading,
      desc: 'Complete the Words · Daily Life · Academic Passages',
    },
    {
      key: 'listening' as const,
      label: 'Listening',
      icon: Headphones,
      count: bankCounts.listening,
      desc: 'Quick Responses · Conversations · Talks',
    },
    {
      key: 'writing' as const,
      label: 'Writing',
      icon: PenTool,
      count: bankCounts.writing,
      desc: 'Build a Sentence · Email · Academic Discussion',
    },
    {
      key: 'speaking' as const,
      label: 'Speaking',
      icon: Mic,
      count: bankCounts.speaking,
      desc: 'Listen & Repeat · 45s Interview',
    },
  ];

  return (
    <div className="space-y-7">
      {/* 1. Institutional Hero Anchor */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0B1733] aipp-grid-pattern text-white p-5 sm:p-7 lg:p-8 border border-slate-800/90">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-3.5">
            <div className="text-xs font-medium tracking-wide text-cyan-300">
              AIPP TOEFL TEAM · 2026 TOEFL iBT Simulation Platform
            </div>
            <h1 className="font-display text-2xl sm:text-[32px] font-bold tracking-tight leading-[1.15]">
              {greeting}, {state.profile.displayName}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {latestAttempt
                ? `Current estimated proficiency is Band ${latestAttempt.overallBand.toFixed(1)} / 6.0 (CEFR ${latestAttempt.cefrLevel}). Focus next on ${weakestSection.charAt(0).toUpperCase() + weakestSection.slice(1)} to reach your ${state.profile.targetBand.toFixed(1)} target.`
                : `Choose any skill below to practice immediately, or launch a full 4-section simulation from our ${bankCounts.total}-exercise library.`}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/simulation')}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-lg bg-[#1D4ED8] hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                Start Full Test
              </button>
              <button
                type="button"
                onClick={() => navigate('/practice')}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-sm font-semibold transition-colors"
              >
                <Layers className="w-4 h-4 text-cyan-300" />
                Browse {bankCounts.total} Exercises
              </button>
              <button
                type="button"
                onClick={() => navigate('/analytics?tab=mistakes')}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Review Mistakes
              </button>
            </div>
          </div>

          {/* Right Focal Band Gauge + Daily Momentum */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-row items-stretch sm:items-center gap-4 lg:justify-end">
            <div className="rounded-xl bg-[#081229]/90 border border-white/10 p-4 sm:p-5 flex items-center gap-4 flex-1 lg:flex-initial">
              <ScoreRing
                value={latestAttempt ? latestAttempt.overallBand : 0}
                max={6}
                size={96}
                strokeWidth={7}
                trackColor="rgba(255,255,255,0.12)"
                progressColor="#22D3EE"
              >
                <div className="font-display text-2xl font-extrabold text-white leading-none">
                  {latestAttempt ? (
                    <CountUpValue value={latestAttempt.overallBand} decimals={1} />
                  ) : (
                    '—'
                  )}
                </div>
                <div className="text-[10px] font-medium text-cyan-300 mt-1 uppercase tracking-wider">
                  {latestAttempt ? `CEFR ${latestAttempt.cefrLevel}` : 'of 6.0'}
                </div>
              </ScoreRing>

              <div className="space-y-1.5 min-w-0">
                <div className="text-xs font-semibold text-white">Estimated Band</div>
                <div className="text-xs text-slate-400 tabular-nums">
                  {scoreDelta !== null
                    ? `${scoreDelta >= 0 ? '+' : ''}${scoreDelta.toFixed(1)} vs prior test`
                    : `Target Band ${state.profile.targetBand.toFixed(1)}`}
                </div>
                <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-300 tabular-nums">
                  <span className="inline-flex items-center gap-1 text-cyan-300 font-medium">
                    <Flame className="w-3.5 h-3.5" />
                    {state.streakDays}d streak
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#081229]/90 border border-white/10 p-4 flex flex-col justify-between gap-3 sm:w-44 shrink-0">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5 font-medium text-cyan-300">
                  <Target className="w-3.5 h-3.5" /> Daily Goal
                </span>
                <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                  {dailyGoalPct}%
                </span>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-white tabular-nums leading-none">
                  {todayMinutes}
                  <span className="text-xs font-medium text-slate-400">
                    {' '}
                    / {state.profile.dailyGoalMinutes} min
                  </span>
                </div>
                <div className="mt-2.5">
                  <AnimatedProgressBar
                    percent={dailyGoalPct}
                    heightClass="h-1.5"
                    trackClass="bg-white/15"
                    fillClass="bg-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unfinished Draft Banner (if active) */}
      {state.draftExam && (
        <section className="rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[#0B1733] dark:text-white">
              Continue where you left off — {state.draftExam.type}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 capitalize">
              Currently on {state.draftExam.sections[state.draftExam.currentSectionIndex]} · Question{' '}
              {state.draftExam.currentQuestionIndex + 1}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/simulation?resume=1')}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold shrink-0 self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5" /> Resume Session
          </button>
        </section>
      )}

      {/* 2. Practice by Skill — 4-Column Mastery Strip */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Practice by Skill
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Launch focused 2026 section drills with instant feedback, audio playback, and rubric scoring.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/study-guide')}
            className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400 hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            Open Study Guide →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {skillCards.map((item, idx) => {
            const Icon = item.icon;
            const val = latestAttempt?.sectionScores[item.key];
            const isFocus = item.key === weakestSection;
            const pct = val !== undefined ? Math.round((val / 6) * 100) : 0;

            return (
              <div
                key={item.key}
                className={`rounded-xl border bg-white dark:bg-slate-900/90 p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isFocus
                    ? 'border-[#1D4ED8] dark:border-cyan-500/70'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1D4ED8] dark:text-cyan-400 flex items-center justify-center shrink-0">
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                        {val !== undefined ? val.toFixed(1) : '—'}
                      </div>
                      <div
                        className={`text-[11px] mt-1 font-medium ${
                          isFocus
                            ? 'text-[#1D4ED8] dark:text-cyan-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {isFocus ? 'Priority Focus' : `Target ${state.profile.targetBand.toFixed(1)}`}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <AnimatedProgressBar
                    percent={pct}
                    delay={idx * 0.06}
                    heightClass="h-1.5"
                    fillClass={
                      isFocus ? 'bg-[#1D4ED8] dark:bg-cyan-400' : 'bg-slate-700 dark:bg-blue-500'
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {item.count} exercises
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/section-practice?section=${item.key}`)}
                    className="inline-flex items-center gap-1 min-h-[36px] px-2 -mr-2 rounded-lg text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Practice <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Progress Charts + Daily 1-Minute Strategy Check */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tabbed Progress Panel */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Performance Overview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track band progression, skill balance, and weekly study time
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-xs overflow-x-auto no-scrollbar self-start sm:self-auto">
              {(
                [
                  { id: 'trend', label: 'Score Trend' },
                  { id: 'skills', label: 'Skill Balance' },
                  { id: 'activity', label: 'Weekly Time' },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setChartView(v.id)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    chartView === v.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            {chartView === 'trend' &&
              (trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.18} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[1, 6]}
                      ticks={[1, 2, 3, 4, 5, 6]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip decimals={1} unit=" / 6.0" />} />
                    <Area
                      type="monotone"
                      dataKey="overall"
                      name="Overall Band"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fill="url(#bandFill)"
                      dot={{ r: 3.5, fill: '#2563EB', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#06B6D4', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Complete a test to chart your score history.
                </div>
              ))}

            {chartView === 'skills' && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="74%">
                  <PolarGrid stroke="#94a3b8" strokeOpacity={0.22} />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar
                    name="Current Band"
                    dataKey="value"
                    stroke="#06B6D4"
                    fill="#2563EB"
                    fillOpacity={0.25}
                    strokeWidth={2.2}
                  />
                  <Tooltip content={<CustomChartTooltip decimals={1} unit=" / 6.0" />} />
                </RadarChart>
              </ResponsiveContainer>
            )}

            {chartView === 'activity' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={state.weeklyActivity} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.18} vertical={false} />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomChartTooltip unit=" min" />} />
                  <Bar dataKey="minutes" name="Study Time" fill="#06B6D4" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {taskAccuracyData.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {taskAccuracyData.slice(0, 3).map((row, idx) => (
                <div key={row.task} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-slate-400 truncate">{row.task}</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      {row.accuracy}%
                    </span>
                  </div>
                  <AnimatedProgressBar
                    percent={row.accuracy}
                    delay={idx * 0.08}
                    fillClass={
                      row.accuracy >= 75
                        ? 'bg-emerald-500'
                        : row.accuracy >= 55
                        ? 'bg-[#1D4ED8]'
                        : 'bg-amber-500'
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily 1-Minute Strategy Check */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400">
                  Daily Quick Check · +75 XP
                </div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  1-Minute Strategy Question
                </h2>
              </div>
              {challengeAlreadyDone && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              )}
            </div>

            <p className="text-xs sm:text-[13.5px] text-slate-700 dark:text-slate-200 leading-relaxed">
              {DAILY_CHALLENGE_Q.prompt}
            </p>

            <div className="space-y-2">
              {DAILY_CHALLENGE_Q.options.map((opt, idx) => {
                const selected = challengePick === idx;
                const isCorrect = idx === DAILY_CHALLENGE_Q.correctIndex;
                let cls =
                  'border-slate-200 dark:border-slate-700/90 hover:border-[#1D4ED8] text-slate-700 dark:text-slate-200';
                if (challengeSubmitted || challengeAlreadyDone) {
                  if (isCorrect)
                    cls =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200';
                  else if (selected)
                    cls =
                      'border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-900 dark:text-rose-200';
                } else if (selected) {
                  cls =
                    'border-[#1D4ED8] bg-blue-50 dark:bg-blue-600/20 text-slate-900 dark:text-white';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={challengeSubmitted || challengeAlreadyDone}
                    onClick={() => setChallengePick(idx)}
                    className={`w-full text-left rounded-lg border px-3.5 py-2.5 min-h-[44px] text-xs leading-relaxed transition-colors flex items-start gap-2.5 ${cls}`}
                  >
                    <span className="font-mono font-bold text-[11px] opacity-70 mt-0.5 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!challengeSubmitted && !challengeAlreadyDone ? (
            <button
              type="button"
              disabled={challengePick === null}
              onClick={handleSubmitChallenge}
              className="w-full min-h-[44px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-45 text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              Check Answer
            </button>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-3 leading-relaxed">
              {DAILY_CHALLENGE_Q.explanation}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
