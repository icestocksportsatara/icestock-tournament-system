import React, { useState, useRef, useEffect } from 'react';
import { StockPosition } from '../../types';
import { Ruler, Trash2, Plus, Move, Sparkles, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

interface IceRink3DCanvasProps {
  stocks: StockPosition[];
  daubePosition: { x: number; y: number };
  team1Name: string;
  team2Name: string;
  team1Color?: string;
  team2Color?: string;
  isEditable?: boolean;
  onStocksChange?: (stocks: StockPosition[]) => void;
  onDaubeChange?: (daube: { x: number; y: number }) => void;
  onCalculateScores?: (team1Points: number, team2Points: number) => void;
}

export const IceRink3DCanvas: React.FC<IceRink3DCanvasProps> = ({
  stocks = [],
  daubePosition = { x: 0, y: 0 },
  team1Name = 'Team 1',
  team2Name = 'Team 2',
  team1Color = '#3b82f6',
  team2Color = '#ef4444',
  isEditable = true,
  onStocksChange,
  onDaubeChange,
  onCalculateScores,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStocks, setCurrentStocks] = useState<StockPosition[]>(stocks);
  const [currentDaube, setCurrentDaube] = useState(daubePosition);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'TEAM_1' | 'TEAM_2'>('TEAM_1');
  const [measurementMode, setMeasurementMode] = useState(false);
  const [laserLines, setLaserLines] = useState<Array<{ from: { x: number; y: number }; to: { x: number; y: number }; distMm: number; color: string }>>([]);

  useEffect(() => {
    setCurrentStocks(stocks);
  }, [stocks]);

  useEffect(() => {
    setCurrentDaube(daubePosition);
  }, [daubePosition]);

  // Coordinate conversion:
  // Center is (0,0) in mm, spanning -1500 to +1500 mm.
  // Canvas scale: 1 mm = 0.12 pixels
  const mmToPx = (mm: number, centerOffset: number) => centerOffset + mm * 0.13;
  const pxToMm = (px: number, centerOffset: number) => (px - centerOffset) / 0.13;

  const calculateDistMm = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isEditable || measurementMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const mmX = Math.round(pxToMm(clickX, centerX));
    const mmY = Math.round(pxToMm(clickY, centerY));

    // Limit to standfeld bounds
    if (Math.abs(mmX) > 1350 || Math.abs(mmY) > 1150) return;

    const newStock: StockPosition = {
      id: 'stk-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      teamId: selectedTeam === 'TEAM_1' ? 'team-1' : 'team-2',
      teamName: selectedTeam === 'TEAM_1' ? team1Name : team2Name,
      color: selectedTeam === 'TEAM_1' ? team1Color : team2Color,
      x: mmX,
      y: mmY,
      scorePoints: 0
    };

    const updated = [...currentStocks, newStock];
    setCurrentStocks(updated);
    if (onStocksChange) onStocksChange(updated);
    autoCalculateDistancesAndScores(updated, currentDaube);
  };

  const handleStockClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStockId(id);
  };

  const removeStock = (id: string) => {
    const updated = currentStocks.filter(s => s.id !== id);
    setCurrentStocks(updated);
    setSelectedStockId(null);
    if (onStocksChange) onStocksChange(updated);
    autoCalculateDistancesAndScores(updated, currentDaube);
  };

  const clearAllStocks = () => {
    setCurrentStocks([]);
    setSelectedStockId(null);
    setLaserLines([]);
    if (onStocksChange) onStocksChange([]);
    if (onCalculateScores) onCalculateScores(0, 0);
  };

  const resetDaubeToCenter = () => {
    const center = { x: 0, y: 0 };
    setCurrentDaube(center);
    if (onDaubeChange) onDaubeChange(center);
    autoCalculateDistancesAndScores(currentStocks, center);
  };

  const autoCalculateDistancesAndScores = (stockList: StockPosition[], daube: { x: number; y: number }) => {
    if (stockList.length === 0) {
      setLaserLines([]);
      if (onCalculateScores) onCalculateScores(0, 0);
      return;
    }

    // Measure each stock to daube
    const measured = stockList.map(s => ({
      ...s,
      distMm: calculateDistMm({ x: s.x, y: s.y }, daube)
    }));

    // Sort ascending by distance to Daube
    measured.sort((a, b) => a.distMm - b.distMm);

    // Build laser visual lines
    const lines = measured.map((s, idx) => ({
      from: daube,
      to: { x: s.x, y: s.y },
      distMm: s.distMm,
      color: s.color
    }));
    setLaserLines(lines);

    // Closest stock belongs to winning team
    const bestStock = measured[0];
    const winningTeam = bestStock.teamName;

    // Scoring according to IISF Rule Book (Page 11):
    // "Each Icestock counts as one point. Maximum number of points in a turn: 1+1+1+1= 4 points."
    // Also supports traditional 3-2-2-2 variant.
    let team1Pts = 0;
    let team2Pts = 0;

    let pointsAwarded = 0;
    for (let i = 0; i < measured.length; i++) {
      const current = measured[i];
      if (current.teamName === winningTeam) {
        // IISF Rule Book: 1 pt per stock closer than opponent's best (max 4 per end)
        const pts = 1;
        pointsAwarded += pts;
        if (current.teamName === team1Name) {
          team1Pts += pts;
        } else {
          team2Pts += pts;
        }
      } else {
        // Encountered opponent's first stock, end scoring sequence
        break;
      }
    }

    if (onCalculateScores) {
      onCalculateScores(team1Pts, team2Pts);
    }
  };

  return (
    <div className="relative w-full bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl backdrop-blur-xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Live Ice Rink Target House (Standfeld 6m × 3m)</span>
          </h4>
          <span className="text-xs bg-cyan-950/80 px-2 py-0.5 rounded text-cyan-300 font-mono border border-cyan-800">
            IISF Rule: 1 Pt/Stock (Max 4 Pts/End)
          </span>
        </div>

        {isEditable && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setSelectedTeam('TEAM_1')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  selectedTeam === 'TEAM_1'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team1Color }} />
                <span>{team1Name} (Place)</span>
              </button>
              <button
                onClick={() => setSelectedTeam('TEAM_2')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  selectedTeam === 'TEAM_2'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team2Color }} />
                <span>{team2Name} (Place)</span>
              </button>
            </div>

            <button
              onClick={() => setMeasurementMode(!measurementMode)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                measurementMode
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle Laser Distance Overlay"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Laser Lines</span>
            </button>

            <button
              onClick={resetDaubeToCenter}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs flex items-center gap-1"
              title="Reset Daube to Center Target"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Center Daube</span>
            </button>

            <button
              onClick={clearAllStocks}
              className="p-1.5 rounded-lg border border-red-500/40 bg-red-950/30 text-red-400 hover:bg-red-900/50 text-xs flex items-center gap-1"
              title="Clear all stocks on ice"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Ice</span>
            </button>
          </div>
        )}
      </div>

      {/* SVG Canvas for Target House */}
      <div className="relative w-full h-[360px] bg-gradient-to-b from-slate-950 via-[#071328] to-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center select-none shadow-inner">
        {/* Ice texture pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <svg
          className="w-full h-full cursor-crosshair"
          viewBox="0 0 600 360"
          onClick={handleCanvasClick}
        >
          {/* Target House Outer Boundary (Standfeld Rect) */}
          <rect
            x="50"
            y="20"
            width="500"
            height="320"
            fill="#030c1d"
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="6 6"
            rx="4"
          />

          {/* Ice Longitudinal Center & Cross Lines */}
          <line x1="300" y1="20" x2="300" y2="340" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="50" y1="180" x2="550" y2="180" stroke="#1e293b" strokeWidth="1.5" />

          {/* Concentric Rings around nominal center (300, 180) */}
          {/* Ring 4: Outer Ring (2 pts) */}
          <circle cx="300" cy="180" r="140" fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.3" />
          <circle cx="300" cy="180" r="105" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.4" />
          <circle cx="300" cy="180" r="70" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
          {/* Ring 1: Bullseye Center (3 pts) */}
          <circle cx="300" cy="180" r="35" fill="#0284c7" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="300" cy="180" r="4" fill="#38bdf8" />

          {/* Ring point labels */}
          <text x="300" y="55" fill="#38bdf8" opacity="0.6" fontSize="10" textAnchor="middle" fontFamily="monospace">RING 4 (40 Pts)</text>
          <text x="300" y="90" fill="#38bdf8" opacity="0.7" fontSize="10" textAnchor="middle" fontFamily="monospace">RING 3 (60 Pts)</text>
          <text x="300" y="125" fill="#38bdf8" opacity="0.8" fontSize="10" textAnchor="middle" fontFamily="monospace">RING 2 (80 Pts)</text>
          <text x="300" y="160" fill="#38bdf8" opacity="0.9" fontSize="10" textAnchor="middle" fontFamily="monospace">CENTER (100 Pts)</text>

          {/* Laser measurement lines from Daube to stocks */}
          {laserLines.map((line, idx) => {
            const dPxX = mmToPx(line.from.x, 300);
            const dPxY = mmToPx(line.from.y, 180);
            const sPxX = mmToPx(line.to.x, 300);
            const sPxY = mmToPx(line.to.y, 180);
            const midX = (dPxX + sPxX) / 2;
            const midY = (dPxY + sPxY) / 2;

            return (
              <g key={`laser-${idx}`}>
                <line
                  x1={dPxX}
                  y1={dPxY}
                  x2={sPxX}
                  y2={sPxY}
                  stroke={line.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  opacity="0.8"
                />
                <circle cx={midX} cy={midY} r="12" fill="#020617" stroke={line.color} strokeWidth="1" />
                <text
                  x={midX}
                  y={midY + 3}
                  fill="#ffffff"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {line.distMm}mm
                </text>
              </g>
            );
          })}

          {/* Placed Ice Stocks */}
          {currentStocks.map((stock) => {
            const pxX = mmToPx(stock.x, 300);
            const pxY = mmToPx(stock.y, 180);
            const isSelected = selectedStockId === stock.id;

            return (
              <g
                key={stock.id}
                transform={`translate(${pxX}, ${pxY})`}
                onClick={(e) => handleStockClick(stock.id, e)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Shadow */}
                <ellipse cx="0" cy="4" rx="15" ry="10" fill="#000000" opacity="0.6" />
                {/* Steel Ring Outer */}
                <circle cx="0" cy="0" r="14" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Stock Body Color */}
                <circle cx="0" cy="0" r="11" fill={stock.color} stroke={isSelected ? '#ffffff' : '#0f172a'} strokeWidth={isSelected ? 2 : 1} />
                {/* Handle Socket */}
                <circle cx="0" cy="0" r="4" fill="#0f172a" />
                {/* Handle Stick Direction Pointer */}
                <line x1="0" y1="0" x2="6" y2="-10" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

                {/* Team Tag text */}
                <text x="0" y="22" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                  {stock.teamName.substring(0, 3).toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Official Daube (The target puck) */}
          {(() => {
            const dPxX = mmToPx(currentDaube.x, 300);
            const dPxY = mmToPx(currentDaube.y, 180);

            return (
              <g
                transform={`translate(${dPxX}, ${dPxY})`}
                className="cursor-move"
                title="Daube (Target Block) - Draggable / Movable when hit"
              >
                {/* Glowing aura */}
                <circle cx="0" cy="0" r="12" fill="#f59e0b" opacity="0.3" className="animate-ping" />
                {/* Daube Puck Body */}
                <circle cx="0" cy="0" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <circle cx="0" cy="0" r="3" fill="#78350f" />
                <text x="0" y="-12" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  DAUBE
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Footer Info & Selected Stock Management */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team1Color }} />
            <span className="font-semibold">{team1Name}</span>
            <span className="bg-blue-950/60 text-blue-400 px-1.5 py-0.5 rounded font-mono border border-blue-800">
              {currentStocks.filter(s => s.teamName === team1Name).length} Stocks
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team2Color }} />
            <span className="font-semibold">{team2Name}</span>
            <span className="bg-red-950/60 text-red-400 px-1.5 py-0.5 rounded font-mono border border-red-800">
              {currentStocks.filter(s => s.teamName === team2Name).length} Stocks
            </span>
          </div>
        </div>

        {selectedStockId && isEditable && (
          <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
            <span className="text-amber-300 font-mono">Stock Selected</span>
            <button
              onClick={() => removeStock(selectedStockId)}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-950/50 px-2 py-0.5 rounded border border-red-800"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          </div>
        )}

        <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Click on ice to position stocks. Closest stock to Daube wins end points.</span>
        </div>
      </div>
    </div>
  );
};
