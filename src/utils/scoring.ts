import {
  AdaptiveTier,
  CEFRLevel,
  SpeakingEvaluationResult,
  WritingEvaluationResult,
} from '../types/toefl';

/**
 * Snap any numeric score to the 2026 TOEFL iBT 1.0–6.0 scale in 0.5 increments.
 */
export function snapToBand(raw: number): number {
  const clamped = Math.min(6.0, Math.max(1.0, raw));
  return Math.round(clamped * 2) / 2;
}

/**
 * Compute overall estimated TOEFL iBT (2026) score:
 * Average of the 4 section bands, rounded to nearest 0.5.
 */
export function computeOverallBand(scores: {
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
}): number {
  const avg = (scores.reading + scores.listening + scores.writing + scores.speaking) / 4;
  return snapToBand(avg);
}

/**
 * Convert weighted objective percentage (0..1) + adaptive routing tier into 1.0–6.0 band.
 */
export function objectiveRatioToBand(ratio: number, adaptiveTier: AdaptiveTier = 'Standard'): number {
  const clamped = Math.min(1, Math.max(0, ratio));
  // Adaptive tier adjustment simulates 2026 multistage routing impact
  let base = 1.0 + clamped * 4.5; // 1.0 to 5.5 base
  if (adaptiveTier === 'Upper-Adaptive') {
    base += 0.5 * clamped; // unlocks 5.5 - 6.0 ceiling
  } else if (adaptiveTier === 'Foundation') {
    base = Math.min(4.0, 1.0 + clamped * 3.0);
  }
  return snapToBand(base);
}

/**
 * Educational approximate mapping from 1.0–6.0 band to legacy 0–120 score.
 * Always labeled clearly as an approximate non-official educational conversion.
 */
export function bandToLegacyApprox(band: number): number {
  const table: Record<string, number> = {
    '1.0': 24,
    '1.5': 36,
    '2.0': 46,
    '2.5': 56,
    '3.0': 66,
    '3.5': 76,
    '4.0': 86,
    '4.5': 96,
    '5.0': 106,
    '5.5': 114,
    '6.0': 119,
  };
  return table[snapToBand(band).toFixed(1)] ?? Math.round(20 + (band / 6) * 98);
}

/**
 * Map 1.0–6.0 band to CEFR Level.
 */
export function bandToCEFR(band: number): CEFRLevel {
  if (band >= 6.0) return 'C2';
  if (band >= 5.0) return 'C1';
  if (band >= 4.5) return 'B2+';
  if (band >= 4.0) return 'B2';
  if (band >= 3.0) return 'B1+';
  if (band >= 2.0) return 'B1';
  return 'A2';
}

export function bandToClassification(band: number): string {
  if (band >= 5.5) return 'Distinguished Academic Mastery';
  if (band >= 5.0) return 'Advanced Academic Proficiency';
  if (band >= 4.5) return 'High-Intermediate Academic Proficiency';
  if (band >= 4.0) return 'Upper-Intermediate Academic Proficiency';
  if (band >= 3.0) return 'Intermediate Academic Readiness';
  if (band >= 2.0) return 'Developing Academic Proficiency';
  return 'Foundational English Readiness';
}

export function generateReportId(): string {
  const yr = new Date().getFullYear();
  const rnd = Math.floor(100000 + Math.random() * 900000);
  return `AIPP-${yr}-${rnd}`;
}

export function formatTaskTypeLabel(taskType: string): string {
  const map: Record<string, string> = {
    'complete-the-words': 'Complete the Words',
    'read-daily-life': 'Read in Daily Life',
    'read-academic-passage': 'Read an Academic Passage',
    'listen-choose-response': 'Listen & Choose a Response',
    'listen-conversation': 'Listen to a Conversation',
    'listen-announcement': 'Listen to an Announcement',
    'listen-academic-talk': 'Listen to an Academic Talk',
    'build-a-sentence': 'Build a Sentence',
    'write-email': 'Write an Email',
    'write-academic-discussion': 'Write for an Academic Discussion',
    'listen-and-repeat': 'Listen and Repeat',
    'take-an-interview': 'Take an Interview',
  };
  return map[taskType] || taskType;
}

