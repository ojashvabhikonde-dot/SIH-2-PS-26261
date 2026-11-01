import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth';


const JWT_SECRET = process.env.JWT_SECRET || 'sih26261-super-secure-secret-key-2026';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { institution: true }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        institutionId: user.institutionId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: `User ${user.name} logged in with role ${user.role}.`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation,
        institutionId: user.institutionId,
        institution: user.institution
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function demoLogin(req: Request, res: Response) {
  try {
    const { role } = req.body; // "APPLICANT" | "OFFICER" | "ADMIN"
    if (!role || !['APPLICANT', 'OFFICER', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Valid demo role (APPLICANT, OFFICER, ADMIN) required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { role },
      include: { institution: true }
    });

    if (!user) {
      res.status(404).json({ error: `Demo user for role ${role} not found` });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        institutionId: user.institutionId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DEMO_LOGIN',
        details: `One-click demo login triggered as ${user.role} (${user.name}).`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation,
        institutionId: user.institutionId,
        institution: user.institution
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { institution: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation,
        institutionId: user.institutionId,
        institution: user.institution
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role = 'APPLICANT', designation, institutionId, newInstitutionName, institutionCode, institutionState } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const assignedRole = ['APPLICANT', 'OFFICER', 'ADMIN'].includes(role) ? role : 'APPLICANT';
    let targetInstitutionId = institutionId || null;

    // If new institution is provided by applicant
    if (!targetInstitutionId && newInstitutionName && newInstitutionName.trim()) {
      const code = institutionCode || `INST-${Date.now().toString().slice(-6)}`;
      const newInst = await prisma.institution.create({
        data: {
          name: newInstitutionName.trim(),
          code: code.trim().toUpperCase(),
          type: 'COLLEGE',
          state: institutionState || 'National',
          address: 'Campus Main Gate, Institutional Area',
          contactEmail: email.toLowerCase().trim(),
          contactPhone: '+91-9876543210',
          establishedYear: new Date().getFullYear(),
          accreditedStatus: 'Affiliated'
        }
      });
      targetInstitutionId = newInst.id;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: passwordHash,
        role: assignedRole,
        designation: designation || (assignedRole === 'APPLICANT' ? 'Authorized Representative' : 'Scrutiny Officer'),
        institutionId: targetInstitutionId
      },
      include: {
        institution: true
      }
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        institutionId: newUser.institutionId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_REGISTER',
        details: `New account registered for ${newUser.name} as ${newUser.role}.`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        designation: newUser.designation,
        institutionId: newUser.institutionId,
        institution: newUser.institution
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to register account' });
  }
}

export async function getInstitutionsPublic(_req: Request, res: Response) {
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        state: true
      }
    });
    res.json({ institutions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch institutions' });
  }
}
