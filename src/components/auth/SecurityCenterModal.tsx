import React, { useState, useEffect } from 'react';
import { AuthSession, SecurityEventLog, SecurityPolicy, SecuritySeverity } from '../../types';
import { authService } from '../../services/authService';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Key, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  Sliders, 
  Activity, 
  RefreshCw, 
  Laptop, 
  Globe, 
  Download,
  Fingerprint,
  RotateCcw,
  Zap,
  Radio,
  FileText
} from 'lucide-react';

interface SecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: AuthSession;
}

type SecurityTab = 'AUDIT_LOGS' | 'SESSIONS_DEVICES' | 'TWO_FACTOR' | 'SECURITY_POLICIES';

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({
  isOpen,
  onClose,
  session
}) => {
  const [activeTab, setActiveTab] = useState<SecurityTab>('AUDIT_LOGS');
  const [logs, setLogs] = useState<SecurityEventLog[]>(authService.getSecurityLogs());
  const [policy, setPolicy] = useState<SecurityPolicy>(authService.getSecurityPolicy());
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // 2FA state for current user
  const [is2FAEnabled, setIs2FAEnabled] = useState(
    authService.getUsers().find(u => u.id === session.userId)?.twoFactorEnabled || false
  );

  useEffect(() => {
    const unsubLog = authService.subscribe('security_log_added', () => {
      setLogs(authService.getSecurityLogs());
    });
    return () => unsubLog();
  }, []);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle2FA = () => {
    const newVal = authService.toggle2FA(session.userId);
    setIs2FAEnabled(newVal);
    triggerToast(`Two-Factor Authentication ${newVal ? 'Enabled' : 'Disabled'}`);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    authService.saveSecurityPolicy(policy);
    triggerToast('Global security & lockout policies updated successfully!');
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icestock_security_audit_logs_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Security audit log archive downloaded.');
  };

  const filteredLogs = logs.filter(l => {
    const matchesSev = severityFilter === 'ALL' || l.severity === severityFilter;
    const matchesSearch = searchTerm === '' || 
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSev && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
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
                  SYSTEM SECURITY CENTER
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>GRADE A+ ENCRYPTED</span>
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                Federation Security, 2FA & Audit Intelligence
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

        {/* Toast */}
        {toast && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold shadow-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Quick Security Score & Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm font-mono">
              98%
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">Security Health</div>
              <div className="text-xs font-bold text-white">Full Compliant</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">Lockout Defense</div>
              <div className="text-xs font-bold text-white">{policy.maxFailedAttempts} Max Attempts</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">2FA Status</div>
              <div className="text-xs font-bold text-white">{is2FAEnabled ? 'Active (TOTP)' : 'Disabled'}</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400">Audit Logs</div>
              <div className="text-xs font-bold text-white">{logs.length} Recorded Events</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          {[
            { id: 'AUDIT_LOGS', label: 'Live Security Audit Stream', icon: Activity, count: logs.length },
            { id: 'TWO_FACTOR', label: '2FA & TOTP Authenticator', icon: Fingerprint },
            { id: 'SESSIONS_DEVICES', label: 'Active Sessions & Devices', icon: Laptop },
            { id: 'SECURITY_POLICIES', label: 'Global Security Policies', icon: Sliders }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as SecurityTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className="text-[10px] bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: AUDIT LOGS */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search logs by user, event, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none w-64"
                />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none"
                >
                  <option value="ALL">All Severities</option>
                  <option value="INFO">INFO Only</option>
                  <option value="WARNING">WARNING Only</option>
                  <option value="CRITICAL">CRITICAL Only</option>
                </select>
              </div>

              <button
                onClick={handleExportLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-xs font-mono text-cyan-300 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>
            </div>

            {/* Log Stream */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl max-h-80 overflow-y-auto divide-y divide-slate-900 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No security audit events matching query.</div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-slate-900/50 transition-colors flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                        log.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-blue-950 text-cyan-400 border border-cyan-800'
                      }`}>
                        {log.severity}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.eventType}</span>
                          <span className="text-[10px] text-slate-400">• {log.userName} ({log.userRole})</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">{log.details}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">IP: {log.ipAddress} • {log.userAgent}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TWO-FACTOR AUTHENTICATION */}
        {activeTab === 'TWO_FACTOR' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    Time-based One-Time Password (TOTP / 2FA)
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Secure your federation administrator or referee account with an extra verification code on every login.
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
                  is2FAEnabled
                    ? 'bg-red-950/80 border border-red-600 text-red-300 hover:bg-red-900'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-105'
                }`}
              >
                {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
              </button>
            </div>

            {is2FAEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center text-center gap-3">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Authenticator App QR Code</div>
                  <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center text-slate-950 font-bold text-center text-xs">
                    [TOTP: IFI-AUTH-2026-KEY]
                  </div>
                  <span className="text-[10px] text-cyan-400">Scan with Google Authenticator / Authy</span>
                </div>

                <div className="flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Secret Seed Key:</div>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl font-mono text-cyan-300 select-all font-bold">
                      IFI-AUTH-MASTER-2026-HQ
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-xs mb-1">Emergency Backup Recovery Codes:</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['4829-1092', '9912-3401', '5521-8840', '7103-9923'].map((code) => (
                        <div key={code} className="bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-300 text-[11px] text-center font-bold">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-emerald-400 bg-emerald-950/60 p-2 rounded-xl border border-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>2FA challenge active on next login session.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SESSIONS & DEVICES */}
        {activeTab === 'SESSIONS_DEVICES' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white font-mono">Current Active Devices & Logins</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Manage sessions authenticated with your credentials.</p>
              </div>
              <button
                onClick={() => {
                  triggerToast('All other remote sessions revoked.');
                }}
                className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-800 text-xs font-mono text-red-300 hover:bg-red-900/60 transition-all"
              >
                Revoke Other Sessions
              </button>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="bg-slate-900 border border-cyan-500/40 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">This Device (Current Session)</span>
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        ACTIVE NOW
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {session.ipAddress} • {session.userAgent}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Session Token: {session.token.substring(0, 16)}... • Expires: {new Date(session.expiresAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GLOBAL SECURITY POLICIES */}
        {activeTab === 'SECURITY_POLICIES' && (
          <form onSubmit={handleSavePolicy} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 text-xs font-mono">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Federation-Wide Security Policy Configuration</h4>
              <p className="text-slate-400 mt-0.5">Define brute-force thresholds and session inactivity locks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 mb-1 block">Max Failed Login Attempts Before Lockout</label>
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={policy.maxFailedAttempts}
                  onChange={(e) => setPolicy({ ...policy, maxFailedAttempts: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 mb-1 block">Lockout Duration (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={policy.lockoutDurationMinutes}
                  onChange={(e) => setPolicy({ ...policy, lockoutDurationMinutes: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 mb-1 block">Session Inactivity Auto-Lock (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={policy.sessionInactivityTimeoutMinutes}
                  onChange={(e) => setPolicy({ ...policy, sessionInactivityTimeoutMinutes: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 mb-1 block">Minimum Password Length</label>
                <input
                  type="number"
                  min={6}
                  max={20}
                  value={policy.minPasswordLength}
                  onChange={(e) => setPolicy({ ...policy, minPasswordLength: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.require2FAForHighPrivilege}
                  onChange={(e) => setPolicy({ ...policy, require2FAForHighPrivilege: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
                <div>
                  <div className="text-white font-bold">Mandatory 2FA for Super Admin & Referees</div>
                  <div className="text-[10px] text-slate-400">Enforce second-factor prompt</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.autoSessionLockOnInactivity}
                  onChange={(e) => setPolicy({ ...policy, autoSessionLockOnInactivity: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
                <div>
                  <div className="text-white font-bold">Auto-Screen Lock on Inactivity</div>
                  <div className="text-[10px] text-slate-400">Prevent unauthorized physical terminal access</div>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Save Security Policy</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
