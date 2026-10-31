# SIH26261: AI-Powered Application Validation, Document Authentication & Regulatory Compliance Platform

> *"From Documents to Decisions, Powered by AI, Built for Trust."*

---

## 1. Executive Summary & Problem Solved
Manual verification of institutional applications (colleges/universities applying to regulatory bodies like AICTE) is slow, error-prone, and resource-intensive:
- **Missing or incomplete documents**
- **Expired regulatory clearances**
- **Fake, altered, or duplicate documents**
- **Inconsistent data across records** (e.g. legal entity name mismatches)
- **Heavy officer workload and approval bottlenecks**

### The Solution
An end-to-end regulatory platform that automates document intake, executes neural OCR, computes cryptographic hash cross-references, validates dynamic compliance rules, detects image tampering via Error Level Analysis (ELA), and equips verification officers with explainable evidence.

> **CORE PRINCIPLE**: **"AI provides evidence, not verdicts. The final decision always rests with an authorized officer."**

---

## 2. System Architecture

```
                                  ┌─────────────────────────────────────┐
                                  │       React + TypeScript SPA        │
                                  │  Tailwind CSS • Framer Motion • SSE │
                                  │        Port 5173 (or 80)            │
                                  └──────────────────┬──────────────────┘
                                                     │ HTTP & SSE Streams
                                                     ▼
                                  ┌─────────────────────────────────────┐
                                  │      Node.js Express + TS API       │
                                  │  Prisma ORM • JWT RBAC • PDF Engine │
                                  │              Port 5000              │
                                  └──────────┬────────────────┬─────────┘
                                             │                │
                          Internal AI Bridge │                │ Prisma Client
                                             ▼                ▼
                     ┌─────────────────────────────┐   ┌────────────────────────┐
                     │   Python FastAPI Service    │   │  PostgreSQL / SQLite   │
                     │  OpenCV ELA • Tesseract OCR │   │  11 Relational Models  │
                     │   QR Authentication Reg.    │   │      Port 5432 / DB    │
                     │          Port 8000          │   └────────────────────────┘
                     └─────────────────────────────┘
```

---

## 3. Demo Personas & Credentials

The platform includes **1-Click Demo Login** buttons on the login page for instantaneous evaluation:

| Role | Persona Name | Email | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Applicant** | Dr. Rajesh Sharma | `applicant@apex.edu` | `password123` | Institutional applicant for *Apex Institute of Technology*. Create applications, upload statutory certificates, track live progress, respond to clarifications. |
| **Verification Officer** | Smt. Priya Sundaram | `officer@aicte.gov.in` | `password123` | Senior Verification Officer (AICTE). Access triage queue, Risk Heatmap, Kanban & Table views, Evidence Viewer with bounding boxes, Adjudicate verdicts (Approve / Reject / Clarification). |
| **System Admin** | Shri Amitabh Roy | `admin@aicte.gov.in` | `password123` | Chief Compliance Officer. Executive analytics (velocity funnel, flag distribution, risk breakdown), dynamic compliance rules catalog, immutable system audit logs. |

---

## 4. The 7 Signature Interactions (All Built & Active)

1. **AI Scan Animation & Stepper**: Live 5-stage pipeline stepper (*OCR -> Anomaly Forensics -> Cross-Match Validation -> Regulatory Rules -> Evidence Dossier*) with real-time SSE progress and streaming console log terminal.
2. **Trust Score Radial Ring**: Animated SVG gauge (0-100) that color-shifts (*Emerald &ge;85, Amber 60-84, Rose &le;60*) with an expandable *"Why this score?"* modal explaining the 4 weighted scoring pillars and penalty deductions.
3. **Side-by-Side Evidence Viewer**: Certificate preview on the left with glowing bounding box overlays, bidirectionally linked with extracted fields and anomaly findings on the right on hover.
4. **Verification Timeline**: Vertical chronological event stream connecting every document upload, AI neural scan, and officer adjudication with distinct avatars and timestamps.
5. **Command Palette (`Ctrl+K` / `Cmd+K`)**: Global search bar to instantly jump to applications, compliance rules, audit logs, or switch user personas.
6. **Officer Queue (Kanban + Table Switcher)**: Dual-mode review queue with drag-and-drop status transitions across *Submitted, High Risk, Under Review, Clarification, Approved, Rejected*.
7. **Explainability Panel**: Every finding structured into *What we found / Concrete Evidence / Confidence Score / Suggested Regulatory Action*, topped with the mandatory banner: *"AI assists, officers decide"*.

---

