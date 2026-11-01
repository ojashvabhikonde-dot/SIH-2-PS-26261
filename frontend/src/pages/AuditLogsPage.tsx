import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Search, Filter, Bot, UserCheck, FileText, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFilter, setActionFilter] = useState<string>('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditLogs({ action: actionFilter || undefined });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
        style={{backgroundColor:'var(--bg-surface)', border:'1px solid var(--border)'}}>
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{backgroundColor:'var(--accent-subtle)'}} />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border" style={{backgroundColor:'var(--accent-subtle)', color:'var(--accent)', borderColor:'var(--border-accent)'}}>
              Immutable Regulatory Ledger
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{color:'var(--text-heading)'}}>System Audit &amp; Event Trail</h2>
          <p className="text-xs" style={{color:'var(--text-body)'}}>
            Cryptographically sealed audit records for all user logins, document uploads, AI findings, and officer verdicts
          </p>
        </div>

        <div className="font-mono text-xs px-4 py-2.5 rounded-2xl relative z-10 shadow-sm" style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-body)'}}>
          Total Recorded Events: <span className="font-bold ml-1" style={{color:'var(--accent)'}}>{total}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4" style={{color:'var(--text-muted)'}} />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="t-input text-xs rounded-2xl px-3.5 py-2 shadow-sm cursor-pointer"
        >
          <option value="">All Event Actions</option>
          <option value="USER_LOGIN">User Logins</option>
          <option value="APPLICATION_CREATED">Application Creations</option>
          <option value="APPLICATION_SUBMITTED">Application Submissions</option>
          <option value="AI_VERIFICATION_COMPLETE">AI Verifications</option>
          <option value="OFFICER_DECISION_APPROVED">Officer Approvals</option>
          <option value="OFFICER_DECISION_REJECTED">Officer Rejections</option>
          <option value="OFFICER_DECISION_CLARIFICATION_REQUESTED">Clarification Requests</option>
          <option value="RULE_UPDATED">Rule Configurations</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs font-mono">
            Loading immutable audit trail...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-4 px-5">Timestamp</th>
                  <th className="py-4 px-5">Action Event</th>
                  <th className="py-4 px-5">Actor</th>
                  <th className="py-4 px-5">Associated Dossier</th>
                  <th className="py-4 px-5">Audit Narrative &amp; Details</th>
                  <th className="py-4 px-5 font-mono">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-5 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-sans whitespace-nowrap">
                      <p className="text-white font-semibold text-xs">{log.user?.name || 'Automated Daemon'}</p>
                      <p className="text-[10px] text-slate-500">{log.user?.role || 'SYSTEM'}</p>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-400 whitespace-nowrap">
                      {log.applicationId ? log.applicationId.slice(0, 12) + '...' : 'System Level'}
                    </td>
                    <td className="py-4 px-5 font-sans text-slate-300 max-w-md">
                      <p className="text-xs leading-relaxed">{log.details}</p>
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-[11px] whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
