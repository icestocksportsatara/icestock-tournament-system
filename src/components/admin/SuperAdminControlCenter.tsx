import React, { useState, useEffect } from 'react';
import { 
  MasterFederationSettings, 
  RolePermissionMap, 
  UserRole, 
  PermissionKey,
  Tournament,
  Match,
  Player,
  Team,
  RankingEntry,
  AuthUser,
  UserKycStatus,
  UserKycDossier
} from '../../types';
import { storage } from '../../services/storageService';
import { authService } from '../../services/authService';
import { 
  Shield, 
  Settings, 
  Sliders, 
  Lock, 
  Unlock, 
  Database, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Trophy, 
  Radio, 
  FileText, 
  RefreshCw,
  Key,
  Check,
  X,
  Flame,
  Award,
  Zap,
  Globe,
  Layers,
  Scale,
  ShieldCheck,
  UserCheck,
  UserX,
  FileCheck,
  ShieldAlert,
  Phone,
  Mail,
  Building2,
  MapPin,
  CheckCheck,
  Clock,
  FileSearch,
  Eye
} from 'lucide-react';

interface SuperAdminControlCenterProps {
  onClose?: () => void;
  onNavigateToMatch?: (matchId: string) => void;
  onNavigateToTournament?: (tournament: Tournament) => void;
}

type AdminTab = 'MASTER_SETTINGS' | 'PERMISSIONS_MATRIX' | 'KYC_MANAGEMENT' | 'TOURNAMENT_MANAGER' | 'MATCH_OVERRIDE' | 'ATHLETES_TEAMS' | 'DATABASE_OPS';

