import { 
  Player, 
  Team, 
  Tournament, 
  Match, 
  RankingEntry, 
  AuditLog, 
  UserRole,
  Discipline,
  MasterFederationSettings,
  RolePermissionMap,
  PermissionKey,
  RefereeProfile,
  RinkVenueInfo,
  RinkRefereeAssignment,
  RefereeStatus
} from '../types';
import { 
  MOCK_PLAYERS, 
  MOCK_TEAMS, 
  MOCK_TOURNAMENTS, 
  MOCK_MATCHES, 
  MOCK_RANKINGS, 
  MOCK_AUDIT_LOGS,
  MOCK_REFEREES,
  MOCK_RINKS,
  MOCK_RINK_ASSIGNMENTS
} from '../data/mockData';

const STORAGE_KEYS = {
  PLAYERS: 'icestock_players_v2',
  TEAMS: 'icestock_teams_v2',
  TOURNAMENTS: 'icestock_tournaments_v2',
  MATCHES: 'icestock_matches_v2',
  RANKINGS: 'icestock_rankings_v2',
  AUDIT_LOGS: 'icestock_audit_logs_v1',
  CURRENT_USER_ROLE: 'icestock_current_user_role_v1',
  OFFLINE_QUEUE: 'icestock_offline_queue_v1',
  OFFLINE_MODE_ENABLED: 'icestock_offline_mode_v1',
  MASTER_SETTINGS: 'icestock_master_settings_v1',
  ROLE_PERMISSIONS: 'icestock_role_permissions_v1',
  THEME: 'icestock_theme_v1',
  RINKS: 'icestock_rinks_v2',
  REFEREES: 'icestock_referees_v2',
  RINK_ASSIGNMENTS: 'icestock_rink_assignments_v2'
};

