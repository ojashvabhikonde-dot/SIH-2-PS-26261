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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-trust-blue/40 bg-trust-midnight shadow-2xl relative"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-trust-blue/20 text-trust-teal">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {rule ? 'Edit Compliance Rule' : 'Create Regulatory Compliance Rule'}
              </h3>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1 text-[10px]">
                  Rule Code (Immutable Key)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!rule}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-trust-teal disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1 text-[10px]">
                  Regulatory Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-trust-teal"
                >
                  <option value="MANDATORY">Mandatory Statutory</option>
                  <option value="INFRASTRUCTURE">Campus Infrastructure</option>
                  <option value="ACADEMIC">Academic Standards</option>
                  <option value="LEGAL">Legal &amp; Trust Charter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1 text-[10px]">
                Rule Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fire Safety NOC Clearance"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-trust-teal"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1 text-[10px]">
                Statutory Description
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter regulatory mandate context and requirements..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-trust-teal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1 text-[10px]">
                  Violation Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-trust-teal"
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
                  className="w-4 h-4 rounded text-trust-blue bg-slate-950 border-slate-800"
                />
                <label htmlFor="ruleActive" className="text-slate-300 font-medium">
                  Active in Live AI Engine
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase mb-1 text-[10px]">
                Evaluation Logic (JSON Definition)
              </label>
              <textarea
                rows={4}
                value={ruleJson}
                onChange={(e) => setRuleJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-trust-teal focus:outline-none focus:border-trust-teal"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl font-bold bg-trust-blue hover:bg-blue-600 text-white transition shadow-lg shadow-blue-500/20"
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
