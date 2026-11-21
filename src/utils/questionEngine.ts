import {
  countScoredItems,
  getActiveQuestions,
  getActiveQuestionsBySection,
  getDetailedBankStats,
  getQuestionByIdFromBank,
} from '../bank/questionBankRegistry';
import {
  AdaptiveTier,
  AnyQuestion,
  AnyTaskType,
  CustomPracticeConfig,
  DifficultyLevel,
  FullTestLengthPreset,
  ListeningQuestion,
  ReadingQuestion,
  SectionType,
  SpeakingQuestion,
  TestAttempt,
  TestGeneratorMode,
  WritingQuestion,
} from '../types/toefl';

export function getAllQuestions(): AnyQuestion[] {
  return getActiveQuestions();
}

export function getQuestionById(id: string): AnyQuestion | undefined {
  return getQuestionByIdFromBank(id);
}

export function getBankCounts(): Record<SectionType | 'total', number> {
  const stats = getDetailedBankStats();
  return {
    reading: stats.bySectionExercises.reading,
    listening: stats.bySectionExercises.listening,
    writing: stats.bySectionExercises.writing,
    speaking: stats.bySectionExercises.speaking,
    total: stats.totalExercises,
  };
}

export function getBankItemCounts(): Record<SectionType | 'total', number> {
  const stats = getDetailedBankStats();
  return {
    reading: stats.bySectionScoredItems.reading,
    listening: stats.bySectionScoredItems.listening,
    writing: stats.bySectionScoredItems.writing,
    speaking: stats.bySectionScoredItems.speaking,
    total: stats.totalScoredItems,
  };
}

export interface PracticePack {
  id: string;
  title: string;
  section: SectionType;
  taskTypes: AnyTaskType[];
  estimatedMinutes: number;
  description: string;
  questionCount: number;
  scoredItemCount: number;
}

