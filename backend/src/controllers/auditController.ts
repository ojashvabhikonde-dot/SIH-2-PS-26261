import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export async function getAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const { applicationId, action, limit = '50', offset = '0' } = req.query;

    const whereClause: any = {};
    if (applicationId) {
      whereClause.applicationId = String(applicationId);
    }
    if (action) {
      whereClause.action = String(action);
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, role: true, email: true }
        },
        application: {
          select: { id: true, applicationNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(100, parseInt(String(limit), 10)),
      skip: parseInt(String(offset), 10)
    });

    const total = await prisma.auditLog.count({ where: whereClause });

    res.json({ logs, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
}
