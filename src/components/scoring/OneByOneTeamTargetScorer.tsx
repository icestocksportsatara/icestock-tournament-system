import React, { useState } from 'react';
import { Match, PlayerTargetScore, TargetAttempt } from '../../types';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  ChevronRight, 
  Award, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  Flame,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface OneByOneTeamTargetScorerProps {
  match: Match;
  isRefereeLocked: boolean;
  onUpdateMatch: (updatedMatch: Match) => void;
  onShowToast: (msg: string) => void;
}

export const OneByOneTeamTargetScorer: React.FC<OneByOneTeamTargetScorerProps> = ({
  match,
  isRefereeLocked,
  onUpdateMatch,
  onShowToast
}) => {
  const [activeTeamKey, setActiveTeamKey] = useState<'team1' | 'team2'>('team1');
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [selectedShotNumber, setSelectedShotNumber] = useState<number>(1);
  const [currentShotInput, setCurrentShotInput] = useState<number | null>(null);

  // Initialize or fetch team 1 and team 2 target player lists
  const defaultTeam1Players: PlayerTargetScore[] = match.scores.team1TargetPlayers || [
    {
      playerId: 'p-1',
      playerName: match.team1?.playerIds?.[0] ? 'Stefan Zellermayer' : 'Player 1 (Lead)',
      playerNumber: 1,
      role: 'Round 1: Center Target',
      isDone: false,
      totalPoints: 0,
      attempts: []
    },
    {
      playerId: 'p-ger-2',
      playerName: 'Christian Obermeier',
      playerNumber: 2,
      role: 'Round 2: Clearance',
      isDone: false,
      totalPoints: 0,
      attempts: []
    },
    {
      playerId: 'p-ger-3',
      playerName: 'Florian Marchl',
      playerNumber: 3,
      role: 'Round 3: Corner Rings',
      isDone: false,
      totalPoints: 0,
      attempts: []
    },
    {
      playerId: 'p-ger-4',
      playerName: 'Max Schedlbauer',
      playerNumber: 4,
      role: 'Round 4: Combine Deflection',
      isDone: false,
      totalPoints: 0,
      attempts: []
    }
  ];

  const defaultTeam2Players: PlayerTargetScore[] = match.scores.team2TargetPlayers || [
    {
      playerId: 'p-2',
      playerName: match.team2?.playerIds?.[0] ? 'Simone Steiner' : 'Player 1 (Lead)',
      playerNumber: 1,
      role: 'Round 1: Center Target',
      isDone: false,
      totalPoints: 0,
      attempts: []
    },
    {
      playerId: 'p-aut-2',
      playerName: 'Franz Roth',
      playerNumber: 2,
      role: 'Round 2: Clearance',
      isDone: false,
      totalPoints: 0,
      attempts: []
    },
    {
      playerId: 'p-aut-3',
      playerName: 'Matthias Taxacher',
      playerNumber: 3,
      role: 'Round 3: Corner Rings',
      isDone: false,
      totalPoints: 0,
      attempts: []
    },
    {
      playerId: 'p-aut-4',
      playerName: 'Peter Schwarz',
      playerNumber: 4,
      role: 'Round 4: Combine Deflection',
      isDone: false,
      totalPoints: 0,
      attempts: []
    }
  ];

  const currentPlayers = activeTeamKey === 'team1' ? defaultTeam1Players : defaultTeam2Players;
  const activePlayer = currentPlayers[activePlayerIndex] || currentPlayers[0];

  const team1Name = match.team1?.name || 'Team 1';
  const team2Name = match.team2?.name || 'Team 2';
  const team1Short = match.team1?.shortName || 'T1';
  const team2Short = match.team2?.shortName || 'T2';

  // Calculate team total scores
  const team1Total = defaultTeam1Players.reduce((sum, p) => sum + p.totalPoints, 0);
  const team2Total = defaultTeam2Players.reduce((sum, p) => sum + p.totalPoints, 0);

  // Helper for round info based on player index
  const getRoundInfo = (playerIdx: number) => {
    switch (playerIdx) {
      case 0:
        return {
          roundNumber: 1,
          name: 'Round 1: Center Target',
          desc: 'Place stock close to center cross',
          pointsOptions: [0, 2, 4, 6, 8, 10],
          targetType: 'CENTER_RINGS' as const
        };
      case 1:
        return {
          roundNumber: 2,
          name: 'Round 2: Clearance',
          desc: 'Hit & move target Icestock out of circles (10 own inside, 5 both out, 2 both in, 0 miss)',
          pointsOptions: [0, 2, 5, 10],
          targetType: 'CLEARANCE' as const
        };
      case 2:
        return {
          roundNumber: 3,
          name: 'Round 3: Corner Rings',
          desc: '3 attempts back left + 3 attempts back right',
          pointsOptions: [0, 2, 4, 6, 8, 10],
          targetType: 'CORNER_RINGS' as const
        };
      case 3:
      default:
        return {
          roundNumber: 4,
          name: 'Round 4: Combine Deflection',
          desc: 'Center placement & rear ring deflection',
          pointsOptions: [0, 2, 4, 6, 8, 10],
          targetType: 'COMBINE' as const
        };
    }
  };

  const roundInfo = getRoundInfo(activePlayerIndex);

  // Save single shot score
  const handleSaveShot = (points: number) => {
    if (isRefereeLocked) return;

    const teamKey = activeTeamKey === 'team1' ? 'team1TargetPlayers' : 'team2TargetPlayers';
    const updatedList = [...(activeTeamKey === 'team1' ? defaultTeam1Players : defaultTeam2Players)];
    const p = { ...updatedList[activePlayerIndex] };
    const attempts = [...p.attempts];

    const newAttempt: TargetAttempt = {
      roundNumber: roundInfo.roundNumber,
      attemptNumber: selectedShotNumber,
      targetType: roundInfo.targetType,
      points,
      timeSeconds: 20,
      refereeConfirmed: true,
      isDone: true
    };

    const existingIdx = attempts.findIndex(a => a.attemptNumber === selectedShotNumber);
    if (existingIdx >= 0) {
      attempts[existingIdx] = newAttempt;
    } else {
      attempts.push(newAttempt);
    }

    p.attempts = attempts;
    p.totalPoints = attempts.reduce((sum, a) => sum + a.points, 0);
    updatedList[activePlayerIndex] = p;

    const t1Sum = activeTeamKey === 'team1' ? updatedList.reduce((s, x) => s + x.totalPoints, 0) : team1Total;
    const t2Sum = activeTeamKey === 'team2' ? updatedList.reduce((s, x) => s + x.totalPoints, 0) : team2Total;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        [teamKey]: updatedList,
        team1TotalScore: t1Sum,
        team2TotalScore: t2Sum
      }
    };

    onUpdateMatch(updatedMatch);
    onShowToast(`Recorded ${points} pts for Shot ${selectedShotNumber} (${p.playerName})`);

    // Auto advance shot if < 6
    if (selectedShotNumber < 6) {
      setSelectedShotNumber(selectedShotNumber + 1);
    }
  };

  // Mark Active Player as DONE
  const handleMarkPlayerDone = () => {
    if (isRefereeLocked) return;

    const teamKey = activeTeamKey === 'team1' ? 'team1TargetPlayers' : 'team2TargetPlayers';
    const updatedList = [...(activeTeamKey === 'team1' ? defaultTeam1Players : defaultTeam2Players)];
    const p = { ...updatedList[activePlayerIndex] };

    p.isDone = true;
    p.totalPoints = p.attempts.reduce((sum, a) => sum + a.points, 0);
    updatedList[activePlayerIndex] = p;

    const t1Sum = activeTeamKey === 'team1' ? updatedList.reduce((s, x) => s + x.totalPoints, 0) : team1Total;
    const t2Sum = activeTeamKey === 'team2' ? updatedList.reduce((s, x) => s + x.totalPoints, 0) : team2Total;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        [teamKey]: updatedList,
        team1TotalScore: t1Sum,
        team2TotalScore: t2Sum
      }
    };

    onUpdateMatch(updatedMatch);
    onShowToast(`✓ ${p.playerName} marked DONE with ${p.totalPoints} pts!`);

    // Advance to next player if available
    if (activePlayerIndex < 3) {
      setActivePlayerIndex(activePlayerIndex + 1);
      setSelectedShotNumber(1);
    } else {
      onShowToast(`All 4 players of ${activeTeamKey === 'team1' ? team1Short : team2Short} completed!`);
    }
  };

  // Reset player attempts
  const handleResetPlayer = () => {
    if (isRefereeLocked) return;

    const teamKey = activeTeamKey === 'team1' ? 'team1TargetPlayers' : 'team2TargetPlayers';
    const updatedList = [...(activeTeamKey === 'team1' ? defaultTeam1Players : defaultTeam2Players)];
    const p = { ...updatedList[activePlayerIndex] };

    p.attempts = [];
    p.totalPoints = 0;
    p.isDone = false;
    updatedList[activePlayerIndex] = p;

    const t1Sum = activeTeamKey === 'team1' ? updatedList.reduce((s, x) => s + x.totalPoints, 0) : team1Total;
    const t2Sum = activeTeamKey === 'team2' ? updatedList.reduce((s, x) => s + x.totalPoints, 0) : team2Total;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        [teamKey]: updatedList,
        team1TotalScore: t1Sum,
        team2TotalScore: t2Sum
      }
    };

    onUpdateMatch(updatedMatch);
    setSelectedShotNumber(1);
    onShowToast(`Reset attempts for ${p.playerName}`);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
      {/* Header with Discipline and Done System Badge */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Team Target One-by-One Scoring Engine
              </h3>
              <span className="text-[11px] font-mono bg-cyan-950/90 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                ONE-BY-ONE "DONE" SYSTEM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official IISF Rule: 4 athletes per squad score one by one through 4 distinct target rounds (6 shots/player • 60 pts max • 240 pts team max)
            </p>
          </div>
        </div>

        {/* Live Aggregate Team Scores Pill */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-blue-400 font-bold uppercase">{team1Short} TEAM</span>
            <div className="text-xl font-black text-white">{team1Total} <span className="text-xs text-slate-500 font-normal">pts</span></div>
          </div>
          <span className="text-slate-600 font-black text-lg">:</span>
          <div className="text-left">
            <span className="text-[10px] text-red-400 font-bold uppercase">{team2Short} TEAM</span>
            <div className="text-xl font-black text-white">{team2Total} <span className="text-xs text-slate-500 font-normal">pts</span></div>
          </div>
        </div>
      </div>

      {/* Team Selection Switcher */}
      <div className="grid grid-cols-2 gap-3 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => {
            setActiveTeamKey('team1');
            setActivePlayerIndex(0);
            setSelectedShotNumber(1);
          }}
          className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-between transition-all ${
            activeTeamKey === 'team1'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{match.team1?.flag || '🇩🇪'}</span>
            <span>{team1Name}</span>
          </div>
          <span className="font-mono font-black text-base">{team1Total} pts</span>
        </button>

        <button
          onClick={() => {
            setActiveTeamKey('team2');
            setActivePlayerIndex(0);
            setSelectedShotNumber(1);
          }}
          className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-between transition-all ${
            activeTeamKey === 'team2'
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{match.team2?.flag || '🇦🇹'}</span>
            <span>{team2Name}</span>
          </div>
          <span className="font-mono font-black text-base">{team2Total} pts</span>
        </button>
      </div>

      {/* 4-Player Stepper Timeline (One-by-One Progression) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {currentPlayers.map((player, idx) => {
          const isSelected = activePlayerIndex === idx;
          const isDone = player.isDone || player.attempts.length === 6;
          const playerRound = getRoundInfo(idx);

          return (
            <div
              key={player.playerId || idx}
              onClick={() => {
                setActivePlayerIndex(idx);
                setSelectedShotNumber(1);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-500/30 shadow-xl'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-800/80 hover:border-emerald-700'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    PLAYER {idx + 1} OF 4
                  </span>
                  {isDone ? (
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> DONE
                    </span>
                  ) : isSelected ? (
                    <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-bold animate-pulse flex items-center gap-1">
                      🎯 ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">WAITING</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{player.playerName}</h4>
                <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{playerRound.name}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{player.attempts.length}/6 shots</span>
                <span className="text-base font-black text-white">{player.totalPoints} <span className="text-[10px] text-slate-400 font-normal">/60 pts</span></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Athlete Detailed One-by-One Input Station */}
      <div className="bg-slate-950/90 border-2 border-cyan-500/30 rounded-3xl p-6 flex flex-col gap-6 shadow-inner">
        {/* Active Athlete Banner */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-black text-xl font-mono text-cyan-300">
              #{activePlayerIndex + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-white">{activePlayer.playerName}</h4>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {activeTeamKey === 'team1' ? team1Name : team2Name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {roundInfo.name} • {roundInfo.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Player Total</span>
              <div className="text-2xl font-black text-cyan-400">{activePlayer.totalPoints} / 60 pts</div>
            </div>

            <button
              onClick={handleResetPlayer}
              disabled={isRefereeLocked}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 text-xs transition-colors disabled:opacity-40"
              title="Reset Player Shots"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Shots Matrix for Active Athlete */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((shotNum) => {
            const attempt = activePlayer.attempts.find(a => a.attemptNumber === shotNum);
            const isCurrentShot = selectedShotNumber === shotNum;
            const hasScore = attempt !== undefined;

            return (
              <div
                key={shotNum}
                onClick={() => setSelectedShotNumber(shotNum)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-between gap-2 text-center ${
                  isCurrentShot
                    ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : hasScore
                    ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-400 font-bold">
                  SHOT {shotNum} {roundInfo.roundNumber === 3 ? (shotNum <= 3 ? '(Left)' : '(Right)') : ''}
                </div>

                <div className="text-2xl font-black font-mono">
                  {hasScore ? (
                    <span className="text-cyan-300">{attempt.points} <span className="text-[10px] font-normal text-slate-400">pts</span></span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </div>

                <div className="text-[10px] font-mono">
                  {hasScore ? (
                    <span className="text-emerald-400 flex items-center gap-0.5 justify-center">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="text-slate-500">Tap to score</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Shot Scoring Ring Buttons with "Done" Confirmation */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Enter Score for Shot #{selectedShotNumber} of 6
            </span>
            <span className="text-xs font-mono text-slate-400">
              {roundInfo.name}
            </span>
          </div>

          {/* Point Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {roundInfo.pointsOptions.map((pts) => {
              const currentAttempt = activePlayer.attempts.find(a => a.attemptNumber === selectedShotNumber);
              const isSelectedPt = currentAttempt?.points === pts;

              return (
                <button
                  key={pts}
                  onClick={() => handleSaveShot(pts)}
                  disabled={isRefereeLocked}
                  className={`py-3.5 rounded-xl font-mono font-black text-lg transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 disabled:opacity-40 ${
                    isSelectedPt
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 ring-2 ring-white font-black'
                      : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{pts}</span>
                  <span className="text-[10px] font-normal text-slate-400 font-sans">
                    {pts === 10 ? 'Bullseye / Clean' : pts === 0 ? 'Miss (0)' : `${pts} Rings`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* DEDICATED DONE ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            {/* Advance Shot Button */}
            <button
              onClick={() => {
                if (selectedShotNumber < 6) {
                  setSelectedShotNumber(selectedShotNumber + 1);
                } else {
                  handleMarkPlayerDone();
                }
              }}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <span>{selectedShotNumber < 6 ? `✓ Next Shot (${selectedShotNumber + 1}/6)` : '✓ Complete All 6 Shots'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Complete Athlete & Advance to Next Player ("DONE" SYSTEM) */}
            <button
              onClick={handleMarkPlayerDone}
              disabled={isRefereeLocked}
              className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
            >
              <UserCheck className="w-4 h-4" />
              <span>✓ Mark Player #{activePlayerIndex + 1} DONE & Advance ({activePlayer.totalPoints} pts)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
