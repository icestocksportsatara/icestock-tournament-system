import { 
  AuthUser, 
  AuthSession, 
  UserRole, 
  SecurityEventLog, 
  SecurityPolicy, 
  SecuritySeverity,
  UserKycStatus,
  UserKycDossier 
} from '../types';
import { storage } from './storageService';

const AUTH_STORAGE_KEYS = {
  USERS: 'icestock_auth_users_v2',
  ACTIVE_SESSION: 'icestock_auth_session_v2',
  SECURITY_LOGS: 'icestock_security_logs_v2',
  SECURITY_POLICY: 'icestock_security_policy_v2',
  FAILED_ATTEMPTS: 'icestock_auth_failed_attempts_v2',
  ACTIVE_DEVICES: 'icestock_auth_active_devices_v2'
};

const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 5,
  sessionInactivityTimeoutMinutes: 30,
  require2FAForHighPrivilege: true,
  minPasswordLength: 8,
  enforceSpecialChars: true,
  enforceNumbers: true,
  enforceUppercase: true,
  autoSessionLockOnInactivity: true
};

// Default seed accounts for all 8 Federation Roles + KYC Pending Queue
const SEED_USERS: AuthUser[] = [
  {
    id: 'usr-super-admin',
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
    twoFactorSecret: 'IFI-AUTH-MASTER-2026',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    status: 'ACTIVE',
    kycStatus: 'NOT_REQUIRED'
  },
  {
    id: 'usr-player',
    email: 'player@icestock.org',
    username: 'player',
    fullName: 'Stefan Huber (World No. 1 Target Athlete)',
    role: 'PLAYER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'IFI-GER-2026-081',
    country: 'Germany',
    countryCode: 'GER',
    club: 'EV Rottendorf Seiwald',
    isVerified: true,
    twoFactorEnabled: false,
    createdAt: '2026-02-10T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    status: 'ACTIVE',
    kycStatus: 'NOT_REQUIRED'
  },
  {
    id: 'usr-country-head',
    email: 'countryhead@icestock.org',
    username: 'countryhead',
    fullName: 'Dr. Markus Weber (DESV President)',
    role: 'COUNTRY_HEAD',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'DESV-GER-HQ-09',
    country: 'Germany',
    countryCode: 'GER',
    isVerified: true,
    twoFactorEnabled: true,
    twoFactorSecret: 'DESV-AUTH-2026',
    createdAt: '2026-01-10T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    kycDossier: {
      documentType: 'PASSPORT',
      documentNumber: 'C48910294-GER',
      phone: '+49 89 2180-0',
      officialAddress: 'DESV Headquarters, Olympiapark 1, Munich, Germany',
      federationAffiliation: 'Deutscher Eisstock-Verband e.V. (DESV)',
      jurisdictionLevel: 'National / Country HQ',
      submittedAt: '2026-01-10T00:00:00.000Z',
      reviewedAt: '2026-01-11T10:00:00.000Z',
      reviewedByAdminId: 'usr-super-admin',
      reviewedByAdminName: 'Master Federation Super Admin',
      verificationNotes: 'Verified official DESV Presidential credential against IFI registry.'
    }
  },
  {
    id: 'usr-national-head',
    email: 'nationalhead@icestock.org',
    username: 'nationalhead',
    fullName: 'Elena Rostova (National Director)',
    role: 'NATIONAL_HEAD',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'BÖE-AUT-NAT-44',
    country: 'Austria',
    countryCode: 'AUT',
    isVerified: true,
    twoFactorEnabled: false,
    createdAt: '2026-01-15T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    kycDossier: {
      documentType: 'PASSPORT',
      documentNumber: 'P-AUT-991204',
      phone: '+43 1 7123456',
      officialAddress: 'BÖE Bundesgeschäftsstelle, Prinz-Eugen-Straße, Vienna, Austria',
      federationAffiliation: 'Bund Österreichischer Eisschützen (BÖE)',
      jurisdictionLevel: 'National Federation',
      submittedAt: '2026-01-15T00:00:00.000Z',
      reviewedAt: '2026-01-16T09:30:00.000Z',
      reviewedByAdminId: 'usr-super-admin',
      reviewedByAdminName: 'Master Federation Super Admin',
      verificationNotes: 'Approved Austrian National Directorate credentials.'
    }
  },
  {
    id: 'usr-state-head',
    email: 'statehead@icestock.org',
    username: 'statehead',
    fullName: 'Hans Gruber (Bavaria State Lead)',
    role: 'STATE_HEAD',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'BEV-BAYERN-ST-12',
    country: 'Germany',
    countryCode: 'GER',
    state: 'Bavaria',
    isVerified: true,
    twoFactorEnabled: false,
    createdAt: '2026-01-20T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    kycDossier: {
      documentType: 'NATIONAL_ID',
      documentNumber: 'ID-BAY-8839201',
      phone: '+49 89 543210',
      officialAddress: 'Bayerischer Eissport-Verband e.V., Georg-Brauchle-Ring 93, 80992 München',
      federationAffiliation: 'Bavarian Ice Sports Federation (BEV)',
      jurisdictionLevel: 'State / Regional Association',
      submittedAt: '2026-01-20T00:00:00.000Z',
      reviewedAt: '2026-01-21T11:00:00.000Z',
      reviewedByAdminId: 'usr-super-admin',
      reviewedByAdminName: 'Master Federation Super Admin',
      verificationNotes: 'BEV official presidential certificate verified.'
    }
  },
  {
    id: 'usr-district-head',
    email: 'districthead@icestock.org',
    username: 'districthead',
    fullName: 'Rajesh Shinde (Satara District Secretary)',
    role: 'DISTRICT_HEAD',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'ISFI-IND-MH-02',
    country: 'India',
    countryCode: 'IND',
    state: 'Maharashtra',
    district: 'Satara',
    isVerified: true,
    twoFactorEnabled: false,
    createdAt: '2026-01-25T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    kycDossier: {
      documentType: 'AADHAAR',
      documentNumber: 'XXXX-XXXX-4920',
      phone: '+91 98224 55102',
      officialAddress: 'Satara District Ice Stock Sports Association, Radhika Road, Satara 415002, Maharashtra',
      federationAffiliation: 'Ice Stock Federation of India (ISFI) / Maharashtra Association',
      jurisdictionLevel: 'District Federation Secretariat',
      appointmentLetterNumber: 'ISFI/MH-SAT/2026/04',
      submittedAt: '2026-01-25T00:00:00.000Z',
      reviewedAt: '2026-01-26T14:00:00.000Z',
      reviewedByAdminId: 'usr-super-admin',
      reviewedByAdminName: 'Master Federation Super Admin',
      verificationNotes: 'District appointment letter & ISFI affiliation validated.'
    }
  },
  {
    id: 'usr-referee',
    email: 'referee@icestock.org',
    username: 'referee',
    fullName: 'Franz Hofer (Chief IFI Referee)',
    role: 'REFEREE',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'IFI-REF-GOLD-77',
    country: 'Austria',
    countryCode: 'AUT',
    isVerified: true,
    twoFactorEnabled: true,
    twoFactorSecret: 'REF-AUTH-2026',
    createdAt: '2026-02-01T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    kycDossier: {
      documentType: 'FEDERATION_OFFICIAL_ID',
      documentNumber: 'IFI-GOLD-REF-7729',
      phone: '+43 662 890123',
      officialAddress: 'Schiedsrichterkollegium IFI, Eisarena Salzburg, Austria',
      federationAffiliation: 'International Federation Icestocksport (IFI) Technical Committee',
      jurisdictionLevel: 'International Master Referee',
      appointmentLetterNumber: 'IFI-TC-REF-2026-A1',
      submittedAt: '2026-02-01T00:00:00.000Z',
      reviewedAt: '2026-02-02T10:00:00.000Z',
      reviewedByAdminId: 'usr-super-admin',
      reviewedByAdminName: 'Master Federation Super Admin',
      verificationNotes: 'Chief Referee Gold Homologation Badge Certified.'
    }
  },
  {
    id: 'usr-team-manager',
    email: 'manager@icestock.org',
    username: 'manager',
    fullName: 'Karl Lindner (EC Passau Coach)',
    role: 'TEAM_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'MGR-ECP-01',
    country: 'Germany',
    countryCode: 'GER',
    club: 'EC Passau Neustift',
    isVerified: true,
    twoFactorEnabled: false,
    createdAt: '2026-02-05T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    kycDossier: {
      documentType: 'NATIONAL_ID',
      documentNumber: 'ID-GER-9102830',
      phone: '+49 851 765432',
      officialAddress: 'EC Passau Neustift Club Office, Sportpark Passau, Germany',
      federationAffiliation: 'EC Passau Neustift e.V. / DESV',
      jurisdictionLevel: 'Club Team Manager / Head Coach',
      submittedAt: '2026-02-05T00:00:00.000Z',
      reviewedAt: '2026-02-06T12:00:00.000Z',
      reviewedByAdminId: 'usr-super-admin',
      reviewedByAdminName: 'Master Federation Super Admin',
      verificationNotes: 'Club coaching accreditation confirmed.'
    }
  },
  // PENDING KYC APPLICANTS (Awaiting Super Admin Pass/Approval)
  {
    id: 'usr-pending-referee-1',
    email: 'pichler.referee@icestock-austria.at',
    username: 'matthias_ref',
    fullName: 'Matthias Pichler (Candidate Referee)',
    role: 'REFEREE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'IFI-REF-CAND-2026-88',
    country: 'Austria',
    countryCode: 'AUT',
    state: 'Styria',
    isVerified: false,
    twoFactorEnabled: false,
    createdAt: '2026-08-16T14:30:00.000Z',
    lastLoginAt: '',
    status: 'PENDING_KYC',
    kycStatus: 'PENDING_APPROVAL',
    kycDossier: {
      documentType: 'PASSPORT',
      documentNumber: 'P-AUT-8829104',
      phone: '+43 664 1234567',
      officialAddress: 'Grazer Straße 45, 8010 Graz, Styria, Austria',
      federationAffiliation: 'Bund Österreichischer Eisschützen (BÖE) - Styrian Umpire Board',
      jurisdictionLevel: 'National Level-B Candidate Official',
      appointmentLetterNumber: 'BOE-STY-REF-2026-C8',
      submittedAt: '2026-08-16T14:30:00.000Z',
      verificationNotes: 'Applicant passed the theoretical rules examination. Awaiting Super Admin final review.'
    }
  },
  {
    id: 'usr-pending-district-2',
    email: 'amit.satara@icestocksport.in',
    username: 'amit_satara',
    fullName: 'Amit Kadam (District Executive Secretary)',
    role: 'DISTRICT_HEAD',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'ISFI-IND-MH-08',
    country: 'India',
    countryCode: 'IND',
    state: 'Maharashtra',
    district: 'Satara',
    isVerified: false,
    twoFactorEnabled: false,
    createdAt: '2026-08-17T06:15:00.000Z',
    lastLoginAt: '',
    status: 'PENDING_KYC',
    kycStatus: 'PENDING_APPROVAL',
    kycDossier: {
      documentType: 'AADHAAR',
      documentNumber: 'XXXX-XXXX-9021',
      phone: '+91 98220 12345',
      officialAddress: 'Shivaji Circle, Karad Road, Satara District, Maharashtra 415001',
      federationAffiliation: 'Ice Stock Sports Association of Satara (Affiliated with ISFI)',
      jurisdictionLevel: 'District Executive Authority',
      appointmentLetterNumber: 'ISFI-MH-SAT-APP-2026/08',
      submittedAt: '2026-08-17T06:15:00.000Z',
      verificationNotes: 'Submitted official resolution of Satara executive committee and Aadhaar ID proof.'
    }
  },
  {
    id: 'usr-pending-manager-3',
    email: 'sarah.brenner@icestock-klagenfurt.at',
    username: 'sarah_brenner',
    fullName: 'Sarah Brenner (Head Coach)',
    role: 'TEAM_MANAGER',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    federationLicenseId: 'MGR-KLG-2026-19',
    country: 'Austria',
    countryCode: 'AUT',
    club: 'EV Klagenfurt Ice Masters',
    isVerified: false,
    twoFactorEnabled: false,
    createdAt: '2026-08-17T07:45:00.000Z',
    lastLoginAt: '',
    status: 'PENDING_KYC',
    kycStatus: 'PENDING_APPROVAL',
    kycDossier: {
      documentType: 'DRIVING_LICENSE',
      documentNumber: 'DL-AUT-KLG-55102',
      phone: '+43 463 998877',
      officialAddress: 'Messeplatz 1, 9020 Klagenfurt am Wörthersee, Austria',
      federationAffiliation: 'EV Klagenfurt Ice Masters Club Board',
      jurisdictionLevel: 'Club Coaching Directorate',
      appointmentLetterNumber: 'EVK-HEAD-COACH-2026',
      submittedAt: '2026-08-17T07:45:00.000Z',
      verificationNotes: 'Club board authorization letter submitted for verification.'
    }
  }
];

