import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { 
  AuthUser, 
  Tournament, 
  Match, 
  Player, 
  Team, 
  RefereeProfile, 
  RinkVenueInfo, 
  RinkRefereeAssignment, 
  AuditLog, 
  SecurityEventLog,
  MasterFederationSettings,
  UserKycDossier,
  RankingEntry
} from '../../src/types/index.js';

// Initial Master Super Admin Credentials & Seed Users
const MASTER_ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 12);
const MASTER_ADMIN_ID = 'usr-super-admin';

export interface DbScoreAttempt {
  id: string;
  matchId: string;
  roundNumber: number;
  attemptNumber: number;
  participantId: string;
  targetType?: string;
  pointsAwarded: number;
  distanceMeters?: number;
  isValid: boolean;
  stockCoordinateX?: number;
  stockCoordinateY?: number;
  refereeConfirmed: boolean;
  timestamp: string;
}

export interface DbScorecard {
  id: string;
  matchId: string;
  scoringSystem: string;
  state: 'DRAFT' | 'SUBMITTED' | 'CHIEF_REFEREE_REVIEW' | 'VERIFIED' | 'LOCKED';
  rawScoreData: any;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedByRefereeId?: string;
  verifiedByRefereeName?: string;
  lockedAt?: string;
  lockedByAdminId?: string;
  updatedAt: string;
}

export interface DbSession {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  ipAddress: string;
  userAgent: string;
  isRevoked: boolean;
  twoFactorVerified: boolean;
  expiresAt: string;
  createdAt: string;
}

// Initial System Settings
export const DEFAULT_FEDERATION_SETTINGS: MasterFederationSettings = {
  federationName: 'International Federation Icestocksport (IFI)',
  shortCode: 'IFI',
  headquarters: 'Zurich, Switzerland',
  officialContactEmail: 'secretary-general@icestocksport.org',
  activeSeason: '2026/2027 Winter World Championship',
  defaultScoringSystem: 'IISF_STANDARD_1PT',
  turnDurationLimitSeconds: 30,
  shotClockSeconds: 30,
  warmupDurationMinutes: 10,
  stockWeightMinKg: 3.7,
  stockWeightMaxKg: 5.5,
  discDiameterMm: 245,
  maxHandleLengthMm: 300,
  worldRankingPointsGold: 1000,
  worldRankingPointsSilver: 700,
  worldRankingPointsBronze: 500,
  autoLockScorecardsAfterMinutes: 30,
  allowRefereeScoreOverrides: true,
  enableGlobalLiveBroadcast: true,
  summerRulesEnabled: false,
  laserTelemetryToleranceMm: 1.0,
  targetMaxRounds: 4,
  distanceMaxAttempts: 5
};

class DatabaseStore {
  public users: Map<string, AuthUser> = new Map();
  public sessions: Map<string, DbSession> = new Map();
  public tournaments: Map<string, Tournament> = new Map();
  public matches: Map<string, Match> = new Map();
  public scorecards: Map<string, DbScorecard> = new Map();
  public scoreAttempts: Map<string, DbScoreAttempt[]> = new Map(); // matchId -> attempts
  public players: Map<string, Player> = new Map();
  public teams: Map<string, Team> = new Map();
  public referees: Map<string, RefereeProfile> = new Map();
  public rinks: Map<string, RinkVenueInfo> = new Map();
  public rinkAssignments: Map<string, RinkRefereeAssignment> = new Map();
  public auditLogs: AuditLog[] = [];
  public securityLogs: SecurityEventLog[] = [];
  public settings: MasterFederationSettings = { ...DEFAULT_FEDERATION_SETTINGS };
  public recoveryCodeHashes: Map<string, string[]> = new Map(); // userId -> hash array
  public loginAttempts: Map<string, { count: number; lockedUntil?: number }> = new Map();

  constructor() {
    this.seedInitialDatabase();
  }

