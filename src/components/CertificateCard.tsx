import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Download, Printer, Share2 } from 'lucide-react';
import { TestAttempt } from '../types/toefl';
import { generateSimulationPdfReport } from '../utils/pdfReport';
import { BrandLogo } from './BrandLogo';

interface CertificateCardProps {
  attempt: TestAttempt;
  candidateName: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ attempt, candidateName }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(attempt.completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const payload = JSON.stringify({
      issuer: 'AIPP TOEFL TEAM',
      reportId: attempt.id,
      candidate: candidateName,
      overallBand: attempt.overallBand.toFixed(1),
      date: attempt.completedAt.slice(0, 10),
      officialETS: false,
    });
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 140,
      color: { dark: '#0B1733', light: '#FFFFFF' },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [attempt, candidateName]);

  const handlePdf = async (action: 'download' | 'print') => {
    setExporting(true);
    try {
      await generateSimulationPdfReport(attempt, candidateName, action);
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    const summary = `AIPP TOEFL TEAM Independent Simulation Result (${attempt.id})\nCandidate: ${candidateName}\nOverall Estimated Band: ${attempt.overallBand.toFixed(1)} / 6.0 (CEFR ${attempt.cefrLevel})\nReading: ${attempt.sectionScores.reading.toFixed(1)} | Listening: ${attempt.sectionScores.listening.toFixed(1)} | Writing: ${attempt.sectionScores.writing.toFixed(1)} | Speaking: ${attempt.sectionScores.speaking.toFixed(1)}\nNote: Independent practice simulation — Not an official ETS TOEFL iBT score report.`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      // Clipboard blocked
    }
  };

  const distinction =
    attempt.overallBand >= 5.5
      ? 'Honors Distinction — Academic Mastery Tier'
      : attempt.overallBand >= 4.5
      ? 'Merit Distinction — University Readiness Tier'
      : 'Verified Practice Milestone — Active Progress Tier';

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Simulation Certificate &amp; Official 3-Page PDF Report
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Includes Page 1 Certificate with Founder Signature &amp; QR, Page 2 Score Analysis, and Page 3 Rubric &amp; Mistake Review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handlePdf('download')}
            disabled={exporting}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Generating PDF...' : 'Download 3-Page PDF'}
          </button>
          <button
            onClick={() => handlePdf('print')}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>

      {/* Live Paper Certificate Preview (Always Crisp High-Contrast Document Surface) */}
      <div className="bg-white text-slate-900 rounded-xl border-2 border-[#0B1733] p-1.5 shadow-sm overflow-hidden">
        <div className="border border-blue-700/35 rounded-lg overflow-hidden">
          {/* Header Navy Banner */}
          <div className="bg-[#0B1733] text-white px-6 py-5 border-b-2 border-cyan-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <BrandLogo darkSurface />
            <div className="sm:text-right text-xs space-y-0.5">
              <div className="font-mono font-semibold text-white tabular-nums">
                REPORT ID: {attempt.id}
              </div>
              <div className="text-slate-300">Issued: {formattedDate}</div>
              <div className="text-cyan-300">TOEFL iBT 2026 Format · 1.0–6.0 Scale</div>
            </div>
          </div>

          <div className="p-4 sm:p-8 space-y-6">
            {/* Mandatory Non-ETS Banner */}
            <div className="bg-slate-100 border border-slate-300 rounded-lg px-4 py-2.5 text-center">
              <p className="text-xs font-bold tracking-wide text-slate-900">
                SIMULATION CERTIFICATE — NOT AN OFFICIAL TOEFL iBT SCORE REPORT
              </p>
            </div>

            {/* Candidate Name Block */}
            <div className="text-center space-y-1.5">
              <h4 className="font-display text-xl sm:text-2xl font-bold text-[#0B1733]">
                Certificate of Simulation Performance
              </h4>
              <p className="text-sm text-slate-600">
                This independent educational simulation record is presented to
              </p>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#1D4ED8] pt-1">
                {candidateName}
              </div>
              <div className="max-w-md mx-auto border-b border-slate-200 pt-1" />
              <p className="text-xs text-slate-500 pt-1">
                {attempt.type} ({attempt.mode === 'strict' ? 'Strict Exam Mode' : 'Guided Practice Mode'}) · {formattedDate}
              </p>
            </div>

            {/* Overall Score Focal Strip */}
            <div className="bg-[#0B1733] text-white rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-5 md:border-r md:border-white/15 md:pr-5">
                <div className="text-[11px] font-semibold text-slate-300 tracking-wide">
                  OVERALL ESTIMATED BAND
                </div>
                <div className="mt-1 flex items-baseline gap-2 tabular-nums">
                  <span className="font-display text-4xl font-extrabold text-white">
                    {attempt.overallBand.toFixed(1)}
                  </span>
                  <span className="text-lg font-semibold text-cyan-300">/ 6.0</span>
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  Confidence: {attempt.confidenceLabel}
                </div>
              </div>
              <div className="md:col-span-7 space-y-1">
                <div className="text-[11px] font-semibold text-slate-300 tracking-wide">
                  ESTIMATED CEFR &amp; PROFICIENCY CLASSIFICATION
                </div>
                <div className="font-display text-xl font-bold text-white">
                  CEFR {attempt.cefrLevel} — {attempt.classification}
                </div>
                <div className="text-xs text-slate-300 tabular-nums">
                  Approximate legacy 0–120 equivalent: ~{attempt.legacyEquivalent}/120 (educational reference only)
                </div>
              </div>
            </div>

            {/* Four Section Scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['reading', 'listening', 'writing', 'speaking'] as const).map((sec) => {
                const summary = attempt.sectionSummaries[sec];
                return (
                  <div
                    key={sec}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5 text-center"
                  >
                    <div className="text-xs font-semibold text-slate-500 capitalize">{sec}</div>
                    <div className="font-display text-2xl font-bold text-[#0B1733] tabular-nums mt-1">
                      {attempt.sectionScores[sec].toFixed(1)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {summary?.adaptiveTier ? summary.adaptiveTier : 'Band 1.0–6.0'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Distinction Line */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-center text-xs font-semibold text-[#1D4ED8]">
              Achievement Recognition: {distinction}
            </div>

            {/* Founder Signatory Block + Verification QR */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
              <div className="sm:col-span-6">
                <div className="h-16 flex items-end mb-1.5">
                  <img
                    src="/assets/founder-signature-navy.png"
                    alt="Signature of A. Irwin Putra Pangesti, S.T., Founder of AIPP TOEFL TEAM"
                    referrerPolicy="no-referrer"
                    className="max-h-16 w-auto object-contain select-none"
                  />
                </div>
                <div className="w-full max-w-[240px] border-b border-[#0B1733]/70 mb-2" />
                <div className="font-display text-sm font-bold text-[#0B1733]">
                  A. Irwin Putra Pangesti, S.T.
                </div>
                <div className="text-xs text-slate-600">Founder</div>
                <div className="text-xs font-bold text-[#1D4ED8] mt-0.5">AIPP TOEFL TEAM</div>
              </div>

              <div className="sm:col-span-3 space-y-2 text-xs">
                <div>
                  <div className="text-slate-400">Issue Date</div>
                  <div className="font-semibold text-slate-800">{formattedDate}</div>
                </div>
                <div>
                  <div className="text-slate-400">Certificate ID</div>
                  <div className="font-mono font-semibold text-slate-800 tabular-nums">
                    {attempt.id}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3 flex sm:justify-end">
                {qrUrl && (
                  <div className="text-center">
                    <img
                      src={qrUrl}
                      alt={`Verification QR for ${attempt.id}`}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 border border-slate-200 rounded-md p-1 bg-white mx-auto"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">Independent Record QR</div>
                  </div>
                )}
              </div>
            </div>

            {/* Mandatory Transparency Footnote */}
            <div className="pt-4 border-t border-slate-200 text-[11px] leading-relaxed text-slate-500 text-center">
              This certificate documents the results of an independent TOEFL iBT practice simulation
              conducted on the AIPP TOEFL TEAM platform. It is not issued, verified, or endorsed by
              ETS. The founder signature authenticates this simulation report as an AIPP TOEFL
              TEAM-issued educational document only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
