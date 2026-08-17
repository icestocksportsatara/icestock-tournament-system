-- Production PostgreSQL DDL Schema for Icestock Global Tournament Management System
-- Standardized to International Federation Icestocksport (IFI) requirements

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Master Enums
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM (
    'SUPER_ADMIN', 'GLOBAL_FEDERATION_ADMIN', 'CONTINENTAL_ADMIN', 
    'NATIONAL_FEDERATION_ADMIN', 'STATE_ASSOCIATION_ADMIN', 'DISTRICT_ASSOCIATION_ADMIN',
    'TOURNAMENT_DIRECTOR', 'CHIEF_REFEREE', 'REFEREE', 'UMPIRE', 'MEASURER',
    'TEAM_MANAGER', 'PLAYER', 'MEDIA', 'VIEWER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE account_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING_KYC');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status_enum AS ENUM ('NOT_REQUIRED', 'PENDING_APPROVAL', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE discipline_enum AS ENUM (
    'TEAM_GAME', 'TEAM_TARGET', 'TEAM_DISTANCE', 
    'INDIVIDUAL_TARGET', 'INDIVIDUAL_DISTANCE', 'HEAD_TO_HEAD'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tournament_tier_enum AS ENUM ('INTERNATIONAL', 'CONTINENTAL', 'NATIONAL', 'STATE', 'DISTRICT', 'CLUB');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tournament_status_enum AS ENUM (
    'DRAFT', 'PENDING_SANCTION', 'SANCTIONED', 'REGISTRATION_OPEN', 
    'REGISTRATION_CLOSED', 'DRAW_GENERATED', 'CHECK_IN', 'LIVE', 
    'RESULT_VERIFICATION', 'COMPLETED', 'ARCHIVED', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE gender_category_enum AS ENUM (
    'MEN', 'WOMEN', 'MIXED', 'JUNIORS_U23', 'JUNIORS_U19', 'JUNIORS_U16', 'YOUTH_U16', 'SENIORS', 'VETERANS'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE surface_type_enum AS ENUM ('ICE', 'SYNTHETIC_ICE', 'ASPHALT_SUMMER', 'INDOOR_POLYMER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE scorecard_state_enum AS ENUM ('DRAFT', 'SUBMITTED', 'CHIEF_REFEREE_REVIEW', 'VERIFIED', 'LOCKED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'PLAYER',
  avatar TEXT,
  federation_license_id VARCHAR(100) UNIQUE NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  state VARCHAR(100),
  district VARCHAR(100),
  club VARCHAR(150),
  is_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  status VARCHAR(30) DEFAULT 'ACTIVE',
  kyc_status VARCHAR(30) DEFAULT 'NOT_REQUIRED',
  failed_login_attempts INT DEFAULT 0,
  lockout_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_kyc ON users(kyc_status);

-- 3. Sessions & Tokens
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  two_factor_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- 4. KYC Dossiers
CREATE TABLE IF NOT EXISTS user_kyc_dossiers (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_number VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  official_address TEXT NOT NULL,
  federation_affiliation VARCHAR(255) NOT NULL,
  jurisdiction_level VARCHAR(100),
  document_file_url TEXT,
  document_file_name VARCHAR(255),
  appointment_letter_number VARCHAR(100),
  declaration_accepted BOOLEAN DEFAULT TRUE,
  reviewed_at TIMESTAMPTZ,
  reviewed_by_admin_id VARCHAR(64),
  reviewed_by_admin_name VARCHAR(255),
  rejection_reason TEXT,
  verification_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Players & Documents
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  player_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  flag TEXT NOT NULL,
  state VARCHAR(100),
  district VARCHAR(100),
  club VARCHAR(150) NOT NULL,
  gender VARCHAR(30) NOT NULL,
  date_of_birth DATE NOT NULL,
  email VARCHAR(255) NOT NULL,
  ranking_points DOUBLE PRECISION DEFAULT 0.0,
  world_rank INT DEFAULT 0,
  national_rank INT DEFAULT 0,
  profile_image TEXT,
  kyc_status VARCHAR(30) DEFAULT 'NOT_REQUIRED',
  medical_expiry_date DATE,
  stock_body_color VARCHAR(50),
  stock_disc_weight_kg DOUBLE PRECISION,
  stock_handle_type VARCHAR(100),
  stock_plate_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_players_player_id ON players(player_id);
CREATE INDEX IF NOT EXISTS idx_players_country_code ON players(country_code);

-- 6. Teams & Rosters
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  flag TEXT NOT NULL,
  state VARCHAR(100),
  club VARCHAR(150) NOT NULL,
  category VARCHAR(30) NOT NULL,
  logo TEXT,
  ranking_points DOUBLE PRECISION DEFAULT 0.0,
  world_rank INT DEFAULT 0,
  manager_name VARCHAR(255),
  coach_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  team_id VARCHAR(64) REFERENCES teams(id) ON DELETE CASCADE,
  player_id VARCHAR(64) REFERENCES players(id) ON DELETE CASCADE,
  tactical_role VARCHAR(50),
  jersey_number INT,
  is_captain BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, player_id)
);

-- 7. Tournaments, Venues & Rinks
CREATE TABLE IF NOT EXISTS tournaments (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  tier VARCHAR(50) NOT NULL,
  surface VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_deadline DATE NOT NULL,
  venue VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status VARCHAR(50) DEFAULT 'DRAFT',
  organizer VARCHAR(255) NOT NULL,
  sanctioned_by VARCHAR(255) NOT NULL,
  rinks_count INT DEFAULT 4,
  total_prize_pool VARCHAR(100),
  banner_image TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_by_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rinks (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  tournament_id VARCHAR(64) REFERENCES tournaments(id) ON DELETE CASCADE,
  rink_number VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  surface VARCHAR(50) NOT NULL,
  dimensions VARCHAR(50) DEFAULT '30m x 4m',
  status VARCHAR(50) DEFAULT 'OPEN_AVAILABLE',
  temperature_celsius DOUBLE PRECISION,
  humidity_percentage DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tournament_id, rink_number)
);

-- 8. Referees & Rink Assignments
CREATE TABLE IF NOT EXISTS referees (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  flag TEXT NOT NULL,
  certification_level VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'AVAILABLE_ON_RINK',
  phone VARCHAR(50),
  matches_officiated INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referee_assignments (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  tournament_id VARCHAR(64) REFERENCES tournaments(id) ON DELETE CASCADE,
  rink_id VARCHAR(64) REFERENCES rinks(id) ON DELETE CASCADE,
  match_id VARCHAR(64),
  referee_id VARCHAR(64) REFERENCES referees(id) ON DELETE CASCADE,
  referee_role VARCHAR(50) NOT NULL,
  shift_start_time TIMESTAMPTZ NOT NULL,
  shift_end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ref_assignment ON referee_assignments(referee_id, shift_start_time, shift_end_time);

-- 9. Matches, Scorecards & Attempts
CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  match_number VARCHAR(100) NOT NULL,
  tournament_id VARCHAR(64) REFERENCES tournaments(id) ON DELETE CASCADE,
  rink_id VARCHAR(64) REFERENCES rinks(id) ON DELETE SET NULL,
  discipline VARCHAR(50) NOT NULL,
  stage VARCHAR(50) DEFAULT 'GROUP_STAGE',
  scheduled_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'SCHEDULED',
  scorecard_state VARCHAR(50) DEFAULT 'DRAFT',
  team1_id VARCHAR(64) REFERENCES teams(id) ON DELETE SET NULL,
  team2_id VARCHAR(64) REFERENCES teams(id) ON DELETE SET NULL,
  player1_id VARCHAR(64) REFERENCES players(id) ON DELETE SET NULL,
  player2_id VARCHAR(64) REFERENCES players(id) ON DELETE SET NULL,
  winner_id VARCHAR(64),
  chief_referee_id VARCHAR(64) REFERENCES referees(id) ON DELETE SET NULL,
  umpire_name VARCHAR(255),
  laser_measurer_name VARCHAR(255),
  team1_score INT DEFAULT 0,
  team2_score INT DEFAULT 0,
  team1_game_points INT DEFAULT 0,
  team2_game_points INT DEFAULT 0,
  timer_total_seconds INT DEFAULT 1800,
  timer_current_seconds INT DEFAULT 1800,
  timer_running BOOLEAN DEFAULT FALSE,
  timeouts_team1 INT DEFAULT 0,
  timeouts_team2 INT DEFAULT 0,
  locked_at TIMESTAMPTZ,
  locked_by_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tournament_id, match_number)
);

CREATE TABLE IF NOT EXISTS scorecards (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  match_id VARCHAR(64) UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  scoring_system VARCHAR(50) DEFAULT 'IISF_STANDARD_1PT',
  state VARCHAR(50) DEFAULT 'DRAFT',
  raw_score_data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by_referee_id VARCHAR(64),
  verified_by_referee_name VARCHAR(255),
  locked_at TIMESTAMPTZ,
  locked_by_admin_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS score_attempts (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  match_id VARCHAR(64) REFERENCES matches(id) ON DELETE CASCADE,
  round_number INT DEFAULT 1,
  attempt_number INT DEFAULT 1,
  participant_id VARCHAR(64) NOT NULL,
  target_type VARCHAR(50),
  points_awarded INT DEFAULT 0,
  distance_meters DOUBLE PRECISION,
  is_valid BOOLEAN DEFAULT TRUE,
  stock_coordinate_x DOUBLE PRECISION,
  stock_coordinate_y DOUBLE PRECISION,
  referee_confirmed BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Ranking History & Audit Logs
CREATE TABLE IF NOT EXISTS ranking_history (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  player_id VARCHAR(64) REFERENCES players(id) ON DELETE CASCADE,
  tournament_id VARCHAR(64) REFERENCES tournaments(id) ON DELETE CASCADE,
  discipline VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  position INT NOT NULL,
  points_awarded DOUBLE PRECISION NOT NULL,
  previous_points DOUBLE PRECISION NOT NULL,
  new_total_points DOUBLE PRECISION NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id VARCHAR(64),
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  is_success BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
