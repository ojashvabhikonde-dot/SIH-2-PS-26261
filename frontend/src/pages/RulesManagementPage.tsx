import React, { useState, useEffect } from 'react';
import { Scale, Plus, Edit2, ToggleLeft, ToggleRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { ComplianceRule } from '../types';
import { RuleEditorModal } from '../components/admin/RuleEditorModal';

export const RulesManagementPage: React.FC = () => {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRules();
      setRules(res.rules || []);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await api.toggleRule(id);
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
      );
    } catch (err) {
      console.error('Toggle rule error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
        style={{backgroundColor:'var(--bg-surface)', border:'1px solid var(--border)'}}>
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{backgroundColor:'var(--accent-subtle)'}} />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border" style={{backgroundColor:'var(--accent-subtle)', color:'var(--accent)', borderColor:'var(--border-accent)'}}>
              Compliance Engine Governance
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{color:'var(--text-heading)'}}>Regulatory Rules Catalog</h2>
          <p className="text-xs" style={{color:'var(--text-body)'}}>
            Configure dynamic statutory criteria, validity thresholds, and mandatory clearance mandates
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedRule(null);
            setShowEditor(true);
          }}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer relative z-10 btn-brand"
        >
          <Plus className="w-4 h-4" />
          Create New Regulatory Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="rounded-3xl overflow-hidden shadow-xl" style={{backgroundColor:'var(--bg-card)', border:'1px solid var(--border)'}}>
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs font-mono">
            Loading compliance rules catalog...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-4 px-5">Rule Code</th>
                  <th className="py-4 px-5">Title &amp; Statutory Description</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Severity</th>
                  <th className="py-4 px-5">Engine Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-5 font-mono font-bold text-indigo-400 whitespace-nowrap">
                      {r.code}
                    </td>
                    <td className="py-4 px-5 max-w-sm">
                      <p className="font-bold text-white text-xs">{r.title}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 font-normal">{r.description}</p>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                        {r.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.severity === 'CRITICAL'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                      }`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(r.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                          r.isActive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/[0.04] text-slate-500 border border-white/[0.08]'
                        }`}
                      >
                        {r.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                        {r.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedRule(r);
                          setShowEditor(true);
                        }}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition cursor-pointer"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RuleEditorModal
        isOpen={showEditor}
        rule={selectedRule}
        onClose={() => setShowEditor(false)}
        onSuccess={() => fetchRules()}
      />
    </div>
  );
};
