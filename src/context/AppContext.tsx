import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ACHIEVEMENTS,
  INITIAL_BASELINE_ATTEMPTS,
  buildDefaultWeeklyActivity,
  generateStudyPlan,
} from '../data/achievements';
import { computeSM2Review } from '../data/vocabularyBank';
import { subscribeBankChanges } from '../bank/questionBankRegistry';
import {
  AppState,
  SavedExamDraft,
  SectionType,
  StudyPlanConfig,
  TestAttempt,
  UserProfile,
} from '../types/toefl';

const STORAGE_KEY = 'aipp_toefl_team_nexus_v1';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultTargetDate(): string {
  const d = new Date(Date.now() + 42 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function createInitialState(): AppState {
  const today = todayStr();
  const targetDate = defaultTargetDate();
  return {
    profile: {
      displayName: 'Alex Mercer',
      avatarInitials: 'AM',
      avatarColor: '#1D4ED8',
      targetBand: 5.5,
      targetTestDate: targetDate,
      dailyGoalMinutes: 45,
      theme: 'light',
      soundEnabled: true,
      reducedMotion: false,
      strictModeDefault: true,
      preferredSpeechRate: 1.0,
      interfaceLanguage: 'English (Academic Default)',
    },
    attempts: INITIAL_BASELINE_ATTEMPTS,
    draftExam: null,
    recentQuestionIds: [],
    vocabProgress: {
      'v-01': {
        wordId: 'v-01',
        easeFactor: 2.6,
        intervalDays: 12,
        repetitions: 3,
        nextReviewAt: new Date(Date.now() + 8 * 86400000).toISOString(),
        lastReviewedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        status: 'mastered',
        favorite: true,
        saved: true,
      },
      'v-02': {
        wordId: 'v-02',
        easeFactor: 2.5,
        intervalDays: 6,
        repetitions: 2,
        nextReviewAt: new Date(Date.now() - 3600000).toISOString(),
        lastReviewedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        status: 'learning',
        favorite: true,
        saved: true,
      },
      'v-07': {
        wordId: 'v-07',
        easeFactor: 1.9,
        intervalDays: 1,
        repetitions: 0,
        nextReviewAt: new Date(Date.now() - 7200000).toISOString(),
        lastReviewedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'difficult',
        favorite: false,
        saved: true,
      },
    },
    studyPlan: generateStudyPlan(4.5, 5.5, targetDate, 45, ['speaking', 'listening']),
    xp: 1240,
    streakDays: 5,
    lastActiveDate: today,
    dailyChallengeCompletedDate: null,
    weeklyActivity: buildDefaultWeeklyActivity(),
    unlockedAchievementIds: ['ach-first-practice', 'ach-full-test', 'ach-reading-master'],
    guideDrillsCompleted: 1,
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState> & { aiTutorMessagesCount?: number };
    const fallback = createInitialState();
    const migratedStudyPlan = parsed.studyPlan
      ? {
          ...parsed.studyPlan,
          tasks: parsed.studyPlan.tasks.map((t) =>
            t.route === '/ai-tutor'
              ? {
                  ...t,
                  title: 'Weekly Mistake Review & Study Guide Check',
                  description:
                    'Review missed grammar & writing patterns in the Study Guide and set next week’s focus.',
                  route: '/study-guide',
                }
              : t
          ),
        }
      : fallback.studyPlan;
    return {
      ...fallback,
      ...parsed,
      guideDrillsCompleted:
        typeof parsed.guideDrillsCompleted === 'number'
          ? parsed.guideDrillsCompleted
          : typeof parsed.aiTutorMessagesCount === 'number'
          ? parsed.aiTutorMessagesCount
          : fallback.guideDrillsCompleted,
      profile: { ...fallback.profile, ...(parsed.profile || {}) },
      studyPlan: migratedStudyPlan,
      weeklyActivity:
        Array.isArray(parsed.weeklyActivity) && parsed.weeklyActivity.length === 7
          ? parsed.weeklyActivity
          : fallback.weeklyActivity,
    };
  } catch {
    return createInitialState();
  }
}

export interface AchievementToast {
  id: string;
  title: string;
  xp: number;
}

interface AppContextValue {
  state: AppState;
  bankRevision: number;
  levelInfo: { level: number; title: string; currentXp: number; nextLevelXp: number; pct: number };
  latestAttempt: TestAttempt | null;
  previousAttempt: TestAttempt | null;
  weakestSection: SectionType;
  achievementToast: AchievementToast | null;
  dismissToast: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  toggleTheme: () => void;
  saveDraftExam: (draft: SavedExamDraft | null) => void;
  recordAttempt: (attempt: TestAttempt, answeredQuestionIds: string[]) => void;
  reviewVocabWord: (wordId: string, quality: 1 | 3 | 4 | 5) => void;
  toggleVocabFlag: (wordId: string, flag: 'favorite' | 'saved') => void;
  updateStudyPlanConfig: (config: StudyPlanConfig) => void;
  toggleStudyTask: (taskId: string) => void;
  completeDailyChallenge: (bonusXp?: number) => void;
  completeGuideDrill: (bonusXp?: number) => void;
  resetAllProgress: () => void;
  getMetricValue: (metricKey: string) => number;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [bankRevision, setBankRevision] = useState(0);
  const [achievementToast, setAchievementToast] = useState<AchievementToast | null>(null);

  useEffect(() => {
    return subscribeBankChanges(() => setBankRevision((v) => v + 1));
  }, []);

  // Sync theme & reduced-motion classes onto <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.profile.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (state.profile.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [state.profile.theme, state.profile.reducedMotion]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  const getMetricValue = (metricKey: string, targetState: AppState = state): number => {
    const attempts = targetState.attempts;
    switch (metricKey) {
      case 'totalPracticeSessions':
        return attempts.length;
      case 'fullTestsCompleted':
        return attempts.filter((a) => a.type === 'Full Test Simulation').length;
      case 'readingBestBand':
        return Math.max(0, ...attempts.map((a) => a.sectionScores.reading || 0));
      case 'listeningBestBand':
        return Math.max(0, ...attempts.map((a) => a.sectionScores.listening || 0));
      case 'writingBestBand':
        return Math.max(0, ...attempts.map((a) => a.sectionScores.writing || 0));
      case 'speakingBestBand':
        return Math.max(0, ...attempts.map((a) => a.sectionScores.speaking || 0));
      case 'streakDays':
        return targetState.streakDays;
      case 'perfectSections':
        return attempts.reduce((count, a) => {
          const rPerf = a.sectionSummaries.reading?.accuracyPct === 100 ? 1 : 0;
          const lPerf = a.sectionSummaries.listening?.accuracyPct === 100 ? 1 : 0;
          return count + rPerf + lPerf;
        }, 0);
      case 'questionsAnswered':
        return (
          targetState.weeklyActivity.reduce((s, d) => s + d.questions, 0) +
          attempts.reduce(
            (s, a) => s + a.taskTypeStats.reduce((t, item) => t + item.total, 0),
            0
          )
        );
      case 'vocabMastered':
        return Object.values(targetState.vocabProgress).filter((v) => v.status === 'mastered').length;
      case 'guideDrillsCompleted':
        return targetState.guideDrillsCompleted;
      case 'studyTasksCompleted':
        return targetState.studyPlan.tasks.filter((t) => t.completed).length;
      default:
        return 0;
    }
  };

  const evaluateAchievements = (next: AppState): AppState => {
    const newlyUnlocked: typeof ACHIEVEMENTS = [];
    for (const ach of ACHIEVEMENTS) {
      if (next.unlockedAchievementIds.includes(ach.id)) continue;
      if (getMetricValue(ach.metricKey, next) >= ach.target) {
        newlyUnlocked.push(ach);
      }
    }
    if (newlyUnlocked.length === 0) return next;
    const bonusXp = newlyUnlocked.reduce((s, a) => s + a.xpReward, 0);
    setAchievementToast({
      id: newlyUnlocked[0].id,
      title: newlyUnlocked[0].title,
      xp: newlyUnlocked[0].xpReward,
    });
    window.setTimeout(() => {
      setAchievementToast((cur) => (cur?.id === newlyUnlocked[0].id ? null : cur));
    }, 5200);
    return {
      ...next,
      xp: next.xp + bonusXp,
      unlockedAchievementIds: [
        ...next.unlockedAchievementIds,
        ...newlyUnlocked.map((a) => a.id),
      ],
    };
  };

  const bumpTodayActivity = (prev: AppState, addMinutes: number, addQuestions: number): AppState => {
    const today = todayStr();
    const updatedActivity = prev.weeklyActivity.map((pt, idx) => {
      if (idx === prev.weeklyActivity.length - 1) {
        return {
          ...pt,
          minutes: pt.minutes + addMinutes,
          questions: pt.questions + addQuestions,
        };
      }
      return pt;
    });

    let nextStreak = prev.streakDays;
    if (prev.lastActiveDate !== today) {
      const diffDays = Math.round(
        (new Date(today).getTime() - new Date(prev.lastActiveDate).getTime()) / 86400000
      );
      nextStreak = diffDays === 1 ? prev.streakDays + 1 : 1;
    }

    return {
      ...prev,
      lastActiveDate: today,
      streakDays: nextStreak,
      weeklyActivity: updatedActivity,
    };
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    setState((prev) => {
      const nextName = patch.displayName ?? prev.profile.displayName;
      const computedInitials =
        patch.avatarInitials ||
        nextName
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase() || '')
          .join('') ||
        'AT';
      return {
        ...prev,
        profile: {
          ...prev.profile,
          ...patch,
          avatarInitials: computedInitials,
        },
      };
    });
  };

  const toggleTheme = () => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        theme: prev.profile.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  };

  const saveDraftExam = (draft: SavedExamDraft | null) => {
    setState((prev) => ({ ...prev, draftExam: draft }));
  };

  const recordAttempt = (attempt: TestAttempt, answeredQuestionIds: string[]) => {
    setState((prev) => {
      const mins = Math.max(3, Math.round(attempt.durationSec / 60));
      const qCount = Math.max(
        answeredQuestionIds.length,
        attempt.taskTypeStats.reduce((s, t) => s + t.total, 0)
      );
      const earnedXp = attempt.type === 'Full Test Simulation' ? 240 : 95;
      const bumped = bumpTodayActivity(prev, mins, qCount);
      const next: AppState = {
        ...bumped,
        attempts: [attempt, ...prev.attempts],
        draftExam: null,
        xp: bumped.xp + earnedXp,
        recentQuestionIds: [...prev.recentQuestionIds, ...answeredQuestionIds].slice(-450),
      };
      return evaluateAchievements(next);
    });
  };

  const reviewVocabWord = (wordId: string, quality: 1 | 3 | 4 | 5) => {
    setState((prev) => {
      const updated = computeSM2Review(prev.vocabProgress[wordId], wordId, quality);
      const bumped = bumpTodayActivity(prev, 2, 1);
      const next: AppState = {
        ...bumped,
        xp: bumped.xp + (quality >= 4 ? 15 : 8),
        vocabProgress: {
          ...prev.vocabProgress,
          [wordId]: updated,
        },
      };
      return evaluateAchievements(next);
    });
  };

  const toggleVocabFlag = (wordId: string, flag: 'favorite' | 'saved') => {
    setState((prev) => {
      const existing = prev.vocabProgress[wordId] || {
        wordId,
        easeFactor: 2.5,
        intervalDays: 0,
        repetitions: 0,
        nextReviewAt: new Date().toISOString(),
        status: 'new' as const,
        favorite: false,
        saved: false,
      };
      return {
        ...prev,
        vocabProgress: {
          ...prev.vocabProgress,
          [wordId]: {
            ...existing,
            [flag]: !existing[flag],
          },
        },
      };
    });
  };

  const updateStudyPlanConfig = (config: StudyPlanConfig) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        targetBand: config.targetBand,
        targetTestDate: config.testDate,
        dailyGoalMinutes: config.dailyMinutes,
      },
      studyPlan: generateStudyPlan(
        config.currentBand,
        config.targetBand,
        config.testDate,
        config.dailyMinutes,
        config.focusSkills
      ),
    }));
  };

  const toggleStudyTask = (taskId: string) => {
    setState((prev) => {
      const tasks = prev.studyPlan.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      const target = tasks.find((t) => t.id === taskId);
      const next: AppState = {
        ...prev,
        xp: prev.xp + (target?.completed ? 25 : 0),
        studyPlan: {
          ...prev.studyPlan,
          tasks,
          updatedAt: new Date().toISOString(),
        },
      };
      return evaluateAchievements(next);
    });
  };

  const completeDailyChallenge = (bonusXp = 75) => {
    setState((prev) => {
      const today = todayStr();
      if (prev.dailyChallengeCompletedDate === today) return prev;
      const bumped = bumpTodayActivity(prev, 8, 3);
      return evaluateAchievements({
        ...bumped,
        dailyChallengeCompletedDate: today,
        xp: bumped.xp + bonusXp,
      });
    });
  };

  const completeGuideDrill = (bonusXp = 25) => {
    setState((prev) => {
      const bumped = bumpTodayActivity(prev, 3, 1);
      return evaluateAchievements({
        ...bumped,
        xp: bumped.xp + bonusXp,
        guideDrillsCompleted: prev.guideDrillsCompleted + 1,
      });
    });
  };

  const resetAllProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      ...createInitialState(),
      attempts: [],
      draftExam: null,
      recentQuestionIds: [],
      vocabProgress: {},
      xp: 0,
      streakDays: 1,
      unlockedAchievementIds: [],
      guideDrillsCompleted: 0,
    });
  };

  const latestAttempt = state.attempts[0] || null;
  const previousAttempt = state.attempts[1] || null;

  const weakestSection = useMemo<SectionType>(() => {
    if (!latestAttempt) return 'speaking';
    const entries = Object.entries(latestAttempt.sectionScores) as Array<[SectionType, number]>;
    entries.sort((a, b) => a[1] - b[1]);
    return entries[0][0];
  }, [latestAttempt]);

  const levelInfo = useMemo(() => {
    const level = Math.floor(state.xp / 400) + 1;
    const titles = [
      'Academic Foundations',
      'TOEFL Scholar',
      'Adaptive Strategist',
      'Senior Candidate',
      'Distinguished Fellow',
      'Academic Laureate',
    ];
    const currentXp = state.xp % 400;
    const nextLevelXp = 400;
    return {
      level,
      title: titles[Math.min(titles.length - 1, level - 1)],
      currentXp,
      nextLevelXp,
      pct: Math.round((currentXp / nextLevelXp) * 100),
    };
  }, [state.xp]);

  return (
    <AppContext.Provider
      value={{
        state,
        bankRevision,
        levelInfo,
        latestAttempt,
        previousAttempt,
        weakestSection,
        achievementToast,
        dismissToast: () => setAchievementToast(null),
        updateProfile,
        toggleTheme,
        saveDraftExam,
        recordAttempt,
        reviewVocabWord,
        toggleVocabFlag,
        updateStudyPlanConfig,
        toggleStudyTask,
        completeDailyChallenge,
        completeGuideDrill,
        resetAllProgress,
        getMetricValue: (k) => getMetricValue(k, state),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
