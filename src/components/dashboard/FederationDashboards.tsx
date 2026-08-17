import React, { useState } from 'react';
import { UserRole, Tournament, Match, Player } from '../../types';
import { storage } from '../../services/storageService';
import { 
  Shield, 
  Trophy, 
  Users, 
  Activity, 
  Radio, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Calendar,
  Layers,
  HeartPulse
} from 'lucide-react';
import { Icestock3DViewer } from '../3d/Icestock3DViewer';
import { Globe3D } from '../3d/Globe3D';

interface FederationDashboardsProps {
  currentRole: UserRole;
  onNavigateToLiveMatch: (matchId: string) => void;
  onNavigateToTournament: (tournament: Tournament) => void;
  onOpenSuperAdmin?: () => void;
}

export const FederationDashboards: React.FC<FederationDashboardsProps> = ({
  currentRole,
  onNavigateToLiveMatch,
  onNavigateToTournament,
  onOpenSuperAdmin
}) => {
  const tournaments = storage.getTournaments();
  const matches = storage.getMatches();
  const players = storage.getPlayers();
  const auditLogs = storage.getAuditLogs();
  const masterSettings = storage.getMasterSettings();

  const liveMatches = matches.filter(m => m.status === 'LIVE');
  const activeTournaments = tournaments.filter(t => t.status === 'LIVE' || t.status === 'REGISTRATION_OPEN');

  // SUPER ADMIN & FEDERATION HEADS VIEW
  if (
    currentRole === 'SUPER_ADMIN' ||
    currentRole === 'COUNTRY_HEAD' ||
    currentRole === 'NATIONAL_HEAD' ||
    currentRole === 'STATE_HEAD' ||
    currentRole === 'DISTRICT_HEAD'
  ) {
    return (
      <div className="w-full flex flex-col gap-6">
        {/* Super Admin Master Access Notification Banner */}
        {currentRole === 'SUPER_ADMIN' && onOpenSuperAdmin && (
          <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border-2 border-cyan-500/50 rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                    SUPER ADMIN ACTIVE
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">
                    Season: {masterSettings.activeSeason}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Full Administrative Privileges & Master Controls Enabled
                </h3>
              </div>
            </div>

            <button
              onClick={onOpenSuperAdmin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Open Master Settings & Permissions</span>
            </button>
          </div>
        )}

        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/20 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>LIVE TOURNAMENTS</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="text-3xl font-black font-mono text-cyan-400 mt-2">
              {tournaments.filter(t => t.status === 'LIVE').length} Active
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {tournaments.length} Total Sanctioned Events
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>ACCREDITED ATHLETES</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white mt-2">
              {players.length * 32}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18% this season</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>ACTIVE ICE LANES</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-amber-400 mt-2">
              24 Rinks
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Millimeter Laser Telemetry
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>MEMBER NATIONS</span>
              <Trophy className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black font-mono text-purple-400 mt-2">
              38 Nations
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              IFI Olympic Federation Scope
            </div>
          </div>
        </div>

        {/* 3D Visual Centerpiece: Globe + 3D Icestock Model */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Globe3D />
          </div>
          <div className="lg:col-span-5">
            <Icestock3DViewer
              initialColor="#3b82f6"
              stockName="Official IFI Master Stock 2026"
              weightKg={3.82}
            />
          </div>
        </div>

        {/* Live Matches & Recent Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Matches List */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Live Competition Telemetry
                </h3>
              </div>
              <span className="text-xs bg-red-950 text-red-300 font-mono px-2 py-0.5 rounded border border-red-800">
                {liveMatches.length} Live
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {liveMatches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onNavigateToLiveMatch(m.id)}
                  className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between shadow-lg"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                      <span className="font-bold">{m.matchNumber}</span>
                      <span>•</span>
                      <span>{m.discipline.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span className="text-slate-400">{m.rinkNumber}</span>
                    </div>
                    <div className="text-sm font-bold text-white flex items-center gap-4 mt-1">
                      <span>{m.team1?.flag || m.player1?.flag} {m.team1?.name || m.player1?.name}</span>
                      <span className="font-mono text-amber-400 text-base font-black">
                        {m.scores.team1TotalScore || 0} : {m.scores.team2TotalScore || 0}
                      </span>
                      <span>{m.team2?.flag || m.player2?.flag} {m.team2?.name || m.player2?.name}</span>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 bg-blue-600/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-blue-600/40">
                    <span>Live Console</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Federation Audit Trail
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-cyan-400 font-bold">{log.action}</span>
                    <span>{log.timestamp.substring(11, 19)}</span>
                  </div>
                  <div className="text-slate-200 mt-1 line-clamp-1">{log.details}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{log.userName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REFEREE DASHBOARD VIEW
  if (currentRole === 'REFEREE') {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-black text-white">Chief Referee Command Terminal</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Live Rink Whistle Controller • End-Wise Verification • Telemetry Calibration
            </p>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-mono text-amber-300 font-bold">
            Official License: IFI-REF-SR-01
          </div>
        </div>

        {/* Assigned Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 p-5 rounded-3xl shadow-xl flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">{m.matchNumber}</span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  m.status === 'LIVE' ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' : 'bg-slate-800 text-slate-400'
                }`}>
                  {m.status}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {m.team1?.name || m.player1?.name} vs {m.team2?.name || m.player2?.name}
                </h4>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  {m.discipline.replace(/_/g, ' ')} • {m.rinkNumber}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Current Score:</span>
                <span className="text-base font-black text-cyan-400">
                  {m.scores.team1TotalScore || 0} : {m.scores.team2TotalScore || 0}
                </span>
              </div>

              <button
                onClick={() => onNavigateToLiveMatch(m.id)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <span>Launch Live Referee Scoring Pad</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ATHLETE / PLAYER DASHBOARD VIEW
  const player = players[0];
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Player Header Banner */}
      <div className="bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={player.profileImage}
              alt={player.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 text-2xl">{player.flag}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                {player.playerId}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                ✓ KYC VERIFIED
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">{player.name}</h2>
            <p className="text-xs text-slate-400 font-mono">{player.club} • {player.country}</p>
          </div>
        </div>

        {/* Global Ranks */}
        <div className="flex items-center gap-4 font-mono text-center">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 min-w-[90px]">
            <div className="text-[10px] text-slate-400">WORLD RANK</div>
            <div className="text-2xl font-black text-amber-400">#{player.worldRank}</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 min-w-[90px]">
            <div className="text-[10px] text-slate-400">POINTS</div>
            <div className="text-2xl font-black text-cyan-400">{player.rankingPoints}</div>
          </div>
        </div>
      </div>

      {/* Equipment Specs & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Stock Equipment */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Homologated Equipment Configuration
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">WEIGHT</span>
              <span className="font-bold text-white">{player.stockSpecs.discWeight} kg</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">PLATE TYPE</span>
              <span className="font-bold text-cyan-400">{player.stockSpecs.plateType}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2">
              <span className="text-slate-500 block text-[10px]">HANDLE TYPE</span>
              <span className="font-bold text-slate-200">{player.stockSpecs.handleType}</span>
            </div>
          </div>
        </div>

        {/* Career Stats */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Career Records & Accuracy
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs font-mono text-center">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">WIN RATE</span>
              <span className="font-bold text-emerald-400 text-lg">83.8%</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">BEST TARGET</span>
              <span className="font-bold text-cyan-400 text-lg">{player.stats.bestTargetScore} pts</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">BEST DISTANCE</span>
              <span className="font-bold text-amber-400 text-lg">{player.stats.bestDistanceMeters} m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
