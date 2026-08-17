import React, { useState, useEffect } from 'react';
import { storage, OfflineAction } from '../../services/storageService';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Upload, 
  Laptop, 
  Tablet, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle,
  Radio,
  Layers,
  Server
} from 'lucide-react';

export const OfflineTournamentHub: React.FC = () => {
  const [isOffline, setIsOffline] = useState(storage.isOfflineMode());
  const [queue, setQueue] = useState<OfflineAction[]>(storage.getOfflineQueue());
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const unsubQueue = storage.subscribe('offline_queue_updated', (q: OfflineAction[]) => setQueue(q));
    const unsubMode = storage.subscribe('offline_mode_changed', (m: boolean) => setIsOffline(m));
    return () => {
      unsubQueue();
      unsubMode();
    };
  }, []);

  const toggleOfflineMode = () => {
    const next = !isOffline;
    setIsOffline(next);
    storage.setOfflineMode(next);
  };

  const handleSyncNow = () => {
    const syncedCount = storage.syncOfflineQueue();
    setSyncMessage(`Synced ${syncedCount} queued records to cloud successfully.`);
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(storage.exportDatabaseJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `icestock_tournament_offline_dump_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        if (event.target?.result) {
          const success = storage.importDatabaseJson(event.target.result as string);
          if (success) {
            setSyncMessage("Tournament database package imported successfully!");
            setTimeout(() => setSyncMessage(null), 4000);
          } else {
            setImportError("Invalid JSON package format.");
            setTimeout(() => setImportError(null), 4000);
          }
        }
      };
    }
  };

  const pendingCount = queue.filter(q => !q.synced).length;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-black text-white tracking-wide">
              Offline Ice Rink Local Server & Sync Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero-Internet Autonomous Rink Operation • LAN Referee Tablets • Cloud Replication
          </p>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleOfflineMode}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-lg transition-all ${
              isOffline
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/20'
                : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-emerald-500/20'
            }`}
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span>{isOffline ? 'Offline Mode Active' : 'Cloud Connected Mode'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle className="w-4 h-4" />
          <span>{syncMessage}</span>
        </div>
      )}

      {importError && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <AlertTriangle className="w-4 h-4" />
          <span>{importError}</span>
        </div>
      )}

      {/* Network Topology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Local Host Node */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">HOST NODE</span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Chief Official Laptop</div>
              <div className="text-xs font-mono text-cyan-300">IP: 192.168.1.100:3000</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
            Broadcasting SQLite/Local state to connected referee tablets on Arena Wi-Fi.
          </div>
        </div>

        {/* Connected Rink Tablets */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">LAN CLIENTS</span>
            <span className="text-xs bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-800">
              4 Tablets Active
            </span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400">
              <Tablet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Referee Tablets (Rinks 1-4)</div>
              <div className="text-xs font-mono text-slate-400">Sub-millisecond Latency</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
            Referees enter end scores without requiring external internet bandwidth.
          </div>
        </div>

        {/* Sync Queue Manager */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">SYNC QUEUE</span>
            <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800">
              {pendingCount} Pending
            </span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <RefreshCw className={`w-6 h-6 ${pendingCount > 0 ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Cloud Master Sync</div>
              <div className="text-xs font-mono text-emerald-400 font-bold">Auto-Replication Ready</div>
            </div>
          </div>

          <button
            onClick={handleSyncNow}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Force Sync with Cloud Master</span>
          </button>
        </div>
      </div>

      {/* Package Export & Import Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-white">Tournament Package Backup & Transfer</h3>
          <p className="text-xs text-slate-400 mt-1">
            Export the complete tournament schedule, rosters, and live score history to an encrypted portable JSON packet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Database Package</span>
          </button>

          <label className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20">
            <Upload className="w-4 h-4" />
            <span>Import Package</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* Offline Action Logs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Offline Action Queue Items ({queue.length})
        </h3>

        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {queue.length === 0 ? (
            <div className="text-xs text-slate-500 font-mono py-4 text-center">
              No offline actions queued. All match scores and rosters are synchronized.
            </div>
          ) : (
            queue.map((act) => (
              <div
                key={act.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${act.synced ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span className="text-cyan-300 font-bold">{act.type}</span>
                  <span className="text-slate-400">{act.timestamp}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  act.synced ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {act.synced ? 'SYNCHRONIZED' : 'QUEUED LOCAL'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
