import { READING_BANK } from '../data/readingBank';
import { LISTENING_BANK } from '../data/listeningBank';
import { WRITING_BANK } from '../data/writingBank';
import { SPEAKING_BANK } from '../data/speakingBank';
import { VOCABULARY_BANK } from '../data/vocabularyBank';
import { READING_EXPANSION_PACK } from '../data/packs/readingExpansion';
import { LISTENING_EXPANSION_PACK } from '../data/packs/listeningExpansion';
import { WRITING_EXPANSION_PACK } from '../data/packs/writingExpansion';
import { SPEAKING_EXPANSION_PACK } from '../data/packs/speakingExpansion';
import { VOCABULARY_EXPANSION_PACK } from '../data/packs/vocabularyExpansion';
import {
  AnyQuestion,
  AnyTaskType,
  DifficultyLevel,
  InstalledQuestionPack,
  PackValidationReport,
  QuestionPackFile,
  SectionType,
  VocabWord,
} from '../types/toefl';
import { validateQuestionPack } from './packValidator';

const IMPORTED_PACKS_STORAGE_KEY = 'aipp_toefl_imported_packs_v1';
const DISABLED_PACKS_STORAGE_KEY = 'aipp_toefl_disabled_packs_v1';

export const BANK_LONG_TERM_TARGETS = {
  readingItems: 500,
  listeningItems: 500,
  writingItems: 300,
  speakingItems: 300,
  vocabularyEntries: 1000,
} as const;

export const OFFICIAL_SAMPLE_PACK_URLS = [
  {
    id: 'aipp-stem-reading-listening',
    url: '/question-packs/aipp-stem-reading-listening-v1.json',
    name: 'STEM Reading & Listening Pack (v1.0.0)',
    summary: '12 original STEM Reading & Listening exercises (16 scored items) + 20 STEM vocabulary entries.',
  },
  {
    id: 'aipp-academic-writing-speaking',
    url: '/question-packs/aipp-academic-writing-speaking-v1.json',
    name: 'Academic Writing & Speaking Pack (v1.0.0)',
    summary: '12 original Writing & Speaking prompts + 15 academic discourse vocabulary entries.',
  },
] as const;

/**
 * Counts individual scored items inside a question record.
 * Complete the Words passages contain multiple individual fill-in-the-blank items (4–5 each).
 */
export function countScoredItems(q: AnyQuestion): number {
  if (q.taskType === 'complete-the-words') {
    return q.blanks.length;
  }
  return 1;
}

function buildBuiltinPacks(): InstalledQuestionPack[] {
  const coreQuestions: AnyQuestion[] = [
    ...READING_BANK.map((q) => ({ ...q, packId: 'aipp-core-2026' })),
    ...LISTENING_BANK.map((q) => ({ ...q, packId: 'aipp-core-2026' })),
    ...WRITING_BANK.map((q) => ({ ...q, packId: 'aipp-core-2026' })),
    ...SPEAKING_BANK.map((q) => ({ ...q, packId: 'aipp-core-2026' })),
  ];
  const coreVocab: VocabWord[] = VOCABULARY_BANK.map((v) => ({
    ...v,
    difficulty:
      v.difficulty ||
      (v.cefr === 'C2'
        ? 'Expert'
        : v.cefr === 'C1'
          ? 'Advanced'
          : v.cefr === 'B1' || v.cefr === 'A2'
            ? 'Beginner'
            : 'Intermediate'),
    packId: 'aipp-core-2026',
  }));

  const expansionQuestions: AnyQuestion[] = [
    ...READING_EXPANSION_PACK.map((q) => ({ ...q, packId: 'aipp-expansion-2026' })),
    ...LISTENING_EXPANSION_PACK.map((q) => ({ ...q, packId: 'aipp-expansion-2026' })),
    ...WRITING_EXPANSION_PACK.map((q) => ({ ...q, packId: 'aipp-expansion-2026' })),
    ...SPEAKING_EXPANSION_PACK.map((q) => ({ ...q, packId: 'aipp-expansion-2026' })),
  ];

  return [
    {
      manifest: {
        packId: 'aipp-core-2026',
        name: 'AIPP TOEFL 2026 Core Curriculum Pack',
        version: '1.0.0',
        description:
          'Foundational curated 2026 TOEFL iBT dataset covering all 12 task types across Reading, Listening, Writing, Speaking, and core academic vocabulary.',
        author: 'AIPP TOEFL TEAM',
        createdAt: '2026-01-21T00:00:00.000Z',
        source: 'builtin',
        tags: ['Core', '2026 Format', 'All 4 Sections'],
      },
      installedAt: '2026-01-21T00:00:00.000Z',
      enabled: true,
      questions: coreQuestions,
      vocabulary: coreVocab,
    },
    {
      manifest: {
        packId: 'aipp-expansion-2026',
        name: 'AIPP Comprehensive Practice & Lexicon Pack',
        version: '1.0.0',
        description:
          'Expanded multi-disciplinary bank with 168 additional exercises (Astrophysics, Urban Economics, Immunology, Paleoclimatology, Energy Grids, Marine Biology) plus 214 curated academic vocabulary entries.',
        author: 'AIPP TOEFL TEAM',
        createdAt: '2026-02-15T00:00:00.000Z',
        source: 'builtin',
        tags: ['Expansion', 'Full-Length Ready', '214 Academic Terms'],
      },
      installedAt: '2026-02-15T00:00:00.000Z',
      enabled: true,
      questions: expansionQuestions,
      vocabulary: VOCABULARY_EXPANSION_PACK,
    },
  ];
}

function loadDisabledIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISABLED_PACKS_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDisabledIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DISABLED_PACKS_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore quota errors
  }
}

function loadImportedPacks(): InstalledQuestionPack[] {
  try {
    const raw = localStorage.getItem(IMPORTED_PACKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as InstalledQuestionPack[];
  } catch {
    return [];
  }
}

function saveImportedPacks(packs: InstalledQuestionPack[]): { ok: boolean; error?: string } {
  try {
    localStorage.setItem(IMPORTED_PACKS_STORAGE_KEY, JSON.stringify(packs));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Browser storage quota exceeded. Remove older imported packs or import smaller JSON files.',
    };
  }
}

// In-memory cache + pub/sub for zero-overhead reactive reads across UI
const BUILTIN_PACKS = buildBuiltinPacks();
let importedPacksCache: InstalledQuestionPack[] = loadImportedPacks();
let disabledPackIdsCache: Set<string> = loadDisabledIds();
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((fn) => fn());
}

export function subscribeBankChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getInstalledPacks(): InstalledQuestionPack[] {
  return [...BUILTIN_PACKS, ...importedPacksCache].map((p) => ({
    ...p,
    enabled: !disabledPackIdsCache.has(p.manifest.packId),
  }));
}

export function getActiveQuestions(): AnyQuestion[] {
  return getInstalledPacks()
    .filter((p) => p.enabled)
    .flatMap((p) => p.questions);
}

export function getActiveQuestionsBySection<T extends AnyQuestion = AnyQuestion>(
  section: SectionType
): T[] {
  return getActiveQuestions().filter((q) => q.section === section) as T[];
}

export function getQuestionByIdFromBank(id: string): AnyQuestion | undefined {
  for (const pack of getInstalledPacks()) {
    const match = pack.questions.find((q) => q.id === id);
    if (match) return match;
  }
  return undefined;
}

export function getActiveVocabulary(): VocabWord[] {
  return getInstalledPacks()
    .filter((p) => p.enabled)
    .flatMap((p) => p.vocabulary);
}

export interface DetailedBankStats {
  totalExercises: number;
  totalScoredItems: number;
  totalVocabulary: number;
  bySectionExercises: Record<SectionType, number>;
  bySectionScoredItems: Record<SectionType, number>;
  byTaskType: Record<AnyTaskType, number>;
  byDifficulty: Record<DifficultyLevel, number>;
  vocabByDifficulty: Record<DifficultyLevel, number>;
  installedPackCount: number;
  activePackCount: number;
  importedPackCount: number;
  targets: typeof BANK_LONG_TERM_TARGETS;
}

export function getDetailedBankStats(): DetailedBankStats {
  const packs = getInstalledPacks();
  const activeQuestions = getActiveQuestions();
  const activeVocab = getActiveVocabulary();

  const bySectionExercises: Record<SectionType, number> = {
    reading: 0,
    listening: 0,
    writing: 0,
    speaking: 0,
  };
  const bySectionScoredItems: Record<SectionType, number> = {
    reading: 0,
    listening: 0,
    writing: 0,
    speaking: 0,
  };
  const byTaskType: Record<AnyTaskType, number> = {
    'complete-the-words': 0,
    'read-daily-life': 0,
    'read-academic-passage': 0,
    'listen-choose-response': 0,
    'listen-conversation': 0,
    'listen-announcement': 0,
    'listen-academic-talk': 0,
    'build-a-sentence': 0,
    'write-email': 0,
    'write-academic-discussion': 0,
    'listen-and-repeat': 0,
    'take-an-interview': 0,
  };
  const byDifficulty: Record<DifficultyLevel, number> = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
    Expert: 0,
  };
  const vocabByDifficulty: Record<DifficultyLevel, number> = {
    Beginner: 0,
    Intermediate: 0,
    Advanced: 0,
    Expert: 0,
  };

  let totalScoredItems = 0;

  activeQuestions.forEach((q) => {
    const itemWeight = countScoredItems(q);
    bySectionExercises[q.section] += 1;
    bySectionScoredItems[q.section] += itemWeight;
    byTaskType[q.taskType] = (byTaskType[q.taskType] || 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    totalScoredItems += itemWeight;
  });

  activeVocab.forEach((v) => {
    const diff: DifficultyLevel =
      v.difficulty ||
      (v.cefr === 'C2'
        ? 'Expert'
        : v.cefr === 'C1'
          ? 'Advanced'
          : v.cefr === 'B1' || v.cefr === 'A2'
            ? 'Beginner'
            : 'Intermediate');
    vocabByDifficulty[diff] += 1;
  });

  return {
    totalExercises: activeQuestions.length,
    totalScoredItems,
    totalVocabulary: activeVocab.length,
    bySectionExercises,
    bySectionScoredItems,
    byTaskType,
    byDifficulty,
    vocabByDifficulty,
    installedPackCount: packs.length,
    activePackCount: packs.filter((p) => p.enabled).length,
    importedPackCount: packs.filter((p) => p.manifest.source === 'imported').length,
    targets: BANK_LONG_TERM_TARGETS,
  };
}

