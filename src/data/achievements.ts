import { AchievementDef, DailyActivityPoint, StudyPlanState, TestAttempt } from '../types/toefl';

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'ach-first-practice',
    title: 'First Practice',
    description: 'Complete your first TOEFL iBT simulation or section practice.',
    category: 'Practice',
    xpReward: 100,
    target: 1,
    metricKey: 'totalPracticeSessions',
  },
  {
    id: 'ach-full-test',
    title: 'Full Test Finisher',
    description: 'Complete a full 4-section 2026 TOEFL iBT simulation.',
    category: 'Simulation',
    xpReward: 250,
    target: 1,
    metricKey: 'fullTestsCompleted',
  },
  {
    id: 'ach-reading-master',
    title: 'Reading Master',
    description: 'Achieve an estimated Reading Band of 5.0 or higher.',
    category: 'Mastery',
    xpReward: 200,
    target: 5.0,
    metricKey: 'readingBestBand',
  },
  {
    id: 'ach-listening-explorer',
    title: 'Listening Explorer',
    description: 'Achieve an estimated Listening Band of 5.0 or higher.',
    category: 'Mastery',
    xpReward: 200,
    target: 5.0,
    metricKey: 'listeningBestBand',
  },
  {
    id: 'ach-writing-pro',
    title: 'Writing Pro',
    description: 'Achieve an estimated Writing Band of 5.0 or higher.',
    category: 'Mastery',
    xpReward: 220,
    target: 5.0,
    metricKey: 'writingBestBand',
  },
  {
    id: 'ach-speaking-champion',
    title: 'Speaking Champion',
    description: 'Achieve an estimated Speaking Band of 5.0 or higher.',
    category: 'Mastery',
    xpReward: 220,
    target: 5.0,
    metricKey: 'speakingBestBand',
  },
  {
    id: 'ach-seven-day-streak',
    title: 'Seven-Day Streak',
    description: 'Maintain active TOEFL preparation for 7 consecutive days.',
    category: 'Consistency',
    xpReward: 300,
    target: 7,
    metricKey: 'streakDays',
  },
  {
    id: 'ach-perfect-practice',
    title: 'Perfect Practice',
    description: 'Score 100% objective accuracy in a Reading or Listening section.',
    category: 'Mastery',
    xpReward: 250,
    target: 1,
    metricKey: 'perfectSections',
  },
  {
    id: 'ach-100-questions',
    title: '100 Questions Completed',
    description: 'Answer 100 cumulative practice and simulation items.',
    category: 'Practice',
    xpReward: 350,
    target: 100,
    metricKey: 'questionsAnswered',
  },
  {
    id: 'ach-vocab-scholar',
    title: 'Academic Lexicon',
    description: 'Master 10 academic TOEFL vocabulary words via spaced repetition.',
    category: 'Practice',
    xpReward: 180,
    target: 10,
    metricKey: 'vocabMastered',
  },
  {
    id: 'ach-strategy-learner',
    title: 'Strategy Master',
    description: 'Complete 5 interactive quick drills in the built-in Study Guide.',
    category: 'Consistency',
    xpReward: 150,
    target: 5,
    metricKey: 'guideDrillsCompleted',
  },
  {
    id: 'ach-plan-executor',
    title: 'Structured Planner',
    description: 'Complete 5 scheduled tasks in your personalized Study Plan.',
    category: 'Consistency',
    xpReward: 180,
    target: 5,
    metricKey: 'studyTasksCompleted',
  },
];

