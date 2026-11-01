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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center aurora-bg relative overflow-x-hidden font-sans" style={{backgroundColor:'var(--bg-page)'}}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 my-auto"
        style={{backgroundColor:'var(--bg-surface)', border:'1px solid var(--border)', boxShadow:'var(--shadow-card)'}}
      >
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20" style={{background:'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)'}}>
            <ShieldCheck className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SECURE REGULATORY GATEWAY ACTIVE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{color:'var(--text-heading)'}}>
            {mode === 'login' ? 'Welcome Back' : 'Create Authorized Account'}
          </h2>
          <p className="text-xs max-w-md mx-auto" style={{color:'var(--text-muted)'}}>
            Docusure AI • AI-Powered Regulatory Scrutiny &amp; Document Authentication
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="grid grid-cols-2 p-1 rounded-xl" style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)'}}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'btn-brand shadow-sm'
                : 'hover:opacity-80'
            }`}
            style={mode !== 'login' ? {color:'var(--text-muted)'} : {}}
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
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === 'register'
                ? 'btn-brand shadow-sm'
                : 'hover:opacity-80'
            }`}
            style={mode !== 'register' ? {color:'var(--text-muted)'} : {}}
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
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1" style={{color:'var(--text-muted)'}}>
                <span>⚡ Instant One-Click Demo Access:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('APPLICANT')}
                  className="p-3.5 rounded-2xl text-left transition-all group"
                  style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)'}}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg group-hover:scale-110 transition" style={{backgroundColor:'var(--accent-subtle)', color:'var(--accent)'}}>
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold transition" style={{color:'var(--text-heading)'}}>Applicant</span>
                  </div>
                  <p className="text-[10px] truncate" style={{color:'var(--text-muted)'}}>Dr. Rajesh (Apex)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('OFFICER')}
                  className="p-3.5 rounded-2xl text-left transition-all group"
                  style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)'}}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-violet-500/15 text-violet-400 group-hover:scale-110 transition">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold transition" style={{color:'var(--text-heading)'}}>Officer</span>
                  </div>
                  <p className="text-[10px] truncate" style={{color:'var(--text-muted)'}}>Smt. Priya (AICTE)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('ADMIN')}
                  className="p-3.5 rounded-2xl text-left transition-all group"
                  style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)'}}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold transition" style={{color:'var(--text-heading)'}}>Admin</span>
                  </div>
                  <p className="text-[10px] truncate" style={{color:'var(--text-muted)'}}>Shri Amitabh (Chief)</p>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t" style={{borderColor:'var(--border)'}} />
              <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--text-faint)'}}>
                or sign in with credentials
              </span>
              <div className="flex-grow border-t" style={{borderColor:'var(--border)'}} />
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleStandardLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-body)'}}>Official Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 pointer-events-none" style={{color:'var(--text-muted)'}} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@aicte.gov.in or applicant@apex.edu"
                    className="w-full t-input rounded-xl py-2.5 pl-10 pr-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold" style={{color:'var(--text-body)'}}>Password</label>
                  <span className="text-[10px] font-mono" style={{color:'var(--text-faint)'}}>Demo: password123</span>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 pointer-events-none" style={{color:'var(--text-muted)'}} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full t-input rounded-xl py-2.5 pl-10 pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 transition p-1" style={{color:'var(--text-muted)'}}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-brand"
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
              <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-body)'}}>Select Role Designation</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRegRole('APPLICANT')}
                  className="p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5"
                  style={regRole === 'APPLICANT'
                    ? {backgroundColor:'var(--accent-subtle)', borderColor:'var(--accent)', boxShadow:'var(--shadow-glow)'}
                    : {backgroundColor:'var(--bg-elevated)', borderColor:'var(--border)'}}
                >
                  <FileText className="w-4 h-4 mt-0.5" style={{color: regRole === 'APPLICANT' ? 'var(--accent)' : 'var(--text-muted)'}} />
                  <div>
                    <div className="text-xs font-bold" style={{color:'var(--text-heading)'}}>Applicant</div>
                    <div className="text-[10px]" style={{color:'var(--text-muted)'}}>College / University Representative</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('OFFICER')}
                  className="p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5"
                  style={regRole === 'OFFICER'
                    ? {backgroundColor:'rgba(139,92,246,0.12)', borderColor:'#8B5CF6', boxShadow:'0 0 20px rgba(139,92,246,0.2)'}
                    : {backgroundColor:'var(--bg-elevated)', borderColor:'var(--border)'}}
                >
                  <UserCheck className="w-4 h-4 mt-0.5" style={{color: regRole === 'OFFICER' ? '#8B5CF6' : 'var(--text-muted)'}} />
                  <div>
                    <div className="text-xs font-bold" style={{color:'var(--text-heading)'}}>Scrutiny Officer</div>
                    <div className="text-[10px]" style={{color:'var(--text-muted)'}}>AICTE Regulatory Verification Desk</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-body)'}}>Full Legal Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3.5 pointer-events-none" style={{color:'var(--text-muted)'}} />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Dr. Anand Verma"
                    className="w-full t-input rounded-xl py-2.5 pl-10 pr-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-body)'}}>Official Email</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 pointer-events-none" style={{color:'var(--text-muted)'}} />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="director@institute.ac.in"
                    className="w-full t-input rounded-xl py-2.5 pl-10 pr-3 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Designation & Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-body)'}}>Designation</label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 absolute left-3.5 pointer-events-none" style={{color:'var(--text-muted)'}} />
                  <input
                    type="text"
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    placeholder={regRole === 'APPLICANT' ? 'Director / Principal' : 'Regulatory Inspector'}
                    className="w-full t-input rounded-xl py-2.5 pl-10 pr-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{color:'var(--text-body)'}}>Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 pointer-events-none" style={{color:'var(--text-muted)'}} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full t-input rounded-xl py-2.5 pl-10 pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 transition p-1" style={{color:'var(--text-muted)'}}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Institution Section (for Applicant role) */}
            {regRole === 'APPLICANT' && (
              <div className="p-4 rounded-2xl space-y-3" style={{backgroundColor:'var(--bg-elevated)', border:'1px solid var(--border)'}}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold flex items-center gap-1.5" style={{color:'var(--text-body)'}}>
                    <Building className="w-3.5 h-3.5" style={{color:'var(--accent)'}} />
                    Affiliated Institution
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewInstitution(!isNewInstitution)}
                    className="text-[11px] font-semibold transition" style={{color:'var(--accent)'}}
                  >
                    {isNewInstitution ? '← Select Existing' : '+ Register New Institution'}
                  </button>
                </div>

                {!isNewInstitution ? (
                  <div>
                    <select
                      value={regInstitutionId}
                      onChange={(e) => setRegInstitutionId(e.target.value)}
                      className="w-full t-input rounded-xl py-2.5 px-3.5 text-xs cursor-pointer"
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
                        className="w-full t-input rounded-xl py-2.5 px-3.5 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newInstState}
                        onChange={(e) => setNewInstState(e.target.value)}
                        placeholder="State / Region (e.g. Maharashtra)"
                        className="w-full t-input rounded-xl py-2.5 px-3.5 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-brand"
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