export function getPracticePacks(): PracticePack[] {
  const reading = getActiveQuestionsBySection<ReadingQuestion>('reading');
  const listening = getActiveQuestionsBySection<ListeningQuestion>('listening');
  const writing = getActiveQuestionsBySection<WritingQuestion>('writing');
  const speaking = getActiveQuestionsBySection<SpeakingQuestion>('speaking');

  const cw = reading.filter((q) => q.taskType === 'complete-the-words');
  const dl = reading.filter((q) => q.taskType === 'read-daily-life');
  const ac = reading.filter((q) => q.taskType === 'read-academic-passage');
  const cr = listening.filter((q) => q.taskType === 'listen-choose-response');
  const ca = listening.filter(
    (q) => q.taskType === 'listen-conversation' || q.taskType === 'listen-announcement'
  );
  const at = listening.filter((q) => q.taskType === 'listen-academic-talk');
  const bs = writing.filter((q) => q.taskType === 'build-a-sentence');
  const ed = writing.filter(
    (q) => q.taskType === 'write-email' || q.taskType === 'write-academic-discussion'
  );
  const lr = speaking.filter((q) => q.taskType === 'listen-and-repeat');
  const iv = speaking.filter((q) => q.taskType === 'take-an-interview');

  return [
    {
      id: 'pack-complete-words',
      title: 'Complete the Words Sprint',
      section: 'reading',
      taskTypes: ['complete-the-words'],
      estimatedMinutes: 12,
      description: 'Fill-in-the-blank academic paragraphs testing morphology, collocations, and context.',
      questionCount: cw.length,
      scoredItemCount: cw.reduce((s, q) => s + countScoredItems(q), 0),
    },
    {
      id: 'pack-daily-reading',
      title: 'Daily Life Reading Pack',
      section: 'reading',
      taskTypes: ['read-daily-life'],
      estimatedMinutes: 15,
      description: 'Campus notices, lab bulletins, transit detours, grant calls, and workplace memos.',
      questionCount: dl.length,
      scoredItemCount: dl.length,
    },
    {
      id: 'pack-academic-reading',
      title: 'Academic Passages Deep Drill',
      section: 'reading',
      taskTypes: ['read-academic-passage'],
      estimatedMinutes: 22,
      description: 'Multi-discipline university passages across astrophysics, ecology, economics, immunology, and architecture.',
      questionCount: ac.length,
      scoredItemCount: ac.length,
    },
    {
      id: 'pack-listen-response',
      title: 'Quick Listening Responses',
      section: 'listening',
      taskTypes: ['listen-choose-response'],
      estimatedMinutes: 10,
      description: 'Short spoken campus and lab prompts testing natural pragmatic comprehension.',
      questionCount: cr.length,
      scoredItemCount: cr.length,
    },
    {
      id: 'pack-listen-campus',
      title: 'Conversations & Announcements',
      section: 'listening',
      taskTypes: ['listen-conversation', 'listen-announcement'],
      estimatedMinutes: 16,
      description: 'Multi-speaker dialogues and university announcements with distinct voice roles.',
      questionCount: ca.length,
      scoredItemCount: ca.length,
    },
    {
      id: 'pack-listen-talks',
      title: 'Academic Lectures Pack',
      section: 'listening',
      taskTypes: ['listen-academic-talk'],
      estimatedMinutes: 18,
      description: 'University mini-lectures testing cause-and-effect, analogies, and scientific synthesis.',
      questionCount: at.length,
      scoredItemCount: at.length,
    },
    {
      id: 'pack-build-sentence',
      title: 'Build a Sentence Grammar Pack',
      section: 'writing',
      taskTypes: ['build-a-sentence'],
      estimatedMinutes: 14,
      description: 'Interactive syntax puzzles covering inversion, subjunctive, clefts, conditionals, and clauses.',
      questionCount: bs.length,
      scoredItemCount: bs.length,
    },
    {
      id: 'pack-email-discussion',
      title: 'Email & Academic Discussion Pack',
      section: 'writing',
      taskTypes: ['write-email', 'write-academic-discussion'],
      estimatedMinutes: 25,
      description: 'Professional campus/workplace emails and seminar discussion threads with instant rubric scoring.',
      questionCount: ed.length,
      scoredItemCount: ed.length,
    },
    {
      id: 'pack-listen-repeat',
      title: 'Listen & Repeat Fluency Drill',
      section: 'speaking',
      taskTypes: ['listen-and-repeat'],
      estimatedMinutes: 12,
      description: 'Progressive spoken sentences from everyday campus life to complex C2 academic statements.',
      questionCount: lr.length,
      scoredItemCount: lr.length,
    },
    {
      id: 'pack-speaking-interview',
      title: 'Interview Speaking Practice',
      section: 'speaking',
      taskTypes: ['take-an-interview'],
      estimatedMinutes: 14,
      description: '45-second interview prompts spanning everyday, academic, personal experience, and opinion topics.',
      questionCount: iv.length,
      scoredItemCount: iv.length,
    },
  ];
}

// Keep backward-compatible export name for existing callers
export const PRACTICE_PACKS: PracticePack[] = getPracticePacks();

export function getPackQuestions(
  packId: string,
  recentIds: string[] = [],
  limit = 12
): { pack: PracticePack; questions: AnyQuestion[] } | null {
  const pack = getPracticePacks().find((p) => p.id === packId);
  if (!pack) return null;
  const pool = getActiveQuestions().filter(
    (q) => q.section === pack.section && pack.taskTypes.includes(q.taskType)
  );
  const prioritized = shuffleWithPriority(pool, recentIds, Date.now());
  return { pack, questions: prioritized.slice(0, Math.min(limit, prioritized.length)) };
}

/**
 * Deterministic seeded PRNG (Mulberry32) for reproducible test assembly
 */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Prioritizes unseen questions (avoiding repeats across consecutive ~120-item full simulations)
 * and rotates topics so adjacent questions vary meaningfully in subject matter.
 */