/**
 * Deterministic analytical Writing rubric evaluator (offline fallback or instant scoring).
 */
export function evaluateWritingLocally(
  taskType: 'write-email' | 'write-academic-discussion',
  responseText: string,
  minWords: number,
  sampleHighScoreResponse: string
): WritingEvaluationResult {
  const cleaned = responseText.trim();
  const words = cleaned ? cleaned.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (wordCount < 10) {
    return {
      bandScore: 1.5,
      criteria: {
        taskFulfillment: 1.5,
        development: 1.0,
        organization: 1.5,
        grammar: 2.0,
        lexicalRange: 1.5,
        accuracy: 2.0,
        cohesion: 1.5,
      },
      summary: 'Response is too brief to fulfill the prompt requirements.',
      strengths: ['Attempted the prompt'],
      weaknesses: [`Far below the recommended minimum length (${minWords} words).`],
      improvements: [
        `Develop a complete response of at least ${minWords} words with clear reasoning and structure.`,
      ],
      improvedExample: sampleHighScoreResponse,
    };
  }

  const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 3);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z']/g, '')).filter(Boolean));
  const lexicalDiversity = uniqueWords.size / Math.max(1, wordCount);
  const longWords = words.filter((w) => w.replace(/[^a-zA-Z]/g, '').length >= 7).length;
  const academicConnectors = [
    'however',
    'moreover',
    'furthermore',
    'although',
    'therefore',
    'consequently',
    'additionally',
    'nevertheless',
    'whereas',
    'regarding',
    'appreciate',
    'specifically',
    'for instance',
    'for example',
    'in addition',
    'while',
  ];
  const lower = cleaned.toLowerCase();
  const connectorHits = academicConnectors.filter((c) => lower.includes(c)).length;

  const lengthFactor = Math.min(1, wordCount / Math.max(60, minWords));
  const hasGreetingOrStructure =
    taskType === 'write-email'
      ? /(dear|hello|hi|dr\.|professor|ms\.|mr\.)/i.test(cleaned) &&
        /(regards|sincerely|thank you|best)/i.test(cleaned)
      : sentences.length >= 4;

  const taskFulfillment = snapToBand(2.0 + lengthFactor * 2.8 + (hasGreetingOrStructure ? 0.7 : 0));
  const development = snapToBand(1.8 + lengthFactor * 3.0 + Math.min(0.8, sentences.length * 0.14));
  const organization = snapToBand(2.2 + (hasGreetingOrStructure ? 1.5 : 0.6) + Math.min(1.8, connectorHits * 0.45));
  const lexicalRange = snapToBand(2.0 + Math.min(2.0, lexicalDiversity * 2.5) + Math.min(1.6, (longWords / Math.max(1, wordCount)) * 7));
  const avgSentLen = wordCount / Math.max(1, sentences.length);
  const grammar = snapToBand(2.4 + (avgSentLen >= 11 && avgSentLen <= 28 ? 1.8 : 1.0) + Math.min(1.2, connectorHits * 0.3));
  const accuracy = snapToBand((grammar + taskFulfillment) / 2);
  const cohesion = snapToBand(2.2 + Math.min(2.6, connectorHits * 0.6) + (cleaned.includes('\n') ? 0.5 : 0.2));

  const bandScore = snapToBand(
    (taskFulfillment + development + organization + grammar + lexicalRange + accuracy + cohesion) / 7
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= minWords) strengths.push(`Met target response length (${wordCount} words) for thorough development.`);
  else {
    weaknesses.push(`Response length (${wordCount} words) is below the ${minWords}-word target.`);
    improvements.push(`Expand your main supporting point with a concrete example to exceed ${minWords} words.`);
  }

  if (connectorHits >= 2) strengths.push('Effective use of academic discourse markers to link ideas smoothly.');
  else {
    weaknesses.push('Limited explicit transition phrases between claims and supporting evidence.');
    improvements.push('Incorporate precise transitions such as "However," "Moreover," or "For instance."');
  }

  if (taskType === 'write-email' && hasGreetingOrStructure) {
    strengths.push('Appropriate professional salutation and courteous sign-off.');
  } else if (taskType === 'write-email') {
    weaknesses.push('Missing standard academic email opening or closing convention.');
    improvements.push('Include a polite greeting ("Dear Dr. ...") and concise sign-off ("Best regards,").');
  }

  if (longWords / Math.max(1, wordCount) >= 0.22) {
    strengths.push('Good range of precise multi-syllable academic vocabulary.');
  } else {
    improvements.push('Upgrade general words with more precise academic verbs and modifiers.');
  }

  return {
    bandScore,
    criteria: {
      taskFulfillment,
      development,
      organization,
      grammar,
      lexicalRange,
      accuracy,
      cohesion,
    },
    summary:
      bandScore >= 5.0
        ? 'Strong, well-organized academic response demonstrating clear task mastery and cohesive flow.'
        : bandScore >= 4.0
        ? 'Competent academic response that addresses the prompt clearly with room for deeper elaboration and lexical precision.'
        : 'Developing response; focus on full task fulfillment, paragraph organization, and stronger transitions.',
    strengths: strengths.length ? strengths : ['Clear central intention aligned with the prompt.'],
    weaknesses: weaknesses.length ? weaknesses : ['Minor refinements in lexical variety can push this to Band 5.5–6.0.'],
    improvements: improvements.length
      ? improvements
      : ['Review the high-scoring model response below to compare syntactic variety and conciseness.'],
    improvedExample: sampleHighScoreResponse,
  };
}

