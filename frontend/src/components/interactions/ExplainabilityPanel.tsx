import React from 'react';
import { AnomalyFlag, ValidationResult } from '../../types';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu, Scale, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface ExplainabilityPanelProps {
  anomalyFlags: AnomalyFlag[];
  validationResults: ValidationResult[];
  onAdoptSuggestedAction?: (actionText: string) => void;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  anomalyFlags,
  validationResults,
  onAdoptSuggestedAction
}) => {
  const failResults = validationResults.filter((v) => v.status === 'FAIL');

  return (
    <div className="space-y-4">
      {/* Mandatory Statutory Banner: "AI assists, officers decide" */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-trust-midnight via-slate-900 to-trust-midnight border border-trust-teal/30 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-trust-teal/5 blur-2xl pointer-events-none" />
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="p-2.5 rounded-xl bg-trust-teal/20 text-trust-teal border border-trust-teal/40 flex-shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-trust-teal px-2 py-0.5 rounded bg-trust-teal/10 border border-trust-teal/30">
                Core Statutory Covenant
              </span>
              <span className="text-xs font-extrabold text-white">
                "AI assists, officers decide."
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI provides explainable evidence, probabilistic confidence vectors, and forensic signals. It does <strong className="text-white">not</strong> render verdicts. Statutory authority and final regulatory determination always rest solely with the authorized Verification Officer.
            </p>
          </div>
        </div>
      </div>

      {/* Findings Breakdown */}
      {anomalyFlags.length === 0 && failResults.length === 0 ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-white">All Clear: Clean Scrutiny Profile</p>
            <p className="text-emerald-300/90 text-xs mt-0.5">
              No integrity anomalies, image tampering, cross-application duplications, or regulatory rule failures detected.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Anomaly Findings */}
          {anomalyFlags.map((flag) => {
            const confPercent = Math.round(flag.confidenceScore * 100);

            return (
              <div
                key={flag.id}
                className="glass-panel p-4 rounded-2xl border border-rose-500/40 bg-trust-midnight/80 shadow-xl space-y-3"
              >
                {/* 1. What We Found */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                        What We Found • [{flag.severity}]
                      </span>
                      <h4 className="text-sm font-bold text-white">{flag.title}</h4>
                    </div>
                  </div>
                  {/* Confidence Gauge */}
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-trust-teal">{confPercent}%</span>
                    <span className="text-[10px] text-slate-400 block">AI Confidence</span>
                  </div>
                </div>

                {/* 2. Concrete Evidence */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Explainable Forensic Evidence:
                  </span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed">
                    {flag.evidenceSummary}
                  </div>
                </div>

                {/* 3. AI Confidence Vector Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Algorithm Confidence Threshold</span>
                    <span className="text-white font-mono">{confPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-trust-blue to-rose-500 h-full rounded-full"
                      style={{ width: `${confPercent}%` }}
                    />
                  </div>
                </div>

                {/* 4. Suggested Regulatory Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-xs text-amber-200">
                    <span className="font-bold text-amber-300">Suggested Action: </span>
                    {flag.suggestedAction}
                  </div>
                  {onAdoptSuggestedAction && (
                    <button
                      onClick={() => onAdoptSuggestedAction(flag.suggestedAction)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition flex items-center gap-1 flex-shrink-0"
                    >
                      Adopt into Remarks <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Validation Rule Failures */}
          {failResults.map((val) => (
            <div
              key={val.id}
              className="glass-panel p-4 rounded-2xl border border-amber-500/40 bg-trust-midnight/80 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      Validation Check Discrepancy • [{val.checkType}]
                    </span>
                    <h4 className="text-sm font-bold text-white">{val.message}</h4>
                  </div>
                </div>
              </div>

              {val.expectedValue && val.actualValue && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Statutory Expectation:
                    </span>
                    <span className="text-emerald-400 font-mono">{val.expectedValue}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Extracted Actual Value:
                    </span>
                    <span className="text-rose-400 font-mono">{val.actualValue}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
