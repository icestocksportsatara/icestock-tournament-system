export type Discipline = 
  | 'TEAM_GAME' 
  | 'TEAM_TARGET' 
  | 'TEAM_DISTANCE' 
  | 'INDIVIDUAL_TARGET' 
  | 'INDIVIDUAL_DISTANCE' 
  | 'HEAD_TO_HEAD';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'COUNTRY_HEAD' 
  | 'NATIONAL_HEAD' 
  | 'STATE_HEAD' 
  | 'DISTRICT_HEAD' 
  | 'REFEREE' 
  | 'TEAM_MANAGER' 
  | 'PLAYER';

export type TournamentTier = 
  | 'INTERNATIONAL' 
  | 'CONTINENTAL' 
  | 'NATIONAL' 
  | 'STATE' 
  | 'DISTRICT' 
  | 'CLUB';

export type TournamentStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export type GenderCategory = 
  | 'MEN' 
  | 'WOMEN' 
  | 'MIXED' 
  | 'JUNIORS_U23'
  | 'JUNIORS_U19' 
  | 'JUNIORS_U16' 
  | 'YOUTH_U16'
  | 'SENIORS' 
  | 'VETERANS';

export type SurfaceType = 'ICE' | 'SYNTHETIC_ICE' | 'ASPHALT_SUMMER' | 'INDOOR_POLYMER';

export interface Player {
  id: string;
  playerId: string; // e.g. IFI-GER-2026-081
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  state?: string;
  district?: string;
  club: string;
  gender: GenderCategory;
  dateOfBirth: string;
  email: string;
  rankingPoints: number;
  worldRank: number;
  nationalRank: number;
  disciplines: Discipline[];
  profileImage: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  medicalCertificateExpiry: string;
  passportNumber?: string;
  aadhaarNumber?: string;
  roleInTeam?: 'PLAYMAKER' | 'OFFENSIVE' | 'ALL_ROUNDER';
  stockSpecs: {
    bodyColor: string;
    discWeight: number; // in kg e.g. 4.0 - 5.5 kg
    handleType: string; // e.g. High / Low curved
    plateType: string; // Type M (Medium), Type L (Light), Type S (Super Slow)
  };
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    goldMedals: number;
    silverMedals: number;
    bronzeMedals: number;
    bestTargetScore: number;
    bestDistanceMeters: number;
    targetAccuracyPercentage: number;
  };
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  flag: string;
  state?: string;
  club: string;
  category: GenderCategory;
  logo: string;
  rankingPoints: number;
  worldRank: number;
  managerName: string;
  coachName: string;
  playerIds: string[];
  players?: Player[];
  tactic?: {
    playmaker?: string;
    offensive1?: string;
    offensive2?: string;
    allRounder?: string;
  };
  stats: {
    played: number;
    won: number;
    lost: number;
    tie: number;
    titles: number;
  };
}

export interface StockPosition {
  id: string;
  teamId: string;
  teamName: string;
  color: string;
  x: number; // mm from center (-1500 to +1500)
  y: number; // mm from center
  scorePoints: number;
  isDaube?: boolean;
}

export interface GameEnd {
  endNumber: number;
  team1Score: number;
  team2Score: number;
  daubePosition: { x: number; y: number };
  stockPositions: StockPosition[];
  notes?: string;
  durationSeconds: number;
}

export interface TargetAttempt {
  roundNumber?: number; // 1 | 2 | 3 | 4 (4 official rounds)
  attemptNumber: number; // 1-6 within round (or 1-24 overall)
  targetType: 'CENTER_RINGS' | 'CLEARANCE' | 'CORNER_RINGS' | 'COMBINE' | 'CENTER_TARGET' | 'ANGULAR_CLEARANCE' | 'COMBO_RING';
  points: number; // e.g. Round 1: 0,2,4,6,8,10; Round 2: 10,5,2,0; Round 3: 0,2,4,6,8,10; Round 4: 0,2,4,6,8,10
  timeSeconds: number;
  refereeConfirmed: boolean;
  isDone?: boolean;
}

export interface DistanceAttempt {
  attemptNumber: number; // 1 to 5 attempts per athlete
  distanceMeters: number;
  isValid: boolean;
  windSpeedKmh: number;
  iceTempCelsius: number;
  speedKmh: number;
  isDone?: boolean;
}

export interface PlayerTargetScore {
  playerId: string;
  playerName: string;
  playerNumber?: number; // 1, 2, 3, 4
  role?: string;
  club?: string;
  isDone?: boolean;
  attempts: TargetAttempt[];
  totalPoints: number;
}

export interface PlayerDistanceScore {
  playerId: string;
  playerName: string;
  playerNumber?: number; // 1, 2, 3, 4
  club?: string;
  isDone?: boolean;
  attempts: DistanceAttempt[];
  bestDistance: number;
}