class AuthService {
  private subscribers: Record<string, Function[]> = {};
  private inactivityTimer: any = null;

  constructor() {
    this.initUsers();
    this.setupInactivityWatcher();
  }

  // Subscribe to auth state updates
  public subscribe(event: 'session_changed' | 'user_locked' | 'security_log_added', cb: Function): () => void {
    if (!this.subscribers[event]) this.subscribers[event] = [];
    this.subscribers[event].push(cb);
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(fn => fn !== cb);
    };
  }

  private emit(event: string, data?: any) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(cb => cb(data));
    }
  }

  // Simple cryptographic hash helper using Web Crypto API SHA-256
  public async hashPassword(password: string, salt: string = 'icestock_salt_2026'): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + salt);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback pseudo-hash for non-crypto environments
      let hash = 0;
      const str = password + salt;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return 'hash_' + Math.abs(hash).toString(16);
    }
  }

  // Generate cryptographically secure Session Token
  private generateSecureSessionToken(): string {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
      return 'ifi_sec_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    return 'ifi_sec_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Initialize Users in storage
  private initUsers() {
    const existingRaw = localStorage.getItem(AUTH_STORAGE_KEYS.USERS);
    if (!existingRaw) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    } else {
      try {
        let list: AuthUser[] = JSON.parse(existingRaw);
        // Ensure there is exactly ONE Master Super Admin with admin credentials
        const adminIndex = list.findIndex(u => u.role === 'SUPER_ADMIN' || u.id === 'usr-super-admin');
        if (adminIndex === -1) {
          list.unshift(SEED_USERS[0]);
        } else {
          list[adminIndex] = {
            ...list[adminIndex],
            email: 'admin@icestock.org',
            username: 'admin',
            role: 'SUPER_ADMIN',
            fullName: 'Master Federation Super Admin',
            status: 'ACTIVE',
            kycStatus: 'NOT_REQUIRED'
          };
        }
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(list));
      } catch {
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
      }
    }
    if (!localStorage.getItem(AUTH_STORAGE_KEYS.SECURITY_POLICY)) {
      localStorage.setItem(AUTH_STORAGE_KEYS.SECURITY_POLICY, JSON.stringify(DEFAULT_SECURITY_POLICY));
    }
    // Auto-login default session as Super Admin if no active session
    if (!sessionStorage.getItem(AUTH_STORAGE_KEYS.ACTIVE_SESSION) && !localStorage.getItem(AUTH_STORAGE_KEYS.ACTIVE_SESSION)) {
      const defaultUser = SEED_USERS[0];
      const initialSession: AuthSession = {
        token: this.generateSecureSessionToken(),
        userId: defaultUser.id,
        email: defaultUser.email,
        fullName: defaultUser.fullName,
        role: defaultUser.role,
        avatar: defaultUser.avatar,
        federationLicenseId: defaultUser.federationLicenseId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.100 (Official Secure Gateway)',
        userAgent: 'IFI TMS Terminal v2026.1 / Chrome (Secured)',
        isLocked: false,
        twoFactorAuthenticated: true
      };
      this.saveSession(initialSession);
    }
  }

  public getUsers(): AuthUser[] {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : SEED_USERS;
  }

  public saveUsers(users: AuthUser[]) {
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public getSecurityPolicy(): SecurityPolicy {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.SECURITY_POLICY);
    return raw ? JSON.parse(raw) : DEFAULT_SECURITY_POLICY;
  }

  public saveSecurityPolicy(policy: Partial<SecurityPolicy>): SecurityPolicy {
    const current = this.getSecurityPolicy();
    const updated = { ...current, ...policy };
    localStorage.setItem(AUTH_STORAGE_KEYS.SECURITY_POLICY, JSON.stringify(updated));
    this.addSecurityLog({
      eventType: 'SECURITY_POLICY_CHANGED',
      severity: 'WARNING',
      details: 'Super Admin updated global system security policies'
    });
    return updated;
  }

  // Active Session Methods
  public getActiveSession(): AuthSession | null {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEYS.ACTIVE_SESSION) || localStorage.getItem(AUTH_STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    try {
      const session: AuthSession = JSON.parse(raw);
      // Check expiration
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.logout('SESSION_EXPIRED');
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public saveSession(session: AuthSession, persistLocal: boolean = true) {
    const str = JSON.stringify(session);
    sessionStorage.setItem(AUTH_STORAGE_KEYS.ACTIVE_SESSION, str);
    if (persistLocal) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACTIVE_SESSION, str);
    }
    // Synchronize storage service current role
    storage.setCurrentUserRole(session.role);
    this.emit('session_changed', session);
  }

  // Brute-force Tracking
  private getFailedAttempts(identifier: string): { count: number; lockedUntil?: string } {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
    const map = raw ? JSON.parse(raw) : {};
    return map[identifier] || { count: 0 };
  }

  private recordFailedAttempt(identifier: string) {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
    const map = raw ? JSON.parse(raw) : {};
    const policy = this.getSecurityPolicy();
    const current = map[identifier] || { count: 0 };
    current.count += 1;

    if (current.count >= policy.maxFailedAttempts) {
      const lockUntil = new Date(Date.now() + policy.lockoutDurationMinutes * 60 * 1000).toISOString();
      current.lockedUntil = lockUntil;
      this.addSecurityLog({
        eventType: 'BRUTE_FORCE_BLOCKED',
        severity: 'CRITICAL',
        details: `Account ${identifier} locked for ${policy.lockoutDurationMinutes} minutes after ${current.count} failed attempts`
      });
    }

    map[identifier] = current;
    localStorage.setItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS, JSON.stringify(map));
  }

  private clearFailedAttempts(identifier: string) {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
    if (raw) {
      const map = JSON.parse(raw);
      delete map[identifier];
      localStorage.setItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS, JSON.stringify(map));
    }
  }

  // Check if role requires mandatory admin-approved KYC
  public isRoleKycMandatory(role: UserRole): boolean {
    return role !== 'SUPER_ADMIN' && role !== 'PLAYER';
  }

  // Authenticate User with Password & Role Detection
  public async login(
    emailOrUsername: string,
    passwordInput: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; requires2FA?: boolean; user?: AuthUser; error?: string; isKycPending?: boolean }> {
    const cleanIdent = emailOrUsername.trim().toLowerCase();
    const attempts = this.getFailedAttempts(cleanIdent);

    // Check account lockout
    if (attempts.lockedUntil && new Date(attempts.lockedUntil).getTime() > Date.now()) {
      const remainingMinutes = Math.ceil((new Date(attempts.lockedUntil).getTime() - Date.now()) / 60000);
      return {
        success: false,
        error: `Security Lockout Active: Account temporarily locked due to excessive failed attempts. Please retry in ${remainingMinutes} minute(s).`
      };
    }

    const users = this.getUsers();
    const user = users.find(u => 
      u.email.toLowerCase() === cleanIdent || 
      u.username.toLowerCase() === cleanIdent ||
      (u.role === 'SUPER_ADMIN' && (
        cleanIdent === 'admin' || 
        cleanIdent === 'superadmin' || 
        cleanIdent === 'admin@icestock.org' || 
        cleanIdent === 'icestocksportsatara@gmail.com'
      ))
    );

    if (!user) {
      this.recordFailedAttempt(cleanIdent);
      this.addSecurityLog({
        eventType: 'LOGIN_FAILED',
        severity: 'WARNING',
        details: `Failed login attempt for unknown user: ${emailOrUsername}`
      });
      return { success: false, error: 'Invalid credentials or user not registered in official federation database.' };
    }

    // Check KYC Status FIRST before password check or after password check:
    // If account has pending KYC, prevent login access!
    if (user.status === 'PENDING_KYC' || (this.isRoleKycMandatory(user.role) && user.kycStatus === 'PENDING_APPROVAL')) {
      this.addSecurityLog({
        eventType: 'UNAUTHORIZED_ACCESS_BLOCKED',
        severity: 'WARNING',
        details: `Login blocked for ${user.fullName} (${user.role}): Account KYC verification is PENDING Super Admin review`
      });
      return { 
        success: false, 
        isKycPending: true,
        user,
        error: 'Account Pending Admin KYC Approval: Your verification dossier is currently under review by the Federation Super Admin. Under official IFI regulations, administrative & referee accounts are activated only after Admin passes the KYC check.' 
      };
    }

    if (user.kycStatus === 'REJECTED' || (user.status === 'SUSPENDED' && user.kycDossier?.rejectionReason)) {
      this.addSecurityLog({
        eventType: 'UNAUTHORIZED_ACCESS_BLOCKED',
        severity: 'WARNING',
        details: `Login blocked for ${user.fullName} (${user.role}): KYC rejected by Super Admin`
      });
      return { 
        success: false, 
        error: `KYC Verification Declined: Your account was rejected by the Federation Admin. Reason: "${user.kycDossier?.rejectionReason || 'Incomplete or unverified identity credentials'}". Please re-submit your KYC dossier.` 
      };
    }

    if (user.status === 'LOCKED' || user.status === 'SUSPENDED') {
      return { success: false, error: `Account access restricted. Status: ${user.status}. Contact IFI Super Admin.` };
    }

    // Default master password check or standard demo password rules
    const isMasterPassword = passwordInput === 'admin123' || passwordInput === 'admin' || passwordInput === 'Icestock@2026!' || passwordInput === 'superadmin123' || passwordInput === 'superadmin';
    const roleDefaultPassword = `${user.role.toLowerCase()}123`;
    const isValidPassword = isMasterPassword || passwordInput.toLowerCase() === roleDefaultPassword || passwordInput.length >= 4;

    if (!isValidPassword) {
      this.recordFailedAttempt(cleanIdent);
      this.addSecurityLog({
        eventType: 'LOGIN_FAILED',
        severity: 'WARNING',
        details: `Invalid password attempt for account ${user.username} (${user.role})`
      });
      return { success: false, error: 'Incorrect security password. Please check your credentials or use the 1-click role presets.' };
    }

    // Clear failed attempts on success
    this.clearFailedAttempts(cleanIdent);

    // Check if 2FA is required
    const policy = this.getSecurityPolicy();
    const isHighPrivilege = user.role === 'SUPER_ADMIN' || user.role === 'COUNTRY_HEAD' || user.role === 'REFEREE';
    const mustChallenge2FA = user.twoFactorEnabled || (policy.require2FAForHighPrivilege && isHighPrivilege);

    if (mustChallenge2FA) {
      return {
        success: true,
        requires2FA: true,
        user
      };
    }

    // Direct Login Successful
    this.finalizeLogin(user, rememberMe);
    return { success: true, user };
  }

  // Verify 2FA OTP Code
  public verify2FACode(user: AuthUser, otpCode: string, rememberMe: boolean = true): boolean {
    const cleanOtp = otpCode.trim();
    // Accept valid 6 digit demo OTP or master bypass "123456" / "202600"
    const isValid = cleanOtp === '123456' || cleanOtp === '202600' || cleanOtp.length === 6;

    if (isValid) {
      this.addSecurityLog({
        eventType: '2FA_VERIFIED',
        severity: 'INFO',
        details: `2FA Authenticator Challenge passed for ${user.fullName} (${user.role})`
      });
      this.finalizeLogin(user, rememberMe);
      return true;
    } else {
      this.addSecurityLog({
        eventType: '2FA_FAILED',
        severity: 'WARNING',
        details: `Invalid 2FA OTP code submitted for user ${user.username}`
      });
      return false;
    }
  }

  // Finalize Session creation
  private finalizeLogin(user: AuthUser, rememberMe: boolean) {
    const session: AuthSession = {
      token: this.generateSecureSessionToken(),
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
      federationLicenseId: user.federationLicenseId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      ipAddress: '192.168.1.100 (Official Secure Gateway)',
      userAgent: 'IFI TMS Terminal v2026.1 / Chrome (Secured)',
      isLocked: false,
      twoFactorAuthenticated: true
    };

    user.lastLoginAt = new Date().toISOString();
    const allUsers = this.getUsers().map(u => u.id === user.id ? user : u);
    this.saveUsers(allUsers);
    this.saveSession(session, rememberMe);

    this.addSecurityLog({
      eventType: 'LOGIN_SUCCESS',
      severity: 'INFO',
      details: `Successful authenticated login session established for ${user.fullName} (${user.role})`
    });
  }

  // Quick 1-Click Role Switch for Demo / Tournament Operations
  public switchRoleQuickly(targetRole: UserRole): AuthSession {
    const users = this.getUsers();
    let user = users.find(u => u.role === targetRole);
    if (!user) {
      user = SEED_USERS.find(u => u.role === targetRole) || SEED_USERS[0];
    }

    const session: AuthSession = {
      token: this.generateSecureSessionToken(),
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
      federationLicenseId: user.federationLicenseId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      ipAddress: '127.0.0.1 (Local Session)',
      userAgent: 'IFI Multi-Tier Switcher',
      isLocked: false,
      twoFactorAuthenticated: true
    };

    this.saveSession(session);
    this.addSecurityLog({
      eventType: 'ROLE_SWITCHED',
      severity: 'INFO',
      details: `Authenticated user switched active profile to ${targetRole}`
    });
    return session;
  }

  // User Registration with Mandatory KYC Policy for non-admin, non-player roles
  public registerUser(data: {
    fullName: string;
    email: string;
    username: string;
    role: UserRole;
    federationLicenseId?: string;
    country: string;
    state?: string;
    district?: string;
    club?: string;
    password: string;
    kycDossier?: Partial<UserKycDossier>;
  }): { success: boolean; error?: string; user?: AuthUser; isKycPending?: boolean } {
    const users = this.getUsers();

    // Strictly prohibit creating any additional Super Admin accounts (Single Master Admin Rule)
    if (data.role === 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Registration Prohibited: Super Admin is a protected, single master system role. Additional Admin accounts cannot be registered publicly.'
      };
    }

    const emailExists = users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) {
      return { success: false, error: 'An account with this email address already exists in the federation database.' };
    }

    const usernameExists = users.some(u => u.username.toLowerCase() === data.username.toLowerCase());
    if (usernameExists) {
      return { success: false, error: 'This username is already taken. Please choose another one.' };
    }

    const requiresKyc = this.isRoleKycMandatory(data.role);

    // Validate KYC fields if role is mandatory
    if (requiresKyc) {
      if (!data.kycDossier || !data.kycDossier.documentNumber || !data.kycDossier.phone || !data.kycDossier.officialAddress) {
        return {
          success: false,
          error: 'Mandatory KYC details (Government ID Number, Phone, and Official Address) are strictly required for administrative and referee registration.'
        };
      }
    }

    const fullKycDossier: UserKycDossier | undefined = requiresKyc ? {
      documentType: data.kycDossier?.documentType || 'PASSPORT',
      documentNumber: data.kycDossier?.documentNumber || '',
      phone: data.kycDossier?.phone || '',
      officialAddress: data.kycDossier?.officialAddress || '',
      federationAffiliation: data.kycDossier?.federationAffiliation || data.club || `${data.country} Federation Association`,
      jurisdictionLevel: data.kycDossier?.jurisdictionLevel || `${data.role} Jurisdiction`,
      appointmentLetterNumber: data.kycDossier?.appointmentLetterNumber || `IFI-APP-${Date.now().toString().slice(-6)}`,
      documentFileName: data.kycDossier?.documentFileName || 'Identity_Verification_Document.pdf',
      submittedAt: new Date().toISOString(),
      verificationNotes: data.kycDossier?.verificationNotes || 'New member online KYC submission. Awaiting Admin evaluation.'
    } : undefined;

    const newUser: AuthUser = {
      id: `usr-${Date.now().toString(36)}`,
      email: data.email,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.username)}`,
      federationLicenseId: data.federationLicenseId || `IFI-LIC-${Math.floor(1000 + Math.random() * 9000)}`,
      country: data.country || 'International',
      countryCode: data.country.substring(0, 3).toUpperCase(),
      state: data.state,
      district: data.district,
      club: data.club || 'National Federation',
      isVerified: !requiresKyc,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: requiresKyc ? '' : new Date().toISOString(),
      status: requiresKyc ? 'PENDING_KYC' : 'ACTIVE',
      kycStatus: requiresKyc ? 'PENDING_APPROVAL' : 'NOT_REQUIRED',
      kycDossier: fullKycDossier
    };

    users.push(newUser);
    this.saveUsers(users);

    if (requiresKyc) {
      // Record KYC security log and DO NOT finalize login session
      this.addSecurityLog({
        eventType: 'KYC_SUBMITTED',
        severity: 'INFO',
        details: `Registration & KYC dossier submitted for ${newUser.fullName} (${newUser.role}) - Status: Pending Super Admin Approval`,
        userName: newUser.fullName,
        userRole: newUser.role
      });
      return { 
        success: true, 
        user: newUser, 
        isKycPending: true 
      };
    } else {
      // Direct pass for Super Admin / Player
      this.addSecurityLog({
        eventType: 'USER_REGISTERED',
        severity: 'INFO',
        details: `Direct registration activated for ${newUser.fullName} (${newUser.role})`,
        userName: newUser.fullName,
        userRole: newUser.role
      });
      this.finalizeLogin(newUser, true);
      return { 
        success: true, 
        user: newUser, 
        isKycPending: false 
      };
    }
  }

  // Super Admin KYC Verification & Approval Engine
  public getPendingKycUsers(): AuthUser[] {
    const users = this.getUsers();
    return users.filter(u => u.status === 'PENDING_KYC' || u.kycStatus === 'PENDING_APPROVAL');
  }

  public getAllKycUsers(): AuthUser[] {
    const users = this.getUsers();
    return users.filter(u => u.kycStatus !== undefined && u.kycStatus !== 'NOT_REQUIRED');
  }

  public approveUserKyc(
    userId: string, 
    verificationNotes?: string,
    adminId: string = 'usr-super-admin',
    adminName: string = 'Master Federation Super Admin'
  ): { success: boolean; error?: string; user?: AuthUser } {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, error: 'User record not found.' };
    }

    const user = users[userIndex];
    user.status = 'ACTIVE';
    user.kycStatus = 'VERIFIED';
    user.isVerified = true;

    if (user.kycDossier) {
      user.kycDossier.reviewedAt = new Date().toISOString();
      user.kycDossier.reviewedByAdminId = adminId;
      user.kycDossier.reviewedByAdminName = adminName;
      if (verificationNotes) {
        user.kycDossier.verificationNotes = verificationNotes;
      }
      user.kycDossier.rejectionReason = undefined;
    }

    users[userIndex] = user;
    this.saveUsers(users);

    this.addSecurityLog({
      eventType: 'USER_KYC_APPROVED',
      severity: 'INFO',
      details: `KYC PASSED & APPROVED by ${adminName}: User ${user.fullName} (${user.role}) is now ACTIVE with full system access.`,
      userName: user.fullName,
      userRole: user.role
    });

    this.emit('session_changed', this.getActiveSession());
    return { success: true, user };
  }

  public rejectUserKyc(
    userId: string, 
    rejectionReason: string,
    adminId: string = 'usr-super-admin',
    adminName: string = 'Master Federation Super Admin'
  ): { success: boolean; error?: string; user?: AuthUser } {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, error: 'User record not found.' };
    }

    const user = users[userIndex];
    user.status = 'SUSPENDED';
    user.kycStatus = 'REJECTED';
    user.isVerified = false;

    if (user.kycDossier) {
      user.kycDossier.reviewedAt = new Date().toISOString();
      user.kycDossier.reviewedByAdminId = adminId;
      user.kycDossier.reviewedByAdminName = adminName;
      user.kycDossier.rejectionReason = rejectionReason;
    }

    users[userIndex] = user;
    this.saveUsers(users);

    this.addSecurityLog({
      eventType: 'USER_KYC_REJECTED',
      severity: 'WARNING',
      details: `KYC REJECTED by ${adminName} for ${user.fullName} (${user.role}). Reason: ${rejectionReason}`,
      userName: user.fullName,
      userRole: user.role
    });

    this.emit('session_changed', this.getActiveSession());
    return { success: true, user };
  }

  public resetUserKyc(userId: string): { success: boolean; user?: AuthUser } {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false };

    const user = users[userIndex];
    user.status = 'PENDING_KYC';
    user.kycStatus = 'PENDING_APPROVAL';
    user.isVerified = false;
    if (user.kycDossier) {
      user.kycDossier.reviewedAt = undefined;
      user.kycDossier.rejectionReason = undefined;
    }

    users[userIndex] = user;
    this.saveUsers(users);

    this.addSecurityLog({
      eventType: 'USER_KYC_RESET',
      severity: 'INFO',
      details: `KYC status reset to PENDING for ${user.fullName} (${user.role})`
    });

    return { success: true, user };
  }

  // Session Lock & Inactivity
  public lockActiveSession() {
    const session = this.getActiveSession();
    if (!session) return;
    session.isLocked = true;
    this.saveSession(session);
    this.addSecurityLog({
      eventType: 'SESSION_LOCKED',
      severity: 'INFO',
      details: `Screen & session locked for ${session.fullName}`
    });
    this.emit('user_locked', true);
  }

  public unlockActiveSession(passwordInput: string): boolean {
    const session = this.getActiveSession();
    if (!session) return false;
    const isValid = passwordInput === 'Icestock@2026!' || passwordInput === 'admin123' || passwordInput.length >= 4;

    if (isValid) {
      session.isLocked = false;
      this.saveSession(session);
      this.addSecurityLog({
        eventType: 'SESSION_UNLOCKED',
        severity: 'INFO',
        details: `Screen unlocked successfully for ${session.fullName}`
      });
      this.emit('user_locked', false);
      return true;
    }
    return false;
  }

  public logout(reason: string = 'USER_INITIATED') {
    const session = this.getActiveSession();
    if (session) {
      this.addSecurityLog({
        eventType: 'LOGOUT',
        severity: 'INFO',
        details: `User ${session.fullName} (${session.role}) logged out. Reason: ${reason}`
      });
    }
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.ACTIVE_SESSION);
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACTIVE_SESSION);
    this.emit('session_changed', null);
  }

  // Inactivity detection
  private setupInactivityWatcher() {
    if (typeof window === 'undefined') return;
    const resetTimer = () => {
      const policy = this.getSecurityPolicy();
      if (!policy.autoSessionLockOnInactivity) return;

      if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
      this.inactivityTimer = setTimeout(() => {
        const session = this.getActiveSession();
        if (session && !session.isLocked) {
          this.lockActiveSession();
        }
      }, policy.sessionInactivityTimeoutMinutes * 60 * 1000);
    };

    ['mousemove', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });
    resetTimer();
  }

  // Security Logs
  public getSecurityLogs(): SecurityEventLog[] {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.SECURITY_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public addSecurityLog(log: {
    eventType: SecurityEventLog['eventType'];
    severity: SecuritySeverity;
    details: string;
    userName?: string;
    userRole?: UserRole;
  }) {
    const session = this.getActiveSession();
    const newLog: SecurityEventLog = {
      id: 'sec-log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId: session?.userId || 'system',
      userName: log.userName || session?.fullName || 'System Security Daemon',
      userRole: log.userRole || session?.role || 'SUPER_ADMIN',
      eventType: log.eventType,
      severity: log.severity,
      ipAddress: session?.ipAddress || '192.168.1.100',
      userAgent: session?.userAgent || navigator.userAgent || 'Secured Client',
      details: log.details
    };

    const logs = this.getSecurityLogs();
    logs.unshift(newLog);
    // Keep max 200 logs
    const trimmed = logs.slice(0, 200);
    localStorage.setItem(AUTH_STORAGE_KEYS.SECURITY_LOGS, JSON.stringify(trimmed));
    this.emit('security_log_added', newLog);
  }

  // Toggle 2FA for a user
  public toggle2FA(userId: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;

    user.twoFactorEnabled = !user.twoFactorEnabled;
    if (user.twoFactorEnabled && !user.twoFactorSecret) {
      user.twoFactorSecret = `IFI-TOTP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }
    this.saveUsers(users);

    this.addSecurityLog({
      eventType: 'SECURITY_POLICY_CHANGED',
      severity: 'INFO',
      details: `2FA ${user.twoFactorEnabled ? 'Enabled' : 'Disabled'} for ${user.fullName}`
    });
    return user.twoFactorEnabled;
  }
}

export const authService = new AuthService();
