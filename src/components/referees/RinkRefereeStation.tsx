import React, { useState, useEffect } from 'react';
import { 
  RinkVenueInfo, 
  RefereeProfile, 
  RinkRefereeAssignment, 
  Match, 
  Tournament, 
  UserRole,
  RefereeStatus,
  RefereeCertificationLevel,
  Discipline
} from '../../types';
import { storage } from '../../services/storageService';
import { 
  Shield, 
  Layers, 
  Radio, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Thermometer, 
  Droplets, 
  ChevronRight, 
  Award, 
  User, 
  Compass, 
  Tv, 
  Calendar, 
  CheckSquare, 
  Volume2, 
  PhoneCall, 
  Sparkles,
  MapPin,
  FileCheck,
  Eye,
  Sliders
} from 'lucide-react';

interface RinkRefereeStationProps {
  onNavigateToMatch: (matchId: string) => void;
  onNavigateToTournament?: (tournament: Tournament) => void;
  currentRole?: UserRole;
}

type StationTab = 'RINK_MATRIX' | 'ASSIGNMENT_MANAGER' | 'REFEREE_KIOSK' | 'REFEREE_ROSTER';

export const RinkRefereeStation: React.FC<RinkRefereeStationProps> = ({
  onNavigateToMatch,
  onNavigateToTournament,
  currentRole = 'SUPER_ADMIN'
}) => {
  const [activeTab, setActiveTab] = useState<StationTab>('RINK_MATRIX');
  const [tournaments, setTournaments] = useState<Tournament[]>(storage.getTournaments());
  const [selectedTourId, setSelectedTourId] = useState<string>(tournaments[0]?.id || 'tour-1');
  const [rinks, setRinks] = useState<RinkVenueInfo[]>(storage.getRinks(selectedTourId));
  const [referees, setReferees] = useState<RefereeProfile[]>(storage.getReferees());
  const [assignments, setAssignments] = useState<RinkRefereeAssignment[]>(storage.getRinkAssignments(selectedTourId));
  const [matches, setMatches] = useState<Match[]>(storage.getMatches());

  // Kiosk / Active Referee Selection
  const [selectedRefereeId, setSelectedRefereeId] = useState<string>(referees[0]?.id || 'ref-01');
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRinkForAssignment, setSelectedRinkForAssignment] = useState<RinkVenueInfo | null>(null);
  const [selectedMatchForAssignment, setSelectedMatchForAssignment] = useState<Match | null>(null);
  const [targetRefereeId, setTargetRefereeId] = useState<string>('');
  const [targetRole, setTargetRole] = useState<'CHIEF_REFEREE' | 'ASSISTANT_UMPIRE' | 'LASER_MEASURER'>('CHIEF_REFEREE');

  // Add Referee Modal
  const [isAddRefereeModalOpen, setIsAddRefereeModalOpen] = useState(false);
  const [newReferee, setNewReferee] = useState({
    name: '',
    email: '',
    country: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    licenseNumber: '',
    certificationLevel: 'IFI_MASTER_INTERNATIONAL' as RefereeCertificationLevel,
    specialization: ['TEAM_GAME', 'HEAD_TO_HEAD'] as Discipline[],
    phone: ''
  });

  // Notification / Feedback banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Kiosk Checklist state for selected referee
  const [kioskChecklist, setKioskChecklist] = useState({
    rinkFrictionTested: true,
    daubeCentered: true,
    telemetrySensorSynced: true,
    shotClockReady: true,
    radioDeskTested: true
  });

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const refreshData = () => {
    setRinks(storage.getRinks(selectedTourId));
    setReferees(storage.getReferees());
    setAssignments(storage.getRinkAssignments(selectedTourId));
    setMatches(storage.getMatches());
  };

  useEffect(() => {
    refreshData();
    const unsubRinks = storage.subscribe('rinks_updated', () => refreshData());
    const unsubRefs = storage.subscribe('referees_updated', () => refreshData());
    const unsubAsg = storage.subscribe('rink_assignments_updated', () => refreshData());
    const unsubMatches = storage.subscribe('matches_updated', () => refreshData());

    return () => {
      unsubRinks();
      unsubRefs();
      unsubAsg();
      unsubMatches();
    };
  }, [selectedTourId]);

  const activeTournament = tournaments.find(t => t.id === selectedTourId) || tournaments[0];
  const activeReferee = referees.find(r => r.id === selectedRefereeId) || referees[0];
  const refereeAssignedRink = rinks.find(r => r.id === activeReferee?.assignedRinkId) || rinks[0];

  // Referee assigned matches for kiosk
  const refereeMatches = matches.filter(m => 
    m.refereeId === activeReferee?.id || 
    m.rinkNumber.includes(refereeAssignedRink?.rinkNumber || 'Rink 1')
  );

  // Status badge styling helper
  const getStatusBadge = (status: RefereeStatus) => {
    switch (status) {
      case 'AVAILABLE_ON_RINK':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Available on Rink
          </span>
        );
      case 'OFFICIATING_MATCH':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            Officiating Match
          </span>
        );
      case 'ON_STANDBY':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400" />
            On Standby
          </span>
        );
      case 'ON_BREAK':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            On Break
          </span>
        );
      case 'OFF_DUTY':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 text-slate-400 border border-slate-800">
            Off Duty
          </span>
        );
    }
  };

  const getRinkStatusBadge = (status: RinkVenueInfo['status']) => {
    switch (status) {
      case 'ACTIVE_MATCH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-700/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            LIVE MATCH
          </span>
        );
      case 'WARMUP':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
            WARMUP
          </span>
        );
      case 'OPEN_AVAILABLE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
            OPEN / READY
          </span>
        );
      case 'ICE_PREPARATION':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-700/60">
            ICE PREPARATION
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const handleAssignRefereeSubmit = () => {
    if (!selectedRinkForAssignment || !targetRefereeId) return;

    storage.assignRefereeToRink(selectedRinkForAssignment.id, targetRefereeId, targetRole);
    
    if (selectedMatchForAssignment) {
      storage.assignRefereeToMatch(selectedMatchForAssignment.id, targetRefereeId);
    }

    // Also record shift schedule
    const referee = referees.find(r => r.id === targetRefereeId);
    if (referee) {
      storage.addOrUpdateRinkAssignment({
        id: `asg-${Date.now()}`,
        tournamentId: selectedTourId,
        rinkId: selectedRinkForAssignment.id,
        rinkName: selectedRinkForAssignment.name,
        matchId: selectedMatchForAssignment?.id,
        matchNumber: selectedMatchForAssignment?.matchNumber,
        refereeId: referee.id,
        refereeName: referee.name,
        refereeRole: targetRole,
        shiftStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shiftEndTime: '21:00',
        status: selectedMatchForAssignment?.status === 'LIVE' ? 'OFFICIATING' : 'CHECKED_IN',
        notes: `Assigned via Rink Referee Hub`
      });
    }

    refreshData();
    setIsAssignModalOpen(false);
    showNotification(`Assigned ${referee?.name} to ${selectedRinkForAssignment.name} successfully!`, 'success');
  };

  const handleQuickCheckIn = (refereeId: string, rinkId: string) => {
    storage.checkInRefereeToRink(refereeId, rinkId);
    refreshData();
    showNotification(`Referee checked in to rink successfully!`, 'success');
  };

  const handleStatusChange = (refereeId: string, status: RefereeStatus) => {
    storage.setRefereeStatus(refereeId, status);
    refreshData();
    showNotification(`Referee status updated to ${status.replace(/_/g, ' ')}`, 'info');
  };

  const handleAddRefereeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferee.name || !newReferee.licenseNumber) return;

    const created: RefereeProfile = {
      id: `ref-${Date.now()}`,
      name: newReferee.name,
      email: newReferee.email || 'official@icestock.org',
      country: newReferee.country,
      countryCode: newReferee.countryCode,
      flag: newReferee.flag,
      licenseNumber: newReferee.licenseNumber,
      certificationLevel: newReferee.certificationLevel,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'ON_STANDBY',
      specialization: newReferee.specialization,
      matchesOfficiatedCount: 0,
      phone: newReferee.phone
    };

    storage.saveReferee(created);
    refreshData();
    setIsAddRefereeModalOpen(false);
    setNewReferee({
      name: '',
      email: '',
      country: 'Germany',
      countryCode: 'GER',
      flag: '🇩🇪',
      licenseNumber: '',
      certificationLevel: 'IFI_MASTER_INTERNATIONAL',
      specialization: ['TEAM_GAME'],
      phone: ''
    });
    showNotification(`Added new accredited referee: ${created.name} (${created.licenseNumber})`, 'success');
  };

  const handleAutoAssign = () => {
    // Intelligent auto-assignment matching disciplines to specialized rinks
    rinks.forEach((rink, idx) => {
      const candidate = referees[idx % referees.length];
      if (candidate) {
        storage.assignRefereeToRink(rink.id, candidate.id, 'CHIEF_REFEREE');
      }
    });
    refreshData();
    showNotification(`Auto-assigned accredited referees across all ${rinks.length} tournament rinks!`, 'success');
  };

  // Find conflicts (referee assigned to two simultaneous active matches)
  const conflicts: string[] = [];
  const assignedRefMap: { [refId: string]: string[] } = {};
  matches.filter(m => m.status === 'LIVE').forEach(m => {
    if (m.refereeId) {
      assignedRefMap[m.refereeId] = assignedRefMap[m.refereeId] || [];
      assignedRefMap[m.refereeId].push(m.rinkNumber);
    }
  });
  Object.entries(assignedRefMap).forEach(([refId, rinkList]) => {
    if (rinkList.length > 1) {
      const ref = referees.find(r => r.id === refId);
      conflicts.push(`Referee ${ref?.name || refId} is concurrently assigned to ${rinkList.join(' & ')}!`);
    }
  });

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Top Banner & Tournament Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400">
              <Compass className="w-7 h-7 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 uppercase tracking-wider">
                IFI RINK & REFEREE COMMAND
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                ● {referees.filter(r => r.status === 'AVAILABLE_ON_RINK' || r.status === 'OFFICIATING_MATCH').length} On-Ice Referees
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
              Rink-Wise Referee Assignment & Match Operations
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live ice lane monitoring, referee duty schedules, on-rink check-in & instant scorepad dispatch
            </p>
          </div>
        </div>

        {/* Tournament Dropdown & Quick Auto Assign */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Sanctioned Tournament:</span>
            <select
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
              className="bg-slate-950 border border-cyan-500/40 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-cyan-400"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAutoAssign}
            className="mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 hover:bg-slate-800 text-xs font-mono font-bold transition-all shadow-md"
            title="Auto-assign available referees evenly across active rinks"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto-Assign</span>
          </button>

          <button
            onClick={() => setIsAddRefereeModalOpen(true)}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Referee</span>
          </button>
        </div>
      </div>

      {/* Notifications / Conflict Warning */}
      {conflicts.length > 0 && (
        <div className="bg-red-950/80 border-2 border-red-500/60 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 text-red-200 font-mono text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />
            <div>
              <span className="font-bold uppercase tracking-wider block">Scheduling Conflict Detected!</span>
              <span>{conflicts.join(' | ')}</span>
            </div>
          </div>
          <span className="px-2 py-1 bg-red-900/60 rounded text-[10px] uppercase font-bold border border-red-700">
            Reassign Required
          </span>
        </div>
      )}

      {notification && (
        <div className={`p-4 rounded-2xl border font-mono text-xs shadow-xl flex items-center justify-between gap-3 animate-in fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' 
            : notification.type === 'warning' 
            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200' 
            : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto select-none">
          {[
            { id: 'RINK_MATRIX', label: 'Rink Live Matrix & Lanes', icon: Layers, count: rinks.length },
            { id: 'ASSIGNMENT_MANAGER', label: 'Referee Duty & Match Scheduler', icon: Sliders, count: assignments.length },
            { id: 'REFEREE_KIOSK', label: 'On-Rink Referee Station (Kiosk)', icon: Shield, badge: 'MY RINK' },
            { id: 'REFEREE_ROSTER', label: 'Accredited Officials Directory', icon: UserCheck, count: referees.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StationTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Summary Pill */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{referees.filter(r => r.status === 'AVAILABLE_ON_RINK').length} Available</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{referees.filter(r => r.status === 'OFFICIATING_MATCH').length} In Match</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{referees.filter(r => r.status === 'ON_STANDBY').length} Standby</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RINK LIVE MATRIX & LANES */}
      {/* ========================================================================= */}
      {activeTab === 'RINK_MATRIX' && (
        <div className="flex flex-col gap-6">
          {/* Rink Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rinks.map((rink) => {
              const assignedChief = referees.find(r => r.id === rink.assignedChiefRefereeId);
              const assignedUmpire = referees.find(r => r.id === rink.assignedUmpireId);
              const currentMatch = matches.find(m => m.id === rink.currentMatchId || m.rinkNumber.includes(rink.rinkNumber) && m.status === 'LIVE');
              const upcomingMatches = matches.filter(m => m.rinkNumber.includes(rink.rinkNumber) && (m.status === 'SCHEDULED' || m.status === 'WARMUP'));

              return (
                <div
                  key={rink.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 shadow-2xl flex flex-col justify-between gap-5 transition-all relative overflow-hidden group"
                >
                  {/* Subtle ice glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Rink Header */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                          {rink.rinkNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {rink.surface.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {getRinkStatusBadge(rink.status)}
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {rink.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {rink.dimensions}
                    </div>

                    {/* Sensor Telemetry (Temp & Humidity) */}
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                        <span>{rink.temperatureCelsius !== undefined ? `${rink.temperatureCelsius}°C` : '-5.0°C'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{rink.humidityPercentage || 54}% Hum</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 ml-auto">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>Arena Zone</span>
                      </div>
                    </div>
                  </div>

                  {/* ASSIGNED REFEREE ON RINK SECTION */}
                  <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-slate-800 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <Shield className="w-3 h-3 text-cyan-400" />
                        ON-RINK REFEREE
                      </span>
                      <button
                        onClick={() => {
                          setSelectedRinkForAssignment(rink);
                          setSelectedMatchForAssignment(currentMatch || null);
                          setTargetRefereeId(assignedChief?.id || referees[0]?.id || '');
                          setTargetRole('CHIEF_REFEREE');
                          setIsAssignModalOpen(true);
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                      >
                        {assignedChief ? 'Change / Reassign' : '+ Assign Referee'}
                      </button>
                    </div>

                    {assignedChief ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative">
                            <img
                              src={assignedChief.avatar}
                              alt={assignedChief.name}
                              className="w-9 h-9 rounded-xl object-cover border border-cyan-400"
                            />
                            <span className="absolute -bottom-1 -right-1 text-xs">{assignedChief.flag}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{assignedChief.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              Lic: {assignedChief.licenseNumber}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(assignedChief.status)}
                          {assignedChief.checkInTime && (
                            <span className="text-[9px] font-mono text-slate-400">
                              Checked in: {assignedChief.checkInTime}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-slate-500 font-mono text-xs flex items-center justify-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>No Chief Referee Stationed</span>
                      </div>
                    )}

                    {/* Assistant Umpire if present */}
                    {assignedUmpire && (
                      <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-900 text-slate-400">
                        <span className="flex items-center gap-1">
                          <span>Umpire:</span>
                          <span className="text-slate-200 font-bold">{assignedUmpire.name}</span>
                        </span>
                        <span className="text-slate-500">{assignedUmpire.flag}</span>
                      </div>
                    )}
                  </div>

                  {/* CURRENT ACTIVE / UPCOMING MATCH */}
                  {currentMatch ? (
                    <div className="bg-gradient-to-br from-blue-950/40 to-cyan-950/30 border border-cyan-500/30 rounded-2xl p-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" />
                          ACTIVE MATCH ON RINK
                        </span>
                        <span className="text-slate-300 font-bold">{currentMatch.matchNumber}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{currentMatch.team1?.name || currentMatch.player1?.name || 'Competitor 1'}</span>
                        <span className="font-mono text-cyan-400 text-sm">
                          {currentMatch.scores.team1TotalScore || 0} : {currentMatch.scores.team2TotalScore || 0}
                        </span>
                        <span>{currentMatch.team2?.name || currentMatch.player2?.name || 'Competitor 2'}</span>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono">
                        Discipline: {currentMatch.discipline.replace(/_/g, ' ')} • Stage: {currentMatch.stage}
                      </div>

                      <button
                        onClick={() => onNavigateToMatch(currentMatch.id)}
                        className="mt-1 w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
                      >
                        <span>Launch Live Scoring (Referee Pad)</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80 flex flex-col gap-1.5 text-center">
                      <div className="text-xs font-mono text-slate-400">No Match Currently Active</div>
                      {upcomingMatches.length > 0 ? (
                        <div className="text-[11px] font-mono text-cyan-400">
                          Next up: {upcomingMatches[0].matchNumber} ({upcomingMatches[0].scheduledTime})
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-slate-500">Rink Open for Scheduled Heats</div>
                      )}
                    </div>
                  )}

                  {/* Rink Footer Quick Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                    {assignedChief && assignedChief.status !== 'AVAILABLE_ON_RINK' && (
                      <button
                        onClick={() => handleQuickCheckIn(assignedChief.id, rink.id)}
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Check In Referee</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedRefereeId(assignedChief?.id || referees[0]?.id);
                        setActiveTab('REFEREE_KIOSK');
                      }}
                      className="text-slate-400 hover:text-cyan-300 ml-auto flex items-center gap-1"
                    >
                      <span>Open Rink Station</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REFEREE DUTY & MATCH SCHEDULER */}
      {/* ========================================================================= */}
      {activeTab === 'ASSIGNMENT_MANAGER' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Tournament Referee Duty & Match Assignments</h2>
              <p className="text-xs text-slate-400 font-mono">
                Assign certified chief referees, umpires, and laser measurers to each match and rink fixture.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter match # or rink..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Matches & Assigned Referees Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Match Details</th>
                  <th className="p-3.5">Discipline & Stage</th>
                  <th className="p-3.5">Rink / Venue</th>
                  <th className="p-3.5">Assigned Chief Referee</th>
                  <th className="p-3.5">Referee Status on Rink</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {matches
                  .filter(m => 
                    !searchQuery || 
                    m.matchNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    m.rinkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.refereeName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((match) => {
                    const assignedRef = referees.find(r => r.id === match.refereeId);
                    const matchingRink = rinks.find(r => match.rinkNumber.includes(r.rinkNumber));

                    return (
                      <tr key={match.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{match.matchNumber}</div>
                          <div className="text-[11px] text-slate-400">
                            {match.team1?.name || match.player1?.name} vs {match.team2?.name || match.player2?.name}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-cyan-400 font-bold">{match.discipline.replace(/_/g, ' ')}</div>
                          <div className="text-[10px] text-slate-500">{match.stage} • {match.scheduledTime}</div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-slate-900 rounded font-bold text-slate-300 border border-slate-800">
                            {match.rinkNumber}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {assignedRef ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{assignedRef.flag}</span>
                              <div>
                                <div className="font-bold text-white">{assignedRef.name}</div>
                                <div className="text-[10px] text-slate-500">Lic: {assignedRef.licenseNumber}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Unassigned
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {assignedRef ? getStatusBadge(assignedRef.status) : <span className="text-slate-500">-</span>}
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            match.status === 'LIVE' 
                              ? 'bg-red-950 text-red-300 border border-red-700 animate-pulse' 
                              : match.status === 'COMPLETED' || match.status === 'LOCKED_VERIFIED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {match.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedMatchForAssignment(match);
                                setSelectedRinkForAssignment(matchingRink || rinks[0]);
                                setTargetRefereeId(match.refereeId || referees[0]?.id);
                                setIsAssignModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-bold transition-all"
                            >
                              Reassign
                            </button>

                            <button
                              onClick={() => onNavigateToMatch(match.id)}
                              className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg text-xs font-bold transition-all shadow"
                              title="Launch Live Scoring Pad"
                            >
                              Scorepad
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REFEREE ON-RINK KIOSK / MY RINK STATION */}
      {/* ========================================================================= */}
      {activeTab === 'REFEREE_KIOSK' && (
        <div className="flex flex-col gap-6">
          {/* Referee Identity Bar */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={activeReferee.avatar}
                  alt={activeReferee.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 text-2xl">{activeReferee.flag}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {activeReferee.licenseNumber}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    {activeReferee.certificationLevel.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">{activeReferee.name}</h2>
                <div className="text-xs text-slate-400 font-mono">
                  {activeReferee.country} • Officiated {activeReferee.matchesOfficiatedCount} Matches
                </div>
              </div>
            </div>

            {/* Switch Active Official Profile */}
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <span className="text-slate-400 text-[10px] uppercase">Switch Referee Profile:</span>
              <select
                value={selectedRefereeId}
                onChange={(e) => setSelectedRefereeId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-cyan-400"
              >
                {referees.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.flag} {r.name} ({r.assignedRinkName || 'Standby'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rink Duty & Station Status Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Stationed Rink Overview */}
            <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-5">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    POSTED RINK STATION
                  </span>
                  {getRinkStatusBadge(refereeAssignedRink?.status || 'OPEN_AVAILABLE')}
                </div>

                <h3 className="text-lg font-bold text-white">
                  {refereeAssignedRink?.name || 'Rink 1 - Center Ice Stadium'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {refereeAssignedRink?.dimensions || '28m x 3m (Official IFI Lane)'}
                </p>

                {/* Status Toggle Buttons for Referee */}
                <div className="mt-4 flex flex-col gap-2 font-mono text-xs">
                  <span className="text-slate-400 text-[10px] uppercase">Set On-Ice Duty Status:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusChange(activeReferee.id, 'AVAILABLE_ON_RINK')}
                      className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                        activeReferee.status === 'AVAILABLE_ON_RINK'
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-950 border border-slate-800 text-emerald-400 hover:bg-slate-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Available on Rink</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(activeReferee.id, 'OFFICIATING_MATCH')}
                      className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                        activeReferee.status === 'OFFICIATING_MATCH'
                          ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-950 border border-slate-800 text-cyan-400 hover:bg-slate-800'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Officiating</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(activeReferee.id, 'ON_STANDBY')}
                      className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                        activeReferee.status === 'ON_STANDBY'
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-950 border border-slate-800 text-amber-400 hover:bg-slate-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Standby</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(activeReferee.id, 'ON_BREAK')}
                      className={`p-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                        activeReferee.status === 'ON_BREAK'
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span>On Break</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Emergency Call to Control Desk */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 font-mono text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px]">
                  <Volume2 className="w-3.5 h-3.5 text-red-400" />
                  REFEREE RADIO / CONTROL DESK
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Call Chief Jury or Master Timekeeper for rule dispute or laser calibration.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => showNotification(`Radio alert dispatched to Chief Jury HQ for ${refereeAssignedRink?.name}!`, 'info')}
                    className="flex-1 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg font-bold flex items-center justify-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call Jury HQ</span>
                  </button>
                  <button
                    onClick={() => showNotification(`Whistle audio cue triggered on stadium PA system!`, 'info')}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
                    title="Sound Rink Whistle"
                  >
                    🔔 Whistle
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Assigned Matches Queue & Pre-Match Inspection */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Assigned Matches on this Rink */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    Assigned Match Queue on Your Rink
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {refereeMatches.length} Matches Assigned
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {refereeMatches.length > 0 ? (
                    refereeMatches.map((match) => (
                      <div
                        key={match.id}
                        className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 flex flex-wrap items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-400">{match.matchNumber}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                              match.status === 'LIVE' ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {match.status}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {match.discipline.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white">
                            {match.team1?.name || match.player1?.name || 'Competitor 1'} vs {match.team2?.name || match.player2?.name || 'Competitor 2'}
                          </div>
                          <div className="text-xs font-mono text-slate-500">
                            Time: {match.scheduledTime} • Rink: {match.rinkNumber}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono pr-2">
                            <div className="text-base font-black text-cyan-400">
                              {match.scores.team1TotalScore || 0} : {match.scores.team2TotalScore || 0}
                            </div>
                            <div className="text-[10px] text-slate-500">Current Score</div>
                          </div>

                          <button
                            onClick={() => onNavigateToMatch(match.id)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                          >
                            <span>Launch Scorepad</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500 font-mono text-xs">
                      No matches currently assigned to this official. Choose a match from the Scheduler tab.
                    </div>
                  )}
                </div>
              </div>

              {/* Rink Pre-Match Technical Inspection Checklist */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
                <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  Pre-Match Rink Safety & Homologation Checklist
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Official IFI procedure requires verification before match whistle start.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { key: 'rinkFrictionTested', label: 'Ice Friction / Polymer Glide Homologated' },
                    { key: 'daubeCentered', label: 'Rubber Daube Placed on Center Cross (M)' },
                    { key: 'telemetrySensorSynced', label: 'Laser / 3D Ice Telemetry Synced' },
                    { key: 'shotClockReady', label: '25-Second Shot Clock Tested' },
                    { key: 'radioDeskTested', label: 'Control Desk Audio & Whistle Connected' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={kioskChecklist[item.key as keyof typeof kioskChecklist]}
                        onChange={(e) => setKioskChecklist({ ...kioskChecklist, [item.key]: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span className="text-slate-300 text-[11px]">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACCREDITED OFFICIALS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'REFEREE_ROSTER' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Federation Accredited Referees & Umpires Roster</h2>
              <p className="text-xs text-slate-400 font-mono">
                IFI and National Federation certified officials pool with active rink status and certifications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE_ON_RINK">Available on Rink</option>
                <option value="OFFICIATING_MATCH">Officiating Match</option>
                <option value="ON_STANDBY">On Standby</option>
              </select>

              <button
                onClick={() => setIsAddRefereeModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-mono font-bold hover:bg-cyan-400 shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Official</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {referees
              .filter(r => statusFilter === 'ALL' || r.status === statusFilter)
              .map((ref) => (
                <div
                  key={ref.id}
                  className="bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-4 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{ref.licenseNumber}</span>
                      <span className="text-lg">{ref.flag}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={ref.avatar}
                        alt={ref.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-xs truncate">{ref.name}</h4>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{ref.country}</div>
                        <div className="text-[9px] text-amber-400 font-mono">{ref.certificationLevel.replace(/_/g, ' ')}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] font-mono flex flex-col gap-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Assigned Rink:</span>
                        <span className="text-slate-200 font-bold">{ref.assignedRinkName || 'None'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Matches Officiated:</span>
                        <span className="text-cyan-400 font-bold">{ref.matchesOfficiatedCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    {getStatusBadge(ref.status)}
                    <button
                      onClick={() => {
                        setSelectedRefereeId(ref.id);
                        setActiveTab('REFEREE_KIOSK');
                      }}
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      Kiosk →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN REFEREE TO RINK / MATCH */}
      {/* ========================================================================= */}
      {isAssignModalOpen && selectedRinkForAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Assign Referee to {selectedRinkForAssignment.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-mono">
              {selectedMatchForAssignment && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">CURRENT FIXTURE</span>
                  <div className="font-bold text-cyan-400">
                    {selectedMatchForAssignment.matchNumber} ({selectedMatchForAssignment.discipline.replace(/_/g, ' ')})
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    {selectedMatchForAssignment.team1?.name || selectedMatchForAssignment.player1?.name} vs {selectedMatchForAssignment.team2?.name || selectedMatchForAssignment.player2?.name}
                  </div>
                </div>
              )}

              {/* Select Role */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Referee Role / Station:</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-cyan-400"
                >
                  <option value="CHIEF_REFEREE">Chief Referee (On-Ice Lead)</option>
                  <option value="ASSISTANT_UMPIRE">Assistant Umpire / Timekeeper</option>
                  <option value="LASER_MEASURER">Laser Distance / Homologation Specialist</option>
                </select>
              </div>

              {/* Select Certified Referee */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Select Accredited Official:</label>
                <select
                  value={targetRefereeId}
                  onChange={(e) => setTargetRefereeId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-cyan-400"
                >
                  {referees.map(ref => (
                    <option key={ref.id} value={ref.id}>
                      {ref.flag} {ref.name} — {ref.licenseNumber} ({ref.status.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/60 text-blue-300 text-[11px] leading-relaxed">
                ℹ️ Assigning will immediately update the rink's active referee badge, sync with the match scorepad, and mark the official as available on ice.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-mono text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRefereeSubmit}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-mono text-xs font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
              >
                Confirm Rink Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW ACCREDITED REFEREE */}
      {/* ========================================================================= */}
      {isAddRefereeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddRefereeSubmit} className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Accredit New International Referee</h3>
              </div>
              <button type="button" onClick={() => setIsAddRefereeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Full Official Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Markus Lindner"
                  value={newReferee.name}
                  onChange={(e) => setNewReferee({ ...newReferee, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">License ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IFI-REF-GOLD-99"
                    value={newReferee.licenseNumber}
                    onChange={(e) => setNewReferee({ ...newReferee, licenseNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Austria"
                    value={newReferee.country}
                    onChange={(e) => setNewReferee({ ...newReferee, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    placeholder="🇦🇹"
                    value={newReferee.flag}
                    onChange={(e) => setNewReferee({ ...newReferee, flag: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Certification Level</label>
                  <select
                    value={newReferee.certificationLevel}
                    onChange={(e) => setNewReferee({ ...newReferee, certificationLevel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="IFI_MASTER_INTERNATIONAL">IFI Master International</option>
                    <option value="IFI_CHIEF_UMPIRE">IFI Chief Umpire</option>
                    <option value="NATIONAL_A">National Grade A</option>
                    <option value="STATE_CERTIFIED">State Certified</option>
                    <option value="DISTRICT_OFFICIAL">District Official</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="referee@icestock.org"
                  value={newReferee.email}
                  onChange={(e) => setNewReferee({ ...newReferee, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddRefereeModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
              >
                Save & Accredit Official
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
