import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Headphones,
  Loader2,
  Mic,
  Pause,
  PenTool,
  Play,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  AdaptiveTier,
  AnyQuestion,
  AnyTaskType,
  BuildSentenceQuestion,
  CompleteWordsQuestion,
  CustomPracticeConfig,
  DifficultyLevel,
  ExamMode,
  FullTestLengthPreset,
  ListeningQuestion,
  MistakeRecord,
  ReadingMCQQuestion,
  SavedExamDraft,
  SectionResultSummary,
  SectionType,
  SpeakingQuestion,
  TaskTypeStat,
  TestAttempt,
  TestGeneratorMode,
  WritingQuestion,
} from '../types/toefl';
import { audioController } from '../utils/audio';
import { countScoredItems } from '../bank/questionBankRegistry';
import {
  SECTION_DURATION_SECONDS,
  adaptListeningStage2,
  adaptReadingStage2,
  generateTestSession,
  getPackQuestions,
  getQuestionById,
} from '../utils/questionEngine';
import {
  bandToCEFR,
  bandToClassification,
  bandToLegacyApprox,
  computeOverallBand,
  evaluateSpeakingLocally,
  evaluateWritingLocally,
  formatTaskTypeLabel,
  generateReportId,
  objectiveRatioToBand,
  snapToBand,
} from '../utils/scoring';
import { motion } from 'motion/react';
import { CertificateCard } from '../components/CertificateCard';
import { ListeningTaskView } from '../components/exam/ListeningTaskView';
import { ReadingTaskView } from '../components/exam/ReadingTaskView';
import { SpeakingTaskView } from '../components/exam/SpeakingTaskView';
import { WritingTaskView } from '../components/exam/WritingTaskView';
import {
  AnimatedProgressBar,
  CountUpValue,
  ScoreRing,
} from '../components/ui/MotionPrimitives';

type Phase = 'pretest' | 'running' | 'transition' | 'processing' | 'results';

interface ExamSimulationPageProps {
  defaultScope?: 'full' | 'section';
}

const GENERATOR_MODE_GROUPS: Array<{
  group: string;
  modes: Array<{ id: TestGeneratorMode; label: string; shortDesc: string }>;
}> = [
  {
    group: 'Full 4-Section Simulations',
    modes: [
      { id: 'adaptive-full', label: 'Adaptive Full Test', shortDesc: 'Stage 1 → 2 Reading & Listening' },
      { id: 'standard-full', label: 'Standard Full Test', shortDesc: 'Balanced ~120-item 2026 blueprint' },
      { id: 'random-full', label: 'Random Full Test', shortDesc: 'Randomized topics, avoids repeats' },
    ],
  },
  {
    group: 'Single-Section Simulations',
    modes: [
      { id: 'reading-only', label: 'Reading Only', shortDesc: 'Words · Daily Life · Academic' },
      { id: 'listening-only', label: 'Listening Only', shortDesc: 'Responses · Dialogues · Talks' },
      { id: 'writing-only', label: 'Writing Only', shortDesc: 'Sentence · Email · Discussion' },
      { id: 'speaking-only', label: 'Speaking Only', shortDesc: 'Repeat · 45s Interview' },
    ],
  },
  {
    group: 'Targeted & Custom Drills',
    modes: [
      { id: 'weakness-based', label: 'Weakness-Based', shortDesc: 'Auto-targets lowest-accuracy tasks' },
      { id: 'mistake-review', label: 'Mistake Review', shortDesc: 'Retries your missed items' },
      { id: 'custom', label: 'Custom Practice', shortDesc: 'Filter section, task, level & topic' },
    ],
  },
];

const ALL_GENERATOR_MODES: TestGeneratorMode[] = [
  'standard-full',
  'random-full',
  'adaptive-full',
  'reading-only',
  'listening-only',
  'writing-only',
  'speaking-only',
  'weakness-based',
  'mistake-review',
  'custom',
];

const CUSTOM_TASK_OPTIONS: Array<{ value: AnyTaskType; section: SectionType; label: string }> = [
  { value: 'complete-the-words', section: 'reading', label: 'Complete the Words' },
  { value: 'read-daily-life', section: 'reading', label: 'Read in Daily Life' },
  { value: 'read-academic-passage', section: 'reading', label: 'Academic Passage' },
  { value: 'listen-choose-response', section: 'listening', label: 'Choose Response' },
  { value: 'listen-conversation', section: 'listening', label: 'Conversation' },
  { value: 'listen-announcement', section: 'listening', label: 'Announcement' },
  { value: 'listen-academic-talk', section: 'listening', label: 'Academic Talk' },
  { value: 'build-a-sentence', section: 'writing', label: 'Build a Sentence' },
  { value: 'write-email', section: 'writing', label: 'Write an Email' },
  { value: 'write-academic-discussion', section: 'writing', label: 'Academic Discussion' },
  { value: 'listen-and-repeat', section: 'speaking', label: 'Listen & Repeat' },
  { value: 'take-an-interview', section: 'speaking', label: 'Take an Interview' },
];

const ALL_DIFFICULTIES: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SECTION_META: Record<
  SectionType,
  { label: string; icon: React.FC<{ className?: string }>; tasks: string; durationLabel: string }
> = {
  reading: {
    label: 'Reading',
    icon: BookOpen,
    tasks: 'Complete the Words · Read in Daily Life · Read an Academic Passage',
    durationLabel: 'Up to 35 min (~50 items · Adaptive)',
  },
  listening: {
    label: 'Listening',
    icon: Headphones,
    tasks: 'Listen & Choose Response · Conversation · Announcement · Academic Talk',
    durationLabel: 'Up to 32 min (~47 items · Adaptive)',
  },
  writing: {
    label: 'Writing',
    icon: PenTool,
    tasks: 'Build a Sentence · Write an Email · Write for an Academic Discussion',
    durationLabel: 'Up to 29 min (12 items)',
  },
  speaking: {
    label: 'Speaking',
    icon: Mic,
    tasks: 'Listen and Repeat · Take an Interview',
    durationLabel: 'Up to 12 min (11 items)',
  },
};

