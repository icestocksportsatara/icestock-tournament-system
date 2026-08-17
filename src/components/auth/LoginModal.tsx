import React, { useState } from 'react';
import { UserRole, AuthUser } from '../../types';
import { authService } from '../../services/authService';
import { 
  Shield, 
  Lock, 
  Mail, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  X, 
  ArrowRight,
  ShieldCheck,
  User,
  Fingerprint,
  Zap,
  Globe,
  Radio
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onOpenRegister?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenRegister
}) => {
  const [identifier, setIdentifier] = useState('admin@icestock.org');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2FA Challenge step
  const [is2FAStage, setIs2FAStage] = useState(false);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.login(identifier, password, rememberMe);
      setIsLoading(false);

      if (res.isKycPending) {
        setErrorMessage(res.error || 'Account Pending Admin KYC Approval: Your verification dossier is currently under review by the Federation Super Admin.');
      } else if (res.requires2FA && res.user) {
        setPendingUser(res.user);
        setIs2FAStage(true);
      } else if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;
    setErrorMessage(null);

    const ok = authService.verify2FACode(pendingUser, otpCode, rememberMe);
    if (ok) {
      onSuccess(pendingUser);
      onClose();
    } else {
      setErrorMessage('Invalid 2FA Verification code. (Demo bypass: 123456 or 202600)');
    }
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    setErrorMessage(null);
    setIs2FAStage(false);
    if (role === 'SUPER_ADMIN') {
      setIdentifier('admin@icestock.org');
      setPassword('admin123');
      return;
    }
    const users = authService.getUsers();
    const target = users.find(u => u.role === role);
    if (target) {
      setIdentifier(target.email);
      setPassword('Icestock@2026!');
    }
  };

  const rolesCatalog: { role: UserRole; title: string; subtitle: string; iconColor: string }[] = [
    { role: 'SUPER_ADMIN', title: 'Super Admin', subtitle: 'Master Account', iconColor: 'text-cyan-400' },
    { role: 'COUNTRY_HEAD', title: 'Country Head', subtitle: 'DESV Germany', iconColor: 'text-blue-400' },
    { role: 'NATIONAL_HEAD', title: 'National Head', subtitle: 'Austria BÖE', iconColor: 'text-indigo-400' },
    { role: 'STATE_HEAD', title: 'State Head', subtitle: 'Bavaria Region', iconColor: 'text-emerald-400' },
    { role: 'DISTRICT_HEAD', title: 'District Head', subtitle: 'Satara ISFI', iconColor: 'text-amber-400' },
    { role: 'REFEREE', title: 'Chief Referee', subtitle: 'On-Ice Official', iconColor: 'text-purple-400' },
    { role: 'TEAM_MANAGER', title: 'Team Manager', subtitle: 'EC Passau Club', iconColor: 'text-teal-400' },
    { role: 'PLAYER', title: 'Athlete', subtitle: 'Stefan Huber (WR#1)', iconColor: 'text-sky-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col gap-6 overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  SECURE AUTHENTICATION
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  256-BIT ENCRYPTION
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                {is2FAStage ? 'Two-Factor Authentication' : 'Federation Member Login'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-950/80 border-2 border-red-500/60 text-red-300 p-3.5 rounded-2xl text-xs font-mono flex items-center gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2FA Challenge Form */}
        {is2FAStage ? (
          <form onSubmit={handle2FASubmit} className="flex flex-col gap-5">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700 flex items-center justify-center text-cyan-400 shrink-0">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{pendingUser?.fullName}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Enter the 6-digit TOTP code sent to your authenticator app or email.
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 mb-1.5 block">6-Digit Security Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-cyan-500 rounded-2xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-cyan-300 font-bold focus:outline-none shadow-inner"
              />
              <span className="text-[11px] text-slate-400 font-mono mt-1.5 block text-center">
                Demo Quick Passcodes: <strong className="text-cyan-300">123456</strong> or <strong className="text-cyan-300">202600</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIs2FAStage(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={otpCode.length < 6}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Access</span>
              </button>
            </div>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            {/* Quick 1-Click Role Switcher Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>1-Click Role Demo Presets:</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Click to autofill</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {rolesCatalog.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleQuickRoleSelect(r.role)}
                    className={`px-2 py-1.5 rounded-xl border text-left transition-all ${
                      identifier.includes(r.role.toLowerCase()) || (r.role === 'SUPER_ADMIN' && identifier.includes('satara'))
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="text-[10px] font-bold truncate">{r.title}</div>
                    <div className="text-[8px] opacity-70 truncate font-mono">{r.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Master Super Admin Quick Card */}
            <div className="bg-gradient-to-r from-cyan-950/70 via-blue-950/60 to-slate-950 p-3 rounded-2xl border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                    <span>Default Master Super Admin:</span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">1 Master Role</span>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-300">
                    ID: <span className="text-white font-bold">admin@icestock.org</span> | Pass: <span className="text-white font-bold">admin123</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('SUPER_ADMIN')}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-mono font-black uppercase transition-all shadow-sm"
              >
                Autofill
              </button>
            </div>

            {/* Email / Username Input */}
            <div>
              <label className="text-xs font-mono text-slate-300 mb-1 block">Email / Username / License ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. admin@icestock.org"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-slate-300">Password</label>
                <span className="text-[10px] text-cyan-400 font-mono">Master: admin123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Security Policy Note */}
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
                <span>Keep me signed in</span>
              </label>
              <span className="text-[10px] text-slate-500">Auto-session lock: 30 mins</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Global TMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Signup prompt */}
            {onOpenRegister && (
              <div className="text-center pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-mono">New official, athlete, or referee? </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRegister();
                  }}
                  className="text-xs text-cyan-400 font-mono font-bold hover:underline"
                >
                  Register Account
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
