import React, { useState } from 'react';
import { AuthSession } from '../../types';
import { authService } from '../../services/authService';
import { 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Key, 
  Eye, 
  EyeOff, 
  LogOut, 
  AlertCircle,
  Fingerprint
} from 'lucide-react';

interface SessionLockScreenProps {
  session: AuthSession;
  onUnlocked: () => void;
  onLogout: () => void;
}

export const SessionLockScreen: React.FC<SessionLockScreenProps> = ({
  session,
  onUnlocked,
  onLogout
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = authService.unlockActiveSession(password);
    if (success) {
      onUnlocked();
    } else {
      setError('Incorrect master security password. (Hint: Icestock@2026! or admin123)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-red-500/40 rounded-3xl max-w-md w-full p-8 shadow-2xl relative flex flex-col items-center text-center gap-6">
        {/* Lock Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/20 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>

        {/* User Info */}
        <div>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 mx-auto mb-3 shadow-lg">
            <img src={session.avatar} alt={session.fullName} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {session.role.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {session.federationLicenseId}
            </span>
          </div>
          <h3 className="text-lg font-black text-white mt-1">{session.fullName}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Session securely locked due to inactivity or manual screen lock.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full bg-red-950/80 border border-red-500/60 text-red-300 p-3 rounded-xl text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
          <div className="relative text-left">
            <label className="text-xs font-mono text-slate-400 mb-1 block">Enter Master Password to Resume</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-2xl pl-10 pr-10 py-3 text-xs text-white font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
              Default demo key: <strong className="text-cyan-400">Icestock@2026!</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="flex-1 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Log Out</span>
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Screen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
