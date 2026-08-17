import React, { useState } from 'react';
import { Match, DistanceAttempt } from '../../types';
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
  Award
} from 'lucide-react';

interface OneByOneIndividualDistanceScorerProps {
  match: Match;
  isRefereeLocked: boolean;
  onUpdateMatch: (updatedMatch: Match) => void;
  onShowToast: (msg: string) => void;
}

export const OneByOneIndividualDistanceScorer: React.FC<OneByOneIndividualDistanceScorerProps> = ({
  match,
  isRefereeLocked,
  onUpdateMatch,
  onShowToast
}) => {
  const [activeCompetitorKey, setActiveCompetitorKey] = useState<'p-3' | 'p-5'>('p-3');
  const [customDistanceInput, setCustomDistanceInput] = useState<string>('126.80');

  const p1Id = match.player1?.id || 'p-3';
  const p2Id = match.player2?.id || 'p-5';

  const competitor1Name = match.player1?.name || match.team1?.name || 'Competitor 1';
  const competitor2Name = match.player2?.name || match.team2?.name || 'Competitor 2';
  const competitor1Flag = match.player1?.flag || match.team1?.flag || '🇩🇪';
  const competitor2Flag = match.player2?.flag || match.team2?.flag || '🇦🇹';

  const allDistanceAttempts = match.scores.distanceAttempts || {};
  const p1Attempts: DistanceAttempt[] = allDistanceAttempts[p1Id] || allDistanceAttempts['p-3'] || [];
  const p2Attempts: DistanceAttempt[] = allDistanceAttempts[p2Id] || allDistanceAttempts['p-5'] || [];

  const currentAthleteAttempts = activeCompetitorKey === 'p-3' ? p1Attempts : p2Attempts;
  const activeCompetitorName = activeCompetitorKey === 'p-3' ? competitor1Name : competitor2Name;
  const activeCompetitorFlag = activeCompetitorKey === 'p-3' ? competitor1Flag : competitor2Flag;

  const bestMap = match.scores.bestDistance || {};
  const p1Best = bestMap[p1Id] || bestMap['p-3'] || (p1Attempts.filter(a => a.isValid).length > 0 ? Math.max(...p1Attempts.filter(a => a.isValid).map(a => a.distanceMeters)) : 0);
  const p2Best = bestMap[p2Id] || bestMap['p-5'] || (p2Attempts.filter(a => a.isValid).length > 0 ? Math.max(...p2Attempts.filter(a => a.isValid).map(a => a.distanceMeters)) : 0);

  const activeBest = activeCompetitorKey === 'p-3' ? p1Best : p2Best;

  // Record an attempt
  const handleRecordAttempt = (meters: number, isValid: boolean) => {
    if (isRefereeLocked) return;

    if (currentAthleteAttempts.length >= 5) {
      onShowToast(`Athlete ${activeCompetitorName} has completed all 5 official attempts.`);
      return;
    }

    const updatedAttemptsMap = { ...allDistanceAttempts };
    const athleteAttempts = [...currentAthleteAttempts];

    const wind = parseFloat((Math.random() * 3 + 1.5).toFixed(1));
    const speed = isValid ? parseFloat((meters * 0.58).toFixed(1)) : 0;

    const newAttempt: DistanceAttempt = {
      attemptNumber: athleteAttempts.length + 1,
      distanceMeters: isValid ? meters : 0,
      isValid,
      windSpeedKmh: wind,
      iceTempCelsius: -5.4,
      speedKmh: speed,
      isDone: true
    };

    athleteAttempts.push(newAttempt);
    updatedAttemptsMap[activeCompetitorKey] = athleteAttempts;

    const valids = athleteAttempts.filter(a => a.isValid);
    const newBest = valids.length > 0 ? Math.max(...valids.map(a => a.distanceMeters)) : 0;

    const updatedBestMap = {
      ...bestMap,
      [activeCompetitorKey]: newBest
    };

    const t1BestVal = activeCompetitorKey === 'p-3' ? newBest : p1Best;
    const t2BestVal = activeCompetitorKey === 'p-5' ? newBest : p2Best;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        distanceAttempts: updatedAttemptsMap,
        bestDistance: updatedBestMap,
        team1TotalScore: Math.round(t1BestVal),
        team2TotalScore: Math.round(t2BestVal)
      }
    };

    onUpdateMatch(updatedMatch);
    onShowToast(
      isValid 
        ? `✓ Recorded ${meters}m (Attempt ${athleteAttempts.length}/5) for ${activeCompetitorName}`
        : `Recorded FOUL (Attempt ${athleteAttempts.length}/5) for ${activeCompetitorName}`
    );
  };

  // Mark Active Competitor as DONE
  const handleMarkCompetitorDone = () => {
    if (isRefereeLocked) return;

    onShowToast(`✓ ${activeCompetitorName} marked DONE with Best Throw of ${activeBest}m!`);

    if (activeCompetitorKey === 'p-3') {
      setActiveCompetitorKey('p-5');
    }
  };

  // Reset Athlete Attempts
  const handleResetAttempts = () => {
    if (isRefereeLocked) return;

    const updatedAttemptsMap = { ...allDistanceAttempts };
    updatedAttemptsMap[activeCompetitorKey] = [];

    const updatedBestMap = {
      ...bestMap,
      [activeCompetitorKey]: 0
    };

    const t1BestVal = activeCompetitorKey === 'p-3' ? 0 : p1Best;
    const t2BestVal = activeCompetitorKey === 'p-5' ? 0 : p2Best;

    const updatedMatch: Match = {
      ...match,
      scores: {
        ...match.scores,
        distanceAttempts: updatedAttemptsMap,
        bestDistance: updatedBestMap,
        team1TotalScore: Math.round(t1BestVal),
        team2TotalScore: Math.round(t2BestVal)
      }
    };

    onUpdateMatch(updatedMatch);
    onShowToast(`Reset distance attempts for ${activeCompetitorName}`);
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
                Individual Distance One-by-One Scoring Engine
              </h3>
              <span className="text-[11px] font-mono bg-cyan-950/90 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                ONE-BY-ONE "DONE" SYSTEM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Competitors throw one-by-one with 5 attempts max. Laser telemetry measures throw distance and velocity in the funnel corridor.
            </p>
          </div>
        </div>

        {/* Global Match Standing Pill */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-blue-400 font-bold uppercase">{competitor1Name}</span>
            <div className="text-xl font-black text-white">{p1Best} <span className="text-xs text-slate-500 font-normal">m</span></div>
          </div>
          <span className="text-slate-600 font-black text-lg">:</span>
          <div className="text-left">
            <span className="text-[10px] text-red-400 font-bold uppercase">{competitor2Name}</span>
            <div className="text-xl font-black text-white">{p2Best} <span className="text-xs text-slate-500 font-normal">m</span></div>
          </div>
        </div>
      </div>

      {/* Competitor Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveCompetitorKey('p-3')}
          className={`p-4 rounded-xl font-bold flex items-center justify-between transition-all ${
            activeCompetitorKey === 'p-3'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{competitor1Flag}</span>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-blue-200 font-mono">ATHLETE 1</span>
              <h4 className="text-base font-black text-white">{competitor1Name}</h4>
              <span className="text-xs text-blue-200 font-mono">{p1Attempts.length}/5 throws recorded</span>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xl font-black text-white">{p1Best}</span>
            <span className="text-xs text-blue-200 block">meters (Best)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveCompetitorKey('p-5')}
          className={`p-4 rounded-xl font-bold flex items-center justify-between transition-all ${
            activeCompetitorKey === 'p-5'
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-500/20 ring-2 ring-red-400/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{competitor2Flag}</span>
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-red-200 font-mono">ATHLETE 2</span>
              <h4 className="text-base font-black text-white">{competitor2Name}</h4>
              <span className="text-xs text-red-200 font-mono">{p2Attempts.length}/5 throws recorded</span>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xl font-black text-white">{p2Best}</span>
            <span className="text-xs text-red-200 block">meters (Best)</span>
          </div>
        </button>
      </div>

      {/* Active Athlete Laser Telemetry Input Station */}
      <div className="bg-slate-950/90 border-2 border-cyan-500/30 rounded-3xl p-6 flex flex-col gap-6 shadow-inner">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeCompetitorFlag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-white">{activeCompetitorName}</h4>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {currentAthleteAttempts.length}/5 Attempts
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Laser Measurement Station • Standard 250m Corridor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase">Best Throw Recorded</span>
              <div className="text-2xl font-black text-cyan-400">
                {activeBest > 0 ? `${activeBest} m` : '0.00 m'}
              </div>
            </div>

            <button
              onClick={handleResetAttempts}
              disabled={isRefereeLocked}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 text-xs transition-colors disabled:opacity-40"
              title="Reset Competitor Throws"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Environmental Telemetry Sensors */}
        <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Wind className="w-4 h-4 text-cyan-400" />
            <span>WIND: 3.1 km/h</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Thermometer className="w-4 h-4 text-blue-400" />
            <span>ICE TEMP: -5.6°C</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>CORRIDOR: CLEAR</span>
          </div>
        </div>

        {/* Throw Input Controls */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              Record Attempt #{currentAthleteAttempts.length + 1} of 5
            </span>
            <span className="text-xs font-mono text-slate-400">
              Tolerance ±1.0mm • Official Rule 400
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
                disabled={isRefereeLocked || currentAthleteAttempts.length >= 5}
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
              disabled={isRefereeLocked || currentAthleteAttempts.length >= 5}
              className="sm:col-span-3 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Entered ({customDistanceInput}m)</span>
            </button>

            {/* Simulated Laser Rangefinder Trigger */}
            <button
              onClick={() => {
                const randomDistance = parseFloat((Math.random() * 20 + 118).toFixed(2));
                setCustomDistanceInput(randomDistance.toString());
                handleRecordAttempt(randomDistance, true);
              }}
              disabled={isRefereeLocked || currentAthleteAttempts.length >= 5}
              className="sm:col-span-3 py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-40"
            >
              <Flame className="w-4 h-4" />
              <span>Auto Laser Measure</span>
            </button>

            {/* Foul / Invalid Button */}
            <button
              onClick={() => handleRecordAttempt(0, false)}
              disabled={isRefereeLocked || currentAthleteAttempts.length >= 5}
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

            {currentAthleteAttempts.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500 font-mono bg-slate-950/40 rounded-xl border border-slate-900">
                No attempts recorded yet. Use the controls above to record throw.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {currentAthleteAttempts.map((att) => (
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
              onClick={handleMarkCompetitorDone}
              disabled={isRefereeLocked}
              className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
            >
              <UserCheck className="w-4 h-4" />
              <span>✓ Mark {activeCompetitorName} DONE & Switch (Best: {activeBest}m)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
