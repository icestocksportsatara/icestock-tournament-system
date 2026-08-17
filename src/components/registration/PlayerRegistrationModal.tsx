import React, { useState, useEffect } from 'react';
import { Player, GenderCategory, Discipline } from '../../types';
import { storage } from '../../services/storageService';
import QRCode from 'qrcode';
import { 
  UserCheck, 
  Upload, 
  QrCode, 
  ShieldCheck, 
  CheckCircle, 
  X, 
  FileText, 
  Sparkles,
  Calendar,
  Layers,
  HeartPulse
} from 'lucide-react';

interface PlayerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerRegistered?: (player: Player) => void;
}

export const PlayerRegistrationModal: React.FC<PlayerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onPlayerRegistered
}) => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Germany');
  const [countryCode, setCountryCode] = useState('GER');
  const [flag, setFlag] = useState('🇩🇪');
  const [stateName, setStateName] = useState('Bavaria');
  const [districtName, setDistrictName] = useState('Miesbach');
  const [club, setClub] = useState('');
  const [gender, setGender] = useState<GenderCategory>('MEN');
  const [dob, setDob] = useState('1998-05-20');
  const [email, setEmail] = useState('');
  const [passportNumber, setPassportNumber] = useState('A' + Math.floor(1000000 + Math.random() * 9000000));
  const [medicalExpiry, setMedicalExpiry] = useState('2027-04-30');
  const [plateType, setPlateType] = useState('Type M (Medium Grey)');
  const [discWeight, setDiscWeight] = useState(3.82);
  const [handleType, setHandleType] = useState('Ergonomic Carbon Curved');
  const [bodyColor, setBodyColor] = useState('#3b82f6');
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([
    'TEAM_GAME',
    'INDIVIDUAL_TARGET'
  ]);
  
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [generatedPlayerId, setGeneratedPlayerId] = useState<string>('');

  useEffect(() => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const pid = `IFI-${countryCode}-${new Date().getFullYear()}-${randomNum}`;
    setGeneratedPlayerId(pid);

    const qrPayload = JSON.stringify({
      id: pid,
      name: name || 'New Athlete',
      country: countryCode,
      sanction: 'IFI-OFFICIAL-ACCREDITATION-2026',
      kyc: 'VERIFIED'
    });

    QRCode.toDataURL(qrPayload, { width: 160, margin: 1, color: { dark: '#0284c7', light: '#020617' } })
      .then(url => setQrDataUrl(url))
      .catch(() => {});
  }, [countryCode, name]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPlayer: Player = {
      id: 'p-' + Date.now(),
      playerId: generatedPlayerId,
      name: name || 'Athlete Name',
      country,
      countryCode,
      flag,
      state: stateName,
      district: districtName,
      club: club || 'National Squad',
      gender,
      dateOfBirth: dob,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@icestock-athlete.org`,
      rankingPoints: 1200,
      worldRank: 25,
      nationalRank: 4,
      disciplines: selectedDisciplines,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      kycStatus: 'VERIFIED',
      medicalCertificateExpiry: medicalExpiry,
      passportNumber,
      stockSpecs: {
        bodyColor,
        discWeight: Number(discWeight),
        handleType,
        plateType
      },
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
        bestTargetScore: 0,
        bestDistanceMeters: 0,
        targetAccuracyPercentage: 0
      }
    };

    storage.savePlayer(newPlayer);
    if (onPlayerRegistered) onPlayerRegistered(newPlayer);
    onClose();
  };

  const toggleDiscipline = (d: Discipline) => {
    if (selectedDisciplines.includes(d)) {
      setSelectedDisciplines(selectedDisciplines.filter(item => item !== d));
    } else {
      setSelectedDisciplines([...selectedDisciplines, d]);
    }
  };

  const handleCountryChange = (c: string) => {
    setCountry(c);
    if (c === 'Germany') { setCountryCode('GER'); setFlag('🇩🇪'); }
    else if (c === 'Austria') { setCountryCode('AUT'); setFlag('🇦🇹'); }
    else if (c === 'Italy') { setCountryCode('ITA'); setFlag('🇮🇹'); }
    else if (c === 'Switzerland') { setCountryCode('SUI'); setFlag('🇨🇭'); }
    else if (c === 'India') { setCountryCode('IND'); setFlag('🇮🇳'); }
    else if (c === 'Brazil') { setCountryCode('BRA'); setFlag('🇧🇷'); }
    else if (c === 'Canada') { setCountryCode('CAN'); setFlag('🇨🇦'); }
    else if (c === 'USA') { setCountryCode('USA'); setFlag('🇺🇸'); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 max-w-3xl w-full shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-black text-white">Athlete Global Accreditation & Registration</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Official IFI Digital ID Generation with Encrypted QR Token
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Athlete Details (2 cols) */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Markus Huber"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Gender Category</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as GenderCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="MEN">Men Senior</option>
                    <option value="WOMEN">Women Senior</option>
                    <option value="MIXED">Mixed Team Eligible</option>
                    <option value="JUNIORS_U23">Juniors Under 23</option>
                    <option value="JUNIORS_U19">Juniors Under 19</option>
                    <option value="JUNIORS_U16">Juniors Under 16</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Country</label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Germany">Germany (GER)</option>
                    <option value="Austria">Austria (AUT)</option>
                    <option value="Italy">Italy (ITA)</option>
                    <option value="Switzerland">Switzerland (SUI)</option>
                    <option value="India">India (IND)</option>
                    <option value="Brazil">Brazil (BRA)</option>
                    <option value="Canada">Canada (CAN)</option>
                    <option value="USA">USA (USA)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">State / Region</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">District / Unit</label>
                  <input
                    type="text"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Club Affiliation</label>
                  <input
                    type="text"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    placeholder="e.g. TSV Hartpenning"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* KYC & Medical */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Passport / National ID</span>
                  </label>
                  <input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-red-400" />
                    <span>Medical Cert Expiry</span>
                  </label>
                  <input
                    type="date"
                    value={medicalExpiry}
                    onChange={(e) => setMedicalExpiry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* QR Code & Live Badge Preview (1 Col) */}
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-cyan-500/30 flex flex-col items-center justify-between text-center gap-3">
              <div className="w-full">
                <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 tracking-widest block mb-1">
                  OFFICIAL ACCREDITATION
                </span>
                <span className="font-mono text-xs font-bold text-amber-300 block">
                  {generatedPlayerId}
                </span>
              </div>

              {/* Live QR Image */}
              {qrDataUrl && (
                <div className="p-2 bg-slate-950 rounded-xl border border-cyan-500/40 shadow-inner">
                  <img src={qrDataUrl} alt="Player QR Token" className="w-28 h-28 mx-auto" />
                </div>
              )}

              <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                ✓ IFI HOMOLOGATED
              </div>
            </div>
          </div>

          {/* Disciplines Selection */}
          <div>
            <label className="text-slate-300 font-semibold mb-1 block">Registered Disciplines</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                  className={`p-2 rounded-xl border text-left flex items-center justify-between ${
                    selectedDisciplines.includes(d as Discipline)
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>{d.replace(/_/g, ' ')}</span>
                  {selectedDisciplines.includes(d as Discipline) && <CheckCircle className="w-3 h-3 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Issue Official License</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