function shuffleWithPriority<T extends { id: string; topic: string }>(
  items: T[],
  recentIds: string[],
  seed: number
): T[] {
  const rand = mulberry32(seed);
  // Track up to 360 recent IDs (~3 full simulations) to avoid repeats across consecutive tests
  const recentSet = new Set(recentIds.slice(-360));
  const unseen = items.filter((i) => !recentSet.has(i.id));
  const seen = items.filter((i) => recentSet.has(i.id));

  const shuffle = (arr: T[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Preserve recency ordering for seen fallback (oldest seen first) while randomizing unseen
  const combined = [...shuffle(unseen), ...shuffle(seen)];
  const rotated: T[] = [];
  const pool = [...combined];
  while (pool.length > 0) {
    const lastTopic = rotated[rotated.length - 1]?.topic;
    const idx = pool.findIndex((item) => item.topic !== lastTopic);
    if (idx >= 0) {
      rotated.push(pool.splice(idx, 1)[0]);
    } else {
      rotated.push(pool.shift()!);
    }
  }
  return rotated;
}

/**
 * Target 2026 Full Simulation Blueprint:
 * - Reading: ~50 scored items (e.g., 4 Complete the Words [~19-20 blanks] + 10 Daily Life + 20 Academic Passage)
 * - Listening: ~47 scored items (15 Choose Response + 12 Conversations + 8 Announcements + 12 Academic Talks)
 * - Writing: 12 items (10 Build a Sentence + 1 Write an Email + 1 Academic Discussion)
 * - Speaking: 11 items (7 Listen & Repeat + 4 Take an Interview)
 * Total: ~120 items!
 */
export const FULL_2026_TARGETS = {
  readingScoredItems: 50,
  listeningScoredItems: 47,
  writingScoredItems: 12,
  speakingScoredItems: 11,
} as const;

export function selectReadingSet(
  recentIds: string[],
  seed = Date.now(),
  preset: FullTestLengthPreset = 'full-2026',
  randomize = false
): ReadingQuestion[] {
  const bank = getActiveQuestionsBySection<ReadingQuestion>('reading');
  if (randomize) {
    const targetItems = preset === 'full-2026' ? 50 : 12;
    const shuffled = shuffleWithPriority(bank, recentIds, seed + 101);
    const chosen: ReadingQuestion[] = [];
    let scored = 0;
    for (const q of shuffled) {
      const w = countScoredItems(q);
      if (scored + w > targetItems + 2 && chosen.length >= 6) continue;
      chosen.push(q);
      scored += w;
      if (scored >= targetItems) break;
    }
    return chosen;
  }

  const completeWords = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'complete-the-words'),
    recentIds,
    seed + 1
  );
  const dailyLife = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'read-daily-life'),
    recentIds,
    seed + 2
  );
  const academic = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'read-academic-passage'),
    recentIds,
    seed + 3
  );

  if (preset === 'express') {
    // Express 8-screen set (~14 scored items): Stage 1 (4) + Stage 2 (4)
    const s1: ReadingQuestion[] = [
      ...completeWords.slice(0, 1),
      ...dailyLife.slice(0, 2),
      ...academic.filter((q) => q.difficulty === 'Intermediate').slice(0, 1),
    ];
    const used = new Set(s1.map((q) => q.id));
    const s2: ReadingQuestion[] = [
      ...completeWords.filter((q) => !used.has(q.id)).slice(0, 1),
      ...dailyLife.filter((q) => !used.has(q.id)).slice(0, 1),
      ...academic.filter((q) => !used.has(q.id)).slice(0, 2),
    ];
    return [...s1, ...s2];
  }

  // Full 2026 Reading Simulation targeting ~50 individual scored items:
  // Stage 1 (Routing): 2 Complete the Words (~9-10 items) + 5 Daily Life + 10 Academic = ~25 items
  // Stage 2 (Adaptive): 2 Complete the Words (~9-10 items) + 5 Daily Life + 10 Academic = ~25 items
  const stage1: ReadingQuestion[] = [
    ...completeWords.slice(0, 2),
    ...dailyLife.slice(0, 5),
    ...academic.slice(0, 10),
  ];
  const used = new Set(stage1.map((q) => q.id));
  const stage2: ReadingQuestion[] = [
    ...completeWords.filter((q) => !used.has(q.id)).slice(0, 2),
    ...dailyLife.filter((q) => !used.has(q.id)).slice(0, 5),
    ...academic.filter((q) => !used.has(q.id)).slice(0, 10),
  ];

  const combined = [...stage1, ...stage2];
  // Top up if bank has additional items and we are slightly under 50 scored items
  let scored = combined.reduce((sum, q) => sum + countScoredItems(q), 0);
  if (scored < 50) {
    const usedAll = new Set(combined.map((q) => q.id));
    const extras = shuffleWithPriority(
      bank.filter((q) => !usedAll.has(q.id)),
      recentIds,
      seed + 9
    );
    for (const q of extras) {
      if (scored >= 50) break;
      const w = countScoredItems(q);
      if (scored + w <= 52) {
        combined.push(q);
        scored += w;
      }
    }
  }
  return combined;
}

