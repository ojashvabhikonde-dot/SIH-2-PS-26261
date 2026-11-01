import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as applicationController from '../controllers/applicationController';
import * as documentController from '../controllers/documentController';
import * as rulesController from '../controllers/rulesController';
import * as reviewController from '../controllers/reviewController';
import * as analyticsController from '../controllers/analyticsController';
import * as auditController from '../controllers/auditController';
import * as notificationController from '../controllers/notificationController';
import { generateApplicationPdf, generateApplicationCsv } from '../services/reportService';


const router = Router();

// Configure Multer storage
const uploadDir = path.resolve(__dirname, '../../../storage/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
});

// AUTH
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/demo-login', authController.demoLogin);
router.get('/auth/institutions', authController.getInstitutionsPublic);
router.get('/auth/me', authenticateToken, authController.me);

// INSTITUTIONS
router.get('/institutions', authenticateToken, async (_req, res) => {
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ institutions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// APPLICATIONS
router.get('/applications', authenticateToken, applicationController.getApplications);
router.get('/applications/:id', authenticateToken, applicationController.getApplicationById);
router.post('/applications', authenticateToken, applicationController.createApplication);
router.post('/applications/:id/submit', authenticateToken, applicationController.submitApplication);
router.post('/applications/:id/scan', authenticateToken, applicationController.triggerAiScan);
router.get('/applications/:id/scan-stream', applicationController.scanStream);

// DOCUMENTS
router.post('/documents/upload', authenticateToken, upload.single('file'), documentController.uploadDocument);
router.delete('/documents/:id', authenticateToken, documentController.deleteDocument);

// COMPLIANCE RULES
router.get('/rules', authenticateToken, rulesController.getRules);
router.post('/rules', authenticateToken, requireRole(['ADMIN']), rulesController.createRule);
router.put('/rules/:id', authenticateToken, requireRole(['ADMIN']), rulesController.updateRule);
router.patch('/rules/:id/toggle', authenticateToken, requireRole(['ADMIN']), rulesController.toggleRule);

// REVIEWS
router.post('/reviews', authenticateToken, requireRole(['OFFICER', 'ADMIN']), reviewController.submitDecision);

// REPORTS
router.get('/reports/:applicationId/pdf', authenticateToken, async (req, res) => {
  await generateApplicationPdf(req.params.applicationId, res);
});
router.get('/reports/:applicationId/csv', authenticateToken, async (req, res) => {
  await generateApplicationCsv(req.params.applicationId, res);
});

// ANALYTICS
router.get('/analytics', authenticateToken, analyticsController.getAnalytics);

// AUDIT LOGS
router.get('/audit', authenticateToken, auditController.getAuditLogs);

// NOTIFICATIONS
router.get('/notifications', authenticateToken, notificationController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, notificationController.markAsRead);

export default router;
