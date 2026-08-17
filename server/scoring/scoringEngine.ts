import { db, DbScoreAttempt, DbScorecard } from '../db/database.js';
import { Match, TargetAttempt, DistanceAttempt, GameEnd, StockPosition } from '../../src/types/index.js';

export interface ScoreUpdatePayload {
  endData?: GameEnd;
  targetAttempt?: TargetAttempt & { playerId: string; roundNumber: number };
  distanceAttempt?: DistanceAttempt & { participantId: string };
  timerUpdate?: {
    currentSeconds: number;
    isRunning: boolean;
    timeoutUsedTeam1: number;
    timeoutUsedTeam2: number;
  };
}

export class ScoringEngine {
  /**
   * Validates and applies a score update to a match
   */
  public recordScoreUpdate(
    matchId: string,
    payload: ScoreUpdatePayload,
    actorId: string,
    actorName: string,
    isOverride = false,
    overrideReason?: string
  ): { success: boolean; error?: string; match?: Match } {
    const match = db.matches.get(matchId);
    if (!match) {
      return { success: false, error: 'Match not found in tournament schedule.' };
    }

    // Check scorecard lock state
    if (match.status === 'LOCKED_VERIFIED' && !isOverride) {
      return {
        success: false,
        error: 'Scorecard is LOCKED & VERIFIED. Further score modifications require an authorized administrative override.'
      };
    }

    const previousSnapshot = JSON.stringify(match.scores);

    // 1. Process Team Game End
    if (payload.endData) {
      if (!match.scores.ends) {
        match.scores.ends = [];
      }
      const existingIdx = match.scores.ends.findIndex(e => e.endNumber === payload.endData!.endNumber);
      if (existingIdx !== -1) {
        match.scores.ends[existingIdx] = payload.endData;
      } else {
        match.scores.ends.push(payload.endData);
      }

      // Recalculate totals
      let t1Total = 0;
      let t2Total = 0;
      for (const end of match.scores.ends) {
        t1Total += end.team1Score || 0;
        t2Total += end.team2Score || 0;
      }

      match.scores.team1TotalScore = t1Total;
      match.scores.team2TotalScore = t2Total;

      if (t1Total > t2Total) {
        match.scores.team1GamePoints = 2;
        match.scores.team2GamePoints = 0;
        match.winnerId = match.team1Id;
      } else if (t2Total > t1Total) {
        match.scores.team1GamePoints = 0;
        match.scores.team2GamePoints = 2;
        match.winnerId = match.team2Id;
      } else {
        match.scores.team1GamePoints = 1;
        match.scores.team2GamePoints = 1;
        match.winnerId = undefined;
      }

      // Record in ScoreAttempts
      const attempt: DbScoreAttempt = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        matchId: match.id,
        roundNumber: payload.endData.endNumber,
        attemptNumber: 1,
        participantId: t1Total >= t2Total ? match.team1Id || 'T1' : match.team2Id || 'T2',
        pointsAwarded: Math.max(payload.endData.team1Score, payload.endData.team2Score),
        isValid: true,
        refereeConfirmed: true,
        timestamp: new Date().toISOString()
      };
      const existingAttempts = db.scoreAttempts.get(match.id) || [];
      existingAttempts.push(attempt);
      db.scoreAttempts.set(match.id, existingAttempts);
    }

    // 2. Process Target Scoring Attempt (4 rounds x 6 shots = 24 shots)
    if (payload.targetAttempt) {
      const { playerId, roundNumber, attemptNumber, points, targetType } = payload.targetAttempt;
      
      // Validate points range per discipline rules
      const sanitizedPoints = Math.max(0, Math.min(10, points || 0));

      if (match.discipline === 'INDIVIDUAL_TARGET') {
        const isPlayer1 = match.player1Id === playerId;
        const attemptsList = isPlayer1
          ? match.scores.player1TargetAttempts || []
          : match.scores.player2TargetAttempts || [];

        const targetAttemptObj: TargetAttempt = {
          roundNumber,
          attemptNumber,
          targetType,
          points: sanitizedPoints,
          timeSeconds: payload.targetAttempt.timeSeconds || 15,
          refereeConfirmed: true,
          isDone: true
        };

        const existingIdx = attemptsList.findIndex(
          a => a.roundNumber === roundNumber && a.attemptNumber === attemptNumber
        );
        if (existingIdx !== -1) {
          attemptsList[existingIdx] = targetAttemptObj;
        } else {
          attemptsList.push(targetAttemptObj);
        }

        if (isPlayer1) {
          match.scores.player1TargetAttempts = attemptsList;
        } else {
          match.scores.player2TargetAttempts = attemptsList;
        }

        // Calculate Target Total Points
        let p1Total = 0;
        let p2Total = 0;
        match.scores.player1TargetAttempts?.forEach(a => { p1Total += a.points; });
        match.scores.player2TargetAttempts?.forEach(a => { p2Total += a.points; });

        match.scores.team1TotalScore = p1Total;
        match.scores.team2TotalScore = p2Total;

        if (p1Total > p2Total) {
          match.winnerId = match.player1Id;
        } else if (p2Total > p1Total) {
          match.winnerId = match.player2Id;
        }
      }
    }