export function adaptReadingStage2(
  stage1Accuracy: number,
  alreadySelectedIds: string[],
  recentIds: string[],
  stage2CountTarget: number
): { tier: AdaptiveTier; stage2Questions: ReadingQuestion[] } {
  const tier: AdaptiveTier =
    stage1Accuracy >= 0.7 ? 'Upper-Adaptive' : stage1Accuracy >= 0.45 ? 'Standard' : 'Foundation';

  const targetDiffs: DifficultyLevel[] =
    tier === 'Upper-Adaptive'
      ? ['Advanced', 'Expert']
      : tier === 'Standard'
      ? ['Intermediate', 'Advanced']
      : ['Beginner', 'Intermediate'];

  const usedSet = new Set(alreadySelectedIds);
  const pool = getActiveQuestionsBySection<ReadingQuestion>('reading').filter(
    (q) => !usedSet.has(q.id)
  );
  const prioritized = shuffleWithPriority(pool, recentIds, Date.now());
  const ordered = [
    ...prioritized.filter((q) => targetDiffs.includes(q.difficulty)),
    ...prioritized.filter((q) => !targetDiffs.includes(q.difficulty)),
  ];

  const cwTarget = stage2CountTarget >= 12 ? 2 : 1;
  const dlTarget = stage2CountTarget >= 12 ? 5 : 1;
  const acTarget = Math.max(2, stage2CountTarget - cwTarget - dlTarget);

  const cw = ordered.filter((q) => q.taskType === 'complete-the-words').slice(0, cwTarget);
  const daily = ordered.filter((q) => q.taskType === 'read-daily-life').slice(0, dlTarget);
  const academics = ordered
    .filter((q) => q.taskType === 'read-academic-passage')
    .slice(0, acTarget);

  const chosen = [...cw, ...daily, ...academics];
  if (chosen.length < stage2CountTarget) {
    const chosenIds = new Set(chosen.map((q) => q.id));
    for (const q of ordered) {
      if (chosen.length >= stage2CountTarget) break;
      if (!chosenIds.has(q.id)) {
        chosen.push(q);
        chosenIds.add(q.id);
      }
    }
  }

  return { tier, stage2Questions: chosen };
}

export function selectListeningSet(
  recentIds: string[],
  seed = Date.now(),
  preset: FullTestLengthPreset = 'full-2026',
  randomize = false
): ListeningQuestion[] {
  const bank = getActiveQuestionsBySection<ListeningQuestion>('listening');
  if (randomize) {
    const count = preset === 'full-2026' ? 47 : 7;
    return shuffleWithPriority(bank, recentIds, seed + 111).slice(0, Math.min(count, bank.length));
  }

  const chooseResp = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'listen-choose-response'),
    recentIds,
    seed + 11
  );
  const conv = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'listen-conversation'),
    recentIds,
    seed + 12
  );
  const announce = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'listen-announcement'),
    recentIds,
    seed + 13
  );
  const talk = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'listen-academic-talk'),
    recentIds,
    seed + 14
  );

  if (preset === 'express') {
    // Express 7-item set: Stage 1 (3) + Stage 2 (4)
    return [
      ...chooseResp.slice(0, 1),
      ...announce.slice(0, 1),
      ...conv.slice(0, 1),
      ...chooseResp.slice(1, 2),
      ...conv.slice(1, 2),
      ...talk.slice(0, 2),
    ];
  }

  // Full 2026 Listening Simulation targeting 47 items:
  // Stage 1 (23 items): 8 Choose Response + 6 Conversations + 4 Announcements + 5 Academic Talks
  // Stage 2 (24 items): 7 Choose Response + 6 Conversations + 4 Announcements + 7 Academic Talks
  const stage1 = [
    ...chooseResp.slice(0, 8),
    ...announce.slice(0, 4),
    ...conv.slice(0, 6),
    ...talk.slice(0, 5),
  ];
  const stage2 = [
    ...chooseResp.slice(8, 15),
    ...announce.slice(4, 8),
    ...conv.slice(6, 12),
    ...talk.slice(5, 12),
  ];
  const combined = [...stage1, ...stage2];
  if (combined.length < 47) {
    const used = new Set(combined.map((q) => q.id));
    const extras = shuffleWithPriority(
      bank.filter((q) => !used.has(q.id)),
      recentIds,
      seed + 19
    );
    combined.push(...extras.slice(0, 47 - combined.length));
  }
  return combined.slice(0, 47);
}

