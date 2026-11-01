import React from 'react';
import { ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t backdrop-blur-xl py-8 mt-auto" style={{borderColor:'var(--border)', backgroundColor:'var(--bg-surface)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b" style={{borderColor:'var(--border)'}}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm" style={{background:'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)'}}>
              <ShieldCheck className="w-5 h-5 drop-shadow-sm" />
            </div>
            <div>
              <p className="font-extrabold text-sm tracking-tight" style={{color:'var(--text-heading)'}}>DOCUSURE AI REGULATORY PLATFORM</p>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>
                Autonomous Application Validation, Forensic Document Verification &amp; Statutory Compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs" style={{color:'var(--text-muted)'}}>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-[11px] font-mono">NEURAL ENGINES ACTIVE</span>
            </div>
            <a
              href="http://localhost:5001/docs"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-full transition flex items-center gap-1.5 text-[11px]"
              style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-body)'}}
            >
              API Specification <ExternalLink className="w-3 h-3" style={{color:'var(--accent)'}} />
            </a>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p className="font-medium" style={{color:'var(--text-body)'}}>
            Docusure AI • From Documents to Decisions, Powered by AI, Built for Trust.
          </p>
          <p className="text-[11px] font-mono" style={{color:'var(--text-muted)'}}>
            AICTE Autonomous Verification Mandate • Form 26-B
          </p>
        </div>
      </div>
    </footer>
  );
};
