import { 
  Player, 
  Team, 
  Tournament, 
  Match, 
  RankingEntry, 
  NewsItem, 
  Sponsor, 
  AuditLog,
  RefereeProfile,
  RinkVenueInfo,
  RinkRefereeAssignment
} from '../types';

export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p-1',
    playerId: 'IFI-GER-2026-001',
    name: 'Stefan Zellermayer',
    country: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    state: 'Bavaria',
    district: 'Miesbach',
    club: 'TSV Hartpenning',
    gender: 'MEN',
    dateOfBirth: '1992-04-14',
    email: 's.zellermayer@icestock.de',
    rankingPoints: 2480,
    worldRank: 1,
    nationalRank: 1,
    disciplines: ['TEAM_GAME', 'INDIVIDUAL_TARGET', 'HEAD_TO_HEAD'],
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2027-02-15',
    passportNumber: 'C7894125',
    stockSpecs: {
      bodyColor: '#3b82f6',
      discWeight: 3.82,
      handleType: 'Ergonomic Titanium High Curved',
      plateType: 'Type M (Medium Grey)'
    },
    stats: {
      matchesPlayed: 142,
      matchesWon: 119,
      goldMedals: 14,
      silverMedals: 6,
      bronzeMedals: 3,
      bestTargetScore: 194,
      bestDistanceMeters: 104.2,
      targetAccuracyPercentage: 92.4
    }
  },
  {
    id: 'p-2',
    playerId: 'IFI-AUT-2026-004',
    name: 'Simone Steiner',
    country: 'Austria',
    countryCode: 'AUT',
    flag: '🇦🇹',
    state: 'Styria',
    district: 'Weiz',
    club: 'ESV Union Passail',
    gender: 'WOMEN',
    dateOfBirth: '1995-09-22',
    email: 'simone.steiner@icestock.at',
    rankingPoints: 2390,
    worldRank: 1,
    nationalRank: 1,
    disciplines: ['TEAM_GAME', 'INDIVIDUAL_TARGET', 'TEAM_TARGET'],
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2026-11-30',
    passportNumber: 'P4561239',
    stockSpecs: {
      bodyColor: '#ef4444',
      discWeight: 3.70,
      handleType: 'Carbon Fiber Pro Grip',
      plateType: 'Type S (Super Fast Green)'
    },
    stats: {
      matchesPlayed: 128,
      matchesWon: 106,
      goldMedals: 11,
      silverMedals: 5,
      bronzeMedals: 4,
      bestTargetScore: 188,
      bestDistanceMeters: 98.6,
      targetAccuracyPercentage: 89.7
    }
  },
  {
    id: 'p-3',
    playerId: 'IFI-ITA-2026-012',
    name: 'Markus Schätz',
    country: 'Italy',
    countryCode: 'ITA',
    flag: '🇮🇹',
    state: 'South Tyrol',
    district: 'Bozen',
    club: 'EV Lana Raika',
    gender: 'MEN',
    dateOfBirth: '1989-11-03',
    email: 'm.schaetz@suedtirol-stock.it',
    rankingPoints: 2210,
    worldRank: 2,
    nationalRank: 1,
    disciplines: ['TEAM_DISTANCE', 'INDIVIDUAL_DISTANCE'],
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2027-01-10',
    passportNumber: 'YA982341',
    stockSpecs: {
      bodyColor: '#10b981',
      discWeight: 3.95,
      handleType: 'Heavy Kinetic Aero Straight',
      plateType: 'Type L (Super Glider White)'
    },
    stats: {
      matchesPlayed: 98,
      matchesWon: 79,
      goldMedals: 9,
      silverMedals: 8,
      bronzeMedals: 2,
      bestTargetScore: 162,
      bestDistanceMeters: 132.8,
      targetAccuracyPercentage: 81.2
    }
  },
  {
    id: 'p-4',
    playerId: 'IFI-SUI-2026-019',
    name: 'Martin Caspar',
    country: 'Switzerland',
    countryCode: 'SUI',
    flag: '🇨🇭',
    state: 'Graubünden',
    district: 'Davos',
    club: 'ESC Davos Platinum',
    gender: 'MEN',
    dateOfBirth: '1994-06-18',
    email: 'm.caspar@eisstock-schweiz.ch',
    rankingPoints: 2050,
    worldRank: 4,
    nationalRank: 1,
    disciplines: ['TEAM_GAME', 'HEAD_TO_HEAD'],
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2026-10-18',
    stockSpecs: {
      bodyColor: '#f59e0b',
      discWeight: 3.80,
      handleType: 'Alloy Winter Custom',
      plateType: 'Type M (Medium Black)'
    },
    stats: {
      matchesPlayed: 85,
      matchesWon: 62,
      goldMedals: 5,
      silverMedals: 6,
      bronzeMedals: 5,
      bestTargetScore: 176,
      bestDistanceMeters: 110.5,
      targetAccuracyPercentage: 85.0
    }
  },
  {
    id: 'p-5',
    playerId: 'IFI-IND-2026-002',
    name: 'Aarav Patil',
    country: 'India',
    countryCode: 'IND',
    flag: '🇮🇳',
    state: 'Maharashtra',
    district: 'Satara',
    club: 'Satara Icestock Pioneers',
    gender: 'MEN',
    dateOfBirth: '2001-08-12',
    email: 'aarav.patil@icestockindia.org',
    rankingPoints: 1720,
    worldRank: 9,
    nationalRank: 1,
    disciplines: ['TEAM_GAME', 'INDIVIDUAL_TARGET', 'HEAD_TO_HEAD'],
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2027-03-25',
    stockSpecs: {
      bodyColor: '#6366f1',
      discWeight: 3.75,
      handleType: 'Bespoke Ice Contour',
      plateType: 'Type M (Medium)'
    },
    stats: {
      matchesPlayed: 54,
      matchesWon: 41,
      goldMedals: 4,
      silverMedals: 2,
      bronzeMedals: 1,
      bestTargetScore: 182,
      bestDistanceMeters: 112.4,
      targetAccuracyPercentage: 88.0
    }
  },
  {
    id: 'p-6',
    playerId: 'IFI-BRA-2026-008',
    name: 'Eduardo Schuh',
    country: 'Brazil',
    countryCode: 'BRA',
    flag: '🇧🇷',
    state: 'Rio Grande do Sul',
    district: 'Santa Cruz',
    club: 'Centro Cultural 25 de Julho',
    gender: 'MEN',
    dateOfBirth: '1998-03-05',
    email: 'e.schuh@icestockbrasil.com.br',
    rankingPoints: 1680,
    worldRank: 11,
    nationalRank: 1,
    disciplines: ['TEAM_GAME', 'TEAM_DISTANCE'],
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2026-12-20',
    stockSpecs: {
      bodyColor: '#ec4899',
      discWeight: 3.85,
      handleType: 'Tropical Ice Shield Grips',
      plateType: 'Type L (Fast Blue)'
    },
    stats: {
      matchesPlayed: 60,
      matchesWon: 44,
      goldMedals: 3,
      silverMedals: 4,
      bronzeMedals: 2,
      bestTargetScore: 168,
      bestDistanceMeters: 121.7,
      targetAccuracyPercentage: 82.5
    }
  },
  // Additional German Team Players for Team Target & Team Distance
  {
    id: 'p-ger-2',
    playerId: 'IFI-GER-2026-002',
    name: 'Christian Obermeier',
    country: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    state: 'Bavaria',
    district: 'Straubing',
    club: 'EC Feldkirchen',
    gender: 'MEN',
    dateOfBirth: '1993-08-19',
    email: 'c.obermeier@icestock.de',
    rankingPoints: 2150,
    worldRank: 5,
    nationalRank: 2,
    disciplines: ['TEAM_GAME', 'TEAM_TARGET', 'INDIVIDUAL_TARGET'],
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2027-04-10',
    stockSpecs: {
      bodyColor: '#3b82f6',
      discWeight: 3.80,
      handleType: 'Titanium Speed Grip',
      plateType: 'Type M (Medium)'
    },
    stats: { matchesPlayed: 92, matchesWon: 74, goldMedals: 8, silverMedals: 4, bronzeMedals: 3, bestTargetScore: 186, bestDistanceMeters: 96.4, targetAccuracyPercentage: 88.2 }
  },
  {
    id: 'p-ger-3',
    playerId: 'IFI-GER-2026-003',
    name: 'Florian Marchl',
    country: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    state: 'Bavaria',
    district: 'Passau',
    club: 'EC Sassbach',
    gender: 'MEN',
    dateOfBirth: '1995-11-28',
    email: 'f.marchl@icestock.de',
    rankingPoints: 2080,
    worldRank: 6,
    nationalRank: 3,
    disciplines: ['TEAM_GAME', 'TEAM_TARGET', 'TEAM_DISTANCE'],
    profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2027-01-20',
    stockSpecs: {
      bodyColor: '#3b82f6',
      discWeight: 3.85,
      handleType: 'Aero Dynamic High',
      plateType: 'Type S (Fast)'
    },
    stats: { matchesPlayed: 88, matchesWon: 71, goldMedals: 7, silverMedals: 5, bronzeMedals: 2, bestTargetScore: 182, bestDistanceMeters: 118.2, targetAccuracyPercentage: 86.5 }
  },
  {
    id: 'p-ger-4',
    playerId: 'IFI-GER-2026-004',
    name: 'Max Schedlbauer',
    country: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    state: 'Bavaria',
    district: 'Regen',
    club: 'EC Moitzerlitz Regen',
    gender: 'MEN',
    dateOfBirth: '1991-03-14',
    email: 'm.schedlbauer@icestock.de',
    rankingPoints: 1980,
    worldRank: 8,
    nationalRank: 4,
    disciplines: ['TEAM_GAME', 'TEAM_TARGET'],
    profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2026-11-15',
    stockSpecs: {
      bodyColor: '#3b82f6',
      discWeight: 3.78,
      handleType: 'Carbon Ultra Grip',
      plateType: 'Type M (Medium)'
    },
    stats: { matchesPlayed: 80, matchesWon: 63, goldMedals: 6, silverMedals: 3, bronzeMedals: 4, bestTargetScore: 180, bestDistanceMeters: 92.0, targetAccuracyPercentage: 85.0 }
  },
  // Additional Austrian Team Players
  {
    id: 'p-aut-2',
    playerId: 'IFI-AUT-2026-005',
    name: 'Franz Roth',
    country: 'Austria',
    countryCode: 'AUT',
    flag: '🇦🇹',
    state: 'Styria',
    district: 'Voitsberg',
    club: 'ESV Köflach',
    gender: 'MEN',
    dateOfBirth: '1990-07-25',
    email: 'f.roth@icestock.at',
    rankingPoints: 2190,
    worldRank: 4,
    nationalRank: 2,
    disciplines: ['TEAM_GAME', 'TEAM_TARGET'],
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2027-02-18',
    stockSpecs: { bodyColor: '#ef4444', discWeight: 3.82, handleType: 'Pro Ice Line', plateType: 'Type M' },
    stats: { matchesPlayed: 110, matchesWon: 89, goldMedals: 9, silverMedals: 6, bronzeMedals: 3, bestTargetScore: 184, bestDistanceMeters: 94.5, targetAccuracyPercentage: 87.0 }
  },
  {
    id: 'p-aut-3',
    playerId: 'IFI-AUT-2026-006',
    name: 'Matthias Taxacher',
    country: 'Austria',
    countryCode: 'AUT',
    flag: '🇦🇹',
    state: 'Tyrol',
    district: 'Kufstein',
    club: 'EV Angerberg',
    gender: 'MEN',
    dateOfBirth: '1994-01-12',
    email: 'm.taxacher@icestock.at',
    rankingPoints: 2040,
    worldRank: 7,
    nationalRank: 3,
    disciplines: ['TEAM_GAME', 'TEAM_TARGET', 'TEAM_DISTANCE'],
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2026-10-30',
    stockSpecs: { bodyColor: '#ef4444', discWeight: 3.86, handleType: 'Aero Grip', plateType: 'Type L' },
    stats: { matchesPlayed: 84, matchesWon: 67, goldMedals: 5, silverMedals: 4, bronzeMedals: 2, bestTargetScore: 178, bestDistanceMeters: 122.3, targetAccuracyPercentage: 84.1 }
  },
  {
    id: 'p-aut-4',
    playerId: 'IFI-AUT-2026-007',
    name: 'Peter Schwarz',
    country: 'Austria',
    countryCode: 'AUT',
    flag: '🇦🇹',
    state: 'Carinthia',
    district: 'Klagenfurt',
    club: 'EK Deurotherm',
    gender: 'MEN',
    dateOfBirth: '1992-05-30',
    email: 'p.schwarz@icestock.at',
    rankingPoints: 1950,
    worldRank: 10,
    nationalRank: 4,
    disciplines: ['TEAM_GAME', 'TEAM_TARGET'],
    profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2027-03-12',
    stockSpecs: { bodyColor: '#ef4444', discWeight: 3.75, handleType: 'High Precision', plateType: 'Type S' },
    stats: { matchesPlayed: 76, matchesWon: 59, goldMedals: 4, silverMedals: 3, bronzeMedals: 5, bestTargetScore: 176, bestDistanceMeters: 90.2, targetAccuracyPercentage: 83.4 }
  },
  // Additional Indian Team Players
  {
    id: 'p-ind-2',
    playerId: 'IFI-IND-2026-003',
    name: 'Rohan Deshmukh',
    country: 'India',
    countryCode: 'IND',
    flag: '🇮🇳',
    state: 'Maharashtra',
    district: 'Satara',
    club: 'Satara Icestock Pioneers',
    gender: 'MEN',
    dateOfBirth: '2000-04-18',
    email: 'rohan.deshmukh@icestockindia.org',
    rankingPoints: 1540,
    worldRank: 14,
    nationalRank: 2,
    disciplines: ['TEAM_GAME', 'TEAM_TARGET', 'TEAM_DISTANCE'],
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2027-05-15',
    stockSpecs: { bodyColor: '#6366f1', discWeight: 3.78, handleType: 'Ice Contour', plateType: 'Type M' },
    stats: { matchesPlayed: 45, matchesWon: 32, goldMedals: 3, silverMedals: 2, bronzeMedals: 2, bestTargetScore: 172, bestDistanceMeters: 114.8, targetAccuracyPercentage: 83.0 }
  },
  {
    id: 'p-ind-3',
    playerId: 'IFI-IND-2026-004',
    name: 'Sameer Kulkarni',
    country: 'India',
    countryCode: 'IND',
    flag: '🇮🇳',
    state: 'Maharashtra',
    district: 'Pune',
    club: 'Maharashtra Winter Sports',
    gender: 'MEN',
    dateOfBirth: '1999-10-10',
    email: 'sameer.kulkarni@icestockindia.org',
    rankingPoints: 1490,
    worldRank: 16,
    nationalRank: 3,
    disciplines: ['TEAM_GAME', 'TEAM_TARGET', 'TEAM_DISTANCE'],
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2026-12-05',
    stockSpecs: { bodyColor: '#6366f1', discWeight: 3.80, handleType: 'Speed Curved', plateType: 'Type L' },
    stats: { matchesPlayed: 42, matchesWon: 29, goldMedals: 2, silverMedals: 3, bronzeMedals: 1, bestTargetScore: 168, bestDistanceMeters: 119.5, targetAccuracyPercentage: 81.5 }
  },
  {
    id: 'p-ind-4',
    playerId: 'IFI-IND-2026-005',
    name: 'Vikram Shinde',
    country: 'India',
    countryCode: 'IND',
    flag: '🇮🇳',
    state: 'Maharashtra',
    district: 'Satara',
    club: 'Satara Icestock Pioneers',
    gender: 'MEN',
    dateOfBirth: '2002-01-20',
    email: 'vikram.shinde@icestockindia.org',
    rankingPoints: 1420,
    worldRank: 18,
    nationalRank: 4,
    disciplines: ['TEAM_GAME', 'TEAM_TARGET', 'TEAM_DISTANCE'],
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    kycStatus: 'VERIFIED',
    medicalCertificateExpiry: '2027-01-18',
    stockSpecs: { bodyColor: '#6366f1', discWeight: 3.75, handleType: 'Titanium Ice', plateType: 'Type S' },
    stats: { matchesPlayed: 38, matchesWon: 26, goldMedals: 2, silverMedals: 1, bronzeMedals: 3, bestTargetScore: 164, bestDistanceMeters: 108.2, targetAccuracyPercentage: 80.0 }
  }
];