export const SuperAdminControlCenter: React.FC<SuperAdminControlCenterProps> = ({
  onClose,
  onNavigateToMatch,
  onNavigateToTournament
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('KYC_MANAGEMENT');
  const [settings, setSettings] = useState<MasterFederationSettings>(storage.getMasterSettings());
  const [permissions, setPermissions] = useState<RolePermissionMap>(storage.getRolePermissions());
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // KYC Management States
  const [kycUsers, setKycUsers] = useState<AuthUser[]>(authService.getAllKycUsers());
  const [kycFilter, setKycFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [selectedKycUser, setSelectedKycUser] = useState<AuthUser | null>(null);
  const [rejectModalUser, setRejectModalUser] = useState<AuthUser | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Incomplete government documentation or invalid federation authorization letter.');
  const [approvalNotesInput, setApprovalNotesInput] = useState('Identity and federation credentials verified against official IFI registry.');

  // Entities state for live editing
  const [tournaments, setTournaments] = useState<Tournament[]>(storage.getTournaments());
  const [matches, setMatches] = useState<Match[]>(storage.getMatches());
  const [players, setPlayers] = useState<Player[]>(storage.getPlayers());
  const [teams, setTeams] = useState<Team[]>(storage.getTeams());

  // Editing modals / state
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [jsonImportText, setJsonImportText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const unsubSettings = storage.subscribe('master_settings_updated', (s) => setSettings(s));
    const unsubPerms = storage.subscribe('role_permissions_updated', (p) => setPermissions(p));
    const unsubTours = storage.subscribe('tournaments_updated', (t) => setTournaments(t));
    const unsubMatches = storage.subscribe('matches_updated', (m) => setMatches(m));
    const unsubPlayers = storage.subscribe('players_updated', (p) => setPlayers(p));
    const unsubTeams = storage.subscribe('teams_updated', (t) => setTeams(t));

    return () => {
      unsubSettings();
      unsubPerms();
      unsubTours();
      unsubMatches();
      unsubPlayers();
      unsubTeams();
    };
  }, []);

  const triggerToast = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveMasterSettings(settings);
    triggerToast('Master Federation Configuration & Homologation settings saved successfully!');
  };

  const handleTogglePermission = (role: UserRole, perm: PermissionKey) => {
    const updated = {
      ...permissions,
      [role]: {
        ...permissions[role],
        [perm]: !permissions[role]?.[perm]
      }
    };
    setPermissions(updated);
    storage.saveRolePermissions(updated);
    triggerToast(`Updated ${perm} for ${role}`);
  };

  const handleResetPermissions = () => {
    if (window.confirm('Reset all role permissions to standard IFI official defaults?')) {
      const defaultPerms = storage.getRolePermissions();
      storage.saveRolePermissions(defaultPerms);
      setPermissions(defaultPerms);
      triggerToast('Role permissions reset to IFI defaults');
    }
  };

  const handleDeleteTournament = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete tournament "${name}"?`)) {
      storage.deleteTournament(id);
      setTournaments(storage.getTournaments());
      triggerToast(`Tournament ${name} deleted`);
    }
  };

  const handleDeleteMatch = (id: string, matchNo: string) => {
    if (window.confirm(`Are you sure you want to permanently delete match ${matchNo}?`)) {
      storage.deleteMatch(id);
      setMatches(storage.getMatches());
      triggerToast(`Match ${matchNo} deleted`);
    }
  };

  const handleDeletePlayer = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete player accreditation for "${name}"?`)) {
      storage.deletePlayer(id);
      setPlayers(storage.getPlayers());
      triggerToast(`Player ${name} removed`);
    }
  };

  const handleUnlockMatch = (matchId: string, matchNo: string) => {
    storage.unlockMatchRefereeLock(matchId);
    setMatches(storage.getMatches());
    triggerToast(`Super Admin unlocked match ${matchNo} for live referee re-editing!`);
  };

  const handleSaveEditedTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTournament) return;
    storage.saveTournament(editingTournament);
    setTournaments(storage.getTournaments());
    setEditingTournament(null);
    triggerToast(`Tournament ${editingTournament.name} updated!`);
  };

  const handleSaveEditedMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;
    storage.saveMatch(editingMatch);
    if (overrideReason) {
      storage.addAuditLog('SUPER_ADMIN_MATCH_EDIT', `Edited match ${editingMatch.matchNumber}. Reason: ${overrideReason}`);
    }
    setMatches(storage.getMatches());
    setEditingMatch(null);
    setOverrideReason('');
    triggerToast(`Match ${editingMatch.matchNumber} saved and synchronized!`);
  };

  const handleSaveEditedPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    storage.savePlayer(editingPlayer);
    setPlayers(storage.getPlayers());
    setEditingPlayer(null);
    triggerToast(`Athlete profile for ${editingPlayer.name} updated!`);
  };

  const handleExportDatabase = () => {
    const jsonStr = storage.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icestock_master_database_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Master database JSON backup exported successfully!');
  };

  const handleImportDatabase = () => {
    if (!jsonImportText) return;
    const ok = storage.importDatabaseJson(jsonImportText);
    if (ok) {
      setTournaments(storage.getTournaments());
      setMatches(storage.getMatches());
      setPlayers(storage.getPlayers());
      setTeams(storage.getTeams());
      setSettings(storage.getMasterSettings());
      setPermissions(storage.getRolePermissions());
      setIsImportModalOpen(false);
      setJsonImportText('');
      triggerToast('Master database successfully restored from JSON!');
    } else {
      alert('Invalid JSON structure. Please verify the exported schema.');
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm('WARNING: This will reset all tournaments, matches, live scores, and player registrations to factory Olympic seed data. Are you sure?')) {
      storage.resetToFactoryDefaults();
      setTournaments(storage.getTournaments());
      setMatches(storage.getMatches());
      setPlayers(storage.getPlayers());
      setTeams(storage.getTeams());
      setSettings(storage.getMasterSettings());
      setPermissions(storage.getRolePermissions());
      triggerToast('System restored to factory Olympic defaults!');
    }
  };

  // KYC Management Handlers
  const refreshKycList = () => {
    setKycUsers(authService.getAllKycUsers());
  };

  const handleApproveKyc = (user: AuthUser, notes?: string) => {
    const res = authService.approveUserKyc(user.id, notes || approvalNotesInput);
    if (res.success) {
      refreshKycList();
      setSelectedKycUser(null);
      triggerToast(`KYC PASSED & APPROVED: ${user.fullName} (${user.role}) is now ACTIVE!`);
    } else {
      triggerToast(res.error || 'Failed to approve KYC.');
    }
  };

  const handleRejectKyc = (user: AuthUser, reason: string) => {
    const res = authService.rejectUserKyc(user.id, reason);
    if (res.success) {
      refreshKycList();
      setRejectModalUser(null);
      setSelectedKycUser(null);
      triggerToast(`KYC REJECTED: ${user.fullName} (${user.role}) registration has been declined.`);
    } else {
      triggerToast(res.error || 'Failed to reject KYC.');
    }
  };

  const handleResetKyc = (user: AuthUser) => {
    const res = authService.resetUserKyc(user.id);
    if (res.success) {
      refreshKycList();
      triggerToast(`KYC status reset to PENDING for ${user.fullName}`);
    }
  };

  const pendingKycCount = kycUsers.filter(u => u.status === 'PENDING_KYC' || u.kycStatus === 'PENDING_APPROVAL').length;

  const permissionLabels: Record<PermissionKey, { title: string; desc: string }> = {
    canManageTournaments: { title: 'Manage Tournaments', desc: 'Create, edit dates, venues, categories & status' },
    canEditLiveScores: { title: 'Live Scoring & Telemetry', desc: 'Input stock coordinates, end scores & times' },
    canLockRefereeCards: { title: 'Certify & Lock Match Cards', desc: 'Official digital referee signature & closure' },
    canAccreditPlayers: { title: 'Accredit & KYC Athletes', desc: 'Verify passports, DOB, clubs & medicals' },
    canCreateTeams: { title: 'Team Roster Registry', desc: 'Register club squads & national teams' },
    canExportPDF: { title: 'Export Official PDF Reports', desc: 'Generate signed tournament match scorecards' },
    canOverrideMatches: { title: 'Override Scores & Locks', desc: 'Adjudicate referee errors & force unlock matches' },
    canConfigureMasterSettings: { title: 'Master Federation Settings', desc: 'Modify HQ parameters, rules & timing' },
    canManageRules: { title: 'Manage Homologation Rules', desc: 'Set disc weights, plate Shore D & handles' },
    canResetDatabase: { title: 'Database Operations', desc: 'Import/export database & factory reset' },
    canDeleteRecords: { title: 'Permanent Delete Entity', desc: 'Remove tournaments, matches & player profiles' }
  };

  const rolesList: UserRole[] = [
    'SUPER_ADMIN',
    'COUNTRY_HEAD',
    'NATIONAL_HEAD',
    'STATE_HEAD',
    'DISTRICT_HEAD',
    'REFEREE',
    'TEAM_MANAGER',
    'PLAYER'
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700">
                MASTER CONTROL & PERMISSIONS
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>UNRESTRICTED ACCESS</span>
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Super Admin Master Settings & Control Center</span>
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Edit all federation parameters, role permissions, live matches, tournaments, rules & master persistence.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDatabase}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono font-bold text-slate-200 hover:text-white transition-all shadow-md"
            title="Download JSON Database Backup"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500/50 text-xs font-mono font-bold text-slate-200 hover:text-white transition-all shadow-md"
            title="Restore from JSON Backup"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Restore</span>
          </button>
          <button
            onClick={handleFactoryReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/60 border border-red-800/80 hover:bg-red-900/60 text-xs font-mono font-bold text-red-300 transition-all shadow-md"
            title="Reset All Data to Olympic Seed Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>Factory Reset</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {saveSuccess && (
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border-2 border-emerald-500/80 text-emerald-300 px-5 py-3 rounded-2xl text-xs font-mono font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Super Admin Tab Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { 
            id: 'KYC_MANAGEMENT', 
            label: 'User KYC Approval Hub', 
            icon: ShieldCheck, 
            count: pendingKycCount > 0 ? `${pendingKycCount} Pending` : `${kycUsers.length} Total`,
            isHighlight: pendingKycCount > 0
          },
          { id: 'MASTER_SETTINGS', label: 'Master Federation Settings', icon: Settings, count: null },
          { id: 'PERMISSIONS_MATRIX', label: '8-Tier Role Permissions Matrix', icon: Key, count: '8 Roles' },
          { id: 'TOURNAMENT_MANAGER', label: 'Tournaments Live Editor', icon: Trophy, count: tournaments.length },
          { id: 'MATCH_OVERRIDE', label: 'Matches & Referee Lock Overrides', icon: Radio, count: matches.length },
          { id: 'ATHLETES_TEAMS', label: 'Athletes & Teams Manager', icon: Users, count: players.length },
          { id: 'DATABASE_OPS', label: 'Database & System Console', icon: Database, count: null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all whitespace-nowrap relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  tab.isHighlight 
                    ? 'bg-amber-950 text-amber-300 border-amber-500 animate-pulse font-bold' 
                    : 'bg-slate-950 text-slate-300 border-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 0: KYC MANAGEMENT & APPROVAL HUB */}
      {activeAdminTab === 'KYC_MANAGEMENT' && (
        <div className="flex flex-col gap-6">
          {/* Regulatory Mandate Hero Card */}
          <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20 shrink-0 mt-1">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800">
                    FEDERATION REGULATORY GATE
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    IFI SECURITY MANDATE 2026
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Official Member KYC Verification & Access Gate
                </h3>
                <p className="text-xs text-slate-300 font-mono leading-relaxed max-w-3xl">
                  Under official International Federation Icestocksport (IFI) governance rules, all non-player registrations (Referees, Country Heads, National Directors, State & District Executives, Team Coaches/Managers) are subject to <strong>mandatory KYC approval</strong>. Registrations remain locked and blocked from login access until the <strong>Super Admin</strong> explicitly evaluates and passes their identity dossier.
                </p>
              </div>
            </div>

            <button
              onClick={refreshKycList}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition-colors shrink-0"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">Awaiting Review</span>
                <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
                  <span>{kycUsers.filter(u => u.status === 'PENDING_KYC' || u.kycStatus === 'PENDING_APPROVAL').length}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">Passed & Active</span>
                <div className="text-2xl font-black text-white font-mono">
                  {kycUsers.filter(u => u.kycStatus === 'VERIFIED').length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-red-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-mono uppercase text-red-400 font-bold block mb-1">Declined / Suspended</span>
                <div className="text-2xl font-black text-white font-mono">
                  {kycUsers.filter(u => u.kycStatus === 'REJECTED' || u.status === 'SUSPENDED').length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300">
                <UserX className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">Exempt Roles (Direct)</span>
                <div className="text-2xl font-black text-white font-mono">
                  Athletes / Players
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              {[
                { id: 'PENDING', label: 'Pending Approval', count: kycUsers.filter(u => u.status === 'PENDING_KYC' || u.kycStatus === 'PENDING_APPROVAL').length },
                { id: 'ALL', label: 'All Registrations', count: kycUsers.length },
                { id: 'VERIFIED', label: 'Verified & Active', count: kycUsers.filter(u => u.kycStatus === 'VERIFIED').length },
                { id: 'REJECTED', label: 'Declined', count: kycUsers.filter(u => u.kycStatus === 'REJECTED').length }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setKycFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                    kycFilter === f.id
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    kycFilter === f.id ? 'bg-cyan-800 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-slate-400">
              Showing <strong className="text-white">{kycUsers.filter(u => {
                if (kycFilter === 'PENDING') return u.status === 'PENDING_KYC' || u.kycStatus === 'PENDING_APPROVAL';
                if (kycFilter === 'VERIFIED') return u.kycStatus === 'VERIFIED';
                if (kycFilter === 'REJECTED') return u.kycStatus === 'REJECTED';
                return true;
              }).length}</strong> member applications
            </div>
          </div>

          {/* KYC Applications List */}
          <div className="flex flex-col gap-4">
            {kycUsers
              .filter(u => {
                if (kycFilter === 'PENDING') return u.status === 'PENDING_KYC' || u.kycStatus === 'PENDING_APPROVAL';
                if (kycFilter === 'VERIFIED') return u.kycStatus === 'VERIFIED';
                if (kycFilter === 'REJECTED') return u.kycStatus === 'REJECTED';
                return true;
              })
              .map((user) => {
                const isPending = user.status === 'PENDING_KYC' || user.kycStatus === 'PENDING_APPROVAL';
                const isVerified = user.kycStatus === 'VERIFIED';
                const isRejected = user.kycStatus === 'REJECTED';

                return (
                  <div
                    key={user.id}
                    className={`bg-slate-900/90 border-2 rounded-3xl p-5 md:p-6 shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                      isPending 
                        ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 hover:border-amber-400' 
                        : isVerified 
                        ? 'border-emerald-500/40 hover:border-emerald-400' 
                        : 'border-red-500/40 hover:border-red-400'
                    }`}
                  >
                    {/* Left: Applicant Identity & Role */}
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                        alt={user.fullName}
                        className="w-14 h-14 rounded-2xl border-2 border-slate-700 bg-slate-950 object-cover shrink-0 shadow-md"
                      />
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black text-white">{user.fullName}</h4>
                          <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                            {user.role}
                          </span>
                          <span className="text-[10px] font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {user.country} {user.state ? `• ${user.state}` : ''} {user.district ? `(${user.district})` : ''}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{user.email}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Key className="w-3.5 h-3.5 text-cyan-500" />
                            <span>License: <strong className="text-slate-300">{user.federationLicenseId}</strong></span>
                          </span>
                          {user.kycDossier?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{user.kycDossier.phone}</span>
                            </span>
                          )}
                        </div>

                        {/* KYC Credentials Pill Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-xs font-mono">
                          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                            <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold">Government Document Proof:</span>
                              <span className="text-white font-bold">{user.kycDossier?.documentType || 'Official ID'}</span>
                              <span className="text-cyan-300 block font-mono">#{user.kycDossier?.documentNumber || 'UNASSIGNED'}</span>
                            </div>
                          </div>

                          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                            <Building2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold">Federation Association:</span>
                              <span className="text-slate-200 line-clamp-1">{user.kycDossier?.federationAffiliation || user.club || 'National Association'}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{user.kycDossier?.officialAddress || 'Office registered'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rejection / Review note if present */}
                        {user.kycDossier?.rejectionReason && (
                          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-2.5 text-xs font-mono text-red-300 mt-1 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <strong>Rejection Notice:</strong> "{user.kycDossier.rejectionReason}"
                            </div>
                          </div>
                        )}

                        {user.kycDossier?.reviewedByAdminName && isVerified && (
                          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 mt-1">
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Passed & Approved by {user.kycDossier.reviewedByAdminName} on {new Date(user.kycDossier.reviewedAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status & Super Admin Actions */}
                    <div className="flex flex-col items-end gap-3 shrink-0 w-full lg:w-auto border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0">
                      {/* Status indicator */}
                      <div>
                        {isPending && (
                          <span className="px-3.5 py-1.5 rounded-xl bg-amber-950 text-amber-300 border-2 border-amber-500 font-mono text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                            <span>AWAITING ADMIN PASS</span>
                          </span>
                        )}
                        {isVerified && (
                          <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500 font-mono text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>PASSED & ACTIVE</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-3 py-1 rounded-xl bg-red-950 text-red-300 border border-red-500 font-mono text-xs font-bold flex items-center gap-1.5">
                            <UserX className="w-4 h-4 text-red-400" />
                            <span>KYC DECLINED</span>
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <button
                          onClick={() => setSelectedKycUser(user)}
                          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all border border-slate-700"
                        >
                          <Eye className="w-4 h-4 text-cyan-400" />
                          <span>Inspect Dossier</span>
                        </button>

                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleApproveKyc(user)}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Pass KYC</span>
                            </button>
                            <button
                              onClick={() => setRejectModalUser(user)}
                              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-700 font-mono text-xs font-bold transition-all"
                            >
                              <X className="w-4 h-4" />
                              <span>Decline</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleResetKyc(user)}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-mono text-[11px] transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {kycUsers.filter(u => {
              if (kycFilter === 'PENDING') return u.status === 'PENDING_KYC' || u.kycStatus === 'PENDING_APPROVAL';
              if (kycFilter === 'VERIFIED') return u.kycStatus === 'VERIFIED';
              if (kycFilter === 'REJECTED') return u.kycStatus === 'REJECTED';
              return true;
            }).length === 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 opacity-60" />
                <h4 className="text-base font-bold text-white font-mono">No Records in Selected Queue</h4>
                <p className="text-xs text-slate-400 font-mono max-w-md">
                  There are currently no member KYC records matching the active filter.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: MASTER FEDERATION SETTINGS */}
      {activeAdminTab === 'MASTER_SETTINGS' && (
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Federation Identity */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Federation Identity & Contact
                </h3>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-mono mb-1 block">Full Federation Name</label>
                  <input
                    type="text"
                    value={settings.federationName}
                    onChange={(e) => setSettings({ ...settings, federationName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Short Code</label>
                    <input
                      type="text"
                      value={settings.shortCode}
                      onChange={(e) => setSettings({ ...settings, shortCode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Active Circuit Season</label>
                    <input
                      type="text"
                      value={settings.activeSeason}
                      onChange={(e) => setSettings({ ...settings, activeSeason: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-mono mb-1 block">Headquarters / Main Secretariat</label>
                  <input
                    type="text"
                    value={settings.headquarters}
                    onChange={(e) => setSettings({ ...settings, headquarters: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono mb-1 block">Official Super Admin Email</label>
                  <input
                    type="email"
                    value={settings.officialContactEmail}
                    onChange={(e) => setSettings({ ...settings, officialContactEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono mb-1 block">Default Scoring Rulebook</label>
                  <select
                    value={settings.defaultScoringSystem}
                    onChange={(e) => setSettings({ ...settings, defaultScoringSystem: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="IISF_STANDARD_1PT">IISF Standard (1 Point per stock, 6 Ends, 2 Pts for Win)</option>
                    <option value="IFI_INTERNATIONAL_3PT">IFI International (3 Pts first stock, 2 Pts secondary, 6 Ends)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Official Equipment Homologation Standards */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Scale className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Equipment Homologation & Timing Standards
                </h3>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Stock Weight Min (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.stockWeightMinKg}
                      onChange={(e) => setSettings({ ...settings, stockWeightMinKg: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Stock Weight Max (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.stockWeightMaxKg}
                      onChange={(e) => setSettings({ ...settings, stockWeightMaxKg: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Disc Diameter (mm)</label>
                    <input
                      type="number"
                      value={settings.discDiameterMm}
                      onChange={(e) => setSettings({ ...settings, discDiameterMm: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Max Handle Length (mm)</label>
                    <input
                      type="number"
                      value={settings.maxHandleLengthMm}
                      onChange={(e) => setSettings({ ...settings, maxHandleLengthMm: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Shot Clock (s)</label>
                    <input
                      type="number"
                      value={settings.shotClockSeconds}
                      onChange={(e) => setSettings({ ...settings, shotClockSeconds: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Turn Limit (s)</label>
                    <input
                      type="number"
                      value={settings.turnDurationLimitSeconds}
                      onChange={(e) => setSettings({ ...settings, turnDurationLimitSeconds: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Laser Tol (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.laserTelemetryToleranceMm}
                      onChange={(e) => setSettings({ ...settings, laserTelemetryToleranceMm: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Gold Ranking Pts</label>
                    <input
                      type="number"
                      value={settings.worldRankingPointsGold}
                      onChange={(e) => setSettings({ ...settings, worldRankingPointsGold: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Silver Ranking Pts</label>
                    <input
                      type="number"
                      value={settings.worldRankingPointsSilver}
                      onChange={(e) => setSettings({ ...settings, worldRankingPointsSilver: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-mono mb-1 block">Bronze Ranking Pts</label>
                    <input
                      type="number"
                      value={settings.worldRankingPointsBronze}
                      onChange={(e) => setSettings({ ...settings, worldRankingPointsBronze: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-600 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Master Feature Toggles */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Federation Operational Flags & Overrides
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-cyan-500/50">
                <input
                  type="checkbox"
                  checked={settings.allowRefereeScoreOverrides}
                  onChange={(e) => setSettings({ ...settings, allowRefereeScoreOverrides: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
                <div>
                  <div className="text-white font-bold">Referee Overrides Allowed</div>
                  <div className="text-[11px] text-slate-400">Permit Super Admin score changes</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-cyan-500/50">
                <input
                  type="checkbox"
                  checked={settings.enableGlobalLiveBroadcast}
                  onChange={(e) => setSettings({ ...settings, enableGlobalLiveBroadcast: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
                <div>
                  <div className="text-white font-bold">Public Stadium TV Stream</div>
                  <div className="text-[11px] text-slate-400">Stream 3D live feeds on Jumbotron</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-cyan-500/50">
                <input
                  type="checkbox"
                  checked={settings.summerRulesEnabled}
                  onChange={(e) => setSettings({ ...settings, summerRulesEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
                <div>
                  <div className="text-white font-bold">Summer Asphalt Rules (ISG)</div>
                  <div className="text-[11px] text-slate-400">Support dry polymer & asphalt surfaces</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-mono font-bold hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Master Federation Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: 8-TIER ROLE PERMISSIONS MATRIX */}
      {activeAdminTab === 'PERMISSIONS_MATRIX' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <span>8-Tier Federation Role Access & Permissions Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Toggle capabilities per organizational hierarchy tier. Changes take effect across all active user sessions instantly.
              </p>
            </div>
            <button
              onClick={handleResetPermissions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset to IFI Defaults</span>
            </button>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                  <th className="p-3 border border-slate-800 sticky left-0 bg-slate-950 z-10">CAPABILITY / PERMISSION</th>
                  {rolesList.map((r) => (
                    <th key={r} className="p-3 border border-slate-800 text-center min-w-[110px]">
                      <span className={r === 'SUPER_ADMIN' ? 'text-cyan-400 font-black' : 'text-slate-300'}>
                        {r.replace('_', ' ')}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(permissionLabels) as PermissionKey[]).map((permKey) => {
                  const info = permissionLabels[permKey];
                  return (
                    <tr key={permKey} className="border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 border border-slate-800 sticky left-0 bg-slate-900/95 z-10">
                        <div className="font-bold text-white">{info.title}</div>
                        <div className="text-[10px] text-slate-400">{info.desc}</div>
                      </td>
                      {rolesList.map((role) => {
                        const isGranted = role === 'SUPER_ADMIN' ? true : !!permissions[role]?.[permKey];
                        const isSuper = role === 'SUPER_ADMIN';
                        return (
                          <td key={role} className="p-3 border border-slate-800 text-center">
                            <button
                              disabled={isSuper}
                              onClick={() => handleTogglePermission(role, permKey)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isGranted
                                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/20'
                                  : 'bg-red-950/40 border-red-800/40 text-red-400 opacity-60'
                              } ${isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:scale-110'}`}
                              title={isSuper ? 'Super Admin always possesses all permissions' : `Click to toggle ${info.title} for ${role}`}
                            >
                              {isGranted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TOURNAMENTS LIVE EDITOR */}
      {activeAdminTab === 'TOURNAMENT_MANAGER' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Sanctioned Tournaments Master Manager</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Edit tournament sanction details, prize pools, venues, and competition statuses directly.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800">
              {tournaments.length} Total Tournaments Registered
            </div>
          </div>

          {/* List of Tournaments */}
          <div className="flex flex-col gap-4">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                    🏆
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">
                        {t.code}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {t.tier} • {t.surface}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        t.status === 'LIVE' 
                          ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' 
                          : t.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{t.name}</h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      📍 {t.location.venue}, {t.location.city}, {t.location.country} • 📅 {t.startDate} to {t.endDate} • 💰 {t.totalPrizePool || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTournament(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono font-bold text-cyan-300 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTournament(t.id, t.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/60 hover:bg-red-900/60 text-xs font-mono font-bold text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MATCHES & REFEREE LOCK OVERRIDES */}
      {activeAdminTab === 'MATCH_OVERRIDE' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-400" />
                <span>Matches & Referee Lock Overrides Adjudicator</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Super Admin can force-unlock locked matches, correct scoring disputes, change referees, and update match status.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800">
              {matches.length} Total Matches
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {matches.map((m) => {
              const isLocked = m.status === 'LOCKED_VERIFIED' || m.status === 'COMPLETED';
              return (
                <div
                  key={m.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-cyan-400 shrink-0">
                      {m.rinkNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {m.matchNumber}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase">
                          {m.discipline} • {m.stage}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          m.status === 'LIVE'
                            ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                            : m.status === 'LOCKED_VERIFIED'
                            ? 'bg-purple-950 text-purple-400 border border-purple-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        {m.team1?.name || m.player1?.name || 'TBD'} vs {m.team2?.name || m.player2?.name || 'TBD'}
                      </h4>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Referee: <span className="text-slate-200">{m.refereeName}</span> • Scheduled: {m.scheduledTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLocked && (
                      <button
                        onClick={() => handleUnlockMatch(m.id, m.matchNumber)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/50 hover:bg-amber-900/60 text-xs font-mono font-bold text-amber-300 transition-all shadow-md"
                        title="Unlock match from locked state back to LIVE for referee editing"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Force Unlock</span>
                      </button>
                    )}
                    <button
                      onClick={() => setEditingMatch(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono font-bold text-cyan-300 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Scores / Meta</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(m.id, m.matchNumber)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-800/60 hover:bg-red-900/60 text-xs font-mono font-bold text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ATHLETES & TEAMS MANAGER */}
      {activeAdminTab === 'ATHLETES_TEAMS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Athletes Accreditation & Teams Directory</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Edit KYC status, club affiliations, world rankings, and stock specifications for registered athletes.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800">
              {players.length} Athletes • {teams.length} Teams
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((p) => (
              <div
                key={p.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <img src={p.profileImage} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.flag}</span>
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        p.kycStatus === 'VERIFIED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {p.kycStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {p.playerId} • {p.club} • WR #{p.worldRank} ({p.rankingPoints} pts)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingPlayer(p)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-cyan-300"
                    title="Edit Athlete Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(p.id, p.name)}
                    className="p-2 rounded-xl bg-red-950/40 border border-red-800/60 hover:bg-red-900/60 text-red-400"
                    title="Delete Athlete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DATABASE & SYSTEM CONSOLE */}
      {activeAdminTab === 'DATABASE_OPS' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Database Persistence & System Maintenance
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Backup */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white font-mono">Master Database Backup</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Export complete JSON snapshot containing all tournaments, matches, live scorecards, rankings, athletes, teams, and master federation configurations.
                </p>
              </div>
              <button
                onClick={handleExportDatabase}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/30 text-cyan-300 text-xs font-mono font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Export Complete JSON</span>
              </button>
            </div>

            {/* Restore */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400 mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white font-mono">Database Restore</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Restore previously exported database files into current workspace storage with automated schema validation.
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 text-blue-300 text-xs font-mono font-bold"
              >
                <Upload className="w-4 h-4" />
                <span>Restore from JSON</span>
              </button>
            </div>

            {/* Factory Reset */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 mb-3">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white font-mono">Factory Reset (Seed Data)</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Re-initialize all state to default Olympic World Championship data with 6 rinks, 16 teams, and live scoring telemetry.
                </p>
              </div>
              <button
                onClick={handleFactoryReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/60 border border-red-700 hover:bg-red-900/60 text-red-300 text-xs font-mono font-bold"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Seed Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TOURNAMENT */}
      {editingTournament && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                Edit Tournament: {editingTournament.name}
              </h3>
              <button onClick={() => setEditingTournament(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedTournament} className="flex flex-col gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 mb-1 block">Tournament Name</label>
                <input
                  type="text"
                  value={editingTournament.name}
                  onChange={(e) => setEditingTournament({ ...editingTournament, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Tournament Code</label>
                  <input
                    type="text"
                    value={editingTournament.code}
                    onChange={(e) => setEditingTournament({ ...editingTournament, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Status</label>
                  <select
                    value={editingTournament.status}
                    onChange={(e) => setEditingTournament({ ...editingTournament, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="REGISTRATION_OPEN">REGISTRATION_OPEN</option>
                    <option value="LIVE">LIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Venue</label>
                  <input
                    type="text"
                    value={editingTournament.location.venue}
                    onChange={(e) => setEditingTournament({
                      ...editingTournament,
                      location: { ...editingTournament.location, venue: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Prize Pool</label>
                  <input
                    type="text"
                    value={editingTournament.totalPrizePool || ''}
                    onChange={(e) => setEditingTournament({ ...editingTournament, totalPrizePool: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingTournament(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MATCH SCORES & OVERRIDE */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                Super Admin Adjudication: {editingMatch.matchNumber}
              </h3>
              <button onClick={() => setEditingMatch(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedMatch} className="flex flex-col gap-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Match Status</label>
                  <select
                    value={editingMatch.status}
                    onChange={(e) => setEditingMatch({ ...editingMatch, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="WARMUP">WARMUP</option>
                    <option value="LIVE">LIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="LOCKED_VERIFIED">LOCKED_VERIFIED</option>
                    <option value="POSTPONED">POSTPONED</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Assigned Referee</label>
                  <input
                    type="text"
                    value={editingMatch.refereeName}
                    onChange={(e) => setEditingMatch({ ...editingMatch, refereeName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Team Scores Override */}
              {(editingMatch.discipline === 'TEAM_GAME' || editingMatch.discipline === 'HEAD_TO_HEAD') && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-slate-400 mb-1 block">Team 1 Shot Points</label>
                    <input
                      type="number"
                      value={editingMatch.scores.team1TotalScore || 0}
                      onChange={(e) => setEditingMatch({
                        ...editingMatch,
                        scores: { ...editingMatch.scores, team1TotalScore: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-blue-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 mb-1 block">Team 2 Shot Points</label>
                    <input
                      type="number"
                      value={editingMatch.scores.team2TotalScore || 0}
                      onChange={(e) => setEditingMatch({
                        ...editingMatch,
                        scores: { ...editingMatch.scores, team2TotalScore: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-red-400 font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-400 mb-1 block">Super Admin Override Reason (Audit Logged)</label>
                <input
                  type="text"
                  placeholder="e.g. Official IFI Protest Adjudication / Video Review Correction"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold"
                >
                  Save & Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PLAYER ACCREDITATION */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                Edit Athlete Accreditation: {editingPlayer.name}
              </h3>
              <button onClick={() => setEditingPlayer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPlayer} className="flex flex-col gap-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Athlete Name</label>
                  <input
                    type="text"
                    value={editingPlayer.name}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">KYC Status</label>
                  <select
                    value={editingPlayer.kycStatus}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, kycStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Club Affiliation</label>
                  <input
                    type="text"
                    value={editingPlayer.club}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, club: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Ranking Points</label>
                  <input
                    type="number"
                    value={editingPlayer.rankingPoints}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, rankingPoints: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KYC DOSSIER INSPECTION & ADJUDICATION */}
      {selectedKycUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">Super Admin Evaluation Dossier</span>
                  <h3 className="text-base font-black text-white">{selectedKycUser.fullName}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedKycUser(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">REQUESTED ROLE</span>
                <span className="text-cyan-300 font-bold">{selectedKycUser.role}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">TERRITORIAL JURISDICTION</span>
                <span className="text-white font-bold">{selectedKycUser.country} {selectedKycUser.state ? `/ ${selectedKycUser.state}` : ''}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">LICENSE IDENTIFIER</span>
                <span className="text-amber-300 font-bold">{selectedKycUser.federationLicenseId}</span>
              </div>
            </div>

            {/* Document and Identity Dossier */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Official Verification Artifacts</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block">GOVERNMENT ID TYPE & NUMBER:</span>
                  <span className="text-white font-bold">{selectedKycUser.kycDossier?.documentType || 'National Identification'}</span>
                  <p className="text-cyan-300 font-bold mt-0.5">#{selectedKycUser.kycDossier?.documentNumber || 'IFI-DOC-8921-X'}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">FEDERATION APPOINTMENT LETTER / REF:</span>
                  <span className="text-slate-300 font-bold">{selectedKycUser.kycDossier?.appointmentLetterNumber || 'APPT-2026-HQ-092'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">OFFICIAL EMAIL & PHONE:</span>
                  <span className="text-slate-300 block">{selectedKycUser.email}</span>
                  <span className="text-emerald-400 block">{selectedKycUser.kycDossier?.phone || '+43 (0) 664 1234567'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">HEADQUARTERS / SECRETARIAT ADDRESS:</span>
                  <span className="text-slate-300 block">{selectedKycUser.kycDossier?.officialAddress || 'International Federation Office'}</span>
                </div>
              </div>

              {/* Document attachment representation */}
              <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 font-bold text-[10px]">
                    PDF
                  </div>
                  <div>
                    <span className="text-white font-bold block">{selectedKycUser.kycDossier?.documentFileName || `${selectedKycUser.username}_verification_dossier.pdf`}</span>
                    <span className="text-[10px] text-slate-500">Official Encrypted Document • Signed by Candidate</span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Dossier Attached</span>
                </span>
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Candidate Declaration:</strong> "I hereby solemnly declare that all information, certifications, and identity artifacts submitted herein are authentic and conform strictly to the IFI Code of Ethics and anti-fraud regulations."
            </div>

            {/* Admin Notes Field */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 mb-1 block">Super Admin Certification Notes (Audit Trail)</label>
              <input
                type="text"
                value={approvalNotesInput}
                onChange={(e) => setApprovalNotesInput(e.target.value)}
                placeholder="Enter evaluation rationale (e.g. Identity and federation credentials verified against official IFI registry.)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedKycUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono hover:text-white"
              >
                Close Inspector
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalUser(selectedKycUser);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Decline Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveKyc(selectedKycUser)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pass & Approve KYC Access</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DECLINE / REJECT KYC */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-red-400 uppercase font-mono flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-400" />
                <span>Decline Registration: {rejectModalUser.fullName}</span>
              </h3>
              <button onClick={() => setRejectModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono">
              Please specify the official rationale for declining this registration. The candidate will see this reason when attempting to log in, and their status will be set to SUSPENDED.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-slate-400">Rejection Notice / Defect Explanation</label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectKyc(rejectModalUser, rejectionReasonInput)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: JSON DATABASE RESTORE */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Restore Master Database from JSON</span>
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Paste the JSON backup string below to restore all tournaments, players, matches, settings and role permissions:
            </p>

            <textarea
              rows={10}
              placeholder="Paste JSON database dump here..."
              value={jsonImportText}
              onChange={(e) => setJsonImportText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleImportDatabase}
                disabled={!jsonImportText.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-mono font-bold disabled:opacity-50"
              >
                Import & Replace State
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
