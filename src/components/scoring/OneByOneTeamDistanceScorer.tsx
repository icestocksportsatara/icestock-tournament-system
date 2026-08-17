import React, { useState } from 'react';
import { Match, PlayerDistanceScore, DistanceAttempt } from '../../types';
import { 
  Ruler, 
  CheckCircle2, 
  Flame, 
  RotateCcw, 
  UserCheck, 
  ArrowRight, 
  Wind, 
  Thermometer, 
  Gauge, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface OneByOneTeamDistanceScorerProps {
  match: Match;
  isRefereeLocked: boolean;
  onUpdateMatch: (updatedMatch: Match) => void;
  onShowToast: (msg: string) => void;
}

export const OneByOneTeamDistanceScorer: React.FC<OneByOneTeamDistanceScorerProps> = ({
  match,
  isRefereeLocked,
  onUpdateMatch,
  onShowToast
}) => {
  const [activeTeamKey, setActiveTeamKey] = useState<'team1' | 'team2'>('team1');
  const [activeAthleteIndex, setActiveAthleteIndex] = useState<number>(0);
  const [customDistanceInput, setCustomDistanceInput] = useState<string>('124.50');

  // Default rosters for 4 distance athletes per team
  const defaultTeam1Athletes: PlayerDistanceScore[] = match.scores.team1DistancePlayers || [
    {
      playerId: 'p-3',
      playerName: 'Markus Schätz',
      playerNumber: 1,
      isDone: false,
      bestDistance: 0,
      attempts: []
    },
    {
      playerId: 'p-ger-d2',
      playerName: 'Rene Aichner',
      playerNumber: 2,
      isDone: false,
      bestDistance: 0,
      attempts: []
    },
    {
      playerId: 'p-ger-d3',
      playerName: 'Martin Kerschbaumer',
      playerNumber: 3,
      isDone: false,
      bestDistance: 0,
      attempts: []
    },
    {
      playerId: 'p-ger-d4',
      playerName: 'Roman Zublasing',
      playerNumber: 4,
      isDone: false,
      bestDistance: 0,
      attempts: []
    }
  ];

  const defaultTeam2Athletes: PlayerDistanceScore[] = match.scores.team2DistancePlayers || [
    {
      playerId: 'p-5',
      playerName: 'Peter Neubauer',
      playerNumber: 1,
      isDone: false,
      bestDistance: 0,
      attempts: []
    },
    {
      playerId: 'p-aut-d2',
      playerName: 'Bernhard Patschg',
      playerNumber: 2,
      isDone: false,
      bestDistance: 0,
      attempts: []
    },
    {
      playerId: 'p-aut-d3',
      playerName: 'Alexander Bischof',
      playerNumber: 3,
      isDone: false,
      bestDistance: 0,
      attempts: []
    },
    {
      playerId: 'p-aut-d4',
      playerName: 'Michael Ederegger',
      playerNumber: 4,
      isDone: false,
      bestDistance: 0,
      attempts: []
    }
  ];

  const currentAthletes = activeTeamKey === 'team1' ? defaultTeam1Athletes : defaultTeam2Athletes;
  const activeAthlete = currentAthletes[activeAthleteIndex] || currentAthletes[0];

  const team1Name = match.team1?.name || 'Team 1';
  const team2Name = match.team2?.name || 'Team 2';
  const team1Short = match.team1?.shortName || 'T1';
  const team2Short = match.team2?.shortName || 'T2';

  // Calculate team total distance (sum of all 4 athletes' best valid throws)
  const team1TotalDistance = parseFloat(
    defaultTeam1Athletes.reduce((sum, a) => sum + (a.bestDistance || 0), 0).toFixed(2)
  );
  const team2TotalDistance = parseFloat(
    defaultTeam2Athletes.reduce((sum, a) => sum + (a.bestDistance || 0), 0).toFixed(2)
  );

  // Record a Distance Attempt (Valid or Foul)
  const handleRecordAttempt = (meters: number, isValid: boolean) => {
    if (isRefereeLocked) return;

    if (activeAthlete.attempts.length >= 5) {
      onShowToast(`Athlete ${activeAthlete.playerName} has already completed all 5 official attempts.`);
      return;
    }

    const teamKey = activeTeamKey === 'team1' ? 'team1DistancePlayers' : 'team2DistancePlayers';
    const updatedList = [...(activeTeamKey === 'team1' ? defaultTeam1Athletes : defaultTeam2Athletes)];
    const athlete = { ...updatedList[activeAthleteIndex] };
    const attempts = [...athlete.attempts];

    const wind = parseFloat((Math.random() * 3 + 1.5).toFixed(1));
    const speed = isValid ? parseFloat((meters * 0.58).toFixed(1)) : 0;

    const newAttempt: DistanceAttempt = {
      attemptNumber: attempts.length + 1,
      distanceMeters: isValid ? meters : 0,
      isValid,
      windSpeedKmh: wind,
      iceTempCelsius: -5.4,
      speedKmh: speed,
      isDone: true
    };

    attempts.push(newAttempt);
    athlete.attempts = attempts;

    const valids = attempts.filter(a => a.isValid);
    athlete.bestDistance = valids.length > 0 ? Math.max(...valids.map(a => a.distanceMeters)) : 0;
    updatedList[activeAthleteIndex] = athlete;

    const t1Sum = activeTeamKey === 'team1' 
      ? parseFloat(updatedList.reduce((s, x) => s + (x.bestDistance || 0), 0).toFixed(2))
      : team1TotalDistance;
    const t2Sum = activeTeamKey === 'team2' 
      ? parseFloat(updatedList.reduce((s, x) => s + (x.bestDistance || 0), 0).toFixed(2))
      : team2TotalDistance;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        [teamKey]: updatedList,
        team1TotalScore: Math.round(t1Sum),
        team2TotalScore: Math.round(t2Sum)
      }
    };

    onUpdateMatch(updatedMatch);
    onShowToast(
      isValid 
        ? `✓ Recorded ${meters}m (Attempt ${attempts.length}/5) for ${athlete.playerName}` 
        : `Recorded FOUL (Attempt ${attempts.length}/5) for ${athlete.playerName}`
    );
  };

  // Mark Athlete as DONE
  const handleMarkAthleteDone = () => {
    if (isRefereeLocked) return;

    const teamKey = activeTeamKey === 'team1' ? 'team1DistancePlayers' : 'team2DistancePlayers';
    const updatedList = [...(activeTeamKey === 'team1' ? defaultTeam1Athletes : defaultTeam2Athletes)];
    const athlete = { ...updatedList[activeAthleteIndex] };

    athlete.isDone = true;
    const valids = athlete.attempts.filter(a => a.isValid);
    athlete.bestDistance = valids.length > 0 ? Math.max(...valids.map(a => a.distanceMeters)) : 0;
    updatedList[activeAthleteIndex] = athlete;

    const t1Sum = activeTeamKey === 'team1' 
      ? parseFloat(updatedList.reduce((s, x) => s + (x.bestDistance || 0), 0).toFixed(2))
      : team1TotalDistance;
    const t2Sum = activeTeamKey === 'team2' 
      ? parseFloat(updatedList.reduce((s, x) => s + (x.bestDistance || 0), 0).toFixed(2))
      : team2TotalDistance;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        [teamKey]: updatedList,
        team1TotalScore: Math.round(t1Sum),
        team2TotalScore: Math.round(t2Sum)
      }
    };

    onUpdateMatch(updatedMatch);
    onShowToast(`✓ ${athlete.playerName} marked DONE with best throw of ${athlete.bestDistance}m!`);

    if (activeAthleteIndex < 3) {
      setActiveAthleteIndex(activeAthleteIndex + 1);
    } else {
      onShowToast(`All 4 distance athletes of ${activeTeamKey === 'team1' ? team1Short : team2Short} completed!`);
    }
  };

  // Reset Athlete Attempts
  const handleResetAthlete = () => {
    if (isRefereeLocked) return;

    const teamKey = activeTeamKey === 'team1' ? 'team1DistancePlayers' : 'team2DistancePlayers';
    const updatedList = [...(activeTeamKey === 'team1' ? defaultTeam1Athletes : defaultTeam2Athletes)];
    const athlete = { ...updatedList[activeAthleteIndex] };

    athlete.attempts = [];
    athlete.bestDistance = 0;
    athlete.isDone = false;
    updatedList[activeAthleteIndex] = athlete;

    const t1Sum = activeTeamKey === 'team1' 
      ? parseFloat(updatedList.reduce((s, x) => s + (x.bestDistance || 0), 0).toFixed(2))
      : team1TotalDistance;
    const t2Sum = activeTeamKey === 'team2' 
      ? parseFloat(updatedList.reduce((s, x) => s + (x.bestDistance || 0), 0).toFixed(2))
      : team2TotalDistance;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        [teamKey]: updatedList,
        team1TotalScore: Math.round(t1Sum),
        team2TotalScore: Math.round(t2Sum)
      }
    };

    onUpdateMatch(updatedMatch);
    onShowToast(`Reset distance attempts for ${athlete.playerName}`);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
      {/* Header with Done System Badge */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Team Distance One-by-One Scoring Engine
              </h3>
              <span className="text-[11px] font-mono bg-cyan-950/90 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                ONE-BY-ONE "DONE" SYSTEM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official IISF Rule 400: 4 squad athletes throw one-by-one in the funnel track (5 attempts limit per athlete • Furthest valid throw counts)
            </p>
          </div>
        </div>

        {/* Global Team Distance Aggregate Pill */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-blue-400 font-bold uppercase">{team1Short} TEAM DISTANCE</span>
            <div className="text-xl font-black text-white">{team1TotalDistance} <span className="text-xs text-slate-500 font-normal">m</span></div>
          </div>
          <span className="text-slate-600 font-black text-lg">:</span>
          <div className="text-left">
            <span className="text-[10px] text-red-400 font-bold uppercase">{team2Short} TEAM DISTANCE</span>
            <div className="text-xl font-black text-white">{team2TotalDistance} <span className="text-xs text-slate-500 font-normal">m</span></div>
          </div>
        </div>
      </div>

      {/* Team Selection Switcher */}
      <div className="grid grid-cols-2 gap-3 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => {
            setActiveTeamKey('team1');
            setActiveAthleteIndex(0);
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
          <span className="font-mono font-black text-base">{team1TotalDistance} m</span>
        </button>

        <button
          onClick={() => {
            setActiveTeamKey('team2');
            setActiveAthleteIndex(0);
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
          <span className="font-mono font-black text-base">{team2TotalDistance} m</span>
        </button>
      </div>

      {/* 4-Athlete Stepper Timeline (One-by-One Progression) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {currentAthletes.map((athlete, idx) => {
          const isSelected = activeAthleteIndex === idx;
          const isDone = athlete.isDone || athlete.attempts.length === 5;

          return (
            <div
              key={athlete.playerId || idx}
              onClick={() => setActiveAthleteIndex(idx)}
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
                    ATHLETE {idx + 1} OF 4
                  </span>
                  {isDone ? (
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> DONE
                    </span>
                  ) : isSelected ? (
                    <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-bold animate-pulse flex items-center gap-1">
                      🎯 THROWING
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">WAITING</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{athlete.playerName}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">5 Attempts Official Limit</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">{athlete.attempts.length}/5 throws</span>
                <span className="text-base font-black text-cyan-300">
                  {athlete.bestDistance > 0 ? `${athlete.bestDistance} m` : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Athlete Laser Telemetry Input Station */}
      <div className="bg-slate-950/90 border-2 border-cyan-500/30 rounded-3xl p-6 flex flex-col gap-6 shadow-inner">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-black text-xl font-mono text-cyan-300">
              #{activeAthleteIndex + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-white">{activeAthlete.playerName}</h4>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {activeTeamKey === 'team1' ? team1Name : team2Name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Laser Measurement Funnel Track • Attempts: {activeAthlete.attempts.length}/5
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Athlete Best Throw</span>
              <div className="text-2xl font-black text-cyan-400">
                {activeAthlete.bestDistance > 0 ? `${activeAthlete.bestDistance} m` : '0.00 m'}
              </div>
            </div>

            <button
              onClick={handleResetAthlete}
              disabled={isRefereeLocked}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 text-xs transition-colors disabled:opacity-40"
              title="Reset Athlete Throws"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Environmental Telemetry Sensors */}
        <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>WIND: 2.8 km/h</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Thermometer className="w-4 h-4 text-blue-400" />
            <span>ICE TEMP: -5.4°C</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>SURFACE: FIS-APPROVED</span>
          </div>
        </div>

        {/* Throw Input Controls with Done System */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Record Attempt #{activeAthlete.attempts.length + 1} of 5
            </span>
            <span className="text-xs font-mono text-slate-400">
              Laser Distance Telemetry Station (Tolerance ±1.0mm)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Custom Distance Input Field */}
            <div className="sm:col-span-4 flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
              <input
                type="number"
                step="0.01"
                value={customDistanceInput}
                onChange={(e) => setCustomDistanceInput(e.target.value)}
                placeholder="e.g. 128.50"
                disabled={isRefereeLocked || activeAthlete.attempts.length >= 5}
                className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none"
              />
              <span className="text-xs font-mono text-slate-400 font-bold ml-1">meters</span>
            </div>

            {/* Quick Record from Input */}
            <button
              onClick={() => {
                const val = parseFloat(customDistanceInput);
                if (!isNaN(val) && val > 0) {
                  handleRecordAttempt(val, true);
                }
              }}
              disabled={isRefereeLocked || activeAthlete.attempts.length >= 5}
              className="sm:col-span-3 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Entered ({customDistanceInput}m)</span>
            </button>

            {/* Simulated Laser Rangefinder Trigger */}
            <button
              onClick={() => {
                const randomDistance = parseFloat((Math.random() * 20 + 115).toFixed(2));
                setCustomDistanceInput(randomDistance.toString());
                handleRecordAttempt(randomDistance, true);
              }}
              disabled={isRefereeLocked || activeAthlete.attempts.length >= 5}
              className="sm:col-span-3 py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-40"
            >
              <Flame className="w-4 h-4" />
              <span>Auto Laser Measure</span>
            </button>

            {/* Foul / Invalid Button */}
            <button
              onClick={() => handleRecordAttempt(0, false)}
              disabled={isRefereeLocked || activeAthlete.attempts.length >= 5}
              className="sm:col-span-2 py-2.5 px-3 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Foul (X)</span>
            </button>
          </div>

          {/* Historical Attempts Table for Active Athlete */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Attempt History (1 to 5)
            </span>

            {activeAthlete.attempts.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500 font-mono bg-slate-950/40 rounded-xl border border-slate-900">
                No attempts recorded yet. Use the controls above to record throw.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {activeAthlete.attempts.map((att) => (
                  <div
                    key={att.attemptNumber}
                    className={`p-2.5 rounded-xl border text-center font-mono text-xs flex flex-col gap-1 ${
                      att.isValid
                        ? 'bg-slate-950 border-cyan-800/60 text-white'
                        : 'bg-red-950/30 border-red-800 text-red-300'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">Throw #{att.attemptNumber}</div>
                    <div className="text-sm font-black">
                      {att.isValid ? `${att.distanceMeters} m` : 'FOUL (0.00)'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {att.speedKmh} km/h • Wind {att.windSpeedKmh}k
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEDICATED DONE ACTION BUTTON */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleMarkAthleteDone}
              disabled={isRefereeLocked}
              className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
            >
              <UserCheck className="w-4 h-4" />
              <span>✓ Mark Athlete #{activeAthleteIndex + 1} DONE & Advance (Best: {activeAthlete.bestDistance}m)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
