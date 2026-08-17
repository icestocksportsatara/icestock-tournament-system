import React, { useState, useEffect } from 'react';
import { UserRole, Tournament, Match, AuthSession, AuthUser } from './types';
import { storage } from './services/storageService';
import { authService } from './services/authService';
import { 
  Trophy, 
  Radio, 
  Layers, 
  Users, 
  FileText, 
  Database, 
  Wifi, 
  WifiOff, 
  Tv, 
  Shield, 
  UserPlus, 
  Sparkles, 
  Activity, 
  Maximize2,
  Calendar,
  Box,
  Flame,
  Award,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  Rocket,
  LogOut,
  ChevronDown,
  User,
  Fingerprint,
  AlertTriangle,
  Compass,
  UserCheck,
  Globe,
  Eye
} from 'lucide-react';

// Modular Components
import { FederationDashboards } from './components/dashboard/FederationDashboards';
import { LiveScoringEngine } from './components/scoring/LiveScoringEngine';
import { TVBroadcastScoreboard } from './components/scoring/TVBroadcastScoreboard';
import { TournamentList } from './components/tournaments/TournamentList';
import { InteractiveBracket } from './components/tournaments/InteractiveBracket';
import { RankingLeaderboard } from './components/rankings/RankingLeaderboard';
import { PlayerRegistrationModal } from './components/registration/PlayerRegistrationModal';
import { PDFReportGenerator } from './components/reports/PDFReportGenerator';
import { OfflineTournamentHub } from './components/offline/OfflineTournamentHub';
import { PostgresSchemaViewer } from './components/schema/PostgresSchemaViewer';
import { Icestock3DViewer } from './components/3d/Icestock3DViewer';
import { SuperAdminControlCenter } from './components/admin/SuperAdminControlCenter';
import { RinkRefereeStation } from './components/referees/RinkRefereeStation';
import { PublicScoringHub } from './components/public/PublicScoringHub';

// Auth & Security Components
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { SessionLockScreen } from './components/auth/SessionLockScreen';
import { SecurityCenterModal } from './components/auth/SecurityCenterModal';
import { FreeDeploymentGuideModal } from './components/deployment/FreeDeploymentGuideModal';

