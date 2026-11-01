import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  PlusCircle,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Application } from '../types';
import { ApplicationWizardModal } from '../components/applicant/ApplicationWizardModal';

export const ApplicantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const res = await api.getApplications({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Failed to load applicant applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [search, statusFilter]);

  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const pendingCount = applications.filter((a) => ['SUBMITTED', 'PROCESSING', 'UNDER_REVIEW'].includes(a.status)).length;
  const actionCount = applications.filter((a) => ['NEEDS_ATTENTION', 'CLARIFICATION_REQUESTED'].includes(a.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left font-sans">
      {/* Top Welcome Banner */}
      <div className="p-7 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        style={{backgroundColor:'var(--bg-surface)', border:'1px solid var(--border)'}}>
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{backgroundColor:'var(--accent-subtle)'}} />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border" style={{backgroundColor:'var(--accent-subtle)', color:'var(--accent)', borderColor:'var(--border-accent)'}}>
              Institutional Applicant Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{color:'var(--text-heading)'}}>{user?.name}</h2>
          <p className="text-xs flex items-center gap-2" style={{color:'var(--text-body)'}}>
            <Building2 className="w-4 h-4" style={{color:'var(--accent)'}} />
            <span className="font-semibold" style={{color:'var(--text-heading)'}}>{user?.institution?.name || 'Apex Institute of Technology'}</span>
            <span style={{color:'var(--text-muted)'}}>•</span>
            <span className="font-mono" style={{color:'var(--text-muted)'}}>Code: {user?.institution?.code || 'INST-APEX-01'}</span>
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 self-start md:self-auto cursor-pointer relative z-10 btn-brand"
        >
          <PlusCircle className="w-4 h-4" />
          Initialize New Application
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl shadow-sm" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <span className="text-xs font-semibold" style={{color:'var(--text-muted)'}}>Total Submissions</span>
          <p className="text-3xl font-mono font-bold mt-1.5" style={{color:'var(--text-heading)'}}>{applications.length}</p>
        </div>
        <div className="p-5 rounded-2xl shadow-sm" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <span className="text-xs font-semibold" style={{color:'var(--accent)'}}>In Progress / Scrutiny</span>
          <p className="text-3xl font-mono font-bold mt-1.5" style={{color:'var(--text-heading)'}}>{pendingCount}</p>
        </div>
        <div className="p-5 rounded-2xl shadow-sm" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <span className="text-xs font-semibold text-emerald-500">Approved by Regulator</span>
          <p className="text-3xl font-mono font-bold text-emerald-500 mt-1.5">{approvedCount}</p>
        </div>
        <div className="p-5 rounded-2xl shadow-sm" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <span className="text-xs font-semibold text-amber-500">Clarifications Required</span>
          <p className="text-3xl font-mono font-bold text-amber-500 mt-1.5">{actionCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-2xl px-3.5 py-2 w-full sm:w-80 shadow-sm" style={{backgroundColor:'var(--bg-input)', border:'1px solid var(--border)'}}>
          <Search className="w-4 h-4" style={{color:'var(--text-muted)'}} />
          <input
            type="text"
            placeholder="Search by ID or program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs focus:outline-none w-full"
            style={{color:'var(--text-heading)'}}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4" style={{color:'var(--text-muted)'}} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="t-input text-xs rounded-2xl px-3.5 py-2 shadow-sm cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="NEEDS_ATTENTION">Needs Attention</option>
            <option value="CLARIFICATION_REQUESTED">Clarification Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-mono" style={{color:'var(--text-muted)'}}>
            Loading institutional dossier inventory...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-14 text-center rounded-3xl space-y-3" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
            <FileText className="w-9 h-9 mx-auto" style={{color:'var(--text-faint)'}} />
            <h4 className="text-sm font-bold" style={{color:'var(--text-heading)'}}>No applications match your filter</h4>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>Initialize a new application or clear filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => {
              const scoreColor = app.overallTrustScore >= 85 ? 'text-emerald-500' : app.overallTrustScore >= 60 ? 'text-amber-500' : 'text-rose-500';
              const flags = app.anomalyFlags || [];

              return (
                <div
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.applicationNumber}`)}
                  className="p-6 rounded-3xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between group"
                  style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <div>
                        <span className="font-mono text-xs font-bold" style={{color:'var(--accent)'}}>
                          {app.applicationNumber}
                        </span>
                        <h4 className="text-sm font-bold mt-0.5 tracking-tight" style={{color:'var(--text-heading)'}}>
                          {app.programCategory}
                        </h4>
                        <p className="text-[11px]" style={{color:'var(--text-muted)'}}>Intake Year: {app.academicYear}</p>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono text-base font-extrabold ${scoreColor}`}>
                          {app.overallTrustScore}%
                        </span>
                        <p className="text-[9px] uppercase tracking-wider" style={{color:'var(--text-muted)'}}>AI Trust</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-3.5 text-[10px]">
                      <span className="px-2.5 py-0.5 rounded-full font-semibold" style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-body)'}}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full" style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-muted)'}}>
                        {app.documents.length} Clearance Docs
                      </span>
                      {flags.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/25 flex items-center gap-1 font-semibold">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          {flags.length} Flags
                        </span>
                      )}
                    </div>

                    <p className="text-xs line-clamp-2 leading-relaxed mb-4 font-normal" style={{color:'var(--text-body)'}}>
                      {app.aiSummary || 'Dossier initialized. Review clearance attachments.'}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t flex items-center justify-between text-xs" style={{borderColor:'var(--border)'}}>
                    <span className="text-[11px]" style={{color:'var(--text-muted)'}}>
                      {app.submittedAt ? `Submitted ${new Date(app.submittedAt).toLocaleDateString()}` : 'Draft Mode'}
                    </span>
                    <span className="font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{color:'var(--accent)'}}>
                      View Dossier <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Wizard Modal */}
      <ApplicationWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSuccess={(newApp) => {
          fetchApps();
          navigate(`/applications/${newApp.applicationNumber}`);
        }}
        institutionId={user?.institutionId}
      />
    </div>
  );
};
