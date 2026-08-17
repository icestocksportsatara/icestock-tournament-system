import React, { useState } from 'react';
import { Tournament, TournamentTier, Discipline, SurfaceType } from '../../types';
import { storage } from '../../services/storageService';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Flame,
  ArrowUpRight,
  Layers
} from 'lucide-react';

interface TournamentListProps {
  onSelectTournament: (tournament: Tournament) => void;
}

export const TournamentList: React.FC<TournamentListProps> = ({ onSelectTournament }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(storage.getTournaments());
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Tournament Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [tier, setTier] = useState<TournamentTier>('NATIONAL');
  const [surface, setSurface] = useState<SurfaceType>('ICE');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Germany');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-18');
  const [rinksCount, setRinksCount] = useState(6);
  const [prizePool, setPrizePool] = useState('€25,000');
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([
    'TEAM_GAME',
    'INDIVIDUAL_TARGET'
  ]);

  const filteredTournaments = tournaments.filter((t) => {
    if (tierFilter !== 'ALL' && t.tier !== tierFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    const newTour: Tournament = {
      id: 'tour-' + Date.now(),
      name: name || 'New Icestock Open Championship',
      code: code || 'NOC-2026',
      tier,
      discipline: selectedDisciplines.length > 0 ? selectedDisciplines : ['TEAM_GAME'],
      category: ['MEN', 'WOMEN', 'MIXED'],
      surface,
      startDate,
      endDate,
      location: {
        venue: venue || 'Olympic Ice Hall',
        city: city || 'Munich',
        country: country || 'Germany'
      },
      status: 'REGISTRATION_OPEN',
      organizer: 'National Icestock Federation',
      sanctionedBy: 'IFI Official Sanction Committee',
      rinksCount: Number(rinksCount),
      totalTeams: 16,
      totalPlayers: 64,
      totalPrizePool: prizePool,
      bannerImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&auto=format&fit=crop&q=80',
      featured: false,
      registrationDeadline: startDate,
      registeredTeamIds: [],
      registeredPlayerIds: []
    };

    storage.saveTournament(newTour);
    setTournaments(storage.getTournaments());
    setIsCreateModalOpen(false);
    onSelectTournament(newTour);
  };

  const toggleDiscipline = (disc: Discipline) => {
    if (selectedDisciplines.includes(disc)) {
      setSelectedDisciplines(selectedDisciplines.filter(d => d !== disc));
    } else {
      setSelectedDisciplines([...selectedDisciplines, disc]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header & Filters */}
      <div className="bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-white tracking-wide">
              Global Tournament Central
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            6-Tier Hierarchy: International • Continental • National • State • District • Club
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Tiers</option>
            <option value="INTERNATIONAL">International</option>
            <option value="CONTINENTAL">Continental</option>
            <option value="NATIONAL">National</option>
            <option value="STATE">State</option>
            <option value="DISTRICT">District</option>
            <option value="CLUB">Club Open</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="LIVE">🔴 Live Tournaments</option>
            <option value="REGISTRATION_OPEN">Registration Open</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* Create Tournament Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tour) => (
          <div
            key={tour.id}
            onClick={() => onSelectTournament(tour)}
            className="group relative bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/10 cursor-pointer flex flex-col justify-between"
          >
            {/* Banner Image */}
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={tour.bannerImage}
                alt={tour.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1 backdrop-blur-md ${
                  tour.status === 'LIVE'
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                    : tour.status === 'REGISTRATION_OPEN'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700'
                }`}>
                  {tour.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
                  <span>{tour.status.replace(/_/g, ' ')}</span>
                </span>
              </div>

              {/* Tier Pill */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-slate-900/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                  {tour.tier}
                </span>
              </div>

              {/* Code */}
              <div className="absolute bottom-3 left-4 text-xs font-mono font-bold text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                {tour.code}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {tour.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{tour.location.venue}, {tour.location.city}, {tour.location.country}</span>
                </div>
              </div>

              {/* Disciplines Chips */}
              <div className="flex flex-wrap gap-1">
                {tour.discipline.map((d) => (
                  <span
                    key={d}
                    className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-300 border border-slate-800"
                  >
                    {d.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>

              {/* Quick Stats Footer */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">RINKS</div>
                  <div className="font-bold text-cyan-400">{tour.rinksCount} Ice Lanes</div>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">TEAMS</div>
                  <div className="font-bold text-white">{tour.totalTeams} Nations</div>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-500">PRIZE</div>
                  <div className="font-bold text-amber-400">{tour.totalPrizePool || 'Trophy'}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE TOURNAMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black text-white">Create Official Tournament</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Tournament Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. European Championship 2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Tournament Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. EUC-2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Tournament Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as TournamentTier)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="INTERNATIONAL">International</option>
                    <option value="CONTINENTAL">Continental</option>
                    <option value="NATIONAL">National</option>
                    <option value="STATE">State</option>
                    <option value="DISTRICT">District</option>
                    <option value="CLUB">Club</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Playing Surface</label>
                  <select
                    value={surface}
                    onChange={(e) => setSurface(e.target.value as SurfaceType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="ICE">Natural / Chilled Ice</option>
                    <option value="SYNTHETIC_ICE">Synthetic Ice Glider</option>
                    <option value="ASPHALT_SUMMER">Asphalt / Summer Stock</option>
                    <option value="INDOOR_POLYMER">Indoor Polymer Rink</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Rinks Count</label>
                  <input
                    type="number"
                    value={rinksCount}
                    onChange={(e) => setRinksCount(Number(e.target.value))}
                    min={1}
                    max={24}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Venue Name</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Eisstadion Arena"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Innsbruck"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Austria"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Disciplines Checkbox Selector */}
              <div>
                <label className="text-slate-300 font-semibold mb-2 block">Official Disciplines Included</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'TEAM_GAME',
                    'TEAM_TARGET',
                    'TEAM_DISTANCE',
                    'INDIVIDUAL_TARGET',
                    'INDIVIDUAL_DISTANCE',
                    'HEAD_TO_HEAD'
                  ].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDiscipline(d as Discipline)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                        selectedDisciplines.includes(d as Discipline)
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>{d.replace(/_/g, ' ')}</span>
                      {selectedDisciplines.includes(d as Discipline) && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20"
                >
                  Publish Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