type NavTab = 
  | 'PUBLIC_HOME' 
  | 'DASHBOARD' 
  | 'SUPER_ADMIN' 
  | 'RINKS_REFEREES' 
  | 'LIVE_SCORING' 
  | 'TOURNAMENTS' 
  | 'RANKINGS' 
  | 'REPORTS' 
  | 'OFFLINE_HUB' 
  | 'SCHEMA' 
  | 'EQUIPMENT_3D';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(authService.getActiveSession());
  const [activeTab, setActiveTab] = useState<NavTab>(session ? 'DASHBOARD' : 'PUBLIC_HOME');
  const [currentRole, setCurrentRole] = useState<UserRole>(session?.role || storage.getCurrentUserRole());
  const [selectedMatchId, setSelectedMatchId] = useState<string>('m-live-01');
  const [selectedTournament, setSelectedTournament] = useState<Tournament>(storage.getTournaments()[0]);
  const [viewingAsPublic, setViewingAsPublic] = useState(false);
  
  // Modals state
  const [isTVBroadcastOpen, setIsTVBroadcastOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserRegisterOpen, setIsUserRegisterOpen] = useState(false);
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = useState(false);
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(storage.isOfflineMode());

  const matches = storage.getMatches();
  const currentMatch = matches.find(m => m.id === selectedMatchId) || matches[0];

  useEffect(() => {
    const unsubSession = authService.subscribe('session_changed', (newSession: AuthSession | null) => {
      setSession(newSession);
      if (newSession) {
        setCurrentRole(newSession.role);
        setViewingAsPublic(false);
        setActiveTab('DASHBOARD');
      } else {
        setActiveTab('PUBLIC_HOME');
      }
    });

    const unsubLocked = authService.subscribe('user_locked', () => {
      setSession(authService.getActiveSession());
    });

    const unsubRole = storage.subscribe('role_changed', (role: UserRole) => setCurrentRole(role));
    const unsubMode = storage.subscribe('offline_mode_changed', (mode: boolean) => setIsOffline(mode));

    return () => {
      unsubSession();
      unsubLocked();
      unsubRole();
      unsubMode();
    };
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    authService.switchRoleQuickly(newRole);
    storage.setCurrentUserRole(newRole);
    setCurrentRole(newRole);
  };

  const handleNavigateToLiveMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setActiveTab('LIVE_SCORING');
  };

  const handleSelectTournament = (tour: Tournament) => {
    setSelectedTournament(tour);
    setActiveTab('TOURNAMENTS');
  };

  const handleLockScreen = () => {
    authService.lockActiveSession();
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout('USER_LOGOUT');
    setIsUserMenuOpen(false);
    setActiveTab('PUBLIC_HOME');
    setIsLoginModalOpen(true);
  };

  const isAuthenticated = !!session;
  const isDisplayingPublicMode = !isAuthenticated || viewingAsPublic;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white font-sans antialiased">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* TOP GLOBAL FEDERATION NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        {/* Brand Logo & Status */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => setActiveTab(isAuthenticated && !viewingAsPublic ? 'DASHBOARD' : 'PUBLIC_HOME')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
              ❄️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                IFI OFFICIAL
              </span>
              {isOffline ? (
                <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                  <WifiOff className="w-3 h-3" />
                  <span>LAN SERVER</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE SCORING STREAM</span>
                </span>
              )}
            </div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>ICESTOCK SPORT</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                GLOBAL TMS
              </span>
            </h1>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2.5">
          {/* FREE DEPLOYMENT & FAST HOSTING GUIDE BUTTON */}
          <button
            onClick={() => setIsDeploymentGuideOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono font-bold shadow-lg shadow-emerald-500/10 transition-all hover:scale-105"
            title="Open Free Deployment Guide & Fast Hosting Steps"
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deploy Free</span>
          </button>

          {/* TV Stadium Broadcast Mode Trigger */}
          <button
            onClick={() => setIsTVBroadcastOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-mono font-bold shadow-lg shadow-amber-500/10 transition-all"
            title="Launch Fullscreen Olympic Stadium Broadcast Scoreboard"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden lg:inline">TV Stadium Feed</span>
          </button>

          {/* Authenticated Controls: Security Center & Super Admin */}
          {isAuthenticated && !viewingAsPublic && (
            <>
              <button
                onClick={() => setIsSecurityCenterOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono font-bold text-slate-200 transition-all"
                title="System Security, 2FA & Audit Log Intelligence"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Security Center</span>
              </button>

              <button
                onClick={() => setActiveTab('SUPER_ADMIN')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeTab === 'SUPER_ADMIN'
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 border border-cyan-400'
                    : 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
                }`}
                title="Open Super Admin Master Settings & Permissions Control Center"
              >
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Master Settings</span>
              </button>

              {/* Multi-Tier Role Switcher */}
              <div className="hidden xl:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <select
                  value={currentRole}
                  onChange={handleRoleChange}
                  className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="SUPER_ADMIN" className="bg-slate-900 text-white">Super Admin (IFI HQ)</option>
                  <option value="COUNTRY_HEAD" className="bg-slate-900 text-white">Country Head (e.g. DESV)</option>
                  <option value="NATIONAL_HEAD" className="bg-slate-900 text-white">National Head</option>
                  <option value="STATE_HEAD" className="bg-slate-900 text-white">State / Region Head</option>
                  <option value="DISTRICT_HEAD" className="bg-slate-900 text-white">District Head</option>
                  <option value="REFEREE" className="bg-slate-900 text-white">Chief Referee (On-Ice)</option>
                  <option value="TEAM_MANAGER" className="bg-slate-900 text-white">Team Manager</option>
                  <option value="PLAYER" className="bg-slate-900 text-white">Accredited Athlete</option>
                </select>
              </div>

              {/* Preview Public Mode toggle */}
              <button
                onClick={() => setViewingAsPublic(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 transition-all"
                title="Preview Fan / Public Scoring Web Platform"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Fan View</span>
              </button>
            </>
          )}

          {/* Toggle back to Official View if in preview mode */}
          {isAuthenticated && viewingAsPublic && (
            <button
              onClick={() => setViewingAsPublic(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Back to Official Portal</span>
            </button>
          )}

          {/* USER PROFILE & AUTH DROPDOWN */}
          {session ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all"
              >
                <div className="w-7 h-7 rounded-xl overflow-hidden border border-cyan-400">
                  <img src={session.avatar} alt={session.fullName} className="w-full h-full object-cover" />
                </div>
                <div className="hidden xl:block text-left text-xs">
                  <div className="font-bold text-white leading-tight truncate max-w-[100px]">{session.fullName.split(' ')[0]}</div>
                  <div className="text-[9px] text-cyan-400 font-mono leading-tight">{session.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 flex flex-col gap-2 font-mono text-xs animate-in fade-in">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="font-bold text-white">{session.fullName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{session.email}</div>
                    <div className="text-[9px] text-cyan-400 font-bold mt-1">Lic: {session.federationLicenseId}</div>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px]">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsSecurityCenterOpen(true);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Security & 2FA Settings</span>
                    </button>

                    <button
                      onClick={handleLockScreen}
                      className="flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Lock Screen (Inactivity)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-blue-400" />
                      <span>Switch / Sign In Account</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 p-2 rounded-xl text-red-400 hover:bg-red-950/60 transition-colors text-left border-t border-slate-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUserRegisterOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Accreditation</span>
              </button>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Official Sign In</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* HORIZONTAL APP SUB-NAVIGATION BAR */}
      <nav className="bg-slate-950/90 border-b border-slate-800/80 px-4 md:px-8 py-2 overflow-x-auto select-none">
        <div className="flex items-center gap-2 min-w-max">
          {/* If Logged in (and not viewing as public), show official management tabs */}
          {isAuthenticated && !viewingAsPublic ? (
            [
              { id: 'DASHBOARD', label: 'Command Center', icon: Activity },
              { id: 'SUPER_ADMIN', label: 'Super Admin Master HQ', icon: Shield, isSuperOnly: true },
              { id: 'RINKS_REFEREES', label: 'Rinks & Referees Station', icon: Compass, badge: 'OFFICIAL' },
              { id: 'LIVE_SCORING', label: 'Live Rink Scoring & 3D Ice', icon: Radio, badge: 'LIVE' },
              { id: 'TOURNAMENTS', label: 'Tournaments & Brackets', icon: Trophy },
              { id: 'RANKINGS', label: 'Rankings & 3D Podium', icon: Award },
              { id: 'EQUIPMENT_3D', label: '3D Stock Configurator', icon: Box },
              { id: 'REPORTS', label: 'Accreditation & PDF Docs', icon: FileText },
              { id: 'OFFLINE_HUB', label: 'Offline Rink Server', icon: Wifi },
              { id: 'SCHEMA', label: 'PostgreSQL 16 DDL', icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as NavTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                  {tab.isSuperOnly && (
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-700 rounded">
                      HQ
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            // Public / Fan Web Platform Navigation Tabs
            [
              { id: 'PUBLIC_HOME', label: 'Live Scoring Center', icon: Radio, badge: 'LIVE' },
              { id: 'TOURNAMENTS', label: 'Championship Brackets', icon: Trophy },
              { id: 'RANKINGS', label: 'World Rankings & Standings', icon: Award },
              { id: 'EQUIPMENT_3D', label: '3D Equipment & Rules', icon: Box },
              { id: 'REPORTS', label: 'Official Documents & Badges', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as NavTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </nav>

      {/* MAIN VIEW CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* PUBLIC SCORING WEB PLATFORM HUB */}
        {activeTab === 'PUBLIC_HOME' && (
          <PublicScoringHub
            onOpenTvMode={(m) => {
              setSelectedMatchId(m.id);
              setIsTVBroadcastOpen(true);
            }}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenRegister={() => setIsUserRegisterOpen(true)}
          />
        )}

        {/* 0. SUPER ADMIN MASTER CONTROL CENTER */}
        {activeTab === 'SUPER_ADMIN' && (
          <SuperAdminControlCenter
            onNavigateToMatch={handleNavigateToLiveMatch}
            onNavigateToTournament={handleSelectTournament}
          />
        )}

        {/* 1. COMMAND DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <FederationDashboards
            currentRole={currentRole}
            onNavigateToLiveMatch={handleNavigateToLiveMatch}
            onNavigateToTournament={handleSelectTournament}
            onOpenSuperAdmin={() => setActiveTab('SUPER_ADMIN')}
          />
        )}

        {/* 2. RINK-WISE REFEREE ASSIGNMENTS & ON-RINK MATCH MONITOR */}
        {activeTab === 'RINKS_REFEREES' && (
          <RinkRefereeStation
            onNavigateToMatch={handleNavigateToLiveMatch}
            onNavigateToTournament={handleSelectTournament}
            currentRole={currentRole}
          />
        )}

        {/* 3. LIVE REFEREE SCORING & 3D ICE RINK CANVAS */}
        {activeTab === 'LIVE_SCORING' && (
          <LiveScoringEngine
            initialMatchId={selectedMatchId}
            onLaunchTVMode={() => setIsTVBroadcastOpen(true)}
            onNavigateToRinks={() => setActiveTab('RINKS_REFEREES')}
          />
        )}

        {/* 3. TOURNAMENTS & ELIMINATION BRACKETS */}
        {activeTab === 'TOURNAMENTS' && (
          <div className="flex flex-col gap-8">
            <InteractiveBracket
              tournament={selectedTournament}
              onSelectMatch={handleNavigateToLiveMatch}
            />
            <TournamentList onSelectTournament={handleSelectTournament} />
          </div>
        )}

        {/* 4. WORLD & NATIONAL RANKINGS + 3D PODIUM */}
        {activeTab === 'RANKINGS' && <RankingLeaderboard />}

        {/* 5. 3D EQUIPMENT CONFIGURATOR */}
        {activeTab === 'EQUIPMENT_3D' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Icestock3DViewer />
            </div>
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Official Equipment Homologation Rules
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Under IFI International Rules of the Game (IEPO Chapter 3):
              </p>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Stock Weight: 3.70 kg to 3.90 kg</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Disc Diameter: 243 mm ± 2 mm</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Handle Length: Max 240 mm Carbon/Wood</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Plates: Shore D hardness verified</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* 6. ACCREDITATION & PDF REPORTS */}
        {activeTab === 'REPORTS' && <PDFReportGenerator />}

        {/* 7. OFFLINE LAN RINK HUB */}
        {activeTab === 'OFFLINE_HUB' && <OfflineTournamentHub />}

        {/* 8. POSTGRESQL 16 ENTERPRISE DDL SCHEMA */}
        {activeTab === 'SCHEMA' && <PostgresSchemaViewer />}
      </main>

      {/* FULLSCREEN TV STADIUM BROADCAST OVERLAY */}
      {isTVBroadcastOpen && (
        <TVBroadcastScoreboard
          match={currentMatch}
          onClose={() => setIsTVBroadcastOpen(false)}
        />
      )}

      {/* ATHLETE ACCREDITATION REGISTRATION MODAL */}
      <PlayerRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      {/* LOGIN AUTHENTICATION MODAL */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          setIsLoginModalOpen(false);
          setActiveTab('DASHBOARD');
        }}
        onOpenRegister={() => {
          setIsLoginModalOpen(false);
          setIsUserRegisterOpen(true);
        }}
      />

      {/* USER REGISTRATION MODAL */}
      <RegisterModal
        isOpen={isUserRegisterOpen}
        onClose={() => setIsUserRegisterOpen(false)}
        onSuccess={(user) => {
          setIsUserRegisterOpen(false);
        }}
        onOpenLogin={() => {
          setIsUserRegisterOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* SECURITY & 2FA AUDIT CENTER MODAL */}
      {session && (
        <SecurityCenterModal
          isOpen={isSecurityCenterOpen}
          onClose={() => setIsSecurityCenterOpen(false)}
          session={session}
        />
      )}

      {/* FREE DEPLOYMENT & FAST HOSTING GUIDE MODAL */}
      <FreeDeploymentGuideModal
        isOpen={isDeploymentGuideOpen}
        onClose={() => setIsDeploymentGuideOpen(false)}
      />

      {/* SESSION AUTO / MANUAL SCREEN LOCK OVERLAY */}
      {session && session.isLocked && (
        <SessionLockScreen
          session={session}
          onUnlocked={() => {
            setSession(authService.getActiveSession());
          }}
          onLogout={handleLogout}
        />
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 px-6 py-6 text-center text-xs text-slate-500 font-mono flex flex-wrap items-center justify-between gap-4">
        <div>
          © 2026 International Federation Icestocksport (IFI) • Official Tournament Management System
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button 
            onClick={() => setIsDeploymentGuideOpen(true)}
            className="text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Free Hosting Guide</span>
          </button>
          <span>•</span>
          <button 
            onClick={() => setIsSecurityCenterOpen(true)}
            className="text-cyan-400 hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Health: 98%</span>
          </button>
          <span>•</span>
          <span>Enterprise Edition v4.8</span>
        </div>
      </footer>
    </div>
  );
}