export function adaptListeningStage2(
  stage1Accuracy: number,
  alreadySelectedIds: string[],
  recentIds: string[],
  stage2CountTarget: number
): { tier: AdaptiveTier; stage2Questions: ListeningQuestion[] } {
  const tier: AdaptiveTier =
    stage1Accuracy >= 0.67 ? 'Upper-Adaptive' : stage1Accuracy >= 0.34 ? 'Standard' : 'Foundation';

  const targetDiffs: DifficultyLevel[] =
    tier === 'Upper-Adaptive'
      ? ['Advanced', 'Expert']
      : tier === 'Standard'
      ? ['Intermediate', 'Advanced']
      : ['Beginner', 'Intermediate'];

  const usedSet = new Set(alreadySelectedIds);
  const pool = shuffleWithPriority(
    getActiveQuestionsBySection<ListeningQuestion>('listening').filter((q) => !usedSet.has(q.id)),
    recentIds,
    Date.now()
  );

  const ordered = [
    ...pool.filter((q) => targetDiffs.includes(q.difficulty)),
    ...pool.filter((q) => !targetDiffs.includes(q.difficulty)),
  ];

  if (stage2CountTarget <= 6) {
    const talks = ordered.filter((q) => q.taskType === 'listen-academic-talk').slice(0, 2);
    const others = ordered
      .filter((q) => q.taskType !== 'listen-academic-talk')
      .slice(0, Math.max(1, stage2CountTarget - talks.length));
    return { tier, stage2Questions: [...others, ...talks].slice(0, stage2CountTarget) };
  }

  // Full 24-item Stage 2 proportional distribution
  const talks = ordered.filter((q) => q.taskType === 'listen-academic-talk').slice(0, 7);
  const convs = ordered.filter((q) => q.taskType === 'listen-conversation').slice(0, 6);
  const anns = ordered.filter((q) => q.taskType === 'listen-announcement').slice(0, 4);
  const crs = ordered.filter((q) => q.taskType === 'listen-choose-response').slice(0, 7);
  const chosen = [...crs, ...anns, ...convs, ...talks];
  if (chosen.length < stage2CountTarget) {
    const used = new Set(chosen.map((q) => q.id));
    for (const q of ordered) {
      if (chosen.length >= stage2CountTarget) break;
      if (!used.has(q.id)) {
        chosen.push(q);
        used.add(q.id);
      }
    }
  }
  return { tier, stage2Questions: chosen.slice(0, stage2CountTarget) };
}

export function selectWritingSet(
  recentIds: string[],
  seed = Date.now(),
  preset: FullTestLengthPreset = 'full-2026',
  randomize = false
): WritingQuestion[] {
  const bank = getActiveQuestionsBySection<WritingQuestion>('writing');
  const bs = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'build-a-sentence'),
    recentIds,
    seed + 21
  );
  const em = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'write-email'),
    recentIds,
    seed + 22
  );
  const ad = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'write-academic-discussion'),
    recentIds,
    seed + 23
  );

  // Full 2026 Writing Simulation = 12 items (10 Build a Sentence + 1 Email + 1 Academic Discussion)
  // Express = 5 items (3 Build a Sentence + 1 Email + 1 Academic Discussion)
  const bsCount = preset === 'full-2026' ? 10 : 3;
  const set = [...bs.slice(0, bsCount), ...em.slice(0, 1), ...ad.slice(0, 1)];
  return randomize ? shuffleWithPriority(set, [], seed + 29) : set;
}

