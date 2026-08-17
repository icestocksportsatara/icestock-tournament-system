import React, { useState } from 'react';
import { Database, Copy, Check, Terminal, Layers, ShieldCheck, Code2 } from 'lucide-react';

const POSTGRESQL_DDL = `-- ====================================================================
-- ICESTOCK SPORT GLOBAL TOURNAMENT MANAGEMENT SYSTEM (IFI-GTS)
-- Enterprise PostgreSQL 16+ Production Schema
-- ====================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For arena geo coordinates

CREATE TYPE user_role_enum AS ENUM (
  'SUPER_ADMIN', 'COUNTRY_HEAD', 'NATIONAL_HEAD', 'STATE_HEAD', 
  'DISTRICT_HEAD', 'REFEREE', 'TEAM_MANAGER', 'PLAYER'
);

CREATE TYPE discipline_enum AS ENUM (
  'TEAM_GAME', 'TEAM_TARGET', 'TEAM_DISTANCE', 
  'INDIVIDUAL_TARGET', 'INDIVIDUAL_DISTANCE', 'HEAD_TO_HEAD'
);

CREATE TYPE tournament_tier_enum AS ENUM (
  'INTERNATIONAL', 'CONTINENTAL', 'NATIONAL', 'STATE', 'DISTRICT', 'CLUB'
);

CREATE TYPE match_status_enum AS ENUM (
  'SCHEDULED', 'WARMUP', 'LIVE', 'COMPLETED', 'LOCKED_VERIFIED', 'POSTPONED'
);

-- 2. FEDERATION HIERARCHY TABLES
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(3) UNIQUE NOT NULL, -- e.g. GER, AUT, IND
  name VARCHAR(100) NOT NULL,
  flag_emoji VARCHAR(10),
  head_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID REFERENCES districts(id),
  name VARCHAR(150) NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. USERS & ROLES
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'PLAYER',
  phone_number VARCHAR(30),
  is_2fa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PLAYERS & EQUIPMENT SPECS
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  player_license_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. IFI-GER-2026-001
  club_id UUID REFERENCES clubs(id),
  gender VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  kyc_status VARCHAR(20) DEFAULT 'PENDING',
  medical_certificate_expiry DATE,
  passport_number VARCHAR(50),
  disc_weight_kg NUMERIC(4,2) DEFAULT 3.82,
  handle_type VARCHAR(100),
  plate_type VARCHAR(100),
  body_color_hex VARCHAR(10),
  ranking_points INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TEAMS & ROSTERS
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id),
  name VARCHAR(150) NOT NULL,
  short_code VARCHAR(10) NOT NULL,
  category VARCHAR(30) NOT NULL,
  manager_user_id UUID REFERENCES users(id),
  ranking_points INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_rosters (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  is_captain BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (team_id, player_id)
);

-- 6. TOURNAMENTS & VENUES
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  tier tournament_tier_enum NOT NULL,
  surface_type VARCHAR(50) NOT NULL DEFAULT 'ICE',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  venue_name VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country_code VARCHAR(3) NOT NULL,
  rinks_count INTEGER DEFAULT 6,
  status VARCHAR(30) DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. MATCHES, ENDS & TELEMETRY
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  match_number VARCHAR(50) NOT NULL,
  discipline discipline_enum NOT NULL,
  stage VARCHAR(50) NOT NULL,
  rink_number VARCHAR(50),
  team1_id UUID REFERENCES teams(id),
  team2_id UUID REFERENCES teams(id),
  player1_id UUID REFERENCES players(id),
  player2_id UUID REFERENCES players(id),
  referee_id UUID REFERENCES users(id),
  status match_status_enum DEFAULT 'SCHEDULED',
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_ends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  end_number INTEGER NOT NULL,
  team1_points INTEGER NOT NULL DEFAULT 0,
  team2_points INTEGER NOT NULL DEFAULT 0,
  daube_x_mm INTEGER DEFAULT 0,
  daube_y_mm INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, end_number)
);

CREATE TABLE stock_telemetry_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_end_id UUID REFERENCES match_ends(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  stock_color VARCHAR(10),
  x_pos_mm INTEGER NOT NULL,
  y_pos_mm INTEGER NOT NULL,
  distance_to_daube_mm INTEGER NOT NULL
);

-- 8. AUDIT LOGS & SYSTEM INTEGRITY
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action_name VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR LOW-LATENCY SCORING
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_match_ends_match ON match_ends(match_id);
CREATE INDEX idx_players_license ON players(player_license_id);
`;

export const PostgresSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'SQL' | 'TABLES'>('SQL');

  const handleCopy = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const tablesSummary = [
    { name: 'countries', rows: '38 Member Nations', purpose: 'National federation affiliation & IOC recognition' },
    { name: 'states & districts', rows: 'Hierarchical Units', purpose: 'State and district unit governing bodies' },
    { name: 'clubs', rows: 'Registered Clubs', purpose: 'Local sports clubs and ice rinks' },
    { name: 'users', rows: 'RBAC Users', purpose: 'Super Admin, Referees, Managers, Athletes, 2FA' },
    { name: 'players', rows: 'Accredited Athletes', purpose: 'License IDs, KYC, equipment specs, medical certs' },
    { name: 'teams & rosters', rows: 'Teams & Lineups', purpose: 'National squads, clubs, and captain assignments' },
    { name: 'tournaments', rows: 'Competitions', purpose: '6-Tier championships, venues, surface types' },
    { name: 'matches & match_ends', rows: 'Live Scores', purpose: 'End 1-6 telemetry, target hits, laser distance' },
    { name: 'stock_telemetry_positions', rows: 'Ice Coordinates', purpose: 'Millimeter x/y stock positions relative to Daube' },
    { name: 'audit_logs', rows: 'Security & Sign-offs', purpose: 'Immutable referee signature & score change logs' }
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-black text-white tracking-wide">
              PostgreSQL 16 Enterprise Database Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Normalized DDL Schema • PostGIS Spatial Telemetry • Multi-Tier Indexing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('SQL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'SQL' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'text-slate-400'
              }`}
            >
              SQL DDL Script
            </button>
            <button
              onClick={() => setActiveTab('TABLES')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'TABLES' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'text-slate-400'
              }`}
            >
              Schema Dictionary
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Copied SQL' : 'Copy DDL'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'SQL' ? (
        <div className="relative">
          <pre className="w-full bg-slate-950 p-5 rounded-2xl border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed shadow-inner">
            <code>{POSTGRESQL_DDL}</code>
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tablesSummary.map((tbl) => (
            <div key={tbl.name} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-cyan-400">{tbl.name}</span>
                <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                  {tbl.rows}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{tbl.purpose}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
