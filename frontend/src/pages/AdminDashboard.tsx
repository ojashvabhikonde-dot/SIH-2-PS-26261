import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BarChart3,
  Scale,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

const COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E'];

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAnalytics()
      .then((res) => setAnalytics(res))
      .catch((err) => console.error('Failed to load analytics:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs font-mono">
        Aggregating executive compliance intelligence &amp; audit statistics...
      </div>
    );
  }

  const { metrics, flagDistribution, failFrequency, funnel } = analytics;

  // Format flags distribution for PieChart
  const pieData = Object.entries(flagDistribution || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    value
  }));

  // Format fail frequency for BarChart
  const failData = Object.entries(failFrequency || {}).map(([key, value]) => ({
    rule: key.replace(/RULE_/g, '').replace(/_/g, ' '),
    count: value
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left font-sans">
      {/* Executive Header */}
      <div className="p-7 rounded-3xl bg-[#111827]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Executive Analytics &amp; Regulatory Oversight
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Institutional Compliance Telemetry</h2>
          <p className="text-xs text-slate-300">
            Real-time scrutiny performance, anomaly flag telemetry, and regulatory funnel velocity
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <span className="text-xs text-slate-400 font-mono px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            AICTE National Scrutiny Cell
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827]/80 border border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Applications</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-mono text-3xl font-black text-white">{metrics.totalApplications}</span>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18% over prior cycle
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827]/80 border border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Approval Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-mono text-3xl font-black text-emerald-400">{metrics.approvalRate}</span>
          <p className="text-[11px] text-slate-400 mt-2">Of finalized determinations</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827]/80 border border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Integrity Flag Rate</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <span className="font-mono text-3xl font-black text-rose-400">{metrics.flagRate}</span>
          <p className="text-[11px] text-slate-400 mt-2">Requires officer investigation</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827]/80 border border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Avg Processing Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-mono text-3xl font-black text-cyan-400">{metrics.avgProcessingTime}</span>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Down from 14 days (manual)
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Funnel Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#111827]/85 border border-white/[0.08] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Application Scrutiny Funnel Velocity (Monthly)
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Submitted vs Verified vs Approved</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="submitted" name="Submissions" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" name="AI Verified" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Sanctioned" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Flags Distribution Pie */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#111827]/85 border border-white/[0.08] space-y-4 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Integrity Flags by Type
            </h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-normal">
            Detected via OpenCV ELA, cryptographic SHA-256 match, and date timeline heuristics.
          </p>
        </div>
      </div>

      {/* Bottom Grid: Top Failing Rules & Risk Stratification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Failing Regulatory Checks */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#111827]/85 border border-white/[0.08] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Top Failing Regulatory Compliance Checks
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Deficiency Occurrence Count</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failData} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="rule" type="category" stroke="#94A3B8" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '14px', fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="count" name="Failure Incidents" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Stratification Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#111827]/85 border border-white/[0.08] space-y-4 shadow-sm">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-indigo-400" />
            Institutional Risk Stratification
          </h4>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400">High Risk Tier (&le;60%)</span>
                <p className="text-[10px] text-slate-400">Severe tampering or duplicate flags</p>
              </div>
              <span className="font-mono text-xl font-black text-rose-400">{metrics.highRiskCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400">Moderate Risk Tier (61-85%)</span>
                <p className="text-[10px] text-slate-400">Expired dates or minor mismatches</p>
              </div>
              <span className="font-mono text-xl font-black text-amber-400">{metrics.mediumRiskCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400">Compliant Tier (&gt;85%)</span>
                <p className="text-[10px] text-slate-400">Full QR authentication &amp; clear rules</p>
              </div>
              <span className="font-mono text-xl font-black text-emerald-400">{metrics.lowRiskCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
