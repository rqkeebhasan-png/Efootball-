import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Play, Trophy } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useTournaments } from '../../hooks/useTournament'
import { TournamentStatusBadge, PageLoader, EmptyState } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatDate } from '../../utils/format'
import { generateBracketMatches, getTotalRounds } from '../../utils/bracket'
import toast from 'react-hot-toast'
import type { Tournament } from '../../types'

export function AdminTournamentsPage() {
  const { tournaments, loading, refetch } = useTournaments()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleDelete = async (t: Tournament) => {
    if (!confirm(`Delete "${t.name}"? This cannot be undone.`)) return
    setActionLoading(t.id)
    const { error } = await supabase.from('tournaments').delete().eq('id', t.id)
    if (error) toast.error(error.message)
    else { toast.success('Tournament deleted'); refetch() }
    setActionLoading(null)
  }

  const handleStartTournament = async (t: Tournament) => {
    if (!confirm(`Start "${t.name}"? This will generate the bracket and lock registrations.`)) return
    setActionLoading(t.id)

    // Fetch registered players
    const { data: regs } = await supabase
      .from('tournament_registrations')
      .select('player_id, id')
      .eq('tournament_id', t.id)

    if (!regs || regs.length < 2) {
      toast.error('Need at least 2 players to start')
      setActionLoading(null)
      return
    }

    const validCounts = [8, 16, 32, 64]
    if (!validCounts.includes(regs.length) && !validCounts.includes(t.max_players)) {
      toast.error(`Need exactly ${t.max_players} players to start`)
      setActionLoading(null)
      return
    }

    const totalRounds = getTotalRounds(t.max_players)

    // Create bracket
    const { data: bracket, error: bracketError } = await supabase
      .from('brackets')
      .insert({ tournament_id: t.id, total_rounds: totalRounds })
      .select()
      .single()

    if (bracketError || !bracket) {
      toast.error('Failed to create bracket')
      setActionLoading(null)
      return
    }

    // Assign seed numbers
    const playerIds = regs.map((r) => r.player_id)
    const matchData = generateBracketMatches(t.id, bracket.id, playerIds)

    const { error: matchError } = await supabase.from('matches').insert(matchData)
    if (matchError) { toast.error('Failed to generate matches'); setActionLoading(null); return }

    // Update round 1 matches to awaiting_results and set deadlines
    const { data: round1 } = await supabase
      .from('matches')
      .select('id')
      .eq('bracket_id', bracket.id)
      .eq('round_number', 1)

    if (round1) {
      const deadline = new Date(Date.now() + 60 * 60 * 1000).toISOString()
      await supabase
        .from('matches')
        .update({ status: 'awaiting_results', result_deadline: deadline })
        .in('id', round1.map((m) => m.id))
    }

    // Update tournament status
    await supabase.from('tournaments').update({ status: 'live' }).eq('id', t.id)

    // Notify all players
    const notifications = regs.map((r) => ({
      user_id: r.player_id,
      type: 'tournament_started' as const,
      title: 'Tournament Started!',
      message: `${t.name} has started. Check your match assignment.`,
      related_tournament_id: t.id,
    }))
    await supabase.from('notifications').insert(notifications)

    toast.success('Tournament started and bracket generated!')
    refetch()
    setActionLoading(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage tournaments</p>
        </div>
        <Link to="/admin/tournaments/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Tournament
          </Button>
        </Link>
      </div>

      {loading ? (
        <PageLoader />
      ) : tournaments.length === 0 ? (
        <EmptyState icon={<Trophy className="w-10 h-10" />} title="No tournaments" description="Create your first tournament" />
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => (
            <Card key={t.id} padding="sm">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-white truncate">{t.name}</h3>
                    <TournamentStatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {t.current_players}/{t.max_players} players • Starts {formatDate(t.start_date)} • Reg. closes {formatDate(t.registration_deadline)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {t.status === 'registration_open' || t.status === 'registration_closed' ? (
                    <Button
                      size="sm"
                      variant="gold"
                      loading={actionLoading === t.id}
                      onClick={() => handleStartTournament(t)}
                      className="flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" /> Start
                    </Button>
                  ) : null}

                  <Link to={`/admin/tournaments/${t.id}`}>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to={`/admin/tournaments/${t.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={actionLoading === t.id}
                    onClick={() => handleDelete(t)}
                    className="text-crimson-400 hover:text-crimson-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
