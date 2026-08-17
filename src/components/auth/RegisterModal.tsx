import React, { useState } from 'react';
import { UserRole, AuthUser, UserKycDossier } from '../../types';
import { authService } from '../../services/authService';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Globe, 
  Users, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Key,
  Award,
  Sparkles,
  FileText,
  Phone,
  MapPin,
  Building2,
  UploadCloud,
  FileCheck,
  Check,
  Clock,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  onOpenLogin?: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenLogin
}) => {
  // Base fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('REFEREE');
  const [federationLicenseId, setFederationLicenseId] = useState('IFI-REF-2026-781');
  const [country, setCountry] = useState('Germany');
  const [state, setState] = useState('Bavaria');
  const [district, setDistrict] = useState('');
  const [club, setClub] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Mandatory KYC fields for non-admin, non-player roles
  const [documentType, setDocumentType] = useState<UserKycDossier['documentType']>('PASSPORT');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [officialAddress, setOfficialAddress] = useState('');
  const [federationAffiliation, setFederationAffiliation] = useState('');
  const [appointmentLetterNumber, setAppointmentLetterNumber] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('Official_Identity_Verification.pdf');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Status and view handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedKycUser, setSubmittedKycUser] = useState<AuthUser | null>(null);

  if (!isOpen) return null;

  const requiresKyc = authService.isRoleKycMandatory(role);

  // Auto-suggest License ID and default affiliations based on role
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const prefix = 
      newRole === 'SUPER_ADMIN' ? 'IFI-HQ' :
      newRole === 'PLAYER' ? 'IFI-ATH' :
      newRole === 'REFEREE' ? 'IFI-REF' :
      newRole === 'COUNTRY_HEAD' ? 'DESV-HQ' :
      newRole === 'NATIONAL_HEAD' ? 'BOE-NAT' :
      newRole === 'STATE_HEAD' ? 'BEV-BAY' :
      newRole === 'DISTRICT_HEAD' ? 'ISFI-DIST' : 'MGR-CLUB';

    setFederationLicenseId(`${prefix}-2026-${Math.floor(100 + Math.random() * 900)}`);

    if (newRole === 'REFEREE' && !federationAffiliation) {
      setFederationAffiliation('International Federation Icestocksport (IFI) Umpires Committee');
    } else if (newRole === 'DISTRICT_HEAD' && !federationAffiliation) {
      setFederationAffiliation('District Ice Stock Sports Secretariat');
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  };

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (requiresKyc) {
      if (!documentNumber.trim()) {
        setErrorMessage('Government / Official Document Number is mandatory for this role.');
        return;
      }
      if (!phone.trim()) {
        setErrorMessage('Official Contact Phone Number is mandatory for KYC.');
        return;
      }
      if (!officialAddress.trim()) {
        setErrorMessage('Official Jurisdiction / Residential Address is mandatory for KYC.');
        return;
      }
      if (!declarationAccepted) {
        setErrorMessage('You must accept the official IFI KYC legal accuracy declaration.');
        return;
      }
    }

    const res = authService.registerUser({
      fullName,
      email,
      username: username || email.split('@')[0],
      role,
      federationLicenseId: federationLicenseId || `IFI-REG-${Math.floor(1000 + Math.random() * 9000)}`,
      country,
      state,
      district,
      club,
      password,
      kycDossier: requiresKyc ? {
        documentType,
        documentNumber: documentNumber.trim(),
        phone: phone.trim(),
        officialAddress: officialAddress.trim(),
        federationAffiliation: federationAffiliation.trim() || `${country} Federation Authority`,
        appointmentLetterNumber: appointmentLetterNumber.trim() || `IFI-APP-${Date.now().toString().slice(-6)}`,
        documentFileName: uploadedFileName,
        verificationNotes: `Candidate submitted KYC credentials on registration. Document: ${documentType} (#${documentNumber}).`
      } : undefined
    });

    if (res.success && res.user) {
      if (res.isKycPending) {
        // Show KYC submission success screen
        setSubmittedKycUser(res.user);
      } else {
        // Direct pass for Player / Admin
        onSuccess(res.user);
        onClose();
      }
    } else {
      setErrorMessage(res.error || 'Registration failed. Please check the form fields.');
    }
  };

  const strength = getPasswordStrength();

  // Screen 2: KYC Submission Pending Screen
  if (submittedKycUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col gap-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  KYC DOSSIER RECEIVED
                </span>
                <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                  Registration Awaiting Admin Approval
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3 text-xs font-mono">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-slate-200 leading-relaxed">
                <strong className="text-amber-300">Mandatory KYC Evaluation Active:</strong> Under International Federation Icestocksport (IFI) regulations, accounts for <strong>{submittedKycUser.role}</strong> require verification and approval by the Super Admin before platform access is enabled.
              </div>
            </div>
          </div>

          {/* Dossier Summary Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Applicant Name:</span>
              <span className="text-white font-bold">{submittedKycUser.fullName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Requested Role:</span>
              <span className="text-cyan-400 font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800">
                {submittedKycUser.role}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Official License / Ref ID:</span>
              <span className="text-white">{submittedKycUser.federationLicenseId}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">KYC Document:</span>
              <span className="text-slate-300 font-mono">
                {submittedKycUser.kycDossier?.documentType} (#{submittedKycUser.kycDossier?.documentNumber})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Review Status:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                PENDING SUPER ADMIN PASS
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 font-mono">
            Once the Super Admin evaluates and passes your KYC credentials in the Super Admin Control Center, you will be able to log in with your email <strong className="text-slate-200">({submittedKycUser.email})</strong>.
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Close
            </button>
            {onOpenLogin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Screen 1: Registration Form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col gap-6 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  NEW MEMBER REGISTRATION
                </span>
                {requiresKyc ? (
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>ADMIN KYC MANDATORY</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    DIRECT PASS (NO KYC GATE)
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                Register Federation Account
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KYC Policy Notice */}
        {requiresKyc ? (
          <div className="bg-amber-950/40 border border-amber-500/40 text-amber-200 p-3.5 rounded-2xl text-xs font-mono flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Super Admin KYC Verification Policy:</strong> All official federation administrative and referee roles require verified Government ID and official federation details. Your application will be evaluated and activated by the Super Admin before access is granted.
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 p-3 rounded-2xl text-xs font-mono flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Athletes & Players register directly with instant account activation.</span>
          </div>
        )}

        {/* Protected Super Admin Single Account Notice */}
        <div className="bg-slate-950/60 border border-slate-800 text-slate-400 px-3.5 py-2 rounded-xl text-[11px] font-mono flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Master Super Admin access is a single dedicated system account.</span>
          </span>
          <span className="text-cyan-400 font-bold">Default: admin@icestock.org</span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-950/80 border-2 border-red-500/60 text-red-300 p-3.5 rounded-2xl text-xs font-mono flex items-center gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 text-xs font-mono">
          
          {/* Role Selection Tier */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Select Federation Role Tier</span>
              </label>
              {requiresKyc && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  KYC REVIEW REQUIRED
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'PLAYER' as UserRole, label: 'Athlete (Player)', kyc: false },
                { id: 'REFEREE' as UserRole, label: 'Official Referee', kyc: true },
                { id: 'TEAM_MANAGER' as UserRole, label: 'Coach / Manager', kyc: true },
                { id: 'DISTRICT_HEAD' as UserRole, label: 'District Head', kyc: true },
                { id: 'STATE_HEAD' as UserRole, label: 'State Head', kyc: true },
                { id: 'NATIONAL_HEAD' as UserRole, label: 'National Head', kyc: true },
                { id: 'COUNTRY_HEAD' as UserRole, label: 'Country Head', kyc: true }
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleRoleChange(item.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all flex flex-col gap-1 ${
                    role === item.id 
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-500/20' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] truncate">{item.label}</span>
                    {role === item.id && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </div>
                  <span className={`text-[9px] ${item.kyc ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {item.kyc ? '• Admin KYC' : '• Instant Pass'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Account Credentials */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>1. Personal & Account Credentials</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 mb-1 block">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Franz Hofer"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 mb-1 block">Login Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. franz_hofer"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 mb-1 block">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. franz@icestock.org"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 mb-1 block">Official License ID</label>
                <input
                  type="text"
                  value={federationLicenseId}
                  onChange={(e) => setFederationLicenseId(e.target.value)}
                  placeholder="IFI-REF-2026-..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-cyan-300 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 mb-1 block">Country *</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Germany / Austria / India"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 mb-1 block">State / Region</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Bavaria / Maharashtra"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 mb-1 block">District / City</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Satara / Passau"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: MANDATORY KYC DETAILS (Shown for non-admin, non-player roles) */}
          {requiresKyc && (
            <div className="bg-amber-950/20 border-2 border-amber-500/40 p-4 rounded-2xl flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>2. Mandatory Federation KYC Dossier</span>
                </span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  PASSED BY ADMIN ONLY
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-amber-200 mb-1 block font-bold">Government ID Document Type *</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="PASSPORT">Passport (International)</option>
                    <option value="NATIONAL_ID">National Identity Card / Personalausweis</option>
                    <option value="AADHAAR">Aadhaar Card (India)</option>
                    <option value="FEDERATION_OFFICIAL_ID">Official IFI Master Official Badge ID</option>
                    <option value="DRIVING_LICENSE">Government Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="text-amber-200 mb-1 block font-bold">Government / ID Number *</label>
                  <input
                    type="text"
                    required
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="e.g. C48910294 or XXXX-XXXX-9021"
                    className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-amber-200 mb-1 block font-bold">Official Contact Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +49 89 2180 or +91 98220 12345"
                      className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-amber-200 mb-1 block font-bold">Federation Affiliation / Association *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={federationAffiliation}
                      onChange={(e) => setFederationAffiliation(e.target.value)}
                      placeholder="e.g. DESV, BÖE, ISFI Satara Chapter, Club Board"
                      className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-amber-200 mb-1 block font-bold">Official Secretariat / Residential Address *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={officialAddress}
                    onChange={(e) => setOfficialAddress(e.target.value)}
                    placeholder="e.g. Federation Office, Olympiapark 1, Munich / Radhika Road, Satara"
                    className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Document Upload Simulation */}
              <div>
                <label className="text-amber-200 mb-1 block font-bold">Upload Government ID Proof / Appointment Letter</label>
                <div className="border border-dashed border-amber-500/40 bg-slate-950/60 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-[11px] truncate max-w-[200px] md:max-w-xs">{uploadedFileName}</span>
                  </div>
                  <label className="cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">
                    <span>Browse File</span>
                    <input type="file" onChange={handleFileUploadMock} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                  </label>
                </div>
              </div>

              {/* Legal Declaration Checkbox */}
              <label className="flex items-start gap-2.5 text-[11px] text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-amber-500 text-amber-500 focus:ring-amber-500 bg-slate-950"
                />
                <span className="leading-snug">
                  I solemnly certify under penalty of official federation disciplinary action that all submitted KYC identification and federation appointment details are genuine and valid.
                </span>
              </label>
            </div>
          )}

          {/* Section 3: Password Security */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>{requiresKyc ? '3.' : '2.'} Security & Password</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 mb-1 block">Account Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-300 mb-1 block">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Password Security Rating:</span>
                  <span className={strength >= 75 ? 'text-emerald-400 font-bold' : strength >= 50 ? 'text-amber-400' : 'text-red-400'}>
                    {strength >= 75 ? 'Strong (Encrypted)' : strength >= 50 ? 'Medium' : 'Weak'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      strength >= 75 ? 'bg-emerald-400' : strength >= 50 ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3.5 rounded-2xl text-slate-950 font-black uppercase tracking-wider hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-3 text-xs ${
              requiresKyc 
                ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400 hover:shadow-amber-500/20'
                : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:shadow-cyan-500/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{requiresKyc ? 'Submit Registration & KYC Dossier for Admin Pass' : 'Create Athlete Account & Instant Sign In'}</span>
          </button>

          {onOpenLogin && (
            <div className="text-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">Already registered in federation registry? </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign In Here
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
