import React from 'react';
import { Award, CheckCircle2, Flame, Lock, Target, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  AnimatedProgressBar,
  ScoreRing,
  useShouldReduceMotion,
} from '../components/ui/MotionPrimitives';

export const AchievementsPage: React.FC = () => {
  const { state, levelInfo, getMetricValue } = useApp();
  const reduceMotion = useShouldReduceMotion();

  const unlockedCount = state.unlockedAchievementIds.length;
  const weeklyMinutes = state.weeklyActivity.reduce((s, d) => s + d.minutes, 0);
  const weeklyGoalMinutes = state.profile.dailyGoalMinutes * 7;
  const weeklyPct = Math.min(100, Math.round((weeklyMinutes / Math.max(1, weeklyGoalMinutes)) * 100));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-medium text-[#1D4ED8] dark:text-cyan-400">
          Academic Milestones &amp; Consistent Growth
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
          Achievements &amp; Progression
        </h1>
      </div>

      {/* Level, Streak & Weekly Goal Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 rounded-2xl bg-[#0B1733] aipp-grid-pattern text-white p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-cyan-300 font-semibold">
                Level {levelInfo.level} · {levelInfo.title}
              </div>
              <div className="font-display text-2xl sm:text-3xl font-bold tabular-nums mt-0.5">
                {state.xp.toLocaleString()} Total XP
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-cyan-300 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300 tabular-nums">
              <span>Progress to Level {levelInfo.level + 1}</span>
              <span>
                {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP
              </span>
            </div>
            <AnimatedProgressBar
              percent={levelInfo.pct}
              heightClass="h-2"
              trackClass="bg-white/15"
              fillClass="bg-cyan-400"
            />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-display text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {state.streakDays} Days
          </div>
          <div className="text-xs text-slate-500">
            {Math.max(0, 7 - state.streakDays) === 0
              ? '7-day milestone reached'
              : `${7 - state.streakDays} more days to Seven-Day Streak`}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Target className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-cyan-400" />
              Weekly Goal
            </div>
            <div className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {weeklyMinutes}m
            </div>
            <div className="text-[11px] text-slate-500 tabular-nums">
              of {weeklyGoalMinutes}m target
            </div>
          </div>

          <ScoreRing
            value={weeklyPct}
            max={100}
            size={74}
            strokeWidth={6}
            trackColor="rgba(148,163,184,0.22)"
            progressColor="#2563EB"
          >
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
              {weeklyPct}%
            </span>
          </ScoreRing>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-900 dark:text-white text-base font-display">
            Milestone Honors ({unlockedCount} of {ACHIEVEMENTS.length} Unlocked)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((ach, idx) => {
            const unlocked = state.unlockedAchievementIds.includes(ach.id);
            const currentVal = getMetricValue(ach.metricKey);
            const pct = Math.min(100, Math.round((currentVal / Math.max(0.1, ach.target)) * 100));

            return (
              <motion.div
                key={ach.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.25, delay: Math.min(idx * 0.03, 0.25), ease: [0.16, 1, 0.3, 1] }
                }
                className={`rounded-xl border p-5 flex flex-col justify-between gap-4 transition-colors ${
                  unlocked
                    ? 'border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-900/95'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        unlocked
                          ? 'bg-[#0B1733] text-cyan-300 ring-1 ring-cyan-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">
                        {ach.category} · +{ach.xpReward} XP
                      </div>
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {ach.title}
                      </h3>
                    </div>
                  </div>
                  {unlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ach.description}
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500">
                    <span>{unlocked ? 'Completed' : 'Progress'}</span>
                    <span>
                      {Number.isInteger(ach.target)
                        ? `${Math.min(currentVal, ach.target)} / ${ach.target}`
                        : `${Math.min(currentVal, ach.target).toFixed(1)} / ${ach.target.toFixed(1)}`}
                    </span>
                  </div>
                  <AnimatedProgressBar
                    percent={unlocked ? 100 : pct}
                    delay={Math.min(idx * 0.03, 0.25)}
                    fillClass={unlocked ? 'bg-emerald-500' : 'bg-[#1D4ED8]'}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
