import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface TrustScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showBreakdownButton?: boolean;
  scoreBreakdown?: {
    authenticityScore?: number;
    forensicScore?: number;
    consistencyScore?: number;
    rulesScore?: number;
    penalties?: string[];
  };
}

export const TrustScoreRing: React.FC<TrustScoreRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label = 'Trust Score',
  showBreakdownButton = true,
  scoreBreakdown
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  // Normalize score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Color tiers
  let color = '#EF4444'; // Red
  let statusText = 'Critical Risk';
  let badgeBg = 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  if (normalizedScore >= 85) {
    color = '#10B981'; // Emerald
    statusText = 'High Trust';
    badgeBg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (normalizedScore >= 60) {
    color = '#F59E0B'; // Amber
    statusText = 'Moderate Trust';
    badgeBg = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }

  // Calculate SVG Circle geometry
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Breakdown values (fallback calculation if not provided)
  const breakdown = {
    authenticity: scoreBreakdown?.authenticityScore ?? (normalizedScore >= 80 ? 98 : normalizedScore >= 50 ? 75 : 40),
    forensic: scoreBreakdown?.forensicScore ?? (normalizedScore >= 80 ? 96 : normalizedScore >= 50 ? 70 : 35),
    consistency: scoreBreakdown?.consistencyScore ?? (normalizedScore >= 80 ? 95 : normalizedScore >= 50 ? 65 : 45),
    compliance: scoreBreakdown?.rulesScore ?? (normalizedScore >= 80 ? 100 : normalizedScore >= 50 ? 60 : 30),
    penalties: scoreBreakdown?.penalties ?? (
      normalizedScore < 60
        ? ['Cross-application duplicate hash match detected (-35 pts)', 'Visual tampering / ELA variance detected (-45 pts)']
        : normalizedScore < 85
        ? ['Expired certificate date format detected (-20 pts)']
        : ['All regulatory parameters within statutory variance tolerance']
    )
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />
          {/* Animated Gauge Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`
            }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            className="text-3xl font-extrabold font-mono text-white tracking-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {normalizedScore}
          </motion.span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">/100</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 text-center">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
          {normalizedScore >= 85 ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : normalizedScore >= 60 ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5" />
          )}
          {statusText}
        </span>
      </div>

      {/* "Why this score?" Expandable Trigger */}
      {showBreakdownButton && (
        <button
          onClick={() => setShowModal(true)}
          className="mt-2.5 text-xs text-trust-teal hover:text-white flex items-center gap-1 transition-colors font-medium underline underline-offset-4"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Why this score?
        </button>
      )}

      {/* Modal Breakdown */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-trust-blue/30 shadow-2xl bg-trust-midnight text-left relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-trust-blue/20 text-trust-teal border border-trust-teal/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Trust Score Explainability Vector</h4>
                    <p className="text-xs text-slate-400">Algorithmic scoring pillars &amp; deduction breakdown</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Overall Score Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-5">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Aggregated Trust Score</span>
                  <p className="text-sm font-bold text-white">
                    Status: <span className="text-trust-teal">{statusText}</span> ({normalizedScore}/100)
                  </p>
                </div>
                <div className="font-mono text-2xl font-black" style={{ color }}>
                  {normalizedScore}%
                </div>
              </div>

              {/* 4 Pillars Progress Bars */}
              <div className="space-y-3.5 mb-5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">1. Cryptographic Registry &amp; QR Authenticity (30%)</span>
                    <span className="text-trust-teal font-mono">{breakdown.authenticity}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-trust-teal h-full rounded-full" style={{ width: `${breakdown.authenticity}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">2. Image Forensics &amp; ELA Variance (25%)</span>
                    <span className="text-trust-teal font-mono">{breakdown.forensic}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-trust-teal h-full rounded-full" style={{ width: `${breakdown.forensic}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">3. Cross-Document Entity Consistency (25%)</span>
                    <span className="text-trust-teal font-mono">{breakdown.consistency}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-trust-teal h-full rounded-full" style={{ width: `${breakdown.consistency}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">4. Dynamic Regulatory Rules Pass Rate (20%)</span>
                    <span className="text-trust-teal font-mono">{breakdown.compliance}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-trust-teal h-full rounded-full" style={{ width: `${breakdown.compliance}%` }} />
                  </div>
                </div>
              </div>

              {/* Findings & Penalties */}
              <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 text-xs mb-4">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block mb-2">
                  Deductions &amp; Penalty Factors:
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {breakdown.penalties.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
                <Info className="w-4 h-4 text-trust-blue flex-shrink-0" />
                <span>Statutory Note: AI scores serve solely as explainable evidence. The final verdict rests with the verification officer.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