export function selectSpeakingSet(
  recentIds: string[],
  seed = Date.now(),
  preset: FullTestLengthPreset = 'full-2026',
  randomize = false
): SpeakingQuestion[] {
  const bank = getActiveQuestionsBySection<SpeakingQuestion>('speaking');
  const lr = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'listen-and-repeat'),
    recentIds,
    seed + 31
  );
  const iv = shuffleWithPriority(
    bank.filter((q) => q.taskType === 'take-an-interview'),
    recentIds,
    seed + 32
  );

  // Full 2026 Speaking Simulation = 11 items (7 Listen & Repeat + 4 Take an Interview)
  // Express = 5 items (3 Listen & Repeat + 2 Take an Interview)
  const lrCount = preset === 'full-2026' ? 7 : 3;
  const ivCount = preset === 'full-2026' ? 4 : 2;
  const set = [...lr.slice(0, lrCount), ...iv.slice(0, ivCount)];
  return randomize ? shuffleWithPriority(set, [], seed + 39) : set;
}

export function buildFullExamQuestions(
  recentIds: string[],
  seed = Date.now(),
  preset: FullTestLengthPreset = 'full-2026',
  randomize = false
): Record<SectionType, string[]> {
  return {
    reading: selectReadingSet(recentIds, seed, preset, randomize).map((q) => q.id),
    listening: selectListeningSet(recentIds, seed, preset, randomize).map((q) => q.id),
    writing: selectWritingSet(recentIds, seed, preset, randomize).map((q) => q.id),
    speaking: selectSpeakingSet(recentIds, seed, preset, randomize).map((q) => q.id),
  };
}

export interface GeneratedTestSession {
  mode: TestGeneratorMode;
  title: string;
  subtitle: string;
  sections: SectionType[];
  questionIdsBySection: Record<SectionType, string[]>;
  adaptiveEnabled: boolean;
  totalExercises: number;
  totalScoredItems: number;
  durationsBySectionSec: Record<SectionType, number>;
}

export const SECTION_DURATION_SECONDS: Record<SectionType, number> = {
  reading: 35 * 60, // 35 minutes for full ~50-item adaptive Reading
  listening: 32 * 60, // 32 minutes for full ~47-item adaptive Listening
  writing: 29 * 60, // 29 minutes for 10 Build a Sentence + Email + Discussion
  speaking: 12 * 60, // 12 minutes for 7 Listen & Repeat + 4 Interview
};

export const EXPRESS_SECTION_DURATION_SECONDS: Record<SectionType, number> = {
  reading: 16 * 60,
  listening: 14 * 60,
  writing: 22 * 60,
  speaking: 8 * 60,
};

function computeProportionalDuration(section: SectionType, qIds: string[], preset: FullTestLengthPreset): number {
  const qs = qIds.map((id) => getQuestionById(id)).filter((q): q is AnyQuestion => Boolean(q));
  if (qs.length === 0) return EXPRESS_SECTION_DURATION_SECONDS[section];
  if (preset === 'full-2026') {
    const est = qs.reduce((s, q) => s + q.estimatedTimeSec, 0);
    return Math.max(5 * 60, Math.min(SECTION_DURATION_SECONDS[section], Math.round(est * 0.95)));
  }
  const est = qs.reduce((s, q) => s + q.estimatedTimeSec, 0);
  return Math.max(5 * 60, Math.min(EXPRESS_SECTION_DURATION_SECONDS[section], est));
}

/**
 * Unified 10-Mode Dynamic Test Generator:
 * 1. standard-full   2. random-full    3. adaptive-full
 * 4. reading-only    5. listening-only 6. writing-only    7. speaking-only
 * 8. weakness-based  9. mistake-review 10. custom
 */
