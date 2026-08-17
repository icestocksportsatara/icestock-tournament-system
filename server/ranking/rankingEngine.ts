import { db } from '../db/database.js';
import { RankingEntry, Discipline, GenderCategory } from '../../src/types/index.js';

export class RankingEngine {
  /**
   * Recalculates ranking points from all verified completed matches
   */
  public recalculateRankings(discipline: Discipline = 'INDIVIDUAL_TARGET', category: GenderCategory = 'MEN'): RankingEntry[] {
    const playerScores: Map<string, { points: number; gold: number; silver: number; bronze: number; played: number; won: number }> = new Map();

    // Aggregate from verified tournament matches
    for (const match of db.matches.values()) {
      if (match.status === 'LOCKED_VERIFIED' && match.discipline === discipline) {
        if (match.player1Id) {
          const stats = playerScores.get(match.player1Id) || { points: 0, gold: 0, silver: 0, bronze: 0, played: 0, won: 0 };
          stats.played += 1;
          if (match.winnerId === match.player1Id) {
            stats.won += 1;
            stats.points += 100;
          } else {
            stats.points += 40;
          }
          playerScores.set(match.player1Id, stats);
        }
        if (match.player2Id) {
          const stats = playerScores.get(match.player2Id) || { points: 0, gold: 0, silver: 0, bronze: 0, played: 0, won: 0 };
          stats.played += 1;
          if (match.winnerId === match.player2Id) {
            stats.won += 1;
            stats.points += 100;
          } else {
            stats.points += 40;
          }
          playerScores.set(match.player2Id, stats);
        }
      }
    }

    const rankingList: RankingEntry[] = [];

    // Map all players to ranking entries
    for (const player of db.players.values()) {
      if (player.gender === category) {
        const stats = playerScores.get(player.id) || { points: 0, gold: 0, silver: 0, bronze: 0, played: 0, won: 0 };
        const totalPoints = player.rankingPoints + stats.points;
        const totalPlayed = player.stats.matchesPlayed + stats.played;
        const totalWon = player.stats.matchesWon + stats.won;
        const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

        rankingList.push({
          rank: 0,
          prevRank: player.worldRank || 1,
          id: player.id,
          name: player.name,
          country: player.country,
          countryCode: player.countryCode,
          flag: player.flag,
          points: totalPoints,
          tournamentsPlayed: totalPlayed,
          gold: player.stats.goldMedals + stats.gold,
          silver: player.stats.silverMedals + stats.silver,
          bronze: player.stats.bronzeMedals + stats.bronze,
          winRate,
          category,
          discipline
        });
      }
    }

    // Sort descending by points
    rankingList.sort((a, b) => b.points - a.points);

    // Assign final rank numbers
    rankingList.forEach((entry, idx) => {
      entry.rank = idx + 1;
      const player = db.players.get(entry.id);
      if (player) {
        player.worldRank = entry.rank;
        db.players.set(player.id, player);
      }
    });

    return rankingList;
  }
}

export const rankingEngine = new RankingEngine();
