import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  RefreshCw,
  RotateCw,
  Search,
  Star,
  Volume2,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { getActiveVocabulary } from '../bank/questionBankRegistry';
import { DifficultyLevel, VocabWord } from '../types/toefl';
import { audioController } from '../utils/audio';
import { useShouldReduceMotion } from '../components/ui/MotionPrimitives';

type VocabTab = 'explore' | 'flashcards' | 'quiz';

const VOCAB_PAGE_SIZE = 24;

function resolveDifficulty(w: VocabWord): DifficultyLevel {
  if (w.difficulty) return w.difficulty;
  if (w.cefr === 'C2') return 'Expert';
  if (w.cefr === 'C1') return 'Advanced';
  if (w.cefr === 'B1' || w.cefr === 'A2') return 'Beginner';
  return 'Intermediate';
}

export const VocabularyPage: React.FC = () => {
  const { state, bankRevision, reviewVocabWord, toggleVocabFlag } = useApp();
  const reduceMotion = useShouldReduceMotion();
  const [tab, setTab] = useState<VocabTab>('explore');
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'due' | 'favorites' | 'mastered' | 'difficult'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | DifficultyLevel>('all');
  const [page, setPage] = useState(1);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Quiz state
  const [quizSeed, setQuizSeed] = useState(1);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const activeVocabulary = useMemo(() => {
    void bankRevision;
    return getActiveVocabulary();
  }, [bankRevision]);

  const now = new Date();
  const nowMs = now.getTime();
  const localEpochDay = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000
  );
  const todayLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const wordOfTheDay =
    activeVocabulary[localEpochDay % Math.max(1, activeVocabulary.length)];

  const stats = useMemo(() => {
    const activeIds = new Set(activeVocabulary.map((w) => w.id));
    const vals = Object.entries(state.vocabProgress)
      .filter(([id]) => activeIds.has(id))
      .map(([, v]) => v);
    const mastered = vals.filter((v) => v.status === 'mastered').length;
    const difficult = vals.filter((v) => v.status === 'difficult').length;
    const due = activeVocabulary.filter((w) => {
      const p = state.vocabProgress[w.id];
      return !p || new Date(p.nextReviewAt).getTime() <= nowMs;
    }).length;
    return { mastered, difficult, due, total: activeVocabulary.length };
  }, [activeVocabulary, state.vocabProgress, nowMs]);

  const filteredWords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeVocabulary.filter((w) => {
      const p = state.vocabProgress[w.id];
      if (filterMode === 'favorites' && !p?.favorite) return false;
      if (filterMode === 'mastered' && p?.status !== 'mastered') return false;
      if (filterMode === 'difficult' && p?.status !== 'difficult') return false;
      if (filterMode === 'due' && p && new Date(p.nextReviewAt).getTime() > nowMs) return false;
      if (difficultyFilter !== 'all' && resolveDifficulty(w) !== difficultyFilter) return false;
      if (q) {
        const hay = `${w.word} ${w.definition} ${w.topic} ${w.synonyms.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeVocabulary, search, filterMode, difficultyFilter, state.vocabProgress, nowMs]);

  useEffect(() => {
    setPage(1);
  }, [search, filterMode, difficultyFilter, bankRevision]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / VOCAB_PAGE_SIZE));
  const paginatedWords = useMemo(() => {
    const start = (page - 1) * VOCAB_PAGE_SIZE;
    return filteredWords.slice(start, start + VOCAB_PAGE_SIZE);
  }, [filteredWords, page]);

  // Flashcard due queue
  const reviewQueue = useMemo(() => {
    const due = activeVocabulary.filter((w) => {
      const p = state.vocabProgress[w.id];
      return !p || new Date(p.nextReviewAt).getTime() <= nowMs;
    });
    return due.length > 0 ? due : activeVocabulary;
  }, [activeVocabulary, state.vocabProgress, nowMs]);

  const currentCard = reviewQueue[cardIndex % Math.max(1, reviewQueue.length)];

  // Dynamic 10-word Quiz drawn across the full active vocabulary bank
  const quizItems = useMemo(() => {
    if (activeVocabulary.length === 0) return [];
    const pool = [...activeVocabulary];
    // Deterministic seeded shuffle from quizSeed
    let s = quizSeed * 2654435761;
    const nextRand = () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const chosen = pool.slice(0, Math.min(10, pool.length));
    return chosen.map((w, idx) => {
      const others = pool.filter((o) => o.id !== w.id);
      const start = (idx * 7) % Math.max(1, others.length - 3);
      const distractors = others.slice(start, start + 3).map((o) => o.definition);
      const opts = [w.definition, ...distractors].sort((a, b) => a.localeCompare(b));
      return { word: w, options: opts };
    });
  }, [activeVocabulary, quizSeed]);

  const activeQuiz = quizItems[quizIndex % Math.max(1, quizItems.length)];

  const handleRateCard = (quality: 1 | 3 | 4 | 5) => {
    if (!currentCard) return;
    reviewVocabWord(currentCard.id, quality);
    setFlipped(false);
    setCardIndex((i) => (i + 1) % Math.max(1, reviewQueue.length));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#1D4ED8] dark:text-cyan-400 tabular-nums">
            SM-2 Spaced Repetition System · {stats.total} Active Academic TOEFL Terms
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Vocabulary Builder
          </h1>
        </div>

        <div className="inline-flex p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 self-start">
          {(
            [
              { id: 'explore', label: 'Lexicon' },
              { id: 'flashcards', label: 'SM-2 Flashcards' },
              { id: 'quiz', label: 'Quiz Mode' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Word of the Day + Mastery KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {wordOfTheDay && (
          <div className="lg:col-span-7 rounded-xl bg-[#0B1733] text-white p-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-cyan-300">
              <span className="font-semibold">
                Word of the Day · {todayLabel} · CEFR {wordOfTheDay.cefr}
              </span>
              <span>{wordOfTheDay.topic}</span>
            </div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold">{wordOfTheDay.word}</h2>
            <span className="font-mono text-xs text-slate-300">{wordOfTheDay.phonetic}</span>
            <span className="text-xs italic text-cyan-200">{wordOfTheDay.partOfSpeech}</span>
            <button
              type="button"
              onClick={() => audioController.speakWord(wordOfTheDay.word)}
              aria-label={`Pronounce ${wordOfTheDay.word}`}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white ml-auto"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-200">{wordOfTheDay.definition}</p>
          <p className="text-xs text-slate-300 italic">“{wordOfTheDay.example}”</p>
            <div className="text-xs text-slate-400 pt-1">
              Synonyms: <span className="text-slate-200">{wordOfTheDay.synonyms.join(', ')}</span> ·
              Antonyms: <span className="text-slate-200">{wordOfTheDay.antonyms.join(', ')}</span>
            </div>
          </div>
        )}

        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="text-xs text-slate-500">Due for Review</div>
            <div className="font-display text-2xl font-bold text-[#1D4ED8] dark:text-cyan-400 tabular-nums mt-1">
              {stats.due}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">SM-2 scheduled</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="text-xs text-slate-500">Mastered Words</div>
            <div className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
              {stats.mastered}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">of {stats.total} academic terms</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="text-xs text-slate-500">Marked Difficult</div>
            <div className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-1">
              {stats.difficult}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Priority repetition</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="text-xs text-slate-500">Mastery Rate</div>
            <div className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
              {Math.round((stats.mastered / Math.max(1, stats.total)) * 100)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Active recall score</div>
          </div>
        </div>
      </div>

      {/* TAB 1: EXPLORE LEXICON */}
      {tab === 'explore' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/75 dark:bg-slate-800/80 overflow-x-auto no-scrollbar">
              {(['all', 'due', 'favorites', 'difficult', 'mastered'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFilterMode(m)}
                  className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap shrink-0 transition-colors ${
                    filterMode === m
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as 'all' | DifficultyLevel)}
                aria-label="Filter vocabulary by difficulty"
                className="min-h-[42px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Difficulty Tiers</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>

              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search word or definition..."
                  className="w-full min-h-[42px] pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span>
              Showing {filteredWords.length === 0 ? 0 : (page - 1) * VOCAB_PAGE_SIZE + 1}–
              {Math.min(page * VOCAB_PAGE_SIZE, filteredWords.length)} of {filteredWords.length}{' '}
              entries
            </span>
            {totalPages > 1 && (
              <span className="font-mono">
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedWords.map((w) => {
              const p = state.vocabProgress[w.id];
              const diff = resolveDifficulty(w);
              return (
                <div
                  key={w.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                          {w.word}
                        </h3>
                        <span className="font-mono text-xs text-slate-400">{w.phonetic}</span>
                        <span className="text-xs italic text-slate-500">{w.partOfSpeech}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {w.topic} · {diff} · CEFR {w.cefr} · Status: {p?.status || 'new'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => audioController.speakWord(w.word)}
                        aria-label={`Pronounce ${w.word}`}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleVocabFlag(w.id, 'favorite')}
                        aria-label="Toggle favorite"
                        className={`p-1.5 rounded-md ${
                          p?.favorite ? 'text-amber-500' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <Star className="w-4 h-4" fill={p?.favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleVocabFlag(w.id, 'saved')}
                        aria-label="Save word"
                        className={`p-1.5 rounded-md ${
                          p?.saved ? 'text-[#1D4ED8] dark:text-cyan-400' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" fill={p?.saved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {w.definition}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">“{w.example}”</p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 truncate">Syn: {w.synonyms.join(', ')}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => reviewVocabWord(w.id, 1)}
                        className="text-amber-600 hover:underline font-medium"
                      >
                        Mark Difficult
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewVocabWord(w.id, 5)}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      >
                        Mark Learned
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SM-2 SPACED REPETITION FLASHCARDS */}
      {tab === 'flashcards' && currentCard && (
        <div className="max-w-xl mx-auto space-y-4 py-2">
          <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
            <span>
              Card {(cardIndex % reviewQueue.length) + 1} of {reviewQueue.length}
            </span>
            <span>SM-2 Ease Factor: {(state.vocabProgress[currentCard.id]?.easeFactor || 2.5).toFixed(2)}</span>
          </div>

          <div
            onClick={() => setFlipped((f) => !f)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
            className="min-h-[270px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 p-6 sm:p-8 flex flex-col justify-between cursor-pointer hover:border-[#1D4ED8] transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{currentCard.topic} · CEFR {currentCard.cefr}</span>
              <span className="inline-flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Tap to flip
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!flipped ? (
                <motion.div
                  key={`front-${currentCard.id}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center space-y-2 py-7"
                >
                  <div className="font-display text-3xl font-extrabold text-[#0B1733] dark:text-white">
                    {currentCard.word}
                  </div>
                  <div className="font-mono text-sm text-slate-500">
                    {currentCard.phonetic} · {currentCard.partOfSpeech}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioController.speakWord(currentCard.word);
                    }}
                    className="inline-flex items-center gap-1.5 mt-3 min-h-[38px] px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Listen
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`back-${currentCard.id}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3 py-4"
                >
                  <div className="text-base font-semibold text-slate-900 dark:text-white">
                    {currentCard.definition}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                    “{currentCard.example}”
                  </p>
                  <div className="text-xs text-slate-500 pt-2">
                    <strong>Synonyms:</strong> {currentCard.synonyms.join(', ')} ·{' '}
                    <strong>Antonyms:</strong> {currentCard.antonyms.join(', ')}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center text-[11px] text-slate-400">
              {flipped ? 'Rate recall below to schedule next SM-2 review interval' : 'Recall definition before flipping'}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => handleRateCard(1)}
              className="min-h-[44px] rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors hover:bg-rose-100 dark:hover:bg-rose-950/50"
            >
              Again (1d)
            </button>
            <button
              type="button"
              onClick={() => handleRateCard(3)}
              className="min-h-[44px] rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors hover:bg-amber-100 dark:hover:bg-amber-950/50"
            >
              Hard
            </button>
            <button
              type="button"
              onClick={() => handleRateCard(4)}
              className="min-h-[44px] rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 text-xs font-semibold transition-colors hover:bg-blue-100 dark:hover:bg-blue-950/50"
            >
              Good
            </button>
            <button
              type="button"
              onClick={() => handleRateCard(5)}
              className="min-h-[44px] rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
            >
              Easy
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: QUIZ MODE */}
      {tab === 'quiz' && activeQuiz && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 tabular-nums">
            <span>
              Question {(quizIndex % quizItems.length) + 1} of {quizItems.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 dark:text-white">
                Score: {quizScore}
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuizSeed((s) => s + 1);
                  setQuizIndex(0);
                  setQuizChoice(null);
                  setQuizScore(0);
                }}
                className="inline-flex items-center gap-1 text-[#1D4ED8] dark:text-cyan-400 font-semibold hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New 10-Word Quiz
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-blue-700 dark:text-cyan-400 font-semibold">
              Select the best academic definition for:
            </div>
            <div className="flex items-center gap-3">
              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {activeQuiz.word.word}
              </h3>
              <span className="font-mono text-xs text-slate-400">{activeQuiz.word.phonetic}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {activeQuiz.options.map((opt) => {
              const picked = quizChoice === opt;
              const isCorrect = opt === activeQuiz.word.definition;
              let cls =
                'border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-800 dark:text-slate-100';
              if (quizChoice) {
                if (isCorrect)
                  cls =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200';
                else if (picked)
                  cls = 'border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-900 dark:text-rose-200';
              }
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(quizChoice)}
                  onClick={() => {
                    setQuizChoice(opt);
                    if (isCorrect) {
                      setQuizScore((s) => s + 1);
                      reviewVocabWord(activeQuiz.word.id, 4);
                    } else {
                      reviewVocabWord(activeQuiz.word.id, 1);
                    }
                  }}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm flex items-center justify-between gap-3 transition-colors ${cls}`}
                >
                  <span>{opt}</span>
                  {quizChoice && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {quizChoice && picked && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {quizChoice && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 italic">“{activeQuiz.word.example}”</span>
              <button
                type="button"
                onClick={() => {
                  setQuizChoice(null);
                  setQuizIndex((i) => i + 1);
                }}
                className="px-4 py-2 rounded-lg bg-[#1D4ED8] text-white text-xs font-semibold shrink-0"
              >
                Next Word
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