export const INITIAL_BASELINE_ATTEMPTS: TestAttempt[] = [
  {
    id: 'AIPP-2026-410829',
    type: 'Full Test Simulation',
    mode: 'strict',
    sectionsIncluded: ['reading', 'listening', 'writing', 'speaking'],
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    durationSec: 4680,
    overallBand: 4.5,
    legacyEquivalent: 96,
    cefrLevel: 'B2+',
    classification: 'High-Intermediate Academic Proficiency',
    confidenceLabel: 'High',
    sectionScores: {
      reading: 5.0,
      listening: 4.5,
      writing: 4.5,
      speaking: 4.0,
    },
    sectionSummaries: {
      reading: {
        section: 'reading',
        bandScore: 5.0,
        rawCorrect: 8,
        rawTotal: 10,
        accuracyPct: 80,
        adaptiveTier: 'Upper-Adaptive',
        avgResponseTimeSec: 68,
        strengths: ['Main Idea & Academic Passages', 'Read in Daily Life'],
        weaknesses: ['Subtle Inference & Text Organization'],
      },
      listening: {
        section: 'listening',
        bandScore: 4.5,
        rawCorrect: 6,
        rawTotal: 8,
        accuracyPct: 75,
        adaptiveTier: 'Upper-Adaptive',
        avgResponseTimeSec: 52,
        strengths: ['Listen and Choose a Response', 'Campus Announcements'],
        weaknesses: ['Academic Talk Scientific Synthesis'],
      },
      writing: {
        section: 'writing',
        bandScore: 4.5,
        rawCorrect: 3,
        rawTotal: 4,
        accuracyPct: 78,
        avgResponseTimeSec: 215,
        strengths: ['Clear Email Structure', 'Logical Paragraphing'],
        weaknesses: ['Inversion Syntax in Build a Sentence'],
      },
      speaking: {
        section: 'speaking',
        bandScore: 4.0,
        rawCorrect: 3,
        rawTotal: 4,
        accuracyPct: 72,
        avgResponseTimeSec: 36,
        strengths: ['Clear Topic Stance', 'Steady Pacing'],
        weaknesses: ['Multi-clause Recall in Listen and Repeat'],
      },
    },
    taskTypeStats: [
      { taskType: 'complete-the-words', section: 'reading', correct: 3, total: 4, accuracy: 75 },
      { taskType: 'read-daily-life', section: 'reading', correct: 3, total: 3, accuracy: 100 },
      { taskType: 'read-academic-passage', section: 'reading', correct: 2, total: 3, accuracy: 67 },
      { taskType: 'listen-choose-response', section: 'listening', correct: 2, total: 2, accuracy: 100 },
      { taskType: 'listen-conversation', section: 'listening', correct: 2, total: 2, accuracy: 100 },
      { taskType: 'listen-announcement', section: 'listening', correct: 1, total: 2, accuracy: 50 },
      { taskType: 'listen-academic-talk', section: 'listening', correct: 1, total: 2, accuracy: 50 },
      { taskType: 'build-a-sentence', section: 'writing', correct: 2, total: 3, accuracy: 67 },
      { taskType: 'write-email', section: 'writing', correct: 1, total: 1, accuracy: 85 },
      { taskType: 'write-academic-discussion', section: 'writing', correct: 1, total: 1, accuracy: 80 },
      { taskType: 'listen-and-repeat', section: 'speaking', correct: 2, total: 3, accuracy: 67 },
      { taskType: 'take-an-interview', section: 'speaking', correct: 1, total: 1, accuracy: 75 },
    ],
    writingEvaluations: [
      {
        questionId: 'wr-ad-01',
        taskType: 'write-academic-discussion',
        promptTitle: 'Contemporary Issues in Higher Education — Assessment Reform',
        userResponse:
          'I agree with Sofia that project portfolios and oral defenses better reflect university-level critical thinking. Although Lucas makes a fair point about foundational knowledge, timed memorization tests rarely assess how students revise work or justify methodology in professional settings. Combining short baseline quizzes with iterative project defenses ensures both core mastery and practical analytical skills.',
        wordCount: 59,
        evaluation: {
          bandScore: 4.5,
          criteria: {
            taskFulfillment: 4.5,
            development: 4.0,
            organization: 5.0,
            grammar: 4.5,
            lexicalRange: 4.5,
            accuracy: 4.5,
            cohesion: 5.0,
          },
          summary: 'Clear, well-structured stance that directly integrates both classmates’ perspectives.',
          strengths: [
            'Directly synthesizes both Lucas and Sofia with natural transitions.',
            'Strong academic register and cohesive argument progression.',
          ],
          weaknesses: ['Could expand with one concrete discipline-specific example to reach 110+ words.'],
          improvements: [
            'Add a 2-sentence example illustrating how an oral defense exposes surface-level understanding.',
          ],
          improvedExample:
            'While Lucas rightly highlights foundational fluency, I strongly align with Sofia that iterative portfolios paired with brief oral defenses provide a truer measure of academic competence...',
        },
      },
    ],
    speakingEvaluations: [
      {
        questionId: 'sp-iv-01',
        taskType: 'take-an-interview',
        promptTitle: 'Independent vs. Collaborative Learning',
        evaluation: {
          bandScore: 4.0,
          transcript:
            'I usually prefer studying with a small group after I finish my own reading first. Explaining hard concepts out loud helps me notice gaps in my understanding, especially in economics courses.',
          criteria: {
            taskFulfillment: 4.5,
            fluency: 4.0,
            pronunciation: 4.0,
            intelligibility: 4.5,
            grammar: 4.0,
            vocabulary: 4.0,
            coherence: 4.5,
          },
          summary: 'Coherent and relevant interview answer with clear personal preference and reasoning.',
          strengths: ['Direct answer in the opening sentence', 'Logical reason connecting teaching peers to retention'],
          improvements: ['Extend your specific example by 10–15 seconds to demonstrate fuller elaboration.'],
          disclosure:
            'Transcript-based rubric estimate: acoustic pronunciation and prosody indicators are limited without raw audio analysis.',
        },
      },
    ],
    mistakes: [
      {
        id: 'mst-seed-01',
        questionId: 'rd-ac-05',
        section: 'reading',
        taskType: 'read-academic-passage',
        topic: 'Economics',
        skillFocus: 'Text Organization',
        difficulty: 'Expert',
        questionPrompt: 'How does paragraph 2 function within the overall structure of the passage?',
        userAnswer: 'It refutes Jevons’s historical observations about nineteenth-century coal consumption.',
        correctAnswer:
          'It qualifies the general principle introduced in paragraph 1 by showing how sector characteristics shape its real-world intensity.',
        explanation:
          'Paragraph 2 does not reject Jevons’s principle; it refines it by contrasting low-rebound residential lighting with high-rebound data centers and air freight.',
        attemptId: 'AIPP-2026-410829',
        recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mst-seed-02',
        questionId: 'ls-at-03',
        section: 'listening',
        taskType: 'listen-academic-talk',
        topic: 'Geology & Paleoclimate',
        skillFocus: 'Scientific Synthesis',
        difficulty: 'Expert',
        questionPrompt:
          'Why does ice formed during colder glacial periods contain a lower proportion of oxygen-18?',
        userAnswer: 'Antarctic snow melts more rapidly during glacial epochs, washing away heavier isotopes.',
        correctAnswer:
          'Heavier oxygen-18 water molecules condense and fall out earlier as air cools en route to the poles.',
        explanation:
          'Oxygen-18 evaporates less readily and condenses sooner as air masses cool on their journey poleward, leaving colder polar snow depleted in oxygen-18.',
        attemptId: 'AIPP-2026-410829',
        recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mst-seed-03',
        questionId: 'wr-bs-03',
        section: 'writing',
        taskType: 'build-a-sentence',
        topic: 'Environmental Policy',
        skillFocus: 'Concessive & Parallel Structures',
        difficulty: 'Advanced',
        questionPrompt: 'Assemble the sentence opening with "Not only..."',
        userAnswer: 'Not only urban tree canopies do reduce summer street temperatures...',
        correctAnswer:
          'Not only do urban tree canopies reduce summer street temperatures, but they also absorb stormwater runoff',
        explanation:
          'Opening a clause with negative adverbial "Not only" requires auxiliary-subject inversion ("Not only do urban tree canopies reduce...").',
        attemptId: 'AIPP-2026-410829',
        recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    strengths: [
      'Strong academic reading comprehension (Band 5.0, Upper-Adaptive tier)',
      'High accuracy on Read in Daily Life and Campus Conversations',
      'Cohesive paragraph organization in Academic Discussion writing',
    ],
    weaknesses: [
      'Speaking elaboration depth & multi-clause Listen and Repeat recall (Band 4.0)',
      'Scientific synthesis in high-difficulty Listening academic talks',
      'Negative inversion syntax in Build a Sentence tasks',
    ],
    recommendations: [
      'Practice 15 minutes daily of Speaking: Listen and Repeat chunking + 45-second Interview A-R-E drills.',
      'Target Academic Talk listening items with structured cause-and-effect note taking.',
      'Review complex sentence inversion and embedded clauses in Practice Center.',
    ],
  },
  {
    id: 'AIPP-2026-389104',
    type: 'Full Test Simulation',
    mode: 'practice',
    sectionsIncluded: ['reading', 'listening', 'writing', 'speaking'],
    completedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    durationSec: 4920,
    overallBand: 4.0,
    legacyEquivalent: 86,
    cefrLevel: 'B2',
    classification: 'Upper-Intermediate Academic Proficiency',
    confidenceLabel: 'Moderate',
    sectionScores: {
      reading: 4.5,
      listening: 4.0,
      writing: 4.0,
      speaking: 3.5,
    },
    sectionSummaries: {
      reading: {
        section: 'reading',
        bandScore: 4.5,
        rawCorrect: 7,
        rawTotal: 10,
        accuracyPct: 70,
        adaptiveTier: 'Standard',
        avgResponseTimeSec: 74,
        strengths: ['Daily Life Notices'],
        weaknesses: ['Complete the Words Morphology'],
      },
      listening: {
        section: 'listening',
        bandScore: 4.0,
        rawCorrect: 5,
        rawTotal: 8,
        accuracyPct: 63,
        adaptiveTier: 'Standard',
        avgResponseTimeSec: 58,
        strengths: ['Pragmatic Responses'],
        weaknesses: ['Academic Talks'],
      },
      writing: {
        section: 'writing',
        bandScore: 4.0,
        rawCorrect: 2,
        rawTotal: 4,
        accuracyPct: 68,
        avgResponseTimeSec: 230,
        strengths: ['Email Tone'],
        weaknesses: ['Idea Development'],
      },
      speaking: {
        section: 'speaking',
        bandScore: 3.5,
        rawCorrect: 2,
        rawTotal: 4,
        accuracyPct: 62,
        avgResponseTimeSec: 39,
        strengths: ['Task Relevance'],
        weaknesses: ['Fluency & Pacing'],
      },
    },
    taskTypeStats: [
      { taskType: 'complete-the-words', section: 'reading', correct: 2, total: 4, accuracy: 50 },
      { taskType: 'read-daily-life', section: 'reading', correct: 3, total: 3, accuracy: 100 },
      { taskType: 'read-academic-passage', section: 'reading', correct: 2, total: 3, accuracy: 67 },
      { taskType: 'listen-choose-response', section: 'listening', correct: 2, total: 2, accuracy: 100 },
      { taskType: 'listen-academic-talk', section: 'listening', correct: 1, total: 3, accuracy: 33 },
    ],
    writingEvaluations: [],
    speakingEvaluations: [],
    mistakes: [
      {
        id: 'mst-seed-04',
        questionId: 'rd-ac-03',
        section: 'reading',
        taskType: 'read-academic-passage',
        topic: 'Architecture',
        skillFocus: 'Logical Relationships',
        difficulty: 'Advanced',
        questionPrompt: 'How did the 2023 spectroscopic study revise earlier scholarly assumptions about lime clasts?',
        userAnswer: 'It showed they were caused by modern seawater pollution rather than Roman builders.',
        correctAnswer:
          'It demonstrated they were functional self-healing reservoirs rather than mixing defects.',
        explanation:
          'Hot mixing created reactive lime clasts that dissolve and recrystallize as calcite to seal tiny cracks over centuries.',
        attemptId: 'AIPP-2026-389104',
        recordedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    strengths: ['Solid baseline across Reading Daily Life and Pragmatic Listening'],
    weaknesses: ['Speaking fluency and Academic Listening note-taking'],
    recommendations: ['Build daily retrieval practice across Academic Talks and Speaking Interview prompts.'],
  },
];

export function buildDefaultWeeklyActivity(): DailyActivityPoint[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const presetMinutes = [35, 50, 45, 60, 40, 55, 30];
  const presetQuestions = [14, 22, 18, 28, 16, 24, 12];
  const result: DailyActivityPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    result.push({
      date: d.toISOString().slice(0, 10),
      dayLabel: days[d.getDay()],
      minutes: presetMinutes[6 - i],
      questions: presetQuestions[6 - i],
    });
  }
  return result;
}

export function generateStudyPlan(
  currentBand: number,
  targetBand: number,
  testDate: string,
  dailyMinutes: number,
  focusSkills: Array<'reading' | 'listening' | 'writing' | 'speaking'>
): StudyPlanState {
  const primaryWeak = focusSkills[0] || 'speaking';
  const secondaryWeak = focusSkills[1] || 'listening';

  const labelMap: Record<string, string> = {
    reading: 'Reading',
    listening: 'Listening',
    writing: 'Writing',
    speaking: 'Speaking',
  };

  const tasks = [
    {
      id: 'st-mon',
      dayOfWeek: 'Monday',
      title: `${labelMap[primaryWeak]} Targeted Fluency Drill`,
      section: primaryWeak,
      durationMin: Math.round(dailyMinutes * 0.7),
      description: `Focus on ${labelMap[primaryWeak]} 2026 task patterns with immediate rubric feedback.`,
      completed: true,
      route: `/section-practice?section=${primaryWeak}`,
    },
    {
      id: 'st-tue',
      dayOfWeek: 'Tuesday',
      title: 'Complete the Words & Academic Passage Timing',
      section: 'reading' as const,
      durationMin: Math.round(dailyMinutes * 0.8),
      description: 'Practice rapid lexical cloze completion and upper-adaptive inference questions.',
      completed: true,
      route: '/section-practice?section=reading',
    },
    {
      id: 'st-wed',
      dayOfWeek: 'Wednesday',
      title: `${labelMap[secondaryWeak]} Deep Practice & Note-Taking`,
      section: secondaryWeak,
      durationMin: dailyMinutes,
      description: `Build accuracy on ${labelMap[secondaryWeak]} academic tasks and review missed concepts.`,
      completed: false,
      route: `/section-practice?section=${secondaryWeak}`,
    },
    {
      id: 'st-thu',
      dayOfWeek: 'Thursday',
      title: 'Build a Sentence + Academic Discussion Sprint',
      section: 'writing' as const,
      durationMin: dailyMinutes,
      description: 'Sharpen clause syntax, academic email clarity, and synthesis essays.',
      completed: false,
      route: '/section-practice?section=writing',
    },
    {
      id: 'st-fri',
      dayOfWeek: 'Friday',
      title: 'Spaced Repetition Vocabulary & Mistake Audit',
      section: 'vocabulary' as const,
      durationMin: Math.round(dailyMinutes * 0.65),
      description: 'Review due SM-2 academic cards and revisit past mistakes in Analytics.',
      completed: false,
      route: '/vocabulary',
    },
    {
      id: 'st-sat',
      dayOfWeek: 'Saturday',
      title: 'Full Timed 2026 TOEFL iBT Simulation',
      section: 'mock-test' as const,
      durationMin: Math.max(dailyMinutes, 75),
      description: 'Complete a strict-mode 4-section simulation and generate your PDF Score Report.',
      completed: false,
      route: '/simulation',
    },
    {
      id: 'st-sun',
      dayOfWeek: 'Sunday',
      title: 'Weekly Mistake Review & Study Guide Check',
      section: 'review' as const,
      durationMin: Math.round(dailyMinutes * 0.5),
      description: 'Review missed grammar & writing patterns in the Study Guide and set next week’s focus.',
      completed: false,
      route: '/study-guide',
    },
  ];

  const gap = Math.max(0.5, Number((targetBand - currentBand).toFixed(1)));
  const step1 = Math.min(6.0, Math.round((currentBand + gap * 0.35) * 2) / 2);
  const step2 = Math.min(6.0, Math.round((currentBand + gap * 0.7) * 2) / 2);

  return {
    config: {
      currentBand,
      targetBand,
      testDate,
      dailyMinutes,
      focusSkills: focusSkills.length ? focusSkills : ['speaking', 'listening'],
    },
    tasks,
    milestones: [
      {
        id: 'ms-1',
        weekLabel: 'Weeks 1–2',
        goal: `Stabilize ${labelMap[primaryWeak]} & eliminate core syntax/inference errors`,
        targetBand: step1,
        completed: false,
      },
      {
        id: 'ms-2',
        weekLabel: 'Weeks 3–4',
        goal: 'Consistently qualify for Upper-Adaptive Stage 2 in Reading & Listening',
        targetBand: step2,
        completed: false,
      },
      {
        id: 'ms-3',
        weekLabel: 'Final Sprint',
        goal: 'Sustain target band across two consecutive Strict Mode full simulations',
        targetBand: targetBand,
        completed: false,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}