    // 3. Process Distance Scoring Attempt (5 attempts per athlete)
    if (payload.distanceAttempt) {
      const { participantId, attemptNumber, distanceMeters, isValid } = payload.distanceAttempt;
      if (!match.scores.distanceAttempts) {
        match.scores.distanceAttempts = {};
      }
      if (!match.scores.distanceAttempts[participantId]) {
        match.scores.distanceAttempts[participantId] = [];
      }

      const list = match.scores.distanceAttempts[participantId];
      const attemptObj: DistanceAttempt = {
        attemptNumber,
        distanceMeters: isValid ? Math.max(0, distanceMeters) : 0,
        isValid,
        windSpeedKmh: payload.distanceAttempt.windSpeedKmh || 0,
        iceTempCelsius: payload.distanceAttempt.iceTempCelsius || -3.5,
        speedKmh: payload.distanceAttempt.speedKmh || 45,
        isDone: true
      };

      const existingIdx = list.findIndex(a => a.attemptNumber === attemptNumber);
      if (existingIdx !== -1) {
        list[existingIdx] = attemptObj;
      } else {
        list.push(attemptObj);
      }

      // Calculate Best Valid Distance
      let bestDist = 0;
      for (const a of list) {
        if (a.isValid && a.distanceMeters > bestDist) {
          bestDist = a.distanceMeters;
        }
      }

      if (!match.scores.bestDistance) {
        match.scores.bestDistance = {};
      }
      match.scores.bestDistance[participantId] = bestDist;
    }

    // 4. Process Match Timer Update
    if (payload.timerUpdate) {
      match.timer.currentSeconds = payload.timerUpdate.currentSeconds;
      match.timer.isRunning = payload.timerUpdate.isRunning;
      match.timer.timeoutUsedTeam1 = payload.timerUpdate.timeoutUsedTeam1;
      match.timer.timeoutUsedTeam2 = payload.timerUpdate.timeoutUsedTeam2;
    }

    // Audit Trail Update
    match.auditTrail.push({
      timestamp: new Date().toISOString(),
      action: isOverride ? 'ADMIN_SCORE_OVERRIDE' : 'SCORE_UPDATED',
      changedBy: `${actorName} (${actorId})`
    });

    db.matches.set(match.id, match);

    // Update Persistent Scorecard
    const scorecard: DbScorecard = {
      id: `sc-${match.id}`,
      matchId: match.id,
      scoringSystem: match.scores.scoringSystem || 'IISF_STANDARD_1PT',
      state: match.status === 'LOCKED_VERIFIED' ? 'LOCKED' : 'DRAFT',
      rawScoreData: match.scores,
      updatedAt: new Date().toISOString()
    };
    db.scorecards.set(scorecard.id, scorecard);

    if (isOverride) {
      db.logAudit({
        userId: actorId,
        userName: actorName,
        userRole: 'SUPER_ADMIN',
        action: 'SCORE_OVERRIDE',
        resource: 'Match',
        resourceId: match.id,
        oldValue: previousSnapshot,
        newValue: JSON.stringify(match.scores),
        reason: overrideReason || 'Official Rule Review Override'
      });
    }

    return { success: true, match };
  }

  /**
   * Sets match and scorecard lock state (Referee Verification & Lock)
   */
  public lockScorecard(
    matchId: string,
    newState: 'SUBMITTED' | 'CHIEF_REFEREE_REVIEW' | 'VERIFIED' | 'LOCKED',
    refereeId: string,
    refereeName: string
  ): { success: boolean; error?: string; match?: Match } {
    const match = db.matches.get(matchId);
    if (!match) {
      return { success: false, error: 'Match not found.' };
    }

    if (newState === 'LOCKED' || newState === 'VERIFIED') {
      match.status = 'LOCKED_VERIFIED';
    }

    match.auditTrail.push({
      timestamp: new Date().toISOString(),
      action: `SCORECARD_STATE_${newState}`,
      changedBy: `${refereeName} (${refereeId})`
    });

    db.matches.set(match.id, match);

    const scorecard = db.scorecards.get(`sc-${match.id}`) || {
      id: `sc-${match.id}`,
      matchId: match.id,
      scoringSystem: match.scores.scoringSystem || 'IISF_STANDARD_1PT',
      state: newState,
      rawScoreData: match.scores,
      updatedAt: new Date().toISOString()
    };

    scorecard.state = newState;
    scorecard.verifiedAt = new Date().toISOString();
    scorecard.verifiedByRefereeId = refereeId;
    scorecard.verifiedByRefereeName = refereeName;
    if (newState === 'LOCKED') {
      scorecard.lockedAt = new Date().toISOString();
      scorecard.lockedByAdminId = refereeId;
    }
    db.scorecards.set(scorecard.id, scorecard);

    db.logAudit({
      userId: refereeId,
      userName: refereeName,
      userRole: 'CHIEF_REFEREE',
      action: 'SCORE_VERIFIED_LOCKED',
      resource: 'Match',
      resourceId: match.id,
      newValue: { state: newState, matchNumber: match.matchNumber }
    });

    return { success: true, match };
  }
}

export const scoringEngine = new ScoringEngine();
