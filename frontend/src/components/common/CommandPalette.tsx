import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Scale, BarChart3, User, ShieldCheck, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [apps, setApps] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      api.getApplications().then((res) => setApps(res.applications || [])).catch(() => {});
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent or global listener
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Command items
  const staticActions = [
    { id: 'act-queue', title: 'Officer Verification Queue', category: 'Navigation', icon: ShieldCheck, action: () => { navigate('/officer'); onClose(); } },
    { id: 'act-applicant', title: 'Applicant Portal & Submissions', category: 'Navigation', icon: FileText, action: () => { navigate('/applicant'); onClose(); } },
    { id: 'act-admin', title: 'Executive Analytics & Oversight', category: 'Navigation', icon: BarChart3, action: () => { navigate('/admin'); onClose(); } },
    { id: 'act-rules', title: 'Regulatory Compliance Rules Manager', category: 'Navigation', icon: Scale, action: () => { navigate('/admin/rules'); onClose(); } },
    { id: 'act-audit', title: 'System Immutable Audit Trail', category: 'Navigation', icon: FileText, action: () => { navigate('/admin/audit'); onClose(); } },
    { id: 'act-switch-officer', title: 'Demo Switch: Login as Verification Officer', category: 'Role Switch', icon: User, action: () => { demoLogin('OFFICER'); navigate('/officer'); onClose(); } },
    { id: 'act-switch-applicant', title: 'Demo Switch: Login as College Applicant', category: 'Role Switch', icon: User, action: () => { demoLogin('APPLICANT'); navigate('/applicant'); onClose(); } },
    { id: 'act-switch-admin', title: 'Demo Switch: Login as AICTE Admin', category: 'Role Switch', icon: User, action: () => { demoLogin('ADMIN'); navigate('/admin'); onClose(); } },
  ];

  const appActions = apps.map((app) => ({
    id: `app-${app.id}`,
    title: `${app.applicationNumber} • ${app.institution.name} (${app.status})`,
    category: 'Applications',
    icon: FileText,
    action: () => { navigate(`/applications/${app.applicationNumber}`); onClose(); }
  }));

  const allItems = [...appActions, ...staticActions];

  const filteredItems = allItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="glass-panel w-full max-w-xl rounded-2xl border border-trust-blue/30 bg-trust-midnight shadow-2xl overflow-hidden"
          >
            {/* Search Input Box */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
              <Search className="w-5 h-5 text-trust-teal" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command, application #, college, or rule... (Esc to exit)"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No matching applications, commands, or rules found.
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${
                        isSelected
                          ? 'bg-trust-blue/20 text-white border border-trust-teal/30 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-trust-teal/20 text-trust-teal' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-trust-teal" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Keyboard Hints */}
            <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-4 font-mono">
              <span>Navigate: ↑ / ↓</span>
              <span>Execute: ↵ Enter</span>
              <span>Shortcut: Ctrl+K</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
