import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';



export async function getRules(req: AuthenticatedRequest, res: Response) {
  try {
    const rules = await prisma.complianceRule.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ rules });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch rules' });
  }
}

export async function createRule(req: AuthenticatedRequest, res: Response) {
  try {
    const { code, title, description, category, ruleJson, severity, isActive } = req.body;

    if (!code || !title || !description || !category || !ruleJson) {
      res.status(400).json({ error: 'All fields (code, title, description, category, ruleJson) required' });
      return;
    }

    const rule = await prisma.complianceRule.create({
      data: {
        code,
        title,
        description,
        category,
        ruleJson: typeof ruleJson === 'object' ? JSON.stringify(ruleJson) : ruleJson,
        severity: severity || 'CRITICAL',
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'RULE_CREATED',
        details: `Rule "${title}" (${code}) created by Admin.`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    res.status(201).json({ rule });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create rule' });
  }
}

export async function updateRule(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, category, ruleJson, severity, isActive } = req.body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (category !== undefined) dataToUpdate.category = category;
    if (ruleJson !== undefined) {
      dataToUpdate.ruleJson = typeof ruleJson === 'object' ? JSON.stringify(ruleJson) : ruleJson;
    }
    if (severity !== undefined) dataToUpdate.severity = severity;
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    const rule = await prisma.complianceRule.update({
      where: { id },
      data: dataToUpdate
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'RULE_UPDATED',
        details: `Rule "${rule.title}" updated by Admin.`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    res.json({ rule });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update rule' });
  }
}

export async function toggleRule(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.complianceRule.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }

    const updated = await prisma.complianceRule.update({
      where: { id },
      data: { isActive: !existing.isActive }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'RULE_TOGGLED',
        details: `Rule "${updated.title}" ${updated.isActive ? 'activated' : 'deactivated'} by Admin.`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    res.json({ rule: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to toggle rule' });
  }
}
