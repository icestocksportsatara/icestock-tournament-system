import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { serverAuth } from '../auth/authService.js';
import { scoringEngine } from '../scoring/scoringEngine.js';
import { rankingEngine } from '../ranking/rankingEngine.js';
import { wsBroadcaster } from '../websocket/wsServer.js';
import { authenticateToken, requireRole, requirePermission } from '../middleware/authMiddleware.js';
import { UserRole, Discipline, GenderCategory } from '../../src/types/index.js';

export const apiRouter = Router();

// ==========================================
// 1. Authentication Endpoints
// ==========================================

// Register
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, username, fullName, role, password, country, countryCode, state, district, club, federationLicenseId, kycDossier } = req.body;

    const result = await serverAuth.register(
      { email, username, fullName, role, password, country, countryCode, state, district, club, federationLicenseId, kycDossier },
      req.ip || 'Unknown',
      req.get('User-Agent') || 'Unknown'
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: { code: 'REGISTRATION_FAILED', message: result.error } });
    }

    // Broadcast KYC event to Super Admin if pending
    if (result.isKycPending) {
      wsBroadcaster.broadcast({
        type: 'KYC_STATUS_CHANGE',
        data: { userId: result.user?.id, role: result.user?.role, status: 'PENDING_APPROVAL' },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Internal error' } });
  }
});

// Login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Identifier and password are required.' } });
    }

    const result = await serverAuth.login(identifier, password, req.ip || 'Unknown', req.get('User-Agent') || 'Unknown');

    if (!result.success) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: result.error } });
    }

    // Set secure HTTP-only cookie if tokens present
    if (result.tokens?.accessToken) {
      res.cookie('auth_token', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });
    }

    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Internal error' } });
  }
});

// 2FA Verify Login
apiRouter.post('/auth/2fa/verify-login', (req: Request, res: Response) => {
  try {
    const { tempToken, totpCode } = req.body;
    if (!tempToken || !totpCode) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Token and 2FA code are required.' } });
    }

    const result = serverAuth.verify2FALogin(tempToken, totpCode, req.ip || 'Unknown', req.get('User-Agent') || 'Unknown');
    if (!result.success) {
      return res.status(401).json({ success: false, error: { code: '2FA_FAILED', message: result.error } });
    }

    if (result.tokens?.accessToken) {
      res.cookie('auth_token', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });
    }

    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 2FA Setup
apiRouter.post('/auth/2fa/setup', authenticateToken, (req: Request, res: Response) => {
  try {
    const data = serverAuth.setup2FA(req.user!.id);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: { code: '2FA_SETUP_ERROR', message: err.message } });
  }
});

// 2FA Confirm Setup
apiRouter.post('/auth/2fa/verify-setup', authenticateToken, (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const result = serverAuth.confirm2FASetup(req.user!.id, code);
    if (!result.success) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_CODE', message: result.error } });
    }
    return res.json({ success: true, message: '2FA TOTP successfully activated.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// 2FA Disable
apiRouter.post('/auth/2fa/disable', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const result = await serverAuth.disable2FA(req.user!.id, password);
    if (!result.success) {
      return res.status(400).json({ success: false, error: { code: 'DISABLE_FAILED', message: result.error } });
    }
    return res.json({ success: true, message: '2FA has been disabled.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Get Current User Profile
apiRouter.get('/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = db.users.get(req.user!.id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
  }
  return res.json({ success: true, data: { user: { ...user, passwordHash: undefined } } });
});

// Logout
apiRouter.post('/auth/logout', authenticateToken, (req: Request, res: Response) => {
  serverAuth.logout(req.user!.sessionId);
  res.clearCookie('auth_token');
  return res.json({ success: true, message: 'Successfully logged out.' });
});

// ==========================================
// 2. Tournament Management Endpoints
// ==========================================

apiRouter.get('/tournaments', (req: Request, res: Response) => {
  const list = Array.from(db.tournaments.values());
  return res.json({ success: true, data: list });
});

apiRouter.get('/tournaments/:id', (req: Request, res: Response) => {
  const trn = db.tournaments.get(req.params.id);
  if (!trn) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tournament not found.' } });
  }
  return res.json({ success: true, data: trn });
});

apiRouter.post('/tournaments', authenticateToken, requirePermission('canManageTournaments'), (req: Request, res: Response) => {
  const tournament = req.body;
  if (!tournament.id) {
    tournament.id = `trn-${Date.now()}`;
  }
  db.tournaments.set(tournament.id, tournament);

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    action: 'TOURNAMENT_CREATED',
    resource: 'Tournament',
    resourceId: tournament.id,
    newValue: tournament
  });

  wsBroadcaster.broadcast({
    type: 'TOURNAMENT_UPDATE',
    data: tournament,
    timestamp: new Date().toISOString()
  });

  return res.status(201).json({ success: true, data: tournament });
});

apiRouter.put('/tournaments/:id', authenticateToken, requirePermission('canManageTournaments'), (req: Request, res: Response) => {
  const existing = db.tournaments.get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tournament not found.' } });
  }

  const updated = { ...existing, ...req.body };
  db.tournaments.set(updated.id, updated);

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    action: 'TOURNAMENT_UPDATED',
    resource: 'Tournament',
    resourceId: updated.id,
    oldValue: existing,
    newValue: updated
  });

  return res.json({ success: true, data: updated });
});

