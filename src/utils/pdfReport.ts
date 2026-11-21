import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { TestAttempt } from '../types/toefl';
import { formatTaskTypeLabel } from './scoring';
import bundledLogoUrl from '../assets/aipp-logo.png?inline';
import bundledSignatureUrl from '../assets/founder-signature-navy.png?inline';

const PUBLIC_SIGNATURE_FALLBACK = '/assets/founder-signature-navy.png';
const PUBLIC_LOGO_FALLBACK = '/assets/aistudio/aipp-logo_9a141648.png';

// Website-Harmonized Institutional Palette (Deep Navy, Royal Blue, Sky, Crisp Slate)
const COLOR = {
  white: [255, 255, 255] as const,
  surface: [248, 250, 252] as const,
  slateSoft: [241, 245, 249] as const,
  blueSoft: [239, 246, 255] as const,
  blueBorder: [191, 219, 254] as const,
  navy: [11, 23, 51] as const,
  royal: [29, 78, 216] as const,
  sky: [2, 132, 199] as const,
  ink: [15, 23, 42] as const,
  body: [51, 65, 85] as const,
  muted: [100, 116, 139] as const,
  border: [203, 213, 225] as const,
  hairline: [226, 232, 240] as const,
  emerald: [21, 128, 61] as const,
  emeraldBg: [240, 253, 244] as const,
  rose: [185, 28, 28] as const,
  roseBg: [254, 242, 242] as const,
  amber: [180, 83, 9] as const,
};

export function cleanDocumentText(raw: string): string {
  return String(raw || '')
    .replace(/\s*\u2014\s*/g, ': ')
    .replace(/\s*\u2013\s*/g, ' to ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function buildVerificationCode(attempt: TestAttempt, candidateName: string): string {
  const seed = `${attempt.id}|${candidateName}|${attempt.overallBand.toFixed(1)}|${attempt.completedAt.slice(0, 10)}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `AIPP-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export function getDistinctionInfo(overallBand: number): { title: string; tier: string } {
  if (overallBand >= 5.5) {
    return { title: 'Honors Distinction', tier: 'Academic Mastery Tier' };
  }
  if (overallBand >= 4.5) {
    return { title: 'Merit Distinction', tier: 'University Readiness Tier' };
  }
  return { title: 'Verified Milestone', tier: 'Active Progress Tier' };
}

interface LoadedPdfImage {
  dataUrl: string;
  width: number;
  height: number;
}

function loadImageViaCanvas(url: string, maxDimension: number): Promise<LoadedPdfImage | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const isCrossOrigin =
      /^https?:\/\//i.test(url) &&
      typeof window !== 'undefined' &&
      !url.startsWith(window.location.origin);
    if (isCrossOrigin) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        const natW = img.naturalWidth || img.width;
        const natH = img.naturalHeight || img.height;
        if (!natW || !natH) {
          resolve(null);
          return;
        }
        const scale = Math.min(1, maxDimension / Math.max(natW, natH));
        const targetW = Math.max(1, Math.round(natW * scale));
        const targetH = Math.max(1, Math.round(natH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ dataUrl, width: targetW, height: targetH });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function loadImageReliable(
  urls: string[],
  maxDimension: number,
  fallbackDims: { width: number; height: number }
): Promise<LoadedPdfImage | null> {
  for (const url of urls) {
    if (!url) continue;
    // Fast-path: Vite ?inline PNG data URL works synchronously & reliably everywhere
    if (url.startsWith('data:image/png;base64,')) {
      return { dataUrl: url, width: fallbackDims.width, height: fallbackDims.height };
    }
    const viaCanvas = await loadImageViaCanvas(url, maxDimension);
    if (viaCanvas) return viaCanvas;

    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.startsWith('image/')) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        try {
          const fromBlob = await loadImageViaCanvas(objectUrl, maxDimension);
          if (fromBlob) return fromBlob;
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      }
    } catch {
      // Try next candidate
    }
  }
  return null;
}

function drawCrestFallback(doc: jsPDF, x: number, y: number, size: number) {
  doc.setFillColor(...COLOR.navy);
  doc.roundedRect(x, y, size, size, 2, 2, 'F');
  doc.setDrawColor(...COLOR.royal);
  doc.setLineWidth(0.35);
  doc.roundedRect(x + 0.9, y + 0.9, size - 1.8, size - 1.8, 1.4, 1.4, 'S');
  doc.setTextColor(...COLOR.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size * 0.34);
  doc.text('AIPP', x + size / 2, y + size * 0.61, { align: 'center' });
}

function drawBandScaleBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  score: number,
  height = 2.4,
  showTicks = false
) {
  const clamped = Math.max(0, Math.min(6, score));
  const fillW = Math.max(2, (clamped / 6) * width);

  doc.setFillColor(...COLOR.hairline);
  doc.roundedRect(x, y, width, height, height / 2, height / 2, 'F');

  doc.setFillColor(...COLOR.royal);
  doc.roundedRect(x, y, fillW, height, height / 2, height / 2, 'F');

  // Subtle scale notches at integer bands 1..5
  doc.setDrawColor(...COLOR.white);
  doc.setLineWidth(0.28);
  for (let step = 1; step <= 5; step += 1) {
    const tx = x + (step / 6) * width;
    doc.line(tx, y, tx, y + height);
  }

  if (showTicks) {
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(...COLOR.muted);
    for (let step = 0; step <= 6; step += 1) {
      const tx = x + (step / 6) * width;
      doc.text(step === 0 ? '0' : `${step}.0`, tx, y + height + 3.4, {
        align: step === 0 ? 'left' : step === 6 ? 'right' : 'center',
      });
    }
  }
}

function drawSectionHeading(doc: jsPDF, num: string, title: string, x: number, y: number, width: number) {
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.royal);
  doc.text(num, x, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.navy);
  doc.text(title, x + 7.5, y);

  doc.setDrawColor(...COLOR.hairline);
  doc.setLineWidth(0.32);
  doc.line(x, y + 2.5, x + width, y + 2.5);
  doc.setDrawColor(...COLOR.royal);
  doc.setLineWidth(0.6);
  doc.line(x, y + 2.5, x + 22, y + 2.5);
}

