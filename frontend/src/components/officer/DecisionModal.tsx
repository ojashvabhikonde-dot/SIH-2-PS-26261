import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, HelpCircle, X, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface DecisionModalProps {
  isOpen: boolean;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  onClose: () => void;
  onSuccess: () => void;
  initialRemarks?: string;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  applicationId,
  applicationNumber,
  institutionName,
  onClose,
  onSuccess,
  initialRemarks = ''
}) => {
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED'>('APPROVED');
  const [remarks, setRemarks] = useState(initialRemarks);
  const [conditions, setConditions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const triggerApprovalConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError('Statutory remarks are strictly mandatory for all regulatory decisions.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.submitDecision({
        applicationId,
        decision,
        remarks: remarks.trim(),
        conditions: conditions.trim() || undefined
      });

      if (decision === 'APPROVED') {
        triggerApprovalConfetti();
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit regulatory decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-trust-blue/40 bg-trust-midnight shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-trust-blue/20 text-trust-blue">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Record Statutory Determination</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {applicationNumber} • {institutionName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 3 Decision Choice Tiles */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Regulatory Decision Verdict
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDecision('APPROVED')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    decision === 'APPROVED'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xs">Approve</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('CLARIFICATION_REQUESTED')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    decision === 'CLARIFICATION_REQUESTED'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-xs">Clarification</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    decision === 'REJECTED'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  <span className="text-xs">Reject</span>
                </button>
              </div>
            </div>

            {/* Mandatory Officer Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Mandatory Officer Remarks <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter statutory basis, evidence citations, or specific deficiencies..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-trust-teal transition"
              />
            </div>

            {/* Optional Approval Conditions */}
            {decision === 'APPROVED' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Compliance Covenants / Sanction Conditions (Optional)
                </label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. Subject to filing annual fire drill log by Q3..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-trust-teal transition"
                />
              </div>
            )}

            {/* Officer Guarantee Notice */}
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
              By submitting this verdict, you certify under the Statutory Inspection Framework that you have evaluated all AI forensic evidence and bear regulatory accountability for this determination.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg ${
                  decision === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : decision === 'REJECTED'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                }`}
              >
                {isSubmitting ? 'Recording...' : `Confirm ${decision.replace(/_/g, ' ')}`}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
