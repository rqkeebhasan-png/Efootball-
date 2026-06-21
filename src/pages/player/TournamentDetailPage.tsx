import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Users, Calendar, Clock, Trophy, Info, Swords } from 'lucide-react'
import { useTournament, joinTournament } from '../../hooks/useTournament'
import { useMatches } from '../../hooks/useMatch'
import { useAuthStore } from '../../store/authStore'
import { BracketView } from '../../components/tournament/BracketView'
import { TournamentStatusBadge, PageLoader, Avatar } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { formatDate, formatDateTime, isDeadlinePassed } from '../../utils/format'
import { getTotalRounds } from '../../utils/bracket'

const TABS = ['Overview', 'Bracket', 'Players'] as const
type Tab = typeof TABS[number]

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const { tournament, registrations, loading } = useTournament(id!)
  const { matches, loading: matchLoading, refetch: refetchMatches } = useMatches(id!)
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [joining, setJoining] = useState(false)

  if (loading) return <PageLoader />
  if (!tournament) return <div className="text-center text-slate-400 py-16">Tournament not found</div>

  const isRegistered = registrations.some((r) => r.player_id === user?.id)
  const canJoin =
    !isRegistered &&
    tournament.status === 'registration_open' &&
    !isDeadlinePassed(tournament.registration_deadline) &&
    tournament.current_players < tournament.max_players

  const handleJoin = async () => {
    if (!user) return
    setJoining(true)
    await joinTournament(tournament.id, user.id)
    setJoining(false)
  }

  const totalRounds = getTotalRounds(tournament.max_players)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-pitch-800 border border-slate-700">
        {tournament.banner_url ? (
          <div className="relative h-48 sm:h-64">
            <img src={tournament.banner_url} alt={tournament.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-pitch-950 via-pitch-950/50 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-emerald-900/20 to-pitch-800 flex items-center justify-center">
            <Trophy className="w-16 h-16 text-slate-700" />
          </div>
        )}

        <div className="px-6 pb-6 -mt-2 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <TournamentStatusBadge status={tournament.status} />
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">{tournament.name}</h1>
              {tournament.prize_info && (
                <p className="text-gold-400 font-medium mt-1">🏆 {tournament.prize_info}</p>
              )}
            </div>
            <div className="flex gap-3">
              {canJoin && (
                <Button variant="primary" size="lg" loading={joining} onClick={handleJoin}>
                  Join Tournament
                </Button>
              )}
              {isRegistered && (
                <div className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-semibold">
                  ✓ Registered
                </div>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              {tournament.current_players}/{tournament.max_players} players
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Starts {formatDate(tournament.start_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gold-400" />
              Reg. deadline: {formatDateTime(tournament.registration_deadline)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-emerald-gradient text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {tournament.description && (
              <Card>
                <CardTitle className="mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400" /> About
                </CardTitle>
                <p className="text-slate-400 text-sm leading-relaxed">{tournament.description}</p>
              </Card>
            )}
            {tournament.rules && (
              <Card>
                <CardTitle className="mb-3">Rules</CardTitle>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{tournament.rules}</p>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardTitle className="mb-4">Tournament Info</CardTitle>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Format</dt>
                  <dd className="text-white font-medium">Single Elimination</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Max Players</dt>
                  <dd className="text-white font-medium">{tournament.max_players}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Registered</dt>
                  <dd className="text-white font-medium">{tournament.current_players}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Rounds</dt>
                  <dd className="text-white font-medium">{totalRounds}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Result Window</dt>
                  <dd className="text-white font-medium">1 hour</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'Bracket' && (
        <Card padding="md">
          <CardTitle className="mb-6 flex items-center gap-2">
            <Swords className="w-5 h-5 text-emerald-400" /> Tournament Bracket
          </CardTitle>
          {matchLoading ? (
            <PageLoader />
          ) : matches.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Bracket will be generated when the tournament starts
            </div>
          ) : (
            <BracketView matches={matches} totalRounds={totalRounds} />
          )}
        </Card>
      )}

      {activeTab === 'Players' && (
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Registered Players ({registrations.length})
          </CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {registrations.map((reg) => (
              <div key={reg.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <Avatar src={reg.profile?.avatar_url} name={reg.profile?.display_name ?? 'Player'} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{reg.profile?.display_name}</p>
                  {reg.profile?.efootball_uid && (
                    <p className="text-xs text-slate-500">UID: {reg.profile.efootball_uid}</p>
                  )}
                </div>
                <span className="ml-auto text-xs text-slate-600">{reg.profile?.country}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
