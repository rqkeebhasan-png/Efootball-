import { useParams, Link } from 'react-router-dom'
import { Edit, Users, Swords, ArrowLeft } from 'lucide-react'
import { useTournament } from '../../hooks/useTournament'
import { useMatches } from '../../hooks/useMatch'
import { BracketView } from '../../components/tournament/BracketView'
import { TournamentStatusBadge, PageLoader, Avatar } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { MatchCard } from '../../components/match/MatchCard'
import { formatDateTime } from '../../utils/format'
import { getTotalRounds } from '../../utils/bracket'
import { useState } from 'react'

const TABS = ['Bracket', 'Matches', 'Players'] as const
type Tab = typeof TABS[number]

export function AdminTournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { tournament, registrations, loading } = useTournament(id!)
  const { matches, loading: matchLoading, refetch } = useMatches(id!)
  const [activeTab, setActiveTab] = useState<Tab>('Bracket')

  if (loading) return <PageLoader />
  if (!tournament) return <div className="text-center text-slate-400 py-16">Tournament not found</div>

  const totalRounds = getTotalRounds(tournament.max_players)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/tournaments" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
              <TournamentStatusBadge status={tournament.status} />
            </div>
            <p className="text-slate-500 text-sm mt-1">
              {tournament.current_players}/{tournament.max_players} players •
              Starts {formatDateTime(tournament.start_date)}
            </p>
          </div>
        </div>
        <Link to={`/admin/tournaments/${id}/edit`}>
          <Button variant="secondary" className="flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-emerald-gradient text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Bracket' && (
        <Card>
          <CardTitle className="mb-6 flex items-center gap-2">
            <Swords className="w-5 h-5 text-emerald-400" /> Bracket
          </CardTitle>
          {matchLoading ? <PageLoader /> : matches.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No bracket generated yet. Start the tournament to generate.</p>
          ) : (
            <BracketView matches={matches} totalRounds={totalRounds} />
          )}
        </Card>
      )}

      {activeTab === 'Matches' && (
        <div className="space-y-3">
          {matchLoading ? <PageLoader /> : matches.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No matches yet.</p>
          ) : (
            matches.map((m) => <MatchCard key={m.id} match={m} onUpdate={refetch} />)
          )}
        </div>
      )}

      {activeTab === 'Players' && (
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Players ({registrations.length})
          </CardTitle>
          <div className="space-y-2">
            {registrations.map((reg, i) => (
              <div key={reg.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <span className="text-xs text-slate-600 w-6 text-right">{i + 1}</span>
                <Avatar src={reg.profile?.avatar_url} name={reg.profile?.display_name ?? 'Player'} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{reg.profile?.display_name}</p>
                  <p className="text-xs text-slate-500">@{reg.profile?.username} {reg.profile?.efootball_uid ? `• UID: ${reg.profile.efootball_uid}` : ''}</p>
                </div>
                <span className="text-xs text-slate-600">{reg.profile?.country}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
