import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Cpu,
  FileCheck2,
  Lock,
  ArrowRight,
  Sparkles,
  BarChart2,
  FileText,
  UserCheck,
  Layers,
  Scale,
  CheckCircle,
  Eye,
  CheckCircle2,
  Fingerprint,
  FileSearch,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [stats, setStats] = useState({
    total: 12,
    passRate: '92%',
    turnaround: '2.4 days',
    trustIndex: '94.8'
  });

  useEffect(() => {
    api.getAnalytics()
      .then((res) => {
        if (res.metrics) {
          setStats({
            total: res.metrics.totalApplications || 12,
            passRate: res.metrics.approvalRate || '92%',
            turnaround: res.metrics.avgProcessingTime || '2.4 days',
            trustIndex: '94.8'
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickDemo = async (role: 'APPLICANT' | 'OFFICER' | 'ADMIN') => {
    await demoLogin(role);
    if (role === 'APPLICANT') navigate('/applicant');
    else if (role === 'OFFICER') navigate('/officer');
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen overflow-hidden font-sans" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-body)' }}>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto aurora-bg">
        {/* Ambient orbs */}
        <div className="absolute top-12 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column */}
          <motion.div
            className="lg:col-span-7 space-y-7 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full t-pill text-xs font-semibold shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: 'var(--accent)' }} />
              <span>SIH26261 Autonomous Regulatory Compliance Suite</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]" style={{ color: 'var(--text-heading)' }}>
              From Documents to Decisions,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400">
                Powered by AI, Built for Trust.
              </span>
            </h1>

            <p className="text-base sm:text-lg max-w-2xl leading-relaxed font-normal" style={{ color: 'var(--text-body)' }}>
              Automated institutional application validation, forensic document authentication, cryptographic registry verification, and explainable compliance decisioning.
            </p>

            {/* Core Principle Callout */}
            <div className="p-4 rounded-2xl flex items-center gap-3.5 max-w-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="p-2 rounded-xl flex-shrink-0" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                <strong style={{ color: 'var(--text-heading)' }}>Core Regulatory Mandate:</strong> AI provides explainable evidence, not verdicts. Final determination always rests with authorized regulatory officers.
              </span>
            </div>

            {/* Role CTAs */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                ⚡ Instant One-Click Role Portals:
              </span>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleQuickDemo('APPLICANT')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer ring-1 ring-white/15"
                >
                  <FileText className="w-4 h-4" />
                  Applicant Portal
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleQuickDemo('OFFICER')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold text-xs transition-all shadow-lg shadow-violet-500/25 flex items-center gap-2 cursor-pointer ring-1 ring-white/15"
                >
                  <UserCheck className="w-4 h-4 text-white" />
                  Verification Officer Desk
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer t-btn"
                >
                  <Scale className="w-4 h-4 text-emerald-500" />
                  Admin Analytics
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Certificate Preview */}
          <motion.div
            className="lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="relative w-full max-w-sm rounded-3xl p-6 shadow-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              {/* Animated Laser Scan */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06B6D4] z-20"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Document Replica */}
              <div className="bg-[#FAFBFD] text-slate-900 rounded-2xl p-5 shadow-inner border border-slate-200 relative select-none">
                <div className="text-center pb-3 border-b border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-1">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-800 block">
                    GOVERNMENT STATUTORY CLEARANCE
                  </span>
                  <p className="text-[9px] text-slate-500 font-medium">Directorate of Regulatory Scrutiny</p>
                </div>

                <div className="py-3 space-y-2 text-left">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500">CERTIFICATE NO:</span>
                    <span className="font-bold text-slate-900">FIRE-NOC-2024-9981</span>
                  </div>
                  <div className="text-[10px] font-mono">
                    <span className="text-slate-500">INSTITUTION:</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">Apex Institute of Technology</p>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500">STATUS:</span>
                    <span className="font-bold text-emerald-600">Active &amp; Compliant</span>
                  </div>
                </div>

                <motion.div
                  className="mt-2 py-2 px-3 rounded-xl border border-emerald-600/40 bg-emerald-50 text-emerald-800 flex items-center justify-center gap-2"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: [0.95, 1.02, 1], opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-black uppercase tracking-wider">AUTHENTICITY VERIFIED</span>
                </motion.div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>SHA-256: 9a8b7c6d5e...</span>
                  <span className="text-indigo-600 font-bold">REGISTRY OK</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Neural OCR Live
                </span>
                <span>Latency: 42ms</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────────────── */}
      <section className="py-12" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: stats.total, label: 'Applications Processed', colorClass: '' },
              { value: stats.turnaround, label: 'Avg. Turnaround Time', color: 'var(--accent)' },
              { value: stats.passRate, label: 'Regulatory Pass Rate', color: '#10B981' },
              { value: `${stats.trustIndex}%`, label: 'AI Confidence Index', color: '#06B6D4' },
            ].map((s, i) => (
              <div key={i} className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <span className="font-mono text-3xl sm:text-4xl font-extrabold block"
                  style={{ color: s.color || 'var(--text-heading)' }}>
                  {s.value}
                </span>
                <p className="text-xs mt-1 uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full t-pill">
            Automated Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 tracking-tight" style={{ color: 'var(--text-heading)' }}>
            End-to-End Regulatory Verification Pipeline
          </h2>
          <p className="text-sm mt-2.5" style={{ color: 'var(--text-muted)' }}>
            Eliminating procedural backlogs through transparent multi-model AI scrutiny while preserving officer sovereignty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Multi-Format Intake & Hashing',
              body: 'Institutions upload statutory clearance certificates (Fire NOC, Land Deed, Building Blueprint). The platform generates immutable cryptographic SHA-256 hashes and conducts instant duplicate detection.',
              accentColor: 'var(--accent)',
              accentSubtle: 'rgba(79,70,229,0.12)',
              hoverBorder: 'var(--border-accent)',
            },
            {
              step: '02',
              title: 'Autonomous Multi-Engine AI Scrutiny',
              body: 'Neural OCR extracts coordinates, ELA (Error Level Analysis) detects image tampering and pixel alteration, cross-document engine flags entity mismatches, and dynamic rules evaluate regulatory bylaws.',
              accentColor: '#8B5CF6',
              accentSubtle: 'rgba(139,92,246,0.12)',
              hoverBorder: 'rgba(139,92,246,0.40)',
            },
            {
              step: '03',
              title: 'Officer Adjudication & Audit Trail',
              body: 'Verification officers examine side-by-side evidence with bounding boxes, inspect explainability vectors, and record statutory determination (Approve / Reject / Clarify) backed by an immutable audit trail.',
              accentColor: '#10B981',
              accentSubtle: 'rgba(16,185,129,0.12)',
              hoverBorder: 'rgba(16,185,129,0.40)',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              className="p-7 rounded-3xl space-y-4 cursor-default"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', transition: 'all 0.25s ease' }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-lg"
                style={{ backgroundColor: card.accentSubtle, color: card.accentColor, border: `1px solid ${card.hoverBorder}` }}>
                {card.step}
              </div>
              <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>{card.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