export const DEFAULT_MASTER_SETTINGS: MasterFederationSettings = {
  federationName: 'International Federation Icestocksport (IFI / IISF)',
  shortCode: 'IFI-HQ',
  headquarters: 'Olympic Ice Sport Center, Munich & Salzburg',
  officialContactEmail: 'icestocksportsatara@gmail.com',
  activeSeason: '2026/2027 World Championship Circuit',
  defaultScoringSystem: 'IISF_STANDARD_1PT',
  turnDurationLimitSeconds: 120,
  shotClockSeconds: 25,
  warmupDurationMinutes: 10,
  stockWeightMinKg: 3.70,
  stockWeightMaxKg: 3.90,
  discDiameterMm: 243,
  maxHandleLengthMm: 240,
  worldRankingPointsGold: 1000,
  worldRankingPointsSilver: 700,
  worldRankingPointsBronze: 500,
  autoLockScorecardsAfterMinutes: 30,
  allowRefereeScoreOverrides: true,
  enableGlobalLiveBroadcast: true,
  summerRulesEnabled: true,
  laserTelemetryToleranceMm: 1.0,
  targetMaxRounds: 4,
  distanceMaxAttempts: 5
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMap = {
  SUPER_ADMIN: {
    canManageTournaments: true,
    canEditLiveScores: true,
    canLockRefereeCards: true,
    canAccreditPlayers: true,
    canCreateTeams: true,
    canExportPDF: true,
    canOverrideMatches: true,
    canConfigureMasterSettings: true,
    canManageRules: true,
    canResetDatabase: true,
    canDeleteRecords: true
  },
  COUNTRY_HEAD: {
    canManageTournaments: true,
    canEditLiveScores: true,
    canLockRefereeCards: true,
    canAccreditPlayers: true,
    canCreateTeams: true,
    canExportPDF: true,
    canOverrideMatches: true,
    canConfigureMasterSettings: false,
    canManageRules: false,
    canResetDatabase: false,
    canDeleteRecords: false
  },
  NATIONAL_HEAD: {
    canManageTournaments: true,
    canEditLiveScores: true,
    canLockRefereeCards: true,
    canAccreditPlayers: true,
    canCreateTeams: true,
    canExportPDF: true,
    canOverrideMatches: true,
    canConfigureMasterSettings: false,
    canManageRules: false,
    canResetDatabase: false,
    canDeleteRecords: false
  },
  STATE_HEAD: {
    canManageTournaments: true,
    canEditLiveScores: false,
    canLockRefereeCards: true,
    canAccreditPlayers: true,
    canCreateTeams: true,
    canExportPDF: true,
    canOverrideMatches: false,
    canConfigureMasterSettings: false,
    canManageRules: false,
    canResetDatabase: false,
    canDeleteRecords: false
  },
  DISTRICT_HEAD: {
    canManageTournaments: false,
    canEditLiveScores: false,
    canLockRefereeCards: false,
    canAccreditPlayers: true,
    canCreateTeams: true,
    canExportPDF: true,
    canOverrideMatches: false,
    canConfigureMasterSettings: false,
    canManageRules: false,
    canResetDatabase: false,
    canDeleteRecords: false
  },
  REFEREE: {
    canManageTournaments: false,
    canEditLiveScores: true,
    canLockRefereeCards: true,
    canAccreditPlayers: false,
    canCreateTeams: false,
    canExportPDF: true,
    canOverrideMatches: false,
    canConfigureMasterSettings: false,
    canManageRules: false,
    canResetDatabase: false,
    canDeleteRecords: false
  },
  TEAM_MANAGER: {
    canManageTournaments: false,
    canEditLiveScores: false,
    canLockRefereeCards: false,
    canAccreditPlayers: true,
    canCreateTeams: false,
    canExportPDF: true,
    canOverrideMatches: false,
    canConfigureMasterSettings: false,
    canManageRules: false,
    canResetDatabase: false,
    canDeleteRecords: false
  },
  PLAYER: {
    canManageTournaments: false,
    canEditLiveScores: false,
    canLockRefereeCards: false,
    canAccreditPlayers: false,
    canCreateTeams: false,
    canExportPDF: true,
    canOverrideMatches: false,
    canConfigureMasterSettings: false,
    canManageRules: false,
    canResetDatabase: false,
    canDeleteRecords: false
  }
};

export interface OfflineAction {
  id: string;
  timestamp: string;
  type: 'SCORE_UPDATE' | 'MATCH_STATUS' | 'PLAYER_REGISTER' | 'TOURNAMENT_CREATE';
  payload: any;
  synced: boolean;
}

class StorageService {
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(MOCK_PLAYERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(MOCK_TEAMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(MOCK_TOURNAMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(MOCK_MATCHES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RANKINGS)) {
      localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(MOCK_RANKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(MOCK_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, 'SUPER_ADMIN');
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)) {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MASTER_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.MASTER_SETTINGS, JSON.stringify(DEFAULT_MASTER_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROLE_PERMISSIONS)) {
      localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RINKS)) {
      localStorage.setItem(STORAGE_KEYS.RINKS, JSON.stringify(MOCK_RINKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REFEREES)) {
      localStorage.setItem(STORAGE_KEYS.REFEREES, JSON.stringify(MOCK_REFEREES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RINK_ASSIGNMENTS)) {
      localStorage.setItem(STORAGE_KEYS.RINK_ASSIGNMENTS, JSON.stringify(MOCK_RINK_ASSIGNMENTS));
    }
  }

  // Subscribe to real-time events
  public subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    return () => {
      const arr = this.listeners.get(event) || [];
      this.listeners.set(event, arr.filter(cb => cb !== callback));
    };
  }

  public emit(event: string, data: any) {
    const list = this.listeners.get(event) || [];
    list.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error(`Error in event listener for ${event}:`, e);
      }
    });
  }

  // User Role
  public getCurrentUserRole(): UserRole {
    return (localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE) as UserRole) || 'SUPER_ADMIN';
  }

  public setCurrentUserRole(role: UserRole) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, role);
    this.addAuditLog('ROLE_SWITCH', `Switched active dashboard session to ${role}`);
    this.emit('role_changed', role);
  }

  // Players
  public getPlayers(): Player[] {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return data ? JSON.parse(data) : MOCK_PLAYERS;
  }

  public getPlayerById(id: string): Player | undefined {
    return this.getPlayers().find(p => p.id === id || p.playerId === id);
  }

  public savePlayer(player: Player) {
    const players = this.getPlayers();
    const index = players.findIndex(p => p.id === player.id);
    if (index >= 0) {
      players[index] = player;
    } else {
      players.unshift(player);
    }
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    this.addAuditLog('PLAYER_SAVED', `Updated profile for player ${player.name} (${player.playerId})`);
    this.emit('players_updated', players);
    return player;
  }

  // Teams
  public getTeams(): Team[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return data ? JSON.parse(data) : MOCK_TEAMS;
  }

  public saveTeam(team: Team) {
    const teams = this.getTeams();
    const index = teams.findIndex(t => t.id === team.id);
    if (index >= 0) {
      teams[index] = team;
    } else {
      teams.unshift(team);
    }
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    this.addAuditLog('TEAM_SAVED', `Updated team roster for ${team.name}`);
    this.emit('teams_updated', teams);
    return team;
  }

  // Tournaments
  public getTournaments(): Tournament[] {
    const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
    return data ? JSON.parse(data) : MOCK_TOURNAMENTS;
  }

  public getTournamentById(id: string): Tournament | undefined {
    return this.getTournaments().find(t => t.id === id || t.code === id);
  }

  public saveTournament(tournament: Tournament) {
    const list = this.getTournaments();
    const index = list.findIndex(t => t.id === tournament.id);
    if (index >= 0) {
      list[index] = tournament;
    } else {
      list.unshift(tournament);
    }
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(list));
    this.addAuditLog('TOURNAMENT_SAVED', `Saved tournament ${tournament.name} (${tournament.code})`);
    this.emit('tournaments_updated', list);
    return tournament;
  }

  // Matches & Live Scores
  public getMatches(): Match[] {
    const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return data ? JSON.parse(data) : MOCK_MATCHES;
  }

  public getMatchById(id: string): Match | undefined {
    return this.getMatches().find(m => m.id === id || m.matchNumber === id);
  }

  public saveMatch(match: Match) {
    const list = this.getMatches();
    const index = list.findIndex(m => m.id === match.id);
    if (index >= 0) {
      list[index] = match;
    } else {
      list.unshift(match);
    }
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(list));
    
    // Check if offline
    if (this.isOfflineMode()) {
      this.queueOfflineAction({
        id: 'off-' + Date.now(),
        timestamp: new Date().toISOString(),
        type: 'SCORE_UPDATE',
        payload: match,
        synced: false
      });
    }

    this.emit('matches_updated', list);
    this.emit(`match_${match.id}_updated`, match);
    return match;
  }

  public saveMatches(matches: Match[]) {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    this.emit('matches_updated', matches);
    return matches;
  }

  // Rankings
  public getRankings(discipline?: Discipline, category?: string): RankingEntry[] {
    const data = localStorage.getItem(STORAGE_KEYS.RANKINGS);
    let list: RankingEntry[] = data ? JSON.parse(data) : MOCK_RANKINGS;
    if (discipline) {
      list = list.filter(r => r.discipline === discipline);
    }
    if (category) {
      list = list.filter(r => r.category === category);
    }
    return list.sort((a, b) => b.points - a.points).map((r, idx) => ({ ...r, rank: idx + 1 }));
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : MOCK_AUDIT_LOGS;
  }

  public addAuditLog(action: string, details: string) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: 'usr-active',
      userName: `Session User (${this.getCurrentUserRole()})`,
      userRole: this.getCurrentUserRole(),
      action,
      details,
      ipAddress: '127.0.0.1 (Active Node)'
    };
    logs.unshift(newLog);
    // Keep max 100 logs
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(trimmed));
    this.emit('audit_logs_updated', trimmed);
  }

  // Offline Mode & Queue
  public isOfflineMode(): boolean {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE_ENABLED) === 'true';
  }

  public setOfflineMode(enabled: boolean) {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE_ENABLED, enabled ? 'true' : 'false');
    this.addAuditLog('OFFLINE_MODE_TOGGLE', `Local offline tournament mode set to: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    this.emit('offline_mode_changed', enabled);
  }

  public getOfflineQueue(): OfflineAction[] {
    const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return data ? JSON.parse(data) : [];
  }

  public queueOfflineAction(action: OfflineAction) {
    const queue = this.getOfflineQueue();
    queue.push(action);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    this.emit('offline_queue_updated', queue);
  }

  public syncOfflineQueue(): number {
    const queue = this.getOfflineQueue();
    const count = queue.filter(q => !q.synced).length;
    const updated = queue.map(q => ({ ...q, synced: true }));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(updated));
    this.addAuditLog('OFFLINE_SYNC', `Successfully synchronized ${count} queued scoring records to master cloud database`);
    this.emit('offline_queue_updated', updated);
    return count;
  }

  // Master Settings
  public getMasterSettings(): MasterFederationSettings {
    const data = localStorage.getItem(STORAGE_KEYS.MASTER_SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_MASTER_SETTINGS;
  }

  public saveMasterSettings(settings: Partial<MasterFederationSettings>): MasterFederationSettings {
    const current = this.getMasterSettings();
    const updated: MasterFederationSettings = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.MASTER_SETTINGS, JSON.stringify(updated));
    this.addAuditLog('MASTER_SETTINGS_UPDATED', `Super Admin updated global master configuration for season ${updated.activeSeason}`);
    this.emit('master_settings_updated', updated);
    return updated;
  }

  // Role Permissions
  public getRolePermissions(): RolePermissionMap {
    const data = localStorage.getItem(STORAGE_KEYS.ROLE_PERMISSIONS);
    return data ? JSON.parse(data) : DEFAULT_ROLE_PERMISSIONS;
  }

  public saveRolePermissions(matrix: RolePermissionMap) {
    localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(matrix));
    this.addAuditLog('PERMISSIONS_UPDATED', 'Super Admin updated role permission matrix across all 8 tiers');
    this.emit('role_permissions_updated', matrix);
    return matrix;
  }

  public checkPermission(role: UserRole, permission: PermissionKey): boolean {
    if (role === 'SUPER_ADMIN') return true;
    const perms = this.getRolePermissions();
    return perms[role]?.[permission] ?? false;
  }

  public deleteTournament(id: string): boolean {
    const list = this.getTournaments().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(list));
    this.addAuditLog('TOURNAMENT_DELETED', `Deleted tournament ID ${id}`);
    this.emit('tournaments_updated', list);
    return true;
  }

  public deleteMatch(id: string): boolean {
    const list = this.getMatches().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(list));
    this.addAuditLog('MATCH_DELETED', `Deleted match record ID ${id}`);
    this.emit('matches_updated', list);
    return true;
  }

  public deletePlayer(id: string): boolean {
    const list = this.getPlayers().filter(p => p.id !== id && p.playerId !== id);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(list));
    this.addAuditLog('PLAYER_DELETED', `Deleted player accreditation profile ID ${id}`);
    this.emit('players_updated', list);
    return true;
  }

  public deleteTeam(id: string): boolean {
    const list = this.getTeams().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(list));
    this.addAuditLog('TEAM_DELETED', `Deleted team registry ID ${id}`);
    this.emit('teams_updated', list);
    return true;
  }

  public unlockMatchRefereeLock(matchId: string): Match | undefined {
    const match = this.getMatchById(matchId);
    if (!match) return undefined;
    match.status = 'LIVE';
    match.auditTrail = match.auditTrail || [];
    match.auditTrail.push({
      timestamp: new Date().toISOString(),
      action: 'REFEREE_LOCK_OVERRIDDEN',
      changedBy: `Super Admin (${this.getCurrentUserRole()})`
    });
    this.saveMatch(match);
    this.addAuditLog('MATCH_UNLOCKED', `Super Admin unlocked referee lock for match ${match.matchNumber}`);
    return match;
  }

  public overrideMatchScore(
    matchId: string, 
    newScores: any, 
    reason: string = 'Super Admin manual adjudication'
  ): Match | undefined {
    const match = this.getMatchById(matchId);
    if (!match) return undefined;
    match.scores = { ...match.scores, ...newScores };
    match.auditTrail = match.auditTrail || [];
    match.auditTrail.push({
      timestamp: new Date().toISOString(),
      action: `SCORE_OVERRIDE: ${reason}`,
      changedBy: `Super Admin Override`
    });
    this.saveMatch(match);
    this.addAuditLog('SCORE_OVERRIDE', `Manual score override applied to match ${match.matchNumber}: ${reason}`);
    return match;
  }

  public saveRankings(rankings: RankingEntry[]) {
    localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(rankings));
    this.addAuditLog('RANKINGS_UPDATED', `Updated global leaderboard (${rankings.length} athletes)`);
    this.emit('rankings_updated', rankings);
    return rankings;
  }

  // RINKS & VENUE MANAGEMENT
  public getRinks(tournamentId?: string): RinkVenueInfo[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RINKS);
    const rinks: RinkVenueInfo[] = raw ? JSON.parse(raw) : MOCK_RINKS;
    if (tournamentId) {
      return rinks.filter(r => r.tournamentId === tournamentId);
    }
    return rinks;
  }

  public getRinkById(id: string): RinkVenueInfo | undefined {
    return this.getRinks().find(r => r.id === id);
  }

  public saveRinks(rinks: RinkVenueInfo[]) {
    localStorage.setItem(STORAGE_KEYS.RINKS, JSON.stringify(rinks));
    this.emit('rinks_updated', rinks);
    return rinks;
  }

  public saveRink(rink: RinkVenueInfo) {
    const rinks = this.getRinks();
    const index = rinks.findIndex(r => r.id === rink.id);
    if (index >= 0) {
      rinks[index] = rink;
    } else {
      rinks.push(rink);
    }
    this.saveRinks(rinks);
    this.addAuditLog('RINK_UPDATED', `Updated rink configuration: ${rink.name}`);
    return rink;
  }

  // REFEREES ROSTER & ON-RINK STATUS
  public getReferees(): RefereeProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REFEREES);
    return raw ? JSON.parse(raw) : MOCK_REFEREES;
  }

  public getRefereeById(id: string): RefereeProfile | undefined {
    return this.getReferees().find(ref => ref.id === id);
  }

  public saveReferees(referees: RefereeProfile[]) {
    localStorage.setItem(STORAGE_KEYS.REFEREES, JSON.stringify(referees));
    this.emit('referees_updated', referees);
    return referees;
  }

  public saveReferee(referee: RefereeProfile) {
    const referees = this.getReferees();
    const index = referees.findIndex(r => r.id === referee.id);
    if (index >= 0) {
      referees[index] = referee;
    } else {
      referees.push(referee);
    }
    this.saveReferees(referees);
    this.addAuditLog('REFEREE_UPDATED', `Updated referee profile: ${referee.name} (${referee.licenseNumber})`);
    return referee;
  }

  // RINK-WISE ASSIGNMENT OPERATIONS
  public assignRefereeToRink(
    rinkId: string, 
    refereeId: string, 
    role: 'CHIEF_REFEREE' | 'ASSISTANT_UMPIRE' | 'LASER_MEASURER' = 'CHIEF_REFEREE'
  ) {
    const rinks = this.getRinks();
    const referees = this.getReferees();
    const rink = rinks.find(r => r.id === rinkId);
    const referee = referees.find(r => r.id === refereeId);

    if (!rink || !referee) return;

    if (role === 'CHIEF_REFEREE') {
      rink.assignedChiefRefereeId = referee.id;
      rink.assignedChiefRefereeName = referee.name;
    } else if (role === 'ASSISTANT_UMPIRE') {
      rink.assignedUmpireId = referee.id;
      rink.assignedUmpireName = referee.name;
    } else if (role === 'LASER_MEASURER') {
      rink.assignedLaserTechId = referee.id;
      rink.assignedLaserTechName = referee.name;
    }

    referee.assignedRinkId = rink.id;
    referee.assignedRinkName = rink.name;
    referee.status = 'AVAILABLE_ON_RINK';
    referee.checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Also update any live/scheduled matches on this rink if chief referee is set
    if (role === 'CHIEF_REFEREE') {
      const matches = this.getMatches();
      matches.forEach(m => {
        if (m.rinkNumber.includes(rink.rinkNumber) && m.status !== 'COMPLETED' && m.status !== 'LOCKED_VERIFIED') {
          m.refereeId = referee.id;
          m.refereeName = referee.name;
        }
      });
      this.saveMatches(matches);
    }

    this.saveRinks(rinks);
    this.saveReferees(referees);
    this.addAuditLog('RINK_REFEREE_ASSIGNED', `Assigned ${referee.name} as ${role} to ${rink.name}`);
  }

  public unassignRefereeFromRink(
    rinkId: string, 
    role: 'CHIEF_REFEREE' | 'ASSISTANT_UMPIRE' | 'LASER_MEASURER' = 'CHIEF_REFEREE'
  ) {
    const rinks = this.getRinks();
    const referees = this.getReferees();
    const rink = rinks.find(r => r.id === rinkId);
    if (!rink) return;

    let targetRefId: string | undefined;
    if (role === 'CHIEF_REFEREE') {
      targetRefId = rink.assignedChiefRefereeId;
      rink.assignedChiefRefereeId = undefined;
      rink.assignedChiefRefereeName = undefined;
    } else if (role === 'ASSISTANT_UMPIRE') {
      targetRefId = rink.assignedUmpireId;
      rink.assignedUmpireId = undefined;
      rink.assignedUmpireName = undefined;
    } else if (role === 'LASER_MEASURER') {
      targetRefId = rink.assignedLaserTechId;
      rink.assignedLaserTechId = undefined;
      rink.assignedLaserTechName = undefined;
    }

    if (targetRefId) {
      const ref = referees.find(r => r.id === targetRefId);
      if (ref) {
        ref.assignedRinkId = undefined;
        ref.assignedRinkName = undefined;
        ref.status = 'ON_STANDBY';
      }
    }

    this.saveRinks(rinks);
    this.saveReferees(referees);
    this.addAuditLog('RINK_REFEREE_UNASSIGNED', `Unassigned ${role} from ${rink.name}`);
  }

  public setRefereeStatus(refereeId: string, status: RefereeStatus, rinkId?: string) {
    const referees = this.getReferees();
    const referee = referees.find(r => r.id === refereeId);
    if (!referee) return;

    referee.status = status;
    if (rinkId) {
      const rink = this.getRinkById(rinkId);
      if (rink) {
        referee.assignedRinkId = rink.id;
        referee.assignedRinkName = rink.name;
      }
    }
    this.saveReferees(referees);
    this.addAuditLog('REFEREE_STATUS_CHANGED', `Changed referee ${referee.name} status to ${status}`);
  }

  public checkInRefereeToRink(refereeId: string, rinkId: string) {
    const referees = this.getReferees();
    const rinks = this.getRinks();
    const ref = referees.find(r => r.id === refereeId);
    const rink = rinks.find(r => r.id === rinkId);
    if (!ref || !rink) return;

    ref.assignedRinkId = rink.id;
    ref.assignedRinkName = rink.name;
    ref.status = 'AVAILABLE_ON_RINK';
    ref.checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!rink.assignedChiefRefereeId) {
      rink.assignedChiefRefereeId = ref.id;
      rink.assignedChiefRefereeName = ref.name;
    }

    this.saveReferees(referees);
    this.saveRinks(rinks);
    this.addAuditLog('REFEREE_CHECKED_IN', `${ref.name} checked in at ${rink.name}`);
  }

  // RINK ASSIGNMENTS SCHEDULE
  public getRinkAssignments(tournamentId?: string): RinkRefereeAssignment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RINK_ASSIGNMENTS);
    const list: RinkRefereeAssignment[] = raw ? JSON.parse(raw) : MOCK_RINK_ASSIGNMENTS;
    if (tournamentId) {
      return list.filter(a => a.tournamentId === tournamentId);
    }
    return list;
  }

  public saveRinkAssignments(assignments: RinkRefereeAssignment[]) {
    localStorage.setItem(STORAGE_KEYS.RINK_ASSIGNMENTS, JSON.stringify(assignments));
    this.emit('rink_assignments_updated', assignments);
    return assignments;
  }

  public addOrUpdateRinkAssignment(assignment: RinkRefereeAssignment) {
    const list = this.getRinkAssignments();
    const index = list.findIndex(a => a.id === assignment.id);
    if (index >= 0) {
      list[index] = assignment;
    } else {
      list.push(assignment);
    }
    this.saveRinkAssignments(list);

    // Sync referee profile
    const referees = this.getReferees();
    const ref = referees.find(r => r.id === assignment.refereeId);
    if (ref) {
      ref.assignedRinkId = assignment.rinkId;
      ref.assignedRinkName = assignment.rinkName;
      if (assignment.matchId) ref.currentMatchId = assignment.matchId;
      this.saveReferees(referees);
    }

    this.addAuditLog('RINK_SCHEDULE_ASSIGNED', `Scheduled ${assignment.refereeName} on ${assignment.rinkName}`);
    return assignment;
  }

  public deleteRinkAssignment(id: string) {
    const list = this.getRinkAssignments().filter(a => a.id !== id);
    this.saveRinkAssignments(list);
    this.addAuditLog('RINK_ASSIGNMENT_DELETED', `Deleted assignment ${id}`);
  }

  public assignRefereeToMatch(matchId: string, refereeId: string, umpireName?: string) {
    const matches = this.getMatches();
    const match = matches.find(m => m.id === matchId);
    const referee = this.getRefereeById(refereeId);
    if (!match || !referee) return;

    match.refereeId = referee.id;
    match.refereeName = referee.name;
    if (umpireName) match.umpireName = umpireName;

    referee.currentMatchId = match.id;
    referee.status = match.status === 'LIVE' ? 'OFFICIATING_MATCH' : 'AVAILABLE_ON_RINK';

    this.saveMatch(match);
    this.saveReferee(referee);
    this.addAuditLog('MATCH_REFEREE_ASSIGNED', `Assigned ${referee.name} to Match ${match.matchNumber} on ${match.rinkNumber}`);
  }

  // Export full database JSON dump
  public exportDatabaseJson(): string {
    const dbDump = {
      exportedAt: new Date().toISOString(),
      version: 'IFI-GTS-2026.1',
      masterSettings: this.getMasterSettings(),
      rolePermissions: this.getRolePermissions(),
      players: this.getPlayers(),
      teams: this.getTeams(),
      tournaments: this.getTournaments(),
      matches: this.getMatches(),
      rankings: this.getRankings(),
      rinks: this.getRinks(),
      referees: this.getReferees(),
      rinkAssignments: this.getRinkAssignments(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(dbDump, null, 2);
  }

  public importDatabaseJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.masterSettings) localStorage.setItem(STORAGE_KEYS.MASTER_SETTINGS, JSON.stringify(parsed.masterSettings));
      if (parsed.rolePermissions) localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(parsed.rolePermissions));
      if (parsed.players) localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(parsed.players));
      if (parsed.teams) localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(parsed.teams));
      if (parsed.tournaments) localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(parsed.tournaments));
      if (parsed.matches) localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(parsed.matches));
      if (parsed.rankings) localStorage.setItem(STORAGE_KEYS.RANKINGS, JSON.stringify(parsed.rankings));
      if (parsed.rinks) localStorage.setItem(STORAGE_KEYS.RINKS, JSON.stringify(parsed.rinks));
      if (parsed.referees) localStorage.setItem(STORAGE_KEYS.REFEREES, JSON.stringify(parsed.referees));
      if (parsed.rinkAssignments) localStorage.setItem(STORAGE_KEYS.RINK_ASSIGNMENTS, JSON.stringify(parsed.rinkAssignments));
      this.addAuditLog('DATABASE_IMPORTED', `Imported database package version ${parsed.version || 'unknown'}`);
      this.emit('database_reloaded', true);
      return true;
    } catch (e) {
      console.error('Failed to import database JSON', e);
      return false;
    }
  }

  public resetToFactoryDefaults() {
    localStorage.clear();
    this.initDefaults();
    this.emit('database_reloaded', true);
  }
}

export const storage = new StorageService();
