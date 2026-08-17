import React, { useState } from 'react';
import { Match, GameEnd, StockPosition } from '../../types';
import { IceRink3DCanvas } from '../3d/IceRink3DCanvas';
import { 
  Swords, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw, 
  Plus, 
  Minus,
  Sparkles,
  Trophy
} from 'lucide-react';

interface VersusMatchScorerProps {
  match: Match;
  isRefereeLocked: boolean;
  onUpdateMatch: (updatedMatch: Match) => void;
  onShowToast: (msg: string) => void;
}

export const VersusMatchScorer: React.FC<VersusMatchScorerProps> = ({
  match,
  isRefereeLocked,
  onUpdateMatch,
  onShowToast
}) => {
  const [activeEndNumber, setActiveEndNumber] = useState<number>(match.scores.currentEnd || 1);

  const team1Name = match.team1?.name || match.player1?.name || 'Team 1';
  const team2Name = match.team2?.name || match.player2?.name || 'Team 2';
  const team1Short = match.team1?.shortName || match.player1?.countryCode || 'T1';
  const team2Short = match.team2?.shortName || match.player2?.countryCode || 'T2';
  const team1Flag = match.team1?.flag || match.player1?.flag || '🇩🇪';
  const team2Flag = match.team2?.flag || match.player2?.flag || '🇦🇹';

  const ends = match.scores.ends || [];
  const currentEndData = ends.find(e => e.endNumber === activeEndNumber) || {
    endNumber: activeEndNumber,
    team1Score: 0,
    team2Score: 0,
    daubePosition: { x: 0, y: 0 },
    stockPositions: [],
    durationSeconds: 120
  };

  // Handle End-wise score change (+1, +2, +3, +4 or reset)
  const handleEndScoreChange = (team1Pts: number, team2Pts: number) => {
    if (isRefereeLocked) return;

    const newEnds = [...ends];
    const existingIndex = newEnds.findIndex(e => e.endNumber === activeEndNumber);

    const updatedEnd: GameEnd = {
      endNumber: activeEndNumber,
      team1Score: team1Pts,
      team2Score: team2Pts,
      daubePosition: currentEndData.daubePosition || { x: 0, y: 0 },
      durationSeconds: 120,
      stockPositions: existingIndex >= 0 ? newEnds[existingIndex].stockPositions : []
    };

    if (existingIndex >= 0) {
      newEnds[existingIndex] = updatedEnd;
    } else {
      newEnds.push(updatedEnd);
    }

    const t1Total = newEnds.reduce((sum, e) => sum + e.team1Score, 0);
    const t2Total = newEnds.reduce((sum, e) => sum + e.team2Score, 0);

    // Official IISF Rule Book (Page 11): 2 Game Points for Win, 1 each for Draw
    let t1GamePts = 0;
    let t2GamePts = 0;
    if (t1Total > t2Total) {
      t1GamePts = 2;
      t2GamePts = 0;
    } else if (t2Total > t1Total) {
      t1GamePts = 0;
      t2GamePts = 2;
    } else if (t1Total === t2Total && newEnds.length >= 6) {
      t1GamePts = 1;
      t2GamePts = 1;
    }

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        currentEnd: activeEndNumber,
        ends: newEnds,
        team1TotalScore: t1Total,
        team2TotalScore: t2Total,
        team1GamePoints: t1GamePts,
        team2GamePoints: t2GamePts
      }
    };

    onUpdateMatch(updatedMatch);
    onShowToast(`Updated Turn ${activeEndNumber}: ${team1Short} ${team1Pts} - ${team2Pts} ${team2Short}`);
  };

  const handleStocksChange = (updatedStocks: StockPosition[]) => {
    if (isRefereeLocked) return;

    const newEnds = [...ends];
    const idx = newEnds.findIndex(e => e.endNumber === activeEndNumber);
    if (idx >= 0) {
      newEnds[idx].stockPositions = updatedStocks;
    } else {
      newEnds.push({
        endNumber: activeEndNumber,
        team1Score: 0,
        team2Score: 0,
        daubePosition: { x: 0, y: 0 },
        stockPositions: updatedStocks,
        durationSeconds: 120
      });
    }

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        ends: newEnds
      }
    };

    onUpdateMatch(updatedMatch);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* VERSUS (VS) TITLE BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                {match.discipline === 'HEAD_TO_HEAD' ? 'Head-to-Head Duel Versus Engine' : 'Team Game Versus Match Engine'}
              </h3>
              <span className="text-[11px] font-mono bg-purple-950/90 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-800 font-bold flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-purple-400" />
                VERSUS (VS) SCORING
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official IISF 6-End Side-by-Side Competitive Match • Maximum 4 points per turn • 2 Game Points for Victory
            </p>
          </div>
        </div>

        {/* Game Points Tracker */}
        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{team1Short} Game Pts: {match.scores.team1GamePoints ?? 0}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{team2Short} Game Pts: {match.scores.team2GamePoints ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Versus Comparative Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* End-by-End Tabulation & Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Turn-by-Turn Matrix</h4>
                <p className="text-[10px] text-slate-400">6 Ends • Max 4 stock points per end</p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800 font-bold">
              TURN {activeEndNumber} OF 6
            </span>
          </div>

          {/* Ends 1-6 selector pills */}
          <div className="grid grid-cols-6 gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const endResult = ends.find(e => e.endNumber === num);
              const isSelected = activeEndNumber === num;
              return (
                <button
                  key={num}
                  onClick={() => setActiveEndNumber(num)}
                  className={`py-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-500/30 to-blue-600/30 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/40'
                      : endResult
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 font-bold">TURN {num}</span>
                  <span className="text-xs font-bold font-mono">
                    {endResult ? `${endResult.team1Score}:${endResult.team2Score}` : '-'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Turn Versus Score Adjuster */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-400 font-bold font-mono uppercase tracking-wider">
                Scoring Turn {activeEndNumber} of 6
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                Rule: 1+1+1+1=4 pts max
              </span>
            </div>

            {/* Direct Side-by-Side VS Adjuster */}
            <div className="grid grid-cols-2 gap-3 items-stretch">
              {/* Team 1 Side */}
              <div className="bg-blue-950/20 border border-blue-800/60 p-3.5 rounded-2xl flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <span>{team1Flag}</span>
                  <span className="line-clamp-1">{team1Short}</span>
                </div>

                <div className="flex items-center gap-3 my-1">
                  <button
                    onClick={() => handleEndScoreChange(Math.max(0, currentEndData.team1Score - 1), 0)}
                    disabled={isRefereeLocked}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-base disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-3xl font-black font-mono text-white">{currentEndData.team1Score}</span>
                  <button
                    onClick={() => handleEndScoreChange(Math.min(4, currentEndData.team1Score + 1), 0)}
                    disabled={isRefereeLocked}
                    className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center font-bold text-base disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Quick 1-4 Pts Buttons */}
                <div className="grid grid-cols-4 gap-1 w-full mt-1">
                  {[1, 2, 3, 4].map(p => (
                    <button
                      key={p}
                      onClick={() => handleEndScoreChange(p, 0)}
                      disabled={isRefereeLocked}
                      className={`text-[11px] font-bold py-1 rounded-lg transition-all ${
                        currentEndData.team1Score === p 
                          ? 'bg-blue-500 text-white ring-1 ring-blue-300 font-black' 
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      +{p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team 2 Side */}
              <div className="bg-red-950/20 border border-red-800/60 p-3.5 rounded-2xl flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                  <span className="line-clamp-1">{team2Short}</span>
                  <span>{team2Flag}</span>
                </div>

                <div className="flex items-center gap-3 my-1">
                  <button
                    onClick={() => handleEndScoreChange(0, Math.max(0, currentEndData.team2Score - 1))}
                    disabled={isRefereeLocked}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-base disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-3xl font-black font-mono text-white">{currentEndData.team2Score}</span>
                  <button
                    onClick={() => handleEndScoreChange(0, Math.min(4, currentEndData.team2Score + 1))}
                    disabled={isRefereeLocked}
                    className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center font-bold text-base disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Quick 1-4 Pts Buttons */}
                <div className="grid grid-cols-4 gap-1 w-full mt-1">
                  {[1, 2, 3, 4].map(p => (
                    <button
                      key={p}
                      onClick={() => handleEndScoreChange(0, p)}
                      disabled={isRefereeLocked}
                      className={`text-[11px] font-bold py-1 rounded-lg transition-all ${
                        currentEndData.team2Score === p 
                          ? 'bg-red-500 text-white ring-1 ring-red-300 font-black' 
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      +{p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advance End Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => handleEndScoreChange(0, 0)}
                disabled={isRefereeLocked}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Turn {activeEndNumber}</span>
              </button>

              <button
                onClick={() => {
                  if (activeEndNumber < 6) {
                    setActiveEndNumber(activeEndNumber + 1);
                  } else {
                    onShowToast('All 6 Turns completed for match!');
                  }
                }}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-bold font-mono flex items-center gap-1 border border-slate-700"
              >
                <span>{activeEndNumber < 6 ? `Next Turn (${activeEndNumber + 1}/6)` : 'Match Summary'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Referee Certification Footer */}
          <div className="mt-auto bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Certified Referee: <strong className="text-slate-200">{match.refereeName}</strong></span>
            </div>
            <span className="font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {match.rinkNumber}
            </span>
          </div>
        </div>

        {/* 3D/2D Ice Rink Target House Canvas (7 Cols) */}
        <div className="lg:col-span-7">
          <IceRink3DCanvas
            stocks={currentEndData.stockPositions || []}
            daubePosition={currentEndData.daubePosition || { x: 0, y: 0 }}
            team1Name={team1Name}
            team2Name={team2Name}
            team1Color="#3b82f6"
            team2Color="#ef4444"
            isEditable={!isRefereeLocked}
            onCalculateScores={(t1, t2) => {
              handleEndScoreChange(t1, t2);
            }}
            onStocksChange={handleStocksChange}
          />
        </div>
      </div>
    </div>
  );
};
