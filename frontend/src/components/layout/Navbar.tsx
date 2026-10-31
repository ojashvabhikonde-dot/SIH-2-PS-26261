import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Notification } from '../../types';
import {
  ShieldCheck,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Scale,
  BarChart3,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((res) => {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationRead('all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  return (
    <header className="sticky top-0 z-40 w-full t-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center transition-all duration-300 group-hover:scale-105 ring-1 ring-white/20">
            <ShieldCheck className="w-5 h-5 text-white drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight theme-text-primary font-sans">SIH26261</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 tracking-wider">
                REGULATORY SUITE
              </span>
            </div>
            <p className="text-[10px] theme-text-muted -mt-0.5 font-medium tracking-wide">
              AI Verification &amp; Statutory Compliance
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
          {user?.role === 'APPLICANT' && (
            <>
              <Link
                to="/applicant"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/applicant'
                    ? 'bg-indigo-500/15 theme-text-primary border border-indigo-500/30 shadow-sm'
                    : 'theme-text-secondary hover:theme-text-primary theme-hover'
                }`}
              >
                My Applications
              </Link>
            </>
          )}

          {user?.role === 'OFFICER' && (
            <>
              <Link
                to="/officer"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/officer'
                    ? 'bg-indigo-500/15 theme-text-primary border border-indigo-500/30 shadow-sm'
                    : 'theme-text-secondary hover:theme-text-primary theme-hover'
                }`}
              >
                Verification Queue
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/admin'
                    ? 'bg-indigo-500/15 theme-text-primary border border-indigo-500/30 shadow-sm'
                    : 'theme-text-secondary hover:theme-text-primary theme-hover'
                }`}
              >
                Executive Analytics
              </Link>
              <Link
                to="/admin/rules"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/admin/rules'
                    ? 'bg-indigo-500/15 theme-text-primary border border-indigo-500/30 shadow-sm'
                    : 'theme-text-secondary hover:theme-text-primary theme-hover'
                }`}
              >
                Compliance Rules
              </Link>
              <Link
                to="/admin/audit"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/admin/audit'
                    ? 'bg-indigo-500/15 theme-text-primary border border-indigo-500/30 shadow-sm'
                    : 'theme-text-secondary hover:theme-text-primary theme-hover'
                }`}
              >
                Audit Trail
              </Link>
            </>
          )}
        </nav>

        {/* Right Section: Command Palette Trigger, Role Switcher, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl theme-surface theme-text-secondary hover:theme-text-primary transition-all text-xs"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">Quick search...</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{background:'var(--kbd-bg)', color:'var(--text-secondary)'}}>Ctrl+K</kbd>
          </button>

          {/* Quick 1-Click Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-surface text-xs hover:border-indigo-500/40 transition-all shadow-sm"
              title="Switch demo persona"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold theme-text-muted">Role:</span>
              <span className="font-bold text-indigo-500 uppercase tracking-wide">{user?.role || 'Guest'}</span>
              <ChevronDown className="w-3 h-3 theme-text-muted" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl theme-dropdown shadow-2xl p-1.5 z-50 text-xs">
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold theme-text-muted tracking-wider">
                  Switch Demo Persona:
                </div>
                <button
                  onClick={() => { demoLogin('OFFICER'); setShowRoleMenu(false); navigate('/officer'); }}
                  className="w-full text-left px-3 py-2 rounded-xl theme-hover theme-text-primary transition flex items-center justify-between"
                >
                  <span className="font-medium">Verification Officer</span>
                  {user?.role === 'OFFICER' && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </button>
                <button
                  onClick={() => { demoLogin('APPLICANT'); setShowRoleMenu(false); navigate('/applicant'); }}
                  className="w-full text-left px-3 py-2 rounded-xl theme-hover theme-text-primary transition flex items-center justify-between"
                >
                  <span className="font-medium">College Applicant</span>
                  {user?.role === 'APPLICANT' && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </button>
                <button
                  onClick={() => { demoLogin('ADMIN'); setShowRoleMenu(false); navigate('/admin'); }}
                  className="w-full text-left px-3 py-2 rounded-xl theme-hover theme-text-primary transition flex items-center justify-between"
                >
                  <span className="font-medium">Compliance Admin</span>
                  {user?.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-xl theme-surface theme-text-secondary hover:text-indigo-500 transition-all relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl theme-dropdown shadow-2xl p-2.5 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 theme-border border-b px-2">
                    <span className="font-bold theme-text-primary text-xs">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-indigo-500 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center theme-text-muted text-[11px]">
                        No notifications right now.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition ${
                            n.isRead ? 'theme-surface theme-text-secondary' : 'bg-indigo-500/10 border-indigo-500/20 theme-text-primary'
                          }`}
                        >
                          <p className="font-bold theme-text-primary text-[11px] mb-0.5">{n.title}</p>
                          <p className="text-[11px] theme-text-secondary leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl theme-surface transition-all ${
              theme === 'dark'
                ? 'hover:border-amber-400/40'
                : 'hover:border-indigo-500/50'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="p-2 rounded-xl theme-surface theme-text-secondary hover:text-rose-500 hover:border-rose-400/30 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl theme-surface theme-text-primary font-medium text-xs transition hover:border-indigo-400/40"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                state={{ mode: 'register' }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/25"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
