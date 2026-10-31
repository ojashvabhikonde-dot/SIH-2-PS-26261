import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  UserCheck,
  FileText,
  Scale,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building,
  Briefcase,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const LoginPage: React.FC<{ initialMode?: 'login' | 'register' }> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, demoLogin } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(
    initialMode || (location.state as any)?.mode || (location.pathname === '/register' ? 'register' : 'login')
  );

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'APPLICANT' | 'OFFICER'>('APPLICANT');
  const [regDesignation, setRegDesignation] = useState('');
  const [regInstitutionId, setRegInstitutionId] = useState('');
  const [isNewInstitution, setIsNewInstitution] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstState, setNewInstState] = useState('Karnataka');

  // Available institutions for dropdown
  const [institutions, setInstitutions] = useState<any[]>([]);

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch institutions on load
  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const res = await api.getPublicInstitutions();
        if (res.institutions && res.institutions.length > 0) {
          setInstitutions(res.institutions);
          setRegInstitutionId(res.institutions[0].id);
        }
      } catch (err) {
        console.warn('Could not load public institutions:', err);
      }
    }
    fetchInstitutions();
  }, []);

  const routeByRole = (role: string) => {
    if (role === 'APPLICANT') navigate('/applicant');
    else if (role === 'OFFICER') navigate('/officer');
    else navigate('/admin');
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        designation: regDesignation || (regRole === 'APPLICANT' ? 'Authorized Representative' : 'Scrutiny Officer'),
        institutionId: isNewInstitution ? undefined : regInstitutionId,
        newInstitutionName: isNewInstitution ? newInstName : undefined,
        institutionState: isNewInstitution ? newInstState : undefined
      });

      setSuccessMsg('Account registered successfully! Redirecting to workspace...');
      setTimeout(() => {
        routeByRole(regRole);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'APPLICANT' | 'OFFICER' | 'ADMIN') => {
    setIsLoading(true);
    setError('');
    try {
      await demoLogin(role);
      routeByRole(role);
    } catch (err: any) {
      setError(err.message || 'Failed demo login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0B0F17] aurora-bg relative overflow-hidden font-sans">
      {/* Ambient background velvet glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-[#111827]/90 border border-white/10 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-glow-brand mx-auto ring-1 ring-white/20">
            <ShieldCheck className="w-8 h-8 text-white drop-shadow" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SECURE REGULATORY GATEWAY ACTIVE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Authorized Account'}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            SIH26261 • AI-Powered Regulatory Scrutiny &amp; Document Authentication
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setSuccessMsg('');
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Register Account
          </button>
        </div>

        {/* Status Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {mode === 'login' ? (
          <>
            {/* 1-Click Instant Persona Quick Login */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>⚡ Instant One-Click Demo Access:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('APPLICANT')}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-indigo-500/50 text-left transition-all hover:bg-white/[0.06] hover:shadow-glow-brand group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-indigo-500/15 text-indigo-400 group-hover:scale-110 transition">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">Applicant</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Dr. Rajesh (Apex)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('OFFICER')}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-violet-500/50 text-left transition-all hover:bg-white/[0.06] hover:shadow-glow-violet group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-violet-500/15 text-violet-400 group-hover:scale-110 transition">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-violet-300 transition">Officer</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Smt. Priya (AICTE)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('ADMIN')}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-emerald-500/50 text-left transition-all hover:bg-white/[0.06] hover:shadow-glow-emerald group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">Admin</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Shri Amitabh (Chief)</p>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/[0.08]" />
              <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                or sign in with credentials
              </span>
              <div className="flex-grow border-t border-white/[0.08]" />
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleStandardLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@aicte.gov.in or applicant@apex.edu"
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <span className="text-[10px] text-slate-500 font-mono">Demo: password123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ring-1 ring-white/10"
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign In to Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            {/* Role Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Role Designation</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRegRole('APPLICANT')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                    regRole === 'APPLICANT'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-glow-brand ring-1 ring-indigo-500/30'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/20'
                  }`}
                >
                  <FileText className={`w-4 h-4 mt-0.5 ${regRole === 'APPLICANT' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">Applicant</div>
                    <div className="text-[10px] text-slate-400">College / University Representative</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('OFFICER')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                    regRole === 'OFFICER'
                      ? 'bg-violet-600/15 border-violet-500 text-white shadow-glow-violet ring-1 ring-violet-500/30'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/20'
                  }`}
                >
                  <UserCheck className={`w-4 h-4 mt-0.5 ${regRole === 'OFFICER' ? 'text-violet-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">Scrutiny Officer</div>
                    <div className="text-[10px] text-slate-400">AICTE Regulatory Verification Desk</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Dr. Anand Verma"
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="director@institute.ac.in"
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Designation & Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    placeholder={regRole === 'APPLICANT' ? 'Director / Principal' : 'Regulatory Inspector'}
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-2 pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Institution Section (for Applicant role) */}
            {regRole === 'APPLICANT' && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    Affiliated Institution
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewInstitution(!isNewInstitution)}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {isNewInstitution ? '← Select Existing' : '+ Register New Institution'}
                  </button>
                </div>

                {!isNewInstitution ? (
                  <div>
                    <select
                      value={regInstitutionId}
                      onChange={(e) => setRegInstitutionId(e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.code}) - {inst.state}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <input
                        type="text"
                        required
                        value={newInstName}
                        onChange={(e) => setNewInstName(e.target.value)}
                        placeholder="Institution Name (e.g. National Inst of Tech)"
                        className="w-full bg-[#111827] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newInstState}
                        onChange={(e) => setNewInstState(e.target.value)}
                        placeholder="State / Region (e.g. Maharashtra)"
                        className="w-full bg-[#111827] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ring-1 ring-white/10"
            >
              {isLoading ? 'Creating Authorized Account...' : 'Register & Enter Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
