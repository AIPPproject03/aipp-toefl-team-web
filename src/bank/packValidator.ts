import {
  AnyQuestion,
  CEFRLevel,
  DifficultyLevel,
  InstalledQuestionPack,
  PackValidationIssue,
  PackValidationReport,
  QuestionPackFile,
  QuestionPackManifest,
  SectionType,
  VocabWord,
} from '../types/toefl';

const VALID_SECTIONS: SectionType[] = ['reading', 'listening', 'writing', 'speaking'];
const VALID_DIFFICULTIES: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const VALID_CEFR: CEFRLevel[] = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C2'];
const VALID_VOICE_ROLES = [
  'female-academic',
  'male-academic',
  'student-female',
  'student-male',
  'announcer',
];

const TASK_TO_SECTION: Record<string, SectionType> = {
  'complete-the-words': 'reading',
  'read-daily-life': 'reading',
  'read-academic-passage': 'reading',
  'listen-choose-response': 'listening',
  'listen-conversation': 'listening',
  'listen-announcement': 'listening',
  'listen-academic-talk': 'listening',
  'build-a-sentence': 'writing',
  'write-email': 'writing',
  'write-academic-discussion': 'writing',
  'listen-and-repeat': 'speaking',
  'take-an-interview': 'speaking',
};

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates a stable content fingerprint for duplicate-content detection across packs,
 * catching copy-pasted items even when assigned a different ID.
 */
export function computeQuestionFingerprint(q: AnyQuestion): string {
  switch (q.taskType) {
    case 'complete-the-words':
      return `cw|${normalizeText(q.passageTemplate).slice(0, 220)}`;
    case 'read-daily-life':
    case 'read-academic-passage':
      return `rd|${normalizeText(q.passageTitle)}|${normalizeText(q.question)}`;
    case 'listen-choose-response':
    case 'listen-conversation':
    case 'listen-announcement':
    case 'listen-academic-talk':
      return `ls|${normalizeText(q.script.map((s) => s.text).join(' ')).slice(0, 180)}|${normalizeText(q.question)}`;
    case 'build-a-sentence':
      return `bs|${normalizeText(q.leadIn)}|${normalizeText(q.correctOrder.join(' '))}`;
    case 'write-email':
      return `em|${normalizeText(q.subjectLine)}|${normalizeText(q.scenario).slice(0, 160)}`;
    case 'write-academic-discussion':
      return `ad|${normalizeText(q.courseName)}|${normalizeText(q.professorPrompt).slice(0, 180)}`;
    case 'listen-and-repeat':
      return `lr|${normalizeText(q.targetSentence)}`;
    case 'take-an-interview':
      return `iv|${normalizeText(q.questionPrompt).slice(0, 200)}`;
  }
}

export function computeVocabFingerprint(v: VocabWord): string {
  return `vocab|${normalizeText(v.word)}`;
}

/**
 * Compares two semantic version strings (e.g. "1.2.0" vs "1.1.9").
 * Returns > 0 if a > b, 0 if equal, < 0 if a < b.
 */
export function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da !== db) return da - db;
  }
  return 0;
}

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