export const MOCK_TEAMS: Team[] = [
  {
    id: 't-ger-men',
    name: 'Germany National Team',
    shortName: 'GER',
    country: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    club: 'DESV Federation Elite',
    category: 'MEN',
    logo: 'https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=200&auto=format&fit=crop&q=80',
    rankingPoints: 5890,
    worldRank: 1,
    managerName: 'Bernhard Kohlhuber',
    coachName: 'Klaus Eder',
    playerIds: ['p-1', 'p-ger-2', 'p-ger-3', 'p-ger-4'],
    stats: { played: 68, won: 59, lost: 7, tie: 2, titles: 12 }
  },
  {
    id: 't-aut-men',
    name: 'Austria National Team',
    shortName: 'AUT',
    country: 'Austria',
    countryCode: 'AUT',
    flag: '🇦🇹',
    club: 'BÖE Federation Eagles',
    category: 'MEN',
    logo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
    rankingPoints: 5620,
    worldRank: 2,
    managerName: 'Franz Riegler',
    coachName: 'Wolfgang Roth',
    playerIds: ['p-2', 'p-aut-2', 'p-aut-3', 'p-aut-4'],
    stats: { played: 65, won: 54, lost: 9, tie: 2, titles: 9 }
  },
  {
    id: 't-ita-men',
    name: 'Italy South Tyrol Elite',
    shortName: 'ITA',
    country: 'Italy',
    countryCode: 'ITA',
    flag: '🇮🇹',
    club: 'FISG Stocksport Squad',
    category: 'MEN',
    logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=200&auto=format&fit=crop&q=80',
    rankingPoints: 4940,
    worldRank: 3,
    managerName: 'Matthias Morandell',
    coachName: 'Hansjörg Aichner',
    playerIds: ['p-3'],
    stats: { played: 52, won: 40, lost: 11, tie: 1, titles: 6 }
  },
  {
    id: 't-sui-men',
    name: 'Switzerland Alpine Blades',
    shortName: 'SUI',
    country: 'Switzerland',
    countryCode: 'SUI',
    flag: '🇨🇭',
    club: 'SESV Federation Davos',
    category: 'MEN',
    logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&auto=format&fit=crop&q=80',
    rankingPoints: 4410,
    worldRank: 4,
    managerName: 'Beat Camenzind',
    coachName: 'Thomas Bieri',
    playerIds: ['p-4'],
    stats: { played: 48, won: 33, lost: 13, tie: 2, titles: 3 }
  },
  {
    id: 't-ind-men',
    name: 'India Icestock National Team',
    shortName: 'IND',
    country: 'India',
    countryCode: 'IND',
    flag: '🇮🇳',
    state: 'Maharashtra',
    club: 'IISF Satara Champions',
    category: 'MEN',
    logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=200&auto=format&fit=crop&q=80',
    rankingPoints: 3820,
    worldRank: 7,
    managerName: 'Ramesh Patil',
    coachName: 'Sanjay Deshmukh',
    playerIds: ['p-5', 'p-ind-2', 'p-ind-3', 'p-ind-4'],
    stats: { played: 38, won: 28, lost: 9, tie: 1, titles: 4 }
  },
  {
    id: 't-bra-men',
    name: 'Brazil Icestock Federation',
    shortName: 'BRA',
    country: 'Brazil',
    countryCode: 'BRA',
    flag: '🇧🇷',
    club: 'FGESV Santa Cruz',
    category: 'MEN',
    logo: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80',
    rankingPoints: 3490,
    worldRank: 8,
    managerName: 'Lori Sehnem',
    coachName: 'Claudio Hermany',
    playerIds: ['p-6'],
    stats: { played: 34, won: 22, lost: 11, tie: 1, titles: 2 }
  }
];

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour-1',
    name: 'IFI World Icestock Championship 2026',
    code: 'WIC-2026',
    tier: 'INTERNATIONAL',
    discipline: ['TEAM_GAME', 'TEAM_TARGET', 'TEAM_DISTANCE', 'INDIVIDUAL_TARGET', 'INDIVIDUAL_DISTANCE', 'HEAD_TO_HEAD'],
    category: ['MEN', 'WOMEN', 'MIXED', 'JUNIORS_U23'],
    surface: 'ICE',
    startDate: '2026-09-15',
    endDate: '2026-09-22',
    location: {
      venue: 'OlympiaWorld Ice Arena',
      city: 'Innsbruck',
      country: 'Austria',
      coordinates: [47.2574, 11.4089]
    },
    status: 'LIVE',
    organizer: 'International Federation Icestocksport (IFI)',
    sanctionedBy: 'International Olympic Committee Recognized Federation',
    rinksCount: 8,
    totalTeams: 32,
    totalPlayers: 194,
    totalPrizePool: '€120,000',
    bannerImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&auto=format&fit=crop&q=80',
    featured: true,
    registrationDeadline: '2026-08-25',
    registeredTeamIds: ['t-ger-men', 't-aut-men', 't-ita-men', 't-sui-men', 't-ind-men', 't-bra-men'],
    registeredPlayerIds: ['p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6']
  },
  {
    id: 'tour-2',
    name: 'European Masters Cup - Garmisch-Partenkirchen',
    code: 'EMC-2026',
    tier: 'CONTINENTAL',
    discipline: ['TEAM_GAME', 'INDIVIDUAL_TARGET', 'HEAD_TO_HEAD'],
    category: ['MEN', 'WOMEN'],
    surface: 'ICE',
    startDate: '2026-10-04',
    endDate: '2026-10-08',
    location: {
      venue: 'Olympic Ice Sport Center',
      city: 'Garmisch',
      country: 'Germany',
      coordinates: [47.4921, 11.0955]
    },
    status: 'REGISTRATION_OPEN',
    organizer: 'DESV (Deutscher Eisstock-Verband)',
    sanctionedBy: 'IFI Europe',
    rinksCount: 6,
    totalTeams: 24,
    totalPlayers: 130,
    totalPrizePool: '€45,000',
    bannerImage: 'https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=1200&auto=format&fit=crop&q=80',
    featured: true,
    registrationDeadline: '2026-09-20',
    registeredTeamIds: ['t-ger-men', 't-aut-men', 't-sui-men'],
    registeredPlayerIds: ['p-1', 'p-2', 'p-4']
  },
  {
    id: 'tour-3',
    name: 'Asian Continental Icestock Games & Trophy',
    code: 'ACIG-2026',
    tier: 'CONTINENTAL',
    discipline: ['TEAM_GAME', 'TEAM_TARGET', 'INDIVIDUAL_DISTANCE'],
    category: ['MEN', 'WOMEN', 'MIXED'],
    surface: 'SYNTHETIC_ICE',
    startDate: '2026-11-12',
    endDate: '2026-11-16',
    location: {
      venue: 'Satara International Sports Complex Arena',
      city: 'Satara',
      country: 'India',
      coordinates: [17.6805, 73.9997]
    },
    status: 'REGISTRATION_OPEN',
    organizer: 'Indian Icestock Sport Federation',
    sanctionedBy: 'IFI Asia',
    rinksCount: 6,
    totalTeams: 18,
    totalPlayers: 96,
    totalPrizePool: '$30,000',
    bannerImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop&q=80',
    featured: true,
    registrationDeadline: '2026-10-25',
    registeredTeamIds: ['t-ind-men'],
    registeredPlayerIds: ['p-5']
  },
  {
    id: 'tour-4',
    name: 'National Championship Germany - Bavaria Open',
    code: 'NCG-2026',
    tier: 'NATIONAL',
    discipline: ['TEAM_GAME', 'INDIVIDUAL_TARGET'],
    category: ['MEN', 'WOMEN'],
    surface: 'ICE',
    startDate: '2026-12-02',
    endDate: '2026-12-05',
    location: {
      venue: 'Max Aicher Arena',
      city: 'Inzell',
      country: 'Germany'
    },
    status: 'DRAFT',
    organizer: 'Bavarian Ice Stock Union (BEV)',
    sanctionedBy: 'DESV',
    rinksCount: 12,
    totalTeams: 32,
    totalPlayers: 180,
    bannerImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&auto=format&fit=crop&q=80',
    featured: false,
    registrationDeadline: '2026-11-15',
    registeredTeamIds: ['t-ger-men'],
    registeredPlayerIds: ['p-1']
  }
];