function drawRunningHeader(
  doc: jsPDF,
  sectionTitle: string,
  attemptId: string,
  candidateName: string,
  logoAsset: LoadedPdfImage | null,
  pageW: number
) {
  // Small brand emblem on running header
  if (logoAsset) {
    doc.setFillColor(...COLOR.navy);
    doc.roundedRect(18, 10.5, 8.5, 8.5, 1.4, 1.4, 'F');
    doc.addImage(logoAsset.dataUrl, 'PNG', 19.1, 11.6, 6.3, 6.3);
  } else {
    drawCrestFallback(doc, 18, 10.5, 8.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.navy);
  doc.text('AIPP TOEFL TEAM', 29.2, 14.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...COLOR.muted);
  doc.text(`AIPProject03  |  ${sectionTitle}`, 29.2, 18.4);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...COLOR.navy);
  doc.text(`REPORT ${attemptId}`, pageW - 18, 14.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...COLOR.muted);
  doc.text(cleanDocumentText(candidateName || 'TOEFL Candidate'), pageW - 18, 18.4, {
    align: 'right',
  });

  // Clean Website-Matched Accent Rule (Navy + Royal Blue + Sky)
  doc.setFillColor(...COLOR.navy);
  doc.rect(18, 21.8, (pageW - 36) * 0.7, 0.65, 'F');
  doc.setFillColor(...COLOR.royal);
  doc.rect(18 + (pageW - 36) * 0.7, 21.8, (pageW - 36) * 0.22, 0.65, 'F');
  doc.setFillColor(...COLOR.sky);
  doc.rect(18 + (pageW - 36) * 0.92, 21.8, (pageW - 36) * 0.08, 0.65, 'F');
}

function drawRunningFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number,
  verificationCode: string,
  pageW: number,
  pageH: number
) {
  doc.setDrawColor(...COLOR.hairline);
  doc.setLineWidth(0.3);
  doc.line(18, pageH - 15.5, pageW - 18, pageH - 15.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLOR.muted);
  doc.text(
    'AIPP TOEFL TEAM (AIPProject03) | Independent Practice Simulation Report (Not affiliated with ETS)',
    18,
    pageH - 10
  );

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(...COLOR.body);
  doc.text(`${verificationCode}  |  Page ${pageNum} of ${totalPages}`, pageW - 18, pageH - 10, {
    align: 'right',
  });
}