// ==========================================
// 3. Matches & Real-Time Scoring Endpoints
// ==========================================

apiRouter.get('/matches', (req: Request, res: Response) => {
  const tournamentId = req.query.tournamentId as string;
  let list = Array.from(db.matches.values());
  if (tournamentId) {
    list = list.filter(m => m.tournamentId === tournamentId);
  }
  return res.json({ success: true, data: list });
});

apiRouter.get('/matches/:id', (req: Request, res: Response) => {
  const match = db.matches.get(req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found.' } });
  }
  return res.json({ success: true, data: match });
});

// Record score attempt or end score (Referee / Director)
apiRouter.post('/matches/:id/scores', authenticateToken, requirePermission('canEditLiveScores'), (req: Request, res: Response) => {
  const result = scoringEngine.recordScoreUpdate(
    req.params.id,
    req.body,
    req.user!.id,
    req.user!.fullName,
    false
  );

  if (!result.success) {
    return res.status(400).json({ success: false, error: { code: 'SCORING_ERROR', message: result.error } });
  }

  // Broadcast Real-time score update via WebSocket
  wsBroadcaster.broadcast({
    type: 'SCORE_UPDATE',
    data: { match: result.match },
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, data: result.match });
});

// Scorecard Lock / Verification (Chief Referee)
apiRouter.post('/matches/:id/lock', authenticateToken, requirePermission('canLockRefereeCards'), (req: Request, res: Response) => {
  const { state } = req.body;
  const result = scoringEngine.lockScorecard(
    req.params.id,
    state || 'LOCKED',
    req.user!.id,
    req.user!.fullName
  );

  if (!result.success) {
    return res.status(400).json({ success: false, error: { code: 'LOCK_FAILED', message: result.error } });
  }

  wsBroadcaster.broadcast({
    type: 'MATCH_STATUS_CHANGE',
    data: { matchId: req.params.id, status: result.match?.status },
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, data: result.match });
});

// Score Override (Admin with reason & audit logging)
apiRouter.post('/matches/:id/override', authenticateToken, requirePermission('canOverrideMatches'), (req: Request, res: Response) => {
  const { scorePayload, reason } = req.body;
  if (!reason) {
    return res.status(400).json({ success: false, error: { code: 'REASON_REQUIRED', message: 'Mandatory override justification reason is required.' } });
  }

  const result = scoringEngine.recordScoreUpdate(
    req.params.id,
    scorePayload,
    req.user!.id,
    req.user!.fullName,
    true,
    reason
  );

  if (!result.success) {
    return res.status(400).json({ success: false, error: { code: 'OVERRIDE_FAILED', message: result.error } });
  }

  wsBroadcaster.broadcast({
    type: 'SCORE_UPDATE',
    data: { match: result.match, isOverride: true },
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, data: result.match });
});

// ==========================================
// 4. Players & Teams Endpoints
// ==========================================