export const MOCK_MATCHES: Match[] = [
  {
    id: 'm-live-01',
    matchNumber: 'M-WIC-FIN-01',
    tournamentId: 'tour-1',
    discipline: 'TEAM_GAME',
    stage: 'FINAL',
    rinkNumber: 'Rink 1 - Center Ice Stadium',
    scheduledTime: '2026-09-22 17:30',
    status: 'LIVE',
    team1: MOCK_TEAMS[0],
    team2: MOCK_TEAMS[1],
    team1Id: 't-ger-men',
    team2Id: 't-aut-men',
    refereeId: 'ref-01',
    refereeName: 'Dr. Hans-Peter Gruber (IFI Senior Master Referee)',
    umpireName: 'Elisabeth Hofer',
    scores: {
      currentEnd: 4,
      team1TotalScore: 16,
      team2TotalScore: 12,
      team1GamePoints: 2,
      team2GamePoints: 0,
      ends: [
        {
          endNumber: 1,
          team1Score: 6,
          team2Score: 0,
          daubePosition: { x: 0, y: 0 },
          durationSeconds: 165,
          stockPositions: [
            { id: 's1', teamId: 't-ger-men', teamName: 'GER', color: '#3b82f6', x: 280, y: 190, scorePoints: 3 },
            { id: 's2', teamId: 't-ger-men', teamName: 'GER', color: '#3b82f6', x: -390, y: 310, scorePoints: 3 },
            { id: 's3', teamId: 't-aut-men', teamName: 'AUT', color: '#ef4444', x: 920, y: -740, scorePoints: 0 },
            { id: 's4', teamId: 't-aut-men', teamName: 'AUT', color: '#ef4444', x: -1100, y: 1300, scorePoints: 0 }
          ]
        },
        {
          endNumber: 2,
          team1Score: 0,
          team2Score: 8,
          daubePosition: { x: 120, y: -90 },
          durationSeconds: 190,
          stockPositions: [
            { id: 's1', teamId: 't-aut-men', teamName: 'AUT', color: '#ef4444', x: 150, y: -40, scorePoints: 5 },
            { id: 's2', teamId: 't-aut-men', teamName: 'AUT', color: '#ef4444', x: -280, y: -300, scorePoints: 3 },
            { id: 's3', teamId: 't-ger-men', teamName: 'GER', color: '#3b82f6', x: 800, y: 900, scorePoints: 0 }
          ]
        },
        {
          endNumber: 3,
          team1Score: 7,
          team2Score: 0,
          daubePosition: { x: -40, y: 80 },
          durationSeconds: 174,
          stockPositions: [
            { id: 's1', teamId: 't-ger-men', teamName: 'GER', color: '#3b82f6', x: -80, y: 110, scorePoints: 4 },
            { id: 's2', teamId: 't-ger-men', teamName: 'GER', color: '#3b82f6', x: 220, y: 340, scorePoints: 3 },
            { id: 's3', teamId: 't-aut-men', teamName: 'AUT', color: '#ef4444', x: 740, y: -880, scorePoints: 0 }
          ]
        },
        {
          endNumber: 4,
          team1Score: 3,
          team2Score: 4,
          daubePosition: { x: 10, y: -20 },
          durationSeconds: 140,
          stockPositions: [
            { id: 's1', teamId: 't-aut-men', teamName: 'AUT', color: '#ef4444', x: 80, y: -10, scorePoints: 4 },
            { id: 's2', teamId: 't-ger-men', teamName: 'GER', color: '#3b82f6', x: -210, y: 90, scorePoints: 3 }
          ]
        }
      ]
    },
    timer: {
      totalSeconds: 1800,
      currentSeconds: 1124,
      isRunning: true,
      timeoutUsedTeam1: 1,
      timeoutUsedTeam2: 0
    },
    auditTrail: [
      { timestamp: '17:30:00', action: 'Match Started by Referee Dr. Gruber', changedBy: 'ref-01' },
      { timestamp: '17:38:20', action: 'End 1 Result Verified: GER 6 - 0 AUT', changedBy: 'ref-01' },
      { timestamp: '17:49:10', action: 'End 2 Result Verified: GER 0 - 8 AUT', changedBy: 'ref-01' },
      { timestamp: '17:58:30', action: 'End 3 Result Verified: GER 7 - 0 AUT', changedBy: 'ref-01' }
    ]
  },
  {
    id: 'm-live-h2h',
    matchNumber: 'M-WIC-H2H-01',
    tournamentId: 'tour-1',
    discipline: 'HEAD_TO_HEAD',
    stage: 'FINAL',
    rinkNumber: 'Rink 2 - Duel Ice Arena',
    scheduledTime: '2026-09-22 18:30',
    status: 'LIVE',
    player1: MOCK_PLAYERS[0], // Stefan Zellermayer
    player2: MOCK_PLAYERS[3], // Martin Caspar
    player1Id: 'p-1',
    player2Id: 'p-4',
    refereeId: 'ref-01',
    refereeName: 'Dr. Hans-Peter Gruber (IFI Senior Master Referee)',
    umpireName: 'Kurt Weissenbacher',
    scores: {
      currentEnd: 3,
      team1TotalScore: 12,
      team2TotalScore: 6,
      team1GamePoints: 2,
      team2GamePoints: 0,
      ends: [
        {
          endNumber: 1,
          team1Score: 4,
          team2Score: 0,
          daubePosition: { x: 0, y: 0 },
          durationSeconds: 140,
          stockPositions: [
            { id: 's1', teamId: 'p-1', teamName: 'Zellermayer (GER)', color: '#3b82f6', x: 120, y: 80, scorePoints: 4 },
            { id: 's2', teamId: 'p-4', teamName: 'Caspar (SUI)', color: '#f59e0b', x: -600, y: 400, scorePoints: 0 }
          ]
        },
        {
          endNumber: 2,
          team1Score: 0,
          team2Score: 6,
          daubePosition: { x: 50, y: -40 },
          durationSeconds: 160,
          stockPositions: [
            { id: 's1', teamId: 'p-4', teamName: 'Caspar (SUI)', color: '#f59e0b', x: -80, y: 30, scorePoints: 6 },
            { id: 's2', teamId: 'p-1', teamName: 'Zellermayer (GER)', color: '#3b82f6', x: 450, y: -300, scorePoints: 0 }
          ]
        },
        {
          endNumber: 3,
          team1Score: 8,
          team2Score: 0,
          daubePosition: { x: 0, y: 0 },
          durationSeconds: 155,
          stockPositions: [
            { id: 's1', teamId: 'p-1', teamName: 'Zellermayer (GER)', color: '#3b82f6', x: 40, y: 20, scorePoints: 5 },
            { id: 's2', teamId: 'p-1', teamName: 'Zellermayer (GER)', color: '#3b82f6', x: -110, y: 150, scorePoints: 3 },
            { id: 's3', teamId: 'p-4', teamName: 'Caspar (SUI)', color: '#f59e0b', x: 700, y: 800, scorePoints: 0 }
          ]
        }
      ]
    },
    timer: {
      totalSeconds: 1200,
      currentSeconds: 780,
      isRunning: true,
      timeoutUsedTeam1: 0,
      timeoutUsedTeam2: 1
    },
    auditTrail: [
      { timestamp: '18:30:00', action: 'Head to Head Duel Initialized', changedBy: 'ref-01' }
    ]
  },
  {
    id: 'm-live-ttgt',
    matchNumber: 'M-WIC-TTGT-01',
    tournamentId: 'tour-1',
    discipline: 'TEAM_TARGET',
    stage: 'FINAL',
    rinkNumber: 'Rink 4 - Team Target Arena',
    scheduledTime: '2026-09-22 16:00',
    status: 'LIVE',
    team1: MOCK_TEAMS[0],
    team2: MOCK_TEAMS[1],
    team1Id: 't-ger-men',
    team2Id: 't-aut-men',
    refereeId: 'ref-02',
    refereeName: 'Marco Vettori (Chief Target Referee)',
    scores: {
      team1TotalScore: 172,
      team2TotalScore: 168,
      team1TargetPlayers: [
        {
          playerId: 'p-1',
          playerName: 'Stefan Zellermayer',
          playerNumber: 1,
          role: 'Round 1: Center Target',
          isDone: true,
          totalPoints: 48,
          attempts: [
            { roundNumber: 1, attemptNumber: 1, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 15, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 2, targetType: 'CENTER_RINGS', points: 8, timeSeconds: 18, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 3, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 14, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 4, targetType: 'CENTER_RINGS', points: 8, timeSeconds: 19, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 5, targetType: 'CENTER_RINGS', points: 6, timeSeconds: 20, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 6, targetType: 'CENTER_RINGS', points: 6, timeSeconds: 16, refereeConfirmed: true, isDone: true }
          ]
        },
        {
          playerId: 'p-ger-2',
          playerName: 'Christian Obermeier',
          playerNumber: 2,
          role: 'Round 2: Clearance',
          isDone: true,
          totalPoints: 45,
          attempts: [
            { roundNumber: 2, attemptNumber: 1, targetType: 'CLEARANCE', points: 10, timeSeconds: 20, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 2, targetType: 'CLEARANCE', points: 10, timeSeconds: 21, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 3, targetType: 'CLEARANCE', points: 5, timeSeconds: 22, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 4, targetType: 'CLEARANCE', points: 10, timeSeconds: 19, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 5, targetType: 'CLEARANCE', points: 5, timeSeconds: 23, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 6, targetType: 'CLEARANCE', points: 5, timeSeconds: 18, refereeConfirmed: true, isDone: true }
          ]
        },
        {
          playerId: 'p-ger-3',
          playerName: 'Florian Marchl',
          playerNumber: 3,
          role: 'Round 3: Corner Rings',
          isDone: false,
          totalPoints: 42,
          attempts: [
            { roundNumber: 3, attemptNumber: 1, targetType: 'CORNER_RINGS', points: 8, timeSeconds: 17, refereeConfirmed: true, isDone: true },
            { roundNumber: 3, attemptNumber: 2, targetType: 'CORNER_RINGS', points: 10, timeSeconds: 16, refereeConfirmed: true, isDone: true },
            { roundNumber: 3, attemptNumber: 3, targetType: 'CORNER_RINGS', points: 8, timeSeconds: 20, refereeConfirmed: true, isDone: true },
            { roundNumber: 3, attemptNumber: 4, targetType: 'CORNER_RINGS', points: 8, timeSeconds: 19, refereeConfirmed: true, isDone: true },
            { roundNumber: 3, attemptNumber: 5, targetType: 'CORNER_RINGS', points: 8, timeSeconds: 22, refereeConfirmed: true, isDone: true }
          ]
        },
        {
          playerId: 'p-ger-4',
          playerName: 'Max Schedlbauer',
          playerNumber: 4,
          role: 'Round 4: Combine Deflection',
          isDone: false,
          totalPoints: 37,
          attempts: [
            { roundNumber: 4, attemptNumber: 1, targetType: 'COMBINE', points: 10, timeSeconds: 18, refereeConfirmed: true, isDone: true },
            { roundNumber: 4, attemptNumber: 2, targetType: 'COMBINE', points: 8, timeSeconds: 21, refereeConfirmed: true, isDone: true },
            { roundNumber: 4, attemptNumber: 3, targetType: 'COMBINE', points: 7, timeSeconds: 20, refereeConfirmed: true, isDone: true },
            { roundNumber: 4, attemptNumber: 4, targetType: 'COMBINE', points: 6, timeSeconds: 19, refereeConfirmed: true, isDone: true },
            { roundNumber: 4, attemptNumber: 5, targetType: 'COMBINE', points: 6, timeSeconds: 22, refereeConfirmed: true, isDone: true }
          ]
        }
      ],
      team2TargetPlayers: [
        {
          playerId: 'p-2',
          playerName: 'Simone Steiner',
          playerNumber: 1,
          role: 'Round 1: Center Target',
          isDone: true,
          totalPoints: 46,
          attempts: [
            { roundNumber: 1, attemptNumber: 1, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 16, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 2, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 17, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 3, targetType: 'CENTER_RINGS', points: 8, timeSeconds: 19, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 4, targetType: 'CENTER_RINGS', points: 6, timeSeconds: 18, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 5, targetType: 'CENTER_RINGS', points: 6, timeSeconds: 20, refereeConfirmed: true, isDone: true },
            { roundNumber: 1, attemptNumber: 6, targetType: 'CENTER_RINGS', points: 6, timeSeconds: 15, refereeConfirmed: true, isDone: true }
          ]
        },
        {
          playerId: 'p-aut-2',
          playerName: 'Franz Roth',
          playerNumber: 2,
          role: 'Round 2: Clearance',
          isDone: true,
          totalPoints: 42,
          attempts: [
            { roundNumber: 2, attemptNumber: 1, targetType: 'CLEARANCE', points: 10, timeSeconds: 21, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 2, targetType: 'CLEARANCE', points: 5, timeSeconds: 20, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 3, targetType: 'CLEARANCE', points: 10, timeSeconds: 19, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 4, targetType: 'CLEARANCE', points: 5, timeSeconds: 22, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 5, targetType: 'CLEARANCE', points: 10, timeSeconds: 20, refereeConfirmed: true, isDone: true },
            { roundNumber: 2, attemptNumber: 6, targetType: 'CLEARANCE', points: 2, timeSeconds: 18, refereeConfirmed: true, isDone: true }
          ]
        },
        {
          playerId: 'p-aut-3',
          playerName: 'Matthias Taxacher',
          playerNumber: 3,
          role: 'Round 3: Corner Rings',
          isDone: false,
          totalPoints: 44,
          attempts: [
            { roundNumber: 3, attemptNumber: 1, targetType: 'CORNER_RINGS', points: 10, timeSeconds: 18, refereeConfirmed: true, isDone: true },
            { roundNumber: 3, attemptNumber: 2, targetType: 'CORNER_RINGS', points: 8, timeSeconds: 17, refereeConfirmed: true, isDone: true },
            { roundNumber: 3, attemptNumber: 3, targetType: 'CORNER_RINGS', points: 10, timeSeconds: 19, refereeConfirmed: true, isDone: true },
            { roundNumber: 3, attemptNumber: 4, targetType: 'CORNER_RINGS', points: 8, timeSeconds: 20, refereeConfirmed: true, isDone: true },
            { roundNumber: 3, attemptNumber: 5, targetType: 'CORNER_RINGS', points: 8, timeSeconds: 21, refereeConfirmed: true, isDone: true }
          ]
        },
        {
          playerId: 'p-aut-4',
          playerName: 'Peter Schwarz',
          playerNumber: 4,
          role: 'Round 4: Combine Deflection',
          isDone: false,
          totalPoints: 36,
          attempts: [
            { roundNumber: 4, attemptNumber: 1, targetType: 'COMBINE', points: 8, timeSeconds: 20, refereeConfirmed: true, isDone: true },
            { roundNumber: 4, attemptNumber: 2, targetType: 'COMBINE', points: 8, timeSeconds: 22, refereeConfirmed: true, isDone: true },
            { roundNumber: 4, attemptNumber: 3, targetType: 'COMBINE', points: 6, timeSeconds: 19, refereeConfirmed: true, isDone: true },
            { roundNumber: 4, attemptNumber: 4, targetType: 'COMBINE', points: 8, timeSeconds: 21, refereeConfirmed: true, isDone: true },
            { roundNumber: 4, attemptNumber: 5, targetType: 'COMBINE', points: 6, timeSeconds: 23, refereeConfirmed: true, isDone: true }
          ]
        }
      ]
    },
    timer: {
      totalSeconds: 2400,
      currentSeconds: 1420,
      isRunning: true,
      timeoutUsedTeam1: 0,
      timeoutUsedTeam2: 0
    },
    auditTrail: [
      { timestamp: '16:00:00', action: 'Team Target Event Started - One by One Scorer Active', changedBy: 'ref-02' }
    ]
  },
  {
    id: 'm-live-02',
    matchNumber: 'M-WIC-TGT-04',
    tournamentId: 'tour-1',
    discipline: 'INDIVIDUAL_TARGET',
    stage: 'FINAL',
    rinkNumber: 'Rink 3 - Target Arena',
    scheduledTime: '2026-09-22 18:00',
    status: 'LIVE',
    player1: MOCK_PLAYERS[0],
    player2: MOCK_PLAYERS[1],
    player1Id: 'p-1',
    player2Id: 'p-2',
    refereeId: 'ref-02',
    refereeName: 'Marco Vettori (IFI Chief Umpire)',
    scores: {
      player1TargetDone: false,
      player2TargetDone: false,
      player1TargetAttempts: [
        { roundNumber: 1, attemptNumber: 1, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 18, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 2, targetType: 'CENTER_RINGS', points: 8, timeSeconds: 22, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 3, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 19, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 4, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 24, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 5, targetType: 'CENTER_RINGS', points: 8, timeSeconds: 21, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 6, targetType: 'CENTER_RINGS', points: 8, timeSeconds: 20, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 1, targetType: 'CLEARANCE', points: 10, timeSeconds: 25, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 2, targetType: 'CLEARANCE', points: 10, timeSeconds: 27, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 3, targetType: 'CLEARANCE', points: 5, timeSeconds: 20, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 4, targetType: 'CLEARANCE', points: 10, timeSeconds: 22, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 5, targetType: 'CLEARANCE', points: 5, timeSeconds: 23, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 6, targetType: 'CLEARANCE', points: 2, timeSeconds: 19, refereeConfirmed: true, isDone: true }
      ],
      player2TargetAttempts: [
        { roundNumber: 1, attemptNumber: 1, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 17, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 2, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 20, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 3, targetType: 'CENTER_RINGS', points: 8, timeSeconds: 21, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 4, targetType: 'CENTER_RINGS', points: 8, timeSeconds: 19, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 5, targetType: 'CENTER_RINGS', points: 10, timeSeconds: 26, refereeConfirmed: true, isDone: true },
        { roundNumber: 1, attemptNumber: 6, targetType: 'CENTER_RINGS', points: 8, timeSeconds: 22, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 1, targetType: 'CLEARANCE', points: 10, timeSeconds: 24, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 2, targetType: 'CLEARANCE', points: 5, timeSeconds: 22, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 3, targetType: 'CLEARANCE', points: 10, timeSeconds: 20, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 4, targetType: 'CLEARANCE', points: 10, timeSeconds: 21, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 5, targetType: 'CLEARANCE', points: 5, timeSeconds: 23, refereeConfirmed: true, isDone: true },
        { roundNumber: 2, attemptNumber: 6, targetType: 'CLEARANCE', points: 5, timeSeconds: 20, refereeConfirmed: true, isDone: true }
      ]
    },
    timer: {
      totalSeconds: 900,
      currentSeconds: 410,
      isRunning: true,
      timeoutUsedTeam1: 0,
      timeoutUsedTeam2: 0
    },
    auditTrail: [
      { timestamp: '18:00:00', action: 'Target Round Started - One-by-One Shot Engine Active', changedBy: 'ref-02' }
    ]
  },
  {
    id: 'm-live-tdst',
    matchNumber: 'M-WIC-TDST-01',
    tournamentId: 'tour-1',
    discipline: 'TEAM_DISTANCE',
    stage: 'FINAL',
    rinkNumber: 'Distance Track Alfa - Team Lane',
    scheduledTime: '2026-09-22 15:00',
    status: 'LIVE',
    team1: MOCK_TEAMS[2], // Italy
    team2: MOCK_TEAMS[4], // India
    team1Id: 't-ita-men',
    team2Id: 't-ind-men',
    refereeId: 'ref-03',
    refereeName: 'Karl Hinteregger (Laser Telemetry Specialist)',
    scores: {
      team1TotalScore: 498.4,
      team2TotalScore: 454.9,
      team1DistancePlayers: [
        {
          playerId: 'p-3',
          playerName: 'Markus Schätz',
          playerNumber: 1,
          club: 'EV Lana Raika',
          isDone: true,
          bestDistance: 132.8,
          attempts: [
            { attemptNumber: 1, distanceMeters: 128.40, isValid: true, windSpeedKmh: 4.2, iceTempCelsius: -5.4, speedKmh: 74.2, isDone: true },
            { attemptNumber: 2, distanceMeters: 132.80, isValid: true, windSpeedKmh: 3.8, iceTempCelsius: -5.6, speedKmh: 76.1, isDone: true },
            { attemptNumber: 3, distanceMeters: 129.10, isValid: true, windSpeedKmh: 4.0, iceTempCelsius: -5.5, speedKmh: 75.0, isDone: true },
            { attemptNumber: 4, distanceMeters: 131.50, isValid: true, windSpeedKmh: 3.9, iceTempCelsius: -5.5, speedKmh: 75.8, isDone: true },
            { attemptNumber: 5, distanceMeters: 0, isValid: false, windSpeedKmh: 4.5, iceTempCelsius: -5.5, speedKmh: 76.0, isDone: true }
          ]
        },
        {
          playerId: 'p-ita-2',
          playerName: 'Rene Aichner',
          playerNumber: 2,
          club: 'ASV Teis',
          isDone: true,
          bestDistance: 124.6,
          attempts: [
            { attemptNumber: 1, distanceMeters: 120.50, isValid: true, windSpeedKmh: 4.1, iceTempCelsius: -5.4, speedKmh: 72.3, isDone: true },
            { attemptNumber: 2, distanceMeters: 124.60, isValid: true, windSpeedKmh: 3.7, iceTempCelsius: -5.5, speedKmh: 74.0, isDone: true },
            { attemptNumber: 3, distanceMeters: 122.90, isValid: true, windSpeedKmh: 4.0, iceTempCelsius: -5.5, speedKmh: 73.1, isDone: true }
          ]
        },
        {
          playerId: 'p-ita-3',
          playerName: 'Martin Kerschbaumer',
          playerNumber: 3,
          club: 'EV Völlan',
          isDone: false,
          bestDistance: 121.2,
          attempts: [
            { attemptNumber: 1, distanceMeters: 118.40, isValid: true, windSpeedKmh: 4.0, iceTempCelsius: -5.4, speedKmh: 71.8, isDone: true },
            { attemptNumber: 2, distanceMeters: 121.20, isValid: true, windSpeedKmh: 3.9, iceTempCelsius: -5.5, speedKmh: 72.9, isDone: true }
          ]
        },
        {
          playerId: 'p-ita-4',
          playerName: 'Roman Zublasing',
          playerNumber: 4,
          club: 'SV Kaltern',
          isDone: false,
          bestDistance: 119.8,
          attempts: [
            { attemptNumber: 1, distanceMeters: 119.80, isValid: true, windSpeedKmh: 4.2, iceTempCelsius: -5.5, speedKmh: 72.1, isDone: true }
          ]
        }
      ],
      team2DistancePlayers: [
        {
          playerId: 'p-5',
          playerName: 'Aarav Patil',
          playerNumber: 1,
          club: 'Satara Pioneers',
          isDone: true,
          bestDistance: 118.9,
          attempts: [
            { attemptNumber: 1, distanceMeters: 114.20, isValid: true, windSpeedKmh: 4.1, iceTempCelsius: -5.4, speedKmh: 71.3, isDone: true },
            { attemptNumber: 2, distanceMeters: 118.90, isValid: true, windSpeedKmh: 3.9, iceTempCelsius: -5.5, speedKmh: 73.2, isDone: true },
            { attemptNumber: 3, distanceMeters: 0, isValid: false, windSpeedKmh: 5.1, iceTempCelsius: -5.5, speedKmh: 74.8, isDone: true }
          ]
        },
        {
          playerId: 'p-ind-2',
          playerName: 'Rohan Deshmukh',
          playerNumber: 2,
          club: 'Satara Pioneers',
          isDone: true,
          bestDistance: 114.8,
          attempts: [
            { attemptNumber: 1, distanceMeters: 111.40, isValid: true, windSpeedKmh: 4.0, iceTempCelsius: -5.4, speedKmh: 70.1, isDone: true },
            { attemptNumber: 2, distanceMeters: 114.80, isValid: true, windSpeedKmh: 3.8, iceTempCelsius: -5.5, speedKmh: 71.5, isDone: true }
          ]
        },
        {
          playerId: 'p-ind-3',
          playerName: 'Sameer Kulkarni',
          playerNumber: 3,
          club: 'Maharashtra Sports',
          isDone: false,
          bestDistance: 112.5,
          attempts: [
            { attemptNumber: 1, distanceMeters: 112.50, isValid: true, windSpeedKmh: 4.1, iceTempCelsius: -5.5, speedKmh: 70.8, isDone: true }
          ]
        },
        {
          playerId: 'p-ind-4',
          playerName: 'Vikram Shinde',
          playerNumber: 4,
          club: 'Satara Pioneers',
          isDone: false,
          bestDistance: 108.7,
          attempts: [
            { attemptNumber: 1, distanceMeters: 108.70, isValid: true, windSpeedKmh: 4.3, iceTempCelsius: -5.5, speedKmh: 69.2, isDone: true }
          ]
        }
      ]
    },
    timer: {
      totalSeconds: 1800,
      currentSeconds: 980,
      isRunning: true,
      timeoutUsedTeam1: 0,
      timeoutUsedTeam2: 0
    },
    auditTrail: [
      { timestamp: '15:00:00', action: 'Team Distance Event Launched - One-by-One Telemetry Active', changedBy: 'ref-03' }
    ]
  },
  {
    id: 'm-live-03',
    matchNumber: 'M-WIC-DST-02',
    tournamentId: 'tour-1',
    discipline: 'INDIVIDUAL_DISTANCE',
    stage: 'FINAL',
    rinkNumber: 'Distance Track Alfa (150m Ice Lane)',
    scheduledTime: '2026-09-22 19:15',
    status: 'LIVE',
    player1: MOCK_PLAYERS[2], // Markus Schätz
    player2: MOCK_PLAYERS[4], // Aarav Patil
    player1Id: 'p-3',
    player2Id: 'p-5',
    refereeId: 'ref-03',
    refereeName: 'Karl Hinteregger (Laser Telemetry Specialist)',
    scores: {
      player1DistanceDone: false,
      player2DistanceDone: false,
      bestDistance: {
        'p-3': 132.48,
        'p-5': 118.90
      },
      distanceAttempts: {
        'p-3': [
          { attemptNumber: 1, distanceMeters: 128.40, isValid: true, windSpeedKmh: 4.2, iceTempCelsius: -5.4, speedKmh: 74.2, isDone: true },
          { attemptNumber: 2, distanceMeters: 132.48, isValid: true, windSpeedKmh: 3.8, iceTempCelsius: -5.6, speedKmh: 76.1, isDone: true },
          { attemptNumber: 3, distanceMeters: 129.10, isValid: true, windSpeedKmh: 4.0, iceTempCelsius: -5.5, speedKmh: 75.0, isDone: true }
        ],
        'p-5': [
          { attemptNumber: 1, distanceMeters: 114.20, isValid: true, windSpeedKmh: 4.1, iceTempCelsius: -5.4, speedKmh: 71.3, isDone: true },
          { attemptNumber: 2, distanceMeters: 118.90, isValid: true, windSpeedKmh: 3.9, iceTempCelsius: -5.5, speedKmh: 73.2, isDone: true },
          { attemptNumber: 3, distanceMeters: 0, isValid: false, windSpeedKmh: 5.1, iceTempCelsius: -5.5, speedKmh: 74.8, isDone: true }
        ]
      }
    },
    timer: {
      totalSeconds: 600,
      currentSeconds: 220,
      isRunning: true,
      timeoutUsedTeam1: 0,
      timeoutUsedTeam2: 0
    },
    auditTrail: [
      { timestamp: '19:15:00', action: 'Laser Distance Calibration Confirmed', changedBy: 'ref-03' }
    ]
  },
  {
    id: 'm-comp-01',
    matchNumber: 'M-WIC-SEMI-01',
    tournamentId: 'tour-1',
    discipline: 'TEAM_GAME',
    stage: 'SEMI_FINAL',
    rinkNumber: 'Rink 2',
    scheduledTime: '2026-09-21 14:00',
    status: 'LOCKED_VERIFIED',
    team1: MOCK_TEAMS[0],
    team2: MOCK_TEAMS[2],
    team1Id: 't-ger-men',
    team2Id: 't-ita-men',
    winnerId: 't-ger-men',
    refereeId: 'ref-01',
    refereeName: 'Dr. Hans-Peter Gruber',
    scores: {
      team1TotalScore: 22,
      team2TotalScore: 10,
      team1GamePoints: 2,
      team2GamePoints: 0,
      ends: [
        { endNumber: 1, team1Score: 4, team2Score: 0, daubePosition: { x: 0, y: 0 }, durationSeconds: 150, stockPositions: [] },
        { endNumber: 2, team1Score: 6, team2Score: 0, daubePosition: { x: 0, y: 0 }, durationSeconds: 160, stockPositions: [] },
        { endNumber: 3, team1Score: 0, team2Score: 5, daubePosition: { x: 0, y: 0 }, durationSeconds: 170, stockPositions: [] },
        { endNumber: 4, team1Score: 5, team2Score: 0, daubePosition: { x: 0, y: 0 }, durationSeconds: 140, stockPositions: [] },
        { endNumber: 5, team1Score: 0, team2Score: 5, daubePosition: { x: 0, y: 0 }, durationSeconds: 155, stockPositions: [] },
        { endNumber: 6, team1Score: 7, team2Score: 0, daubePosition: { x: 0, y: 0 }, durationSeconds: 180, stockPositions: [] }
      ]
    },
    timer: { totalSeconds: 1800, currentSeconds: 0, isRunning: false, timeoutUsedTeam1: 0, timeoutUsedTeam2: 1 },
    auditTrail: [
      { timestamp: '15:20:00', action: 'Match Result Locked & Official Stamp Added', changedBy: 'ref-01' }
    ]
  }
];