## 5. Seeded Test Scenarios (12 Applications)

| Application # | Institution | Scenario Covered | Trust Score | Status |
| :--- | :--- | :--- | :--- | :--- |
| `APP-2024-001` | Apex Institute of Technology | **Clean Approval**: All 4 documents valid, QR authentic, 100% rules pass. | **98/100** | `APPROVED` |
| `APP-2024-002` | Apex Institute of Technology | **Expired Certificate**: Fire NOC expired on 2023-11-10. | **62/100** | `NEEDS_ATTENTION` |
| `APP-2024-003` | Kaveri University of Science & Arts | **Mismatched Name**: Land deed lists "Kaveri Trust for Modern Education" instead of university accredited title. | **58/100** | `NEEDS_ATTENTION` |
| `APP-2024-004` | Metro Horizon Polytechnic | **Duplicate Reused Document**: Exact SHA-256 hash was previously filed by another campus. | **35/100** | `NEEDS_ATTENTION` |
| `APP-2024-005` | Metro Horizon Polytechnic | **Image Tampering**: ELA detects pixel manipulation (94% confidence) around expiry date over Building Plan. | **28/100** | `NEEDS_ATTENTION` |
| `APP-2024-006` | Apex Institute of Technology | **Missing Document**: Mandatory Building Safety Plan certificate absent. | **52/100** | `CLARIFICATION_REQUESTED` |
| `APP-2024-007` | Kaveri University of Science & Arts | **QR-Authentic Clearance**: Cryptographically verified via Central Educational Registry. | **96/100** | `UNDER_REVIEW` |
| `APP-2024-008` | Apex Institute of Technology | **New Program Submission**: Fresh application queued for officer triage. | **90/100** | `SUBMITTED` |
| `APP-2024-009` | Kaveri University of Science & Arts | **Approved with Conditions**: Sanctioned with fire drill logging covenants. | **94/100** | `APPROVED` |
| `APP-2024-010` | Metro Horizon Polytechnic | **Rejected Non-Compliant**: Repeated municipal setbacks non-compliance. | **41/100** | `REJECTED` |
| `APP-2024-011` | Kaveri University of Science & Arts | **Clarification Pending**: Balance sheet amendment requested. | **68/100** | `CLARIFICATION_REQUESTED` |
| `APP-2024-012` | Apex Institute of Technology | **Draft Mode**: Applicant assembling clearance attachments. | **0/100** | `DRAFT` |

---

## 6. How to Run Locally

### Option A: Docker Compose (Single Command)
```bash
docker compose up --build
```
This launches:
- `db`: PostgreSQL 15 on port `5432`
- `ai-service`: Python FastAPI AI engine on port `8000`
- `backend`: Node Express TypeScript API on port `5000`
- `frontend`: React SPA (Nginx) on port `5173` (mapped from 80)

---

### Option B: No-Docker Local Fallback (Instant Start)
The backend includes a zero-dependency dual-engine mode (SQLite + built-in AI verification fallback) that runs anywhere without requiring external databases or services.

#### 1. Setup Backend:
```bash
cd backend
npm install
npx prisma db push
npx tsx src/prisma/seed.ts
npm run dev
```
*Backend runs on `http://localhost:5000`.*  
*Interactive API docs available at `http://localhost:5000/docs`.*

#### 2. Setup Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

#### 3. Setup Python AI Service (Optional):
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

---

## 7. Regulatory Compliance & Data Model (11 Prisma Models)
- `User`: RBAC authentication (Applicant, Verification Officer, Admin).
- `Institution`: Accredited colleges and universities.
- `Application`: Institutional dossier tracking lifecycle status and Trust Score.
- `Document`: Uploaded statutory clearances with SHA-256 hashes and tamper flags.
- `ExtractedField`: OCR-parsed key-value pairs with spatial bounding boxes.
- `ValidationResult`: Format, expiry, and legal entity cross-match checks.
- `ComplianceRule`: Admin-configurable rules evaluated dynamically in JSON logic.
- `AnomalyFlag`: Image tampering (ELA), cross-application reuse, duplicate hashes.
- `ReviewDecision`: Human officer determinations with mandatory remarks and conditions.
- `AuditLog`: Immutable chronological ledger recording all actions with IP addresses.
- `Notification`: User alerts for status updates and clarification requests.

---

## 8. Footer & Statutory Branding
> **SIH26261 | Digitizing Verification. Ensuring Compliance. Building a Transparent Future.**  
> *AICTE Form 26-B Regulatory Framework • Ministry of Education & Regulatory Bodies*
