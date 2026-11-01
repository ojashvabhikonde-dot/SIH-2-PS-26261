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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
          style={{backgroundColor:'var(--bg-surface)', border:'1px solid var(--border)'}}
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{borderColor:'var(--border)'}}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{backgroundColor:'var(--accent-subtle)', color:'var(--accent)'}}>
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{color:'var(--text-heading)'}}>Create Institutional Application</h3>
                <p className="text-xs" style={{color:'var(--text-muted)'}}>Initiate statutory affiliation/renewal dossier</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg transition hover:opacity-80" style={{color:'var(--text-muted)'}}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'var(--text-body)'}}>
                Academic Program Category
              </label>
              <select
                value={programCategory}
                onChange={(e) => setProgramCategory(e.target.value)}
                className="w-full t-input rounded-xl p-2.5 text-xs cursor-pointer"
              >
                <option value="ENGINEERING">Engineering &amp; Technology (B.Tech / M.Tech)</option>
                <option value="MANAGEMENT">Applied Management (MBA / PGDM)</option>
                <option value="PHARMACY">Pharmaceutical Sciences (B.Pharm / M.Pharm)</option>
                <option value="ARCHITECTURE">Architecture &amp; Town Planning (B.Arch)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'var(--text-body)'}}>
                Academic Year Intake
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full t-input rounded-xl p-2.5 text-xs cursor-pointer"
              >
                <option value="2024-25">Academic Year 2024-25 (Current)</option>
                <option value="2025-26">Academic Year 2025-26 (Advance Cycle)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl text-[11px] leading-relaxed" style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)', color:'var(--text-muted)'}}>
              Upon initializing, you will be directed to upload the statutory clearances (Fire NOC, Land Deed, Building Blueprint) before triggering autonomous AI scrutiny.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{borderColor:'var(--border)'}}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition"
                style={{color:'var(--text-muted)'}}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold btn-brand"
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
