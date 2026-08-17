import React, { useState } from 'react';
import { RankingEntry, Discipline, GenderCategory } from '../../types';
import { storage } from '../../services/storageService';
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Award, 
  Globe, 
  Flag,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { Podium3D } from '../3d/Podium3D';

export const RankingLeaderboard: React.FC = () => {
  const [rankingScope, setRankingScope] = useState<'WORLD' | 'NATIONAL' | 'STATE' | 'DISTRICT'>('WORLD');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<GenderCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allRankings = storage.getRankings();

  const filteredRankings = allRankings.filter((r) => {
    if (selectedDiscipline !== 'ALL' && r.discipline !== selectedDiscipline) return false;
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.countryCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const topThree = filteredRankings.slice(0, 3);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 3D Podium for Top 3 */}
      {topThree.length >= 3 && (
        <Podium3D
          topThree={topThree}
          title={`${rankingScope} Championship Podium`}
          discipline={selectedDiscipline === 'ALL' ? 'Overall Federation Standings' : selectedDiscipline.replace(/_/g, ' ')}
        />
      )}

      {/* Rankings Control Bar */}
      <div className="bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black text-white">Official Ranking & Points Matrix</h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              IFI Elo-Calculated Points System with Continental & World Multipliers
            </p>
          </div>

          {/* 4-Tier Scope Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            {(['WORLD', 'NATIONAL', 'STATE', 'DISTRICT'] as const).map((scope) => (
              <button
                key={scope}
                onClick={() => setRankingScope(scope)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  rankingScope === scope
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {scope}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete or country..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>

          {/* Discipline Select */}
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Disciplines</option>
            <option value="TEAM_GAME">Team Game</option>
            <option value="INDIVIDUAL_TARGET">Individual Target</option>
            <option value="INDIVIDUAL_DISTANCE">Individual Distance</option>
            <option value="TEAM_TARGET">Team Target</option>
            <option value="TEAM_DISTANCE">Team Distance</option>
            <option value="HEAD_TO_HEAD">Head To Head</option>
          </select>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Categories</option>
            <option value="MEN">Men Senior</option>
            <option value="WOMEN">Women Senior</option>
            <option value="MIXED">Mixed Teams</option>
            <option value="JUNIORS_U23">Juniors U23</option>
          </select>
        </div>

        {/* Table of Athletes */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Athlete / Team</th>
                <th className="py-3 px-3">Country</th>
                <th className="py-3 px-3">Discipline</th>
                <th className="py-3 px-3 text-center">Medals (G/S/B)</th>
                <th className="py-3 px-3 text-center">Win Rate</th>
                <th className="py-3 px-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRankings.map((entry, idx) => {
                const isTop1 = entry.rank === 1;
                const isTop2 = entry.rank === 2;
                const isTop3 = entry.rank === 3;

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isTop1 ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Rank Number & Trend */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center font-mono ${
                          isTop1
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                            : isTop2
                            ? 'bg-slate-300 text-slate-950'
                            : isTop3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {entry.rank}
                        </span>

                        {/* Trend */}
                        {entry.prevRank > entry.rank ? (
                          <span className="text-[10px] text-emerald-400 flex items-center font-mono" title={`Up from #${entry.prevRank}`}>
                            <TrendingUp className="w-3 h-3" />
                            <span>+{entry.prevRank - entry.rank}</span>
                          </span>
                        ) : entry.prevRank < entry.rank ? (
                          <span className="text-[10px] text-red-400 flex items-center font-mono" title={`Down from #${entry.prevRank}`}>
                            <TrendingDown className="w-3 h-3" />
                            <span>-{entry.rank - entry.prevRank}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">-</span>
                        )}
                      </div>
                    </td>

                    {/* Athlete Name */}
                    <td className="py-3.5 px-3">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{entry.name}</span>
                          {isTop1 && <Award className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {entry.teamName || 'National Federation'}
                        </div>
                      </div>
                    </td>

                    {/* Country */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{entry.flag}</span>
                        <span className="text-slate-300 font-semibold">{entry.countryCode}</span>
                      </div>
                    </td>

                    {/* Discipline */}
                    <td className="py-3.5 px-3">
                      <span className="bg-slate-950 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300 border border-slate-800">
                        {entry.discipline.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Medals */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono text-xs">
                        <span className="text-amber-400 font-bold">{entry.gold}🥇</span>
                        <span className="text-slate-300 font-bold">{entry.silver}🥈</span>
                        <span className="text-amber-700 font-bold">{entry.bronze}🥉</span>
                      </div>
                    </td>

                    {/* Win Rate */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                        {entry.winRate}%
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="text-base font-black font-mono text-cyan-400">
                        {entry.points.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