export function generateTestSession(params: {
  mode: TestGeneratorMode;
  recentIds: string[];
  attempts: TestAttempt[];
  preset?: FullTestLengthPreset;
  customConfig?: CustomPracticeConfig;
  seed?: number;
}): GeneratedTestSession {
  const { mode, recentIds, attempts, preset = 'full-2026', customConfig, seed = Date.now() } = params;

  const emptyMap: Record<SectionType, string[]> = {
    reading: [],
    listening: [],
    writing: [],
    speaking: [],
  };

  let sections: SectionType[] = ['reading', 'listening', 'writing', 'speaking'];
  let qMap: Record<SectionType, string[]> = { ...emptyMap };
  let adaptiveEnabled = false;
  let title = 'Standard Full Test Simulation';
  let subtitle = 'Balanced 2026 TOEFL iBT blueprint (~120 items) avoiding recently seen items.';

  if (mode === 'standard-full') {
    qMap = buildFullExamQuestions(recentIds, seed, preset, false);
    adaptiveEnabled = false;
    title = preset === 'full-2026' ? 'Standard Full Test (2026 Format)' : 'Standard Express Full Test';
    subtitle = 'Structured 4-section simulation targeting 50 Reading · 47 Listening · 12 Writing · 11 Speaking items.';
  } else if (mode === 'random-full') {
    qMap = buildFullExamQuestions(recentIds, seed + 777, preset, true);
    adaptiveEnabled = false;
    title = preset === 'full-2026' ? 'Random Full Test Simulation' : 'Random Express Full Test';
    subtitle = 'Broadly randomized cross-topic simulation excluding recently completed items.';
  } else if (mode === 'adaptive-full') {
    qMap = buildFullExamQuestions(recentIds, seed + 333, preset, false);
    adaptiveEnabled = true;
    title = preset === 'full-2026' ? 'Adaptive Full Test (2026 Format)' : 'Adaptive Express Full Test';
    subtitle = 'Live Stage 1 → Stage 2 adaptive routing in Reading and Listening based on midpoint accuracy.';
  } else if (mode === 'reading-only') {
    sections = ['reading'];
    qMap.reading = selectReadingSet(recentIds, seed, preset, false).map((q) => q.id);
    adaptiveEnabled = true;
    title = 'Reading Only Simulation';
    subtitle = 'Complete the Words, Read in Daily Life, and Academic Passages with adaptive Stage 2 routing.';
  } else if (mode === 'listening-only') {
    sections = ['listening'];
    qMap.listening = selectListeningSet(recentIds, seed, preset, false).map((q) => q.id);
    adaptiveEnabled = true;
    title = 'Listening Only Simulation';
    subtitle = 'Listen & Choose Response, Conversations, Announcements, and Academic Talks with adaptive routing.';
  } else if (mode === 'writing-only') {
    sections = ['writing'];
    qMap.writing = selectWritingSet(recentIds, seed, preset, false).map((q) => q.id);
    adaptiveEnabled = false;
    title = 'Writing Only Simulation';
    subtitle = 'Build a Sentence syntax puzzles, Write an Email, and Write for an Academic Discussion.';
  } else if (mode === 'speaking-only') {
    sections = ['speaking'];
    qMap.speaking = selectSpeakingSet(recentIds, seed, preset, false).map((q) => q.id);
    adaptiveEnabled = false;
    title = 'Speaking Only Simulation';
    subtitle = 'Listen and Repeat fluency drills plus 45-second Take an Interview prompts.';
  } else if (mode === 'weakness-based') {
    // Identify lowest-accuracy task types and weakest sections from historical attempts
    const taskAccMap: Record<string, { section: SectionType; correct: number; total: number }> = {};
    attempts.forEach((a) => {
      a.taskTypeStats.forEach((t) => {
        if (!taskAccMap[t.taskType]) taskAccMap[t.taskType] = { section: t.section, correct: 0, total: 0 };
        taskAccMap[t.taskType].correct += t.correct;
        taskAccMap[t.taskType].total += t.total;
      });
    });

    const rankedTasks = Object.entries(taskAccMap)
      .map(([taskType, v]) => ({
        taskType: taskType as AnyTaskType,
        section: v.section,
        acc: v.total > 0 ? v.correct / v.total : 0.5,
      }))
      .sort((a, b) => a.acc - b.acc);

    const weakTaskTypes =
      rankedTasks.length > 0
        ? rankedTasks.slice(0, 4).map((t) => t.taskType)
        : (['read-academic-passage', 'listen-academic-talk', 'build-a-sentence', 'take-an-interview'] as AnyTaskType[]);

    const all = getActiveQuestions();
    const targeted = shuffleWithPriority(
      all.filter((q) => weakTaskTypes.includes(q.taskType)),
      recentIds,
      seed + 505
    );

    const perSecCap = 5;
    (['reading', 'listening', 'writing', 'speaking'] as SectionType[]).forEach((sec) => {
      qMap[sec] = targeted
        .filter((q) => q.section === sec)
        .slice(0, perSecCap)
        .map((q) => q.id);
    });
    sections = (['reading', 'listening', 'writing', 'speaking'] as SectionType[]).filter(
      (s) => qMap[s].length > 0
    );
    if (sections.length === 0) {
      sections = ['reading', 'listening'];
      qMap.reading = selectReadingSet(recentIds, seed, 'express').slice(0, 4).map((q) => q.id);
      qMap.listening = selectListeningSet(recentIds, seed, 'express').slice(0, 4).map((q) => q.id);
    }
    title = 'Weakness-Based Targeted Practice';
    subtitle = 'Automatically assembled from your lowest-accuracy 2026 task types and missed skills.';
  } else if (mode === 'mistake-review') {
    const missedIdsOrdered: string[] = [];
    const seen = new Set<string>();
    attempts.forEach((a) => {
      a.mistakes.forEach((m) => {
        if (!seen.has(m.questionId) && getQuestionById(m.questionId)) {
          seen.add(m.questionId);
          missedIdsOrdered.push(m.questionId);
        }
      });
    });

    missedIdsOrdered.forEach((id) => {
      const q = getQuestionById(id);
      if (q) qMap[q.section].push(q.id);
    });

    sections = (['reading', 'listening', 'writing', 'speaking'] as SectionType[]).filter(
      (s) => qMap[s].length > 0
    );
    title = 'Mistake Review Session';
    subtitle =
      missedIdsOrdered.length > 0
        ? `Retrying ${missedIdsOrdered.length} unique missed items from your recent simulations.`
        : 'No missed items logged yet — complete any practice set to populate Mistake Review.';
  } else if (mode === 'custom') {
    const cfg: CustomPracticeConfig = customConfig || {
      sections: ['reading', 'listening'],
      taskTypes: [],
      difficulties: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      topicQuery: '',
      itemLimitPerSection: 6,
      excludeRecent: true,
    };
    const qText = cfg.topicQuery.trim().toLowerCase();
    const chosenSections: SectionType[] =
      cfg.sections.length > 0 ? cfg.sections : ['reading'];

    chosenSections.forEach((sec) => {
      let pool = getActiveQuestionsBySection(sec);
      if (cfg.taskTypes.length > 0) {
        const secTasks = pool.filter((q) => cfg.taskTypes.includes(q.taskType));
        if (secTasks.length > 0) pool = secTasks;
      }
      if (cfg.difficulties.length > 0) {
        pool = pool.filter((q) => cfg.difficulties.includes(q.difficulty));
      }
      if (qText) {
        pool = pool.filter((q) =>
          `${q.topic} ${q.skillFocus} ${q.keywords.join(' ')}`.toLowerCase().includes(qText)
        );
      }
      const ordered = shuffleWithPriority(pool, cfg.excludeRecent ? recentIds : [], seed + 888);
      qMap[sec] = ordered.slice(0, Math.max(1, cfg.itemLimitPerSection)).map((q) => q.id);
    });

    sections = chosenSections.filter((s) => qMap[s].length > 0);
    title = 'Custom Practice Session';
    subtitle = 'Tailored drill built from your selected sections, task types, difficulty tiers, and topics.';
  }

  const allSelectedIds = sections.flatMap((s) => qMap[s]);
  const allSelectedQuestions = allSelectedIds
    .map((id) => getQuestionById(id))
    .filter((q): q is AnyQuestion => Boolean(q));

  const durationsBySectionSec: Record<SectionType, number> = {
    reading: computeProportionalDuration('reading', qMap.reading, preset),
    listening: computeProportionalDuration('listening', qMap.listening, preset),
    writing: computeProportionalDuration('writing', qMap.writing, preset),
    speaking: computeProportionalDuration('speaking', qMap.speaking, preset),
  };

  return {
    mode,
    title,
    subtitle,
    sections,
    questionIdsBySection: qMap,
    adaptiveEnabled,
    totalExercises: allSelectedQuestions.length,
    totalScoredItems: allSelectedQuestions.reduce((s, q) => s + countScoredItems(q), 0),
    durationsBySectionSec,
  };
}