export const MOCK_RANKINGS: RankingEntry[] = [
  {
    rank: 1,
    prevRank: 1,
    id: 'p-1',
    name: 'Stefan Zellermayer',
    teamName: 'Germany National Team',
    country: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    points: 2480,
    tournamentsPlayed: 18,
    gold: 14,
    silver: 6,
    bronze: 3,
    winRate: 83.8,
    category: 'MEN',
    discipline: 'INDIVIDUAL_TARGET'
  },
  {
    rank: 2,
    prevRank: 3,
    id: 'p-2',
    name: 'Simone Steiner',
    teamName: 'Austria National Team',
    country: 'Austria',
    countryCode: 'AUT',
    flag: '🇦🇹',
    points: 2390,
    tournamentsPlayed: 16,
    gold: 11,
    silver: 5,
    bronze: 4,
    winRate: 82.8,
    category: 'WOMEN',
    discipline: 'INDIVIDUAL_TARGET'
  },
  {
    rank: 3,
    prevRank: 2,
    id: 'p-3',
    name: 'Markus Schätz',
    teamName: 'Italy South Tyrol Elite',
    country: 'Italy',
    countryCode: 'ITA',
    flag: '🇮🇹',
    points: 2210,
    tournamentsPlayed: 14,
    gold: 9,
    silver: 8,
    bronze: 2,
    winRate: 80.6,
    category: 'MEN',
    discipline: 'INDIVIDUAL_DISTANCE'
  },
  {
    rank: 4,
    prevRank: 4,
    id: 'p-4',
    name: 'Martin Caspar',
    teamName: 'Switzerland Alpine Blades',
    country: 'Switzerland',
    countryCode: 'SUI',
    flag: '🇨🇭',
    points: 2050,
    tournamentsPlayed: 13,
    gold: 5,
    silver: 6,
    bronze: 5,
    winRate: 72.9,
    category: 'MEN',
    discipline: 'TEAM_GAME'
  },
  {
    rank: 5,
    prevRank: 7,
    id: 'p-5',
    name: 'Aarav Patil',
    teamName: 'India Icestock National Team',
    country: 'India',
    countryCode: 'IND',
    flag: '🇮🇳',
    points: 1720,
    tournamentsPlayed: 10,
    gold: 4,
    silver: 2,
    bronze: 1,
    winRate: 75.9,
    category: 'MEN',
    discipline: 'HEAD_TO_HEAD'
  },
  {
    rank: 6,
    prevRank: 6,
    id: 'p-6',
    name: 'Eduardo Schuh',
    teamName: 'Brazil Icestock Federation',
    country: 'Brazil',
    countryCode: 'BRA',
    flag: '🇧🇷',
    points: 1680,
    tournamentsPlayed: 11,
    gold: 3,
    silver: 4,
    bronze: 2,
    winRate: 73.3,
    category: 'MEN',
    discipline: 'TEAM_DISTANCE'
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n-1',
    title: 'IFI Announces Next-Gen Digital Scoring & Sensor Telemetry for 2026 World Cup',
    category: 'FEDERATION',
    summary: 'The International Federation Icestocksport officially rolls out cloud-synchronized 3D ice rink mapping and millimeter-precision laser distance tracking.',
    date: '2026-08-10',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    author: 'IFI Media Executive'
  },
  {
    id: 'n-2',
    title: 'Innsbruck OlympiaWorld Ready to Host Record 32 Nations for World Championship',
    category: 'CHAMPIONSHIP',
    summary: 'State-of-the-art ice cooling technology and stadium LED displays will welcome over 200 elite athletes across 6 disciplines.',
    date: '2026-08-04',
    imageUrl: 'https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=800&auto=format&fit=crop&q=80',
    author: 'Winter Sports Global'
  },
  {
    id: 'n-3',
    title: 'Historic Expansion: Asian Icestock Games to Debut in Satara International Complex',
    category: 'ASIAN FEDERATION',
    summary: 'India to host premier synthetic-ice continental tournament bringing teams from Japan, Korea, Australia, and South Asia.',
    date: '2026-07-28',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80',
    author: 'IISF Satara Press'
  }
];

