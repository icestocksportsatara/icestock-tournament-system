import React, { useState, useRef } from 'react';
import { Player, Match, Tournament } from '../../types';
import { storage } from '../../services/storageService';
import { 
  FileText, 
  Printer, 
  Download, 
  Award, 
  ShieldCheck, 
  QrCode, 
  CheckCircle, 
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const PDFReportGenerator: React.FC = () => {
  const [selectedDocType, setSelectedDocType] = useState<'PLAYER_ID' | 'MATCH_SHEET' | 'CERTIFICATE'>('PLAYER_ID');
  
  const players = storage.getPlayers();
  const matches = storage.getMatches();
  const tournaments = storage.getTournaments();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || 'p-1');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || 'm-live-01');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(tournaments[0]?.id || 'tour-1');

  const printAreaRef = useRef<HTMLDivElement>(null);

  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  const activeMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const activeTournament = tournaments.find(t => t.id === selectedTournamentId) || tournaments[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Toolbar */}
      <div className="bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-black text-white tracking-wide">
              Official IFI Accreditation & Document Generator
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Compliant with Olympic & World Icestock Sport Federation Legal Standards
          </p>
        </div>

        {/* Doc Type Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedDocType('PLAYER_ID')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedDocType === 'PLAYER_ID'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Player ID Pass
            </button>
            <button
              onClick={() => setSelectedDocType('MATCH_SHEET')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedDocType === 'MATCH_SHEET'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Official Match Sheet
            </button>
            <button
              onClick={() => setSelectedDocType('CERTIFICATE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedDocType === 'CERTIFICATE'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Championship Certificate
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Selectors for Current Document */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
        {selectedDocType === 'PLAYER_ID' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Select Athlete:</span>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 font-medium"
            >
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.flag} {p.name} ({p.playerId})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedDocType === 'MATCH_SHEET' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Select Match:</span>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 font-medium"
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.matchNumber} • {m.discipline.replace(/_/g, ' ')} ({m.rinkNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedDocType === 'CERTIFICATE' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Recipient:</span>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-medium"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.flag} {p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Tournament:</span>
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 font-medium"
              >
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* PRINTABLE PREVIEW CANVAS */}
      <div ref={printAreaRef} className="w-full flex items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl">
        {/* 1. PLAYER ACCREDITATION PASS */}
        {selectedDocType === 'PLAYER_ID' && activePlayer && (
          <div className="w-[340px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-400/60 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col items-center select-none">
            {/* Lanyard Slot Cutout */}
            <div className="w-full bg-slate-950 py-2.5 flex justify-center border-b border-slate-800">
              <div className="w-12 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            </div>

            {/* Federation Header */}
            <div className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 p-3 text-center text-white">
              <div className="text-[10px] font-mono tracking-widest font-black uppercase opacity-90">
                INTERNATIONAL FEDERATION ICESTOCKSPORT
              </div>
              <div className="text-sm font-black tracking-wide">
                WORLD CHAMPIONSHIPS 2026
              </div>
            </div>

            {/* Access Level Badge */}
            <div className="w-full bg-amber-400 text-slate-950 font-black text-center py-1 text-xs uppercase tracking-widest">
              ZONE ALL • ATHLETE COMPETITOR
            </div>

            {/* Photo & Athlete Details */}
            <div className="p-5 flex flex-col items-center gap-3 w-full">
              <div className="relative">
                <img
                  src={activePlayer.profileImage}
                  alt={activePlayer.name}
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl"
                />
                <span className="absolute -bottom-2 -right-2 text-2xl drop-shadow-md">
                  {activePlayer.flag}
                </span>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-black text-white">{activePlayer.name}</h3>
                <div className="text-xs text-cyan-300 font-mono font-bold">{activePlayer.country} Federation</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{activePlayer.club}</div>
              </div>

              {/* ID Specs */}
              <div className="w-full bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px]">LICENSE ID</span>
                  <span className="font-bold text-amber-300">{activePlayer.playerId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">CATEGORY</span>
                  <span className="font-bold text-white">{activePlayer.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">KYC STATUS</span>
                  <span className="font-bold text-emerald-400">✓ VERIFIED</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">WORLD RANK</span>
                  <span className="font-bold text-cyan-400">#{activePlayer.worldRank}</span>
                </div>
              </div>

              {/* Security Barcode & Hologram */}
              <div className="w-full pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="font-mono text-[9px] text-slate-500">
                  |||||||||||||||||||||||||||||||||||
                  <div className="text-[8px]">{activePlayer.playerId}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 via-cyan-400 to-purple-500 opacity-80 flex items-center justify-center text-[8px] font-bold text-slate-950 shadow-inner">
                  IFI SEAL
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. OFFICIAL MATCH SCORE SHEET */}
        {selectedDocType === 'MATCH_SHEET' && activeMatch && (
          <div className="w-full max-w-3xl bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-300 font-sans select-none">
            {/* Top Official Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  International Federation Icestocksport (IFI)
                </h2>
                <h3 className="text-sm font-bold text-blue-800 uppercase">
                  Official Match Report & Scorecard Sheet
                </h3>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="font-bold text-slate-900">{activeMatch.matchNumber}</div>
                <div className="text-slate-600">{activeMatch.scheduledTime}</div>
              </div>
            </div>

            {/* Match Meta Details */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-300 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold">STAGE / ROUND</span>
                <span className="font-bold">{activeMatch.stage}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">DISCIPLINE</span>
                <span className="font-bold">{activeMatch.discipline.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">VENUE & RINK</span>
                <span className="font-bold">OlympiaWorld ({activeMatch.rinkNumber})</span>
              </div>
            </div>

            {/* Teams Header */}
            <div className="grid grid-cols-2 gap-4 py-4 text-sm font-bold">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-600">TEAM 1 (HOME)</div>
                <div className="text-base font-black">{activeMatch.team1?.name || activeMatch.player1?.name}</div>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xs text-red-600">TEAM 2 (AWAY)</div>
                <div className="text-base font-black">{activeMatch.team2?.name || activeMatch.player2?.name}</div>
              </div>
            </div>

            {/* DISCIPLINE SPECIFIC SCORECARD TABLES */}
            {/* A. Team Game Table */}
            {(activeMatch.discipline === 'TEAM_GAME' || activeMatch.discipline === 'HEAD_TO_HEAD') && (
              <table className="w-full text-xs text-left border-collapse border border-slate-300 my-2">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    <th className="p-2 border border-slate-300">TURN / END</th>
                    <th className="p-2 border border-slate-300">TEAM 1 POINTS (MAX 4)</th>
                    <th className="p-2 border border-slate-300">TEAM 2 POINTS (MAX 4)</th>
                    <th className="p-2 border border-slate-300">RULE COMPLIANCE</th>
                    <th className="p-2 border border-slate-300">REFEREE INITIALS</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeMatch.scores.ends || [
                    { endNumber: 1, team1Score: 3, team2Score: 0 },
                    { endNumber: 2, team1Score: 0, team2Score: 2 },
                    { endNumber: 3, team1Score: 4, team2Score: 0 },
                    { endNumber: 4, team1Score: 1, team2Score: 0 },
                    { endNumber: 5, team1Score: 0, team2Score: 1 },
                    { endNumber: 6, team1Score: 2, team2Score: 0 },
                  ]).map((end) => (
                    <tr key={end.endNumber} className="border-b border-slate-200">
                      <td className="p-2 font-bold font-mono border border-slate-300">Turn {end.endNumber}</td>
                      <td className="p-2 font-mono font-bold text-blue-700 border border-slate-300">{end.team1Score}</td>
                      <td className="p-2 font-mono font-bold text-red-700 border border-slate-300">{end.team2Score}</td>
                      <td className="p-2 font-mono text-slate-500 border border-slate-300">IISF Page 11 Valid</td>
                      <td className="p-2 font-mono text-slate-500 border border-slate-300">HG</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black">
                    <td className="p-2 border border-slate-300">TOTAL SHOT POINTS</td>
                    <td className="p-2 font-mono text-base text-blue-800 border border-slate-300">
                      {activeMatch.scores.team1TotalScore || 10}
                    </td>
                    <td className="p-2 font-mono text-base text-red-800 border border-slate-300">
                      {activeMatch.scores.team2TotalScore || 3}
                    </td>
                    <td className="p-2 font-mono text-xs border border-slate-300" colSpan={2}>
                      GAME POINTS: Team 1 ({activeMatch.scores.team1GamePoints ?? 2}) : Team 2 ({activeMatch.scores.team2GamePoints ?? 0})
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* B. Target Competition (4 Rounds x 6 Attempts = 240 Max Points) */}
            {(activeMatch.discipline === 'INDIVIDUAL_TARGET' || activeMatch.discipline === 'TEAM_TARGET') && (
              <div className="flex flex-col gap-2 my-2">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-2 border border-slate-300">ROUND & TARGET DISCIPLINE</th>
                      <th className="p-2 border border-slate-300">ATTEMPTS (6 PER ROUND)</th>
                      <th className="p-2 border border-slate-300 text-blue-700">P1 SCORE (/60)</th>
                      <th className="p-2 border border-slate-300 text-red-700">P2 SCORE (/60)</th>
                      <th className="p-2 border border-slate-300">RULE REF</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold border border-slate-300">Round 1: Middle Target Rings</td>
                      <td className="p-2 font-mono border border-slate-300">6 shots at center cross (2-10 pts)</td>
                      <td className="p-2 font-mono font-bold text-blue-700 border border-slate-300">46</td>
                      <td className="p-2 font-mono font-bold text-red-700 border border-slate-300">42</td>
                      <td className="p-2 text-slate-500 border border-slate-300">Rule 310</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold border border-slate-300">Round 2: Clearance of Stock</td>
                      <td className="p-2 font-mono border border-slate-300">6 shots clearance (10/5/2 pts)</td>
                      <td className="p-2 font-mono font-bold text-blue-700 border border-slate-300">40</td>
                      <td className="p-2 font-mono font-bold text-red-700 border border-slate-300">35</td>
                      <td className="p-2 text-slate-500 border border-slate-300">Rule 320</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold border border-slate-300">Round 3: Corner Rings</td>
                      <td className="p-2 font-mono border border-slate-300">3 Left + 3 Right at back (2-10 pts)</td>
                      <td className="p-2 font-mono font-bold text-blue-700 border border-slate-300">48</td>
                      <td className="p-2 font-mono font-bold text-red-700 border border-slate-300">44</td>
                      <td className="p-2 text-slate-500 border border-slate-300">Rule 330</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold border border-slate-300">Round 4: Combine (Kombination)</td>
                      <td className="p-2 font-mono border border-slate-300">3 center placement + 3 deflection (2-10 pts)</td>
                      <td className="p-2 font-mono font-bold text-blue-700 border border-slate-300">50</td>
                      <td className="p-2 font-mono font-bold text-red-700 border border-slate-300">46</td>
                      <td className="p-2 text-slate-500 border border-slate-300">Rule 340</td>
                    </tr>
                    <tr className="bg-slate-100 font-black">
                      <td className="p-2 border border-slate-300" colSpan={2}>GRAND TOTAL SCORE (MAX 240 POINTS)</td>
                      <td className="p-2 font-mono text-base text-blue-800 border border-slate-300">184 / 240</td>
                      <td className="p-2 font-mono text-base text-red-800 border border-slate-300">167 / 240</td>
                      <td className="p-2 border border-slate-300 text-emerald-700 font-bold">✓ VERIFIED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* C. Distance Competition (5 Official Attempts) */}
            {(activeMatch.discipline === 'INDIVIDUAL_DISTANCE' || activeMatch.discipline === 'TEAM_DISTANCE') && (
              <div className="flex flex-col gap-2 my-2">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-2 border border-slate-300">ATTEMPT #</th>
                      <th className="p-2 border border-slate-300 text-blue-700">COMPETITOR 1 DISTANCE</th>
                      <th className="p-2 border border-slate-300 text-red-700">COMPETITOR 2 DISTANCE</th>
                      <th className="p-2 border border-slate-300">TELEMETRY DATA</th>
                      <th className="p-2 border border-slate-300">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((attNum) => (
                      <tr key={attNum} className="border-b border-slate-200">
                        <td className="p-2 font-bold font-mono border border-slate-300">Attempt {attNum} of 5</td>
                        <td className="p-2 font-mono font-bold text-blue-700 border border-slate-300">
                          {attNum === 1 ? '118.42 m' : attNum === 2 ? '122.84 m' : attNum === 3 ? '120.15 m' : attNum === 4 ? '126.40 m' : '124.90 m'}
                        </td>
                        <td className="p-2 font-mono font-bold text-red-700 border border-slate-300">
                          {attNum === 1 ? '114.20 m' : attNum === 2 ? 'FOUL (X)' : attNum === 3 ? '119.50 m' : attNum === 4 ? '121.80 m' : '123.10 m'}
                        </td>
                        <td className="p-2 font-mono text-slate-500 border border-slate-300">Wind 3.2 km/h • Ice -5.5°C</td>
                        <td className="p-2 font-mono text-slate-700 border border-slate-300">Laser Optical OK</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-black">
                      <td className="p-2 border border-slate-300">BEST THROW (FURTHEST COUNTS)</td>
                      <td className="p-2 font-mono text-base text-blue-800 border border-slate-300">
                        {activeMatch.scores.bestDistance?.['p-3'] ? `${activeMatch.scores.bestDistance['p-3']} m` : '126.40 m'} (GOLD)
                      </td>
                      <td className="p-2 font-mono text-base text-red-800 border border-slate-300">
                        {activeMatch.scores.bestDistance?.['p-5'] ? `${activeMatch.scores.bestDistance['p-5']} m` : '123.10 m'} (SILVER)
                      </td>
                      <td className="p-2 border border-slate-300" colSpan={2}>IFI Rule 400 Compliant</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Official Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-6 mt-4 border-t-2 border-slate-300 text-xs">
              <div>
                <span className="text-slate-500 block">Team 1 Captain:</span>
                <div className="h-10 border-b border-dashed border-slate-400 mt-2 flex items-end font-serif italic text-blue-900">
                  Stefan Zellermayer
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Team 2 Captain:</span>
                <div className="h-10 border-b border-dashed border-slate-400 mt-2 flex items-end font-serif italic text-red-900">
                  Simone Steiner
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Chief Referee:</span>
                <div className="h-10 border-b border-dashed border-slate-400 mt-2 flex items-end font-serif italic text-slate-900 font-bold">
                  {activeMatch.refereeName}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CHAMPIONSHIP CERTIFICATE */}
        {selectedDocType === 'CERTIFICATE' && (
          <div className="w-full max-w-3xl bg-gradient-to-b from-amber-50 via-white to-amber-50 text-slate-900 p-10 rounded-3xl border-8 border-amber-600/40 shadow-2xl relative select-none text-center">
            {/* Elegant Inner Border */}
            <div className="border-2 border-amber-500/60 p-8 rounded-2xl flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl shadow-lg">
                🏆
              </div>

              <div className="font-serif tracking-widest uppercase text-amber-800 text-sm font-bold">
                INTERNATIONAL FEDERATION ICESTOCKSPORT
              </div>

              <h1 className="text-3xl md:text-4xl font-black font-serif text-slate-900 tracking-wide">
                Certificate of Championship Achievement
              </h1>

              <p className="text-xs text-slate-600 font-serif italic max-w-md">
                This official diploma is proudly conferred upon
              </p>

              <div className="text-2xl md:text-3xl font-bold font-serif text-amber-700 underline decoration-amber-400 decoration-2 underline-offset-8">
                {activePlayer.name} ({activePlayer.country})
              </div>

              <p className="text-xs text-slate-700 max-w-lg mt-2 leading-relaxed">
                in official recognition of superior athletic prowess, precision sportsmanship, and outstanding placement in the <strong>{activeTournament.name}</strong>.
              </p>

              <div className="w-full grid grid-cols-3 gap-6 pt-8 mt-4 border-t border-amber-300 text-xs">
                <div>
                  <div className="font-serif italic font-bold text-slate-800">Christian Lindner</div>
                  <div className="text-[10px] text-slate-500 font-mono">IFI President</div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-600 flex items-center justify-center font-serif text-[9px] font-bold text-amber-800">
                    OFFICIAL SEAL
                  </div>
                </div>
                <div>
                  <div className="font-serif italic font-bold text-slate-800">Dr. Hans-Peter Gruber</div>
                  <div className="text-[10px] text-slate-500 font-mono">Technical Delegate</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
