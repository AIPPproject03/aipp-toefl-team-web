import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTaskTypeLabel } from '../utils/scoring';
import {
  AnimatedProgressBar,
  CustomChartTooltip,
} from '../components/ui/MotionPrimitives';

export const AnalyticsPage: React.FC = () => {
  const { state, latestAttempt } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'mistakes'>(
    searchParams.get('tab') === 'mistakes' ? 'mistakes' : 'overview'
  );
  const [mistakeSectionFilter, setMistakeSectionFilter] = useState<string>('all');

  const sectionHistory = useMemo(() => {
    return [...state.attempts].reverse().map((a, idx) => ({
      attempt: `#${idx + 1}`,
      date: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Overall: a.overallBand,
      Reading: a.sectionScores.reading,
      Listening: a.sectionScores.listening,
      Writing: a.sectionScores.writing,
      Speaking: a.sectionScores.speaking,
    }));
  }, [state.attempts]);

  const allMistakes = useMemo(() => {
    return state.attempts.flatMap((a) => a.mistakes);
  }, [state.attempts]);

  const filteredMistakes = useMemo(() => {
    if (mistakeSectionFilter === 'all') return allMistakes;
    return allMistakes.filter((m) => m.section === mistakeSectionFilter);
  }, [allMistakes, mistakeSectionFilter]);

  const taskPerformance = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    state.attempts.forEach((a) => {
      a.taskTypeStats.forEach((t) => {
        if (!map[t.taskType]) map[t.taskType] = { correct: 0, total: 0 };
        map[t.taskType].correct += t.correct;
        map[t.taskType].total += t.total;
      });
    });
    return Object.entries(map).map(([k, v]) => ({
      name: formatTaskTypeLabel(k),
      accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
      items: v.total,
    }));
  }, [state.attempts]);

  const totalStudyHours = (
    state.weeklyActivity.reduce((s, d) => s + d.minutes, 0) / 60 +
    state.attempts.reduce((s, a) => s + a.durationSec / 3600, 0)
  ).toFixed(1);

  const totalQuestionsAnswered =
    state.weeklyActivity.reduce((s, d) => s + d.questions, 0) +
    state.attempts.reduce((s, a) => s + a.taskTypeStats.reduce((t, i) => t + i.total, 0), 0);

  const avgResponseSec = useMemo(() => {
    const vals: number[] = [];
    state.attempts.forEach((a) => {
      Object.values(a.sectionSummaries).forEach((s) => {
        if (s?.avgResponseTimeSec) vals.push(s.avgResponseTimeSec);
      });
    });
    if (!vals.length) return 54;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [state.attempts]);

  const targetProgressPct = latestAttempt
    ? Math.min(100, Math.round((latestAttempt.overallBand / state.profile.targetBand) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-blue-700 dark:text-cyan-400">
            Diagnostic Intelligence &amp; Mistake Remediation
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Performance Analytics
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/simulation?mode=weakness-based')}
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors"
          >
            Start Weakness-Based Practice
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="inline-flex p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Score &amp; Skill Trends
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mistakes')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold ${
                activeTab === 'mistakes'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Mistake Analysis ({allMistakes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Top KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-2">
          <div className="text-xs text-slate-500">Target Score Progress</div>
          <div className="font-display text-2xl font-bold text-[#1D4ED8] dark:text-cyan-400 tabular-nums">
            {targetProgressPct}%
          </div>
          <AnimatedProgressBar percent={targetProgressPct} heightClass="h-1.5" />
          <div className="text-[11px] text-slate-500 tabular-nums">
            {latestAttempt ? latestAttempt.overallBand.toFixed(1) : '—'} / {state.profile.targetBand.toFixed(1)} goal
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-slate-500">CEFR Trajectory</div>
          <div className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {latestAttempt?.cefrLevel || '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Current proficiency</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-slate-500">Questions Answered</div>
          <div className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {totalQuestionsAnswered}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cumulative items</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-slate-500">Study Hours</div>
          <div className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {totalStudyHours}h
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{state.streakDays}-day streak</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-xs text-slate-500">Avg Response Pace</div>
          <div className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {avgResponseSec}s
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Per question item</div>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Section Score History Multi-Line */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Section Score Progression (1.0–6.0 Band Scale)
              </h2>
              <p className="text-xs text-slate-500">Compare Reading, Listening, Writing, and Speaking over time</p>
            </div>
            <div className="h-72">
              {sectionHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sectionHistory} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.18} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[1, 6]} ticks={[1, 2, 3, 4, 5, 6]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip decimals={1} unit=" / 6.0" />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="Reading" stroke="#2563EB" strokeWidth={2.2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Listening" stroke="#06B6D4" strokeWidth={2.2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Writing" stroke="#8B5CF6" strokeWidth={2.2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Speaking" stroke="#F59E0B" strokeWidth={2.2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Complete a simulation to plot section trajectories.
                </div>
              )}
            </div>
          </div>

          {/* Accuracy by Question Type */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Question-Type Mastery (%)
              </h2>
              <p className="text-xs text-slate-500">Pinpoint exact 2026 task formats to drill</p>
            </div>
            <div className="h-72">
              {taskPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taskPerformance.slice(0, 7)}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 6, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.18} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10.5, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomChartTooltip unit="%" />} />
                    <Bar dataKey="accuracy" name="Accuracy" fill="#2563EB" radius={[0, 5, 5, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No task accuracy data yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Mistake Analysis View */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/75 dark:bg-slate-800/80 overflow-x-auto no-scrollbar max-w-full sm:w-fit">
              {(['all', 'reading', 'listening', 'writing', 'speaking'] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setMistakeSectionFilter(sec)}
                  className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap shrink-0 transition-colors ${
                    mistakeSectionFilter === sec
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {allMistakes.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/simulation?mode=mistake-review')}
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 rounded-lg bg-[#0B1733] dark:bg-[#1D4ED8] hover:bg-[#132652] dark:hover:bg-blue-600 text-white text-xs font-semibold shrink-0 transition-colors"
              >
                Launch Mistake Review Drill
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filteredMistakes.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-display text-base font-bold text-slate-900 dark:text-white">
                No mistakes logged in this category
              </div>
              <p className="text-xs text-slate-500">
                Incorrect answers from simulations and practice sets will automatically appear here with full diagnostics.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMistakes.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white capitalize">
                        {m.section}
                      </span>{' '}
                      · {formatTaskTypeLabel(m.taskType)} · {m.topic} ·{' '}
                      <span className="font-medium text-blue-700 dark:text-cyan-400">
                        Skill: {m.skillFocus}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums">{m.attemptId}</span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    {m.questionPrompt}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 text-rose-900 dark:text-rose-200">
                      <div className="font-semibold mb-0.5">Your Answer</div>
                      <div>{m.userAnswer}</div>
                    </div>
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-emerald-900 dark:text-emerald-200">
                      <div className="font-semibold mb-0.5">Correct Answer</div>
                      <div>{m.correctAnswer}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong>Diagnostic Explanation:</strong> {m.explanation}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Recommended practice: Target {m.skillFocus} in {m.section}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/section-practice?section=${m.section}`)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400 hover:underline"
                    >
                      Practice {m.section.charAt(0).toUpperCase() + m.section.slice(1)}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