export const ExamSimulationPage: React.FC<ExamSimulationPageProps> = ({ defaultScope = 'full' }) => {
  const { state, bankRevision, saveDraftExam, recordAttempt } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSectionParam = searchParams.get('section') as SectionType | null;
  const initialModeParam = searchParams.get('mode') as TestGeneratorMode | null;
  const packParam = searchParams.get('pack');
  const resumeRequested = searchParams.get('resume') === '1';

  const resolveInitialGeneratorMode = (): TestGeneratorMode => {
    if (initialModeParam && ALL_GENERATOR_MODES.includes(initialModeParam)) {
      return initialModeParam;
    }
    if (
      initialSectionParam &&
      ['reading', 'listening', 'writing', 'speaking'].includes(initialSectionParam)
    ) {
      return `${initialSectionParam}-only` as TestGeneratorMode;
    }
    return defaultScope === 'section' ? 'reading-only' : 'adaptive-full';
  };

  const [generatorMode, setGeneratorMode] = useState<TestGeneratorMode>(resolveInitialGeneratorMode);
  const [lengthPreset, setLengthPreset] = useState<FullTestLengthPreset>('full-2026');
  const [customConfig, setCustomConfig] = useState<CustomPracticeConfig>({
    sections: ['reading', 'listening'],
    taskTypes: [],
    difficulties: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    topicQuery: '',
    itemLimitPerSection: 6,
    excludeRecent: true,
  });
  const [previewSeed, setPreviewSeed] = useState<number>(() => Date.now());

  const isFullGeneratorMode =
    generatorMode === 'standard-full' ||
    generatorMode === 'random-full' ||
    generatorMode === 'adaptive-full';

  const [mode, setMode] = useState<ExamMode>(
    !isFullGeneratorMode || packParam
      ? 'practice'
      : state.profile.strictModeDefault
      ? 'strict'
      : 'practice'
  );
  const [activeSessionTitle, setActiveSessionTitle] = useState<string | null>(null);
  const [adaptiveEnabled, setAdaptiveEnabled] = useState<boolean>(true);
  const [sectionDurations, setSectionDurations] = useState<Record<SectionType, number>>(
    SECTION_DURATION_SECONDS
  );

  const [phase, setPhase] = useState<Phase>('pretest');
  const [audioChecked, setAudioChecked] = useState(false);
  const [micChecked, setMicChecked] = useState<'idle' | 'ok' | 'fallback'>('idle');
  const [rulesAccepted, setRulesAccepted] = useState(true);

  // Sync URL query params when navigating directly to /simulation?mode=... or /section-practice?section=...
  useEffect(() => {
    if (initialModeParam && ALL_GENERATOR_MODES.includes(initialModeParam)) {
      setGeneratorMode(initialModeParam);
      if (
        initialModeParam === 'weakness-based' ||
        initialModeParam === 'mistake-review' ||
        initialModeParam === 'custom'
      ) {
        setMode('practice');
      }
    } else if (
      initialSectionParam &&
      ['reading', 'listening', 'writing', 'speaking'].includes(initialSectionParam)
    ) {
      setGeneratorMode(`${initialSectionParam}-only` as TestGeneratorMode);
      setMode('practice');
    } else if (!packParam && !resumeRequested) {
      setGeneratorMode(defaultScope === 'section' ? 'reading-only' : 'adaptive-full');
    }
  }, [initialModeParam, initialSectionParam, defaultScope, packParam, resumeRequested]);

  // Live assembled session preview (reactive to mode, preset, custom filters & imported JSON packs)
  const previewSession = useMemo(() => {
    void bankRevision;
    return generateTestSession({
      mode: generatorMode,
      recentIds: state.recentQuestionIds,
      attempts: state.attempts,
      preset: lengthPreset,
      customConfig,
      seed: previewSeed,
    });
  }, [
    bankRevision,
    generatorMode,
    state.recentQuestionIds,
    state.attempts,
    lengthPreset,
    customConfig,
    previewSeed,
  ]);

  // Active exam state
  const [sections, setSections] = useState<SectionType[]>(['reading', 'listening', 'writing', 'speaking']);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sectionTimeLeft, setSectionTimeLeft] = useState(SECTION_DURATION_SECONDS.reading);
  const [paused, setPaused] = useState(false);
  const [startedAt, setStartedAt] = useState<string>(new Date().toISOString());
  const [questionIdsBySection, setQuestionIdsBySection] = useState<Record<SectionType, string[]>>({
    reading: [],
    listening: [],
    writing: [],
    speaking: [],
  });
  const [readingTier, setReadingTier] = useState<AdaptiveTier>('Standard');
  const [listeningTier, setListeningTier] = useState<AdaptiveTier>('Standard');
  const [readingAdapted, setReadingAdapted] = useState(false);
  const [listeningAdapted, setListeningAdapted] = useState(false);
  const [adaptiveBanner, setAdaptiveBanner] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [highlights, setHighlights] = useState<Record<string, string[]>>({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<TestAttempt | null>(null);
  const [processingStep, setProcessingStep] = useState(0);

  // Auto-resume if requested from Dashboard, or auto-launch a Practice Pack if ?pack= is given
  useEffect(() => {
    if (resumeRequested && state.draftExam) {
      resumeFromDraft(state.draftExam);
      return;
    }
    if (packParam) {
      const packData = getPackQuestions(packParam, state.recentQuestionIds, 12);
      if (packData && packData.questions.length > 0) {
        const sec = packData.pack.section;
        setMode('practice');
        setActiveSessionTitle(`Focused Pack · ${packData.pack.title}`);
        setAdaptiveEnabled(false);
        setSections([sec]);
        const packSecDur = Math.max(5, packData.pack.estimatedMinutes) * 60;
        setSectionDurations({
          ...SECTION_DURATION_SECONDS,
          [sec]: packSecDur,
        });
        setQuestionIdsBySection({
          reading: sec === 'reading' ? packData.questions.map((q) => q.id) : [],
          listening: sec === 'listening' ? packData.questions.map((q) => q.id) : [],
          writing: sec === 'writing' ? packData.questions.map((q) => q.id) : [],
          speaking: sec === 'speaking' ? packData.questions.map((q) => q.id) : [],
        });
        setCurrentSectionIndex(0);
        setCurrentQuestionIndex(0);
        setSectionTimeLeft(packSecDur);
        setStartedAt(new Date().toISOString());
        setReadingTier('Standard');
        setListeningTier('Standard');
        setReadingAdapted(true);
        setListeningAdapted(true);
        setAdaptiveBanner(null);
        setAnswers({});
        setBookmarks([]);
        setNotes({});
        setHighlights({});
        setPaused(false);
        setCompletedAttempt(null);
        setPhase('running');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeRequested, packParam]);

  const currentSection = sections[currentSectionIndex] || 'reading';
  const currentSectionQIds = questionIdsBySection[currentSection] || [];
  const currentQuestion: AnyQuestion | undefined = useMemo(() => {
    void bankRevision;
    const id = currentSectionQIds[currentQuestionIndex];
    return id ? getQuestionById(id) : undefined;
  }, [currentSectionQIds, currentQuestionIndex, bankRevision]);

  // Autosave draft during active exam
  useEffect(() => {
    if (phase !== 'running') return;
    const draft: SavedExamDraft = {
      id: 'active-draft',
      type: sections.length === 4 ? 'Full Test Simulation' : 'Section Practice',
      mode,
      sections,
      currentSectionIndex,
      currentQuestionIndex,
      sectionTimeLeftSec: sectionTimeLeft,
      startedAt,
      updatedAt: new Date().toISOString(),
      readingTier,
      listeningTier,
      answers,
      bookmarks,
      notes,
      highlights,
      questionIdsBySection,
    };
    saveDraftExam(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    phase,
    currentSectionIndex,
    currentQuestionIndex,
    answers,
    bookmarks,
    notes,
    highlights,
    readingTier,
    listeningTier,
  ]);

  // Persistent Countdown Timer + Auto-Submit on expiration
  useEffect(() => {
    if (phase !== 'running' || paused) return;
    const interval = window.setInterval(() => {
      setSectionTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          handleCompleteCurrentSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused, currentSectionIndex, sections]);

  const resumeFromDraft = (draft: SavedExamDraft) => {
    setMode(draft.mode);
    setSections(draft.sections);
    setCurrentSectionIndex(draft.currentSectionIndex);
    setCurrentQuestionIndex(draft.currentQuestionIndex);
    setSectionTimeLeft(Math.max(30, draft.sectionTimeLeftSec));
    setStartedAt(draft.startedAt);
    setReadingTier(draft.readingTier);
    setListeningTier(draft.listeningTier);
    setAnswers(draft.answers);
    setBookmarks(draft.bookmarks);
    setNotes(draft.notes);
    setHighlights(draft.highlights);
    setQuestionIdsBySection(draft.questionIdsBySection);
    setPhase('running');
  };

  const handleAudioCheck = () => {
    audioController.playChime('check');
    audioController.playScript(
      [
        {
          speaker: 'System',
          voiceRole: 'female-academic',
          text: 'Audio check complete. Your speakers are ready for the AIPP TOEFL TEAM simulation.',
        },
      ],
      { rate: 1.0 }
    );
    setAudioChecked(true);
  };

  const handleMicCheck = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setMicChecked('ok');
      } else {
        setMicChecked('fallback');
      }
    } catch {
      setMicChecked('fallback');
    }
  };

  const startGeneratedSession = () => {
    if (previewSession.sections.length === 0 || previewSession.totalExercises === 0) return;
    setActiveSessionTitle(previewSession.title);
    setAdaptiveEnabled(previewSession.adaptiveEnabled);
    setSections(previewSession.sections);
    setQuestionIdsBySection(previewSession.questionIdsBySection);
    setSectionDurations(previewSession.durationsBySectionSec);
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setSectionTimeLeft(previewSession.durationsBySectionSec[previewSession.sections[0]]);
    setStartedAt(new Date().toISOString());
    setReadingTier('Standard');
    setListeningTier('Standard');
    setReadingAdapted(!previewSession.adaptiveEnabled);
    setListeningAdapted(!previewSession.adaptiveEnabled);
    setAdaptiveBanner(null);
    setAnswers({});
    setBookmarks([]);
    setNotes({});
    setHighlights({});
    setPaused(false);
    setCompletedAttempt(null);
    setPhase('running');
  };

  // Trigger 2026 adaptive Stage 2 routing at dynamic midpoint of Reading / Listening
  const checkAdaptiveRouting = (nextIdx: number) => {
    if (!adaptiveEnabled) return;
    const midpoint = Math.floor(currentSectionQIds.length / 2);
    const stage2Target = currentSectionQIds.length - midpoint;
    if (midpoint < 3 || stage2Target < 2 || nextIdx < midpoint) return;

    if (currentSection === 'reading' && !readingAdapted) {
      const stage1Ids = currentSectionQIds.slice(0, midpoint);
      let correct = 0;
      let total = 0;
      stage1Ids.forEach((id) => {
        const q = getQuestionById(id);
        if (!q) return;
        const score = scoreObjectiveQuestion(q, answers[id]);
        correct += score.correct;
        total += score.total;
      });
      const acc = total > 0 ? correct / total : 0.5;
      const adapted = adaptReadingStage2(acc, stage1Ids, state.recentQuestionIds, stage2Target);
      setReadingTier(adapted.tier);
      setReadingAdapted(true);
      setQuestionIdsBySection((prev) => ({
        ...prev,
        reading: [...stage1Ids, ...adapted.stage2Questions.map((q) => q.id)],
      }));
      setAdaptiveBanner(
        `Adaptive Reading Stage 2 routed to ${adapted.tier} module (${Math.round(acc * 100)}% Stage 1 accuracy).`
      );
      window.setTimeout(() => setAdaptiveBanner(null), 5000);
    }

    if (currentSection === 'listening' && !listeningAdapted) {
      const stage1Ids = currentSectionQIds.slice(0, midpoint);
      let correct = 0;
      let total = 0;
      stage1Ids.forEach((id) => {
        const q = getQuestionById(id);
        if (!q) return;
        const score = scoreObjectiveQuestion(q, answers[id]);
        correct += score.correct;
        total += score.total;
      });
      const acc = total > 0 ? correct / total : 0.5;
      const adapted = adaptListeningStage2(acc, stage1Ids, state.recentQuestionIds, stage2Target);
      setListeningTier(adapted.tier);
      setListeningAdapted(true);
      setQuestionIdsBySection((prev) => ({
        ...prev,
        listening: [...stage1Ids, ...adapted.stage2Questions.map((q) => q.id)],
      }));
      setAdaptiveBanner(
        `Adaptive Listening Stage 2 routed to ${adapted.tier} module (${Math.round(acc * 100)}% Stage 1 accuracy).`
      );
      window.setTimeout(() => setAdaptiveBanner(null), 5000);
    }
  };

  const handleNextQuestion = () => {
    audioController.stop();
    if (currentQuestionIndex + 1 < currentSectionQIds.length) {
      const nextIdx = currentQuestionIndex + 1;
      checkAdaptiveRouting(nextIdx);
      setCurrentQuestionIndex(nextIdx);
    } else {
      handleCompleteCurrentSection();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      audioController.stop();
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleCompleteCurrentSection = () => {
    audioController.stop();
    if (currentSectionIndex + 1 < sections.length) {
      setPhase('transition');
    } else {
      finalizeAndScoreExam();
    }
  };

  const handleProceedNextSection = () => {
    const nextSecIdx = currentSectionIndex + 1;
    const nextSec = sections[nextSecIdx];
    setCurrentSectionIndex(nextSecIdx);
    setCurrentQuestionIndex(0);
    setSectionTimeLeft(sectionDurations[nextSec] || SECTION_DURATION_SECONDS[nextSec]);
    setAdaptiveBanner(null);
    setPhase('running');
  };

  const finalizeAndScoreExam = async () => {
    setProcessingStep(0);
    setPhase('processing');
    const reportId = generateReportId();
    const nowIso = new Date().toISOString();
    const durationSec = Math.max(
      45,
      Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
    );

    const mistakes: MistakeRecord[] = [];
    const taskBucket: Record<string, { section: SectionType; correct: number; total: number }> = {};
    const sectionScores: Record<SectionType, number> = {
      reading: state.attempts[0]?.sectionScores.reading ?? 4.0,
      listening: state.attempts[0]?.sectionScores.listening ?? 4.0,
      writing: state.attempts[0]?.sectionScores.writing ?? 4.0,
      speaking: state.attempts[0]?.sectionScores.speaking ?? 4.0,
    };
    const sectionSummaries: Partial<Record<SectionType, SectionResultSummary>> = {};
    const writingEvaluations: TestAttempt['writingEvaluations'] = [];
    const speakingEvaluations: TestAttempt['speakingEvaluations'] = [];
    const answeredIds: string[] = [];

    const addTaskStat = (taskType: string, section: SectionType, c: number, t: number) => {
      if (!taskBucket[taskType]) taskBucket[taskType] = { section, correct: 0, total: 0 };
      taskBucket[taskType].correct += c;
      taskBucket[taskType].total += t;
    };

    for (const sec of sections) {
      const qIds = questionIdsBySection[sec] || [];
      let secCorrect = 0;
      let secTotal = 0;
      let weightedEarned = 0;
      let weightedMax = 0;
      const bandSamples: number[] = [];

      for (const qId of qIds) {
        const q = getQuestionById(qId);
        if (!q) continue;
        answeredIds.push(qId);
        const ans = answers[qId];

        if (sec === 'reading' || sec === 'listening') {
          const obj = scoreObjectiveQuestion(q, ans);
          secCorrect += obj.correct;
          secTotal += obj.total;
          weightedEarned += obj.correct * q.scoreWeight;
          weightedMax += obj.total * q.scoreWeight;
          addTaskStat(q.taskType, sec, obj.correct, obj.total);

          if (obj.correct < obj.total) {
            mistakes.push({
              id: `mst-${reportId}-${qId}`,
              questionId: qId,
              section: sec,
              taskType: q.taskType,
              topic: q.topic,
              skillFocus: q.skillFocus,
              difficulty: q.difficulty,
              questionPrompt:
                q.taskType === 'complete-the-words'
                  ? `Complete the Words: ${q.title}`
                  : (q as ReadingMCQQuestion | ListeningQuestion).question,
              userAnswer: obj.userLabel,
              correctAnswer: obj.correctLabel,
              explanation: q.explanation,
              attemptId: reportId,
              recordedAt: nowIso,
            });
          }
        } else if (sec === 'writing') {
          const wq = q as WritingQuestion;
          if (wq.taskType === 'build-a-sentence') {
            const obj = scoreObjectiveQuestion(wq, ans);
            secCorrect += obj.correct;
            secTotal += obj.total;
            addTaskStat(wq.taskType, 'writing', obj.correct, obj.total);
            bandSamples.push(obj.correct === obj.total ? 5.5 : 2.5);
            if (obj.correct < obj.total) {
              mistakes.push({
                id: `mst-${reportId}-${qId}`,
                questionId: qId,
                section: 'writing',
                taskType: wq.taskType,
                topic: wq.topic,
                skillFocus: wq.skillFocus,
                difficulty: wq.difficulty,
                questionPrompt: `Build a Sentence: "${wq.leadIn}..."`,
                userAnswer: obj.userLabel,
                correctAnswer: obj.correctLabel,
                explanation: wq.explanation,
                attemptId: reportId,
                recordedAt: nowIso,
              });
            }
          } else {
            const txt = typeof ans === 'string' ? ans : '';
            const wc = txt.trim() ? txt.trim().split(/\s+/).filter(Boolean).length : 0;
            const localEval = evaluateWritingLocally(
              wq.taskType,
              txt,
              wq.minWords,
              wq.sampleHighScoreResponse
            );
            bandSamples.push(localEval.bandScore);
            secTotal += 1;
            if (localEval.bandScore >= 4.0) secCorrect += 1;
            addTaskStat(wq.taskType, 'writing', localEval.bandScore >= 4.0 ? 1 : 0, 1);
            writingEvaluations.push({
              questionId: wq.id,
              taskType: wq.taskType,
              promptTitle: wq.taskType === 'write-email' ? wq.title : wq.courseName,
              userResponse: txt || '(No response submitted)',
              wordCount: wc,
              evaluation: localEval,
            });
          }
        } else if (sec === 'speaking') {
          const sq = q as SpeakingQuestion;
          const payload = (ans as { transcript?: string } | undefined) || {};
          const transcript = payload.transcript || '';
          const evalRes = evaluateSpeakingLocally(
            sq.taskType,
            transcript,
            sq.taskType === 'listen-and-repeat' ? sq.targetSentence : undefined
          );
          bandSamples.push(evalRes.bandScore);
          secTotal += 1;
          if (evalRes.bandScore >= 4.0) secCorrect += 1;
          addTaskStat(sq.taskType, 'speaking', evalRes.bandScore >= 4.0 ? 1 : 0, 1);
          speakingEvaluations.push({
            questionId: sq.id,
            taskType: sq.taskType,
            promptTitle: sq.taskType === 'listen-and-repeat' ? `Repeat: ${sq.topic}` : sq.topicTitle,
            evaluation: evalRes,
          });
        }
      }

      let secBand = 3.5;
      if (sec === 'reading' || sec === 'listening') {
        const ratio = weightedMax > 0 ? weightedEarned / weightedMax : 0;
        secBand = objectiveRatioToBand(ratio, sec === 'reading' ? readingTier : listeningTier);
      } else if (bandSamples.length > 0) {
        secBand = snapToBand(bandSamples.reduce((a, b) => a + b, 0) / bandSamples.length);
      }

      sectionScores[sec] = secBand;
      const accuracyPct = secTotal > 0 ? Math.round((secCorrect / secTotal) * 100) : 0;
      sectionSummaries[sec] = {
        section: sec,
        bandScore: secBand,
        rawCorrect: secCorrect,
        rawTotal: secTotal,
        accuracyPct,
        adaptiveTier:
          sec === 'reading' ? readingTier : sec === 'listening' ? listeningTier : undefined,
        avgResponseTimeSec: Math.max(15, Math.round(durationSec / Math.max(1, qIds.length * sections.length))),
        strengths: accuracyPct >= 75 ? [`Strong ${SECTION_META[sec].label} precision`] : [`Steady engagement in ${SECTION_META[sec].label}`],
        weaknesses: accuracyPct < 75 ? [`Target ${SECTION_META[sec].label} accuracy & pacing`] : [],
      };
    }

    const overallBand =
      sections.length === 4
        ? computeOverallBand(sectionScores)
        : sectionScores[sections[0]];

    const taskTypeStats: TaskTypeStat[] = Object.entries(taskBucket).map(([tt, data]) => ({
      taskType: tt as TaskTypeStat['taskType'],
      section: data.section,
      correct: data.correct,
      total: data.total,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));

    const sortedSections = (Object.entries(sectionScores) as Array<[SectionType, number]>).sort(
      (a, b) => b[1] - a[1]
    );

    const attempt: TestAttempt = {
      id: reportId,
      type: sections.length === 4 ? 'Full Test Simulation' : 'Section Practice',
      mode,
      sectionsIncluded: sections,
      completedAt: nowIso,
      durationSec,
      overallBand,
      legacyEquivalent: bandToLegacyApprox(overallBand),
      cefrLevel: bandToCEFR(overallBand),
      classification: bandToClassification(overallBand),
      confidenceLabel: sections.length === 4 && mode === 'strict' ? 'High' : 'Moderate',
      sectionScores,
      sectionSummaries,
      taskTypeStats,
      writingEvaluations,
      speakingEvaluations,
      mistakes,
      strengths: [
        `Highest section performance in ${SECTION_META[sortedSections[0][0]].label} (Band ${sortedSections[0][1].toFixed(1)}).`,
        ...taskTypeStats
          .filter((t) => t.accuracy >= 80)
          .slice(0, 2)
          .map((t) => `High mastery on ${formatTaskTypeLabel(t.taskType)} (${t.accuracy}%).`),
      ],
      weaknesses: [
        `Lowest relative section in ${SECTION_META[sortedSections[sortedSections.length - 1][0]].label} (Band ${sortedSections[sortedSections.length - 1][1].toFixed(1)}).`,
        ...mistakes.slice(0, 2).map((m) => `Missed ${m.skillFocus} item (${m.topic}).`),
      ],
      recommendations: [
        `Schedule 20-minute targeted drills in ${SECTION_META[sortedSections[sortedSections.length - 1][0]].label} over the next 5 days.`,
        mistakes.length > 0
          ? `Review all ${mistakes.length} missed items in Performance Analytics → Mistake Analysis.`
          : 'Advance to Strict Mode Full Test Simulation to sustain Upper-Adaptive performance.',
        'Open the built-in Study Guide to practice grammar patterns, writing templates, and speaking frameworks.',
      ],
    };

    // Staged scoring reveal for clarity and polish
    await new Promise((r) => setTimeout(r, 420));
    setProcessingStep(1);
    await new Promise((r) => setTimeout(r, 420));
    setProcessingStep(2);
    await new Promise((r) => setTimeout(r, 420));
    recordAttempt(attempt, answeredIds);
    setCompletedAttempt(attempt);
    if (state.profile.soundEnabled) audioController.playChime('complete');
    setPhase('results');
  };

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // =========================================================================
  // VIEW 1: PRE-TEST GENERATOR, 10 MODES & EQUIPMENT CHECK
  // =========================================================================
  if (phase === 'pretest') {
    const showLengthToggle =
      isFullGeneratorMode ||
      generatorMode === 'reading-only' ||
      generatorMode === 'listening-only' ||
      generatorMode === 'writing-only' ||
      generatorMode === 'speaking-only';

    const totalEstimatedMinutes = previewSession.sections.reduce(
      (sum, s) => sum + Math.round((previewSession.durationsBySectionSec[s] || 0) / 60),
      0
    );

    const toggleCustomSection = (sec: SectionType) => {
      setCustomConfig((prev) => {
        const exists = prev.sections.includes(sec);
        const nextSections = exists
          ? prev.sections.filter((s) => s !== sec)
          : [...prev.sections, sec];
        return { ...prev, sections: nextSections.length > 0 ? nextSections : [sec] };
      });
    };

    const toggleCustomTask = (tt: AnyTaskType) => {
      setCustomConfig((prev) => ({
        ...prev,
        taskTypes: prev.taskTypes.includes(tt)
          ? prev.taskTypes.filter((x) => x !== tt)
          : [...prev.taskTypes, tt],
      }));
    };

    const toggleCustomDifficulty = (diff: DifficultyLevel) => {
      setCustomConfig((prev) => {
        const exists = prev.difficulties.includes(diff);
        const next = exists
          ? prev.difficulties.filter((d) => d !== diff)
          : [...prev.difficulties, diff];
        return { ...prev, difficulties: next.length > 0 ? next : [diff] };
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-[#1D4ED8] dark:text-cyan-400">
              TOEFL iBT (January 2026 Format) · Dynamic 10-Mode Test Generator
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {previewSession.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              {previewSession.subtitle}
            </p>
          </div>

          {showLengthToggle && (
            <div className="inline-flex p-1 rounded-lg bg-slate-200/75 dark:bg-slate-800 shrink-0 self-start">
              <button
                type="button"
                onClick={() => setLengthPreset('full-2026')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  lengthPreset === 'full-2026'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Full 2026 (~120 Items)
              </button>
              <button
                type="button"
                onClick={() => setLengthPreset('express')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  lengthPreset === 'express'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Express Drill
              </button>
            </div>
          )}
        </div>

        {/* Resume Unfinished Draft Banner */}
        {state.draftExam && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[#0B1733] dark:text-white">
                Unfinished {state.draftExam.type} Autosaved
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Section {state.draftExam.currentSectionIndex + 1} of {state.draftExam.sections.length} (
                {SECTION_META[state.draftExam.sections[state.draftExam.currentSectionIndex]].label}) ·
                Saved {new Date(state.draftExam.updatedAt).toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => resumeFromDraft(state.draftExam!)}
                className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold"
              >
                Resume Session
              </button>
              <button
                type="button"
                onClick={() => saveDraftExam(null)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: 10-Mode Selector, Custom Builder, Assembled Blueprint & Mode */}
          <div className="lg:col-span-8 space-y-5">
            {/* 10 Test & Practice Modes */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Choose Test or Practice Mode (10 Modes)
                </h2>
                <button
                  type="button"
                  onClick={() => setPreviewSeed(Date.now())}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400 hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reshuffle Set
                </button>
              </div>

              <div className="space-y-4">
                {GENERATOR_MODE_GROUPS.map((grp) => (
                  <div key={grp.group} className="space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {grp.group}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {grp.modes.map((m) => {
                        const active = generatorMode === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setGeneratorMode(m.id);
                              if (
                                m.id === 'weakness-based' ||
                                m.id === 'mistake-review' ||
                                m.id === 'custom'
                              ) {
                                setMode('practice');
                              }
                            }}
                            className={`p-3 rounded-xl border text-left transition-colors ${
                              active
                                ? 'border-[#1D4ED8] bg-blue-50/70 dark:bg-blue-600/15'
                                : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                            }`}
                          >
                            <div className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {m.label}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              {m.shortDesc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Custom Practice Builder */}
            {generatorMode === 'custom' && (
              <div className="rounded-xl border border-[#1D4ED8]/40 bg-white dark:bg-slate-900 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Custom Practice Builder
                  </h2>
                </div>

                {/* Sections */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sections to Include
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['reading', 'listening', 'writing', 'speaking'] as SectionType[]).map((sec) => {
                      const on = customConfig.sections.includes(sec);
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => toggleCustomSection(sec)}
                          className={`min-h-[36px] px-3.5 rounded-lg border text-xs font-semibold capitalize transition-colors ${
                            on
                              ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                          }`}
                        >
                          {sec}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Task Types */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Specific 2026 Task Types (optional — leave empty for all)
                    </span>
                    {customConfig.taskTypes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCustomConfig((p) => ({ ...p, taskTypes: [] }))}
                        className="text-[#1D4ED8] dark:text-cyan-400 hover:underline font-medium"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CUSTOM_TASK_OPTIONS.filter((t) =>
                      customConfig.sections.includes(t.section)
                    ).map((t) => {
                      const on = customConfig.taskTypes.includes(t.value);
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => toggleCustomTask(t.value)}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                            on
                              ? 'border-[#1D4ED8] bg-blue-50 dark:bg-blue-600/20 text-[#1D4ED8] dark:text-cyan-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty & Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Difficulty Levels
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_DIFFICULTIES.map((diff) => {
                        const on = customConfig.difficulties.includes(diff);
                        return (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => toggleCustomDifficulty(diff)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              on
                                ? 'border-[#1D4ED8] bg-blue-50 dark:bg-blue-600/20 text-[#1D4ED8] dark:text-cyan-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {diff}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Exercises per Section:{' '}
                      <span className="font-mono text-[#1D4ED8] dark:text-cyan-400">
                        {customConfig.itemLimitPerSection}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={25}
                      value={customConfig.itemLimitPerSection}
                      onChange={(e) =>
                        setCustomConfig((p) => ({
                          ...p,
                          itemLimitPerSection: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-[#1D4ED8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <input
                    type="text"
                    value={customConfig.topicQuery}
                    onChange={(e) =>
                      setCustomConfig((p) => ({ ...p, topicQuery: e.target.value }))
                    }
                    placeholder="Filter by topic or keyword (e.g. Biology, Campus)..."
                    className="w-full min-h-[40px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  />
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customConfig.excludeRecent}
                      onChange={(e) =>
                        setCustomConfig((p) => ({ ...p, excludeRecent: e.target.checked }))
                      }
                      className="accent-[#1D4ED8]"
                    />
                    Prioritize unseen questions (avoid recent repeats)
                  </label>
                </div>
              </div>
            )}

            {/* Dynamic Assembled Blueprint Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Assembled Session Blueprint
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                    {previewSession.totalScoredItems} scored items ({previewSession.totalExercises}{' '}
                    exercises) ·{' '}
                    {previewSession.adaptiveEnabled
                      ? 'Adaptive Stage 1 → 2 Active'
                      : 'Fixed Sequence'}
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  Est. Duration: ~{totalEstimatedMinutes} min
                </span>
              </div>

              {previewSession.sections.length === 0 ? (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200">
                  {generatorMode === 'mistake-review'
                    ? 'You have no logged mistakes yet. Complete any practice drill or simulation first, and missed items will automatically populate here.'
                    : 'No questions matched your current Custom Practice filters. Broaden the topic keyword or difficulty selection.'}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewSession.sections.map((sec, idx) => {
                    const Icon = SECTION_META[sec].icon;
                    const secIds = previewSession.questionIdsBySection[sec] || [];
                    const secScored = secIds.reduce((sum, id) => {
                      const q = getQuestionById(id);
                      return sum + (q ? countScoredItems(q) : 1);
                    }, 0);
                    const secMin = Math.max(
                      1,
                      Math.round((previewSession.durationsBySectionSec[sec] || 600) / 60)
                    );
                    return (
                      <div
                        key={sec}
                        className="py-3.5 flex items-start gap-3.5 first:pt-1 last:pb-1"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0B1733] dark:text-cyan-300 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                              {idx + 1}. {SECTION_META[sec].label}
                            </span>
                            <span className="text-xs font-mono text-[#1D4ED8] dark:text-cyan-400 tabular-nums">
                              {secScored} items ({secIds.length} sets) · {secMin} min
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {SECTION_META[sec].tasks}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Simulation Mode Selector */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Exam Environment Controls
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('strict')}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    mode === 'strict'
                      ? 'border-[#1D4ED8] bg-blue-50/60 dark:bg-blue-600/15'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Strict Exam Mode
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Realistic countdown timers, no hints or explanations during test, single-play
                    listening audio, hidden transcripts, and full report upon completion.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('practice')}
                  className={`p-4 rounded-xl border text-left transition-colors ${
                    mode === 'practice'
                      ? 'border-[#1D4ED8] bg-blue-50/60 dark:bg-blue-600/15'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Guided Practice Mode
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Allows pausing the timer, hints, instant answer validation, audio replay &amp;
                    speed adjustment, transcripts, and live writing/speaking rubric previews.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Equipment Checks & Start CTA */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Equipment Verification
              </h2>

              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      1. Speakers / Headphones
                    </span>
                    {audioChecked && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAudioCheck}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Test Audio Output
                  </button>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      2. Microphone Check
                    </span>
                    {micChecked === 'ok' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                    {micChecked === 'fallback' && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Transcript Fallback
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleMicCheck}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Verify Microphone Access
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rulesAccepted}
                    onChange={(e) => setRulesAccepted(e.target.checked)}
                    className="mt-0.5 accent-[#1D4ED8]"
                  />
                  <span>
                    I understand this is an independent AIPP TOEFL TEAM educational simulation and
                    not an official ETS examination.
                  </span>
                </label>

                <button
                  type="button"
                  disabled={!rulesAccepted || previewSession.totalExercises === 0}
                  onClick={startGeneratedSession}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Start Session ({previewSession.totalScoredItems} Items)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SECTION TRANSITION SCREEN
  // =========================================================================
  if (phase === 'transition') {
    const finishedSection = sections[currentSectionIndex];
    const upcomingSection = sections[currentSectionIndex + 1];
    const upcomingMinutes = Math.max(
      1,
      Math.round((sectionDurations[upcomingSection] || SECTION_DURATION_SECONDS[upcomingSection]) / 60)
    );
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-blue-700 dark:text-cyan-400">
              Section {currentSectionIndex + 1} of {sections.length} Complete
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {SECTION_META[finishedSection].label} Section Submitted
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Your responses have been recorded and autosaved. Take a brief breath before beginning
              the next section.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-5 text-left space-y-1.5">
            <div className="text-xs font-semibold text-slate-500">UP NEXT</div>
            <div className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {SECTION_META[upcomingSection].label} Section
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              {SECTION_META[upcomingSection].tasks}
            </div>
            <div className="text-xs font-mono text-blue-700 dark:text-cyan-400 pt-1 tabular-nums">
              Allocated Timer: {upcomingMinutes} min · {(questionIdsBySection[upcomingSection] || []).length} sets
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceedNextSection}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold transition-colors"
          >
            Continue to {SECTION_META[upcomingSection].label}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: PROCESSING RESULTS SCREEN (3-STEP INSTITUTIONAL EVALUATION)
  // =========================================================================
  if (phase === 'processing') {
    const steps = [
      'Calibrating 2026 adaptive stage weights',
      'Scoring objective items & analytical rubrics',
      'Assembling AIPP TOEFL TEAM score certificate',
    ];
    return (
      <div className="max-w-lg mx-auto py-14 sm:py-20">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-7 sm:p-9 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1733] text-cyan-400 flex items-center justify-center mx-auto ring-1 ring-cyan-500/30">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8] dark:text-cyan-400">
              AIPP Scoring Engine
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Calculating Your 2026 Band Scores
            </h2>
          </div>

          <div className="space-y-2.5 text-left pt-1">
            {steps.map((label, idx) => {
              const done = processingStep > idx;
              const active = processingStep === idx;
              return (
                <div
                  key={label}
                  className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-xs transition-colors ${
                    done
                      ? 'border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : active
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/30 text-slate-900 dark:text-white font-medium'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : active ? (
                    <Loader2 className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                  )}
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: COMPLETE RESULTS & ANIMATED SCORE REVEAL + CERTIFICATE
  // =========================================================================
  if (phase === 'results' && completedAttempt) {
    const skillRows: Array<{ key: SectionType; label: string; score: number }> = [
      { key: 'reading', label: 'Reading', score: completedAttempt.sectionScores.reading },
      { key: 'listening', label: 'Listening', score: completedAttempt.sectionScores.listening },
      { key: 'writing', label: 'Writing', score: completedAttempt.sectionScores.writing },
      { key: 'speaking', label: 'Speaking', score: completedAttempt.sectionScores.speaking },
    ];

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Simulation Complete · Report Saved to History
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
              Your Simulation Score Report
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="min-h-[40px] px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Open Analytics
            </button>
            <button
              type="button"
              onClick={() => setPhase('pretest')}
              className="min-h-[40px] px-4 rounded-lg bg-[#0B1733] dark:bg-[#1D4ED8] hover:bg-[#132652] dark:hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
            >
              New Simulation
            </button>
          </div>
        </div>

        {/* Animated Institutional Score Reveal Hero */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-[#0B1733] aipp-grid-pattern text-white border border-slate-800 p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <ScoreRing
                value={completedAttempt.overallBand}
                max={6}
                size={132}
                strokeWidth={9}
                trackColor="rgba(255,255,255,0.12)"
                progressColor="#22D3EE"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                  Band
                </div>
                <div className="font-display text-4xl font-extrabold text-white leading-none mt-0.5">
                  <CountUpValue value={completedAttempt.overallBand} decimals={1} durationMs={800} />
                </div>
                <div className="text-[11px] text-slate-400 mt-1">out of 6.0</div>
              </ScoreRing>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-cyan-300">
                  {completedAttempt.type} · {completedAttempt.mode === 'strict' ? 'Strict Mode' : 'Practice Mode'}
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {completedAttempt.classification}
                </h2>
                <div className="text-xs text-slate-300 tabular-nums">
                  CEFR {completedAttempt.cefrLevel} · Legacy Ref ~{completedAttempt.legacyEquivalent} / 120
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Independent AIPP Simulation Estimate — Not an official ETS score
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {skillRows.map((row, idx) => {
                const included = completedAttempt.sectionsIncluded.includes(row.key);
                return (
                  <div
                    key={row.key}
                    className={`rounded-xl border p-4 space-y-2.5 ${
                      included
                        ? 'bg-white/[0.06] border-white/12'
                        : 'bg-white/[0.02] border-white/[0.06] opacity-65'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">
                        {row.label}
                        {!included && (
                          <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                            (Prior)
                          </span>
                        )}
                      </span>
                      <span className="font-display text-lg font-extrabold text-cyan-300 tabular-nums">
                        <CountUpValue value={row.score} decimals={1} durationMs={720 + idx * 100} />
                      </span>
                    </div>
                    <AnimatedProgressBar
                      percent={(row.score / 6) * 100}
                      delay={0.12 + idx * 0.08}
                      heightClass="h-1.5"
                      trackClass="bg-white/12"
                      fillClass={included ? 'bg-cyan-400' : 'bg-slate-500'}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Interactive Certificate & 3-Page PDF Download */}
        <CertificateCard
          attempt={completedAttempt}
          candidateName={state.profile.displayName}
        />

        {/* Strengths, Weaknesses & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5">
            <h3 className="font-display text-sm font-bold text-emerald-700 dark:text-emerald-400">
              Key Strengths
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {completedAttempt.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5">
            <h3 className="font-display text-sm font-bold text-amber-700 dark:text-amber-400">
              Areas to Strengthen
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {completedAttempt.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5">
            <h3 className="font-display text-sm font-bold text-[#1D4ED8] dark:text-cyan-400">
              Recommended Next Steps
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {completedAttempt.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mistake Breakdown */}
        {completedAttempt.mistakes.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Mistake Analysis ({completedAttempt.mistakes.length} items)
            </h3>
            <div className="space-y-3">
              {completedAttempt.mistakes.map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center gap-2 text-slate-500">
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {m.section}
                    </span>
                    <span>·</span>
                    <span>{m.skillFocus}</span>
                    <span>·</span>
                    <span>{m.topic}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {m.questionPrompt}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="text-rose-700 dark:text-rose-400">
                      <strong>Your Answer:</strong> {m.userAnswer}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-400">
                      <strong>Correct Answer:</strong> {m.correctAnswer}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {m.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 5: ACTIVE EXAM SIMULATION ENGINE
  // =========================================================================
  const timerUrgent = sectionTimeLeft <= 120;
  const progressPct = Math.round(((currentQuestionIndex + 1) / Math.max(1, currentSectionQIds.length)) * 100);

  return (
    <div className="space-y-5">
      {/* Distraction-Free Institutional Exam Header Bar */}
      <div className="rounded-xl bg-[#0B1733] text-white px-4 py-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
        <div className="min-w-0">
          <div className="text-[11px] text-cyan-300 font-medium truncate">
            {activeSessionTitle
              ? `${activeSessionTitle} · Section ${currentSectionIndex + 1} of ${sections.length}`
              : `${mode === 'strict' ? 'Strict Exam Mode' : 'Guided Practice Mode'} · Section ${
                  currentSectionIndex + 1
                } of ${sections.length}`}
          </div>
          <div className="font-display text-sm sm:text-base font-bold truncate">
            {SECTION_META[currentSection].label} — Question {currentQuestionIndex + 1} of{' '}
            {currentSectionQIds.length}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Clean Tabular Countdown Timer (Zero distracting pulse/flash) */}
          <div
            className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-lg font-mono text-sm font-bold tabular-nums ${
              timerUrgent
                ? 'bg-rose-600/25 border border-rose-400/80 text-rose-200'
                : 'bg-white/10 text-white'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>{formatClock(sectionTimeLeft)}</span>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'practice' && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
              >
                {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{paused ? 'Resume' : 'Pause'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-white/20 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Progress & Horizontal-Scrollable Question Navigator */}
      <div className="space-y-2.5">
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-[#1D4ED8] dark:bg-cyan-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {currentSectionQIds.map((id, idx) => {
              const answered = answers[id] !== undefined && answers[id] !== null && answers[id] !== '';
              const isBookmarked = bookmarks.includes(id);
              const isCurrent = idx === currentQuestionIndex;
              const canJump = mode === 'practice' || currentSection === 'reading';
              return (
                <button
                  key={id}
                  type="button"
                  disabled={!canJump}
                  onClick={() => {
                    if (!canJump) return;
                    checkAdaptiveRouting(idx);
                    setCurrentQuestionIndex(idx);
                  }}
                  className={`min-w-[36px] min-h-[36px] rounded-lg font-mono text-xs font-semibold tabular-nums shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-[#1D4ED8] text-white'
                      : answered
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  } ${isBookmarked ? 'ring-2 ring-amber-400' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <span className="text-slate-500 dark:text-slate-400 shrink-0">
            Autosaved ·{' '}
            {currentSection === 'reading'
              ? `Tier: ${readingTier}`
              : currentSection === 'listening'
              ? `Tier: ${listeningTier}`
              : '2026 Rubric Engine'}
          </span>
        </div>
      </div>

      {adaptiveBanner && (
        <div className="rounded-lg border border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 px-4 py-2.5 text-xs font-medium text-cyan-900 dark:text-cyan-200">
          {adaptiveBanner}
        </div>
      )}

      {/* Active Task Canvas */}
      {paused ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4">
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Practice Session Paused
          </h3>
          <p className="text-sm text-slate-500">
            Your countdown timer is paused and all progress has been autosaved.
          </p>
          <button
            type="button"
            onClick={() => setPaused(false)}
            className="px-5 py-2.5 rounded-lg bg-[#1D4ED8] text-white text-sm font-semibold"
          >
            Resume Session
          </button>
        </div>
      ) : currentQuestion ? (
        <div>
          {currentQuestion.section === 'reading' && (
            <ReadingTaskView
              question={currentQuestion}
              mode={mode}
              answer={answers[currentQuestion.id]}
              onChangeAnswer={(val) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))
              }
              bookmarked={bookmarks.includes(currentQuestion.id)}
              onToggleBookmark={() =>
                setBookmarks((prev) =>
                  prev.includes(currentQuestion.id)
                    ? prev.filter((b) => b !== currentQuestion.id)
                    : [...prev, currentQuestion.id]
                )
              }
              note={notes[currentQuestion.id] || ''}
              onChangeNote={(n) => setNotes((prev) => ({ ...prev, [currentQuestion.id]: n }))}
              highlights={highlights[currentQuestion.id] || []}
              onAddHighlight={(t) =>
                setHighlights((prev) => ({
                  ...prev,
                  [currentQuestion.id]: Array.from(new Set([...(prev[currentQuestion.id] || []), t])),
                }))
              }
              onRemoveHighlight={(t) =>
                setHighlights((prev) => ({
                  ...prev,
                  [currentQuestion.id]: (prev[currentQuestion.id] || []).filter((x) => x !== t),
                }))
              }
            />
          )}

          {currentQuestion.section === 'listening' && (
            <ListeningTaskView
              question={currentQuestion}
              mode={mode}
              answer={answers[currentQuestion.id]}
              onChangeAnswer={(val) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))
              }
              bookmarked={bookmarks.includes(currentQuestion.id)}
              onToggleBookmark={() =>
                setBookmarks((prev) =>
                  prev.includes(currentQuestion.id)
                    ? prev.filter((b) => b !== currentQuestion.id)
                    : [...prev, currentQuestion.id]
                )
              }
              defaultRate={state.profile.preferredSpeechRate}
            />
          )}

          {currentQuestion.section === 'writing' && (
            <WritingTaskView
              question={currentQuestion}
              mode={mode}
              answer={answers[currentQuestion.id]}
              onChangeAnswer={(val) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))
              }
            />
          )}

          {currentQuestion.section === 'speaking' && (
            <SpeakingTaskView
              question={currentQuestion}
              mode={mode}
              answer={answers[currentQuestion.id]}
              onChangeAnswer={(val) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))
              }
            />
          )}
        </div>
      ) : null}

      {/* Bottom Question Navigation Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={currentQuestionIndex === 0 || (mode === 'strict' && currentSection === 'listening')}
          onClick={handlePrevQuestion}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleNextQuestion}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold transition-colors"
        >
          <span>
            {currentQuestionIndex + 1 < currentSectionQIds.length
              ? 'Next Question'
              : currentSectionIndex + 1 < sections.length
              ? `Finish ${SECTION_META[currentSection].label}`
              : 'Submit & Score'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Confirmation Dialog preventing accidental exit */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Exit Active Simulation?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Your progress has been autosaved. You can return later from the Dashboard or
                  discard this session now.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={() => {
                  audioController.stop();
                  setShowExitConfirm(false);
                  navigate('/');
                }}
                className="px-4 py-2 rounded-lg bg-[#0B1733] dark:bg-blue-600 text-white text-xs font-semibold"
              >
                Save &amp; Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function scoreObjectiveQuestion(
  question: AnyQuestion,
  answer: unknown
): { correct: number; total: number; userLabel: string; correctLabel: string } {
  if (question.taskType === 'complete-the-words') {
    const q = question as CompleteWordsQuestion;
    const map = (answer as Record<string, string>) || {};
    let correct = 0;
    const userWords: string[] = [];
    const correctWords: string[] = [];
    q.blanks.forEach((b) => {
      const raw = (map[b.blankId] || '').trim().toLowerCase();
      const fullAttempt = raw.startsWith(b.prefix.toLowerCase())
        ? raw
        : `${b.prefix.toLowerCase()}${raw}`;
      const valid = [b.answer, ...(b.acceptedVariants || [])].map((v) => v.toLowerCase());
      if (valid.includes(fullAttempt) || valid.includes(raw)) correct += 1;
      userWords.push(raw ? fullAttempt : `${b.prefix}___`);
      correctWords.push(b.answer);
    });
    return {
      correct,
      total: q.blanks.length,
      userLabel: userWords.join(', '),
      correctLabel: correctWords.join(', '),
    };
  }

  if (question.taskType === 'build-a-sentence') {
    const q = question as BuildSentenceQuestion;
    const arr = Array.isArray(answer) ? (answer as string[]) : [];
    const ok =
      arr.length === q.correctOrder.length && arr.every((val, i) => val === q.correctOrder[i]);
    return {
      correct: ok ? 1 : 0,
      total: 1,
      userLabel: arr.length ? `${q.leadIn} ${arr.join(' ')}` : '(Not completed)',
      correctLabel: `${q.leadIn} ${q.correctOrder.join(' ')}`,
    };
  }

  const mcq = question as ReadingMCQQuestion | ListeningQuestion;
  const idx = typeof answer === 'number' ? answer : -1;
  return {
    correct: idx === mcq.correctAnswerIndex ? 1 : 0,
    total: 1,
    userLabel: idx >= 0 && mcq.options[idx] ? mcq.options[idx] : '(Unanswered)',
    correctLabel: mcq.options[mcq.correctAnswerIndex] || '',
  };
}
