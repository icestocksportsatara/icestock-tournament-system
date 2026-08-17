import React, { useState } from 'react';
import { Tournament, Match, Team } from '../../types';
import { MOCK_TEAMS, MOCK_PLAYERS } from '../../data/mockData';
import { Trophy, ChevronRight, Swords, Sparkles, Shield, Flame, CheckCircle, Calendar } from 'lucide-react';

interface InteractiveBracketProps {
  tournament: Tournament;
  onSelectMatch?: (matchId: string) => void;
}

export const InteractiveBracket: React.FC<InteractiveBracketProps> = ({
  tournament,
  onSelectMatch
}) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(
    tournament.discipline[0] || 'TEAM_GAME'
  );

  // Bracket Structure:
  // Quarterfinals (4 matches), Semifinals (2 matches), Final (1 match) + Bronze Match (1 match)
  const qfMatches = [
    {
      id: 'm-qf-1',
      matchNumber: 'QF 1',
      team1: { name: 'Germany', flag: '🇩🇪', score: 18, isWinner: true },
      team2: { name: 'Canada', flag: '🇨🇦', score: 8, isWinner: false },
      status: 'COMPLETED'
    },
    {
      id: 'm-qf-2',
      matchNumber: 'QF 2',
      team1: { name: 'Italy', flag: '🇮🇹', score: 16, isWinner: true },
      team2: { name: 'USA', flag: '🇺🇸', score: 12, isWinner: false },
      status: 'COMPLETED'
    },
    {
      id: 'm-qf-3',
      matchNumber: 'QF 3',
      team1: { name: 'Austria', flag: '🇦🇹', score: 20, isWinner: true },
      team2: { name: 'Slovenia', flag: '🇸🇮', score: 9, isWinner: false },
      status: 'COMPLETED'
    },
    {
      id: 'm-qf-4',
      matchNumber: 'QF 4',
      team1: { name: 'Switzerland', flag: '🇨🇭', score: 14, isWinner: true },
      team2: { name: 'India', flag: '🇮🇳', score: 13, isWinner: false },
      status: 'COMPLETED'
    }
  ];

  const sfMatches = [
    {
      id: 'm-comp-01',
      matchNumber: 'SF 1',
      team1: { name: 'Germany', flag: '🇩🇪', score: 22, isWinner: true },
      team2: { name: 'Italy', flag: '🇮🇹', score: 10, isWinner: false },
      status: 'COMPLETED'
    },
    {
      id: 'm-sf-2',
      matchNumber: 'SF 2',
      team1: { name: 'Austria', flag: '🇦🇹', score: 19, isWinner: true },
      team2: { name: 'Switzerland', flag: '🇨🇭', score: 15, isWinner: false },
      status: 'COMPLETED'
    }
  ];

  const finalMatch = {
    id: 'm-live-01',
    matchNumber: 'GOLD FINAL',
    team1: { name: 'Germany', flag: '🇩🇪', score: 16, isWinner: false },
    team2: { name: 'Austria', flag: '🇦🇹', score: 12, isWinner: false },
    status: 'LIVE'
  };

  const bronzeMatch = {
    id: 'm-bronze',
    matchNumber: 'BRONZE FINAL',
    team1: { name: 'Italy', flag: '🇮🇹', score: 15, isWinner: true },
    team2: { name: 'Switzerland', flag: '🇨🇭', score: 11, isWinner: false },
    status: 'COMPLETED'
  };

  return (
    <div className="w-full bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
      {/* Top Header & Discipline Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white tracking-wide">
              {tournament.name} • Elimination Bracket
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Official IFI Single-Elimination Knockout Tree & Medal Rounds
          </p>
        </div>

        {/* Discipline selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {tournament.discipline.map((disc) => (
            <button
              key={disc}
              onClick={() => setSelectedDiscipline(disc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDiscipline === disc
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {disc.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bracket Tree Container */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[880px] grid grid-cols-4 gap-6 items-center">
          {/* Column 1: Quarterfinals */}
          <div className="flex flex-col gap-6">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-800 pb-2">
              Quarterfinals (Best of 6 Ends)
            </div>

            <div className="flex flex-col gap-6">
              {qfMatches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMatch && onSelectMatch(m.id)}
                  className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 p-3 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-lg flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>{m.matchNumber}</span>
                    <span className="text-emerald-400 font-semibold">{m.status}</span>
                  </div>

                  {/* Team 1 */}
                  <div className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                    m.team1.isWinner ? 'bg-blue-950/40 text-blue-200 border border-blue-800/60' : 'text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>{m.team1.flag}</span>
                      <span>{m.team1.name}</span>
                    </div>
                    <span className="font-mono text-sm">{m.team1.score}</span>
                  </div>

                  {/* Team 2 */}
                  <div className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                    m.team2.isWinner ? 'bg-blue-950/40 text-blue-200 border border-blue-800/60' : 'text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span>{m.team2.flag}</span>
                      <span>{m.team2.name}</span>
                    </div>
                    <span className="font-mono text-sm">{m.team2.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Semifinals */}
          <div className="flex flex-col gap-6 justify-around h-full">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest text-center border-b border-slate-800 pb-2">
              Semifinals
            </div>

            <div className="flex flex-col gap-16">
              {sfMatches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMatch && onSelectMatch(m.id)}
                  className="bg-slate-950/90 border border-cyan-500/30 hover:border-cyan-400 p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-xl flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-cyan-300 font-bold">{m.matchNumber}</span>
                    <span className="text-emerald-400">{m.status}</span>
                  </div>

                  {/* Team 1 */}
                  <div className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                    m.team1.isWinner ? 'bg-blue-900/40 text-cyan-200 border border-cyan-700/60' : 'text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{m.team1.flag}</span>
                      <span>{m.team1.name}</span>
                    </div>
                    <span className="font-mono text-base">{m.team1.score}</span>
                  </div>

                  {/* Team 2 */}
                  <div className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                    m.team2.isWinner ? 'bg-blue-900/40 text-cyan-200 border border-cyan-700/60' : 'text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{m.team2.flag}</span>
                      <span>{m.team2.name}</span>
                    </div>
                    <span className="font-mono text-base">{m.team2.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Grand Gold Final */}
          <div className="flex flex-col gap-4">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest text-center border-b border-amber-500/40 pb-2">
              🏆 Gold Medal Final
            </div>

            <div
              onClick={() => onSelectMatch && onSelectMatch(finalMatch.id)}
              className="bg-gradient-to-b from-amber-950/30 to-slate-950 border-2 border-amber-500/60 p-4 rounded-3xl cursor-pointer shadow-2xl shadow-amber-500/10 hover:border-amber-400 transition-all hover:scale-[1.03] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  WORLD TITLE MATCH
                </span>
                <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                  LIVE NOW
                </span>
              </div>

              {/* Team 1 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-sm font-bold text-white">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{finalMatch.team1.flag}</span>
                  <span>{finalMatch.team1.name}</span>
                </div>
                <span className="font-mono text-xl text-cyan-400 font-black">{finalMatch.team1.score}</span>
              </div>

              {/* Team 2 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-sm font-bold text-white">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{finalMatch.team2.flag}</span>
                  <span>{finalMatch.team2.name}</span>
                </div>
                <span className="font-mono text-xl text-red-400 font-black">{finalMatch.team2.score}</span>
              </div>

              <div className="text-[11px] font-mono text-amber-400/90 text-center mt-1">
                Click to open Live Referee Scoring Room & Telemetry
              </div>
            </div>
          </div>

          {/* Column 4: Bronze Medal Final */}
          <div className="flex flex-col gap-4">
            <div className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest text-center border-b border-amber-800 pb-2">
              🥉 Bronze Medal Match
            </div>

            <div
              onClick={() => onSelectMatch && onSelectMatch(bronzeMatch.id)}
              className="bg-slate-950/80 border border-amber-800/60 hover:border-amber-600 p-3.5 rounded-2xl cursor-pointer shadow-lg transition-all hover:scale-[1.02] flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>3rd Place Playoff</span>
                <span className="text-emerald-400">Official</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2">
                  <span>{bronzeMatch.team1.flag}</span>
                  <span>{bronzeMatch.team1.name}</span>
                </div>
                <span className="font-mono text-amber-400 font-bold">{bronzeMatch.team1.score}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-2">
                  <span>{bronzeMatch.team2.flag}</span>
                  <span>{bronzeMatch.team2.name}</span>
                </div>
                <span className="font-mono">{bronzeMatch.team2.score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
