import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Mail,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'user' | 'admin';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'user',
}) => {
  const [tab, setTab] = useState<'user' | 'admin'>(initialMode);
  const [isRegister, setIsRegister] = useState(false);

  // User fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);

  // Admin field
  const [adminIdentifier, setAdminIdentifier] = useState('solankideep36542@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (
          email.trim().toLowerCase() === 'solankideep36542@gmail.com' ||
          name.trim().toLowerCase() === 'deepak solanki'
        ) {
          throw new Error(
            'Administrator accounts cannot be registered. Admin access is available via the login section only.'
          );
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: userPassword,
            role: 'user',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        onLoginSuccess(data.user);
        onClose();
      } else {
        // Standard user or admin signing in through login section
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: userPassword.trim(),
            role:
              email.trim().toLowerCase() === 'solankideep36542@gmail.com' ||
              userPassword.trim() === 'Deepak@582010'
                ? 'admin'
                : 'user',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Authentication failed');
        }

        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminIdentifier.trim() || 'solankideep36542@gmail.com',
          password: adminPassword.trim(),
          role: 'admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid Admin Password');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid admin authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser: UserProfile = {
      id: `usr-guest-${Date.now().toString().slice(-4)}`,
      name: 'Guest Explorer',
      email: 'guest@visitor.deepx.ai',
      role: 'guest',
      createdAt: new Date().toISOString(),
    };
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100">
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setTab('user');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                tab === 'user'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => {
                setTab('admin');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                tab === 'admin'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-medium animate-fade-in">
              {error}
            </div>
          )}

          {tab === 'user' ? (
            /* USER LOGIN / REGISTER FORM */
            <form onSubmit={handleUserAuth} className="space-y-3.5">
              <div className="space-y-1">
                <h3 className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                  {isRegister ? 'Create User Account' : 'Sign In to DeepX AI'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isRegister
                    ? 'Register as a member to save chats and preferences (Admin sign up is disabled)'
                    : 'Log in with your email or admin credentials to continue'}
                </p>
              </div>

              {isRegister && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : isRegister ? 'Create User Account' : 'Sign In'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                  }}
                  className="hover:underline text-blue-600 dark:text-blue-400 font-medium"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </button>
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="hover:underline text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                >
                  Guest Access
                </button>
              </div>
            </form>
          ) : (
            /* ADMIN LOGIN FORM (ONLY LOGIN - NO SIGN UP) */
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>Admin Authentication</span>
                </div>
                <div className="text-[11px] text-rose-600/90 dark:text-rose-300/80 leading-relaxed space-y-1">
                  <p>
                    Admin Profile: <strong>Deepak Solanki</strong> (<code>solankideep36542@gmail.com</code>)
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    * Admin sign-up is disabled for security. Login is available directly in this section.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Admin Name / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Deepak Solanki or solankideep36542@gmail.com"
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter Admin Password..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying Admin Credentials...' : 'Sign In as Administrator'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Real-time visitor monitoring radar is accessible immediately upon login.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
