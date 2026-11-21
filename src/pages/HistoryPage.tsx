import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Download, Eye, FileText, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TestAttempt } from '../types/toefl';
import { generateSimulationPdfReport } from '../utils/pdfReport';
import { CertificateCard } from '../components/CertificateCard';

export const HistoryPage: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  const [selectedReport, setSelectedReport] = useState<TestAttempt | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>(
    state.attempts.length >= 2 ? [state.attempts[0].id, state.attempts[1].id] : []
  );
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compareA = state.attempts.find((a) => a.id === compareIds[0]) || null;
  const compareB = state.attempts.find((a) => a.id === compareIds[1]) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-blue-700 dark:text-cyan-400">
            Simulation Archive &amp; Certificate Vault
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Test History
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={compareIds.length !== 2}
            onClick={() => setShowCompare((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-45 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            {showCompare ? 'Hide Comparison' : `Compare Selected (${compareIds.length}/2)`}
          </button>
          <button
            type="button"
            onClick={() => navigate('/simulation')}
            className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold"
          >
            New Simulation
          </button>
        </div>
      </div>

      {/* Attempt Comparison Panel */}
      {showCompare && compareA && compareB && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Attempt Comparison Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Comparing newer attempt ({compareA.id}) against baseline ({compareB.id})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCompare(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2 pr-4 font-semibold">Metric</th>
                  <th className="py-2 px-4 font-semibold">Baseline ({compareB.id})</th>
                  <th className="py-2 px-4 font-semibold">Selected ({compareA.id})</th>
                  <th className="py-2 pl-4 font-semibold text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
                {(
                  [
                    { label: 'Overall Band', a: compareA.overallBand, b: compareB.overallBand },
                    { label: 'Reading', a: compareA.sectionScores.reading, b: compareB.sectionScores.reading },
                    { label: 'Listening', a: compareA.sectionScores.listening, b: compareB.sectionScores.listening },
                    { label: 'Writing', a: compareA.sectionScores.writing, b: compareB.sectionScores.writing },
                    { label: 'Speaking', a: compareA.sectionScores.speaking, b: compareB.sectionScores.speaking },
                  ] as const
                ).map((row) => {
                  const delta = Number((row.a - row.b).toFixed(1));
                  return (
                    <tr key={row.label}>
                      <td className="py-2.5 pr-4 font-semibold text-slate-800 dark:text-slate-200">
                        {row.label}
                      </td>
                      <td className="py-2.5 px-4 font-mono">{row.b.toFixed(1)}</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        {row.a.toFixed(1)}
                      </td>
                      <td
                        className={`py-2.5 pl-4 font-mono font-bold text-right ${
                          delta > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : delta < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Report & Certificate Viewer */}
      {selectedReport && (
        <div className="rounded-2xl border-2 border-[#1D4ED8]/40 bg-slate-50 dark:bg-slate-950 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1D4ED8] dark:text-cyan-400">
              Viewing Detailed Report · {selectedReport.id}
            </span>
            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" /> Close Report
            </button>
          </div>
          <CertificateCard
            attempt={selectedReport}
            candidateName={state.profile.displayName}
          />
        </div>
      )}

      {/* History Table */}
      {state.attempts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="font-display text-base font-bold text-slate-900 dark:text-white">
            No simulations recorded yet
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Complete a full test or section practice to save your score history and unlock downloadable PDF certificates.
          </p>
          <button
            type="button"
            onClick={() => navigate('/simulation')}
            className="px-4 py-2 rounded-lg bg-[#1D4ED8] text-white text-xs font-semibold"
          >
            Start First Simulation
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Attempt Cards (< md) */}
          <div className="md:hidden space-y-3.5">
            {state.attempts.map((a) => {
              const checked = compareIds.includes(a.id);
              return (
                <div
                  key={a.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCompare(a.id)}
                        aria-label={`Select ${a.id} for comparison`}
                        className="mt-1 w-4 h-4 accent-[#1D4ED8] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                          {a.type}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                          {new Date(a.completedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          · {Math.max(1, Math.round(a.durationSec / 60))} min
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 truncate mt-0.5">
                          {a.id}
                        </div>
                      </div>
                    </label>
                    <div className="text-right shrink-0 tabular-nums">
                      <div className="font-display text-2xl font-extrabold text-[#1D4ED8] dark:text-cyan-400 leading-none">
                        {a.overallBand.toFixed(1)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">CEFR {a.cefrLevel}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    {(
                      [
                        { label: 'R', val: a.sectionScores.reading },
                        { label: 'L', val: a.sectionScores.listening },
                        { label: 'W', val: a.sectionScores.writing },
                        { label: 'S', val: a.sectionScores.speaking },
                      ] as const
                    ).map((s) => (
                      <div
                        key={s.label}
                        className="rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 py-2"
                      >
                        <div className="text-[10px] font-semibold text-slate-500">{s.label}</div>
                        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                          {s.val.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(a)}
                      className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Certificate
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        generateSimulationPdfReport(a, state.profile.displayName, 'download')
                      }
                      className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B1733] dark:bg-[#1D4ED8] text-white text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Archive Table (md+) */}
          <div className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-10">Cmp</th>
                    <th className="py-3 px-4 font-semibold">Date &amp; Report ID</th>
                    <th className="py-3 px-4 font-semibold">Test Type</th>
                    <th className="py-3 px-3 font-semibold text-right">Duration</th>
                    <th className="py-3 px-3 font-semibold text-right">Overall</th>
                    <th className="py-3 px-3 font-semibold text-right">R / L / W / S</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
                  {state.attempts.map((a) => {
                    const checked = compareIds.includes(a.id);
                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCompare(a.id)}
                            aria-label={`Select ${a.id} for comparison`}
                            className="accent-[#1D4ED8]"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {new Date(a.completedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">{a.id}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{a.type}</div>
                          <div className="text-[11px] text-slate-500 capitalize">
                            {a.mode} mode · CEFR {a.cefrLevel}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {Math.max(1, Math.round(a.durationSec / 60))} min
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-[#1D4ED8] dark:text-cyan-400 text-sm">
                          {a.overallBand.toFixed(1)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {a.sectionScores.reading.toFixed(1)} / {a.sectionScores.listening.toFixed(1)} /{' '}
                          {a.sectionScores.writing.toFixed(1)} / {a.sectionScores.speaking.toFixed(1)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedReport(a)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Certificate
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                generateSimulationPdfReport(a, state.profile.displayName, 'download')
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B1733] dark:bg-[#1D4ED8] text-white font-medium hover:bg-[#132652] dark:hover:bg-blue-600"
                            >
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