export const MOCK_SPONSORS: Sponsor[] = [
  { id: 'sp-1', name: 'Ladler Eisstock', tier: 'PLATINUM', logo: '🛡️ LADLER PRO', website: 'https://www.ladler.com' },
  { id: 'sp-2', name: 'Seiwald Stock-Sport', tier: 'PLATINUM', logo: '❄️ SEIWALD PRECISION', website: 'https://www.seiwald.com' },
  { id: 'sp-3', name: 'EBRA Eisstocktechnik', tier: 'GOLD', logo: '⚡ EBRA DYNAMICS', website: 'https://www.ebra.de' },
  { id: 'sp-4', name: 'AST Eis- & Solartechnik', tier: 'GLOBAL_BROADCAST', logo: '🌐 AST ICE ARENAS', website: 'https://www.ast.at' },
  { id: 'sp-5', name: 'Bavaria Winter Olympic Tech', tier: 'OFFICIAL_EQUIPMENT', logo: '🏆 OLYMPIA TECH', website: 'https://olympiatech.de' }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-08-13 19:45:10',
    userId: 'usr-admin-01',
    userName: 'President Christian Lindner',
    userRole: 'SUPER_ADMIN',
    action: 'TOURNAMENT_SANCTION_APPROVED',
    details: 'Approved World Icestock Championship 2026 (WIC-2026) venue and prize allocation',
    ipAddress: '192.168.1.1'
  },
  {
    id: 'aud-2',
    timestamp: '2026-08-13 18:02:15',
    userId: 'ref-01',
    userName: 'Dr. Hans-Peter Gruber',
    userRole: 'REFEREE',
    action: 'LIVE_SCORE_SUBMISSION',
    details: 'Submitted End 3 results for Match M-WIC-FIN-01 (GER 7 - 0 AUT)',
    ipAddress: '10.0.4.52'
  },
  {
    id: 'aud-3',
    timestamp: '2026-08-13 16:30:40',
    userId: 'usr-kyc-09',
    userName: 'Federation Medical Board',
    userRole: 'NATIONAL_HEAD',
    action: 'PLAYER_KYC_VERIFICATION',
    details: 'Verified Stefan Zellermayer (IFI-GER-2026-001) medical & passport credentials',
    ipAddress: '194.25.0.12'
  }
];

