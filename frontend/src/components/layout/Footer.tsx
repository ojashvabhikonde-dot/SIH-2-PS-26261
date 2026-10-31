import React from 'react';
import { ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#0B0F17]/90 backdrop-blur-xl py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-glow-brand ring-1 ring-white/20">
              <ShieldCheck className="w-5 h-5 drop-shadow" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white tracking-tight">SIH26261 REGULATORY PLATFORM</p>
              <p className="text-xs text-slate-400">
                Autonomous Application Validation, Forensic Document Verification &amp; Statutory Compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-[11px] font-mono">NEURAL ENGINES ACTIVE</span>
            </div>
            <a
              href="http://localhost:5000/docs"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20 transition flex items-center gap-1.5 text-[11px]"
            >
              API Specification <ExternalLink className="w-3 h-3 text-indigo-400" />
            </a>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p className="font-medium text-slate-400">
            SIH26261 • From Documents to Decisions, Powered by AI, Built for Trust.
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            AICTE Autonomous Verification Mandate • Form 26-B
          </p>
        </div>
      </div>
    </footer>
  );
};
