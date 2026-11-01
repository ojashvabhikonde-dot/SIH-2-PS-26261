import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ComplianceRule } from '../../types';
import { api } from '../../services/api';

interface RuleEditorModalProps {
  isOpen: boolean;
  rule?: ComplianceRule | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RuleEditorModal: React.FC<RuleEditorModalProps> = ({
  isOpen,
  rule,
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'MANDATORY' | 'INFRASTRUCTURE' | 'ACADEMIC' | 'LEGAL'>('MANDATORY');
  const [severity, setSeverity] = useState<'CRITICAL' | 'WARNING'>('CRITICAL');
  const [ruleJson, setRuleJson] = useState('{\n  "type": "REQUIRED_DOCUMENT",\n  "targetDocumentType": "FIRE_NOC"\n}');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rule) {
      setCode(rule.code);
      setTitle(rule.title);
      setDescription(rule.description);
      setCategory(rule.category);
      setSeverity(rule.severity);
      setIsActive(rule.isActive);
      try {
        setRuleJson(JSON.stringify(JSON.parse(rule.ruleJson), null, 2));
      } catch (e) {
        setRuleJson(rule.ruleJson);
      }
    } else {
      setCode('RULE_NEW_CLEARANCE');
      setTitle('');
      setDescription('');
      setCategory('MANDATORY');
      setSeverity('CRITICAL');
      setRuleJson('{\n  "type": "REQUIRED_DOCUMENT",\n  "targetDocumentType": "FIRE_NOC"\n}');
      setIsActive(true);
    }
  }, [rule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate JSON
    try {
      JSON.parse(ruleJson);
    } catch (e) {
      setError('Invalid JSON condition syntax. Please verify formatting.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (rule) {
        await api.updateRule(rule.id, {
          title,
          description,
          category,
          severity,
          ruleJson,
          isActive
        });
      } else {
        await api.createRule({
          code,
          title,
          description,
          category,
          severity,
          ruleJson,
          isActive
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save compliance rule');
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
          className="w-full max-w-lg rounded-2xl p-6 shadow-2xl relative"
          style={{backgroundColor:'var(--bg-surface)', border:'1px solid var(--border)'}}
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{borderColor:'var(--border)'}}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl" style={{backgroundColor:'var(--accent-subtle)', color:'var(--accent)'}}>
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold" style={{color:'var(--text-heading)'}}>
                {rule ? 'Edit Compliance Rule' : 'Create Regulatory Compliance Rule'}
              </h3>
            </div>
            <button onClick={onClose} className="p-1 transition hover:opacity-80" style={{color:'var(--text-muted)'}}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase mb-1 text-[10px]" style={{color:'var(--text-body)'}}>
                  Rule Code (Immutable Key)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!rule}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full t-input rounded-xl p-2.5 font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1 text-[10px]" style={{color:'var(--text-body)'}}>
                  Regulatory Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full t-input rounded-xl p-2.5 cursor-pointer"
                >
                  <option value="MANDATORY">Mandatory Statutory</option>
                  <option value="INFRASTRUCTURE">Campus Infrastructure</option>
                  <option value="ACADEMIC">Academic Standards</option>
                  <option value="LEGAL">Legal &amp; Trust Charter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase mb-1 text-[10px]" style={{color:'var(--text-body)'}}>
                Rule Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fire Safety NOC Clearance"
                className="w-full t-input rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block font-bold uppercase mb-1 text-[10px]" style={{color:'var(--text-body)'}}>
                Statutory Description
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter regulatory mandate context and requirements..."
                className="w-full t-input rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase mb-1 text-[10px]" style={{color:'var(--text-body)'}}>
                  Violation Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full t-input rounded-xl p-2.5 cursor-pointer"
                >
                  <option value="CRITICAL">Critical (Triggers Auto-Flag)</option>
                  <option value="WARNING">Warning (Penalty Deduction)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="ruleActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="ruleActive" className="font-medium" style={{color:'var(--text-body)'}}>
                  Active in Live AI Engine
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase mb-1 text-[10px]" style={{color:'var(--text-body)'}}>
                Evaluation Logic (JSON Definition)
              </label>
              <textarea
                rows={4}
                value={ruleJson}
                onChange={(e) => setRuleJson(e.target.value)}
                className="w-full t-input rounded-xl p-2.5 font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{borderColor:'var(--border)'}}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl transition hover:opacity-80"
                style={{color:'var(--text-muted)'}}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl font-semibold btn-brand"
              >
                {isSubmitting ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