apiRouter.get('/players', (req: Request, res: Response) => {
  return res.json({ success: true, data: Array.from(db.players.values()) });
});

apiRouter.post('/players', authenticateToken, requirePermission('canAccreditPlayers'), (req: Request, res: Response) => {
  const player = req.body;
  if (!player.id) {
    player.id = `pl-${Date.now()}`;
  }
  db.players.set(player.id, player);
  return res.status(201).json({ success: true, data: player });
});

apiRouter.get('/teams', (req: Request, res: Response) => {
  return res.json({ success: true, data: Array.from(db.teams.values()) });
});

apiRouter.post('/teams', authenticateToken, requirePermission('canCreateTeams'), (req: Request, res: Response) => {
  const team = req.body;
  if (!team.id) {
    team.id = `tm-${Date.now()}`;
  }
  db.teams.set(team.id, team);
  return res.status(201).json({ success: true, data: team });
});

// ==========================================
// 5. Referees & Rink Assignment Endpoints
// ==========================================

apiRouter.get('/referees', (req: Request, res: Response) => {
  return res.json({ success: true, data: Array.from(db.referees.values()) });
});

apiRouter.put('/referees/:id/status', authenticateToken, (req: Request, res: Response) => {
  const ref = db.referees.get(req.params.id);
  if (!ref) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Referee not found.' } });
  }

  ref.status = req.body.status;
  if (req.body.assignedRinkId) ref.assignedRinkId = req.body.assignedRinkId;
  if (req.body.assignedRinkName) ref.assignedRinkName = req.body.assignedRinkName;
  db.referees.set(ref.id, ref);

  wsBroadcaster.broadcast({
    type: 'REFEREE_STATUS_CHANGE',
    data: ref,
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, data: ref });
});

apiRouter.get('/rinks', (req: Request, res: Response) => {
  return res.json({ success: true, data: Array.from(db.rinks.values()) });
});

// ==========================================
// 6. Ranking Engine Endpoints
// ==========================================

apiRouter.get('/rankings', (req: Request, res: Response) => {
  const discipline = (req.query.discipline as Discipline) || 'INDIVIDUAL_TARGET';
  const category = (req.query.category as GenderCategory) || 'MEN';
  const list = rankingEngine.recalculateRankings(discipline, category);
  return res.json({ success: true, data: list });
});

// ==========================================
// 7. KYC Verification & Super Admin Review
// ==========================================

apiRouter.get('/kyc/users', authenticateToken, requireRole(['SUPER_ADMIN']), (req: Request, res: Response) => {
  const list = Array.from(db.users.values()).map(u => ({ ...u, passwordHash: undefined }));
  return res.json({ success: true, data: list });
});

apiRouter.post('/kyc/review', authenticateToken, requireRole(['SUPER_ADMIN']), (req: Request, res: Response) => {
  const { userId, decision, notes, rejectionReason } = req.body;
  const result = serverAuth.reviewKycApplication(
    userId,
    req.user!.id,
    req.user!.fullName,
    decision,
    notes,
    rejectionReason
  );

  if (!result.success) {
    return res.status(400).json({ success: false, error: { code: 'KYC_ERROR', message: result.error } });
  }

  wsBroadcaster.broadcast({
    type: 'KYC_STATUS_CHANGE',
    data: { userId, decision, status: result.user?.status, kycStatus: result.user?.kycStatus },
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, data: result.user });
});

// ==========================================
// 8. Audit Logs & System Settings
// ==========================================

apiRouter.get('/audit', authenticateToken, requireRole(['SUPER_ADMIN', 'GLOBAL_FEDERATION_ADMIN']), (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      auditLogs: db.auditLogs,
      securityLogs: db.securityLogs
    }
  });
});

apiRouter.get('/settings', (req: Request, res: Response) => {
  return res.json({ success: true, data: db.settings });
});

apiRouter.put('/settings', authenticateToken, requirePermission('canConfigureMasterSettings'), (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.fullName,
    userRole: req.user!.role,
    action: 'SYSTEM_SETTING_CHANGED',
    resource: 'MasterFederationSettings',
    newValue: db.settings
  });
  return res.json({ success: true, data: db.settings });
});