function validateQuestionItem(raw: unknown, index: number, packId: string): {
  question?: AnyQuestion;
  errors: PackValidationIssue[];
} {
  const path = `questions[${index}]`;
  const errors: PackValidationIssue[] = [];

  if (!raw || typeof raw !== 'object') {
    errors.push({ severity: 'error', kind: 'schema', path, message: 'Item must be a JSON object.' });
    return { errors };
  }

  const obj = raw as Record<string, unknown>;
  const id = isNonEmptyString(obj.id) ? obj.id.trim() : '';
  if (!id) {
    errors.push({ severity: 'error', kind: 'schema', path: `${path}.id`, message: 'Missing required non-empty string "id".' });
  }

  const taskType = isNonEmptyString(obj.taskType) ? obj.taskType : '';
  const expectedSection = TASK_TO_SECTION[taskType];
  if (!expectedSection) {
    errors.push({
      severity: 'error',
      kind: 'schema',
      itemId: id || undefined,
      path: `${path}.taskType`,
      message: `Unsupported 2026 taskType "${String(obj.taskType)}".`,
    });
  }

  const section = isNonEmptyString(obj.section) ? (obj.section as SectionType) : undefined;
  if (!section || !VALID_SECTIONS.includes(section)) {
    errors.push({
      severity: 'error',
      kind: 'schema',
      itemId: id || undefined,
      path: `${path}.section`,
      message: `Invalid section "${String(obj.section)}". Expected reading, listening, writing, or speaking.`,
    });
  } else if (expectedSection && section !== expectedSection) {
    errors.push({
      severity: 'error',
      kind: 'schema',
      itemId: id || undefined,
      path: `${path}.section`,
      message: `Task type "${taskType}" belongs to section "${expectedSection}", not "${section}".`,
    });
  }

  if (!VALID_DIFFICULTIES.includes(obj.difficulty as DifficultyLevel)) {
    errors.push({
      severity: 'error',
      kind: 'schema',
      itemId: id || undefined,
      path: `${path}.difficulty`,
      message: `Invalid difficulty "${String(obj.difficulty)}". Use Beginner, Intermediate, Advanced, or Expert.`,
    });
  }

  if (!VALID_CEFR.includes(obj.cefr as CEFRLevel)) {
    errors.push({
      severity: 'error',
      kind: 'schema',
      itemId: id || undefined,
      path: `${path}.cefr`,
      message: `Invalid CEFR level "${String(obj.cefr)}".`,
    });
  }

  if (!isNonEmptyString(obj.topic)) {
    errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.topic`, message: 'Missing required "topic".' });
  }
  if (!isNonEmptyString(obj.explanation)) {
    errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.explanation`, message: 'Missing required "explanation".' });
  }

  // Task-specific structural validation
  if (taskType === 'complete-the-words') {
    if (!isNonEmptyString(obj.title)) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.title`, message: 'Complete the Words requires "title".' });
    }
    if (!isNonEmptyString(obj.passageTemplate)) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.passageTemplate`, message: 'Missing "passageTemplate".' });
    }
    if (!Array.isArray(obj.blanks) || obj.blanks.length === 0) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.blanks`, message: 'Must provide at least one blank item.' });
    } else {
      obj.blanks.forEach((b, bIdx) => {
        const blank = b as Record<string, unknown>;
        if (!isNonEmptyString(blank?.blankId) || !isNonEmptyString(blank?.answer)) {
          errors.push({
            severity: 'error',
            kind: 'schema',
            itemId: id || undefined,
            path: `${path}.blanks[${bIdx}]`,
            message: 'Each blank must specify "blankId" and "answer".',
          });
        } else if (isNonEmptyString(obj.passageTemplate) && !obj.passageTemplate.includes(`{{${blank.blankId}}}`)) {
          errors.push({
            severity: 'error',
            kind: 'schema',
            itemId: id || undefined,
            path: `${path}.blanks[${bIdx}]`,
            message: `Placeholder {{${blank.blankId}}} not found in passageTemplate.`,
          });
        }
      });
    }
  } else if (taskType === 'read-daily-life' || taskType === 'read-academic-passage') {
    if (!isNonEmptyString(obj.passageTitle) || !Array.isArray(obj.passageParagraphs) || obj.passageParagraphs.length === 0) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.passageParagraphs`, message: 'Reading passage requires "passageTitle" and non-empty "passageParagraphs".' });
    }
    if (!isNonEmptyString(obj.question)) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.question`, message: 'Missing "question".' });
    }
    if (!Array.isArray(obj.options) || obj.options.length < 2) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.options`, message: 'Must provide at least 2 answer options.' });
    } else if (typeof obj.correctAnswerIndex !== 'number' || obj.correctAnswerIndex < 0 || obj.correctAnswerIndex >= obj.options.length) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.correctAnswerIndex`, message: 'correctAnswerIndex is out of range for options array.' });
    }
  } else if (expectedSection === 'listening') {
    if (!isNonEmptyString(obj.audioId)) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.audioId`, message: 'Listening items must reference a non-empty "audioId".' });
    }
    if (!Array.isArray(obj.script) || obj.script.length === 0) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.script`, message: 'Listening items must contain at least one dialogue script line.' });
    } else {
      obj.script.forEach((line, lIdx) => {
        const l = line as Record<string, unknown>;
        if (!isNonEmptyString(l?.speaker) || !isNonEmptyString(l?.text) || !VALID_VOICE_ROLES.includes(String(l?.voiceRole))) {
          errors.push({
            severity: 'error',
            kind: 'schema',
            itemId: id || undefined,
            path: `${path}.script[${lIdx}]`,
            message: 'Script lines require speaker, text, and a valid voiceRole.',
          });
        }
      });
    }
    if (!isNonEmptyString(obj.question) || !Array.isArray(obj.options) || obj.options.length < 2) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.options`, message: 'Listening item requires question and at least 2 options.' });
    } else if (typeof obj.correctAnswerIndex !== 'number' || obj.correctAnswerIndex < 0 || obj.correctAnswerIndex >= obj.options.length) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.correctAnswerIndex`, message: 'correctAnswerIndex is out of bounds.' });
    }
  } else if (taskType === 'build-a-sentence') {
    if (!isNonEmptyString(obj.leadIn) || !Array.isArray(obj.fragments) || !Array.isArray(obj.correctOrder) || obj.correctOrder.length < 2) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.correctOrder`, message: 'Build a Sentence requires leadIn, fragments, and correctOrder.' });
    } else if (obj.fragments.length !== obj.correctOrder.length) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.fragments`, message: 'fragments and correctOrder must have equal length.' });
    }
  } else if (taskType === 'write-email') {
    if (!isNonEmptyString(obj.title) || !isNonEmptyString(obj.recipient) || !isNonEmptyString(obj.scenario) || !Array.isArray(obj.bulletRequirements) || obj.bulletRequirements.length === 0) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.scenario`, message: 'Write an Email requires title, recipient, scenario, and bulletRequirements.' });
    }
  } else if (taskType === 'write-academic-discussion') {
    if (!isNonEmptyString(obj.courseName) || !isNonEmptyString(obj.professorPrompt) || !Array.isArray(obj.studentResponses) || obj.studentResponses.length === 0) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.professorPrompt`, message: 'Academic Discussion requires courseName, professorPrompt, and studentResponses.' });
    }
  } else if (taskType === 'listen-and-repeat') {
    if (!isNonEmptyString(obj.targetSentence)) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.targetSentence`, message: 'Listen and Repeat requires targetSentence.' });
    }
  } else if (taskType === 'take-an-interview') {
    if (!isNonEmptyString(obj.topicTitle) || !isNonEmptyString(obj.questionPrompt)) {
      errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.questionPrompt`, message: 'Take an Interview requires topicTitle and questionPrompt.' });
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  // Normalize optional metadata defaults safely
  const normalized = {
    ...obj,
    id,
    learningObjective: isNonEmptyString(obj.learningObjective) ? obj.learningObjective : `Practice ${taskType} in ${String(obj.topic)}.`,
    skillFocus: isNonEmptyString(obj.skillFocus) ? obj.skillFocus : 'Academic Comprehension',
    estimatedTimeSec: typeof obj.estimatedTimeSec === 'number' && obj.estimatedTimeSec > 0 ? obj.estimatedTimeSec : 60,
    keywords: Array.isArray(obj.keywords) ? obj.keywords.map(String) : [String(obj.topic)],
    sourceType: 'imported' as const,
    reviewStatus: 'verified' as const,
    scoreWeight: typeof obj.scoreWeight === 'number' && obj.scoreWeight > 0 ? obj.scoreWeight : 1.1,
    packId,
  } as unknown as AnyQuestion;

  return { question: normalized, errors: [] };
}

function validateVocabItem(raw: unknown, index: number, packId: string): {
  vocab?: VocabWord;
  errors: PackValidationIssue[];
} {
  const path = `vocabulary[${index}]`;
  const errors: PackValidationIssue[] = [];

  if (!raw || typeof raw !== 'object') {
    errors.push({ severity: 'error', kind: 'schema', path, message: 'Vocabulary entry must be an object.' });
    return { errors };
  }
  const obj = raw as Record<string, unknown>;
  const id = isNonEmptyString(obj.id) ? obj.id.trim() : '';
  if (!id) {
    errors.push({ severity: 'error', kind: 'schema', path: `${path}.id`, message: 'Missing required vocabulary "id".' });
  }
  if (!isNonEmptyString(obj.word)) {
    errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.word`, message: 'Missing required "word".' });
  }
  if (!isNonEmptyString(obj.definition)) {
    errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.definition`, message: 'Missing required "definition".' });
  }
  if (!isNonEmptyString(obj.example)) {
    errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.example`, message: 'Missing required contextual "example".' });
  }
  if (!VALID_CEFR.includes(obj.cefr as CEFRLevel)) {
    errors.push({ severity: 'error', kind: 'schema', itemId: id || undefined, path: `${path}.cefr`, message: `Invalid CEFR "${String(obj.cefr)}".` });
  }

  if (errors.length > 0) return { errors };

  const cefr = obj.cefr as CEFRLevel;
  const inferredDifficulty: DifficultyLevel =
    VALID_DIFFICULTIES.includes(obj.difficulty as DifficultyLevel)
      ? (obj.difficulty as DifficultyLevel)
      : cefr === 'C2'
      ? 'Expert'
      : cefr === 'C1'
      ? 'Advanced'
      : cefr === 'B1' || cefr === 'A2'
      ? 'Beginner'
      : 'Intermediate';

  return {
    vocab: {
      id,
      word: String(obj.word).trim(),
      phonetic: isNonEmptyString(obj.phonetic) ? obj.phonetic.trim() : '',
      partOfSpeech: isNonEmptyString(obj.partOfSpeech) ? obj.partOfSpeech.trim() : 'term',
      definition: String(obj.definition).trim(),
      example: String(obj.example).trim(),
      synonyms: Array.isArray(obj.synonyms) ? obj.synonyms.map(String) : [],
      antonyms: Array.isArray(obj.antonyms) ? obj.antonyms.map(String) : [],
      topic: isNonEmptyString(obj.topic) ? obj.topic.trim() : 'General Academic',
      cefr,
      difficulty: inferredDifficulty,
      packId,
    },
    errors: [],
  };
}