  private seedInitialDatabase() {
    // 1. Seed Master Super Admin
    const superAdmin: AuthUser = {
      id: MASTER_ADMIN_ID,
      email: 'admin@icestock.org',
      username: 'admin',
      fullName: 'Master Federation Super Admin',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      federationLicenseId: 'IFI-HQ-MASTER-001',
      country: 'International Federation',
      countryCode: 'IFI',
      isVerified: true,
      twoFactorEnabled: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
      status: 'ACTIVE',
      kycStatus: 'NOT_REQUIRED',
      passwordHash: MASTER_ADMIN_PASSWORD_HASH
    };
    this.users.set(superAdmin.id, superAdmin);

    // 2. Seed Official Referees
    const chiefReferee: AuthUser = {
      id: 'usr-ref-01',
      email: 'referee@icestock.org',
      username: 'chiefref',
      fullName: 'Hans-Peter Huber',
      role: 'REFEREE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      federationLicenseId: 'IFI-REF-INT-092',
      country: 'Austria',
      countryCode: 'AUT',
      isVerified: true,
      twoFactorEnabled: false,
      createdAt: '2026-01-10T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      passwordHash: bcrypt.hashSync('referee123', 12)
    };
    this.users.set(chiefReferee.id, chiefReferee);

    const refereeProfile: RefereeProfile = {
      id: 'ref-01',
      name: 'Hans-Peter Huber',
      email: 'referee@icestock.org',
      country: 'Austria',
      countryCode: 'AUT',
      flag: '🇦🇹',
      licenseNumber: 'IFI-REF-INT-092',
      certificationLevel: 'IFI_MASTER_INTERNATIONAL',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'AVAILABLE_ON_RINK',
      specialization: ['TEAM_GAME', 'INDIVIDUAL_TARGET', 'TEAM_DISTANCE'],
      matchesOfficiatedCount: 142,
      phone: '+43 664 1234567'
    };
    this.referees.set(refereeProfile.id, refereeProfile);

    // 3. Seed Players
    const p1: Player = {
      id: 'pl-01',
      playerId: 'IFI-GER-2026-081',
      name: 'Stefan Obermeier',
      country: 'Germany',
      countryCode: 'GER',
      flag: '🇩🇪',
      state: 'Bavaria',
      club: 'EC Passau Neustift',
      gender: 'MEN',
      dateOfBirth: '1994-05-18',
      email: 'stefan.obermeier@icestock.de',
      rankingPoints: 2840,
      worldRank: 1,
      nationalRank: 1,
      disciplines: ['TEAM_GAME', 'INDIVIDUAL_TARGET'],
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      kycStatus: 'VERIFIED',
      medicalCertificateExpiry: '2027-04-30',
      stockSpecs: {
        bodyColor: '#0284c7',
        discWeight: 4.85,
        handleType: 'High curved ergonomic',
        plateType: 'Type M (Medium)'
      },
      stats: {
        matchesPlayed: 84,
        matchesWon: 72,
        goldMedals: 14,
        silverMedals: 6,
        bronzeMedals: 3,
        bestTargetScore: 236,
        bestDistanceMeters: 104.2,
        targetAccuracyPercentage: 92.4
      }
    };
    this.players.set(p1.id, p1);

    const p2: Player = {
      id: 'pl-02',
      playerId: 'IFI-AUT-2026-044',
      name: 'Maximilian Gruber',
      country: 'Austria',
      countryCode: 'AUT',
      flag: '🇦🇹',
      state: 'Styria',
      club: 'EV Rottendorf Seiwald',
      gender: 'MEN',
      dateOfBirth: '1996-11-04',
      email: 'max.gruber@icestock.at',
      rankingPoints: 2680,
      worldRank: 2,
      nationalRank: 1,
      disciplines: ['TEAM_GAME', 'INDIVIDUAL_TARGET'],
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      kycStatus: 'VERIFIED',
      medicalCertificateExpiry: '2027-03-15',
      stockSpecs: {
        bodyColor: '#dc2626',
        discWeight: 4.90,
        handleType: 'Low curved precision',
        plateType: 'Type S (Super Slow)'
      },
      stats: {
        matchesPlayed: 76,
        matchesWon: 61,
        goldMedals: 9,
        silverMedals: 8,
        bronzeMedals: 5,
        bestTargetScore: 232,
        bestDistanceMeters: 98.6,
        targetAccuracyPercentage: 89.8
      }
    };
    this.players.set(p2.id, p2);

    // 4. Seed Teams
    const teamGer: Team = {
      id: 'tm-ger-01',
      name: 'Team Germany National Select',
      shortName: 'GER National',
      country: 'Germany',
      countryCode: 'GER',
      flag: '🇩🇪',
      state: 'Bavaria',
      club: 'DESV World Cup Squad',
      category: 'MEN',
      logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80',
      rankingPoints: 3450,
      worldRank: 1,
      managerName: 'Klaus Wagner',
      coachName: 'Helmut Brandl',
      playerIds: [p1.id],
      stats: { played: 42, won: 37, lost: 4, tie: 1, titles: 8 }
    };
    this.teams.set(teamGer.id, teamGer);

    const teamAut: Team = {
      id: 'tm-aut-01',
      name: 'Team Austria National Team',
      shortName: 'AUT National',
      country: 'Austria',
      countryCode: 'AUT',
      flag: '🇦🇹',
      state: 'Styria',
      club: 'BÖE National Team',
      category: 'MEN',
      logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=80',
      rankingPoints: 3310,
      worldRank: 2,
      managerName: 'Wolfgang Leitner',
      coachName: 'Franz Pichler',
      playerIds: [p2.id],
      stats: { played: 40, won: 33, lost: 6, tie: 1, titles: 6 }
    };
    this.teams.set(teamAut.id, teamAut);

    // 5. Seed Venues & Rinks
    const centerRink: RinkVenueInfo = {
      id: 'rnk-01',
      tournamentId: 'trn-ifi-2026',
      rinkNumber: 'Center Ice Rink',
      name: 'Main Championship Arena A',
      surface: 'ICE',
      dimensions: '30.0m x 4.0m',
      status: 'OPEN_AVAILABLE',
      temperatureCelsius: -4.2,
      humidityPercentage: 48,
      assignedChiefRefereeId: refereeProfile.id,
      assignedChiefRefereeName: refereeProfile.name
    };
    this.rinks.set(centerRink.id, centerRink);

    // 6. Seed Tournament
    const tournament: Tournament = {
      id: 'trn-ifi-2026',
      name: 'IFI World Icestock Sport Championship 2026',
      code: 'IFI-WCH-2026',
      tier: 'INTERNATIONAL',
      discipline: ['TEAM_GAME', 'INDIVIDUAL_TARGET', 'TEAM_DISTANCE', 'INDIVIDUAL_DISTANCE'],
      category: ['MEN', 'WOMEN', 'JUNIORS_U23'],
      surface: 'ICE',
      startDate: '2026-03-10',
      endDate: '2026-03-18',
      location: {
        venue: 'Innsbruck OlympiaWorld Ice Arena',
        city: 'Innsbruck',
        country: 'Austria',
        coordinates: [47.2577, 11.4086]
      },
      status: 'LIVE',
      organizer: 'International Federation Icestocksport (IFI)',
      sanctionedBy: 'IFI Official World Sanction Body',
      rinksCount: 6,
      totalTeams: 24,
      totalPlayers: 144,
      totalPrizePool: '€75,000 EUR',
      bannerImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&auto=format&fit=crop&q=80',
      featured: true,
      registrationDeadline: '2026-02-28',
      registeredTeamIds: [teamGer.id, teamAut.id],
      registeredPlayerIds: [p1.id, p2.id]
    };
    this.tournaments.set(tournament.id, tournament);

    // 7. Seed Initial Match
    const match1: Match = {
      id: 'm-001',
      matchNumber: 'M-WCH-FINAL-01',
      tournamentId: tournament.id,
      discipline: 'TEAM_GAME',
      stage: 'FINAL',
      rinkNumber: 'Center Ice Rink',
      scheduledTime: '2026-03-18T14:30:00Z',
      status: 'LIVE',
      team1: teamGer,
      team2: teamAut,
      team1Id: teamGer.id,
      team2Id: teamAut.id,
      refereeId: refereeProfile.id,
      refereeName: refereeProfile.name,
      umpireName: 'Karl Heinz Meyer',
      scores: {
        scoringSystem: 'IISF_STANDARD_1PT',
        currentEnd: 1,
        team1TotalScore: 0,
        team2TotalScore: 0,
        team1GamePoints: 0,
        team2GamePoints: 0,
        ends: [
          {
            endNumber: 1,
            team1Score: 0,
            team2Score: 0,
            daubePosition: { x: 0, y: 0 },
            stockPositions: [],
            durationSeconds: 0
          }
        ]
      },
      timer: {
        totalSeconds: 1800,
        currentSeconds: 1650,
        isRunning: true,
        timeoutUsedTeam1: 0,
        timeoutUsedTeam2: 0
      },
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: 'MATCH_INITIALIZED',
          changedBy: 'System Server Seed'
        }
      ]
    };
    this.matches.set(match1.id, match1);
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return entry;
  }

  public logSecurity(event: Omit<SecurityEventLog, 'id' | 'timestamp'>): SecurityEventLog {
    const entry: SecurityEventLog = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    this.securityLogs.unshift(entry);
    if (this.securityLogs.length > 500) {
      this.securityLogs.pop();
    }
    return entry;
  }
}

export const db = new DatabaseStore();
