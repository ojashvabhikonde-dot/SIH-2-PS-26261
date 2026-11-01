import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file serving for uploaded/generated documents
const uploadDir = path.resolve(__dirname, '../../storage/uploads');
app.use('/uploads', express.static(uploadDir));

// API Router
app.use('/api', apiRouter);

// Simple Interactive API Docs endpoint
app.get('/docs', (_req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Docusure AI Platform API Documentation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #070D1E; color: #F1F5F9; padding: 40px; }
    h1 { color: #3A86FF; border-bottom: 2px solid #1E293B; padding-bottom: 12px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-right: 8px; }
    .get { background: #10B981; color: #000; }
    .post { background: #3A86FF; color: #fff; }
    .put { background: #F59E0B; color: #000; }
    .delete { background: #EF4444; color: #fff; }
    .endpoint { background: #0F1A34; border: 1px solid #1E293B; padding: 12px 18px; margin: 12px 0; border-radius: 8px; font-family: monospace; }
  </style>
</head>
<body>
  <h1>Docusure AI API Specification &amp; Endpoints</h1>
  <p>From Documents to Decisions, Powered by AI, Built for Trust.</p>
  
  <h2>Authentication &amp; User Scoping</h2>
  <div class="endpoint"><span class="badge post">POST</span> /api/auth/login - Standard credential login</div>
  <div class="endpoint"><span class="badge post">POST</span> /api/auth/demo-login - One-click login as APPLICANT, OFFICER, or ADMIN</div>
  <div class="endpoint"><span class="badge get">GET</span> /api/auth/me - Current user context</div>

  <h2>Applications &amp; AI Scanning</h2>
  <div class="endpoint"><span class="badge get">GET</span> /api/applications - List with filters (status, category, risk, search)</div>
  <div class="endpoint"><span class="badge get">GET</span> /api/applications/:id - Deep application record with evidence &amp; timeline</div>
  <div class="endpoint"><span class="badge post">POST</span> /api/applications - Create new application</div>
  <div class="endpoint"><span class="badge post">POST</span> /api/applications/:id/submit - Submit and trigger live AI scan</div>
  <div class="endpoint"><span class="badge post">POST</span> /api/applications/:id/scan - Re-run AI analysis pipeline</div>
  <div class="endpoint"><span class="badge get">GET</span> /api/applications/:id/scan-stream - Server-Sent Events (SSE) live stepper progress</div>

  <h2>Document Management</h2>
  <div class="endpoint"><span class="badge post">POST</span> /api/documents/upload - Multipart document upload &amp; SHA-256 calculation</div>
  <div class="endpoint"><span class="badge delete">DELETE</span> /api/documents/:id - Delete uploaded document</div>

  <h2>Regulatory Compliance &amp; Decisions</h2>
  <div class="endpoint"><span class="badge get">GET</span> /api/rules - List all compliance rules</div>
  <div class="endpoint"><span class="badge post">POST</span> /api/rules - Create new compliance rule (Admin)</div>
  <div class="endpoint"><span class="badge put">PUT</span> /api/rules/:id - Edit rule criteria (Admin)</div>
  <div class="endpoint"><span class="badge post">POST</span> /api/reviews - Officer decision (APPROVED, REJECTED, CLARIFICATION_REQUESTED)</div>

  <h2>Audit, Analytics &amp; Reports</h2>
  <div class="endpoint"><span class="badge get">GET</span> /api/reports/:id/pdf - Regulatory inspection PDF report</div>
  <div class="endpoint"><span class="badge get">GET</span> /api/reports/:id/csv - Compliance data CSV export</div>
  <div class="endpoint"><span class="badge get">GET</span> /api/analytics - Dashboard metrics, charts &amp; funnel</div>
  <div class="endpoint"><span class="badge get">GET</span> /api/audit - Immutable audit trail</div>
  <div class="endpoint"><span class="badge get">GET</span> /api/notifications - User notification feed</div>
</body>
</html>
  `);
});

// Root Healthcheck
app.get('/', (_req, res) => {
  res.json({
    name: 'Docusure AI Regulatory Compliance & AI Verification Platform',
    status: 'online',
    version: '1.0.0',
    tagline: 'From Documents to Decisions, Powered by AI, Built for Trust.',
    docs: '/docs'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Docusure AI Backend Server listening on http://localhost:${PORT}`);
  console.log(`📄 API Documentation available at http://localhost:${PORT}/docs`);
  console.log(`📂 Document uploads directory mounted from: ${uploadDir}`);
});
