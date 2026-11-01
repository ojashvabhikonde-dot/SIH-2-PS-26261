import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';



export async function submitDecision(req: AuthenticatedRequest, res: Response) {
  try {
    const { applicationId, decision, remarks, conditions } = req.body;
    const officer = req.user!;

    if (!applicationId || !decision || !remarks) {
      res.status(400).json({ error: 'applicationId, decision, and mandatory remarks are required' });
      return;
    }

    if (!['APPROVED', 'REJECTED', 'CLARIFICATION_REQUESTED'].includes(decision)) {
      res.status(400).json({ error: 'Decision must be APPROVED, REJECTED, or CLARIFICATION_REQUESTED' });
      return;
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { applicant: true }
    });

    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // 1. Create ReviewDecision record
    const reviewDecision = await prisma.reviewDecision.create({
      data: {
        applicationId,
        officerId: officer.id,
        decision,
        remarks,
        conditions: conditions || null
      }
    });

    // 2. Update Application status
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: decision,
        assignedOfficerId: officer.id,
        decidedAt: new Date()
      }
    });

    // 3. Create AuditLog entry
    await prisma.auditLog.create({
      data: {
        applicationId,
        userId: officer.id,
        action: `OFFICER_DECISION_${decision}`,
        details: `Verification Officer ${officer.name} recorded decision "${decision}". Remarks: "${remarks}".`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    // 4. Send Notification to Applicant
    const notifType = decision === 'APPROVED' ? 'SUCCESS' : decision === 'REJECTED' ? 'DANGER' : 'WARNING';
    await prisma.notification.create({
      data: {
        userId: app.applicantId,
        title: `Regulatory Determination: Application ${app.applicationNumber}`,
        message: `Your application has been marked ${decision} by Officer ${officer.name}. Remarks: ${remarks}`,
        type: notifType,
        link: `/applications/${app.applicationNumber}`
      }
    });

    res.json({
      message: 'Decision submitted successfully',
      reviewDecision,
      status: decision
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit review decision' });
  }
}
