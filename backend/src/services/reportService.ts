import { prisma } from '../lib/prisma';
import PDFDocument from 'pdfkit';
import { Response } from 'express';



export async function generateApplicationPdf(applicationId: string, res: Response) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      institution: true,
      applicant: true,
      assignedOfficer: true,
      documents: {
        include: {
          extractedFields: true
        }
      },
      validationResults: true,
      anomalyFlags: true,
      reviewDecisions: {
        include: { officer: true }
      }
    }
  });

  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Verification_Report_${app.applicationNumber}.pdf"`
  );

  doc.pipe(res);

  // Header
  doc
    .rect(40, 40, 515, 60)
    .fill('#0B132B');

  doc
    .fillColor('#00F0FF')
    .fontSize(10)
    .text('DOCUSURE AI REGULATORY VERIFICATION SYSTEM', 55, 52, { characterSpacing: 1.5 });

  doc
    .fillColor('#FFFFFF')
    .fontSize(16)
    .text('STATUTORY COMPLIANCE & AI AUDIT REPORT', 55, 68);

  doc
    .fillColor('#94A3B8')
    .fontSize(9)
    .text('AICTE Verification Division • Automated Evidence Dossier', 55, 87);

  // Core Metadata Box
  doc.moveDown(3);
  const startY = 120;
  doc
    .rect(40, startY, 515, 80)
    .stroke('#E2E8F0');

  doc
    .fillColor('#64748B')
    .fontSize(8)
    .text('APPLICATION ID', 55, startY + 12);
  doc
    .fillColor('#0F172A')
    .fontSize(12)
    .text(app.applicationNumber, 55, startY + 24);

  doc
    .fillColor('#64748B')
    .fontSize(8)
    .text('INSTITUTION', 200, startY + 12);
  doc
    .fillColor('#0F172A')
    .fontSize(11)
    .text(app.institution.name, 200, startY + 24);

  doc
    .fillColor('#64748B')
    .fontSize(8)
    .text('TRUST SCORE', 430, startY + 12);
  doc
    .fillColor(app.overallTrustScore >= 80 ? '#10B981' : app.overallTrustScore >= 50 ? '#F59E0B' : '#EF4444')
    .fontSize(18)
    .text(`${app.overallTrustScore}/100`, 430, startY + 24);

  doc
    .fillColor('#64748B')
    .fontSize(8)
    .text(`Status: ${app.status} | Academic Year: ${app.academicYear} | Category: ${app.programCategory}`, 55, startY + 55);

  // Executive AI Summary
  doc.moveDown(5);
  doc
    .fillColor('#1E293B')
    .fontSize(12)
    .text('Executive AI Finding & Evidence Summary', 40, 220);

  doc
    .rect(40, 238, 515, 45)
    .fill('#F8FAFC');

  doc
    .fillColor('#334155')
    .fontSize(9)
    .text(app.aiSummary || 'AI verification completed with no critical flags.', 50, 248, { width: 495 });

  // Document Inventory Table
  doc.moveDown(4);
  let currentY = 300;
  doc
    .fillColor('#1E293B')
    .fontSize(12)
    .text('Uploaded Document Scrutiny Inventory', 40, currentY);

  currentY += 20;
  doc
    .rect(40, currentY, 515, 20)
    .fill('#0F1A34');

  doc.fillColor('#FFFFFF').fontSize(8);
  doc.text('DOCUMENT TYPE', 50, currentY + 6);
  doc.text('STATUS', 180, currentY + 6);
  doc.text('TRUST SCORE', 260, currentY + 6);
  doc.text('SHA-256 HASH REF', 350, currentY + 6);

  currentY += 20;
  for (const d of app.documents) {
    doc
      .rect(40, currentY, 515, 22)
      .fill(currentY % 40 === 0 ? '#FFFFFF' : '#F8FAFC');

    doc
      .fillColor('#0F172A')
      .fontSize(8)
      .text(d.documentType, 50, currentY + 6);

    doc
      .fillColor(d.status === 'VALIDATED' ? '#10B981' : '#EF4444')
      .text(d.status, 180, currentY + 6);

    doc
      .fillColor('#0F172A')
      .text(`${d.trustScore}%`, 260, currentY + 6);

    doc
      .fillColor('#64748B')
      .text(d.sha256Hash.slice(0, 20) + '...', 350, currentY + 6);

    currentY += 22;
  }

  // Anomaly Flags Section
  currentY += 15;
  doc
    .fillColor('#1E293B')
    .fontSize(12)
    .text('Integrity Anomaly Flags & Forensic Findings', 40, currentY);

  currentY += 20;
  if (app.anomalyFlags.length === 0) {
    doc
      .fillColor('#10B981')
      .fontSize(9)
      .text('✔ No forensic anomalies or integrity violations detected.', 40, currentY);
    currentY += 20;
  } else {
    for (const flag of app.anomalyFlags) {
      doc
        .rect(40, currentY, 515, 45)
        .fill('#FEF2F2')
        .stroke('#F87171');

      doc
        .fillColor('#B91C1C')
        .fontSize(9)
        .text(`[${flag.severity}] ${flag.title} (Confidence: ${(flag.confidenceScore * 100).toFixed(0)}%)`, 50, currentY + 6);

      doc
        .fillColor('#7F1D1D')
        .fontSize(8)
        .text(flag.evidenceSummary, 50, currentY + 20, { width: 495 });

      currentY += 50;
    }
  }

  // Officer Decision Block (Notice "AI assists, officers decide")
  currentY += 10;
  doc
    .rect(40, currentY, 515, 60)
    .fill('#F0FDF4')
    .stroke('#86EFAC');

  doc
    .fillColor('#166534')
    .fontSize(10)
    .text('OFFICER REGULATORY DETERMINATION', 50, currentY + 8);

  const latestDecision = app.reviewDecisions[0];
  if (latestDecision) {
    doc
      .fillColor('#15803D')
      .fontSize(9)
      .text(`Decision: ${latestDecision.decision} | Verified By: ${latestDecision.officer.name}`, 50, currentY + 24);
    doc
      .fillColor('#14532D')
      .fontSize(8)
      .text(`Remarks: ${latestDecision.remarks}`, 50, currentY + 38, { width: 495 });
  } else {
    doc
      .fillColor('#15803D')
      .fontSize(9)
      .text('Status: Awaiting Verification Officer Review & Adjudication', 50, currentY + 24);
    doc
      .fillColor('#64748B')
      .fontSize(8)
      .text('Statutory Covenant: AI provides evidence, not verdicts. Final verdict reserved for authorized Officer.', 50, currentY + 38);
  }

  // Footer
  doc
    .fillColor('#94A3B8')
    .fontSize(8)
    .text(
      'Docusure AI | Digitizing Verification. Ensuring Compliance. Building a Transparent Future.',
      40,
      780,
      { align: 'center', width: 515 }
    );

  doc.end();
}

