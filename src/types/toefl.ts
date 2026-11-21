export type SectionType = 'reading' | 'listening' | 'writing' | 'speaking';

export type ReadingTaskType =
  | 'complete-the-words'
  | 'read-daily-life'
  | 'read-academic-passage';

export type ListeningTaskType =
  | 'listen-choose-response'
  | 'listen-conversation'
  | 'listen-announcement'
  | 'listen-academic-talk';

export type WritingTaskType =
  | 'build-a-sentence'
  | 'write-email'
  | 'write-academic-discussion';

export type SpeakingTaskType = 'listen-and-repeat' | 'take-an-interview';

export type AnyTaskType =
  | ReadingTaskType
  | ListeningTaskType
  | WritingTaskType
  | SpeakingTaskType;

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type CEFRLevel = 'A2' | 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1' | 'C2';
export type ExamMode = 'strict' | 'practice';
export type AdaptiveTier = 'Foundation' | 'Standard' | 'Upper-Adaptive';

export interface BaseQuestionMeta {
  id: string;
  section: SectionType;
  taskType: AnyTaskType;
  difficulty: DifficultyLevel;
  topic: string;
  learningObjective: string;
  skillFocus: string;
  estimatedTimeSec: number;
  keywords: string[];
  cefr: CEFRLevel;
  sourceType: 'curated' | 'imported';
  reviewStatus: 'verified';
  scoreWeight: number;
  explanation: string;
  hint?: string;
  packId?: string;
}

export interface BlankItem {
  blankId: string;
  prefix: string; // e.g. "eco" for "ecosystem"
  answer: string; // full word or remaining letters
  acceptedVariants?: string[];
  contextHint: string;
}

export interface CompleteWordsQuestion extends BaseQuestionMeta {
  section: 'reading';
  taskType: 'complete-the-words';
  title: string;
  /** Segments containing plain text and {{blankId}} markers */
  passageTemplate: string;
  blanks: BlankItem[];
}

