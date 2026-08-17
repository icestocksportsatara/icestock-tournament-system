import { Request, Response, NextFunction } from 'express';
import { serverAuth } from '../auth/authService.js';
import { db } from '../db/database.js';
import { UserRole, PermissionKey } from '../../src/types/index.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: UserRole;
        fullName: string;
        federationLicenseId: string;
        countryCode: string;
        sessionId: string;
      };
    }
  }
}

// Comprehensive RBAC Matrix for Granular Access Control
export const RBAC_PERMISSION_MATRIX: Record<UserRole, Record<PermissionKey, boolean>> = {
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
  GLOBAL_FEDERATION_ADMIN: {
    canManageTournaments: true,
    canEditLiveScores: true,
    canLockRefereeCards: true,
    canAccreditPlayers: true,
    canCreateTeams: true,
    canExportPDF: true,
    canOverrideMatches: true,
    canConfigureMasterSettings: true,
    canManageRules: true,
    canResetDatabase: false,
    canDeleteRecords: false
  },
  CONTINENTAL_ADMIN: {
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
  COUNTRY_HEAD: {
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
  NATIONAL_HEAD: {
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
  STATE_HEAD: {
    canManageTournaments: true,
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
  CHIEF_REFEREE: {
    canManageTournaments: false,
    canEditLiveScores: true,
    canLockRefereeCards: true,
    canAccreditPlayers: false,
    canCreateTeams: false,
    canExportPDF: true,
    canOverrideMatches: true,
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
  UMPIRE: {
    canManageTournaments: false,
    canEditLiveScores: true,
    canLockRefereeCards: false,
    canAccreditPlayers: false,
    canCreateTeams: false,
    canExportPDF: true,
    canOverrideMatches: false,
    canConfigureMasterSettings: false,
    canManageRules: false,
    canResetDatabase: false,
    canDeleteRecords: false
  },
  MEASURER: {
    canManageTournaments: false,
    canEditLiveScores: true,
    canLockRefereeCards: false,
    canAccreditPlayers: false,
    canCreateTeams: false,
    canExportPDF: false,
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
    canAccreditPlayers: false,
    canCreateTeams: true,
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
  },
  MEDIA: {
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
  },
  VIEWER: {
    canManageTournaments: false,
    canEditLiveScores: false,
    canLockRefereeCards: false,
    canAccreditPlayers: false,
    canCreateTeams: false,
    canExportPDF: false,
    canOverrideMatches: false,
    canConfigureMasterSettings: false,
    canManageRules: false,
    canResetDatabase: false,
    canDeleteRecords: false
  }
};

/**
 * Middleware: Authenticates JWT Bearer Token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  let token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token && req.cookies?.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please provide a valid Bearer token.' }
    });
  }

  const decoded = serverAuth.verifyToken(token);
  if (!decoded || !decoded.sub) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session token is invalid or expired.' }
    });
  }

  // Check if session is revoked
  if (decoded.sessionId) {
    const session = db.sessions.get(decoded.sessionId);
    if (session?.isRevoked) {
      return res.status(401).json({
        success: false,
        error: { code: 'SESSION_REVOKED', message: 'This session has been revoked. Please log in again.' }
      });
    }
  }

  // Attach User
  req.user = {
    id: decoded.sub,
    email: decoded.email,
    username: decoded.username,
    role: decoded.role as UserRole,
    fullName: decoded.fullName,
    federationLicenseId: decoded.federationLicenseId,
    countryCode: decoded.countryCode,
    sessionId: decoded.sessionId
  };

  next();
}

/**
 * Middleware: Requires a specific role or subset of roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      db.logSecurity({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        eventType: 'UNAUTHORIZED_ACCESS_BLOCKED',
        severity: 'WARNING',
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown',
        details: `Access denied to role ${req.user.role}. Required: [${allowedRoles.join(', ')}] on ${req.method} ${req.originalUrl}`
      });

      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have the required role to access this resource.' }
      });
    }

    next();
  };
}

/**
 * Middleware: Requires a specific granular RBAC permission
 */
export function requirePermission(permission: PermissionKey) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    const rolePermissions = RBAC_PERMISSION_MATRIX[req.user.role];
    const hasPermission = rolePermissions ? rolePermissions[permission] : false;

    if (!hasPermission) {
      db.logSecurity({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        eventType: 'UNAUTHORIZED_ACCESS_BLOCKED',
        severity: 'WARNING',
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown',
        details: `Missing permission '${permission}' for role ${req.user.role} on ${req.method} ${req.originalUrl}`
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Forbidden: Your account does not have permission '${permission}'.`
        }
      });
    }

    next();
  };
}