/**
 * Full pack validator: checks JSON structure, manifest, semver version tracking,
 * per-item TOEFL 2026 schemas, duplicate IDs, and duplicate normalized content.
 */
export function validateQuestionPack(
  parsed: unknown,
  installedPacks: InstalledQuestionPack[]
): PackValidationReport {
  const issues: PackValidationIssue[] = [];

  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      canImportPartial: false,
      manifest: null,
      versionStatus: 'new',
      totalQuestionsInFile: 0,
      validQuestions: [],
      totalVocabInFile: 0,
      validVocabulary: [],
      duplicateIds: [],
      duplicateContentIds: [],
      issues: [{ severity: 'error', kind: 'schema', path: '$', message: 'Root JSON payload must be an object.' }],
    };
  }

  const root = parsed as Record<string, unknown>;
  if (root.schemaVersion !== '1.0') {
    issues.push({
      severity: 'error',
      kind: 'schema',
      path: 'schemaVersion',
      message: `Unsupported or missing schemaVersion "${String(root.schemaVersion)}". Expected "1.0".`,
    });
  }

  const rawManifest = root.manifest as Record<string, unknown> | undefined;
  let manifest: QuestionPackManifest | null = null;

  if (!rawManifest || typeof rawManifest !== 'object') {
    issues.push({ severity: 'error', kind: 'schema', path: 'manifest', message: 'Missing required "manifest" object.' });
  } else {
    const packId = isNonEmptyString(rawManifest.packId) ? rawManifest.packId.trim() : '';
    const name = isNonEmptyString(rawManifest.name) ? rawManifest.name.trim() : '';
    const version = isNonEmptyString(rawManifest.version) ? rawManifest.version.trim() : '';
    if (!packId) issues.push({ severity: 'error', kind: 'schema', path: 'manifest.packId', message: 'Missing manifest.packId.' });
    if (!name) issues.push({ severity: 'error', kind: 'schema', path: 'manifest.name', message: 'Missing manifest.name.' });
    if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
      issues.push({ severity: 'error', kind: 'schema', path: 'manifest.version', message: 'manifest.version must follow semantic versioning (e.g. "1.0.0").' });
    }
    if (packId && name && version) {
      manifest = {
        packId,
        name,
        version,
        description: isNonEmptyString(rawManifest.description) ? rawManifest.description.trim() : 'Imported TOEFL 2026 Question Pack',
        author: isNonEmptyString(rawManifest.author) ? rawManifest.author.trim() : 'External Contributor',
        createdAt: isNonEmptyString(rawManifest.createdAt) ? rawManifest.createdAt.trim() : new Date().toISOString(),
        source: 'imported',
        tags: Array.isArray(rawManifest.tags) ? rawManifest.tags.map(String) : [],
      };
    }
  }

  // Version check against existing packs
  let versionStatus: PackValidationReport['versionStatus'] = 'new';
  let existingVersion: string | undefined;
  const existingSamePack = manifest
    ? installedPacks.find((p) => p.manifest.packId === manifest!.packId)
    : undefined;

  if (existingSamePack && manifest) {
    existingVersion = existingSamePack.manifest.version;
    if (existingSamePack.manifest.source === 'builtin') {
      issues.push({
        severity: 'error',
        kind: 'version',
        path: 'manifest.packId',
        message: `Pack ID "${manifest.packId}" is reserved by a built-in pack. Choose a unique packId.`,
      });
    } else {
      const cmp = compareSemver(manifest.version, existingVersion);
      if (cmp > 0) {
        versionStatus = 'upgrade';
        issues.push({
          severity: 'warning',
          kind: 'version',
          path: 'manifest.version',
          message: `Upgrading installed pack "${manifest.packId}" from v${existingVersion} to v${manifest.version}.`,
        });
      } else {
        versionStatus = 'same-or-older';
        issues.push({
          severity: 'warning',
          kind: 'version',
          path: 'manifest.version',
          message: `Pack "${manifest.packId}" v${existingVersion} is already installed (uploaded v${manifest.version}). Duplicate items will be detected below.`,
        });
      }
    }
  }

  // Build existing ID & content fingerprint lookup from all OTHER packs
  // (if upgrading an imported pack, exclude its previous version so upgrade replaces cleanly)
  const otherPacks =
    versionStatus === 'upgrade' && manifest
      ? installedPacks.filter((p) => p.manifest.packId !== manifest!.packId)
      : installedPacks;

  const existingQuestionIds = new Set<string>();
  const existingQuestionFingerprints = new Map<string, string>();
  const existingVocabIds = new Set<string>();
  const existingVocabFingerprints = new Map<string, string>();

  otherPacks.forEach((pack) => {
    pack.questions.forEach((q) => {
      existingQuestionIds.add(q.id);
      existingQuestionFingerprints.set(computeQuestionFingerprint(q), q.id);
    });
    pack.vocabulary.forEach((v) => {
      existingVocabIds.add(v.id);
      existingVocabFingerprints.set(computeVocabFingerprint(v), v.id);
    });
  });

  const rawQuestions = Array.isArray(root.questions) ? root.questions : [];
  const rawVocab = Array.isArray(root.vocabulary) ? root.vocabulary : [];

  if (rawQuestions.length === 0 && rawVocab.length === 0) {
    issues.push({
      severity: 'error',
      kind: 'schema',
      path: '$',
      message: 'Pack must contain at least one item in "questions" or "vocabulary".',
    });
  }

  const seenFileQIds = new Set<string>();
  const seenFileQFingerprints = new Set<string>();
  const validQuestions: AnyQuestion[] = [];
  const duplicateIds: string[] = [];
  const duplicateContentIds: string[] = [];

  rawQuestions.forEach((item, idx) => {
    const res = validateQuestionItem(item, idx, manifest?.packId || 'imported-pack');
    if (res.errors.length > 0) {
      issues.push(...res.errors);
      return;
    }
    const q = res.question!;
    const fp = computeQuestionFingerprint(q);

    if (seenFileQIds.has(q.id) || existingQuestionIds.has(q.id)) {
      duplicateIds.push(q.id);
      issues.push({
        severity: 'warning',
        kind: 'duplicate-id',
        itemId: q.id,
        path: `questions[${idx}].id`,
        message: seenFileQIds.has(q.id)
          ? `Duplicate ID "${q.id}" appears multiple times inside this JSON file.`
          : `Duplicate ID "${q.id}" already exists in the active question bank.`,
      });
      return;
    }

    if (seenFileQFingerprints.has(fp) || existingQuestionFingerprints.has(fp)) {
      duplicateContentIds.push(q.id);
      const matchedId = existingQuestionFingerprints.get(fp);
      issues.push({
        severity: 'warning',
        kind: 'duplicate-content',
        itemId: q.id,
        path: `questions[${idx}]`,
        message: matchedId
          ? `Duplicate content detected for "${q.id}" — matches existing item "${matchedId}".`
          : `Duplicate content detected for "${q.id}" — matches another item inside this file.`,
      });
      return;
    }

    seenFileQIds.add(q.id);
    seenFileQFingerprints.add(fp);
    validQuestions.push(q);
  });

  const seenFileVIds = new Set<string>();
  const seenFileVFingerprints = new Set<string>();
  const validVocabulary: VocabWord[] = [];

  rawVocab.forEach((item, idx) => {
    const res = validateVocabItem(item, idx, manifest?.packId || 'imported-pack');
    if (res.errors.length > 0) {
      issues.push(...res.errors);
      return;
    }
    const v = res.vocab!;
    const fp = computeVocabFingerprint(v);

    if (seenFileVIds.has(v.id) || existingVocabIds.has(v.id)) {
      duplicateIds.push(v.id);
      issues.push({
        severity: 'warning',
        kind: 'duplicate-id',
        itemId: v.id,
        path: `vocabulary[${idx}].id`,
        message: `Duplicate vocabulary ID "${v.id}" already exists.`,
      });
      return;
    }

    if (seenFileVFingerprints.has(fp) || existingVocabFingerprints.has(fp)) {
      duplicateContentIds.push(v.id);
      const matchedId = existingVocabFingerprints.get(fp);
      issues.push({
        severity: 'warning',
        kind: 'duplicate-content',
        itemId: v.id,
        path: `vocabulary[${idx}].word`,
        message: matchedId
          ? `Duplicate vocabulary word "${v.word}" already exists under ID "${matchedId}".`
          : `Duplicate vocabulary word "${v.word}" appears twice in this file.`,
      });
      return;
    }

    seenFileVIds.add(v.id);
    seenFileVFingerprints.add(fp);
    validVocabulary.push(v);
  });

  const fatalManifestOrSchemaErrors = issues.filter(
    (i) => i.severity === 'error' && (i.path === '$' || i.path === 'schemaVersion' || i.path.startsWith('manifest'))
  );
  const hasAnyError = issues.some((i) => i.severity === 'error');
  const hasImportableItems = validQuestions.length > 0 || validVocabulary.length > 0;

  return {
    valid: !hasAnyError && duplicateIds.length === 0 && duplicateContentIds.length === 0 && hasImportableItems,
    canImportPartial: fatalManifestOrSchemaErrors.length === 0 && manifest !== null && hasImportableItems,
    manifest,
    versionStatus,
    existingVersion,
    totalQuestionsInFile: rawQuestions.length,
    validQuestions,
    totalVocabInFile: rawVocab.length,
    validVocabulary,
    duplicateIds,
    duplicateContentIds,
    issues,
  };
}

