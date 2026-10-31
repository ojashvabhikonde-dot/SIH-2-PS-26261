import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
  Layers,
  FileText,
  Activity,
  Flame,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Application, ApplicationStatus } from '../types';
import { KanbanQueue } from '../components/interactions/KanbanQueue';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const res = await api.getApplications({
        search: search || undefined,
        risk: riskFilter !== 'ALL' ? riskFilter : undefined,
        programCategory: categoryFilter !== 'ALL' ? categoryFilter : undefined
      });
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Failed to load officer applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [search, riskFilter, categoryFilter]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  };

  const highRiskCount = applications.filter((a) => a.overallTrustScore <= 60 && a.status !== 'DRAFT').length;
  const mediumRiskCount = applications.filter((a) => a.overallTrustScore > 60 && a.overallTrustScore <= 85).length;
  const lowRiskCount = applications.filter((a) => a.overallTrustScore > 85).length;
  const underReviewCount = applications.filter((a) => a.status === 'UNDER_REVIEW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left font-sans">
      {/* Officer Header Card */}
      <div className="p-7 rounded-3xl bg-[#111827]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              Regulatory Scrutiny Bureau
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Autonomous Scrutiny Queue</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{user?.name}</h2>
          <p className="text-xs text-slate-300">
            {user?.designation || 'Senior Verification Officer • AICTE National Accreditation Scrutiny Cell'}
          </p>
        </div>

        {/* Live Scrutiny Ticker */}
        <div className="flex items-center gap-5 bg-white/[0.03] px-5 py-3 rounded-2xl border border-white/[0.08] relative z-10 shadow-sm">
          <div className="text-center">
            <span className="font-mono text-2xl font-bold text-white">{underReviewCount}</span>
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Active Queue</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="font-mono text-2xl font-bold text-rose-400">{highRiskCount}</span>
            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">High Risk Flags</p>
          </div>
        </div>
      </div>

      {/* Risk Heatmap Breakdown */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            AI Risk Stratification &amp; Anomaly Heatmap
          </span>
          <span className="text-xs text-slate-400">Click a risk tier to filter queue</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* High Risk Tier */}
          <div
            onClick={() => setRiskFilter(riskFilter === 'HIGH' ? 'ALL' : 'HIGH')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
              riskFilter === 'HIGH'
                ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-500/20 ring-1 ring-rose-500/30'
                : 'bg-[#111827]/80 border-rose-500/25 hover:border-rose-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                High Risk (&le;60% Trust)
              </span>
              <span className="font-mono text-xl font-black text-rose-400">{highRiskCount}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Contains image tampering (ELA), cross-application duplicate certificates, or major bylaws non-compliance.
            </p>
          </div>

          {/* Medium Risk Tier */}
          <div
            onClick={() => setRiskFilter(riskFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
              riskFilter === 'MEDIUM'
                ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/30'
                : 'bg-[#111827]/80 border-amber-500/25 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Moderate Risk (61-85% Trust)
              </span>
              <span className="font-mono text-xl font-black text-amber-400">{mediumRiskCount}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Minor entity name discrepancies, near-expiry certificates, or missing non-critical clearances.
            </p>
          </div>

          {/* Low Risk Tier */}
          <div
            onClick={() => setRiskFilter(riskFilter === 'LOW' ? 'ALL' : 'LOW')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
              riskFilter === 'LOW'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30'
                : 'bg-[#111827]/80 border-emerald-500/25 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Low Risk (&gt;85% Trust)
              </span>
              <span className="font-mono text-xl font-black text-emerald-400">{lowRiskCount}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Full cryptographic QR registry authentication, active validity, 100% regulatory rules pass.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-3.5 py-2 w-full sm:w-80 shadow-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search application # or college name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#111827] border border-white/10 text-xs text-white rounded-2xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="ALL">All Categories</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="MANAGEMENT">Management</option>
            <option value="PHARMACY">Pharmacy</option>
            <option value="ARCHITECTURE">Architecture</option>
          </select>

          {riskFilter !== 'ALL' && (
            <button
              onClick={() => setRiskFilter('ALL')}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.06] text-slate-300 hover:text-white border border-white/10 transition"
            >
              Clear Risk Filter ({riskFilter})
            </button>
          )}
        </div>
      </div>

      {/* KANBAN / TABLE TOGGLE QUEUE */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs font-mono">
          Loading regulatory scrutiny queue...
        </div>
      ) : (
        <KanbanQueue
            applications={applications}
            onStatusChange={handleStatusChange}
          />
      )}
    </div>
  );
};
