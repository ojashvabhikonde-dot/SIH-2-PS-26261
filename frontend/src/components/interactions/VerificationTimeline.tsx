import React from 'react';
import { motion } from 'framer-motion';
import { AuditLog } from '../../types';
import { Bot, UserCheck, FileUp, Sparkles, AlertCircle, ShieldCheck, Clock } from 'lucide-react';

interface VerificationTimelineProps {
  logs: AuditLog[];
  createdDate?: string;
}

export const VerificationTimeline: React.FC<VerificationTimelineProps> = ({ logs, createdDate }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        No verification events recorded yet.
      </div>
    );
  }

  const getEventBadge = (action: string) => {
    if (action.includes('AI') || action.includes('PIPELINE')) {
      return {
        icon: Bot,
        bg: 'bg-trust-blue/20 text-trust-teal border-trust-teal/30',
        title: 'Autonomous AI Verification'
      };
    }
    if (action.includes('DECISION') || action.includes('OFFICER')) {
      return {
        icon: UserCheck,
        bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        title: 'Officer Regulatory Action'
      };
    }
    if (action.includes('UPLOAD') || action.includes('DOCUMENT')) {
      return {
        icon: FileUp,
        bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        title: 'Document Upload Event'
      };
    }
    return {
      icon: Sparkles,
      bg: 'bg-slate-800 text-slate-300 border-slate-700',
      title: 'Lifecycle State Transition'
    };
  };

  return (
    <div className="relative pl-6 py-2">
      {/* Connecting Vertical Line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-trust-blue via-trust-teal to-slate-800" />

      <div className="space-y-6">
        {logs.map((log, idx) => {
          const badge = getEventBadge(log.action);
          const Icon = badge.icon;
          const formattedDate = new Date(log.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <motion.div
              key={log.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative flex items-start gap-4 group"
            >
              {/* Event Avatar Dot */}
              <div
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border shadow-md flex-shrink-0 transition-transform group-hover:scale-110 ${badge.bg}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Event Content Card */}
              <div className="glass-panel rounded-xl p-3.5 flex-1 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                      {badge.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formattedDate}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {log.details}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/80">
                  <span>Actor: {log.user?.name || 'System Daemon'} {log.user?.role ? `(${log.user.role})` : ''}</span>
                  <span className="font-mono">IP: {log.ipAddress || '127.0.0.1'}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
