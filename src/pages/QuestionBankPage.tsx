import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  Headphones,
  Layers,
  Mic,
  PenTool,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createSamplePackTemplate } from '../bank/packValidator';
import {
  OFFICIAL_SAMPLE_PACK_URLS,
  commitValidatedPack,
  countScoredItems,
  exportActiveBankAsJson,
  getDetailedBankStats,
  getInstalledPacks,
  removeImportedPack,
  togglePackEnabled,
  validatePackFromJsonText,
} from '../bank/questionBankRegistry';
import { AnyTaskType, DifficultyLevel, PackValidationReport } from '../types/toefl';
import { formatTaskTypeLabel } from '../utils/scoring';
import { AnimatedProgressBar } from '../components/ui/MotionPrimitives';

const TASK_TYPE_ORDER: Array<{ key: AnyTaskType; section: string }> = [
  { key: 'complete-the-words', section: 'Reading' },
  { key: 'read-daily-life', section: 'Reading' },
  { key: 'read-academic-passage', section: 'Reading' },
  { key: 'listen-choose-response', section: 'Listening' },
  { key: 'listen-conversation', section: 'Listening' },
  { key: 'listen-announcement', section: 'Listening' },
  { key: 'listen-academic-talk', section: 'Listening' },
  { key: 'build-a-sentence', section: 'Writing' },
  { key: 'write-email', section: 'Writing' },
  { key: 'write-academic-discussion', section: 'Writing' },
  { key: 'listen-and-repeat', section: 'Speaking' },
  { key: 'take-an-interview', section: 'Speaking' },
];

