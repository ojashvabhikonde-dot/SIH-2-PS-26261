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
      <div className="p-7 rounded-3xl bg-[#111827]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Institutional Applicant Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{user?.name}</h2>
          <p className="text-xs text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">{user?.institution?.name || 'Apex Institute of Technology'}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-400">Code: {user?.institution?.code || 'INST-APEX-01'}</span>
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 self-start md:self-auto cursor-pointer ring-1 ring-white/10 relative z-10"
        >
          <PlusCircle className="w-4 h-4" />
          Initialize New Application
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827]/80 border border-white/[0.08] shadow-sm">
          <span className="text-xs text-slate-400 font-semibold">Total Submissions</span>
          <p className="text-3xl font-mono font-bold text-white mt-1.5">{applications.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#111827]/80 border border-indigo-500/30 shadow-sm">
          <span className="text-xs text-indigo-400 font-semibold">In Progress / Scrutiny</span>
          <p className="text-3xl font-mono font-bold text-indigo-300 mt-1.5">{pendingCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#111827]/80 border border-emerald-500/30 shadow-sm">
          <span className="text-xs text-emerald-400 font-semibold">Approved by Regulator</span>
          <p className="text-3xl font-mono font-bold text-emerald-400 mt-1.5">{approvedCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#111827]/80 border border-amber-500/30 shadow-sm">
          <span className="text-xs text-amber-400 font-semibold">Clarifications Required</span>
          <p className="text-3xl font-mono font-bold text-amber-400 mt-1.5">{actionCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-3.5 py-2 w-full sm:w-80 shadow-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID or program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111827] border border-white/10 text-xs text-white rounded-2xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 shadow-sm"
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
          <div className="p-16 text-center text-slate-400 text-xs font-mono">
            Loading institutional dossier inventory...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-14 text-center rounded-3xl bg-[#111827]/80 border border-white/[0.08] space-y-3">
            <FileText className="w-9 h-9 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No applications match your filter</h4>
            <p className="text-xs text-slate-400">Initialize a new application or clear filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => {
              const scoreColor = app.overallTrustScore >= 85 ? 'text-emerald-400' : app.overallTrustScore >= 60 ? 'text-amber-400' : 'text-rose-400';
              const flags = app.anomalyFlags || [];

              return (
                <div
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.applicationNumber}`)}
                  className="p-6 rounded-3xl bg-[#111827]/85 border border-white/[0.08] hover:border-indigo-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-400">
                          {app.applicationNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5 tracking-tight">
                          {app.programCategory}
                        </h4>
                        <p className="text-[11px] text-slate-400">Intake Year: {app.academicYear}</p>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono text-base font-extrabold ${scoreColor}`}>
                          {app.overallTrustScore}%
                        </span>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">AI Trust</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-3.5 text-[10px]">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-slate-300 font-semibold border border-white/[0.08]">
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-slate-400">
                        {app.documents.length} Clearance Docs
                      </span>
                      {flags.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25 flex items-center gap-1 font-semibold">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          {flags.length} Flags
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4 font-normal">
                      {app.aiSummary || 'Dossier initialized. Review clearance attachments.'}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {app.submittedAt ? `Submitted ${new Date(app.submittedAt).toLocaleDateString()}` : 'Draft Mode'}
                    </span>
                    <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
