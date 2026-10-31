export type UserRole = 'APPLICANT' | 'OFFICER' | 'ADMIN';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'NEEDS_ATTENTION'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLARIFICATION_REQUESTED';

export type Severity = 'INFO' | 'WARNING' | 'CRITICAL' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  designation?: string;
  institutionId?: string | null;
  institution?: Institution;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: string;
  state: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  establishedYear: number;
  accreditedStatus: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  page?: number;
}

export interface ExtractedField {
  id: string;
  documentId: string;
  fieldName: string;
  fieldValue: string;
  confidence: number;
  boundingBoxJson?: string;
  pageNumber: number;
}

export interface Document {
  id: string;
  applicationId: string;
  documentType: string;
  fileName: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  sha256Hash: string;
  trustScore: number;
  status: 'PENDING' | 'VALIDATED' | 'FLAGGED' | 'REJECTED';
  isTampered: boolean;
  ocrCompleted: boolean;
  extractedFields?: ExtractedField[];
  validationResults?: ValidationResult[];
  anomalyFlags?: AnomalyFlag[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationResult {
  id: string;
  applicationId: string;
  documentId?: string;
  checkType: string;
  severity: Severity;
  status: 'PASS' | 'FAIL';
  message: string;
  fieldName?: string;
  expectedValue?: string;
  actualValue?: string;
  createdAt: string;
}

export interface ComplianceRule {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'MANDATORY' | 'INFRASTRUCTURE' | 'ACADEMIC' | 'LEGAL';
  ruleJson: string;
  isActive: boolean;
  severity: 'WARNING' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
}

export interface AnomalyFlag {
  id: string;
  applicationId: string;
  documentId?: string;
  flagType: string;
  severity: Severity;
  confidenceScore: number;
  title: string;
  evidenceSummary: string;
  boundingBoxJson?: string;
  suggestedAction: string;
  createdAt: string;
}

export interface ReviewDecision {
  id: string;
  applicationId: string;
  officerId: string;
  officer: { id: string; name: string; designation?: string };
  decision: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
  remarks: string;
  conditions?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  applicationId?: string;
  userId?: string;
  user?: { id: string; name: string; role: string; email: string };
  application?: { id: string; applicationNumber: string };
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  applicationNumber: string;
  institutionId: string;
  institution: Institution;
  applicantId: string;
  applicant?: User;
  academicYear: string;
  programCategory: string;
  status: ApplicationStatus;
  overallTrustScore: number;
  aiSummary?: string;
  assignedOfficerId?: string | null;
  assignedOfficer?: User;
  documents: Document[];
  validationResults: ValidationResult[];
  anomalyFlags: AnomalyFlag[];
  reviewDecisions: ReviewDecision[];
  auditLogs: AuditLog[];
  submittedAt?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}