export const MOCK_REFEREES: RefereeProfile[] = [
  {
    id: 'ref-01',
    name: 'Dr. Hans-Peter Gruber',
    email: 'h.gruber@icestock.org',
    country: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    licenseNumber: 'IFI-REF-GOLD-01',
    certificationLevel: 'IFI_MASTER_INTERNATIONAL',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    assignedRinkId: 'rink-1',
    assignedRinkName: 'Rink 1 - Center Ice Stadium',
    status: 'OFFICIATING_MATCH',
    specialization: ['TEAM_GAME', 'HEAD_TO_HEAD', 'TEAM_TARGET'],
    matchesOfficiatedCount: 148,
    phone: '+49 89 421980',
    currentMatchId: 'm-live-01',
    checkInTime: '2026-09-22 17:00'
  },
  {
    id: 'ref-02',
    name: 'Marco Vettori',
    email: 'm.vettori@icestock.it',
    country: 'Italy',
    countryCode: 'ITA',
    flag: '🇮🇹',
    licenseNumber: 'IFI-REF-GOLD-77',
    certificationLevel: 'IFI_CHIEF_UMPIRE',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    assignedRinkId: 'rink-3',
    assignedRinkName: 'Rink 3 - Target Arena',
    status: 'OFFICIATING_MATCH',
    specialization: ['INDIVIDUAL_TARGET', 'TEAM_TARGET'],
    matchesOfficiatedCount: 112,
    phone: '+39 0471 89201',
    currentMatchId: 'm-live-02',
    checkInTime: '2026-09-22 17:30'
  },
  {
    id: 'ref-03',
    name: 'Karl Hinteregger',
    email: 'k.hinteregger@icestock.at',
    country: 'Austria',
    countryCode: 'AUT',
    flag: '🇦🇹',
    licenseNumber: 'IFI-TECH-LAS-14',
    certificationLevel: 'IFI_MASTER_INTERNATIONAL',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    assignedRinkId: 'rink-4',
    assignedRinkName: 'Rink 4 - Distance Track Alfa',
    status: 'OFFICIATING_MATCH',
    specialization: ['TEAM_DISTANCE', 'INDIVIDUAL_DISTANCE'],
    matchesOfficiatedCount: 96,
    phone: '+43 512 67890',
    currentMatchId: 'm-live-tdst',
    checkInTime: '2026-09-22 14:30'
  },
  {
    id: 'ref-04',
    name: 'Elisabeth Hofer',
    email: 'e.hofer@icestock.at',
    country: 'Austria',
    countryCode: 'AUT',
    flag: '🇦🇹',
    licenseNumber: 'IFI-REF-INT-22',
    certificationLevel: 'NATIONAL_A',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    assignedRinkId: 'rink-1',
    assignedRinkName: 'Rink 1 - Center Ice Stadium',
    status: 'AVAILABLE_ON_RINK',
    specialization: ['TEAM_GAME', 'HEAD_TO_HEAD'],
    matchesOfficiatedCount: 64,
    phone: '+43 662 33445',
    currentMatchId: 'm-live-01',
    checkInTime: '2026-09-22 17:10'
  },
  {
    id: 'ref-05',
    name: 'Rajesh Patil',
    email: 'rajesh.patil@icestockindia.org',
    country: 'India',
    countryCode: 'IND',
    flag: '🇮🇳',
    licenseNumber: 'IISF-REF-NAT-05',
    certificationLevel: 'NATIONAL_A',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    assignedRinkId: 'rink-2',
    assignedRinkName: 'Rink 2 - Duel Ice Arena',
    status: 'OFFICIATING_MATCH',
    specialization: ['HEAD_TO_HEAD', 'TEAM_GAME', 'TEAM_TARGET'],
    matchesOfficiatedCount: 52,
    phone: '+91 98220 12345',
    currentMatchId: 'm-live-h2h',
    checkInTime: '2026-09-22 18:00'
  },
  {
    id: 'ref-06',
    name: 'Thomas Lindner',
    email: 't.lindner@icestock.de',
    country: 'Germany',
    countryCode: 'GER',
    flag: '🇩🇪',
    licenseNumber: 'DESV-REF-BAY-88',
    certificationLevel: 'STATE_CERTIFIED',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    assignedRinkId: 'rink-5',
    assignedRinkName: 'Rink 5 - North Competitor Lane',
    status: 'AVAILABLE_ON_RINK',
    specialization: ['TEAM_GAME', 'INDIVIDUAL_TARGET'],
    matchesOfficiatedCount: 41,
    phone: '+49 8651 9871',
    checkInTime: '2026-09-22 16:45'
  },
  {
    id: 'ref-07',
    name: 'Kurt Weissenbacher',
    email: 'k.weissenbacher@icestock.ch',
    country: 'Switzerland',
    countryCode: 'SUI',
    flag: '🇨🇭',
    licenseNumber: 'SESV-REF-CH-09',
    certificationLevel: 'NATIONAL_A',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    assignedRinkId: 'rink-2',
    assignedRinkName: 'Rink 2 - Duel Ice Arena',
    status: 'AVAILABLE_ON_RINK',
    specialization: ['HEAD_TO_HEAD', 'TEAM_GAME'],
    matchesOfficiatedCount: 78,
    phone: '+41 81 410 2030',
    currentMatchId: 'm-live-h2h',
    checkInTime: '2026-09-22 18:05'
  },
  {
    id: 'ref-08',
    name: 'Lori Santos',
    email: 'lori.santos@icestock.com.br',
    country: 'Brazil',
    countryCode: 'BRA',
    flag: '🇧🇷',
    licenseNumber: 'FGESV-REF-BR-03',
    certificationLevel: 'DISTRICT_OFFICIAL',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    assignedRinkId: 'rink-6',
    assignedRinkName: 'Rink 6 - Synthetic Polymer Lane',
    status: 'ON_STANDBY',
    specialization: ['TEAM_DISTANCE', 'INDIVIDUAL_DISTANCE'],
    matchesOfficiatedCount: 29,
    phone: '+55 51 9988-7766'
  }
];

