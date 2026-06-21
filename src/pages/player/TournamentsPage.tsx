import { useState } from 'react'
import { Search, Trophy } from 'lucide-react'
import { useTournaments } from '../../hooks/useTournament'
import { useMyRegistrations } from '../../hooks/useTournament'
import { useAuthStore } from '../../store/authStore'
import { TournamentCard } from '../../components/tournament/TournamentCard'
import { Input } from '../../components/ui/Input'
import { PageLoader, EmptyState } from '../../components/ui/index'
import type { TournamentStatus } from '../../types'

const STATUS_FILTERS: { label: string; value: TournamentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'registration_open' },
  { label: 'Live', value: 'live' },
  { label: 'Completed', value: 'completed' },
]

export function TournamentsPage() {
  const { user } = useAuthStore()
  const { tournaments, loading } = useTournaments()
  const { registrations } = useMyRegistrations(user?.id)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | 'all'>('all')

  const registeredIds = new Set(registrations.map((r) => r.tournament_id))

  const filtered = tournaments.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Tournaments</h1>
        <p className="text-slate-500 text-sm mt-1">Find and join active tournaments</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === f.value
                  ? 'bg-emerald-gradient text-white shadow-glow-emerald'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-10 h-10" />}
          title="No tournaments found"
          description={search ? 'Try a different search term' : 'No tournaments available yet'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              isRegistered={registeredIds.has(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
