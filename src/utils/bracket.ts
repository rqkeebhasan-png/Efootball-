import type { Match } from '../types'

export function generateBracketMatches(
  tournamentId: string,
  bracketId: string,
  playerIds: string[]
): Omit<Match, 'id' | 'created_at' | 'updated_at' | 'player_a' | 'player_b' | 'winner'>[] {
  const count = playerIds.length
  const validCounts = [8, 16, 32, 64]
  if (!validCounts.includes(count)) throw new Error('Invalid player count')

  const totalRounds = Math.log2(count)
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5)
  const matches: Omit<Match, 'id' | 'created_at' | 'updated_at' | 'player_a' | 'player_b' | 'winner'>[] = []

  // Round 1: seed all players
  const round1MatchCount = count / 2
  for (let i = 0; i < round1MatchCount; i++) {
    matches.push({
      tournament_id: tournamentId,
      bracket_id: bracketId,
      round_number: 1,
      match_number: i + 1,
      player_a_id: shuffled[i * 2],
      player_b_id: shuffled[i * 2 + 1],
      winner_id: null,
      status: 'pending',
      next_match_id: null,
      result_deadline: null,
    })
  }

  // Subsequent rounds: empty slots filled by winners
  let matchCounter = round1MatchCount + 1
  for (let round = 2; round <= totalRounds; round++) {
    const roundMatchCount = count / Math.pow(2, round)
    for (let i = 0; i < roundMatchCount; i++) {
      matches.push({
        tournament_id: tournamentId,
        bracket_id: bracketId,
        round_number: round,
        match_number: matchCounter,
        player_a_id: null,
        player_b_id: null,
        winner_id: null,
        status: 'pending',
        next_match_id: null,
        result_deadline: null,
      })
      matchCounter++
    }
  }

  return matches
}

export function getTotalRounds(playerCount: number): number {
  return Math.log2(playerCount)
}

export function getRoundName(round: number, totalRounds: number): string {
  const diff = totalRounds - round
  if (diff === 0) return 'Final'
  if (diff === 1) return 'Semi-Final'
  if (diff === 2) return 'Quarter-Final'
  return `Round ${round}`
}
