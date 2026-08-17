import React, { useState, useEffect } from 'react';
import { Match, Tournament, Discipline, GenderCategory, RankingEntry } from '../../types';
import { storage } from '../../services/storageService';
import { 
  Radio, 
  Tv, 
  Trophy, 
  Award, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Flame, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Search, 
  Users, 
  Target, 
  Ruler, 
  Sparkles, 
  Maximize2,
  Key,
  ExternalLink,
  Volume2,
  Layers,
  Box,
  Compass
} from 'lucide-react';
import { InteractiveBracket } from '../tournaments/InteractiveBracket';
import { RankingLeaderboard } from '../rankings/RankingLeaderboard';
import { Icestock3DViewer } from '../3d/Icestock3DViewer';

interface PublicScoringHubProps {
  onOpenTvMode: (match: Match) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const PublicScoringHub: React.FC<PublicScoringHubProps> = ({
  onOpenTvMode,
  onOpenLogin,
  onOpenRegister
}) => {
  const [matches, setMatches] = useState<Match[]>(storage.getMatches());
  const [tournaments, setTournaments] = useState<Tournament[]>(storage.getTournaments());
  const [selectedMatchId, setSelectedMatchId] = useState<string>('m-live-01');
  const [publicTab, setPublicTab] = useState<'LIVE_SCORES' | 'TOURNAMENTS' | 'RANKINGS' | 'EQUIPMENT_RULES' | 'ARCHIVE'>('LIVE_SCORES');
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState<Discipline | 'ALL'>('ALL');

  useEffect(() => {
    const unsubMatches = storage.subscribe('matches_updated', (updated) => setMatches(updated));
    const unsubTournaments = storage.subscribe('tournaments_updated', (updated) => setTournaments(updated));
    return () => {
      unsubMatches();
      unsubTournaments();
    };
  }, []);

  const activeMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const liveMatches = matches.filter(m => m.status === 'IN_PROGRESS');
  const finishedMatches = matches.filter(m => m.status === 'COMPLETED' || m.status === 'LOCKED_VERIFIED');
  const upcomingMatches = matches.filter(m => m.status === 'SCHEDULED' || m.status === 'WARMUP');

  const filteredMatches = matches.filter(m => {
    if (selectedDisciplineFilter !== 'ALL' && m.discipline !== selectedDisciplineFilter) return false;
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      {/* 1. TOP LIVE EVENT TICKER & STATUS RIBBON */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-cyan-950/80 border border-cyan-500/30 rounded-3xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
            <Radio className="w-6 h-6 animate-pulse text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                LIVE MATCH CENTER
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {liveMatches.length} Ongoing On Ice • {upcomingMatches.length} Upcoming
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
              IFI World Icestock Championships 2026
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => onOpenTvMode(activeMatch)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs font-mono transition-all shadow-lg shadow-amber-500/10 hover:scale-105"
          >
            <Tv className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>TV Stadium Feed</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs font-mono transition-all shadow-lg shadow-cyan-500/20 hover:scale-105"
          >
            <Key className="w-4 h-4" />
            <span>Official Sign In</span>
          </button>
        </div>
      </div>

      {/* 2. PUBLIC PLATFORM NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 overflow-x-auto gap-2">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: 'LIVE_SCORES', label: 'Live Scoreboard & Rinks', icon: Radio, badge: 'LIVE' },
            { id: 'TOURNAMENTS', label: 'Championship Brackets & Schedule', icon: Trophy },
            { id: 'RANKINGS', label: 'World Rankings & Standings', icon: Award },
            { id: 'EQUIPMENT_RULES', label: '3D Equipment & Official Rules', icon: Box },
            { id: 'ARCHIVE', label: 'Results & Records Archive', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = publicTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPublicTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all font-mono ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] bg-red-500 text-white font-black px-1.5 py-0.2 rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: LIVE SCORES & MULTI-RINK SCORING CENTER */}
      {/* ======================================================== */}
      {publicTab === 'LIVE_SCORES' && (
        <div className="flex flex-col gap-8">
          {/* Featured Match High-Impact Stadium Scoreboard */}
          <div className="bg-slate-950 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl">
            {/* Scoreboard Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-4 md:px-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono font-bold">
                  {activeMatch.rinkName || 'Rink 1 - Center Ice'}
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {activeMatch.discipline.replace(/_/g, ' ')} • {activeMatch.category}
                </span>
                <span className="text-xs text-slate-400">
                  Match #{activeMatch.matchNumber}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {activeMatch.status === 'IN_PROGRESS' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-700 text-red-400 text-xs font-mono font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    LIVE END #{activeMatch.scores.currentEnd || 4} OF 6
                  </span>
                ) : activeMatch.status === 'LOCKED_VERIFIED' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-xs font-mono font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    FINAL • VERIFIED BY CHIEF REFEREE
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                    {activeMatch.status}
                  </span>
                )}

                <button
                  onClick={() => onOpenTvMode(activeMatch)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                  title="Fullscreen Stadium Scoreboard"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Teams / Athletes Main Head-to-Head Block */}
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Team 1 / Player 1 */}
              <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-6">
                <div className="text-left md:text-right">
                  <div className="text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase">TEAM A</div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {activeMatch.team1Name || activeMatch.player1Name || 'Team 1'}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {activeMatch.team1Country || 'Germany'} • Seed #1
                  </div>
                </div>
                <div className="text-5xl md:text-6xl select-none filter drop-shadow-lg">
                  {activeMatch.team1Flag || activeMatch.player1Flag || '🇩🇪'}
                </div>
              </div>

              {/* Center Score & Match Telemetry */}
              <div className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-inner">
                <div className="flex items-baseline gap-3 text-4xl md:text-5xl font-mono font-black">
                  <span className="text-cyan-400">{activeMatch.scores.team1TotalScore || 0}</span>
                  <span className="text-slate-600 text-2xl">:</span>
                  <span className="text-amber-400">{activeMatch.scores.team2TotalScore || 0}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
                  Game Points: {activeMatch.scores.team1GamePoints || 0} - {activeMatch.scores.team2GamePoints || 0}
                </div>
              </div>

              {/* Team 2 / Player 2 */}
              <div className="md:col-span-5 flex items-center justify-between md:justify-start gap-6">
                <div className="text-5xl md:text-6xl select-none filter drop-shadow-lg">
                  {activeMatch.team2Flag || activeMatch.player2Flag || '🇦🇹'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-mono text-amber-400 font-bold tracking-widest uppercase">TEAM B</div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {activeMatch.team2Name || activeMatch.player2Name || 'Team 2'}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {activeMatch.team2Country || 'Austria'} • Seed #2
                  </div>
                </div>
              </div>
            </div>

            {/* End-by-End Scoring Breakdown Table (For Team Game) */}
            {activeMatch.scores.ends && activeMatch.scores.ends.length > 0 && (
              <div className="px-6 pb-6 overflow-x-auto">
                <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Official End-by-End Breakdown Matrix (6 Ends)</span>
                </div>
                <table className="w-full text-xs font-mono border-collapse bg-slate-900/60 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                      <th className="p-2.5 text-left font-bold">Team / End</th>
                      {[1, 2, 3, 4, 5, 6].map(e => (
                        <th key={e} className="p-2.5 text-center font-bold">End {e}</th>
                      ))}
                      <th className="p-2.5 text-center font-bold text-cyan-400 bg-slate-950">Total</th>
                      <th className="p-2.5 text-center font-bold text-amber-400 bg-slate-950">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800/60">
                      <td className="p-2.5 font-bold text-white flex items-center gap-2">
                        <span>{activeMatch.team1Flag || '🇩🇪'}</span>
                        <span className="truncate max-w-[140px]">{activeMatch.team1Name}</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6].map(e => {
                        const end = activeMatch.scores.ends?.find(x => x.endNumber === e);
                        return (
                          <td key={e} className="p-2.5 text-center font-bold text-slate-200">
                            {end ? end.team1Score : '-'}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-center font-black text-cyan-400 bg-slate-950 text-sm">
                        {activeMatch.scores.team1TotalScore || 0}
                      </td>
                      <td className="p-2.5 text-center font-black text-white bg-slate-950">
                        {activeMatch.scores.team1GamePoints || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white flex items-center gap-2">
                        <span>{activeMatch.team2Flag || '🇦🇹'}</span>
                        <span className="truncate max-w-[140px]">{activeMatch.team2Name}</span>
                      </td>
                      {[1, 2, 3, 4, 5, 6].map(e => {
                        const end = activeMatch.scores.ends?.find(x => x.endNumber === e);
                        return (
                          <td key={e} className="p-2.5 text-center font-bold text-slate-200">
                            {end ? end.team2Score : '-'}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-center font-black text-amber-400 bg-slate-950 text-sm">
                        {activeMatch.scores.team2TotalScore || 0}
                      </td>
                      <td className="p-2.5 text-center font-black text-white bg-slate-950">
                        {activeMatch.scores.team2GamePoints || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Target Shooting Breakdown (If Target Discipline) */}
            {activeMatch.discipline === 'INDIVIDUAL_TARGET' && (
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="text-xs font-mono font-bold text-cyan-400 mb-2">
                    {activeMatch.player1Name} (4 Rounds x 6 Shots)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMatch.scores.player1TargetAttempts?.map((att, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-950 rounded text-xs font-mono font-bold text-white border border-slate-700">
                        {att.points}p
                      </span>
                    )) || <span className="text-xs text-slate-500">In Progress...</span>}
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <div className="text-xs font-mono font-bold text-amber-400 mb-2">
                    {activeMatch.player2Name} (4 Rounds x 6 Shots)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMatch.scores.player2TargetAttempts?.map((att, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-950 rounded text-xs font-mono font-bold text-white border border-slate-700">
                        {att.points}p
                      </span>
                    )) || <span className="text-xs text-slate-500">In Progress...</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Rink Live Games Matrix */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wider font-mono">
                  All Tournament Rinks & Live Fixtures
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {(['ALL', 'TEAM_GAME', 'INDIVIDUAL_TARGET', 'DISTANCE'] as const).map(disc => (
                  <button
                    key={disc}
                    onClick={() => setSelectedDisciplineFilter(disc)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedDisciplineFilter === disc
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {disc === 'ALL' ? 'All Disciplines' : disc.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map(match => {
                const isSelected = match.id === activeMatch.id;
                return (
                  <div
                    key={match.id}
                    onClick={() => setSelectedMatchId(match.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {match.rinkName || 'Rink Station'}
                      </span>
                      {match.status === 'IN_PROGRESS' ? (
                        <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800 animate-pulse font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          LIVE
                        </span>
                      ) : match.status === 'LOCKED_VERIFIED' ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800 font-bold">
                          FINAL
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                          {match.status}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm text-white">
                          <span>{match.team1Flag || match.player1Flag || '🇩🇪'}</span>
                          <span className="truncate max-w-[150px]">{match.team1Name || match.player1Name}</span>
                        </div>
                        <span className="text-base font-mono font-black text-cyan-400">
                          {match.scores.team1TotalScore || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm text-white">
                          <span>{match.team2Flag || match.player2Flag || '🇦🇹'}</span>
                          <span className="truncate max-w-[150px]">{match.team2Name || match.player2Name}</span>
                        </div>
                        <span className="text-base font-mono font-black text-amber-400">
                          {match.scores.team2TotalScore || 0}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{match.discipline.replace(/_/g, ' ')}</span>
                      <span className="text-cyan-400 hover:underline flex items-center gap-0.5">
                        View Live <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: TOURNAMENTS & CHAMPIONSHIP BRACKETS */}
      {/* ======================================================== */}
      {publicTab === 'TOURNAMENTS' && (
        <div className="flex flex-col gap-8">
          <InteractiveBracket
            tournament={tournaments[0]}
            onSelectMatch={(mId) => {
              setSelectedMatchId(mId);
              setPublicTab('LIVE_SCORES');
            }}
          />

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-black text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Active & Upcoming Global Tournaments</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournaments.map(t => (
                <div key={t.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                      {t.tier}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{t.dates.start} to {t.dates.end}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.location.venue}, {t.location.city}, {t.location.country}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: WORLD & CONTINENTAL RANKINGS */}
      {/* ======================================================== */}
      {publicTab === 'RANKINGS' && (
        <RankingLeaderboard />
      )}

      {/* ======================================================== */}
      {/* VIEW 4: 3D EQUIPMENT & OFFICIAL IFI HOMOLOGATION */}
      {/* ======================================================== */}
      {publicTab === 'EQUIPMENT_RULES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <Icestock3DViewer />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wider font-mono">
                  Official IFI Technical Homologation
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                According to the International Federation Icestocksport (IFI) official rulebook (IEPO Chapter 3), all competition stock bodies, discs, and handles must strictly conform to official measurements:
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold">1. Stock Body (Eisstockkörper)</div>
                  <div className="text-slate-400 text-[11px] mt-1">Weight: 3.70 kg to 3.90 kg • Outer Diameter: 243 mm ± 2 mm</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold">2. Running Surface Plates (Laufsohlen)</div>
                  <div className="text-slate-400 text-[11px] mt-1">Classified by Shore D hardness: Type P (Fast), M (Medium), S (Slow), L (Extreme Grip).</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold">3. Target Ring Scoring (Zielfeld)</div>
                  <div className="text-slate-400 text-[11px] mt-1">Concentric point zones: 10 (Center Daube), 8, 6, 4, 2 points.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 5: RESULTS & RECORDS ARCHIVE */}
      {/* ======================================================== */}
      {publicTab === 'ARCHIVE' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white">Official Results & World Records</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Verified competition results certified by IFI Technical Delegates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <div className="text-xs font-mono text-amber-400 font-bold uppercase">World Record • Men Distance</div>
              <div className="text-2xl font-black text-white">566.24 m</div>
              <div className="text-xs text-slate-400 font-mono">Markus Schätzl (GER) • Seeon Ice Track</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase">World Record • Target Shooting</div>
              <div className="text-2xl font-black text-white">398 / 400 pts</div>
              <div className="text-xs text-slate-400 font-mono">Thomas Elsenberger (GER) • World Championship</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase">Reigning World Champions</div>
              <div className="text-2xl font-black text-white">Team Germany 🇩🇪</div>
              <div className="text-xs text-slate-400 font-mono">Men Team Game • Ritten Arena Gold Medal</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BOTTOM OFFICIAL / FEDERATION CALLOUT */}
      <div className="bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-slate-900/50 border border-cyan-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-2xl">
            🏛️
          </div>
          <div>
            <h4 className="text-base font-bold text-white">
              Official Federation Portal & Referee Scoring Terminals
            </h4>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Referees, Tournament Directors, Federation Heads & Team Managers: Sign in to access your digital scoring terminal, rink assignments, and administrative tools.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenRegister}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition-all"
          >
            Accreditation
          </button>
          <button
            onClick={onOpenLogin}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-500/20 hover:scale-105"
          >
            Sign In Portal
          </button>
        </div>
      </div>
    </div>
  );
};