export async function generateApplicationCsv(applicationId: string, res: Response) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      institution: true,
      documents: true,
      validationResults: true,
      anomalyFlags: true,
      reviewDecisions: true
    }
  });

  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Export_${app.applicationNumber}.csv"`
  );

  let csv = 'ApplicationNumber,Institution,AcademicYear,ProgramCategory,Status,TrustScore,DocumentCount,AnomalyCount,ValidationFails,LatestDecision\n';
  const valFails = app.validationResults.filter((v) => v.status === 'FAIL').length;
  const decision = app.reviewDecisions[0]?.decision || 'NONE';

  csv += `"${app.applicationNumber}","${app.institution.name}","${app.academicYear}","${app.programCategory}","${app.status}",${app.overallTrustScore},${app.documents.length},${app.anomalyFlags.length},${valFails},"${decision}"\n\n`;

  csv += 'Documents Scrutiny Detail:\n';
  csv += 'DocumentType,FileName,Status,TrustScore,SHA256,IsTampered\n';
  for (const d of app.documents) {
    csv += `"${d.documentType}","${d.originalName}","${d.status}",${d.trustScore},"${d.sha256Hash}",${d.isTampered}\n`;
  }

  csv += '\nIntegrity Anomaly Flags:\n';
  csv += 'Type,Severity,Confidence,Title,Evidence,SuggestedAction\n';
  for (const a of app.anomalyFlags) {
    csv += `"${a.flagType}","${a.severity}",${a.confidenceScore},"${a.title.replace(/"/g, '""')}","${a.evidenceSummary.replace(/"/g, '""')}","${a.suggestedAction.replace(/"/g, '""')}"\n`;
  }

  res.send(csv);
}
