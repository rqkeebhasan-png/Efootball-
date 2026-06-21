import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getResultDeadline } from '../utils/format'
import type { Match, MatchSubmission, RefereeReview } from '../types'
import toast from 'react-hot-toast'

export function useMatches(tournamentId: string) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMatches = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('matches')
      .select('*, player_a:profiles!matches_player_a_id_fkey(*), player_b:profiles!matches_player_b_id_fkey(*), winner:profiles!matches_winner_id_fkey(*)')
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true })
    setMatches(data ?? [])
    setLoading(false)
  }

  useEffect(() => { if (tournamentId) fetchMatches() }, [tournamentId])

  return { matches, loading, refetch: fetchMatches }
}

export function usePlayerMatches(playerId: string | undefined) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId) { setLoading(false); return }
    const fetch = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*, player_a:profiles!matches_player_a_id_fkey(*), player_b:profiles!matches_player_b_id_fkey(*), winner:profiles!matches_winner_id_fkey(*)')
        .or(`player_a_id.eq.${playerId},player_b_id.eq.${playerId}`)
        .order('created_at', { ascending: false })
      setMatches(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [playerId])

  return { matches, loading }
}

export function useMatchSubmissions(matchId: string) {
  const [submissions, setSubmissions] = useState<MatchSubmission[]>([])
  const [review, setReview] = useState<RefereeReview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return
    const fetch = async () => {
      const [{ data: subs }, { data: rev }] = await Promise.all([
        supabase
          .from('match_submissions')
          .select('*, submitter:profiles!match_submissions_submitted_by_fkey(*), claimed_winner:profiles!match_submissions_claimed_winner_id_fkey(*)')
          .eq('match_id', matchId),
        supabase
          .from('referee_reviews')
          .select('*, reviewer:profiles(*)')
          .eq('match_id', matchId)
          .maybeSingle(),
      ])
      setSubmissions(subs ?? [])
      setReview(rev ?? null)
      setLoading(false)
    }
    fetch()
  }, [matchId])

  return { submissions, review, loading }
}

export async function submitMatchResult(
  matchId: string,
  submittedBy: string,
  claimedWinnerId: string,
  screenshotFile: File
): Promise<boolean> {
  // Upload screenshot
  const ext = screenshotFile.name.split('.').pop()
  const path = `${matchId}/${submittedBy}-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('match-screenshots')
    .upload(path, screenshotFile, { upsert: false })

  if (uploadError) { toast.error('Failed to upload screenshot'); return false }

  const { data: { publicUrl } } = supabase.storage.from('match-screenshots').getPublicUrl(path)

  // Insert submission
  const { error: subError } = await supabase
    .from('match_submissions')
    .insert({
      match_id: matchId,
      submitted_by: submittedBy,
      claimed_winner_id: claimedWinnerId,
      screenshot_url: publicUrl,
    })

  if (subError) {
    if (subError.code === '23505') { toast.error('You already submitted for this match') }
    else { toast.error('Failed to submit result') }
    return false
  }

  // Check if both players submitted
  await processMatchSubmissions(matchId)
  toast.success('Result submitted!')
  return true
}

async function processMatchSubmissions(matchId: string) {
  const { data: match } = await supabase
    .from('matches')
    .select('player_a_id, player_b_id')
    .eq('id', matchId)
    .single()
  if (!match) return

  const { data: submissions } = await supabase
    .from('match_submissions')
    .select('submitted_by, claimed_winner_id')
    .eq('match_id', matchId)

  if (!submissions || submissions.length < 2) return

  const subA = submissions.find((s) => s.submitted_by === match.player_a_id)
  const subB = submissions.find((s) => s.submitted_by === match.player_b_id)
  if (!subA || !subB) return

  if (subA.claimed_winner_id === subB.claimed_winner_id) {
    // Auto-confirm
    await confirmMatchWinner(matchId, subA.claimed_winner_id)
  } else {
    // Dispute → referee review
    await supabase.from('matches').update({ status: 'referee_review' }).eq('id', matchId)
    await supabase.from('referee_reviews').upsert({ match_id: matchId, decision: 'pending' })

    // Notify both players
    for (const pid of [match.player_a_id, match.player_b_id]) {
      if (pid) {
        await supabase.from('notifications').insert({
          user_id: pid,
          type: 'dispute_raised',
          title: 'Match Disputed',
          message: 'Your match result is under referee review due to conflicting submissions.',
          related_match_id: matchId,
        })
      }
    }
  }
}

export async function confirmMatchWinner(matchId: string, winnerId: string) {
  const { data: match } = await supabase
    .from('matches')
    .select('tournament_id, next_match_id, round_number, match_number, player_a_id, player_b_id')
    .eq('id', matchId)
    .single()
  if (!match) return

  await supabase
    .from('matches')
    .update({ status: 'completed', winner_id: winnerId })
    .eq('id', matchId)

  // Notify players
  const loserId = match.player_a_id === winnerId ? match.player_b_id : match.player_a_id
  await supabase.from('notifications').insert([
    { user_id: winnerId, type: 'result_approved', title: 'Match Won!', message: 'Your match result has been confirmed. You advance to the next round.', related_match_id: matchId },
    ...(loserId ? [{ user_id: loserId, type: 'result_rejected' as const, title: 'Match Result Confirmed', message: 'Your match result has been confirmed. Better luck next time!', related_match_id: matchId }] : []),
  ])

  // Advance winner to next round
  if (match.next_match_id) {
    const { data: nextMatch } = await supabase
      .from('matches')
      .select('player_a_id, player_b_id')
      .eq('id', match.next_match_id)
      .single()

    if (nextMatch) {
      const slot = nextMatch.player_a_id === null ? 'player_a_id' : 'player_b_id'
      await supabase
        .from('matches')
        .update({ [slot]: winnerId, status: nextMatch.player_a_id !== null || nextMatch.player_b_id !== null ? 'awaiting_results' : 'pending' })
        .eq('id', match.next_match_id)
    }
  }
}

export async function checkDefaultWins(tournamentId: string) {
  const { data: matches } = await supabase
    .from('matches')
    .select('id, player_a_id, player_b_id, result_deadline')
    .eq('tournament_id', tournamentId)
    .eq('status', 'awaiting_results')

  if (!matches) return

  for (const match of matches) {
    if (!match.result_deadline || new Date(match.result_deadline) > new Date()) continue

    const { data: submissions } = await supabase
      .from('match_submissions')
      .select('submitted_by, claimed_winner_id')
      .eq('match_id', match.id)

    if (submissions && submissions.length === 1) {
      const sub = submissions[0]
      await confirmMatchWinner(match.id, sub.claimed_winner_id)
      await supabase.from('notifications').insert({
        user_id: sub.claimed_winner_id,
        type: 'default_win',
        title: 'Default Win',
        message: 'You won by default — opponent did not submit results in time.',
        related_match_id: match.id,
      })
    }
  }
}
