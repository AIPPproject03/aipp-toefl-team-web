import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { TestAttempt } from '../types/toefl';
import { formatTaskTypeLabel } from './scoring';

const SIGNATURE_URL = '/assets/founder-signature-navy.png';
const LOGO_URL = '/assets/aistudio/aipp-logo_9a141648.png';

async function loadImageAsDataUrl(
  url: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || 553, height: img.naturalHeight || 291 });
      img.onerror = () => resolve({ width: 553, height: 291 });
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

function drawCrestEmblem(doc: jsPDF, x: number, y: number, size: number) {
  // Geometric academic shield emblem for AIPP TOEFL TEAM (independent, non-ETS)
  doc.setFillColor(11, 23, 51); // Deep Navy
  doc.roundedRect(x, y, size, size, 2.5, 2.5, 'F');
  doc.setDrawColor(6, 182, 212); // Subtle Cyan
  doc.setLineWidth(0.5);
  doc.roundedRect(x + 1.2, y + 1.2, size - 2.4, size - 2.4, 1.8, 1.8, 'S');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size * 0.45);
  doc.text('AIPP', x + size / 2, y + size * 0.62, { align: 'center' });
}

export async function generateSimulationPdfReport(
  attempt: TestAttempt,
  candidateName: string,
  action: 'download' | 'print' = 'download'
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth(); // 210mm
  const pageH = doc.internal.pageSize.getHeight(); // 297mm

  const issueDateStr = new Date(attempt.completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Load Founder Signature PNG, Brand Logo PNG, and QR Code in parallel
  const qrPayload = JSON.stringify({
    issuer: 'AIPP TOEFL TEAM',
    platform: 'AIPProject03 Independent Simulation',
    reportId: attempt.id,
    candidate: candidateName,
    overallBand: attempt.overallBand.toFixed(1),
    date: attempt.completedAt.slice(0, 10),
    officialETS: false,
  });

  const [signatureAsset, logoAsset, qrDataUrl] = await Promise.all([
    loadImageAsDataUrl(SIGNATURE_URL),
    loadImageAsDataUrl(LOGO_URL),
    QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 180,
      color: { dark: '#0B1733', light: '#FFFFFF' },
    }).catch(() => null),
  ]);

  // =========================================================================
  // PAGE 1: SIMULATION CERTIFICATE
  // =========================================================================
  // Outer institutional double frame
  doc.setDrawColor(11, 23, 51);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, pageW - 20, pageH - 20);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.35);
  doc.rect(12.5, 12.5, pageW - 25, pageH - 25);

  // Header Navy Band
  doc.setFillColor(11, 23, 51);
  doc.rect(12.5, 12.5, pageW - 25, 34, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(12.5, 46.5, pageW - 25, 1.2, 'F');

  if (logoAsset) {
    doc.setFillColor(11, 23, 51);
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.45);
    doc.roundedRect(20, 19, 19, 19, 2.5, 2.5, 'FD');
    doc.addImage(logoAsset.dataUrl, 'PNG', 21.8, 20.8, 15.4, 15.4);
  } else {
    drawCrestEmblem(doc, 20, 19, 19);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('AIPP TOEFL TEAM', 44, 27);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(186, 230, 253);
  doc.text('AIPProject03  ·  TOEFL iBT Simulation & Learning Platform', 44, 33.5);
  doc.setFontSize(7.8);
  doc.setTextColor(203, 213, 225);
  doc.text('Practice Smarter. Perform Better. Reach Your Target.', 44, 39.5);

  // Right header metadata
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`REPORT ID: ${attempt.id}`, pageW - 19, 27, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Issued: ${issueDateStr}`, pageW - 19, 33.5, { align: 'right' });
  doc.text('2026 Format (1–6 Band Scale)', pageW - 19, 39.5, { align: 'right' });

  // Prominent Independent Simulation Notice Banner
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(19, 54, pageW - 38, 12, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.6);
  doc.setTextColor(15, 23, 42);
  doc.text(
    'SIMULATION CERTIFICATE — NOT AN OFFICIAL TOEFL iBT SCORE REPORT',
    pageW / 2,
    61.5,
    { align: 'center' }
  );

  // Certificate Title & Candidate Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(11, 23, 51);
  doc.text('Certificate of Simulation Performance', pageW / 2, 79, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('This independent educational assessment record is presented to', pageW / 2, 87, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(29, 78, 216);
  doc.text(candidateName || 'TOEFL Candidate', pageW / 2, 99, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(50, 103, pageW - 50, 103);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Completed: ${attempt.type} (${attempt.mode === 'strict' ? 'Strict Exam Mode' : 'Guided Practice Mode'})  ·  Date: ${issueDateStr}`,
    pageW / 2,
    110,
    { align: 'center' }
  );

  // Overall Estimated Band Focal Panel
  doc.setFillColor(11, 23, 51);
  doc.roundedRect(19, 118, pageW - 38, 36, 2.5, 2.5, 'F');

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('OVERALL ESTIMATED BAND (1.0 – 6.0 SCALE)', 28, 127);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(attempt.overallBand.toFixed(1), 28, 145);

  doc.setFontSize(12);
  doc.setTextColor(34, 211, 238);
  doc.text('/ 6.0', 48, 145);

  // Right metrics inside dark box
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.35);
  doc.line(82, 124, 82, 148);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(148, 163, 184);
  doc.text('ESTIMATED CEFR LEVEL', 90, 127);
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(attempt.cefrLevel, 90, 136);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(attempt.classification, 90, 143);
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Approx. legacy 0–120 reference: ~${attempt.legacyEquivalent}/120 (non-official conversion)`,
    90,
    149
  );

  // 4-Section Score Cards
  const sections: Array<{ key: 'reading' | 'listening' | 'writing' | 'speaking'; label: string }> = [
    { key: 'reading', label: 'Reading' },
    { key: 'listening', label: 'Listening' },
    { key: 'writing', label: 'Writing' },
    { key: 'speaking', label: 'Speaking' },
  ];
  const cardGap = 4;
  const cardW = (pageW - 38 - cardGap * 3) / 4;
  sections.forEach((sec, idx) => {
    const cx = 19 + idx * (cardW + cardGap);
    const cy = 162;
    const score = attempt.sectionScores[sec.key];
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.roundedRect(cx, cy, cardW, 28, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(sec.label, cx + cardW / 2, cy + 8, { align: 'center' });

    doc.setFontSize(18);
    doc.setTextColor(11, 23, 51);
    doc.text(score.toFixed(1), cx + cardW / 2, cy + 19, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const tier = attempt.sectionSummaries[sec.key]?.adaptiveTier;
    doc.text(tier ? `${tier}` : 'Band 1.0–6.0', cx + cardW / 2, cy + 25, { align: 'center' });
  });

  // Achievement Distinction Strip
  const distinction =
    attempt.overallBand >= 5.5
      ? 'Honors Distinction — Academic Mastery Tier'
      : attempt.overallBand >= 4.5
      ? 'Merit Distinction — University Readiness Tier'
      : 'Verified Practice Milestone — Active Progress Tier';

  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(19, 197, pageW - 38, 12, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(29, 78, 216);
  doc.text(`Achievement Recognition: ${distinction}`, pageW / 2, 204.5, { align: 'center' });

  // =========================================================================
  // FOUNDER SIGNATORY BLOCK + QR CODE AUTHENTICATION
  // =========================================================================
  const sigSectionY = 220;

  // Left: Authentic Founder Signature (exact uploaded image, transparent navy PNG, proportional)
  if (signatureAsset) {
    const aspect = signatureAsset.width / signatureAsset.height; // ~1.90
    const drawH = 19; // 19mm height
    const drawW = drawH * aspect; // ~36mm width — zero stretching/distortion
    doc.addImage(signatureAsset.dataUrl, 'PNG', 22, sigSectionY, drawW, drawH);
  }

  doc.setDrawColor(11, 23, 51);
  doc.setLineWidth(0.4);
  doc.line(22, sigSectionY + 21, 90, sigSectionY + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 23, 51);
  doc.text('A. Irwin Putra Pangesti, S.T.', 22, sigSectionY + 26.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Founder', 22, sigSectionY + 31.2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(29, 78, 216);
  doc.text('AIPP TOEFL TEAM', 22, sigSectionY + 35.8);

  // Center metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Issue Date', 105, sigSectionY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(issueDateStr, 105, sigSectionY + 19);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Certificate ID', 105, sigSectionY + 27);
  doc.setFont('courier', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(attempt.id, 105, sigSectionY + 32);

  // Right: Verification QR Code
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', pageW - 47, sigSectionY + 3, 27, 27);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Independent Record QR', pageW - 33.5, sigSectionY + 34, { align: 'center' });
  }

  // Mandatory Transparency Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(19, 265, pageW - 19, 265);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(100, 116, 139);
  const disclaimer =
    'This certificate documents the results of an independent TOEFL iBT practice simulation conducted on the AIPP TOEFL TEAM platform. It is not issued, verified, or endorsed by ETS. The founder signature authenticates this simulation report as an AIPP TOEFL TEAM-issued educational record only.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageW - 38);
  doc.text(disclaimerLines, pageW / 2, 270.5, { align: 'center' });

  // =========================================================================
  // PAGE 2: DETAILED SCORE ANALYSIS
  // =========================================================================
  doc.addPage();
  drawPageHeader(doc, 'Detailed Score Analysis', attempt.id, pageW);

  let y = 34;

  // Section Breakdown with Visual Progress Bars
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(11, 23, 51);
  doc.text('1. Section Performance Breakdown (2026 1.0–6.0 Scale)', 18, y);
  y += 7;

  sections.forEach((sec) => {
    const score = attempt.sectionScores[sec.key];
    const summary = attempt.sectionSummaries[sec.key];
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(18, y, pageW - 36, 19, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(sec.label, 23, y + 7);

    doc.setFont('courier', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(29, 78, 216);
    doc.text(`${score.toFixed(1)} / 6.0`, pageW - 23, y + 7, { align: 'right' });

    // Bar track
    const barX = 23;
    const barW = pageW - 46;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, y + 10.5, barW, 3.2, 1.2, 1.2, 'F');
    doc.setFillColor(29, 78, 216);
    doc.roundedRect(barX, y + 10.5, Math.max(4, (score / 6) * barW), 3.2, 1.2, 1.2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(100, 116, 139);
    const metaText = summary
      ? `Accuracy: ${summary.accuracyPct}% (${summary.rawCorrect}/${summary.rawTotal})  ·  Avg Pace: ${summary.avgResponseTimeSec}s${
          summary.adaptiveTier ? `  ·  Adaptive Stage: ${summary.adaptiveTier}` : ''
        }`
      : 'Estimated Band based on completed responses';
    doc.text(metaText, 23, y + 17);
    y += 22;
  });

  // Task-Type Accuracy Table
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(11, 23, 51);
  doc.text('2. Accuracy by 2026 TOEFL iBT Task Type', 18, y);
  y += 6;

  doc.setFillColor(11, 23, 51);
  doc.rect(18, y, pageW - 36, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Task Type', 22, y + 5.2);
  doc.text('Section', 112, y + 5.2);
  doc.text('Items', 148, y + 5.2);
  doc.text('Accuracy', pageW - 22, y + 5.2, { align: 'right' });
  y += 7.5;

  const taskStats = attempt.taskTypeStats.slice(0, 10);
  taskStats.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(18, y, pageW - 36, 7, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);
    doc.text(formatTaskTypeLabel(row.taskType), 22, y + 4.8);
    doc.text(row.section.charAt(0).toUpperCase() + row.section.slice(1), 112, y + 4.8);
    doc.setFont('courier', 'normal');
    doc.text(`${row.correct}/${row.total}`, 148, y + 4.8);
    doc.text(`${row.accuracy}%`, pageW - 22, y + 4.8, { align: 'right' });
    y += 7;
  });

  // Strengths & Weaknesses + Study Recommendations
  y += 8;
  const colW = (pageW - 42) / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(11, 23, 51);
  doc.text('3. Key Strengths', 18, y);
  doc.text('4. Priority Growth Areas', 18 + colW + 6, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  doc.setTextColor(51, 65, 85);

  let leftY = y;
  (attempt.strengths.length ? attempt.strengths : ['Consistent task completion across sections.'])
    .slice(0, 4)
    .forEach((s) => {
      const lines = doc.splitTextToSize(`• ${s}`, colW);
      doc.text(lines, 18, leftY);
      leftY += lines.length * 4.2 + 1.5;
    });

  let rightY = y;
  (attempt.weaknesses.length ? attempt.weaknesses : ['Continue refining upper-adaptive academic precision.'])
    .slice(0, 4)
    .forEach((w) => {
      const lines = doc.splitTextToSize(`• ${w}`, colW);
      doc.text(lines, 18 + colW + 6, rightY);
      rightY += lines.length * 4.2 + 1.5;
    });

  y = Math.max(leftY, rightY) + 6;
  if (y < 252) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(11, 23, 51);
    doc.text('5. Next Study Plan Recommendations & Score Interpretation', 18, y);
    y += 5.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.4);
    doc.setTextColor(51, 65, 85);
    attempt.recommendations.slice(0, 3).forEach((rec, idx) => {
      const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageW - 36);
      doc.text(lines, 18, y);
      y += lines.length * 4.2 + 1.5;
    });

    y += 3;
    doc.setFontSize(7.6);
    doc.setTextColor(100, 116, 139);
    const note = doc.splitTextToSize(
      `Score Confidence: ${attempt.confidenceLabel}. Estimated 1–6 scores are modeled for educational guidance using difficulty weighting and analytical rubrics. Official ETS TOEFL iBT scores rely on proprietary psychometric equating and human/automated scoring.`,
      pageW - 36
    );
    doc.text(note, 18, y);
  }

  drawPageFooter(doc, 2, 3, pageW, pageH);

  // =========================================================================
  // PAGE 3: DETAILED FEEDBACK (WRITING, SPEAKING & MISTAKE ANALYSIS)
  // =========================================================================
  doc.addPage();
  drawPageHeader(doc, 'Detailed Feedback & Mistake Review', attempt.id, pageW);

  let py = 34;

  // Writing Feedback
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(11, 23, 51);
  doc.text('1. Analytical Writing Feedback', 18, py);
  py += 6;

  if (attempt.writingEvaluations.length > 0) {
    attempt.writingEvaluations.slice(0, 2).forEach((w) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(18, py, pageW - 36, 30, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${formatTaskTypeLabel(w.taskType)} — ${w.promptTitle}`, 22, py + 6);
      doc.setTextColor(29, 78, 216);
      doc.text(`Band ${w.evaluation.bandScore.toFixed(1)} (${w.wordCount} words)`, pageW - 22, py + 6, {
        align: 'right',
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const sumLines = doc.splitTextToSize(w.evaluation.summary, pageW - 44);
      doc.text(sumLines.slice(0, 2), 22, py + 12);

      const impText = `Next Step: ${w.evaluation.improvements[0] || 'Keep building lexical precision.'}`;
      const impLines = doc.splitTextToSize(impText, pageW - 44);
      doc.setTextColor(15, 23, 42);
      doc.text(impLines.slice(0, 2), 22, py + 22);
      py += 34;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No extended Writing essays were recorded in this session.', 18, py + 4);
    py += 11;
  }

  // Speaking Feedback
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(11, 23, 51);
  doc.text('2. Speaking Assessment Summary', 18, py);
  py += 6;

  if (attempt.speakingEvaluations.length > 0) {
    attempt.speakingEvaluations.slice(0, 2).forEach((s) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(18, py, pageW - 36, 29, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${formatTaskTypeLabel(s.taskType)} — ${s.promptTitle}`, 22, py + 6);
      doc.setTextColor(29, 78, 216);
      doc.text(`Band ${s.evaluation.bandScore.toFixed(1)}`, pageW - 22, py + 6, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const sumLines = doc.splitTextToSize(s.evaluation.summary, pageW - 44);
      doc.text(sumLines.slice(0, 2), 22, py + 12);

      doc.setFontSize(7.2);
      doc.setTextColor(100, 116, 139);
      const discLines = doc.splitTextToSize(s.evaluation.disclosure, pageW - 44);
      doc.text(discLines.slice(0, 2), 22, py + 21);
      py += 33;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No Speaking evaluation transcripts were recorded in this session.', 18, py + 4);
    py += 11;
  }

  // Mistake Analysis
  py += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(11, 23, 51);
  doc.text('3. Mistake Analysis & Skill Remediation', 18, py);
  py += 6;

  if (attempt.mistakes.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 163, 74);
    doc.text('Zero objective mistakes recorded in this attempt — outstanding accuracy.', 18, py + 4);
  } else {
    attempt.mistakes.slice(0, 4).forEach((m, idx) => {
      if (py > 246) return;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(18, py, pageW - 36, 26, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.4);
      doc.setTextColor(11, 23, 51);
      const qHead = doc.splitTextToSize(
        `${idx + 1}. [${m.section.toUpperCase()} · ${m.skillFocus}] ${m.questionPrompt}`,
        pageW - 44
      );
      doc.text(qHead[0], 22, py + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(185, 28, 28);
      doc.text(
        doc.splitTextToSize(`Your Answer: ${m.userAnswer}`, pageW - 44)[0],
        22,
        py + 11.2
      );
      doc.setTextColor(21, 128, 61);
      doc.text(
        doc.splitTextToSize(`Correct Answer: ${m.correctAnswer}`, pageW - 44)[0],
        22,
        py + 16.2
      );
      doc.setTextColor(71, 85, 105);
      doc.text(
        doc.splitTextToSize(`Why: ${m.explanation}`, pageW - 44)[0],
        22,
        py + 21.8
      );
      py += 29;
    });
  }

  drawPageFooter(doc, 3, 3, pageW, pageH);

  const safeName = (candidateName || 'Candidate').replace(/[^a-zA-Z0-9_-]+/g, '_');
  const filename = `AIPP_TOEFL_TEAM_Simulation_Certificate_${safeName}_${attempt.id}.pdf`;

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

function drawPageHeader(doc: jsPDF, title: string, reportId: string, pageW: number) {
  doc.setFillColor(11, 23, 51);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 22, pageW, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`AIPP TOEFL TEAM  ·  ${title}`, 18, 13.5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(186, 230, 253);
  doc.text(`Report ID: ${reportId}`, pageW - 18, 13.5, { align: 'right' });
}

function drawPageFooter(doc: jsPDF, pageNum: number, totalPages: number, pageW: number, pageH: number) {
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(18, pageH - 16, pageW - 18, pageH - 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'AIPP TOEFL TEAM · Independent Practice Simulation Report (Not affiliated with or endorsed by ETS)',
    18,
    pageH - 10
  );
  doc.text(`Page ${pageNum} of ${totalPages}`, pageW - 18, pageH - 10, { align: 'right' });
}