export function validatePackFromJsonText(jsonText: string): {
  parseError?: string;
  report?: PackValidationReport;
} {
  try {
    const parsed = JSON.parse(jsonText);
    const report = validateQuestionPack(parsed, getInstalledPacks());
    return { report };
  } catch (err) {
    return {
      parseError: err instanceof Error ? `Invalid JSON syntax: ${err.message}` : 'Invalid JSON file.',
    };
  }
}

export function commitValidatedPack(report: PackValidationReport): {
  ok: boolean;
  error?: string;
  importedQuestions: number;
  importedVocab: number;
} {
  if (!report.canImportPartial || !report.manifest) {
    return {
      ok: false,
      error: 'Pack cannot be imported because manifest validation failed or no unique valid items remain.',
      importedQuestions: 0,
      importedVocab: 0,
    };
  }

  const nextPack: InstalledQuestionPack = {
    manifest: { ...report.manifest, source: 'imported' },
    installedAt: new Date().toISOString(),
    enabled: true,
    questions: report.validQuestions,
    vocabulary: report.validVocabulary,
  };

  // Replace existing pack if upgrading same packId, otherwise append
  const existingIdx = importedPacksCache.findIndex(
    (p) => p.manifest.packId === nextPack.manifest.packId
  );
  const nextCache =
    existingIdx >= 0
      ? importedPacksCache.map((p, i) => (i === existingIdx ? nextPack : p))
      : [...importedPacksCache, nextPack];

  const saved = saveImportedPacks(nextCache);
  if (!saved.ok) {
    return { ok: false, error: saved.error, importedQuestions: 0, importedVocab: 0 };
  }

  importedPacksCache = nextCache;
  disabledPackIdsCache.delete(nextPack.manifest.packId);
  saveDisabledIds(disabledPackIdsCache);
  notifyListeners();

  return {
    ok: true,
    importedQuestions: nextPack.questions.length,
    importedVocab: nextPack.vocabulary.length,
  };
}

export function togglePackEnabled(packId: string): void {
  if (disabledPackIdsCache.has(packId)) {
    disabledPackIdsCache.delete(packId);
  } else {
    // Prevent disabling the last remaining enabled pack
    const enabledPacks = getInstalledPacks().filter((p) => p.enabled);
    if (enabledPacks.length <= 1) return;
    disabledPackIdsCache.add(packId);
  }
  saveDisabledIds(disabledPackIdsCache);
  notifyListeners();
}

export function removeImportedPack(packId: string): void {
  importedPacksCache = importedPacksCache.filter((p) => p.manifest.packId !== packId);
  disabledPackIdsCache.delete(packId);
  saveImportedPacks(importedPacksCache);
  saveDisabledIds(disabledPackIdsCache);
  notifyListeners();
}

export function exportActiveBankAsJson(): QuestionPackFile {
  return {
    schemaVersion: '1.0',
    manifest: {
      packId: `aipp-export-${new Date().toISOString().slice(0, 10)}`,
      name: 'AIPP TOEFL TEAM Active Question Bank Export',
      version: '1.0.0',
      description: 'Complete snapshot of all currently enabled question and vocabulary packs.',
      author: 'AIPP TOEFL TEAM',
      createdAt: new Date().toISOString(),
      source: 'imported',
      tags: ['Export', 'Full Snapshot'],
    },
    questions: getActiveQuestions(),
    vocabulary: getActiveVocabulary(),
  };
}

export function getBackupPacksPayload(): {
  importedPacks: InstalledQuestionPack[];
  disabledPackIds: string[];
} {
  return {
    importedPacks: importedPacksCache,
    disabledPackIds: [...disabledPackIdsCache],
  };
}

export function restoreBackupPacksPayload(payload: {
  importedPacks?: unknown;
  disabledPackIds?: unknown;
}): void {
  let changed = false;
  if (Array.isArray(payload.importedPacks)) {
    const validPacks = payload.importedPacks.filter(
      (p): p is InstalledQuestionPack =>
        Boolean(
          p &&
          typeof p === 'object' &&
          'manifest' in p &&
          Array.isArray((p as InstalledQuestionPack).questions) &&
          Array.isArray((p as InstalledQuestionPack).vocabulary)
        )
    );
    const saved = saveImportedPacks(validPacks);
    if (saved.ok) {
      importedPacksCache = validPacks;
      changed = true;
    }
  }
  if (Array.isArray(payload.disabledPackIds)) {
    disabledPackIdsCache = new Set(payload.disabledPackIds.map(String));
    saveDisabledIds(disabledPackIdsCache);
    changed = true;
  }
  if (changed) notifyListeners();
}
