import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, X, Sparkles, Building2, GraduationCap, Calendar } from 'lucide-react';
import { api } from '../../services/api';

interface ApplicationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newApp: any) => void;
  institutionId?: string | null;
}

export const ApplicationWizardModal: React.FC<ApplicationWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  institutionId
}) => {
  const [programCategory, setProgramCategory] = useState('ENGINEERING');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.createApplication({
        programCategory,
        academicYear,
        institutionId: institutionId || undefined
      });
      onSuccess(res.application);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-md rounded-2xl p-6 border border-trust-blue/40 bg-trust-midnight shadow-2xl relative"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-trust-blue/20 text-trust-teal">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create Institutional Application</h3>
                <p className="text-xs text-slate-400">Initiate statutory affiliation/renewal dossier</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Academic Program Category
              </label>
              <select
                value={programCategory}
                onChange={(e) => setProgramCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-trust-teal"
              >
                <option value="ENGINEERING">Engineering &amp; Technology (B.Tech / M.Tech)</option>
                <option value="MANAGEMENT">Applied Management (MBA / PGDM)</option>
                <option value="PHARMACY">Pharmaceutical Sciences (B.Pharm / M.Pharm)</option>
                <option value="ARCHITECTURE">Architecture &amp; Town Planning (B.Arch)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Academic Year Intake
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-trust-teal"
              >
                <option value="2024-25">Academic Year 2024-25 (Current)</option>
                <option value="2025-26">Academic Year 2025-26 (Advance Cycle)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              Upon initializing, you will be directed to upload the statutory clearances (Fire NOC, Land Deed, Building Blueprint) before triggering autonomous AI scrutiny.
            </div>

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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-trust-blue hover:bg-blue-600 text-white transition shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? 'Creating...' : 'Initialize Application'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
