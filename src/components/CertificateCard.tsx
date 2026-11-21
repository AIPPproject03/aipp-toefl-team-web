import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Download, Eye, FileText, Printer, Share2, X } from 'lucide-react';
import { TestAttempt } from '../types/toefl';
import {
  buildVerificationCode,
  cleanDocumentText,
  generateSimulationPdfBlobUrl,
  generateSimulationPdfReport,
  getDistinctionInfo,
} from '../utils/pdfReport';
import bundledLogoUrl from '../assets/aipp-logo.png?inline';
import bundledSignatureUrl from '../assets/founder-signature-navy.png?inline';

interface CertificateCardProps {
  attempt: TestAttempt;
  candidateName: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ attempt, candidateName }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const safeCandidate = cleanDocumentText(candidateName || 'TOEFL Candidate');
  const verificationCode = buildVerificationCode(attempt, safeCandidate);
  const distinction = getDistinctionInfo(attempt.overallBand);
  const durationMinutes = Math.max(1, Math.round(attempt.durationSec / 60));
  const modeLabel = attempt.mode === 'strict' ? 'Strict Exam Mode' : 'Guided Practice Mode';

  const formattedDate = new Date(attempt.completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const payload = JSON.stringify({
      issuer: 'AIPP TOEFL TEAM',
      platform: 'AIPProject03',
      reportId: attempt.id,
      verificationCode,
      candidate: safeCandidate,
      overallBand: attempt.overallBand.toFixed(1),
      cefr: attempt.cefrLevel,
      date: attempt.completedAt.slice(0, 10),
      officialETS: false,
    });
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 180,
      color: { dark: '#0B1733', light: '#FFFFFF' },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [attempt, safeCandidate, verificationCode]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePdf = async (action: 'download' | 'print') => {
    setExporting(true);
    try {
      await generateSimulationPdfReport(attempt, safeCandidate, action);
    } finally {
      setExporting(false);
    }
  };

  const handleOpenPreview = async () => {
    setPreviewLoading(true);
    try {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = await generateSimulationPdfBlobUrl(attempt, safeCandidate);
      setPreviewUrl(url);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleShare = async () => {
    const summary = [
      `AIPP TOEFL TEAM Independent Simulation Result (${attempt.id})`,
      `Verification Code: ${verificationCode}`,
      `Candidate: ${safeCandidate}`,
      `Overall Estimated Band: ${attempt.overallBand.toFixed(1)} / 6.0 (CEFR ${attempt.cefrLevel})`,
      `Reading: ${attempt.sectionScores.reading.toFixed(1)} | Listening: ${attempt.sectionScores.listening.toFixed(1)} | Writing: ${attempt.sectionScores.writing.toFixed(1)} | Speaking: ${attempt.sectionScores.speaking.toFixed(1)}`,
      `Note: Independent practice simulation. Not an official ETS TOEFL iBT score report.`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      // Clipboard blocked
    }
  };

  const overallPct = Math.max(4, Math.min(100, (attempt.overallBand / 6) * 100));

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Simulation Certificate &amp; 3-Page Diagnostic PDF
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page 1 Official Certificate with Logo, Signature &amp; QR, Page 2 Diagnostic Analysis, Page 3 Rubric &amp; Mistake Review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenPreview}
            disabled={previewLoading}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 text-[#0B1733] dark:text-slate-100 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Eye className="w-4 h-4" />
            {previewLoading ? 'Rendering PDF...' : 'Preview 3-Page PDF'}
          </button>
          <button
            type="button"
            onClick={() => handlePdf('download')}
            disabled={exporting}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 min-h-[42px] px-4 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button
            type="button"
            onClick={() => handlePdf('print')}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>

      {/* Live Website-Harmonized Paper Certificate Preview */}
      <div className="bg-white text-[#0B1733] rounded-xl border-2 border-[#0B1733] p-1.5 shadow-sm overflow-hidden">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Sleek Tri-Tone Website Brand Accent Bar */}
          <div className="h-2 flex w-full">
            <div className="w-[68%] bg-[#0B1733]" />
            <div className="w-[23%] bg-[#1D4ED8]" />
            <div className="w-[9%] bg-[#0284C7]" />
          </div>

          <div className="px-5 py-6 sm:px-9 sm:py-8 space-y-6">
            {/* Clean Institutional Masthead */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 relative after:content-[''] after:absolute after:left-0 after:-bottom-px after:w-28 after:h-[2px] after:bg-[#1D4ED8]">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-lg bg-[#0B1733] p-2 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={bundledLogoUrl}
                    alt="AIPP TOEFL TEAM Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#0B1733] leading-tight">
                    AIPP TOEFL TEAM
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    AIPProject03 | TOEFL iBT Simulation &amp; Learning Platform
                  </div>
                  <div className="text-[11px] font-semibold text-[#1D4ED8] mt-0.5">
                    Practice Smarter. Perform Better. Reach Your Target.
                  </div>
                </div>
              </div>

              <div className="sm:text-right text-xs space-y-0.5 border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500">
                  Report Reference
                </div>
                <div className="font-mono font-bold text-[#0B1733] tabular-nums">{attempt.id}</div>
                <div className="font-mono text-[11px] text-[#1D4ED8] tabular-nums">
                  VERIFY: {verificationCode}
                </div>
                <div className="text-[11px] text-slate-500">Issued {formattedDate}</div>
              </div>
            </div>

            {/* Formal Title & Non-ETS Classification Strip */}
            <div className="text-center space-y-2.5">
              <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#1D4ED8]">
                Statement of Simulation Results
              </div>
              <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B1733] tracking-tight">
                Certificate of Simulation Performance
              </h4>
              <div className="bg-slate-50 border border-slate-300 rounded-md px-4 py-2 text-[11px] font-bold tracking-[0.06em] uppercase text-slate-700">
                Independent Simulation Certificate | Not an Official ETS TOEFL iBT Score Report
              </div>
            </div>

            {/* Candidate Presentation */}
            <div className="text-center space-y-2 pt-1">
              <p className="text-xs sm:text-sm text-slate-500">
                This independent educational assessment record is presented to
              </p>
              <div className="font-serif text-2xl sm:text-4xl font-bold text-[#0B1733] pt-0.5">
                {safeCandidate}
              </div>
              <div className="w-28 h-[2px] bg-[#1D4ED8] mx-auto mt-2" />
            </div>

            {/* 2x3 Candidate & Assessment Ledger */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-left">
              <div className="divide-y divide-slate-200">
                <div className="px-4 py-2.5">
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-500">
                    Assessment Type
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{attempt.type}</div>
                </div>
                <div className="px-4 py-2.5">
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-500">
                    Examination Date
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{formattedDate}</div>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                <div className="px-4 py-2.5">
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-500">
                    Administration Mode
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{modeLabel}</div>
                </div>
                <div className="px-4 py-2.5">
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-500">
                    Scoring Scale
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    2026 Band Scale (1.0 to 6.0)
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                <div className="px-4 py-2.5">
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-500">
                    Elapsed Duration
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5 tabular-nums">
                    {durationMinutes} minutes
                  </div>
                </div>
                <div className="px-4 py-2.5">
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-500">
                    Estimate Confidence
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {attempt.confidenceLabel} Confidence
                  </div>
                </div>
              </div>
            </div>

            {/* Spacious 2-Zone Executive Score Panel */}
            <div className="bg-white border border-[#0B1733] border-l-4 border-l-[#1D4ED8] rounded-lg grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              <div className="md:col-span-5 p-5 space-y-2.5">
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#1D4ED8]">
                  Overall Estimated Band
                </div>
                <div className="flex items-baseline gap-2 tabular-nums">
                  <span className="font-display text-4xl font-extrabold text-[#0B1733] leading-none">
                    {attempt.overallBand.toFixed(1)}
                  </span>
                  <span className="text-base font-semibold text-slate-500">/ 6.0</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 w-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1D4ED8]"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
              </div>

              <div className="md:col-span-7 p-5 space-y-1.5 flex flex-col justify-center">
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500">
                  Estimated CEFR &amp; Performance Standing
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-2xl font-extrabold text-[#0B1733]">
                    CEFR {attempt.cefrLevel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-xs font-bold text-[#1D4ED8]">
                    {distinction.title}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#1D4ED8]">
                  {cleanDocumentText(attempt.classification)}
                </div>
                <div className="text-xs text-slate-600 tabular-nums">
                  {distinction.tier} | Legacy 0 to 120 reference: approx. {attempt.legacyEquivalent}{' '}
                  / 120
                </div>
              </div>
            </div>

            {/* Section Band Profile */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.12em] uppercase">
                <span className="text-[#0B1733]">Section Band Profile</span>
                <span className="text-slate-500">2026 Half-Point Scale (1.0 to 6.0)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['reading', 'listening', 'writing', 'speaking'] as const).map((sec) => {
                  const score = attempt.sectionScores[sec];
                  const summary = attempt.sectionSummaries[sec];
                  const pct = Math.max(5, Math.min(100, (score / 6) * 100));
                  const topBorder =
                    sec === 'reading' || sec === 'listening'
                      ? 'border-t-[#0B1733]'
                      : 'border-t-[#1D4ED8]';
                  const tierLabel = summary?.adaptiveTier
                    ? cleanDocumentText(summary.adaptiveTier)
                    : sec === 'writing' || sec === 'speaking'
                      ? 'Rubric Evaluated'
                      : 'Band 1.0 to 6.0';
                  return (
                    <div
                      key={sec}
                      className={`bg-slate-50 border border-slate-300 border-t-[3px] ${topBorder} rounded-lg px-3.5 py-3.5 text-center space-y-2`}
                    >
                      <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-600">
                        {sec}
                      </div>
                      <div className="font-display text-2xl font-extrabold text-[#0B1733] tabular-nums leading-none">
                        {score.toFixed(1)}
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 w-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1D4ED8]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500">{tierLabel}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Founder Signatory, Credential Ledger & Verification QR */}
            <div className="pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
              <div className="sm:col-span-5">
                <div className="h-16 flex items-end mb-1.5">
                  <img
                    src={bundledSignatureUrl}
                    alt="Signature of A. Irwin Putra Pangesti, S.T."
                    className="max-h-16 w-auto object-contain select-none"
                  />
                </div>
                <div className="w-full max-w-[230px] border-b border-[#0B1733] mb-2" />
                <div className="font-display text-sm font-bold text-[#0B1733]">
                  A. Irwin Putra Pangesti, S.T.
                </div>
                <div className="text-xs text-slate-600">Founder, AIPP TOEFL TEAM</div>
                <div className="text-[11px] font-semibold text-[#1D4ED8] mt-0.5">
                  AIPProject03 Academic Platform
                </div>
              </div>

              <div className="sm:col-span-4 sm:border-l sm:border-slate-200 sm:pl-5 space-y-2.5 text-xs">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400">
                    Issue Date
                  </div>
                  <div className="font-bold text-slate-800">{formattedDate}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400">
                    Certificate ID
                  </div>
                  <div className="font-mono font-bold text-[#0B1733] tabular-nums">
                    {attempt.id}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400">
                    Verification Code
                  </div>
                  <div className="font-mono font-bold text-[#1D4ED8] tabular-nums">
                    {verificationCode}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3 flex sm:justify-end">
                {qrUrl && (
                  <div className="text-center">
                    <div className="inline-block bg-white border border-slate-300 rounded-md p-1.5">
                      <img
                        src={qrUrl}
                        alt={`Verification QR for ${attempt.id}`}
                        className="w-22 h-22 block"
                      />
                    </div>
                    <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#0B1733] mt-1.5">
                      Record Verification
                    </div>
                    <div className="text-[10px] text-slate-500">Independent QR Code</div>
                  </div>
                )}
              </div>
            </div>

            {/* Legal Transparency Footnote */}
            <div className="pt-4 border-t border-slate-200 text-[11px] leading-relaxed text-slate-500 text-center">
              This certificate documents the results of an independent TOEFL iBT practice simulation
              conducted on the AIPP TOEFL TEAM (AIPProject03) platform. It is not issued, verified,
              or endorsed by ETS (Educational Testing Service). The founder signature and
              verification QR authenticate this document as an independent AIPP TOEFL TEAM
              educational record only.
            </div>
          </div>
        </div>
      </div>

      {/* Embedded 3-Page PDF Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="3-Page Simulation Certificate PDF Preview"
        >
          <div className="w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-[#1D4ED8] dark:text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                    3-Page PDF Preview ({attempt.id})
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {safeCandidate} | Overall Band {attempt.overallBand.toFixed(1)} / 6.0
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePdf('download')}
                  disabled={exporting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => handlePdf('print')}
                  disabled={exporting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={handleClosePreview}
                  aria-label="Close PDF preview"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe
              src={previewUrl}
              title={`PDF Preview for ${attempt.id}`}
              className="w-full flex-1 bg-slate-200 dark:bg-slate-950"
            />
          </div>
        </div>
      )}
    </div>
  );
};
