import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Database,
  Headphones,
  Layers,
  Mic,
  PenTool,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Target,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnyQuestion, DifficultyLevel, SectionType } from '../types/toefl';
import { countScoredItems } from '../bank/questionBankRegistry';
import {
  getAllQuestions,
  getBankCounts,
  getBankItemCounts,
  getPracticePacks,
} from '../utils/questionEngine';
import { formatTaskTypeLabel } from '../utils/scoring';
import { ListeningTaskView } from '../components/exam/ListeningTaskView';
import { ReadingTaskView } from '../components/exam/ReadingTaskView';
import { SpeakingTaskView } from '../components/exam/SpeakingTaskView';
import { WritingTaskView } from '../components/exam/WritingTaskView';

const PAGE_SIZE = 18;

function getQuestionDisplayTitle(q: AnyQuestion): string {
  if ('passageTitle' in q) return q.passageTitle;
  if ('title' in q) return q.title;
  if ('topicTitle' in q) return q.topicTitle;
  if ('courseName' in q) return q.courseName;
  return q.topic;
}

function matchesQuestionQuery(item: AnyQuestion, queryLower: string): boolean {
  if (!queryLower) return true;
  const title = getQuestionDisplayTitle(item);
  const taskLabel = formatTaskTypeLabel(item.taskType);
  const hay = `${title} ${item.topic} ${item.skillFocus} ${item.taskType} ${taskLabel} ${item.difficulty} ${item.cefr} ${item.learningObjective} ${item.keywords.join(' ')}`.toLowerCase();
  return hay.includes(queryLower);
}

