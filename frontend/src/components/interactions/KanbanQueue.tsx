import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, ApplicationStatus } from '../../types';
import { LayoutGrid, List, ShieldAlert, ArrowRight, Clock, FileText, CheckCircle2, XCircle, AlertCircle, Eye, Sparkles } from 'lucide-react';

interface KanbanQueueProps {
  applications: Application[];
  onStatusChange?: (appId: string, newStatus: ApplicationStatus) => void;
}

const COLUMNS: { id: ApplicationStatus; title: string; color: string; badge: string }[] = [
  { id: 'SUBMITTED', title: 'Pending Triage', color: 'border-indigo-500/30', badge: 'bg-indigo-500/15 text-indigo-300' },
  { id: 'NEEDS_ATTENTION', title: 'High Risk / Flagged', color: 'border-rose-500/40', badge: 'bg-rose-500/15 text-rose-300' },
  { id: 'UNDER_REVIEW', title: 'Active Scrutiny', color: 'border-amber-500/30', badge: 'bg-amber-500/15 text-amber-300' },
  { id: 'CLARIFICATION_REQUESTED', title: 'Clarification Pending', color: 'border-violet-500/30', badge: 'bg-violet-500/15 text-violet-300' },
  { id: 'APPROVED', title: 'Officially Sanctioned', color: 'border-emerald-500/30', badge: 'bg-emerald-500/15 text-emerald-300' },
  { id: 'REJECTED', title: 'Rejected / Ineligible', color: 'border-white/10', badge: 'bg-white/[0.04] text-slate-400' }
];

export const KanbanQueue: React.FC<KanbanQueueProps> = ({ applications, onStatusChange }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedAppId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (id && onStatusChange) {
      onStatusChange(id, targetStatus);
    }
    setDraggedAppId(null);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top View Switcher Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.08]">
          <button
            onClick={() => setViewMode('KANBAN')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              viewMode === 'KANBAN'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              viewMode === 'TABLE'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Table View
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{applications.length}</span> institutional applications
        </span>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col rounded-3xl border ${col.color} p-3.5 min-w-[270px] min-h-[500px] shadow-lg backdrop-blur-md`}
                style={{backgroundColor:'var(--bg-card)'}}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{borderColor:'var(--border)'}}>
                  <span className="text-xs font-bold tracking-wide" style={{color:'var(--text-heading)'}}>{col.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                    {colApps.length}
                  </span>
                </div>

                {/* Column Cards Drop Area */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colApps.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-2xl text-xs font-medium" style={{borderColor:'var(--border)', color:'var(--text-muted)'}}>
                      Drop cards here
                    </div>
                  ) : (
                    colApps.map((app) => {
                      const hasFlags = app.anomalyFlags && app.anomalyFlags.length > 0;
                      const scoreColor = app.overallTrustScore >= 85 ? 'text-emerald-500' : app.overallTrustScore >= 60 ? 'text-amber-500' : 'text-rose-500';

                      return (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onClick={() => navigate(`/applications/${app.applicationNumber}`)}
                          className="p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:shadow-lg transition duration-200 group"
                          style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)'}}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="font-mono text-xs font-bold group-hover:underline" style={{color:'var(--accent)'}}>
                                {app.applicationNumber}
                              </span>
                              <h5 className="text-xs font-semibold line-clamp-1 mt-0.5 tracking-tight" style={{color:'var(--text-heading)'}}>
                                {app.institution.name}
                              </h5>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`font-mono text-sm font-extrabold ${scoreColor}`}>
                                {app.overallTrustScore}%
                              </span>
                              <p className="text-[9px] text-slate-400 uppercase">Trust</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[10px]">
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-300 font-medium">
                              {app.programCategory}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400">
                              {app.documents.length} docs
                            </span>
                            {hasFlags && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25 flex items-center gap-1 font-semibold">
                                <ShieldAlert className="w-2.5 h-2.5" />
                                {app.anomalyFlags.length} flags
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.06]">
                            <span className="text-[10px] truncate max-w-[140px] text-slate-400">
                              {app.institution.state}
                            </span>
                            <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold text-[11px]">
                              Review <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'TABLE' && (
        <div className="rounded-3xl overflow-hidden shadow-xl" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-3.5 px-5">Application ID</th>
                  <th className="py-3.5 px-5">Institution Name</th>
                  <th className="py-3.5 px-5">Program</th>
                  <th className="py-3.5 px-5">Trust Score</th>
                  <th className="py-3.5 px-5">Integrity Flags</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {applications.map((app) => {
                  const scoreColor = app.overallTrustScore >= 85 ? 'text-emerald-400' : app.overallTrustScore >= 60 ? 'text-amber-400' : 'text-rose-400';
                  const flags = app.anomalyFlags || [];

                  return (
                    <tr
                      key={app.id}
                      onClick={() => navigate(`/applications/${app.applicationNumber}`)}
                      className="hover:bg-white/[0.02] cursor-pointer transition"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-indigo-400">
                        {app.applicationNumber}
                      </td>
                      <td className="py-4 px-5 font-medium text-white max-w-[220px] truncate">
                        {app.institution.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{app.institution.state}</span>
                      </td>
                      <td className="py-4 px-5 text-slate-300">
                        {app.programCategory}
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-sm">
                        <span className={scoreColor}>{app.overallTrustScore}/100</span>
                      </td>
                      <td className="py-4 px-5">
                        {flags.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/25">
                            <ShieldAlert className="w-3 h-3" />
                            {flags.length} Anomaly Flag{flags.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04] text-slate-200 border border-white/[0.08]">
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/applications/${app.applicationNumber}`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-600 text-indigo-300 hover:text-white transition font-semibold text-xs inline-flex items-center gap-1.5 border border-indigo-500/20"
                        >
                          <Eye className="w-3 h-3" />
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
