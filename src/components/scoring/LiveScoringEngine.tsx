import React, { useState, useEffect } from 'react';
import { Match, Discipline, UserRole, RefereeProfile, RinkVenueInfo } from '../../types';
import { storage } from '../../services/storageService';
import { OneByOneTeamTargetScorer } from './OneByOneTeamTargetScorer';
import { OneByOneIndividualTargetScorer } from './OneByOneIndividualTargetScorer';
import { OneByOneTeamDistanceScorer } from './OneByOneTeamDistanceScorer';
import { OneByOneIndividualDistanceScorer } from './OneByOneIndividualDistanceScorer';
import { VersusMatchScorer } from './VersusMatchScorer';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Tv, 
  Lock, 
  Unlock, 
  CheckCircle, 
  Clock, 
  Volume2, 
  VolumeX,
  Target,
  Ruler,
  Swords,
  Layers,
  Radio,
  Shield,
  UserCheck,
  MapPin,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface LiveScoringEngineProps {
  initialMatchId?: string;
  onOpenTvMode?: (match: Match) => void;
  onLaunchTVMode?: () => void;
  onNavigateToRinks?: () => void;
}

export const LiveScoringEngine: React.FC<LiveScoringEngineProps> = ({
  initialMatchId,
  onOpenTvMode,
  onLaunchTVMode,
  onNavigateToRinks
}) => {
  const [matches, setMatches] = useState<Match[]>(storage.getMatches());
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    initialMatchId || matches[0]?.id || 'm-live-01'
  );
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(storage.getCurrentUserRole());
  const [isRefereeLocked, setIsRefereeLocked] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [allReferees, setAllReferees] = useState<RefereeProfile[]>(storage.getReferees());
  const [allRinks, setAllRinks] = useState<RinkVenueInfo[]>(storage.getRinks());
  const [isAssigningReferee, setIsAssigningReferee] = useState(false);

  // Check role authorization for referee actions
  const isAuthorizedReferee = ['SUPER_ADMIN', 'REFEREE', 'NATIONAL_HEAD', 'STATE_HEAD'].includes(currentUserRole);

  // Audio Whistle Synthesizer using Web Audio API
  const playWhistleSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(3200, audioCtx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(2800, audioCtx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio context unavailable', e);
    }
  };

  useEffect(() => {
    const unsubMatch = storage.subscribe('matches_updated', (updated: Match[]) => {
      setMatches(updated);
    });
    const unsubRole = storage.subscribe('role_changed', (role: UserRole) => {
      setCurrentUserRole(role);
    });
    return () => {
      unsubMatch();
      unsubRole();
    };
  }, []);

  useEffect(() => {
    const found = matches.find(m => m.id === selectedMatchId) || matches[0];
    if (found) {
      setCurrentMatch(found);
      setIsRefereeLocked(found.status === 'LOCKED_VERIFIED');
    }
  }, [selectedMatchId, matches]);

  // Timer Tick
  useEffect(() => {
    if (!currentMatch?.timer?.isRunning) return;

    const interval = setInterval(() => {
      setCurrentMatch((prev) => {
        if (!prev || !prev.timer.isRunning || prev.timer.currentSeconds <= 0) return prev;
        const nextSec = prev.timer.currentSeconds - 1;
        const updated = {
          ...prev,
          timer: {
            ...prev.timer,
            currentSeconds: nextSec,
            isRunning: nextSec > 0
          }
        };
        if (nextSec === 0) {
          playWhistleSound();
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentMatch?.timer?.isRunning, soundEnabled]);

  if (!currentMatch) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
        No active matches found. Please select or create a tournament match.
      </div>
    );
  }

  const team1Name = currentMatch.team1?.name || currentMatch.player1?.name || 'Team 1';
  const team2Name = currentMatch.team2?.name || currentMatch.player2?.name || 'Team 2';
  const team1Flag = currentMatch.team1?.flag || currentMatch.player1?.flag || '🇩🇪';
  const team2Flag = currentMatch.team2?.flag || currentMatch.player2?.flag || '🇦🇹';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    playWhistleSound();
    const isNowRunning = !currentMatch.timer.isRunning;
    const updated = {
      ...currentMatch,
      timer: {
        ...currentMatch.timer,
        isRunning: isNowRunning
      }
    };
    setCurrentMatch(updated);
    storage.saveMatch(updated);
  };

  const resetTimer = () => {
    const updated = {
      ...currentMatch,
      timer: {
        ...currentMatch.timer,
        currentSeconds: currentMatch.timer.totalSeconds,
        isRunning: false
      }
    };
    setCurrentMatch(updated);
    storage.saveMatch(updated);
  };

  const toggleRefereeLock = () => {
    if (!isAuthorizedReferee) {
      showToastNotification('Access Denied: Only Certified Referees & Super Admins can lock scorecards');
      return;
    }

    const newStatus = isRefereeLocked ? 'LIVE' : 'LOCKED_VERIFIED';
    setIsRefereeLocked(!isRefereeLocked);
    const updated: Match = {
      ...currentMatch,
      status: newStatus,
      auditTrail: [
        ...(currentMatch.auditTrail || []),
        {
          timestamp: new Date().toLocaleTimeString(),
          action: isRefereeLocked 
            ? `Referee score lock released by ${currentUserRole}` 
            : `Official Referee Signed & Certified Match Card (Rule Book Standard)`,
          changedBy: `${currentMatch.refereeName} (${currentUserRole})`
        }
      ]
    };
    setCurrentMatch(updated);
    storage.saveMatch(updated);
    showToastNotification(isRefereeLocked ? 'Score editing unlocked' : 'Match score officially certified & locked');
  };

  const showToastNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleUpdateMatch = (updated: Match) => {
    setCurrentMatch(updated);
    storage.saveMatch(updated);
  };

  // Get Scoreboard Display values based on discipline
  const getScoreboardValues = () => {
    if (currentMatch.discipline === 'TEAM_TARGET') {
      const t1 = (currentMatch.scores.team1TargetPlayers || []).reduce((s, p) => s + p.totalPoints, 0);
      const t2 = (currentMatch.scores.team2TargetPlayers || []).reduce((s, p) => s + p.totalPoints, 0);
      return { t1Score: t1, t2Score: t2, unit: 'pts', max: '/240' };
    }
    if (currentMatch.discipline === 'INDIVIDUAL_TARGET') {
      const t1 = (currentMatch.scores.player1TargetAttempts || []).reduce((s, a) => s + a.points, 0);
      const t2 = (currentMatch.scores.player2TargetAttempts || []).reduce((s, a) => s + a.points, 0);
      return { t1Score: t1, t2Score: t2, unit: 'pts', max: '/240' };
    }
    if (currentMatch.discipline === 'TEAM_DISTANCE') {
      const t1 = (currentMatch.scores.team1DistancePlayers || []).reduce((s, a) => s + (a.bestDistanceMeters || 0), 0);
      const t2 = (currentMatch.scores.team2DistancePlayers || []).reduce((s, a) => s + (a.bestDistanceMeters || 0), 0);
      return { t1Score: parseFloat(t1.toFixed(2)), t2Score: parseFloat(t2.toFixed(2)), unit: 'm', max: 'total' };
    }
    if (currentMatch.discipline === 'INDIVIDUAL_DISTANCE') {
      const p1Id = currentMatch.player1?.id || 'p-3';
      const p2Id = currentMatch.player2?.id || 'p-5';
      const t1 = currentMatch.scores.bestDistance?.[p1Id] || currentMatch.scores.bestDistance?.['p-3'] || 0;
      const t2 = currentMatch.scores.bestDistance?.[p2Id] || currentMatch.scores.bestDistance?.['p-5'] || 0;
      return { t1Score: t1, t2Score: t2, unit: 'm', max: 'best' };
    }
    // Team Game & Head to Head
    return {
      t1Score: currentMatch.scores.team1TotalScore || 0,
      t2Score: currentMatch.scores.team2TotalScore || 0,
      unit: 'pts',
      max: ''
    };
  };

  const scoreboard = getScoreboardValues();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Toast */}
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Match Bar with match selector & global tool buttons */}
      <div className="bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-4 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        {/* Match Select Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" />
              LIVE SCORING ENGINE
            </span>
          </div>

          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-400 font-mono"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.matchNumber} • {m.discipline.replace(/_/g, ' ')} ({m.rinkNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
              soundEnabled ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'
            }`}
            title="Toggle Whistle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              if (onLaunchTVMode) onLaunchTVMode();
              else if (onOpenTvMode && currentMatch) onOpenTvMode(currentMatch);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Tv className="w-4 h-4" />
            <span>TV / LED Display Mode</span>
          </button>

          <button
            onClick={toggleRefereeLock}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isRefereeLocked
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 hover:bg-emerald-500/30'
            }`}
          >
            {isRefereeLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>{isRefereeLocked ? 'Locked & Verified' : 'Sign & Lock Score'}</span>
          </button>
        </div>
      </div>

      {/* Stadium Jumbo Scoreboard Banner */}
      <div className="relative bg-gradient-to-r from-slate-950 via-[#0a1835] to-slate-950 border-2 border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-cyan-500/20 border-b border-x border-cyan-400/40 px-6 py-1 rounded-b-xl text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2">
          <span>{currentMatch.discipline.replace(/_/g, ' ')}</span>
          <span>•</span>
          <span>{currentMatch.stage}</span>
          <span>•</span>
          <span>{currentMatch.rinkNumber}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 mt-4">
          {/* Team 1 Panel */}
          <div className="flex items-center justify-between md:justify-end gap-4">
            <div className="text-left md:text-right">
              <div className="flex items-center md:justify-end gap-2">
                <span className="text-2xl">{team1Flag}</span>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">{team1Name}</h3>
              </div>
              <div className="flex items-center md:justify-end gap-2 mt-0.5">
                <span className="text-xs text-blue-400 font-mono font-semibold">
                  {currentMatch.team1?.club || currentMatch.player1?.club || 'National Squad'}
                </span>
                {(currentMatch.discipline === 'TEAM_GAME' || currentMatch.discipline === 'HEAD_TO_HEAD') && (
                  <span className="text-[10px] font-mono bg-blue-950/80 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
                    Game Pts: {currentMatch.scores.team1GamePoints ?? 0}
                  </span>
                )}
              </div>
            </div>
            <div className="text-4xl md:text-5xl font-black font-mono text-cyan-400 bg-slate-900/90 border-2 border-cyan-500/40 px-5 py-3 rounded-2xl shadow-inner shadow-cyan-500/20 min-w-[90px] text-center">
              {scoreboard.t1Score}
              <span className="text-xs text-slate-500 block font-normal">{scoreboard.unit}</span>
            </div>
          </div>

          {/* Center Digital Match Timer & Whistle Control */}
          <div className="flex flex-col items-center justify-center gap-2 border-y md:border-y-0 md:border-x border-slate-800 py-3 md:py-0 px-4">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>OFFICIAL MATCH CLOCK (IISF)</span>
            </div>
            <div className={`text-4xl md:text-5xl font-mono font-black tracking-widest ${
              currentMatch.timer.currentSeconds < 60 ? 'text-red-400 animate-pulse' : 'text-amber-400'
            }`}>
              {formatTime(currentMatch.timer.currentSeconds)}
            </div>

            {/* Whistle & Clock Buttons */}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={toggleTimer}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95 ${
                  currentMatch.timer.isRunning
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30'
                }`}
              >
                {currentMatch.timer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{currentMatch.timer.isRunning ? 'Whistle (Pause)' : 'Whistle (Start)'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs"
                title="Reset Clock"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Team 2 Panel */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="text-4xl md:text-5xl font-black font-mono text-red-400 bg-slate-900/90 border-2 border-red-500/40 px-5 py-3 rounded-2xl shadow-inner shadow-red-500/20 min-w-[90px] text-center order-2 md:order-1">
              {scoreboard.t2Score}
              <span className="text-xs text-slate-500 block font-normal">{scoreboard.unit}</span>
            </div>
            <div className="text-left order-1 md:order-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">{team2Name}</h3>
                <span className="text-2xl">{team2Flag}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-red-400 font-mono font-semibold">
                  {currentMatch.team2?.club || currentMatch.player2?.club || 'National Squad'}
                </span>
                {(currentMatch.discipline === 'TEAM_GAME' || currentMatch.discipline === 'HEAD_TO_HEAD') && (
                  <span className="text-[10px] font-mono bg-red-950/80 text-red-300 px-1.5 py-0.5 rounded border border-red-800">
                    Game Pts: {currentMatch.scores.team2GamePoints ?? 0}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ON-RINK REFEREE & VENUE TELEMETRY BAR */}
      {(() => {
        const assignedRef = allReferees.find(r => r.id === currentMatch.refereeId);
        const assignedRink = allRinks.find(r => currentMatch.rinkNumber.includes(r.rinkNumber));

        return (
          <div className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">ON-RINK CHIEF REFEREE:</span>
                  {assignedRef ? (
                    <span className="flex items-center gap-1.5 font-bold text-white">
                      <span>{assignedRef.flag}</span>
                      <span>{assignedRef.name}</span>
                      <span className="text-slate-500 text-[10px]">({assignedRef.licenseNumber})</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Unassigned
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>Venue: {assignedRink?.name || currentMatch.rinkNumber}</span>
                  </span>
                  <span>•</span>
                  <span>Temp: {assignedRink?.temperatureCelsius !== undefined ? `${assignedRink.temperatureCelsius}°C` : '-5.2°C'}</span>
                  {currentMatch.umpireName && (
                    <>
                      <span>•</span>
                      <span>Umpire: {currentMatch.umpireName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Referee Presence / Change Controls */}
            <div className="flex items-center gap-2.5">
              {assignedRef ? (
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                    assignedRef.status === 'AVAILABLE_ON_RINK' || assignedRef.status === 'OFFICIATING_MATCH'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-600/40'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {assignedRef.status === 'AVAILABLE_ON_RINK' ? 'Available on Rink' : assignedRef.status === 'OFFICIATING_MATCH' ? 'Active on Ice' : 'On Standby'}
                  </span>

                  {assignedRef.status !== 'AVAILABLE_ON_RINK' && assignedRef.status !== 'OFFICIATING_MATCH' && (
                    <button
                      onClick={() => {
                        storage.setRefereeStatus(assignedRef.id, 'AVAILABLE_ON_RINK');
                        setAllReferees(storage.getReferees());
                        showToastNotification('Referee marked available on rink!');
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Check In</span>
                    </button>
                  )}
                </div>
              ) : null}

              {isAssigningReferee ? (
                <div className="flex items-center gap-1.5">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        storage.assignRefereeToMatch(currentMatch.id, e.target.value);
                        setAllReferees(storage.getReferees());
                        setMatches(storage.getMatches());
                        setIsAssigningReferee(false);
                        showToastNotification('Referee assigned to match!');
                      }
                    }}
                    className="bg-slate-950 border border-cyan-400 text-white rounded-lg px-2 py-1 text-xs"
                    defaultValue=""
                  >
                    <option value="" disabled>Select Certified Referee...</option>
                    {allReferees.map(r => (
                      <option key={r.id} value={r.id}>{r.flag} {r.name} ({r.licenseNumber})</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsAssigningReferee(false)}
                    className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAssigningReferee(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition-all"
                >
                  {assignedRef ? 'Change Official' : '+ Assign Referee'}
                </button>
              )}

              {onNavigateToRinks && (
                <button
                  onClick={onNavigateToRinks}
                  className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-xl text-xs font-bold transition-all"
                >
                  Rink Matrix →
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* DISCIPLINE-SPECIFIC SCORING ENGINES (ONE-BY-ONE vs VERSUS) */}
      {currentMatch.discipline === 'TEAM_TARGET' && (
        <OneByOneTeamTargetScorer
          match={currentMatch}
          isRefereeLocked={isRefereeLocked}
          onUpdateMatch={handleUpdateMatch}
          onShowToast={showToastNotification}
        />
      )}

      {currentMatch.discipline === 'INDIVIDUAL_TARGET' && (
        <OneByOneIndividualTargetScorer
          match={currentMatch}
          isRefereeLocked={isRefereeLocked}
          onUpdateMatch={handleUpdateMatch}
          onShowToast={showToastNotification}
        />
      )}

      {currentMatch.discipline === 'TEAM_DISTANCE' && (
        <OneByOneTeamDistanceScorer
          match={currentMatch}
          isRefereeLocked={isRefereeLocked}
          onUpdateMatch={handleUpdateMatch}
          onShowToast={showToastNotification}
        />
      )}

      {currentMatch.discipline === 'INDIVIDUAL_DISTANCE' && (
        <OneByOneIndividualDistanceScorer
          match={currentMatch}
          isRefereeLocked={isRefereeLocked}
          onUpdateMatch={handleUpdateMatch}
          onShowToast={showToastNotification}
        />
      )}

      {(currentMatch.discipline === 'TEAM_GAME' || currentMatch.discipline === 'HEAD_TO_HEAD') && (
        <VersusMatchScorer
          match={currentMatch}
          isRefereeLocked={isRefereeLocked}
          onUpdateMatch={handleUpdateMatch}
          onShowToast={showToastNotification}
        />
      )}
    </div>
  );
};