export interface ReadingMCQQuestion extends BaseQuestionMeta {
  section: 'reading';
  taskType: 'read-daily-life' | 'read-academic-passage';
  passageId: string;
  passageTitle: string;
  passageSubtitle?: string;
  passageMeta?: string; // e.g. "University Registrar Notice · Fall Semester"
  passageParagraphs: string[];
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export type ReadingQuestion = CompleteWordsQuestion | ReadingMCQQuestion;

export interface DialogueLine {
  speaker: string;
  voiceRole: 'female-academic' | 'male-academic' | 'student-female' | 'student-male' | 'announcer';
  text: string;
}

export interface ListeningQuestion extends BaseQuestionMeta {
  section: 'listening';
  taskType: ListeningTaskType;
  audioId: string;
  title: string;
  contextLabel: string;
  script: DialogueLine[];
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface BuildSentenceQuestion extends BaseQuestionMeta {
  section: 'writing';
  taskType: 'build-a-sentence';
  promptContext: string;
  leadIn: string;
  fragments: string[];
  correctOrder: string[];
  grammarRule: string;
}

export interface WriteEmailQuestion extends BaseQuestionMeta {
  section: 'writing';
  taskType: 'write-email';
  title: string;
  recipient: string;
  subjectLine: string;
  scenario: string;
  bulletRequirements: string[];
  minWords: number;
  sampleHighScoreResponse: string;
}

export interface AcademicDiscussionQuestion extends BaseQuestionMeta {
  section: 'writing';
  taskType: 'write-academic-discussion';
  courseName: string;
  professorName: string;
  professorPrompt: string;
  studentResponses: Array<{
    name: string;
    stance: string;
    message: string;
  }>;
  minWords: number;
  sampleHighScoreResponse: string;
}

export type WritingQuestion =
  | BuildSentenceQuestion
  | WriteEmailQuestion
  | AcademicDiscussionQuestion;

export interface ListenRepeatQuestion extends BaseQuestionMeta {
  section: 'speaking';
  taskType: 'listen-and-repeat';
  contextLabel: string;
  targetSentence: string;
  voiceRole: 'female-academic' | 'male-academic' | 'announcer';
  prepTimeSec: number;
  responseTimeSec: number;
}

export interface TakeInterviewQuestion extends BaseQuestionMeta {
  section: 'speaking';
  taskType: 'take-an-interview';
  interviewerRole: string;
  topicTitle: string;
  questionPrompt: string;
  followUpFocus: string;
  prepTimeSec: number;
  responseTimeSec: number;
  sampleOutline: string[];
}

export type SpeakingQuestion = ListenRepeatQuestion | TakeInterviewQuestion;

export type AnyQuestion =
  | ReadingQuestion
  | ListeningQuestion
  | WritingQuestion
  | SpeakingQuestion;

export interface WritingEvaluationResult {
  bandScore: number; // 1.0 - 6.0 in 0.5 steps
  criteria: {
    taskFulfillment: number;
    development: number;
    organization: number;
    grammar: number;
    lexicalRange: number;
    accuracy: number;
    cohesion: number;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  improvedExample: string;
}

export interface SpeakingEvaluationResult {
  bandScore: number; // 1.0 - 6.0 in 0.5 steps
  transcript: string;
  wordAccuracyPct?: number;
  omissions?: string[];
  substitutions?: string[];
  criteria: {
    taskFulfillment: number;
    fluency: number;
    pronunciation: number;
    intelligibility: number;
    grammar: number;
    vocabulary: number;
    coherence: number;
  };
  summary: string;
  strengths: string[];
  improvements: string[];
  disclosure: string;
}

export interface MistakeRecord {
  id: string;
  questionId: string;
  section: SectionType;
  taskType: AnyTaskType;
  topic: string;
  skillFocus: string;
  difficulty: DifficultyLevel;
  questionPrompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  attemptId: string;
  recordedAt: string;
}

export interface TaskTypeStat {
  taskType: AnyTaskType;
  section: SectionType;
  correct: number;
  total: number;
  accuracy: number;
}

export interface SectionResultSummary {
  section: SectionType;
  bandScore: number; // 1.0 - 6.0 in 0.5 steps
  rawCorrect: number;
  rawTotal: number;
  accuracyPct: number;
  adaptiveTier?: AdaptiveTier;
  avgResponseTimeSec: number;
  strengths: string[];
  weaknesses: string[];
}

export interface TestAttempt {
  id: string; // e.g. AIPP-2026-847291
  type: 'Full Test Simulation' | 'Section Practice';
  mode: ExamMode;
  sectionsIncluded: SectionType[];
  completedAt: string;
  durationSec: number;
  overallBand: number; // 1.0 - 6.0 in 0.5 steps
  legacyEquivalent: number; // approx 0-120 educational reference
  cefrLevel: CEFRLevel;
  classification: string;
  confidenceLabel: 'High' | 'Moderate' | 'Indicative';
  sectionScores: Record<SectionType, number>;
  sectionSummaries: Partial<Record<SectionType, SectionResultSummary>>;
  taskTypeStats: TaskTypeStat[];
  writingEvaluations: Array<{
    questionId: string;
    taskType: WritingTaskType;
    promptTitle: string;
    userResponse: string;
    wordCount: number;
    evaluation: WritingEvaluationResult;
  }>;
  speakingEvaluations: Array<{
    questionId: string;
    taskType: SpeakingTaskType;
    promptTitle: string;
    evaluation: SpeakingEvaluationResult;
  }>;
  mistakes: MistakeRecord[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SavedExamDraft {
  id: string;
  type: 'Full Test Simulation' | 'Section Practice';
  mode: ExamMode;
  sections: SectionType[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  sectionTimeLeftSec: number;
  startedAt: string;
  updatedAt: string;
  readingTier: AdaptiveTier;
  listeningTier: AdaptiveTier;
  answers: Record<string, unknown>;
  bookmarks: string[];
  notes: Record<string, string>;
  highlights: Record<string, string[]>;
  questionIdsBySection: Record<SectionType, string[]>;
}

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  topic: string;
  cefr: CEFRLevel;
  difficulty?: DifficultyLevel;
  packId?: string;
}

export interface VocabProgress {
  wordId: string;
  easeFactor: number; // SM-2 default 2.5
  intervalDays: number;
  repetitions: number;
  nextReviewAt: string;
  lastReviewedAt?: string;
  status: 'new' | 'learning' | 'difficult' | 'mastered';
  favorite: boolean;
  saved: boolean;
}

export interface StudyPlanConfig {
  currentBand: number;
  targetBand: number;
  testDate: string; // YYYY-MM-DD
  dailyMinutes: number;
  focusSkills: SectionType[];
}

export interface StudyTask {
  id: string;
  dayOfWeek: string;
  title: string;
  section: SectionType | 'vocabulary' | 'mock-test' | 'review';
  durationMin: number;
  description: string;
  completed: boolean;
  route: string;
}

export interface StudyPlanState {
  config: StudyPlanConfig;
  tasks: StudyTask[];
  milestones: Array<{
    id: string;
    weekLabel: string;
    goal: string;
    targetBand: number;
    completed: boolean;
  }>;
  updatedAt: string;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: 'Practice' | 'Mastery' | 'Consistency' | 'Simulation';
  xpReward: number;
  target: number;
  metricKey:
    | 'totalPracticeSessions'
    | 'readingBestBand'
    | 'listeningBestBand'
    | 'writingBestBand'
    | 'speakingBestBand'
    | 'streakDays'
    | 'perfectSections'
    | 'questionsAnswered'
    | 'fullTestsCompleted'
    | 'vocabMastered'
    | 'guideDrillsCompleted'
    | 'studyTasksCompleted';
}

export interface UserProfile {
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  targetBand: number;
  targetTestDate: string;
  dailyGoalMinutes: number;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  reducedMotion: boolean;
  strictModeDefault: boolean;
  preferredSpeechRate: number;
  interfaceLanguage: string;
}

export interface DailyActivityPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  minutes: number;
  questions: number;
}

export interface AppState {
  profile: UserProfile;
  attempts: TestAttempt[];
  draftExam: SavedExamDraft | null;
  recentQuestionIds: string[];
  vocabProgress: Record<string, VocabProgress>;
  studyPlan: StudyPlanState;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  dailyChallengeCompletedDate: string | null;
  weeklyActivity: DailyActivityPoint[];
  unlockedAchievementIds: string[];
  guideDrillsCompleted: number;
}

// =============================================================================
// EXPANDABLE QUESTION BANK, PACK SYSTEM & 10-MODE DYNAMIC TEST GENERATOR TYPES
// =============================================================================

export interface QuestionPackManifest {
  packId: string;
  name: string;
  version: string;
  description: string;
  author: string;
  createdAt: string;
  source: 'builtin' | 'imported';
  tags?: string[];
}

export interface QuestionPackFile {
  schemaVersion: '1.0';
  manifest: QuestionPackManifest;
  questions?: AnyQuestion[];
  vocabulary?: VocabWord[];
}

export interface InstalledQuestionPack {
  manifest: QuestionPackManifest;
  installedAt: string;
  enabled: boolean;
  questions: AnyQuestion[];
  vocabulary: VocabWord[];
}

export interface PackValidationIssue {
  severity: 'error' | 'warning';
  kind: 'schema' | 'duplicate-id' | 'duplicate-content' | 'version';
  itemId?: string;
  path: string;
  message: string;
}

export interface PackValidationReport {
  valid: boolean;
  canImportPartial: boolean;
  manifest: QuestionPackManifest | null;
  versionStatus: 'new' | 'upgrade' | 'same-or-older';
  existingVersion?: string;
  totalQuestionsInFile: number;
  validQuestions: AnyQuestion[];
  totalVocabInFile: number;
  validVocabulary: VocabWord[];
  duplicateIds: string[];
  duplicateContentIds: string[];
  issues: PackValidationIssue[];
}

export type TestGeneratorMode =
  | 'standard-full'
  | 'random-full'
  | 'adaptive-full'
  | 'reading-only'
  | 'listening-only'
  | 'writing-only'
  | 'speaking-only'
  | 'weakness-based'
  | 'mistake-review'
  | 'custom';

export type FullTestLengthPreset = 'full-2026' | 'express';

export interface CustomPracticeConfig {
  sections: SectionType[];
  taskTypes: AnyTaskType[];
  difficulties: DifficultyLevel[];
  topicQuery: string;
  itemLimitPerSection: number;
  excludeRecent: boolean;
}