const DIFFICULTIES: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const QuestionBankPage: React.FC = () => {
  const { bankRevision } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rawJsonInput, setRawJsonInput] = useState('');
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationReport, setValidationReport] = useState<PackValidationReport | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [showPasteBox, setShowPasteBox] = useState(false);

  const stats = useMemo(() => {
    void bankRevision;
    return getDetailedBankStats();
  }, [bankRevision]);

  const installedPacks = useMemo(() => {
    void bankRevision;
    return getInstalledPacks();
  }, [bankRevision]);

  const coverageRows = [
    {
      label: 'Reading Items',
      current: stats.bySectionScoredItems.reading,
      subLabel: `${stats.bySectionExercises.reading} exercises (incl. multi-blank sets)`,
      target: stats.targets.readingItems,
      icon: BookOpen,
      barClass: 'bg-[#1D4ED8] dark:bg-cyan-400',
    },
    {
      label: 'Listening Items',
      current: stats.bySectionScoredItems.listening,
      subLabel: `${stats.bySectionExercises.listening} audio-referenced items`,
      target: stats.targets.listeningItems,
      icon: Headphones,
      barClass: 'bg-cyan-600 dark:bg-cyan-400',
    },
    {
      label: 'Writing Prompts',
      current: stats.bySectionScoredItems.writing,
      subLabel: `${stats.bySectionExercises.writing} syntax, email & discussion tasks`,
      target: stats.targets.writingItems,
      icon: PenTool,
      barClass: 'bg-indigo-600 dark:bg-indigo-400',
    },
    {
      label: 'Speaking Prompts',
      current: stats.bySectionScoredItems.speaking,
      subLabel: `${stats.bySectionExercises.speaking} repeat & interview prompts`,
      target: stats.targets.speakingItems,
      icon: Mic,
      barClass: 'bg-amber-600 dark:bg-amber-400',
    },
    {
      label: 'Academic Vocabulary',
      current: stats.totalVocabulary,
      subLabel: 'Definitions, IPA, examples & synonyms',
      target: stats.targets.vocabularyEntries,
      icon: Layers,
      barClass: 'bg-emerald-600 dark:bg-emerald-400',
    },
  ];

  const runValidation = (jsonText: string, fileLabel?: string) => {
    setStatusMessage(null);
    setParseError(null);
    setValidationReport(null);
    if (fileLabel) setSourceFileName(fileLabel);

    const res = validatePackFromJsonText(jsonText);
    if (res.parseError) {
      setParseError(res.parseError);
      return;
    }
    if (res.report) {
      setValidationReport(res.report);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      setRawJsonInput(content);
      runValidation(content, file.name);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadOfficialSample = async (sample: (typeof OFFICIAL_SAMPLE_PACK_URLS)[number]) => {
    setLoadingSampleId(sample.id);
    setStatusMessage(null);
    try {
      const res = await fetch(sample.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setRawJsonInput(text);
      runValidation(text, `${sample.id}.json`);
    } catch (err) {
      setParseError(
        err instanceof Error
          ? `Could not fetch official sample pack: ${err.message}`
          : 'Could not load sample pack.'
      );
    } finally {
      setLoadingSampleId(null);
    }
  };

  const handleCommitPack = () => {
    if (!validationReport) return;
    const result = commitValidatedPack(validationReport);
    if (!result.ok) {
      setStatusMessage({ type: 'error', text: result.error || 'Import failed.' });
      return;
    }
    setStatusMessage({
      type: 'success',
      text: `Installed "${validationReport.manifest?.name}" v${validationReport.manifest?.version}: added ${result.importedQuestions} exercises and ${result.importedVocab} vocabulary entries to your active bank.`,
    });
    setValidationReport(null);
    setRawJsonInput('');
    setSourceFileName(null);
  };

  const downloadJsonFile = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    downloadJsonFile(createSamplePackTemplate(), 'aipp-toefl-pack-template-v1.json');
  };

  const handleExportActiveBank = () => {
    const snapshot = exportActiveBankAsJson();
    downloadJsonFile(snapshot, `${snapshot.manifest.packId}.json`);
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#1D4ED8] dark:text-cyan-400 tabular-nums">
            Expandable JSON Question Bank · {stats.activePackCount} Active Packs ·{' '}
            {stats.totalScoredItems} Scored Items · {stats.totalVocabulary} Vocabulary Entries
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Question Bank &amp; Content Packs
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Monitor active TOEFL 2026 coverage across all four skills and expand your bank at any
            time by importing validated JSON question packs — no code edits required.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5" />
            JSON Template
          </button>
          <button
            type="button"
            onClick={handleExportActiveBank}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Active Bank
          </button>
          <button
            type="button"
            onClick={() => navigate('/simulation?mode=adaptive-full')}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors"
          >
            Launch Full Test
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Coverage Against Long-Term Institutional Targets */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />
              Active Bank Coverage vs. Long-Term Expansion Targets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Built-in packs provide a full ~120-item 2026 TOEFL simulation plus varied drills out
              of the box. Import JSON packs below to scale toward 500/500/300/300/1,000 items.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
            Schema v1.0 · Duplicate-Protected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {coverageRows.map((row) => {
            const Icon = row.icon;
            const pct = Math.min(100, Math.round((row.current / row.target) * 100));
            return (
              <div
                key={row.label}
                className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-cyan-400" />
                    {row.label}
                  </span>
                  <span className="font-mono tabular-nums">{pct}%</span>
                </div>
                <div className="flex items-baseline gap-1.5 tabular-nums">
                  <span className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                    {row.current.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    / {row.target.toLocaleString()}
                  </span>
                </div>
                <AnimatedProgressBar
                  percent={pct}
                  heightClass="h-1.5"
                  fillClass={row.barClass}
                />
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {row.subLabel}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Split: Importer & Validator (Left 7 cols) + Installed Packs (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: JSON Pack Importer + Official Sample Packs */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400" />
                  Import JSON Question Pack
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Validates TOEFL 2026 schemas, semantic pack versions, duplicate IDs, and duplicate
                  content before saving to your browser library.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteBox((v) => !v)}
                className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400 hover:underline self-start sm:self-auto"
              >
                {showPasteBox ? 'Hide JSON Editor' : 'Paste Raw JSON'}
              </button>
            </div>

            {statusMessage && (
              <div
                className={`rounded-xl border p-3.5 text-xs flex items-start gap-2.5 ${
                  statusMessage.type === 'success'
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : 'border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* File Drop / Picker */}
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {sourceFileName ? `Selected: ${sourceFileName}` : 'Upload a .json question pack file'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Supports all 12 TOEFL 2026 task formats + academic vocabulary entries (Schema v1.0).
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-lg bg-[#0B1733] dark:bg-[#1D4ED8] hover:bg-[#132652] dark:hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Choose JSON File
                </button>
              </div>
            </div>

            {showPasteBox && (
              <div className="space-y-2.5">
                <textarea
                  value={rawJsonInput}
                  onChange={(e) => setRawJsonInput(e.target.value)}
                  rows={8}
                  placeholder='Paste valid schemaVersion "1.0" JSON pack payload here...'
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!rawJsonInput.trim()}
                    onClick={() => runValidation(rawJsonInput, 'pasted-pack.json')}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 text-white text-xs font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Validate JSON Payload
                  </button>
                </div>
              </div>
            )}

            {/* Parse Error */}
            {parseError && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 p-4 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">JSON Parse Error</div>
                  <div className="mt-0.5">{parseError}</div>
                </div>
              </div>
            )}

            {/* Live Validation & Deduplication Report */}
            {validationReport && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400">
                      Validation &amp; Deduplication Report
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {validationReport.manifest?.name || 'Unnamed Pack'}
                    </h3>
                    {validationReport.manifest && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                        ID: {validationReport.manifest.packId} · v{validationReport.manifest.version}{' '}
                        · Author: {validationReport.manifest.author} · Status:{' '}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {validationReport.versionStatus === 'upgrade'
                            ? `Upgrade from v${validationReport.existingVersion}`
                            : validationReport.versionStatus === 'same-or-older'
                            ? `Already Installed (v${validationReport.existingVersion})`
                            : 'New Pack'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setValidationReport(null);
                        setSourceFileName(null);
                      }}
                      className="min-h-[38px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      disabled={!validationReport.canImportPartial}
                      onClick={handleCommitPack}
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-45 text-white text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {validationReport.versionStatus === 'upgrade'
                        ? `Upgrade to v${validationReport.manifest?.version}`
                        : `Import ${validationReport.validQuestions.length} Qs & ${validationReport.validVocabulary.length} Vocab`}
                    </button>
                  </div>
                </div>

                {/* Summary Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <div className="text-slate-500">Valid Questions</div>
                    <div className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                      {validationReport.validQuestions.length} / {validationReport.totalQuestionsInFile}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <div className="text-slate-500">Valid Vocabulary</div>
                    <div className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                      {validationReport.validVocabulary.length} / {validationReport.totalVocabInFile}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <div className="text-slate-500">Duplicate IDs</div>
                    <div
                      className={`font-display text-lg font-bold tabular-nums mt-0.5 ${
                        validationReport.duplicateIds.length > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {validationReport.duplicateIds.length}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <div className="text-slate-500">Duplicate Content</div>
                    <div
                      className={`font-display text-lg font-bold tabular-nums mt-0.5 ${
                        validationReport.duplicateContentIds.length > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {validationReport.duplicateContentIds.length}
                    </div>
                  </div>
                </div>

                {/* Issues List */}
                {validationReport.issues.length === 0 ? (
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/25 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    All items passed schema validation with zero duplicate IDs or overlapping content.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {validationReport.issues.map((issue, i) => (
                      <div
                        key={`${issue.path}-${i}`}
                        className={`rounded-lg border px-3 py-2 text-xs flex items-start gap-2 ${
                          issue.severity === 'error'
                            ? 'border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                            : 'border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        {issue.severity === 'error' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <span className="font-mono font-semibold">{issue.path}</span> ·{' '}
                          <span>{issue.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Official Ready-to-Import Sample Expansion Packs */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Official Sample Expansion Packs (1-Click Validate &amp; Import)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Test the pack import, validation, and duplicate detection pipeline using official
                  external JSON files hosted with this platform.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OFFICIAL_SAMPLE_PACK_URLS.map((sample) => {
                  const alreadyInstalled = installedPacks.some(
                    (p) => p.manifest.packId === sample.id
                  );
                  return (
                    <div
                      key={sample.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {sample.name}
                          </span>
                          {alreadyInstalled && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                              Installed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {sample.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={loadingSampleId === sample.id}
                          onClick={() => handleLoadOfficialSample(sample)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3 rounded-lg bg-[#0B1733] dark:bg-[#1D4ED8] hover:bg-[#132652] dark:hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              loadingSampleId === sample.id ? 'animate-spin' : ''
                            }`}
                          />
                          {alreadyInstalled ? 'Re-Validate Pack' : 'Load & Validate'}
                        </button>
                        <a
                          href={sample.url}
                          download
                          className="inline-flex items-center justify-center min-h-[36px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Download raw JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task Type & Difficulty Matrix */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Distribution by 2026 Task Format &amp; Difficulty
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {DIFFICULTIES.map((d) => (
                  <span key={d}>
                    {d}: <strong className="text-slate-900 dark:text-white">{stats.byDifficulty[d]}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TASK_TYPE_ORDER.map((item) => {
                const count = stats.byTaskType[item.key] || 0;
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800/80 px-3.5 py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {formatTaskTypeLabel(item.key)}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.section}</div>
                    </div>
                    <span className="font-mono font-bold text-[#1D4ED8] dark:text-cyan-400 tabular-nums ml-3">
                      {count} {count === 1 ? 'set' : 'sets'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Installed Question Packs Registry */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Installed Packs ({installedPacks.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle packs on or off to control which questions and vocabulary feed simulations,
                practice drills, and SM-2 flashcards.
              </p>
            </div>

            <div className="space-y-3">
              {installedPacks.map((pack) => {
                const scoredCount = pack.questions.reduce((s, q) => s + countScoredItems(q), 0);
                const canDisable =
                  !pack.enabled || installedPacks.filter((p) => p.enabled).length > 1;
                return (
                  <div
                    key={pack.manifest.packId}
                    className={`rounded-xl border p-4 space-y-3 transition-colors ${
                      pack.enabled
                        ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50'
                        : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/20 opacity-65'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                          {pack.manifest.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                          v{pack.manifest.version} ·{' '}
                          {pack.manifest.source === 'builtin' ? 'Built-in Curated' : 'Imported JSON'}{' '}
                          · {pack.manifest.packId}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!canDisable}
                        onClick={() => togglePackEnabled(pack.manifest.packId)}
                        className={`min-h-[32px] px-3 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                          pack.enabled
                            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        } disabled:opacity-45`}
                      >
                        {pack.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pack.manifest.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        {pack.questions.length} exercises ({scoredCount} items) ·{' '}
                        {pack.vocabulary.length} vocab
                      </span>

                      {pack.manifest.source === 'imported' && (
                        <button
                          type="button"
                          onClick={() => removeImportedPack(pack.manifest.packId)}
                          className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
