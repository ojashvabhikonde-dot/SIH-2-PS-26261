import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  Download,
  Play,
  UserCheck,
  Layers,
  Clock,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Application, Document as DocType } from '../types';
import { AiScanStepper } from '../components/interactions/AiScanStepper';
import { TrustScoreRing } from '../components/interactions/TrustScoreRing';
import { EvidenceViewer } from '../components/interactions/EvidenceViewer';
import { VerificationTimeline } from '../components/interactions/VerificationTimeline';
import { ExplainabilityPanel } from '../components/interactions/ExplainabilityPanel';
import { DecisionModal } from '../components/officer/DecisionModal';
import { DocumentUploadZone } from '../components/applicant/DocumentUploadZone';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState<Application | null>(null);
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'EVIDENCE' | 'EXPLAINABILITY' | 'DOCUMENTS' | 'TIMELINE'>('EVIDENCE');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showDecisionModal, setShowDecisionModal] = useState<boolean>(false);
  const [decisionRemarksPreset, setDecisionRemarksPreset] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchApplication = async () => {
    if (!id) return;
    try {
      const res = await api.getApplicationById(id);
      setApplication(res.application);
      if (res.application.status === 'PROCESSING') {
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Failed to load application:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleTriggerScan = async () => {
    if (!application) return;
    setIsScanning(true);
    try {
      await api.triggerAiScan(application.id);
    } catch (err) {
      console.error('Trigger scan error:', err);
    }
  };

  const handleScanComplete = () => {
    setIsScanning(false);
    fetchApplication();
  };

  const handleAdoptAction = (actionText: string) => {
    setDecisionRemarksPreset(`Based on AI forensic finding, regulatory requirement: ${actionText}`);
    setShowDecisionModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs font-mono">
        Retrieving regulatory dossier from secure registry...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Application Record Not Found</h3>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-white/[0.08] text-xs text-white hover:bg-white/[0.12] transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const selectedDoc = application.documents[selectedDocIndex] || application.documents[0];
  const canDecide = user?.role === 'OFFICER' || user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left font-sans">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button
          onClick={() => navigate(-1)}
          className="hover:text-white flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Overview
        </button>
        <span className="text-slate-600">/</span>
        <span className="font-mono text-indigo-400 font-semibold">{application.applicationNumber}</span>
      </div>

      {/* Top Dossier Header Card */}
      <div className="p-7 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"
        style={{backgroundColor:'var(--bg-surface)', border:'1px solid var(--border)'}}>
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{backgroundColor:'var(--accent-subtle)'}} />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-base font-extrabold" style={{color:'var(--accent)'}}>
              {application.applicationNumber}
            </span>
            <span className="text-xs px-3 py-0.5 rounded-full font-bold" style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-body)'}}>
              {application.status.replace(/_/g, ' ')}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{backgroundColor:'var(--accent-subtle)', border:'1px solid var(--border-accent)', color:'var(--accent)'}}>
              {application.programCategory}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{color:'var(--text-heading)'}}>{application.institution.name}</h2>

          <div className="flex flex-wrap items-center gap-4 text-xs" style={{color:'var(--text-muted)'}}>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" style={{color:'var(--accent)'}} />
              {application.institution.state} • {application.institution.type}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{color:'var(--accent)'}} />
              Intake Year: {application.academicYear}
            </span>
            <span className="flex items-center gap-1.5 font-mono" style={{color:'var(--text-muted)'}}>
              Applicant: {application.applicant?.name || 'Dr. Rajesh Sharma'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Scan, Export PDF, Export CSV, Record Verdict */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-indigo-500/40 hover:bg-white/[0.08] text-indigo-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            {isScanning ? 'Scrutinizing...' : 'Run AI Scan'}
          </button>

          <a
            href={`/api/reports/${application.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white font-semibold text-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            PDF Dossier
          </a>

          <a
            href={`/api/reports/${application.id}/csv`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white font-semibold text-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            CSV Data
          </a>

          {canDecide && (
            <button
              onClick={() => {
                setDecisionRemarksPreset('');
                setShowDecisionModal(true);
              }}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer btn-brand"
            >
              <UserCheck className="w-4 h-4" />
              Adjudicate Verdict
            </button>
          )}
        </div>
      </div>

      {/* Signature Interaction 1: AI Scan Stepper */}
      {isScanning && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <AiScanStepper
            applicationId={application.id}
            onComplete={handleScanComplete}
            isLive={true}
          />
        </motion.div>
      )}

      {/* Top Scrutiny Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trust Score Ring Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm"
          style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <span className="text-xs font-bold uppercase tracking-wider mb-4" style={{color:'var(--text-muted)'}}>
            Aggregated Regulatory Trust Index
          </span>
          <TrustScoreRing score={application.overallTrustScore} size={150} />
          <p className="text-xs mt-4 max-w-xs leading-relaxed" style={{color:'var(--text-muted)'}}>
            Composite index calculated across cryptographic registry match, ELA forensics, and dynamic bylaws.
          </p>
        </div>

        {/* Right Column: Key Statutory Findings & Decision Overview */}
        <div className="lg:col-span-8 p-6 rounded-3xl space-y-4 shadow-sm"
          style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <div className="flex items-center justify-between pb-3 border-b" style={{borderColor:'var(--border)'}}>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{color:'var(--text-heading)'}}>
              <Sparkles className="w-4 h-4" style={{color:'var(--accent)'}} />
              Statutory Findings Summary
            </span>
            <span className="text-xs font-mono" style={{color:'var(--text-muted)'}}>
              Status: <strong style={{color:'var(--text-heading)'}}>{application.status}</strong>
            </span>
          </div>

          <p className="text-xs leading-relaxed font-normal" style={{color:'var(--text-body)'}}>
            {application.aiSummary || 'Dossier initialized. Review clearance attachments.'}
          </p>

          {/* Quick Metrics Tiles */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <span className="font-mono text-lg font-bold text-white">{application.documents.length}</span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Attached Docs</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <span className="font-mono text-lg font-bold text-rose-400">{application.anomalyFlags.length}</span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Integrity Flags</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <span className="font-mono text-lg font-bold text-amber-400">
                {application.validationResults.filter((v) => v.status === 'FAIL').length}
              </span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Rule Deficiencies</p>
            </div>
          </div>

          {/* Recorded Decision Banner if any */}
          {application.reviewDecisions.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  Recorded Decision: {application.reviewDecisions[0].decision}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Officer: {application.reviewDecisions[0].officer.name}
                </span>
              </div>
              <p className="text-slate-300 text-xs italic">
                "{application.reviewDecisions[0].remarks}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-white/[0.08] gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('EVIDENCE')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'EVIDENCE'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          Evidence &amp; Document Viewer
        </button>

        <button
          onClick={() => setActiveTab('EXPLAINABILITY')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'EXPLAINABILITY'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          Explainability Panel
          {(application.anomalyFlags.length > 0) && (
            <span className="px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono">
              {application.anomalyFlags.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'DOCUMENTS'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Document Inventory &amp; Upload
        </button>

        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'TIMELINE'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Verification Timeline ({application.auditLogs.length})
        </button>
      </div>

      {/* TAB CONTENT 1: EVIDENCE & DOCUMENT VIEWER */}
      {activeTab === 'EVIDENCE' && (
        <div className="space-y-4">
          {application.documents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl text-xs" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-muted)'}}>
              No clearance documents uploaded for this application yet.
            </div>
          ) : (
            <>
              {/* Document Selector Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold mr-1" style={{color:'var(--text-muted)'}}>Select Clearance:</span>
                {application.documents.map((doc, idx) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocIndex(idx)}
                    className="px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all border flex items-center gap-2 cursor-pointer"
                    style={selectedDocIndex === idx
                      ? {backgroundColor:'var(--accent)', color:'var(--accent-text)', borderColor:'var(--accent)'}
                      : {backgroundColor:'var(--bg-elevated)', borderColor:'var(--border)', color:'var(--text-muted)'}}
                  >
                    <span>{doc.documentType.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] font-mono font-bold ${
                      doc.trustScore >= 80 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {doc.trustScore}%
                    </span>
                  </button>
                ))}
              </div>

              {/* Signature Interaction 3: EvidenceViewer */}
              {selectedDoc && (
                <EvidenceViewer
                  document={selectedDoc}
                  anomalyFlags={application.anomalyFlags.filter(
                    (a) => a.documentId === selectedDoc.id || !a.documentId
                  )}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: EXPLAINABILITY PANEL */}
      {activeTab === 'EXPLAINABILITY' && (
        <ExplainabilityPanel
          anomalyFlags={application.anomalyFlags}
          validationResults={application.validationResults}
          onAdoptSuggestedAction={handleAdoptAction}
        />
      )}

      {/* TAB CONTENT 3: DOCUMENT INVENTORY & UPLOAD */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-6">
          <DocumentUploadZone
            applicationId={application.id}
            onUploadSuccess={() => fetchApplication()}
          />

          <div className="rounded-3xl overflow-hidden shadow-sm" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <div className="p-4 border-b font-bold text-xs" style={{borderColor:'var(--border)', backgroundColor:'var(--bg-elevated)', color:'var(--text-heading)'}}>
              Currently Attached Clearance Documents ({application.documents.length})
            </div>
            <div className="divide-y" style={{borderColor:'var(--border)'}}>
              {application.documents.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold flex items-center gap-2" style={{color:'var(--text-heading)'}}>
                      {doc.originalName}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        doc.status === 'VALIDATED'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-rose-500/15 text-rose-500'
                      }`}>
                        {doc.status}
                      </span>
                    </p>
                    <p className="text-[11px] font-mono" style={{color:'var(--text-muted)'}}>
                      Category: {doc.documentType} • SHA-256: {doc.sha256Hash}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold" style={{color:'var(--accent)'}}>{doc.trustScore}%</span>
                    <p className="text-[10px] uppercase" style={{color:'var(--text-muted)'}}>Trust Index</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: VERIFICATION TIMELINE */}
      {activeTab === 'TIMELINE' && (
        <div className="p-6 rounded-3xl shadow-sm" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <div className="pb-4 mb-4 border-b" style={{borderColor:'var(--border)'}}>
            <h4 className="text-sm font-bold" style={{color:'var(--text-heading)'}}>Cryptographic Audit Trail &amp; Verification Chronology</h4>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>Immutable ledger of every autonomous and human regulatory action</p>
          </div>
          <VerificationTimeline logs={application.auditLogs} createdDate={application.createdAt} />
        </div>
      )}

      {/* Decision Adjudication Modal */}
      <DecisionModal
        isOpen={showDecisionModal}
        applicationId={application.id}
        applicationNumber={application.applicationNumber}
        institutionName={application.institution.name}
        initialRemarks={decisionRemarksPreset}
        onClose={() => setShowDecisionModal(false)}
        onSuccess={() => fetchApplication()}
      />
    </div>
  );
};
