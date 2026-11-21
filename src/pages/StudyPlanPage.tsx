import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, CheckCircle2, Circle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionType } from '../types/toefl';
import { AnimatedProgressBar } from '../components/ui/MotionPrimitives';

export const StudyPlanPage: React.FC = () => {
  const { state, updateStudyPlanConfig, toggleStudyTask } = useApp();
  const navigate = useNavigate();

  const cfg = state.studyPlan.config;
  const [currentBand, setCurrentBand] = useState(cfg.currentBand);
  const [targetBand, setTargetBand] = useState(cfg.targetBand);
  const [testDate, setTestDate] = useState(cfg.testDate);
  const [dailyMinutes, setDailyMinutes] = useState(cfg.dailyMinutes);
  const [focusSkills, setFocusSkills] = useState<SectionType[]>(cfg.focusSkills);
  const [savedNotice, setSavedNotice] = useState(false);

  const completedTasks = state.studyPlan.tasks.filter((t) => t.completed).length;
  const completionPct = Math.round(
    (completedTasks / Math.max(1, state.studyPlan.tasks.length)) * 100
  );

  const daysUntilExam = Math.max(
    1,
    Math.round((new Date(testDate).getTime() - Date.now()) / 86400000)
  );

  const toggleSkill = (sec: SectionType) => {
    setFocusSkills((prev) =>
      prev.includes(sec)
        ? prev.length > 1
          ? prev.filter((s) => s !== sec)
          : prev
        : [...prev, sec]
    );
  };

  const handleRebuildPlan = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudyPlanConfig({
      currentBand,
      targetBand,
      testDate,
      dailyMinutes,
      focusSkills,
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-blue-700 dark:text-cyan-400">
            Adaptive Weekly Roadmap · {daysUntilExam} Days Until Target Date
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Personalized Study Plan
          </h1>
        </div>

        <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
          Weekly Completion: <strong>{completedTasks}/{state.studyPlan.tasks.length}</strong> ({completionPct}%)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Plan Configurator */}
        <form
          onSubmit={handleRebuildPlan}
          className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
        >
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Customize Your Parameters
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Current Band
              </label>
              <select
                value={currentBand}
                onChange={(e) => setCurrentBand(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
              >
                {[2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5].map((b) => (
                  <option key={b} value={b}>
                    {b.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Target Band
              </label>
              <select
                value={targetBand}
                onChange={(e) => setTargetBand(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
              >
                {[3.5, 4.0, 4.5, 5.0, 5.5, 6.0].map((b) => (
                  <option key={b} value={b}>
                    {b.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Target Test Date
            </label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-medium text-slate-600 dark:text-slate-400">
                Daily Available Time
              </label>
              <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                {dailyMinutes} min/day
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={120}
              step={5}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full accent-[#1D4ED8]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Priority Weak Skills
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['reading', 'listening', 'writing', 'speaking'] as const).map((sec) => {
                const selected = focusSkills.includes(sec);
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => toggleSkill(sec)}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold capitalize transition-colors ${
                      selected
                        ? 'border-[#1D4ED8] bg-blue-50 dark:bg-blue-600/20 text-[#1D4ED8] dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {sec}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate Weekly Plan
          </button>

          {savedNotice && (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium text-center">
              Study plan updated to match your goals.
            </div>
          )}
        </form>

        {/* Right: Weekly Schedule & Milestones */}
        <div className="lg:col-span-8 space-y-5">
          {/* Milestones Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {state.studyPlan.milestones.map((ms) => (
              <div
                key={ms.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-700 dark:text-cyan-400">{ms.weekLabel}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    Band {ms.targetBand.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ms.goal}
                </p>
              </div>
            ))}
          </div>

          {/* Weekly Task Schedule */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  7-Day Study Schedule
                </h2>
              </div>
              <div className="w-32">
                <AnimatedProgressBar percent={completionPct} heightClass="h-2" />
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.studyPlan.tasks.map((task) => (
                <div
                  key={task.id}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleStudyTask(task.id)}
                      aria-label={`Mark ${task.title} complete`}
                      className="mt-0.5 text-slate-400 hover:text-[#1D4ED8] dark:hover:text-cyan-400 shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {task.dayOfWeek}
                        </span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{task.durationMin} min</span>
                        <span>·</span>
                        <span className="capitalize">{task.section}</span>
                      </div>
                      <div
                        className={`font-display text-sm font-semibold mt-0.5 ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(task.route)}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0 self-start sm:self-center transition-colors"
                  >
                    Open Task
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