export interface MatchScoreData {
  // For VERSUS (VS) EVENTS: TEAM_GAME & HEAD_TO_HEAD (6 ends per match, 1-4 pts per end, 2 pts Win / 1 pt Draw)
  scoringSystem?: 'IISF_STANDARD_1PT' | 'IFI_INTERNATIONAL_3PT';
  ends?: GameEnd[];
  currentEnd?: number;
  team1TotalScore?: number;
  team2TotalScore?: number;
  team1GamePoints?: number; // 2 for Win, 1 for Draw, 0 for Loss
  team2GamePoints?: number;
  
  // For ONE-BY-ONE INDIVIDUAL TARGET (4 rounds x 6 attempts = 24 attempts, max 60 pts/round, total 240 pts)
  player1TargetAttempts?: TargetAttempt[];
  player2TargetAttempts?: TargetAttempt[];
  player1TargetDone?: boolean;
  player2TargetDone?: boolean;
  targetRoundsTotal?: { [playerId: string]: { r1: number; r2: number; r3: number; r4: number; total: number } };
  
  // For ONE-BY-ONE TEAM TARGET (4 players per team, scored one by one with Done progression)
  team1TargetPlayers?: PlayerTargetScore[];
  team2TargetPlayers?: PlayerTargetScore[];
  
  // For ONE-BY-ONE INDIVIDUAL DISTANCE (5 attempts per athlete, longest valid throw counts)
  distanceAttempts?: { [playerIdOrTeamId: string]: DistanceAttempt[] };
  bestDistance?: { [playerIdOrTeamId: string]: number };
  player1DistanceDone?: boolean;
  player2DistanceDone?: boolean;
  
  // For ONE-BY-ONE TEAM DISTANCE (4 athletes per team, scored one by one with Done progression)
  team1DistancePlayers?: PlayerDistanceScore[];
  team2DistancePlayers?: PlayerDistanceScore[];
}

export interface Match {
  id: string;
  matchNumber: string;
  tournamentId: string;
  discipline: Discipline;
  stage: 'GROUP_STAGE' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'BRONZE_MATCH' | 'FINAL';
  rinkNumber: string; // e.g. Rink 1 / Center Ice
  scheduledTime: string;
  status: 'SCHEDULED' | 'WARMUP' | 'LIVE' | 'COMPLETED' | 'LOCKED_VERIFIED' | 'POSTPONED';
  
  team1?: Team;
  team2?: Team;
  team1Id?: string;
  team2Id?: string;
  
  player1?: Player;
  player2?: Player;
  player1Id?: string;
  player2Id?: string;
  
  winnerId?: string;
  
  refereeId: string;
  refereeName: string;
  umpireName?: string;
  
  scores: MatchScoreData;
  
  timer: {
    totalSeconds: number;
    currentSeconds: number;
    isRunning: boolean;
    timeoutUsedTeam1: number;
    timeoutUsedTeam2: number;
  };
  
  auditTrail: {
    timestamp: string;
    action: string;
    changedBy: string;
  }[];
}