async function buildSimulationPdfDocument(
  attempt: TestAttempt,
  candidateName: string
): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth(); // 210mm
  const pageH = doc.internal.pageSize.getHeight(); // 297mm

  const safeCandidate = cleanDocumentText(candidateName || 'TOEFL Candidate');
  const issueDateStr = new Date(attempt.completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const verificationCode = buildVerificationCode(attempt, safeCandidate);
  const distinction = getDistinctionInfo(attempt.overallBand);
  const durationMinutes = Math.max(1, Math.round(attempt.durationSec / 60));
  const modeLabel = attempt.mode === 'strict' ? 'Strict Exam Mode' : 'Guided Practice Mode';

  const qrPayload = JSON.stringify({
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

  const [signatureAsset, logoAsset, qrDataUrl] = await Promise.all([
    loadImageReliable([bundledSignatureUrl, PUBLIC_SIGNATURE_FALLBACK], 600, {
      width: 553,
      height: 291,
    }),
    loadImageReliable([bundledLogoUrl, PUBLIC_LOGO_FALLBACK], 420, {
      width: 320,
      height: 320,
    }),
    QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 220,
      color: { dark: '#0B1733', light: '#FFFFFF' },
    }).catch(() => null),
  ]);

  const sections: Array<{ key: 'reading' | 'listening' | 'writing' | 'speaking'; label: string }> = [
    { key: 'reading', label: 'Reading' },
    { key: 'listening', label: 'Listening' },
    { key: 'writing', label: 'Writing' },
    { key: 'speaking', label: 'Speaking' },
  ];

  // =========================================================================
  // PAGE 1: SIMULATION CERTIFICATE & OFFICIAL STATEMENT OF RESULTS
  // =========================================================================
  // Clean Pure White Page + Crisp Institutional Framing
  doc.setFillColor(...COLOR.white);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Outer Navy Frame & Fine Slate Inner Hairline
  doc.setDrawColor(...COLOR.navy);
  doc.setLineWidth(0.85);
  doc.rect(10, 10, pageW - 20, pageH - 20, 'S');

  doc.setDrawColor(...COLOR.hairline);
  doc.setLineWidth(0.28);
  doc.rect(12.6, 12.6, pageW - 25.2, pageH - 25.2, 'S');

  // Top Tri-Tone Website Brand Accent Strip inside top border
  const innerX = 12.6;
  const innerW = pageW - 25.2;
  doc.setFillColor(...COLOR.navy);
  doc.rect(innerX, 12.6, innerW * 0.68, 2.4, 'F');
  doc.setFillColor(...COLOR.royal);
  doc.rect(innerX + innerW * 0.68, 12.6, innerW * 0.23, 2.4, 'F');
  doc.setFillColor(...COLOR.sky);
  doc.rect(innerX + innerW * 0.91, 12.6, innerW * 0.09, 2.4, 'F');

  // Institutional Masthead (Clean White Surface with Real AIPP Logo)
  if (logoAsset) {
    doc.setFillColor(...COLOR.navy);
    doc.roundedRect(20, 21.5, 16.5, 16.5, 2.5, 2.5, 'F');
    const pad = 2.0;
    const maxBox = 16.5 - pad * 2;
    const aspect = logoAsset.width / logoAsset.height;
    const drawW = aspect >= 1 ? maxBox : maxBox * aspect;
    const drawH = aspect >= 1 ? maxBox / aspect : maxBox;
    doc.addImage(
      logoAsset.dataUrl,
      'PNG',
      20 + (16.5 - drawW) / 2,
      21.5 + (16.5 - drawH) / 2,
      drawW,
      drawH
    );
  } else {
    drawCrestFallback(doc, 20, 21.5, 16.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...COLOR.navy);
  doc.text('AIPP TOEFL TEAM', 40.5, 27.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  doc.setTextColor(...COLOR.body);
  doc.text('AIPProject03  |  TOEFL iBT Simulation & Learning Platform', 40.5, 32.0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLOR.royal);
  doc.text('Practice Smarter. Perform Better. Reach Your Target.', 40.5, 36.4);

  // Right Document Control Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR.muted);
  doc.text('REPORT REFERENCE', pageW - 20, 24.5, { align: 'right' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(9.6);
  doc.setTextColor(...COLOR.navy);
  doc.text(attempt.id, pageW - 20, 29.2, { align: 'right' });

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.3);
  doc.setTextColor(...COLOR.royal);
  doc.text(`VERIFY: ${verificationCode}`, pageW - 20, 33.4, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(...COLOR.muted);
  doc.text(`Issued ${issueDateStr}`, pageW - 20, 37.3, { align: 'right' });

  // Masthead Separator Rule
  doc.setDrawColor(...COLOR.hairline);
  doc.setLineWidth(0.35);
  doc.line(20, 43.2, pageW - 20, 43.2);
  doc.setDrawColor(...COLOR.royal);
  doc.setLineWidth(0.7);
  doc.line(20, 43.2, 54, 43.2);

  // Formal Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...COLOR.royal);
  doc.text('STATEMENT OF SIMULATION RESULTS', pageW / 2, 52.5, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLOR.navy);
  doc.text('Certificate of Simulation Performance', pageW / 2, 62.2, { align: 'center' });

  // Clean Independent Notice Strip
  doc.setFillColor(...COLOR.surface);
  doc.setDrawColor(...COLOR.border);
  doc.setLineWidth(0.28);
  doc.roundedRect(22, 67.8, pageW - 44, 7.2, 1.2, 1.2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.1);
  doc.setTextColor(...COLOR.body);
  doc.text(
    'INDEPENDENT SIMULATION CERTIFICATE   |   NOT AN OFFICIAL ETS TOEFL iBT SCORE REPORT',
    pageW / 2,
    72.4,
    { align: 'center' }
  );

  // Candidate Conferral Block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.muted);
  doc.text(
    'This independent educational assessment record is presented to',
    pageW / 2,
    83.8,
    { align: 'center' }
  );

  const nameFontSize = safeCandidate.length > 34 ? 17 : safeCandidate.length > 26 ? 20 : 24;
  doc.setFont('times', 'bold');
  doc.setFontSize(nameFontSize);
  doc.setTextColor(...COLOR.navy);
  doc.text(safeCandidate, pageW / 2, 95.5, { align: 'center' });

  // Crisp Royal Blue centered underline
  doc.setFillColor(...COLOR.royal);
  doc.rect(pageW / 2 - 26, 99.2, 52, 0.7, 'F');

  // 2x3 Candidate & Examination Metadata Grid
  const metaX = 20;
  const metaY = 105;
  const metaW = pageW - 40;
  const metaH = 18;
  const colW3 = metaW / 3;

  doc.setFillColor(...COLOR.surface);
  doc.setDrawColor(...COLOR.border);
  doc.setLineWidth(0.28);
  doc.roundedRect(metaX, metaY, metaW, metaH, 1.4, 1.4, 'FD');

  doc.setDrawColor(...COLOR.hairline);
  doc.setLineWidth(0.25);
  doc.line(metaX, metaY + metaH / 2, metaX + metaW, metaY + metaH / 2);
  doc.line(metaX + colW3, metaY, metaX + colW3, metaY + metaH);
  doc.line(metaX + colW3 * 2, metaY, metaX + colW3 * 2, metaY + metaH);

  const metaCells = [
    { row: 0, col: 0, label: 'ASSESSMENT TYPE', value: attempt.type },
    { row: 0, col: 1, label: 'ADMINISTRATION MODE', value: modeLabel },
    { row: 0, col: 2, label: 'ELAPSED DURATION', value: `${durationMinutes} minutes` },
    { row: 1, col: 0, label: 'EXAMINATION DATE', value: issueDateStr },
    { row: 1, col: 1, label: 'SCORING SCALE', value: '2026 Band Scale (1.0 to 6.0)' },
    { row: 1, col: 2, label: 'ESTIMATE CONFIDENCE', value: `${attempt.confidenceLabel} Confidence` },
  ];

  metaCells.forEach((cell) => {
    const cx = metaX + cell.col * colW3 + 3.8;
    const cy = metaY + cell.row * (metaH / 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.1);
    doc.setTextColor(...COLOR.muted);
    doc.text(cell.label, cx, cy + 3.4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.1);
    doc.setTextColor(...COLOR.ink);
    const valLine = doc.splitTextToSize(cleanDocumentText(cell.value), colW3 - 7)[0];
    doc.text(valLine, cx, cy + 7.4);
  });

  // Executive Overall Score Summary Panel (Spacious 2-Zone Layout — Zero Overlap)
  const scoreX = 20;
  const scoreY = 129;
  const scoreW = pageW - 40;
  const scoreH = 34;

  doc.setFillColor(...COLOR.white);
  doc.setDrawColor(...COLOR.navy);
  doc.setLineWidth(0.45);
  doc.roundedRect(scoreX, scoreY, scoreW, scoreH, 2, 2, 'FD');

  // Clean Royal Blue Left Accent Spine
  doc.setFillColor(...COLOR.royal);
  doc.rect(scoreX, scoreY + 0.3, 2.6, scoreH - 0.6, 'F');

  // Vertical Divider between Left Score Zone and Right CEFR/Standing Zone
  const dividerX = 83;
  doc.setDrawColor(...COLOR.hairline);
  doc.setLineWidth(0.32);
  doc.line(dividerX, scoreY + 4.5, dividerX, scoreY + scoreH - 4.5);

  // Left Zone: Overall Band Score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLOR.royal);
  doc.text('OVERALL ESTIMATED BAND', 28, scoreY + 7.2);

  const scoreStr = attempt.overallBand.toFixed(1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(31);
  doc.setTextColor(...COLOR.navy);
  const scoreStrW = doc.getTextWidth(scoreStr);
  doc.text(scoreStr, 28, scoreY + 22.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR.muted);
  doc.text('/ 6.0', 28 + scoreStrW + 2.2, scoreY + 22.2);

  drawBandScaleBar(doc, 28, scoreY + 26.5, 48, attempt.overallBand, 2.5, false);

  // Right Zone: Estimated CEFR, Classification & Standing (96mm wide — zero crowding!)
  const rzX = 89;
  const rzMaxW = scoreX + scoreW - rzX - 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLOR.muted);
  doc.text('ESTIMATED CEFR & PERFORMANCE STANDING', rzX, scoreY + 7.2);

  const cefrText = `CEFR ${attempt.cefrLevel}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16.5);
  doc.setTextColor(...COLOR.navy);
  const cefrW = doc.getTextWidth(cefrText);
  doc.text(cefrText, rzX, scoreY + 15.8);

  // Subtle inline standing tag next to CEFR level
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  const badgeText = distinction.title;
  const badgeW = doc.getTextWidth(badgeText) + 6;
  const badgeX = rzX + cefrW + 4.5;
  if (badgeX + badgeW < scoreX + scoreW - 4) {
    doc.setFillColor(...COLOR.blueSoft);
    doc.setDrawColor(...COLOR.blueBorder);
    doc.setLineWidth(0.25);
    doc.roundedRect(badgeX, scoreY + 10.6, badgeW, 5.8, 1.2, 1.2, 'FD');
    doc.setTextColor(...COLOR.royal);
    doc.text(badgeText, badgeX + badgeW / 2, scoreY + 14.5, { align: 'center' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.0);
  doc.setTextColor(...COLOR.royal);
  const classLine = doc.splitTextToSize(cleanDocumentText(attempt.classification), rzMaxW)[0];
  doc.text(classLine, rzX, scoreY + 22.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.body);
  const subMetaLine = doc.splitTextToSize(
    `${distinction.tier}  |  Legacy 0 to 120 reference: approx. ${attempt.legacyEquivalent} / 120`,
    rzMaxW
  )[0];
  doc.text(subMetaLine, rzX, scoreY + 28.4);

  // Four-Skill Section Band Profile
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...COLOR.navy);
  doc.text('SECTION BAND PROFILE', 20, 171.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.0);
  doc.setTextColor(...COLOR.muted);
  doc.text('2026 HALF-POINT SCALE (1.0 TO 6.0)', pageW - 20, 171.5, { align: 'right' });

  const cardGap = 4;
  const cardW = (pageW - 40 - cardGap * 3) / 4;
  sections.forEach((sec, idx) => {
    const cx = 20 + idx * (cardW + cardGap);
    const cy = 174.5;
    const score = attempt.sectionScores[sec.key];
    const summary = attempt.sectionSummaries[sec.key];

    doc.setFillColor(...COLOR.surface);
    doc.setDrawColor(...COLOR.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cy, cardW, 33, 1.8, 1.8, 'FD');

    // Clean top bar (Navy for Receptive, Royal Blue for Productive)
    const topBarColor: readonly [number, number, number] =
      sec.key === 'reading' || sec.key === 'listening' ? COLOR.navy : COLOR.royal;
    doc.setFillColor(...topBarColor);
    doc.rect(cx + 0.2, cy + 0.2, cardW - 0.4, 1.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR.body);
    doc.text(sec.label.toUpperCase(), cx + cardW / 2, cy + 8.0, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...COLOR.navy);
    doc.text(score.toFixed(1), cx + cardW / 2, cy + 18.2, { align: 'center' });

    drawBandScaleBar(doc, cx + 5.2, cy + 21.8, cardW - 10.4, score, 2.0, false);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.9);
    doc.setTextColor(...COLOR.muted);
    const tierNote = summary?.adaptiveTier
      ? cleanDocumentText(summary.adaptiveTier)
      : sec.key === 'writing' || sec.key === 'speaking'
        ? 'Rubric Evaluated'
        : 'Band 1.0 to 6.0';
    doc.text(tierNote, cx + cardW / 2, cy + 29.4, { align: 'center' });
  });

  // =========================================================================
  // AUTHENTICATION FOOTER: FOUNDER SIGNATURE, VERIFICATION LEDGER & QR CODE
  // =========================================================================
  doc.setDrawColor(...COLOR.hairline);
  doc.setLineWidth(0.32);
  doc.line(20, 214.5, pageW - 20, 214.5);

  const authY = 218.5;

  // Left: Authentic Founder Signature
  if (signatureAsset) {
    const aspect = signatureAsset.width / signatureAsset.height;
    const drawH = 16.5;
    const drawW = Math.min(52, drawH * aspect);
    doc.addImage(signatureAsset.dataUrl, 'PNG', 21, authY + 0.5, drawW, drawH);
  }

  doc.setDrawColor(...COLOR.navy);
  doc.setLineWidth(0.38);
  doc.line(20, authY + 19.2, 82, authY + 19.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLOR.navy);
  doc.text('A. Irwin Putra Pangesti, S.T.', 20, authY + 24.4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.0);
  doc.setTextColor(...COLOR.body);
  doc.text('Founder, AIPP TOEFL TEAM', 20, authY + 28.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLOR.royal);
  doc.text('AIPProject03 Academic Platform', 20, authY + 33.0);

  // Center: Structured Credential Verification Block
  doc.setDrawColor(...COLOR.hairline);
  doc.setLineWidth(0.28);
  doc.line(89, authY + 1, 89, authY + 34);

  const midX = 95;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(...COLOR.muted);
  doc.text('ISSUE DATE', midX, authY + 4.0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(...COLOR.ink);
  doc.text(issueDateStr, midX, authY + 8.0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(...COLOR.muted);
  doc.text('CERTIFICATE ID', midX, authY + 14.5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(...COLOR.navy);
  doc.text(attempt.id, midX, authY + 18.6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(...COLOR.muted);
  doc.text('VERIFICATION CODE', midX, authY + 25.0);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(...COLOR.royal);
  doc.text(verificationCode, midX, authY + 29.1);

  // Right: Verification QR Code
  if (qrDataUrl) {
    const qrSize = 26;
    const qrX = pageW - 20 - qrSize;
    const qrY = authY + 0.5;
    doc.setFillColor(...COLOR.white);
    doc.setDrawColor(...COLOR.border);
    doc.setLineWidth(0.32);
    doc.roundedRect(qrX, qrY, qrSize, qrSize, 1.4, 1.4, 'FD');
    doc.addImage(qrDataUrl, 'PNG', qrX + 1.2, qrY + 1.2, qrSize - 2.4, qrSize - 2.4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(...COLOR.navy);
    doc.text('RECORD VERIFICATION', qrX + qrSize / 2, qrY + qrSize + 3.8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(...COLOR.muted);
    doc.text('Independent QR Code', qrX + qrSize / 2, qrY + qrSize + 7.2, { align: 'center' });
  }

  // Bottom Transparency Footnote
  doc.setDrawColor(...COLOR.hairline);
  doc.setLineWidth(0.28);
  doc.line(20, 260, pageW - 20, 260);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.1);
  doc.setTextColor(...COLOR.muted);
  const disclaimer =
    'This certificate documents the results of an independent TOEFL iBT practice simulation conducted on the AIPP TOEFL TEAM (AIPProject03) platform. It is not issued, verified, or endorsed by ETS (Educational Testing Service). The founder signature and verification QR authenticate this document as an independent AIPP TOEFL TEAM educational record only.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageW - 44);
  doc.text(disclaimerLines, pageW / 2, 265.2, { align: 'center' });

  // =========================================================================
  // PAGE 2: DIAGNOSTIC PERFORMANCE ANALYSIS
  // =========================================================================
  doc.addPage();
  drawRunningHeader(doc, 'Diagnostic Performance Analysis', attempt.id, safeCandidate, logoAsset, pageW);

  let y = 32;

  // 01. Section Calibration & Pacing Profile
  drawSectionHeading(
    doc,
    '01',
    'Section Band Profile & Pacing Calibration (1.0 to 6.0 Scale)',
    18,
    y,
    pageW - 36
  );
  y += 6.5;

  sections.forEach((sec) => {
    const score = attempt.sectionScores[sec.key];
    const summary = attempt.sectionSummaries[sec.key];

    doc.setFillColor(...COLOR.surface);
    doc.setDrawColor(...COLOR.hairline);
    doc.setLineWidth(0.28);
    doc.roundedRect(18, y, pageW - 36, 18.5, 1.4, 1.4, 'FD');

    // Left Navy / Royal Blue bar
    const barColor: readonly [number, number, number] =
      sec.key === 'reading' || sec.key === 'listening' ? COLOR.navy : COLOR.royal;
    doc.setFillColor(...barColor);
    doc.rect(18, y + 0.3, 1.8, 17.9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.6);
    doc.setTextColor(...COLOR.navy);
    doc.text(sec.label, 23.5, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(...COLOR.muted);
    const metaText = summary
      ? `Accuracy: ${summary.accuracyPct}% (${summary.rawCorrect}/${summary.rawTotal})  |  Avg Pace: ${summary.avgResponseTimeSec}s${summary.adaptiveTier ? `  |  ${cleanDocumentText(summary.adaptiveTier)}` : ''
      }`
      : 'Estimated band derived from recorded simulation responses';
    const safeMeta = doc.splitTextToSize(metaText, 85)[0];
    doc.text(safeMeta, 23.5, y + 12.6);

    // Calibrated ruler on right half
    drawBandScaleBar(doc, 114, y + 5.8, 52, score, 2.4, true);

    // Exact score badge on far right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COLOR.navy);
    doc.text(score.toFixed(1), pageW - 22, y + 8.6, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...COLOR.muted);
    doc.text('/ 6.0', pageW - 22, y + 13.4, { align: 'right' });

    y += 20.8;
  });

  // 02. Task-Type Diagnostic Ledger
  y += 4;
  drawSectionHeading(doc, '02', '2026 TOEFL iBT Task-Type Diagnostic Ledger', 18, y, pageW - 36);
  y += 5.5;

  doc.setFillColor(...COLOR.slateSoft);
  doc.rect(18, y, pageW - 36, 7.5, 'F');
  doc.setDrawColor(...COLOR.navy);
  doc.setLineWidth(0.35);
  doc.line(18, y, pageW - 18, y);
  doc.line(18, y + 7.5, pageW - 18, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(...COLOR.navy);
  doc.text('TASK TYPE', 21, y + 5.0);
  doc.text('SECTION', 98, y + 5.0);
  doc.text('ITEMS', 136, y + 5.0, { align: 'right' });
  doc.text('ACCURACY', 160, y + 5.0, { align: 'right' });
  doc.text('STANDING', pageW - 21, y + 5.0, { align: 'right' });
  y += 7.5;

  const taskStats = attempt.taskTypeStats.slice(0, 9);
  if (taskStats.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(...COLOR.muted);
    doc.text('No itemized task-type metrics were recorded in this session.', 21, y + 5.5);
    y += 9;
  } else {
    taskStats.forEach((row) => {
      doc.setDrawColor(...COLOR.hairline);
      doc.setLineWidth(0.22);
      doc.line(18, y + 6.6, pageW - 18, y + 6.6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.0);
      doc.setTextColor(...COLOR.ink);
      const taskLabel = doc.splitTextToSize(
        cleanDocumentText(formatTaskTypeLabel(row.taskType)),
        74
      )[0];
      doc.text(taskLabel, 21, y + 4.6);

      doc.setTextColor(...COLOR.body);
      doc.text(row.section.charAt(0).toUpperCase() + row.section.slice(1), 98, y + 4.6);

      doc.setFont('courier', 'normal');
      doc.setTextColor(...COLOR.ink);
      doc.text(`${row.correct}/${row.total}`, 136, y + 4.6, { align: 'right' });
      doc.setFont('courier', 'bold');
      doc.text(`${row.accuracy}%`, 160, y + 4.6, { align: 'right' });

      const statusLabel =
        row.accuracy >= 85
          ? 'Strong'
          : row.accuracy >= 70
            ? 'Proficient'
            : row.accuracy >= 50
              ? 'Developing'
              : 'Focus Area';
      const statusColor: readonly [number, number, number] =
        row.accuracy >= 85
          ? COLOR.emerald
          : row.accuracy >= 70
            ? COLOR.royal
            : row.accuracy >= 50
              ? COLOR.amber
              : COLOR.rose;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...statusColor);
      doc.text(statusLabel, pageW - 21, y + 4.6, { align: 'right' });
      y += 6.6;
    });
  }

  // 03. Observed Strengths & Priority Focus Areas
  y += 7;
  const colGap = 6;
  const halfW = (pageW - 36 - colGap) / 2;

  const strengthsList = (
    attempt.strengths.length ? attempt.strengths : ['Consistent task completion across assigned sections.']
  )
    .slice(0, 3)
    .map(cleanDocumentText);

  const weaknessesList = (
    attempt.weaknesses.length
      ? attempt.weaknesses
      : ['Continue refining high-difficulty academic inference and pacing.']
  )
    .slice(0, 3)
    .map(cleanDocumentText);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.0);
  const sWrapped = strengthsList.map((t) => doc.splitTextToSize(t, halfW - 10));
  const wWrapped = weaknessesList.map((t) => doc.splitTextToSize(t, halfW - 10));
  const sHeight = sWrapped.reduce((acc, l) => acc + l.length * 3.8 + 2.2, 11.5);
  const wHeight = wWrapped.reduce((acc, l) => acc + l.length * 3.8 + 2.2, 11.5);
  const boxH = Math.min(44, Math.max(28, Math.max(sHeight, wHeight)));

  // Left Card: Observed Strengths
  doc.setFillColor(...COLOR.white);
  doc.setDrawColor(...COLOR.border);
  doc.setLineWidth(0.28);
  doc.roundedRect(18, y, halfW, boxH, 1.4, 1.4, 'FD');
  doc.setFillColor(...COLOR.emerald);
  doc.rect(18, y + 0.3, 1.6, boxH - 0.6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(...COLOR.emerald);
  doc.text('OBSERVED STRENGTHS', 22.8, y + 5.8);

  let sy = y + 10.6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.9);
  doc.setTextColor(...COLOR.ink);
  sWrapped.forEach((lines) => {
    if (sy + lines.length * 3.8 > y + boxH - 1.5) return;
    doc.setFillColor(...COLOR.emerald);
    doc.circle(23.2, sy - 1.1, 0.75, 'F');
    doc.text(lines, 25.8, sy);
    sy += lines.length * 3.8 + 2.2;
  });

  // Right Card: Priority Focus Areas
  const rightX = 18 + halfW + colGap;
  doc.setFillColor(...COLOR.white);
  doc.setDrawColor(...COLOR.border);
  doc.setLineWidth(0.28);
  doc.roundedRect(rightX, y, halfW, boxH, 1.4, 1.4, 'FD');
  doc.setFillColor(...COLOR.royal);
  doc.rect(rightX, y + 0.3, 1.6, boxH - 0.6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(...COLOR.royal);
  doc.text('PRIORITY FOCUS AREAS', rightX + 4.8, y + 5.8);

  let wy = y + 10.6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.9);
  doc.setTextColor(...COLOR.ink);
  wWrapped.forEach((lines) => {
    if (wy + lines.length * 3.8 > y + boxH - 1.5) return;
    doc.setFillColor(...COLOR.royal);
    doc.circle(rightX + 5.2, wy - 1.1, 0.75, 'F');
    doc.text(lines, rightX + 7.8, wy);
    wy += lines.length * 3.8 + 2.2;
  });

  y += boxH + 7;

  // 03. Recommended Study Action Plan & Methodology Note
  if (y < 252) {
    drawSectionHeading(
      doc,
      '03',
      'Recommended Study Action Plan & Score Methodology',
      18,
      y,
      pageW - 36
    );
    y += 6.2;

    const recs = (
      attempt.recommendations.length
        ? attempt.recommendations
        : ['Maintain daily targeted section drills and timed full simulations.']
    )
      .slice(0, 3)
      .map(cleanDocumentText);

    recs.forEach((rec, idx) => {
      if (y > 260) return;
      doc.setFont('courier', 'bold');
      doc.setFontSize(8.0);
      doc.setTextColor(...COLOR.royal);
      doc.text(`0${idx + 1}`, 18.5, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.0);
      doc.setTextColor(...COLOR.ink);
      const lines = doc.splitTextToSize(rec, pageW - 44);
      doc.text(lines, 25, y);
      y += lines.length * 3.9 + 2.0;
    });

    if (y < 267) {
      y += 2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.1);
      const noteText = cleanDocumentText(
        `Methodology Note (${attempt.confidenceLabel} Confidence): Estimated 1.0 to 6.0 scores are calculated using difficulty-weighted objective performance and structured writing and speaking rubrics for independent educational guidance. Official ETS TOEFL iBT scores rely on proprietary psychometric equating.`
      );
      const noteLines = doc.splitTextToSize(noteText, pageW - 44);
      const noteH = noteLines.length * 3.5 + 4.5;
      if (y + noteH < 276) {
        doc.setFillColor(...COLOR.blueSoft);
        doc.setDrawColor(...COLOR.blueBorder);
        doc.setLineWidth(0.24);
        doc.roundedRect(18, y, pageW - 36, noteH, 1.2, 1.2, 'FD');
        doc.setTextColor(...COLOR.body);
        doc.text(noteLines, 21.5, y + 4.2);
      }
    }
  }

  drawRunningFooter(doc, 2, 3, verificationCode, pageW, pageH);

  // =========================================================================
  // PAGE 3: ANALYTICAL RUBRIC FEEDBACK & ITEM REMEDIATION LOG
  // =========================================================================
  doc.addPage();
  drawRunningHeader(
    doc,
    'Analytical Feedback & Mistake Remediation',
    attempt.id,
    safeCandidate,
    logoAsset,
    pageW
  );

  let py = 32;
  const fullW = pageW - 36;

  // 01. Analytical Writing Rubric Assessment
  drawSectionHeading(doc, '01', 'Analytical Writing Rubric Assessment', 18, py, fullW);
  py += 6;

  if (attempt.writingEvaluations.length > 0) {
    attempt.writingEvaluations.slice(0, 2).forEach((w) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      const sumLines = doc.splitTextToSize(cleanDocumentText(w.evaluation.summary), fullW - 8).slice(0, 2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.6);
      const impRaw = cleanDocumentText(
        w.evaluation.improvements[0] || 'Continue strengthening academic lexical precision and transitions.'
      );
      const impLines = doc.splitTextToSize(`Next Focus: ${impRaw}`, fullW - 8).slice(0, 2);

      const cardH = 22.5 + sumLines.length * 3.7 + impLines.length * 3.6 + 3.5;
      if (py + cardH > 272) return;

      doc.setFillColor(...COLOR.white);
      doc.setDrawColor(...COLOR.border);
      doc.setLineWidth(0.28);
      doc.roundedRect(18, py, fullW, cardH, 1.4, 1.4, 'FD');

      // Header strip
      doc.setFillColor(...COLOR.surface);
      doc.rect(18.2, py + 0.2, fullW - 0.4, 7.2, 'F');
      doc.setDrawColor(...COLOR.hairline);
      doc.line(18, py + 7.4, 18 + fullW, py + 7.4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.3);
      doc.setTextColor(...COLOR.navy);
      const wTitle = cleanDocumentText(`${formatTaskTypeLabel(w.taskType)}: ${w.promptTitle}`);
      doc.text(doc.splitTextToSize(wTitle, fullW - 50)[0], 22, py + 5.0);

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.1);
      doc.setTextColor(...COLOR.royal);
      doc.text(
        `Band ${w.evaluation.bandScore.toFixed(1)}  |  ${w.wordCount} words`,
        18 + fullW - 4,
        py + 5.0,
        { align: 'right' }
      );

      // Clean 7-Column Stacked Rubric Strip (Label on top, score centered below — zero collisions)
      const crit = w.evaluation.criteria;
      const rubricItems = [
        ['TASK', crit.taskFulfillment],
        ['DEVELOP', crit.development],
        ['ORGANIZE', crit.organization],
        ['GRAMMAR', crit.grammar],
        ['LEXIS', crit.lexicalRange],
        ['ACCURACY', crit.accuracy],
        ['COHESION', crit.cohesion],
      ] as const;
      const cellW = (fullW - 8) / rubricItems.length;
      rubricItems.forEach(([lbl, val], idx) => {
        const centerX = 22 + idx * cellW + cellW / 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.8);
        doc.setTextColor(...COLOR.muted);
        doc.text(lbl, centerX, py + 11.6, { align: 'center' });

        doc.setFont('courier', 'bold');
        doc.setFontSize(8.0);
        doc.setTextColor(...COLOR.navy);
        doc.text(Number(val).toFixed(1), centerX, py + 15.8, { align: 'center' });
      });

      doc.setDrawColor(...COLOR.hairline);
      doc.line(22, py + 18.0, 18 + fullW - 4, py + 18.0);

      // Summary & Next Focus
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(...COLOR.body);
      doc.text(sumLines, 22, py + 22.2);

      const impY = py + 22.2 + sumLines.length * 3.7 + 1.2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(...COLOR.navy);
      doc.text(impLines, 22, impY);

      py += cardH + 3.8;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(...COLOR.muted);
    doc.text('No extended Writing responses were recorded in this session.', 18, py + 4);
    py += 10;
  }

  // 02. Speaking Performance Evaluation
  py += 2;
  drawSectionHeading(doc, '02', 'Speaking Performance Evaluation', 18, py, fullW);
  py += 6;

  if (attempt.speakingEvaluations.length > 0) {
    attempt.speakingEvaluations.slice(0, 2).forEach((s) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      const sumLines = doc.splitTextToSize(cleanDocumentText(s.evaluation.summary), fullW - 8).slice(0, 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.1);
      const discLines = doc
        .splitTextToSize(cleanDocumentText(s.evaluation.disclosure), fullW - 8)
        .slice(0, 2);

      const cardH = 22.5 + sumLines.length * 3.7 + discLines.length * 3.3 + 3.5;
      if (py + cardH > 272) return;

      doc.setFillColor(...COLOR.white);
      doc.setDrawColor(...COLOR.border);
      doc.setLineWidth(0.28);
      doc.roundedRect(18, py, fullW, cardH, 1.4, 1.4, 'FD');

      doc.setFillColor(...COLOR.surface);
      doc.rect(18.2, py + 0.2, fullW - 0.4, 7.2, 'F');
      doc.setDrawColor(...COLOR.hairline);
      doc.line(18, py + 7.4, 18 + fullW, py + 7.4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.3);
      doc.setTextColor(...COLOR.navy);
      const sTitle = cleanDocumentText(`${formatTaskTypeLabel(s.taskType)}: ${s.promptTitle}`);
      doc.text(doc.splitTextToSize(sTitle, fullW - 46)[0], 22, py + 5.0);

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.1);
      doc.setTextColor(...COLOR.royal);
      const rightMeta =
        typeof s.evaluation.wordAccuracyPct === 'number'
          ? `Band ${s.evaluation.bandScore.toFixed(1)}  |  ${s.evaluation.wordAccuracyPct}% match`
          : `Band ${s.evaluation.bandScore.toFixed(1)}`;
      doc.text(rightMeta, 18 + fullW - 4, py + 5.0, { align: 'right' });

      // Stacked 7-Column Speaking Rubric Strip
      const crit = s.evaluation.criteria;
      const sRubric = [
        ['TASK', crit.taskFulfillment],
        ['FLUENCY', crit.fluency],
        ['PRONUN', crit.pronunciation],
        ['INTELLIG', crit.intelligibility],
        ['GRAMMAR', crit.grammar],
        ['VOCAB', crit.vocabulary],
        ['COHERENCE', crit.coherence],
      ] as const;
      const cellW = (fullW - 8) / sRubric.length;
      sRubric.forEach(([lbl, val], idx) => {
        const centerX = 22 + idx * cellW + cellW / 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.8);
        doc.setTextColor(...COLOR.muted);
        doc.text(lbl, centerX, py + 11.6, { align: 'center' });

        doc.setFont('courier', 'bold');
        doc.setFontSize(8.0);
        doc.setTextColor(...COLOR.navy);
        doc.text(Number(val).toFixed(1), centerX, py + 15.8, { align: 'center' });
      });

      doc.setDrawColor(...COLOR.hairline);
      doc.line(22, py + 18.0, 18 + fullW - 4, py + 18.0);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(...COLOR.body);
      doc.text(sumLines, 22, py + 22.2);

      const discY = py + 22.2 + sumLines.length * 3.7 + 1.2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.0);
      doc.setTextColor(...COLOR.muted);
      doc.text(discLines, 22, discY);

      py += cardH + 3.8;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(...COLOR.muted);
    doc.text('No Speaking responses were recorded in this session.', 18, py + 4);
    py += 10;
  }

  // 03. Item-Level Mistake Review & Remediation Log (Full-Width Stacked Rows — Zero Overflow!)
  py += 2;
  drawSectionHeading(doc, '03', 'Item-Level Mistake Review & Remediation Log', 18, py, fullW);
  py += 6;

  if (attempt.mistakes.length === 0) {
    doc.setFillColor(...COLOR.emeraldBg);
    doc.setDrawColor(...COLOR.emerald);
    doc.setLineWidth(0.25);
    doc.roundedRect(18, py, fullW, 11, 1.2, 1.2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.setTextColor(...COLOR.emerald);
    doc.text(
      'Zero objective errors recorded in this attempt. Full accuracy achieved across all scored items.',
      22,
      py + 6.8
    );
  } else {
    const innerContentW = fullW - 8;
    const answerWrapW = innerContentW - 6;
    let renderedCount = 0;

    attempt.mistakes.slice(0, 5).forEach((m, idx) => {
      // Measure EVERY wrapped line AFTER setting its exact font & fontSize
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      const promptLines = doc
        .splitTextToSize(cleanDocumentText(m.questionPrompt), innerContentW)
        .slice(0, 2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.4);
      const recordedFull = `Your Answer: ${cleanDocumentText(m.userAnswer || 'No response recorded')}`;
      const recordedLines = doc.splitTextToSize(recordedFull, answerWrapW).slice(0, 2);

      const keyFull = `Correct Answer: ${cleanDocumentText(m.correctAnswer)}`;
      const keyLines = doc.splitTextToSize(keyFull, answerWrapW).slice(0, 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.4);
      const whyFull = `Explanation: ${cleanDocumentText(m.explanation)}`;
      const whyLines = doc.splitTextToSize(whyFull, innerContentW).slice(0, 2);

      const promptH = promptLines.length * 3.6;
      const recordedBoxH = recordedLines.length * 3.5 + 2.8;
      const keyBoxH = keyLines.length * 3.5 + 2.8;
      const whyH = whyLines.length * 3.5;

      const mCardH = 7.2 + promptH + 1.8 + recordedBoxH + 1.6 + keyBoxH + 2.4 + whyH + 2.8;
      if (py + mCardH > 274) return;

      doc.setFillColor(...COLOR.white);
      doc.setDrawColor(...COLOR.border);
      doc.setLineWidth(0.28);
      doc.roundedRect(18, py, fullW, mCardH, 1.4, 1.4, 'FD');

      // Item Header
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(...COLOR.royal);
      doc.text(`0${idx + 1}`, 22, py + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(...COLOR.navy);
      doc.text(
        `${m.section.toUpperCase()}  |  ${cleanDocumentText(m.skillFocus)}`,
        28,
        py + 4.8
      );

      // Prompt
      let cursorY = py + 9.2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(...COLOR.ink);
      doc.text(promptLines, 22, cursorY);
      cursorY += promptH + 0.8;

      // Full-width Your Answer Strip
      doc.setFillColor(...COLOR.roseBg);
      doc.rect(22, cursorY, innerContentW, recordedBoxH, 'F');
      doc.setFillColor(...COLOR.rose);
      doc.rect(22, cursorY, 1.2, recordedBoxH, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.4);
      doc.setTextColor(...COLOR.rose);
      doc.text(recordedLines, 25, cursorY + 3.9);
      cursorY += recordedBoxH + 1.6;

      // Full-width Correct Answer Strip
      doc.setFillColor(...COLOR.emeraldBg);
      doc.rect(22, cursorY, innerContentW, keyBoxH, 'F');
      doc.setFillColor(...COLOR.emerald);
      doc.rect(22, cursorY, 1.2, keyBoxH, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.4);
      doc.setTextColor(...COLOR.emerald);
      doc.text(keyLines, 25, cursorY + 3.9);
      cursorY += keyBoxH + 3.6;

      // Full-width Explanation
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.4);
      doc.setTextColor(...COLOR.body);
      doc.text(whyLines, 22, cursorY);

      py += mCardH + 3.2;
      renderedCount += 1;
    });

    if (attempt.mistakes.length > renderedCount && py < 274) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.4);
      doc.setTextColor(...COLOR.muted);
      doc.text(
        `Showing ${renderedCount} of ${attempt.mistakes.length} recorded errors. View the complete interactive Mistake Review in AIPProject03 Analytics.`,
        18,
        py + 3.2
      );
    }
  }

  drawRunningFooter(doc, 3, 3, verificationCode, pageW, pageH);

  return doc;
}

export async function generateSimulationPdfBlobUrl(
  attempt: TestAttempt,
  candidateName: string
): Promise<string> {
  const doc = await buildSimulationPdfDocument(attempt, candidateName);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

export async function generateSimulationPdfReport(
  attempt: TestAttempt,
  candidateName: string,
  action: 'download' | 'print' = 'download'
): Promise<void> {
  const doc = await buildSimulationPdfDocument(attempt, candidateName);
  const safeName = (candidateName || 'Candidate').replace(/[^a-zA-Z0-9_-]+/g, '_');
  const filename = `AIPP_TOEFL_TEAM_Certificate_${safeName}_${attempt.id}.pdf`;

  if (action === 'print') {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl');
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = String(blobUrl);
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      window.setTimeout(() => iframe.remove(), 60000);
    };
  } else {
    doc.save(filename);
  }
}
