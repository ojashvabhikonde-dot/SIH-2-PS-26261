import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { runAiPipeline, addScanListener, removeScanListener } from '../services/aiPipelineService';

const prisma = new PrismaClient();

export async function getApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, programCategory, search, risk } = req.query;
    const user = req.user;

    const whereClause: any = {};

    // Applicant scoping
    if (user?.role === 'APPLICANT' && user.institutionId) {
      whereClause.institutionId = user.institutionId;
    }

    if (status && status !== 'ALL') {
      whereClause.status = String(status);
    }

    if (programCategory && programCategory !== 'ALL') {
      whereClause.programCategory = String(programCategory);
    }

    if (risk) {
      if (risk === 'HIGH') {
        whereClause.overallTrustScore = { lte: 60 };
      } else if (risk === 'MEDIUM') {
        whereClause.overallTrustScore = { gt: 60, lte: 85 };
      } else if (risk === 'LOW') {
        whereClause.overallTrustScore = { gt: 85 };
      }
    }

    if (search) {
      const q = String(search).toLowerCase();
      whereClause.OR = [
        { applicationNumber: { contains: q } },
        { institution: { name: { contains: q } } }
      ];
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        institution: true,
        documents: true,
        anomalyFlags: true,
        validationResults: true,
        reviewDecisions: {
          include: { officer: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ applications });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch applications' });
  }
}

export async function getApplicationById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const application = await prisma.application.findFirst({
      where: {
        OR: [
          { id },
          { applicationNumber: id }
        ]
      },
      include: {
        institution: true,
        applicant: {
          select: { id: true, name: true, email: true, designation: true }
        },
        assignedOfficer: {
          select: { id: true, name: true, email: true, designation: true }
        },
        documents: {
          include: {
            extractedFields: true,
            validationResults: true,
            anomalyFlags: true
          }
        },
        validationResults: true,
        anomalyFlags: true,
        reviewDecisions: {
          include: {
            officer: { select: { id: true, name: true, designation: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        auditLogs: {
          include: {
            user: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    res.json({ application });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch application' });
  }
}

export async function createApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user!;
    const { programCategory, academicYear, institutionId } = req.body;

    let targetInstId = institutionId || user.institutionId;
    if (!targetInstId) {
      const firstInst = await prisma.institution.findFirst();
      if (!firstInst) {
        res.status(400).json({ error: 'Institution ID required' });
        return;
      }
      targetInstId = firstInst.id;
    }

    // Generate unique Application ID
    const count = await prisma.application.count();
    const appNumber = `APP-2024-${String(count + 1).padStart(3, '0')}`;

    const application = await prisma.application.create({
      data: {
        applicationNumber: appNumber,
        institutionId: targetInstId,
        applicantId: user.id,
        academicYear: academicYear || '2024-25',
        programCategory: programCategory || 'ENGINEERING',
        status: 'DRAFT',
        overallTrustScore: 0,
        aiSummary: 'Draft application created. Awaiting statutory document uploads.'
      },
      include: {
        institution: true
      }
    });

    await prisma.auditLog.create({
      data: {
        applicationId: application.id,
        userId: user.id,
        action: 'APPLICATION_CREATED',
        details: `Application ${appNumber} created by ${user.name}.`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    res.status(201).json({ application });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create application' });
  }
}

export async function submitApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const app = await prisma.application.findUnique({
      where: { id },
      include: { documents: true }
    });

    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (app.documents.length === 0) {
      res.status(400).json({ error: 'Please upload at least one document before submitting' });
      return;
    }

    await prisma.application.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        applicationId: id,
        userId: user.id,
        action: 'APPLICATION_SUBMITTED',
        details: `Application ${app.applicationNumber} submitted by ${user.name} with ${app.documents.length} documents.`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    // Trigger AI pipeline asynchronously
    runAiPipeline(id).catch((err) => {
      console.error('Async AI Pipeline Execution Error:', err);
    });

    res.json({
      message: 'Application submitted successfully. AI verification initiated.',
      applicationId: id,
      status: 'PROCESSING'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
}

export async function triggerAiScan(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Trigger pipeline in background
    runAiPipeline(id).catch((err) => {
      console.error('AI pipeline trigger error:', err);
    });

    res.json({ message: 'AI Scan pipeline initiated', applicationId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to trigger scan' });
  }
}

export async function scanStream(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const onProgress = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (data.isComplete) {
      removeScanListener(id, onProgress);
    }
  };

  addScanListener(id, onProgress);

  // Send initial heartbeat
  res.write(`data: ${JSON.stringify({ step: 'OCR', progress: 5, message: 'Connected to AI Pipeline SSE stream.', logLine: '[STREAM] Connected' })}\n\n`);

  req.on('close', () => {
    removeScanListener(id, onProgress);
  });
}