export interface Tournament {
  id: string;
  name: string;
  code: string;
  tier: TournamentTier;
  discipline: Discipline[];
  category: GenderCategory[];
  surface: SurfaceType;
  startDate: string;
  endDate: string;
  location: {
    venue: string;
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  status: TournamentStatus;
  organizer: string;
  sanctionedBy: string; // e.g. IFI (International Federation Icestocksport)
  rinksCount: number;
  totalTeams: number;
  totalPlayers: number;
  totalPrizePool?: string;
  bannerImage: string;
  featured: boolean;
  registrationDeadline: string;
  registeredTeamIds: string[];
  registeredPlayerIds: string[];
}

export interface RankingEntry {
  rank: number;
  prevRank: number;
  id: string;
  name: string;
  teamName?: string;
  country: string;
  countryCode: string;
  flag: string;
  points: number;
  tournamentsPlayed: number;
  gold: number;
  silver: number;
  bronze: number;
  winRate: number;
  category: GenderCategory;
  discipline: Discipline;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  imageUrl: string;
  author: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'PLATINUM' | 'GOLD' | 'OFFICIAL_EQUIPMENT' | 'GLOBAL_BROADCAST';
  logo: string;
  website: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
}

export interface MasterFederationSettings {
  federationName: string;
  shortCode: string;
  headquarters: string;
  officialContactEmail: string;
  activeSeason: string;
  defaultScoringSystem: 'IISF_STANDARD_1PT' | 'IFI_INTERNATIONAL_3PT';
  turnDurationLimitSeconds: number;
  shotClockSeconds: number;
  warmupDurationMinutes: number;
  stockWeightMinKg: number;
  stockWeightMaxKg: number;
  discDiameterMm: number;
  maxHandleLengthMm: number;
  worldRankingPointsGold: number;
  worldRankingPointsSilver: number;
  worldRankingPointsBronze: number;
  autoLockScorecardsAfterMinutes: number;
  allowRefereeScoreOverrides: boolean;
  enableGlobalLiveBroadcast: boolean;
  summerRulesEnabled: boolean;
  laserTelemetryToleranceMm: number;
  targetMaxRounds: number;
  distanceMaxAttempts: number;
}

export type RefereeStatus = 
  | 'AVAILABLE_ON_RINK' 
  | 'OFFICIATING_MATCH' 
  | 'ON_STANDBY' 
  | 'ON_BREAK' 
  | 'OFF_DUTY';

export type RefereeCertificationLevel = 
  | 'IFI_MASTER_INTERNATIONAL' 
  | 'IFI_CHIEF_UMPIRE' 
  | 'NATIONAL_A' 
  | 'STATE_CERTIFIED' 
  | 'DISTRICT_OFFICIAL';

export interface RefereeProfile {
  id: string;
  name: string;
  email: string;
  country: string;
  countryCode: string;
  flag: string;
  licenseNumber: string;
  certificationLevel: RefereeCertificationLevel;
  avatar: string;
  assignedRinkId?: string;
  assignedRinkName?: string;
  status: RefereeStatus;
  specialization: Discipline[];
  matchesOfficiatedCount: number;
  phone?: string;
  currentMatchId?: string;
  checkInTime?: string;
}

export interface RinkVenueInfo {
  id: string;
  tournamentId: string;
  rinkNumber: string;
  name: string;
  surface: SurfaceType;
  dimensions: string;
  status: 'ACTIVE_MATCH' | 'WARMUP' | 'ICE_PREPARATION' | 'OPEN_AVAILABLE' | 'MAINTENANCE';
  temperatureCelsius?: number;
  humidityPercentage?: number;
  currentMatchId?: string;
  assignedChiefRefereeId?: string;
  assignedChiefRefereeName?: string;
  assignedUmpireId?: string;
  assignedUmpireName?: string;
  assignedLaserTechId?: string;
  assignedLaserTechName?: string;
  notes?: string;
}

export interface RinkRefereeAssignment {
  id: string;
  tournamentId: string;
  rinkId: string;
  rinkName: string;
  matchId?: string;
  matchNumber?: string;
  refereeId: string;
  refereeName: string;
  refereeRole: 'CHIEF_REFEREE' | 'ASSISTANT_UMPIRE' | 'LASER_MEASURER' | 'LINE_JUDGE';
  shiftStartTime: string;
  shiftEndTime: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'OFFICIATING' | 'COMPLETED' | 'STANDBY';
  notes?: string;
}

export type PermissionKey =
  | 'canManageTournaments'
  | 'canEditLiveScores'
  | 'canLockRefereeCards'
  | 'canAccreditPlayers'
  | 'canCreateTeams'
  | 'canExportPDF'
  | 'canOverrideMatches'
  | 'canConfigureMasterSettings'
  | 'canManageRules'
  | 'canResetDatabase'
  | 'canDeleteRecords';

export type RolePermissionMap = Record<UserRole, Record<PermissionKey, boolean>>;

export type UserKycStatus = 'NOT_REQUIRED' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED';

export interface UserKycDossier {
  documentType: 'PASSPORT' | 'NATIONAL_ID' | 'AADHAAR' | 'DRIVING_LICENSE' | 'FEDERATION_OFFICIAL_ID';
  documentNumber: string;
  phone: string;
  officialAddress: string;
  federationAffiliation: string;
  jurisdictionLevel?: string;
  documentFileUrl?: string;
  documentFileName?: string;
  appointmentLetterNumber?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
  rejectionReason?: string;
  verificationNotes?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  federationLicenseId: string;
  country: string;
  countryCode: string;
  state?: string;
  district?: string;
  club?: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: string;
  lastLoginAt: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_KYC';
  kycStatus?: UserKycStatus;
  kycDossier?: UserKycDossier;
  passwordHash?: string;
  passwordSalt?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  federationLicenseId: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  isLocked: boolean;
  twoFactorAuthenticated: boolean;
}

export type SecuritySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface SecurityEventLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  eventType: 
    | 'LOGIN_SUCCESS' 
    | 'LOGIN_FAILED' 
    | 'LOGOUT' 
    | '2FA_VERIFIED' 
    | '2FA_FAILED' 
    | 'ACCOUNT_LOCKED' 
    | 'SESSION_LOCKED' 
    | 'SESSION_UNLOCKED' 
    | 'PASSWORD_CHANGED' 
    | 'UNAUTHORIZED_ACCESS_BLOCKED' 
    | 'ROLE_SWITCHED' 
    | 'SECURITY_POLICY_CHANGED'
    | 'BRUTE_FORCE_BLOCKED'
    | 'USER_REGISTERED'
    | 'KYC_SUBMITTED'
    | 'USER_KYC_APPROVED'
    | 'USER_KYC_REJECTED'
    | 'USER_KYC_RESET';
  severity: SecuritySeverity;
  ipAddress: string;
  userAgent: string;
  details: string;
}

export interface SecurityPolicy {
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  sessionInactivityTimeoutMinutes: number;
  require2FAForHighPrivilege: boolean;
  minPasswordLength: number;
  enforceSpecialChars: boolean;
  enforceNumbers: boolean;
  enforceUppercase: boolean;
  autoSessionLockOnInactivity: boolean;
}
