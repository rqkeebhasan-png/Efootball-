import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Tournament, TournamentRegistration } from '../types'
import toast from 'react-hot-toast'

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTournaments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setTournaments(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchTournaments() }, [])

  return { tournaments, loading, refetch: fetchTournaments }
}

export function useTournament(id: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      setLoading(true)
      const [{ data: t }, { data: r }] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', id).single(),
        supabase
          .from('tournament_registrations')
          .select('*, profile:profiles(*)')
          .eq('tournament_id', id)
          .order('registered_at', { ascending: true }),
      ])
      setTournament(t ?? null)
      setRegistrations(r ?? [])
      setLoading(false)
    }
    fetch()
  }, [id])

  return { tournament, registrations, loading }
}

export function useMyRegistrations(playerId: string | undefined) {
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId) { setLoading(false); return }
    const fetch = async () => {
      const { data } = await supabase
        .from('tournament_registrations')
        .select('*, tournament:tournaments(*)')
        .eq('player_id', playerId)
        .order('registered_at', { ascending: false })
      setRegistrations(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [playerId])

  return { registrations, loading }
}

export async function joinTournament(tournamentId: string, playerId: string): Promise<boolean> {
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('status, current_players, max_players, registration_deadline')
    .eq('id', tournamentId)
    .single()

  if (!tournament) { toast.error('Tournament not found'); return false }
  if (tournament.status !== 'registration_open') { toast.error('Registration is closed'); return false }
  if (new Date(tournament.registration_deadline) < new Date()) { toast.error('Registration deadline passed'); return false }
  if (tournament.current_players >= tournament.max_players) { toast.error('Tournament is full'); return false }

  const { error } = await supabase
    .from('tournament_registrations')
    .insert({ tournament_id: tournamentId, player_id: playerId })

  if (error) {
    if (error.code === '23505') { toast.error('Already registered'); } 
    else { toast.error('Failed to join tournament') }
    return false
  }

  await supabase.from('notifications').insert({
    user_id: playerId,
    type: 'tournament_accepted',
    title: 'Tournament Joined',
    message: 'You have successfully joined the tournament.',
    related_tournament_id: tournamentId,
  })

  toast.success('Successfully joined tournament!')
  return true
}