export const MOCK_RINKS: RinkVenueInfo[] = [
  {
    id: 'rink-1',
    tournamentId: 'tour-1',
    rinkNumber: 'Rink 1',
    name: 'Rink 1 - Center Ice Stadium',
    surface: 'ICE',
    dimensions: '28m x 3m (Official IFI Lane)',
    status: 'ACTIVE_MATCH',
    temperatureCelsius: -5.2,
    humidityPercentage: 54,
    currentMatchId: 'm-live-01',
    assignedChiefRefereeId: 'ref-01',
    assignedChiefRefereeName: 'Dr. Hans-Peter Gruber',
    assignedUmpireId: 'ref-04',
    assignedUmpireName: 'Elisabeth Hofer',
    notes: 'Main broadcast rink with 4K television cameras and laser telemetry'
  },
  {
    id: 'rink-2',
    tournamentId: 'tour-1',
    rinkNumber: 'Rink 2',
    name: 'Rink 2 - Duel Ice Arena',
    surface: 'ICE',
    dimensions: '28m x 3m (Head-to-Head Arena)',
    status: 'ACTIVE_MATCH',
    temperatureCelsius: -5.4,
    humidityPercentage: 52,
    currentMatchId: 'm-live-h2h',
    assignedChiefRefereeId: 'ref-05',
    assignedChiefRefereeName: 'Rajesh Patil',
    assignedUmpireId: 'ref-07',
    assignedUmpireName: 'Kurt Weissenbacher',
    notes: 'Dual shot clock and LED turn indicator boards enabled'
  },
  {
    id: 'rink-3',
    tournamentId: 'tour-1',
    rinkNumber: 'Rink 3',
    name: 'Rink 3 - Target Arena',
    surface: 'ICE',
    dimensions: '30m x 4m (Concentric Target Field)',
    status: 'ACTIVE_MATCH',
    temperatureCelsius: -4.8,
    humidityPercentage: 56,
    currentMatchId: 'm-live-02',
    assignedChiefRefereeId: 'ref-02',
    assignedChiefRefereeName: 'Marco Vettori',
    notes: 'Target rings homologated with digital sensor confirmation'
  },
  {
    id: 'rink-4',
    tournamentId: 'tour-1',
    rinkNumber: 'Rink 4',
    name: 'Rink 4 - Distance Track Alfa',
    surface: 'ICE',
    dimensions: '150m x 8m (Laser Distance Track)',
    status: 'ACTIVE_MATCH',
    temperatureCelsius: -5.8,
    humidityPercentage: 48,
    currentMatchId: 'm-live-tdst',
    assignedChiefRefereeId: 'ref-03',
    assignedChiefRefereeName: 'Karl Hinteregger',
    assignedLaserTechId: 'ref-03',
    assignedLaserTechName: 'Karl Hinteregger',
    notes: 'Wind gauge sensor station calibrated to ±0.1 km/h'
  },
  {
    id: 'rink-5',
    tournamentId: 'tour-1',
    rinkNumber: 'Rink 5',
    name: 'Rink 5 - North Competitor Lane',
    surface: 'ICE',
    dimensions: '28m x 3m (Competition Standard)',
    status: 'OPEN_AVAILABLE',
    temperatureCelsius: -5.0,
    humidityPercentage: 55,
    assignedChiefRefereeId: 'ref-06',
    assignedChiefRefereeName: 'Thomas Lindner',
    notes: 'Prepared for Round of 16 placement fixtures'
  },
  {
    id: 'rink-6',
    tournamentId: 'tour-1',
    rinkNumber: 'Rink 6',
    name: 'Rink 6 - Synthetic Polymer Lane',
    surface: 'SYNTHETIC_ICE',
    dimensions: '26m x 3m (Summer Rules)',
    status: 'OPEN_AVAILABLE',
    temperatureCelsius: 18.0,
    humidityPercentage: 60,
    assignedChiefRefereeId: 'ref-08',
    assignedChiefRefereeName: 'Lori Santos',
    notes: 'Polymer gliding test verified with Type S green plates'
  }
];