export const PracticeCenterPage: React.FC = () => {
  const { bankRevision } = useApp();
  const navigate = useNavigate();

  const [sectionFilter, setSectionFilter] = useState<'all' | SectionType>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | DifficultyLevel>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeQuestion, setActiveQuestion] = useState<AnyQuestion | null>(null);
  const [quickAnswer, setQuickAnswer] = useState<unknown>(null);

  const allQuestions = useMemo(() => {
    void bankRevision;
    return getAllQuestions();
  }, [bankRevision]);

  const counts = useMemo(() => {
    void bankRevision;
    return getBankCounts();
  }, [bankRevision]);

  const itemCounts = useMemo(() => {
    void bankRevision;
    return getBankItemCounts();
  }, [bankRevision]);

  const practicePacks = useMemo(() => {
    void bankRevision;
    return getPracticePacks();
  }, [bankRevision]);

  const normalizedSearch = search.trim().toLowerCase();
  const hasActiveFilters =
    sectionFilter !== 'all' || difficultyFilter !== 'all' || normalizedSearch.length > 0;

  // Questions filtered by difficulty + search (used for dynamic section tab counts)
  const filteredWithoutSection = useMemo(() => {
    return allQuestions.filter((item) => {
      if (difficultyFilter !== 'all' && item.difficulty !== difficultyFilter) return false;
      return matchesQuestionQuery(item, normalizedSearch);
    });
  }, [allQuestions, difficultyFilter, normalizedSearch]);

  const tabCounts = useMemo(() => {
    const res = { total: 0, reading: 0, listening: 0, writing: 0, speaking: 0 };
    filteredWithoutSection.forEach((item) => {
      res.total += 1;
      res[item.section] += 1;
    });
    return res;
  }, [filteredWithoutSection]);

  const filtered = useMemo(() => {
    if (sectionFilter === 'all') return filteredWithoutSection;
    return filteredWithoutSection.filter((item) => item.section === sectionFilter);
  }, [filteredWithoutSection, sectionFilter]);

  const filteredPacks = useMemo(() => {
    return practicePacks
      .filter((p) => sectionFilter === 'all' || p.section === sectionFilter)
      .map((pack) => {
        const packMatches = filtered.filter(
          (q) => q.section === pack.section && pack.taskTypes.includes(q.taskType)
        );
        const packMetaMatches =
          normalizedSearch.length > 0 &&
          `${pack.title} ${pack.description} ${pack.section}`
            .toLowerCase()
            .includes(normalizedSearch);

        // If user searched by pack name (e.g., "Academic Lectures"), keep full difficulty-matched pool for that pack
        const effectivePool =
          packMatches.length > 0
            ? packMatches
            : packMetaMatches
              ? allQuestions.filter(
                (q) =>
                  q.section === pack.section &&
                  pack.taskTypes.includes(q.taskType) &&
                  (difficultyFilter === 'all' || q.difficulty === difficultyFilter)
              )
              : [];

        const matchedScoredItems = effectivePool.reduce((sum, q) => sum + countScoredItems(q), 0);
        return {
          ...pack,
          matchedQuestionCount: effectivePool.length,
          matchedScoredItemCount: matchedScoredItems,
          matchedByPackTitleOnly: packMatches.length === 0 && packMetaMatches,
        };
      })
      .filter((pack) => pack.matchedQuestionCount > 0);
  }, [practicePacks, sectionFilter, filtered, normalizedSearch, allQuestions, difficultyFilter]);

  useEffect(() => {
    setPage(1);
  }, [sectionFilter, difficultyFilter, search, bankRevision]);

  const resetFilters = () => {
    setSectionFilter('all');
    setDifficultyFilter('all');
    setSearch('');
    setPage(1);
  };

  const buildPackLaunchUrl = (packId: string, passSearch: boolean) => {
    const params = new URLSearchParams({ pack: packId });
    if (difficultyFilter !== 'all') {
      params.set('difficulty', difficultyFilter);
    }
    if (passSearch && search.trim()) {
      params.set('q', search.trim());
    }
    return `/section-practice?${params.toString()}`;
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedQuestions = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const sectionIcon = (sec: SectionType) => {
    switch (sec) {
      case 'reading':
        return <BookOpen className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />;
      case 'listening':
        return <Headphones className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />;
      case 'writing':
        return <PenTool className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />;
      case 'speaking':
        return <Mic className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#1D4ED8] dark:text-cyan-400 tabular-nums">
            Active 2026 Question Bank · {itemCounts.total} Scored Items ({counts.total} Sets: R{' '}
            {itemCounts.reading} · L {itemCounts.listening} · W {itemCounts.writing} · S{' '}
            {itemCounts.speaking})
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Practice Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Launch targeted weakness drills, focused task packs, or practice any individual item
            below with instant built-in explanations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/simulation?mode=adaptive-full')}
          className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-semibold shrink-0 self-start sm:self-auto transition-colors"
        >
          10-Mode Test Generator
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Smart Practice & Expansion Quick Launchers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => navigate('/simulation?mode=weakness-based')}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-[#1D4ED8] p-4 text-left space-y-1.5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <Target className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Weakness-Based Practice
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Auto-assembled from your lowest-accuracy 2026 task types.
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/simulation?mode=mistake-review')}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-[#1D4ED8] p-4 text-left space-y-1.5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <RotateCcw className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Mistake Review Drill
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Retry missed items from your recent simulations in one focused set.
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/simulation?mode=custom')}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-[#1D4ED8] p-4 text-left space-y-1.5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <SlidersHorizontal className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Custom Practice Builder
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Choose exact sections, task types, difficulty tiers, and topics.
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/question-bank')}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-[#1D4ED8] p-4 text-left space-y-1.5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <Database className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Question Bank &amp; Packs
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Inspect bank coverage and import new JSON question packs anytime.
          </div>
        </button>
      </div>

      {/* Inline Active Question Sandbox */}
      {activeQuestion && (
        <div className="rounded-2xl border border-[#1D4ED8]/50 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400 truncate">
              Single-Item Practice · {formatTaskTypeLabel(activeQuestion.taskType)} ·{' '}
              {activeQuestion.topic}
            </div>
            <button
              type="button"
              onClick={() => setActiveQuestion(null)}
              className="inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>

          {activeQuestion.section === 'reading' && (
            <ReadingTaskView
              question={activeQuestion}
              mode="practice"
              answer={quickAnswer}
              onChangeAnswer={setQuickAnswer}
              bookmarked={false}
              onToggleBookmark={() => { }}
              note=""
              onChangeNote={() => { }}
              highlights={[]}
              onAddHighlight={() => { }}
              onRemoveHighlight={() => { }}
            />
          )}
          {activeQuestion.section === 'listening' && (
            <ListeningTaskView
              question={activeQuestion}
              mode="practice"
              answer={quickAnswer}
              onChangeAnswer={setQuickAnswer}
              bookmarked={false}
              onToggleBookmark={() => { }}
            />
          )}
          {activeQuestion.section === 'writing' && (
            <WritingTaskView
              question={activeQuestion}
              mode="practice"
              answer={quickAnswer}
              onChangeAnswer={setQuickAnswer}
            />
          )}
          {activeQuestion.section === 'speaking' && (
            <SpeakingTaskView
              question={activeQuestion}
              mode="practice"
              answer={quickAnswer}
              onChangeAnswer={setQuickAnswer}
            />
          )}
        </div>
      )}

      {/* Mobile-Scrollable Section Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/75 dark:bg-slate-800/80 overflow-x-auto no-scrollbar">
            {(
              [
                { key: 'all', label: `All (${tabCounts.total})` },
                { key: 'reading', label: `Reading (${tabCounts.reading})` },
                { key: 'listening', label: `Listening (${tabCounts.listening})` },
                { key: 'writing', label: `Writing (${tabCounts.writing})` },
                { key: 'speaking', label: `Speaking (${tabCounts.speaking})` },
              ] as const
            ).map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setSectionFilter(sec.key)}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-colors tabular-nums whitespace-nowrap shrink-0 ${sectionFilter === sec.key
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as 'all' | DifficultyLevel)}
              aria-label="Filter by difficulty"
              className="min-h-[42px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              <option value="all">All Difficulty Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>

            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, topic, or skill..."
                className="w-full min-h-[42px] pl-9 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Feedback Strip */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 px-4 py-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-700 dark:text-slate-200 tabular-nums">
              <span className="font-semibold text-[#1D4ED8] dark:text-cyan-400">
                {filtered.length} matching exercises
              </span>
              <span className="text-slate-400">·</span>
              <span>{filteredPacks.length} matching packs</span>
              {difficultyFilter !== 'all' && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium">Difficulty: {difficultyFilter}</span>
                </>
              )}
              {search.trim() && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium">Query: &ldquo;{search.trim()}&rdquo;</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {filtered.length > 0 && (
                <a
                  href="#exercise-library"
                  className="font-semibold text-[#1D4ED8] dark:text-cyan-400 hover:underline"
                >
                  View Exercises ↓
                </a>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 1: One-Click Focused Drill Packs */}
      {filteredPacks.length > 0 && (
        <section className="space-y-3.5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />
              Focused Practice Packs
              {difficultyFilter !== 'all' && (
                <span className="text-xs font-medium text-[#1D4ED8] dark:text-cyan-400">
                  · {difficultyFilter} Only
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Curated multi-question sets grouped by 2026 TOEFL task type, complete with hints,
              instant checks, and scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPacks.map((pack) => (
              <div
                key={pack.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {sectionIcon(pack.section)}
                      {pack.section}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" /> {pack.estimatedMinutes}m ·{' '}
                      {pack.matchedScoredItemCount} items
                    </span>
                  </div>
                  <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
                    {pack.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(buildPackLaunchUrl(pack.id, !pack.matchedByPackTitleOnly))
                  }
                  className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-3.5 rounded-lg bg-[#0B1733] dark:bg-[#1D4ED8] hover:bg-[#132652] dark:hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Drill ({Math.min(12, pack.matchedQuestionCount)} of{' '}
                  {pack.matchedQuestionCount}{' '}
                  {difficultyFilter !== 'all' ? `${difficultyFilter} Sets` : 'Sets'})
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Step 2: Individual Exercise Library (Paginated) */}
      <section id="exercise-library" className="space-y-3.5 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              Individual Exercise Library ({filtered.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Select any item to practice immediately with model answers and structured explanations.
            </p>
          </div>
          {totalPages > 1 && (
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-8 text-center space-y-3">
            <div className="font-display text-base font-bold text-slate-900 dark:text-white">
              No exercises match your current filter
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Try a broader keyword (such as &ldquo;Astronomy&rdquo;, &ldquo;Campus&rdquo;,
              &ldquo;Email&rdquo;, or &ldquo;Inference&rdquo;) or switch back to All Difficulty
              Levels.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedQuestions.map((q) => {
              const title = getQuestionDisplayTitle(q);

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 capitalize">
                        {sectionIcon(q.section)}
                        {q.section}
                      </span>
                      <span className="tabular-nums">
                        {q.difficulty} · CEFR {q.cefr}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {title}
                    </h3>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTaskTypeLabel(q.taskType)} · {q.topic} · {q.skillFocus}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {q.learningObjective}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      ~{Math.max(1, Math.round(q.estimatedTimeSec / 60))} min
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuestion(q);
                        setQuickAnswer(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#1D4ED8] hover:bg-blue-50/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors"
                    >
                      Try This Item
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} exercises
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
      </section>
    </div>
  );
};
