import React, { useState, useEffect } from 'react';
import { Match, Tournament } from '../../types';
import { Tv, Maximize2, Minimize2, X, Trophy, Volume2, Shield, Flame, Radio } from 'lucide-react';

interface TVBroadcastScoreboardProps {
  match: Match;
  onClose: () => void;
}

export const TVBroadcastScoreboard: React.FC<TVBroadcastScoreboardProps> = ({
  match,
  onClose
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<'MATCH' | 'STATS' | 'STANDINGS'>('MATCH');

  const toggleFullscreen = () => {
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;

      const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);

      if (!isFs) {
        const requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
        if (typeof requestFs === 'function') {
          const promise = requestFs.call(docEl);
          if (promise && typeof promise.then === 'function') {
            promise
              .then(() => setIsFullscreen(true))
              .catch(() => {
                // If permission is denied in sandboxed iframe, toggle UI state gracefully
                setIsFullscreen(prev => !prev);
              });
          } else {
            setIsFullscreen(true);
          }
        } else {
          // Graceful fallback when API is undefined or unsupported
          setIsFullscreen(prev => !prev);
        }
      } else {
        const exitFs = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (typeof exitFs === 'function') {
          const promise = exitFs.call(doc);
          if (promise && typeof promise.then === 'function') {
            promise
              .then(() => setIsFullscreen(false))
              .catch(() => {
                setIsFullscreen(false);
              });
          } else {
            setIsFullscreen(false);
          }
        } else {
          setIsFullscreen(false);
        }
      }
    } catch {
      // Fallback state toggle if fullscreen is denied or throws
      setIsFullscreen(prev => !prev);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any;
      const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  const team1 = match.team1 || { name: match.player1?.name || 'Germany', flag: match.player1?.flag || '🇩🇪', shortName: 'GER' };
  const team2 = match.team2 || { name: match.player2?.name || 'Austria', flag: match.player2?.flag || '🇦🇹', shortName: 'AUT' };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020712] text-white flex flex-col justify-between p-6 md:p-12 overflow-hidden select-none animate-in fade-in duration-300">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-10 border-b border-slate-800/80 pb-4">
        {/* IFI Official Federation Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/30">
            ❄️
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>OFFICIAL IFI WORLD BROADCAST FEED</span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-white tracking-wider">
              {match.stage} • {match.discipline.replace(/_/g, ' ')}
            </h1>
          </div>
        </div>

        {/* Venue & Rink info */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <span className="text-slate-400">VENUE:</span>
          <span className="text-cyan-300 font-bold">OlympiaWorld Arena</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-bold">{match.rinkNumber}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 hover:bg-red-900 text-red-300 transition-colors"
            title="Exit Broadcast Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Grand Stadium Jumbotron Scoreboard */}
      <div className="my-auto max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-6 z-10">
        {/* Team 1 Side (5 Cols) */}
        <div className="md:col-span-5 bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-slate-900/95 border-2 border-blue-500/40 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl md:text-5xl">{team1.flag}</span>
              <div>
                <span className="text-xs uppercase tracking-widest text-blue-400 font-mono font-bold">HOME</span>
                <h2 className="text-2xl md:text-3xl font-black text-white">{team1.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Blue Running Plates</span>
            </div>
          </div>

          <div className="text-6xl md:text-8xl font-black font-mono text-cyan-400 bg-slate-950/90 border-2 border-cyan-500/50 px-6 py-4 rounded-2xl shadow-2xl min-w-[120px] text-center">
            {match.discipline === 'TEAM_TARGET'
              ? (match.scores.team1TargetPlayers || []).reduce((s, p) => s + p.totalPoints, 0)
              : match.discipline === 'INDIVIDUAL_TARGET'
              ? (match.scores.player1TargetAttempts || []).reduce((s, a) => s + a.points, 0)
              : match.discipline === 'TEAM_DISTANCE'
              ? `${parseFloat((match.scores.team1DistancePlayers || []).reduce((s, p) => s + (p.bestDistance || 0), 0).toFixed(1))}m`
              : match.discipline === 'INDIVIDUAL_DISTANCE'
              ? `${match.scores.bestDistance?.['p-3'] || 0}m`
              : match.scores.team1TotalScore || 0}
          </div>
        </div>

        {/* Center Timer & Match Telemetry (2 Cols) */}
        <div className="md:col-span-2 flex flex-col items-center justify-center gap-3 text-center">
          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl text-[11px] font-mono text-slate-400 uppercase tracking-widest shadow-lg">
            {match.discipline === 'TEAM_GAME' || match.discipline === 'HEAD_TO_HEAD'
              ? `TURN ${match.scores.currentEnd || 1} OF 6`
              : match.discipline === 'INDIVIDUAL_TARGET' || match.discipline === 'TEAM_TARGET'
              ? '4 ROUNDS • /240 PTS'
              : '5 DISTANCE ATTEMPTS'}
          </div>

          <div className="text-4xl md:text-5xl font-black font-mono text-amber-400 tracking-widest bg-slate-950/90 border-2 border-amber-500/40 px-5 py-3 rounded-2xl shadow-xl w-full">
            {formatTime(match.timer.currentSeconds)}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/80 px-3 py-1 rounded-full">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>LIVE RINK RADAR</span>
          </div>
        </div>

        {/* Team 2 Side (5 Cols) */}
        <div className="md:col-span-5 bg-gradient-to-l from-red-950/40 via-slate-900/90 to-slate-900/95 border-2 border-red-500/40 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="text-6xl md:text-8xl font-black font-mono text-red-400 bg-slate-950/90 border-2 border-red-500/50 px-6 py-4 rounded-2xl shadow-2xl min-w-[120px] text-center order-2 md:order-1">
            {match.discipline === 'TEAM_TARGET'
              ? (match.scores.team2TargetPlayers || []).reduce((s, p) => s + p.totalPoints, 0)
              : match.discipline === 'INDIVIDUAL_TARGET'
              ? (match.scores.player2TargetAttempts || []).reduce((s, a) => s + a.points, 0)
              : match.discipline === 'TEAM_DISTANCE'
              ? `${parseFloat((match.scores.team2DistancePlayers || []).reduce((s, p) => s + (p.bestDistance || 0), 0).toFixed(1))}m`
              : match.discipline === 'INDIVIDUAL_DISTANCE'
              ? `${match.scores.bestDistance?.['p-5'] || 0}m`
              : match.scores.team2TotalScore || 0}
          </div>

          <div className="flex flex-col gap-2 text-right order-1 md:order-2">
            <div className="flex items-center justify-end gap-3">
              <div>
                <span className="text-xs uppercase tracking-widest text-red-400 font-mono font-bold">AWAY</span>
                <h2 className="text-2xl md:text-3xl font-black text-white">{team2.name}</h2>
              </div>
              <span className="text-4xl md:text-5xl">{team2.flag}</span>
            </div>
            <div className="flex items-center justify-end gap-2 text-xs font-mono text-slate-400 mt-1">
              <span>Red Running Plates</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Lower-Third & Sponsor Bar */}
      <div className="z-10 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center gap-6 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Senior Referee: <strong className="text-white">{match.refereeName}</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span>ICE SURFACE: -5.4°C • HUMIDITY 42%</span>
          </div>
        </div>

        {/* Global Sponsor Banner */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>OFFICIAL PARTNERS:</span>
          <span className="text-cyan-300 font-bold">LADLER PRO</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-300 font-bold">SEIWALD PRECISION</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-300 font-bold">AST ICE DYNAMICS</span>
        </div>
      </div>
    </div>
  );
};