export const MOCK_RINK_ASSIGNMENTS: RinkRefereeAssignment[] = [
  {
    id: 'asg-01',
    tournamentId: 'tour-1',
    rinkId: 'rink-1',
    rinkName: 'Rink 1 - Center Ice Stadium',
    matchId: 'm-live-01',
    matchNumber: 'M-WIC-FIN-01',
    refereeId: 'ref-01',
    refereeName: 'Dr. Hans-Peter Gruber',
    refereeRole: 'CHIEF_REFEREE',
    shiftStartTime: '17:00',
    shiftEndTime: '19:00',
    status: 'OFFICIATING',
    notes: 'Final Gold Medal Match (GER vs AUT)'
  },
  {
    id: 'asg-02',
    tournamentId: 'tour-1',
    rinkId: 'rink-1',
    rinkName: 'Rink 1 - Center Ice Stadium',
    matchId: 'm-live-01',
    matchNumber: 'M-WIC-FIN-01',
    refereeId: 'ref-04',
    refereeName: 'Elisabeth Hofer',
    refereeRole: 'ASSISTANT_UMPIRE',
    shiftStartTime: '17:00',
    shiftEndTime: '19:00',
    status: 'CHECKED_IN',
    notes: 'Turn timer and stock placement verifier'
  },
  {
    id: 'asg-03',
    tournamentId: 'tour-1',
    rinkId: 'rink-2',
    rinkName: 'Rink 2 - Duel Ice Arena',
    matchId: 'm-live-h2h',
    matchNumber: 'M-WIC-H2H-01',
    refereeId: 'ref-05',
    refereeName: 'Rajesh Patil',
    refereeRole: 'CHIEF_REFEREE',
    shiftStartTime: '18:00',
    shiftEndTime: '19:30',
    status: 'OFFICIATING',
    notes: 'H2H Duel (Stefan Zellermayer vs Martin Caspar)'
  },
  {
    id: 'asg-04',
    tournamentId: 'tour-1',
    rinkId: 'rink-3',
    rinkName: 'Rink 3 - Target Arena',
    matchId: 'm-live-02',
    matchNumber: 'M-WIC-TGT-04',
    refereeId: 'ref-02',
    refereeName: 'Marco Vettori',
    refereeRole: 'CHIEF_REFEREE',
    shiftStartTime: '17:30',
    shiftEndTime: '19:00',
    status: 'OFFICIATING',
    notes: 'Individual Target Final (Stefan Zellermayer vs Simone Steiner)'
  },
  {
    id: 'asg-05',
    tournamentId: 'tour-1',
    rinkId: 'rink-4',
    rinkName: 'Rink 4 - Distance Track Alfa',
    matchId: 'm-live-tdst',
    matchNumber: 'M-WIC-TDST-01',
    refereeId: 'ref-03',
    refereeName: 'Karl Hinteregger',
    refereeRole: 'LASER_MEASURER',
    shiftStartTime: '14:30',
    shiftEndTime: '16:30',
    status: 'OFFICIATING',
    notes: 'Team Distance Final (Italy vs India)'
  },
  {
    id: 'asg-06',
    tournamentId: 'tour-1',
    rinkId: 'rink-5',
    rinkName: 'Rink 5 - North Competitor Lane',
    refereeId: 'ref-06',
    refereeName: 'Thomas Lindner',
    refereeRole: 'CHIEF_REFEREE',
    shiftStartTime: '19:00',
    shiftEndTime: '21:00',
    status: 'CONFIRMED',
    notes: 'Scheduled for Evening Semi-Finals'
  }
];

