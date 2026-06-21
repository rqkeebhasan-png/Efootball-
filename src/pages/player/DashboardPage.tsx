import { Link } from 'react-router-dom'
import { Trophy, Swords, Clock, History, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useMyRegistrations } from '../../hooks/useTournament'
import { usePlayerMatches } from '../../hooks/useMatch'
import { StatCard, PageLoader, EmptyState } from '../../components/ui/index'
import { MatchCard } from '../../components/match/MatchCard'
import { TournamentCard } from '../../components/tournament/TournamentCard'
import { formatWinRate } from '../../utils/format'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { registrations, loading: regLoading } = useMyRegistrations(user?.id)
  const { matches, loading: matchLoading } = usePlayerMatches(user?.id)

  const pendingMatches = matches.filter(
    (m) => m.status === 'awaiting_results' || m.status === 'pending'
  )
  const recentMatches = matches.filter((m) => m.status === 'completed').slice(0, 5)
  const activeTournaments = registrations.filter(
    (r) => (r as any).tournament?.status === 'live' || (r as any).tournament?.status === 'registration_open'
  )

  if (!user) return null

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-emerald-400">{user.display_name}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your tournament overview</p>
        </div>
        <Link to="/tournaments">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-gradient rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <Trophy className="w-4 h-4" />
            Browse Tournaments
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Matches" value={user.total_matches} icon={<Swords className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Wins" value={user.total_wins} icon={<Trophy className="w-5 h-5" />} accent="gold" />
        <StatCard label="Losses" value={user.total_losses} icon={<History className="w-5 h-5" />} accent="slate" />
        <StatCard label="Win Rate" value={formatWinRate(user.total_wins, user.total_matches)} icon={<Clock className="w-5 h-5" />} accent="emerald" />
      </div>

      {/* Pending matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-400" />
            Pending Matches
            {pendingMatches.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-gold-500/15 text-gold-400 rounded-full">{pendingMatches.length}</span>
            )}
          </h2>
          <Link to="/matches" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {matchLoading ? (
          <PageLoader />
        ) : pendingMatches.length === 0 ? (
          <EmptyState icon={<Swords className="w-10 h-10" />} title="No pending matches" description="You're all caught up!" />
        ) : (
          <div className="space-y-3">
            {pendingMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      {/* Active Tournaments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            My Tournaments
          </h2>
          <Link to="/tournaments" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Browse all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {regLoading ? (
          <PageLoader />
        ) : activeTournaments.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-10 h-10" />}
            title="No active tournaments"
            description="Join a tournament to get started"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTournaments.map((reg) => (
              <TournamentCard
                key={reg.id}
                tournament={(reg as any).tournament}
                isRegistered
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent match history */}
      {recentMatches.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-slate-400" />
            Recent Results
          </h2>
          <div className="space-y-3">
            {recentMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