/**
 * Generates a clean, valid starter JSON pack template that educators or users
 * can download, populate with unlimited questions/vocabulary, and import without touching code.
 */
export function createSamplePackTemplate(): QuestionPackFile {
  return {
    schemaVersion: '1.0',
    manifest: {
      packId: 'custom-toefl-pack-01',
      name: 'Custom TOEFL 2026 Question Pack',
      version: '1.0.0',
      description: 'Template JSON pack supporting Reading, Listening, Writing, Speaking, and Vocabulary items.',
      author: 'Your Name / Institution',
      createdAt: new Date().toISOString(),
      source: 'imported',
      tags: ['Custom', '2026 Format'],
    },
    questions: [
      {
        id: 'custom-rd-dl-001',
        section: 'reading',
        taskType: 'read-daily-life',
        difficulty: 'Intermediate',
        topic: 'Campus Notice',
        learningObjective: 'Extract key deadline and policy information from a campus email.',
        skillFocus: 'Detail Extraction',
        estimatedTimeSec: 65,
        keywords: ['campus', 'policy', 'deadline'],
        cefr: 'B2',
        sourceType: 'imported',
        reviewStatus: 'verified',
        scoreWeight: 1.1,
        passageId: 'p-custom-001',
        passageTitle: 'Sample Campus Notice Title',
        passageMeta: 'Office of Academic Affairs · Notice',
        passageParagraphs: [
          'Replace this paragraph with your original campus notice, email, schedule, or workplace bulletin.',
          'Include clear facts, dates, or conditional rules so the comprehension question is unambiguous.',
        ],
        question: 'What is the main requirement stated in the notice?',
        options: [
          'Option A (Correct answer matching the text)',
          'Option B (Plausible distractor)',
          'Option C (Plausible distractor)',
          'Option D (Plausible distractor)',
        ],
        correctAnswerIndex: 0,
        explanation: 'Explain clearly why Option A is supported by the text.',
      },
    ],
    vocabulary: [
      {
        id: 'custom-v-001',
        word: 'Verisimilitude',
        phonetic: '/ˌver.ɪ.sɪˈmɪl.ɪ.tjuːd/',
        partOfSpeech: 'noun',
        definition: 'The appearance or quality of being true, authentic, or realistic.',
        example: 'Archival primary sources lend historical verisimilitude to documentary films.',
        synonyms: ['authenticity', 'realism', 'plausibility'],
        antonyms: ['implausibility', 'artificiality'],
        topic: 'Humanities',
        cefr: 'C2',
        difficulty: 'Expert',
      },
    ],
  };
}
