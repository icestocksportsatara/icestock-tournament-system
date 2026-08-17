import React, { useState } from 'react';
import { Match, TargetAttempt } from '../../types';
import { 
  Target, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw, 
  UserCheck, 
  ArrowRight, 
  Award,
  Layers
} from 'lucide-react';

interface OneByOneIndividualTargetScorerProps {
  match: Match;
  isRefereeLocked: boolean;
  onUpdateMatch: (updatedMatch: Match) => void;
  onShowToast: (msg: string) => void;
}

export const OneByOneIndividualTargetScorer: React.FC<OneByOneIndividualTargetScorerProps> = ({
  match,
  isRefereeLocked,
  onUpdateMatch,
  onShowToast
}) => {
  const [activeCompetitorIndex, setActiveCompetitorIndex] = useState<1 | 2>(1);
  const [activeRound, setActiveRound] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAttemptNumber, setSelectedAttemptNumber] = useState<number>(1);

  const competitor1Name = match.player1?.name || match.team1?.name || 'Competitor 1';
  const competitor2Name = match.player2?.name || match.team2?.name || 'Competitor 2';
  const competitor1Flag = match.player1?.flag || match.team1?.flag || '🇩🇪';
  const competitor2Flag = match.player2?.flag || match.team2?.flag || '🇦🇹';

  const p1Attempts = match.scores.player1TargetAttempts || [];
  const p2Attempts = match.scores.player2TargetAttempts || [];

  const currentAttempts = activeCompetitorIndex === 1 ? p1Attempts : p2Attempts;

  // Round Info definition (IISF Standard)
  const getRoundDetails = (r: 1 | 2 | 3 | 4) => {
    switch (r) {
      case 1:
        return {
          title: 'Round 1: Center Target (Cross)',
          desc: 'Place stock closest to center cross',
          pointsOptions: [0, 2, 4, 6, 8, 10],
          targetType: 'CENTER_RINGS' as const
        };
      case 2:
        return {
          title: 'Round 2: Clearance & Knockout',
          desc: '10 pts (own stock inside), 5 pts (both outside), 2 pts (both inside), 0 pts (miss)',
          pointsOptions: [0, 2, 5, 10],
          targetType: 'CLEARANCE' as const
        };
      case 3:
        return {
          title: 'Round 3: Rear Corner Rings',
          desc: '3 shots rear left + 3 shots rear right circles',
          pointsOptions: [0, 2, 4, 6, 8, 10],
          targetType: 'CORNER_RINGS' as const
        };
      case 4:
      default:
        return {
          title: 'Round 4: Combination Deflection',
          desc: 'Center placement & deflection towards rear rings',
          pointsOptions: [0, 2, 4, 6, 8, 10],
          targetType: 'COMBINE' as const
        };
    }
  };

  const currentRoundDetails = getRoundDetails(activeRound);

  // Compute breakdown scores for athlete
  const computeRoundScores = (attempts: TargetAttempt[]) => {
    const r1 = attempts.filter(a => a.roundNumber === 1 || (!a.roundNumber && a.attemptNumber <= 6)).reduce((s, a) => s + a.points, 0);
    const r2 = attempts.filter(a => a.roundNumber === 2 || (!a.roundNumber && a.attemptNumber > 6 && a.attemptNumber <= 12)).reduce((s, a) => s + a.points, 0);
    const r3 = attempts.filter(a => a.roundNumber === 3 || (!a.roundNumber && a.attemptNumber > 12 && a.attemptNumber <= 18)).reduce((s, a) => s + a.points, 0);
    const r4 = attempts.filter(a => a.roundNumber === 4 || (!a.roundNumber && a.attemptNumber > 18 && a.attemptNumber <= 24)).reduce((s, a) => s + a.points, 0);
    const total = r1 + r2 + r3 + r4;
    return { r1, r2, r3, r4, total };
  };

  const p1Scores = computeRoundScores(p1Attempts);
  const p2Scores = computeRoundScores(p2Attempts);
  const currentScores = activeCompetitorIndex === 1 ? p1Scores : p2Scores;

  // Save shot score
  const handleScoreShot = (points: number) => {
    if (isRefereeLocked) return;

    const attemptsKey = activeCompetitorIndex === 1 ? 'player1TargetAttempts' : 'player2TargetAttempts';
    const updatedAttempts = [...(match.scores[attemptsKey] || [])];

    const overallShotNum = (activeRound - 1) * 6 + selectedAttemptNumber;

    const newAttempt: TargetAttempt = {
      roundNumber: activeRound,
      attemptNumber: selectedAttemptNumber,
      targetType: currentRoundDetails.targetType,
      points,
      timeSeconds: 25,
      refereeConfirmed: true,
      isDone: true
    };

    const existingIdx = updatedAttempts.findIndex(
      a => (a.roundNumber === activeRound && a.attemptNumber === selectedAttemptNumber) || a.attemptNumber === overallShotNum
    );

    if (existingIdx >= 0) {
      updatedAttempts[existingIdx] = newAttempt;
    } else {
      updatedAttempts.push(newAttempt);
    }

    const updatedP1 = activeCompetitorIndex === 1 ? updatedAttempts : p1Attempts;
    const updatedP2 = activeCompetitorIndex === 2 ? updatedAttempts : p2Attempts;

    const t1Total = computeRoundScores(updatedP1).total;
    const t2Total = computeRoundScores(updatedP2).total;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        [attemptsKey]: updatedAttempts,
        team1TotalScore: t1Total,
        team2TotalScore: t2Total
      }
    };

    onUpdateMatch(updatedMatch);
    onShowToast(`Recorded ${points} pts for Shot ${selectedAttemptNumber} (Round ${activeRound})`);

    // Auto-step to next shot
    if (selectedAttemptNumber < 6) {
      setSelectedAttemptNumber(selectedAttemptNumber + 1);
    }
  };

  // Mark Active Round or Competitor as DONE
  const handleMarkRoundDone = () => {
    if (isRefereeLocked) return;

    const athleteName = activeCompetitorIndex === 1 ? competitor1Name : competitor2Name;
    const roundScore = activeRound === 1 ? currentScores.r1 : activeRound === 2 ? currentScores.r2 : activeRound === 3 ? currentScores.r3 : currentScores.r4;

    onShowToast(`✓ Round ${activeRound} marked DONE for ${athleteName} (${roundScore} / 60 pts)`);

    if (activeRound < 4) {
      setActiveRound((activeRound + 1) as 1 | 2 | 3 | 4);
      setSelectedAttemptNumber(1);
    } else {
      onShowToast(`✓ ${athleteName} completed all 4 rounds! Final: ${currentScores.total} / 240 pts`);
      if (activeCompetitorIndex === 1) {
        setActiveCompetitorIndex(2);
        setActiveRound(1);
        setSelectedAttemptNumber(1);
      }
    }
  };

  // Reset current round
  const handleResetRound = () => {
    if (isRefereeLocked) return;

    const attemptsKey = activeCompetitorIndex === 1 ? 'player1TargetAttempts' : 'player2TargetAttempts';
    const filtered = (match.scores[attemptsKey] || []).filter(a => a.roundNumber !== activeRound);

    const updatedP1 = activeCompetitorIndex === 1 ? filtered : p1Attempts;
    const updatedP2 = activeCompetitorIndex === 2 ? filtered : p2Attempts;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        [attemptsKey]: filtered,
        team1TotalScore: computeRoundScores(updatedP1).total,
        team2TotalScore: computeRoundScores(updatedP2).total
      }
    };

    onUpdateMatch(updatedMatch);
    setSelectedAttemptNumber(1);
    onShowToast(`Reset Round ${activeRound} attempts`);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
      {/* Header with Done System Badge */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Individual Target One-by-One Scoring Engine
              </h3>
              <span className="text-[11px] font-mono bg-cyan-950/90 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                ONE-BY-ONE "DONE" SYSTEM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Each athlete takes turn shooting through 4 official rounds (6 shots/round • 60 pts max • 240 pts total)
            </p>
          </div>
        </div>

        {/* Global Match Standing Pill */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-blue-400 font-bold uppercase">{competitor1Name}</span>
            <div className="text-xl font-black text-white">{p1Scores.total} <span className="text-xs text-slate-500 font-normal">/240</span></div>
          </div>
          <span className="text-slate-600 font-black text-lg">:</span>
          <div className="text-left">
            <span className="text-[10px] text-red-400 font-bold uppercase">{competitor2Name}</span>
            <div className="text-xl font-black text-white">{p2Scores.total} <span className="text-xs text-slate-500 font-normal">/240</span></div>
          </div>
        </div>
      </div>

      {/* Competitor Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => {
            setActiveCompetitorIndex(1);
            setSelectedAttemptNumber(1);
          }}
          className={`p-4 rounded-xl font-bold flex items-center justify-between transition-all ${
            activeCompetitorIndex === 1
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{competitor1Flag}</span>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-blue-200 font-mono">ATHLETE 1</span>
              <h4 className="text-base font-black text-white">{competitor1Name}</h4>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xl font-black text-white">{p1Scores.total}</span>
            <span className="text-xs text-blue-200 block">/ 240 pts</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveCompetitorIndex(2);
            setSelectedAttemptNumber(1);
          }}
          className={`p-4 rounded-xl font-bold flex items-center justify-between transition-all ${
            activeCompetitorIndex === 2
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-500/20 ring-2 ring-red-400/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{competitor2Flag}</span>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-red-200 font-mono">ATHLETE 2</span>
              <h4 className="text-base font-black text-white">{competitor2Name}</h4>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xl font-black text-white">{p2Scores.total}</span>
            <span className="text-xs text-red-200 block">/ 240 pts</span>
          </div>
        </button>
      </div>

      {/* 4 Regulation Rounds Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { id: 1, title: 'Round 1: Center Cross', desc: 'Placement rings 2-10 pts' },
          { id: 2, title: 'Round 2: Clearance', desc: '10/5/2/0 pts knockouts' },
          { id: 3, title: 'Round 3: Rear Rings', desc: '3 left + 3 right attempts' },
          { id: 4, title: 'Round 4: Combine', desc: 'Center & deflection rings' },
        ].map((r) => {
          const isSelected = activeRound === r.id;
          const roundScore = r.id === 1 ? currentScores.r1 : r.id === 2 ? currentScores.r2 : r.id === 3 ? currentScores.r3 : currentScores.r4;
          const roundAttemptsCount = currentAttempts.filter(a => a.roundNumber === r.id || (!a.roundNumber && Math.ceil(a.attemptNumber / 6) === r.id)).length;
          const isDone = roundAttemptsCount === 6;

          return (
            <div
              key={r.id}
              onClick={() => {
                setActiveRound(r.id as 1 | 2 | 3 | 4);
                setSelectedAttemptNumber(1);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-800/80 hover:border-emerald-700'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">ROUND {r.id}</span>
                {isDone ? (
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> DONE
                  </span>
                ) : isSelected ? (
                  <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-bold animate-pulse">
                    🎯 SCORING
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">{roundAttemptsCount}/6 shots</span>
                )}
              </div>

              <div>
                <h5 className="text-sm font-bold text-white">{r.title}</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Score:</span>
                <span className="text-base font-black text-cyan-300">{roundScore} <span className="text-[10px] font-normal text-slate-500">/60</span></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Round Shot Recording Matrix */}
      <div className="bg-slate-950/90 border-2 border-cyan-500/30 rounded-3xl p-6 flex flex-col gap-6 shadow-inner">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-800">
                {activeCompetitorIndex === 1 ? competitor1Name : competitor2Name}
              </span>
              <h4 className="text-lg font-black text-white">{currentRoundDetails.title}</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{currentRoundDetails.desc}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Round Score</span>
              <div className="text-2xl font-black text-cyan-400">
                {activeRound === 1 ? currentScores.r1 : activeRound === 2 ? currentScores.r2 : activeRound === 3 ? currentScores.r3 : currentScores.r4} / 60 pts
              </div>
            </div>

            <button
              onClick={handleResetRound}
              disabled={isRefereeLocked}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 text-xs transition-colors disabled:opacity-40"
              title="Reset Round Attempts"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Shots Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((shotNum) => {
            const attempt = currentAttempts.find(
              a => (a.roundNumber === activeRound && a.attemptNumber === shotNum) || a.attemptNumber === (activeRound - 1) * 6 + shotNum
            );
            const isCurrent = selectedAttemptNumber === shotNum;
            const hasScore = attempt !== undefined;

            return (
              <div
                key={shotNum}
                onClick={() => setSelectedAttemptNumber(shotNum)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-between gap-2 text-center ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : hasScore
                    ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-400 font-bold">
                  SHOT {shotNum} {activeRound === 3 ? (shotNum <= 3 ? '(Left)' : '(Right)') : ''}
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

        {/* Ring Point Buttons for selected shot */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Enter Points for Shot #{selectedAttemptNumber} of 6
            </span>
            <span className="text-xs font-mono text-slate-400">
              {currentRoundDetails.title}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {currentRoundDetails.pointsOptions.map((pts) => {
              const attempt = currentAttempts.find(
                a => (a.roundNumber === activeRound && a.attemptNumber === selectedAttemptNumber) || a.attemptNumber === (activeRound - 1) * 6 + selectedAttemptNumber
              );
              const isSelected = attempt?.points === pts;

              return (
                <button
                  key={pts}
                  onClick={() => handleScoreShot(pts)}
                  disabled={isRefereeLocked}
                  className={`py-3.5 rounded-xl font-mono font-black text-lg transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 disabled:opacity-40 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 ring-2 ring-white font-black'
                      : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{pts}</span>
                  <span className="text-[10px] font-normal text-slate-400 font-sans">
                    {pts === 10 ? 'Bullseye / 10' : pts === 0 ? 'Miss (0)' : `${pts} Pts`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                if (selectedAttemptNumber < 6) {
                  setSelectedAttemptNumber(selectedAttemptNumber + 1);
                } else {
                  handleMarkRoundDone();
                }
              }}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <span>{selectedAttemptNumber < 6 ? `✓ Next Shot (${selectedAttemptNumber + 1}/6)` : '✓ Complete All 6 Shots'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleMarkRoundDone}
              disabled={isRefereeLocked}
              className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
            >
              <UserCheck className="w-4 h-4" />
              <span>✓ Mark Round {activeRound} DONE & Advance ({activeRound === 1 ? currentScores.r1 : activeRound === 2 ? currentScores.r2 : activeRound === 3 ? currentScores.r3 : currentScores.r4} pts)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