/**
 * Deterministic Speaking rubric evaluator based on captured transcript.
 * Transparently discloses limitations regarding raw acoustic pronunciation analysis.
 */
export function evaluateSpeakingLocally(
  taskType: 'listen-and-repeat' | 'take-an-interview',
  transcript: string,
  targetSentence?: string
): SpeakingEvaluationResult {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9'\s-]/g, '')
      .split(/\s+/)
      .filter(Boolean);

  const spokenWords = clean(transcript);

  if (taskType === 'listen-and-repeat' && targetSentence) {
    const targetWords = clean(targetSentence);
    const spokenSet = new Set(spokenWords);
    const targetSet = new Set(targetWords);

    let matched = 0;
    const omissions: string[] = [];
    for (const w of targetWords) {
      if (spokenSet.has(w)) matched += 1;
      else omissions.push(w);
    }
    const substitutions = spokenWords.filter((w) => !targetSet.has(w));
    const accuracyPct = targetWords.length
      ? Math.round((matched / targetWords.length) * 100)
      : 0;

    const band = snapToBand(1.0 + (accuracyPct / 100) * 5.0);
    return {
      bandScore: band,
      transcript: transcript.trim(),
      wordAccuracyPct: accuracyPct,
      omissions: omissions.slice(0, 6),
      substitutions: substitutions.slice(0, 6),
      criteria: {
        taskFulfillment: band,
        fluency: snapToBand(band - (omissions.length > 3 ? 0.5 : 0)),
        pronunciation: snapToBand(Math.min(5.5, band)),
        intelligibility: band,
        grammar: band,
        vocabulary: band,
        coherence: band,
      },
      summary: `Captured ${accuracyPct}% exact lexical match against the target prompt sentence.`,
      strengths:
        accuracyPct >= 80
          ? ['High lexical fidelity and strong short-term auditory recall.']
          : ['Captured core content words from the spoken prompt.'],
      improvements:
        omissions.length > 0
          ? [`Pay special attention to omitted words: ${omissions.slice(0, 4).join(', ')}.`, 'Practice grouping sentences into 2–3 meaning chunks while listening.']
          : ['Maintain crisp consonant endings and natural sentence stress.'],
      disclosure:
        'Transcript-based analysis: accuracy and omissions are computed from speech-to-text recognition. Fine-grained acoustic pronunciation, intonation, and rhythm estimates are limited without dedicated phonetic audio scoring.',
    };
  }

  // Take an Interview local rubric
  const wc = spokenWords.length;
  const uniqueRatio = new Set(spokenWords).size / Math.max(1, wc);
  const fillerCount = spokenWords.filter((w) => ['um', 'uh', 'like', 'basically'].includes(w)).length;
  const discourseHits = ['because', 'first', 'second', 'example', 'instance', 'however', 'therefore', 'although'].filter(
    (d) => spokenWords.includes(d)
  ).length;

  if (wc < 8) {
    return {
      bandScore: 1.5,
      transcript: transcript.trim() || '(No speech transcript captured)',
      criteria: {
        taskFulfillment: 1.5,
        fluency: 1.5,
        pronunciation: 2.0,
        intelligibility: 2.0,
        grammar: 1.5,
        vocabulary: 1.5,
        coherence: 1.5,
      },
      summary: 'Very brief response captured. Aim for 60–95 spoken words across your 45-second turn.',
      strengths: ['Initiated the speaking turn'],
      improvements: [
        'Use the Answer–Reason–Example structure to speak steadily for the full 45 seconds.',
      ],
      disclosure:
        'Transcript-based analysis: acoustic fluency and pronunciation estimates are limited when evaluated from text transcripts alone.',
    };
  }

  const lengthScore = Math.min(1, wc / 75);
  const taskFulfillment = snapToBand(2.0 + lengthScore * 3.0 + (discourseHits > 0 ? 0.5 : 0));
  const fluency = snapToBand(2.2 + lengthScore * 2.8 - Math.min(1.0, fillerCount * 0.25));
  const vocabulary = snapToBand(2.0 + Math.min(2.2, uniqueRatio * 2.8) + lengthScore * 1.2);
  const coherence = snapToBand(2.0 + Math.min(2.4, discourseHits * 0.8) + lengthScore * 1.1);
  const grammar = snapToBand((taskFulfillment + coherence) / 2);
  const pronunciation = snapToBand(Math.min(5.0, (fluency + grammar) / 2));
  const intelligibility = snapToBand(Math.min(5.5, (pronunciation + coherence) / 2));
  const bandScore = snapToBand(
    (taskFulfillment + fluency + pronunciation + intelligibility + grammar + vocabulary + coherence) / 7
  );

  return {
    bandScore,
    transcript: transcript.trim(),
    criteria: {
      taskFulfillment,
      fluency,
      pronunciation,
      intelligibility,
      grammar,
      vocabulary,
      coherence,
    },
    summary:
      bandScore >= 4.5
        ? `Well-developed interview response (${wc} words) with clear logical progression.`
        : `Relevant response (${wc} words). Expanding concrete examples and transitions will elevate your score.`,
    strengths: [
      wc >= 55 ? 'Strong response length sustaining a complete spoken turn.' : 'Clear direct opening to the prompt.',
      discourseHits >= 2 ? 'Effective verbal signposting ("because", "for example", etc.).' : 'Understandable core message.',
    ],
    improvements: [
      wc < 65 ? 'Aim for 65–95 words over 45 seconds by adding one specific personal or academic example.' : 'Vary sentence openings and integrate higher-precision academic collocations.',
      fillerCount > 2 ? 'Reduce verbal fillers ("um", "like") by pausing silently for half a second between ideas.' : 'Practice projecting clear stress on key contrasting words.',
    ],
    disclosure:
      'Transcript-based analysis: fluency, coherence, and lexical indicators are evaluated from your captured transcript. Raw acoustic pronunciation and prosody estimates are inherently limited.',
  };
}
