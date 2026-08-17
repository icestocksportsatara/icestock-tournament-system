import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, DbSession } from '../db/database.js';
import { generateTotpSecret, generateOtpAuthUri, verifyTotpCode, generateRecoveryCodes } from './totp.js';
import { AuthUser, UserRole, UserKycDossier, SecuritySeverity, RefereeProfile } from '../../src/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'IFI_SECRET_KEY_PRODUCTION_GRADE_2026_MASTER';
const JWT_EXPIRES_IN = '24h';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class ServerAuthService {
  /**
   * Generates signed JWT payload
   */
  public generateTokens(user: AuthUser, sessionId: string): AuthTokens {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      federationLicenseId: user.federationLicenseId,
      countryCode: user.countryCode,
      sessionId
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = crypto.randomBytes(32).toString('hex');

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400 // 24 hours in seconds
    };
  }

  /**
   * Verifies an access token
   */
  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  /**
   * Authenticates username/email and password with rate limiting & 2FA requirement check
   */
  public async login(
    identifier: string,
    passwordInput: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{
    success: boolean;
    error?: string;
    requires2FA?: boolean;
    tempToken?: string;
    user?: AuthUser;
    tokens?: AuthTokens;
  }> {
    const cleanIdent = identifier.trim().toLowerCase();

    // Check account lockout
    const attemptRecord = db.loginAttempts.get(cleanIdent);
    if (attemptRecord?.lockedUntil && Date.now() < attemptRecord.lockedUntil) {
      const waitMinutes = Math.ceil((attemptRecord.lockedUntil - Date.now()) / 60000);
      db.logSecurity({
        userId: 'UNKNOWN',
        userName: cleanIdent,
        userRole: 'PLAYER',
        eventType: 'BRUTE_FORCE_BLOCKED',
        severity: 'CRITICAL',
        ipAddress,
        userAgent,
        details: `Brute force protection active. Account locked for ${waitMinutes} more minutes.`
      });
      return {
        success: false,
        error: `Security Lockout: Too many failed login attempts. Please wait ${waitMinutes} minute(s) before trying again.`
      };
    }

    // Find user by email or username
    let matchedUser: AuthUser | undefined;
    for (const user of db.users.values()) {
      if (user.email.toLowerCase() === cleanIdent || user.username.toLowerCase() === cleanIdent) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      this.recordFailedAttempt(cleanIdent, ipAddress, userAgent);
      return { success: false, error: 'Invalid credentials. Please verify your email/username and password.' };
    }

    // Check Account Status
    if (matchedUser.status === 'SUSPENDED' || matchedUser.status === 'LOCKED') {
      return {
        success: false,
        error: 'Account Suspended: Your access has been restricted by Federation Administration.'
      };
    }

    // Check KYC Status
    if (matchedUser.status === 'PENDING_KYC' || matchedUser.kycStatus === 'PENDING_APPROVAL') {
      return {
        success: false,
        error: 'KYC Under Review: Your application dossier is pending verification by the Super Admin.'
      };
    }

    if (matchedUser.kycStatus === 'REJECTED') {
      return {
        success: false,
        error: `Registration Declined: ${matchedUser.kycDossier?.rejectionReason || 'Your credentials did not meet federation verification standards.'}`
      };
    }

    // Verify Password Hash
    const isPasswordValid = matchedUser.passwordHash ? await bcrypt.compare(passwordInput, matchedUser.passwordHash) : false;
    if (!isPasswordValid) {
      this.recordFailedAttempt(cleanIdent, ipAddress, userAgent);
      return { success: false, error: 'Invalid credentials. Please verify your email/username and password.' };
    }

    // Reset failed attempts on success
    db.loginAttempts.delete(cleanIdent);

    // If 2FA is enabled, generate temporary 2FA token
    if (matchedUser.twoFactorEnabled && matchedUser.twoFactorSecret) {
      const tempToken = jwt.sign(
        { sub: matchedUser.id, role: matchedUser.role, is2FAStage: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return {
        success: true,
        requires2FA: true,
        tempToken,
        user: { ...matchedUser, passwordHash: undefined }
      };
    }

    // Create Authenticated Session
    const sessionId = `sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const tokens = this.generateTokens(matchedUser, sessionId);

    const session: DbSession = {
      id: sessionId,
      userId: matchedUser.id,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      ipAddress,
      userAgent,
      isRevoked: false,
      twoFactorVerified: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    db.sessions.set(session.id, session);

    // Update last login
    matchedUser.lastLoginAt = new Date().toISOString();
    db.users.set(matchedUser.id, matchedUser);

    // Log Security Event
    db.logSecurity({
      userId: matchedUser.id,
      userName: matchedUser.fullName,
      userRole: matchedUser.role,
      eventType: 'LOGIN_SUCCESS',
      severity: 'INFO',
      ipAddress,
      userAgent,
      details: `Successful login via standard password authentication.`
    });

    return {
      success: true,
      requires2FA: false,
      user: { ...matchedUser, passwordHash: undefined },
      tokens
    };
  }

  /**
   * Verifies 2FA TOTP code during login
   */
  public verify2FALogin(
    tempToken: string,
    totpCode: string,
    ipAddress: string,
    userAgent: string
  ): { success: boolean; error?: string; user?: AuthUser; tokens?: AuthTokens } {
    try {
      const decoded: any = jwt.verify(tempToken, JWT_SECRET);
      if (!decoded || !decoded.is2FAStage || !decoded.sub) {
        return { success: false, error: 'Invalid or expired 2FA session token.' };
      }

      const user = db.users.get(decoded.sub);
      if (!user || !user.twoFactorSecret) {
        return { success: false, error: 'User 2FA configuration not found.' };
      }

      // Check TOTP code or recovery code
      const isTotpValid = verifyTotpCode(totpCode, user.twoFactorSecret);
      let isRecoveryValid = false;

      if (!isTotpValid) {
        const hashes = db.recoveryCodeHashes.get(user.id) || [];
        const inputHash = crypto.createHash('sha256').update(totpCode.trim().toUpperCase()).digest('hex');
        const matchIdx = hashes.indexOf(inputHash);
        if (matchIdx !== -1) {
          isRecoveryValid = true;
          // Consume recovery code
          hashes.splice(matchIdx, 1);
          db.recoveryCodeHashes.set(user.id, hashes);
        }
      }

      if (!isTotpValid && !isRecoveryValid) {
        db.logSecurity({
          userId: user.id,
          userName: user.fullName,
          userRole: user.role,
          eventType: '2FA_FAILED',
          severity: 'WARNING',
          ipAddress,
          userAgent,
          details: 'Invalid 2FA code supplied.'
        });
        return { success: false, error: 'Invalid 6-digit authenticator code or recovery code.' };
      }

      // Create Authenticated Session
      const sessionId = `sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const tokens = this.generateTokens(user, sessionId);

      const session: DbSession = {
        id: sessionId,
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        ipAddress,
        userAgent,
        isRevoked: false,
        twoFactorVerified: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      db.sessions.set(session.id, session);

      // Log Security Event
      db.logSecurity({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        eventType: '2FA_VERIFIED',
        severity: 'INFO',
        ipAddress,
        userAgent,
        details: isRecoveryValid ? 'Logged in using a one-time emergency recovery code.' : 'Logged in using TOTP Authenticator code.'
      });

      return {
        success: true,
        user: { ...user, passwordHash: undefined },
        tokens
      };
    } catch {
      return { success: false, error: 'Invalid or expired 2FA session token.' };
    }
  }

  /**
   * Initializes 2FA Setup for an Authenticated User
   */
  public setup2FA(userId: string): { secret: string; otpAuthUri: string; recoveryCodes: string[] } {
    const user = db.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const secret = generateTotpSecret();
    const otpAuthUri = generateOtpAuthUri(user.email, secret, 'IFI Icestock Global');
    const { plainCodes, hashedCodes } = generateRecoveryCodes(8);

    // Save temporary unconfirmed secret
    user.twoFactorSecret = secret;
    db.users.set(user.id, user);
    db.recoveryCodeHashes.set(user.id, hashedCodes);

    return {
      secret,
      otpAuthUri,
      recoveryCodes: plainCodes
    };
  }

  /**
   * Confirms 2FA Setup with first valid TOTP code
   */
  public confirm2FASetup(userId: string, code: string): { success: boolean; error?: string } {
    const user = db.users.get(userId);
    if (!user || !user.twoFactorSecret) {
      return { success: false, error: '2FA setup was not initialized.' };
    }

    const isValid = verifyTotpCode(code, user.twoFactorSecret);
    if (!isValid) {
      return { success: false, error: 'Invalid verification code. Please check your authenticator app.' };
    }

    user.twoFactorEnabled = true;
    db.users.set(user.id, user);

    db.logSecurity({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      eventType: '2FA_ENABLED',
      severity: 'INFO',
      ipAddress: 'Internal',
      userAgent: 'Server',
      details: 'Two-factor TOTP authentication successfully activated.'
    });

    return { success: true };
  }

  /**
   * Disables 2FA with current password confirmation
   */
  public async disable2FA(userId: string, passwordInput: string): Promise<{ success: boolean; error?: string }> {
    const user = db.users.get(userId);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    const isValid = user.passwordHash ? await bcrypt.compare(passwordInput, user.passwordHash) : false;
    if (!isValid) {
      return { success: false, error: 'Incorrect password.' };
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    db.users.set(user.id, user);
    db.recoveryCodeHashes.delete(user.id);

    db.logSecurity({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      eventType: '2FA_DISABLED',
      severity: 'WARNING',
      ipAddress: 'Internal',
      userAgent: 'Server',
      details: 'Two-factor TOTP authentication disabled by user.'
    });

    return { success: true };
  }

  /**
   * Registers a new user with password hashing and mandatory KYC for official roles
   */
  public async register(
    data: {
      email: string;
      username: string;
      fullName: string;
      role: UserRole;
      password: string;
      country: string;
      countryCode: string;
      state?: string;
      district?: string;
      club?: string;
      federationLicenseId?: string;
      kycDossier?: Partial<UserKycDossier>;
    },
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; error?: string; user?: AuthUser; isKycPending?: boolean }> {
    // 1. Prohibit registering additional SUPER_ADMIN accounts
    if (data.role === 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Registration Prohibited: Super Admin is a dedicated single master role.'
      };
    }

    // 2. Check duplicate email or username
    for (const user of db.users.values()) {
      if (user.email.toLowerCase() === data.email.toLowerCase()) {
        return { success: false, error: 'An account with this email address already exists.' };
      }
      if (user.username.toLowerCase() === data.username.toLowerCase()) {
        return { success: false, error: 'Username is already taken. Please choose another.' };
      }
    }

    // 3. Password policy
    if (!data.password || data.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    // 4. Hash Password with bcrypt
    const passwordHash = await bcrypt.hash(data.password, 12);

    // 5. KYC Policy check
    const requiresKyc = data.role !== 'PLAYER';
    const initialStatus = requiresKyc ? 'PENDING_KYC' : 'ACTIVE';
    const initialKycStatus = requiresKyc ? 'PENDING_APPROVAL' : 'NOT_REQUIRED';

    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const federationLicenseId = data.federationLicenseId || `IFI-${data.countryCode || 'INT'}-${Date.now().toString().slice(-4)}`;

    let dossier: UserKycDossier | undefined;
    if (requiresKyc && data.kycDossier) {
      dossier = {
        documentType: data.kycDossier.documentType || 'PASSPORT',
        documentNumber: data.kycDossier.documentNumber || 'PENDING',
        phone: data.kycDossier.phone || '',
        officialAddress: data.kycDossier.officialAddress || '',
        federationAffiliation: data.kycDossier.federationAffiliation || `${data.country} National Federation`,
        jurisdictionLevel: data.kycDossier.jurisdictionLevel || data.role,
        documentFileName: data.kycDossier.documentFileName,
        documentFileUrl: data.kycDossier.documentFileUrl,
        appointmentLetterNumber: data.kycDossier.appointmentLetterNumber,
        declarationAccepted: true,
        submittedAt: new Date().toISOString()
      };
    }

    const newUser: AuthUser = {
      id: newUserId,
      email: data.email,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      federationLicenseId,
      country: data.country,
      countryCode: data.countryCode,
      state: data.state,
      district: data.district,
      club: data.club,
      isVerified: !requiresKyc,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      status: initialStatus,
      kycStatus: initialKycStatus,
      kycDossier: dossier,
      passwordHash
    };

    db.users.set(newUser.id, newUser);

    // If Referee role, also register referee profile
    if (data.role === 'REFEREE') {
      const refProfile: RefereeProfile = {
        id: `ref-${newUser.id}`,
        name: newUser.fullName,
        email: newUser.email,
        country: newUser.country,
        countryCode: newUser.countryCode,
        flag: '🏁',
        licenseNumber: federationLicenseId,
        certificationLevel: 'NATIONAL_A',
        avatar: newUser.avatar,
        status: 'AVAILABLE_ON_RINK',
        specialization: ['TEAM_GAME', 'INDIVIDUAL_TARGET'],
        matchesOfficiatedCount: 0
      };
      db.referees.set(refProfile.id, refProfile);
    }

    // Log Security & Audit
    db.logSecurity({
      userId: newUser.id,
      userName: newUser.fullName,
      userRole: newUser.role,
      eventType: 'USER_REGISTERED',
      severity: 'INFO',
      ipAddress,
      userAgent,
      details: requiresKyc ? 'User registered with pending Super Admin KYC verification gate.' : 'Athlete registered with instant access.'
    });

    return {
      success: true,
      user: { ...newUser, passwordHash: undefined },
      isKycPending: requiresKyc
    };
  }

  /**
   * Super Admin KYC Application Decision
   */
  public reviewKycApplication(
    userId: string,
    adminId: string,
    adminName: string,
    decision: 'APPROVE' | 'REJECT' | 'RESET',
    notes?: string,
    rejectionReason?: string
  ): { success: boolean; error?: string; user?: AuthUser } {
    const user = db.users.get(userId);
    if (!user) {
      return { success: false, error: 'User applicant not found.' };
    }

    if (decision === 'APPROVE') {
      user.status = 'ACTIVE';
      user.kycStatus = 'VERIFIED';
      user.isVerified = true;
      if (user.kycDossier) {
        user.kycDossier.reviewedAt = new Date().toISOString();
        user.kycDossier.reviewedByAdminId = adminId;
        user.kycDossier.reviewedByAdminName = adminName;
        user.kycDossier.verificationNotes = notes || 'Credentials verified & officially sanctioned by Super Admin.';
      }
    } else if (decision === 'REJECT') {
      user.status = 'SUSPENDED';
      user.kycStatus = 'REJECTED';
      user.isVerified = false;
      if (user.kycDossier) {
        user.kycDossier.reviewedAt = new Date().toISOString();
        user.kycDossier.reviewedByAdminId = adminId;
        user.kycDossier.reviewedByAdminName = adminName;
        user.kycDossier.rejectionReason = rejectionReason || 'Official identification documents failed federation audit standards.';
      }
    } else {
      user.status = 'PENDING_KYC';
      user.kycStatus = 'PENDING_APPROVAL';
      user.isVerified = false;
    }

    db.users.set(user.id, user);

    db.logAudit({
      userId: adminId,
      userName: adminName,
      userRole: 'SUPER_ADMIN',
      action: decision === 'APPROVE' ? 'KYC_APPROVED' : decision === 'REJECT' ? 'KYC_REJECTED' : 'KYC_RESET',
      resource: 'UserKycDossier',
      resourceId: user.id,
      newValue: { status: user.status, kycStatus: user.kycStatus, notes },
      reason: notes || rejectionReason || 'Super Admin Compliance Decision'
    });

    return { success: true, user: { ...user, passwordHash: undefined } };
  }

  /**
   * Revokes session
   */
  public logout(sessionId: string): boolean {
    const session = db.sessions.get(sessionId);
    if (session) {
      session.isRevoked = true;
      db.sessions.set(sessionId, session);
      return true;
    }
    return false;
  }

  private recordFailedAttempt(cleanIdent: string, ipAddress: string, userAgent: string) {
    const existing = db.loginAttempts.get(cleanIdent) || { count: 0 };
    existing.count += 1;
    if (existing.count >= MAX_FAILED_ATTEMPTS) {
      existing.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      db.logSecurity({
        userId: 'UNKNOWN',
        userName: cleanIdent,
        userRole: 'PLAYER',
        eventType: 'ACCOUNT_LOCKED',
        severity: 'CRITICAL',
        ipAddress,
        userAgent,
        details: `Account temporarily locked due to ${MAX_FAILED_ATTEMPTS} consecutive failed login attempts.`
      });
    } else {
      db.logSecurity({
        userId: 'UNKNOWN',
        userName: cleanIdent,
        userRole: 'PLAYER',
        eventType: 'LOGIN_FAILED',
        severity: 'WARNING',
        ipAddress,
        userAgent,
        details: `Failed password authentication attempt (${existing.count}/${MAX_FAILED_ATTEMPTS}).`
      });
    }
    db.loginAttempts.set(cleanIdent, existing);
  }
}

export const serverAuth = new ServerAuthService();
