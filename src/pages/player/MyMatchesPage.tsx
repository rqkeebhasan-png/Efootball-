import { useState } from 'react'
import { Swords } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { usePlayerMatches } from '../../hooks/useMatch'
import { MatchCard } from '../../components/match/MatchCard'
import { PageLoader, EmptyState } from '../../components/ui/index'
import type { MatchStatus } from '../../types'

const FILTERS: { label: string; value: MatchStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'awaiting_results' },
  { label: 'Completed', value: 'completed' },
  { label: 'Under Review', value: 'referee_review' },
]

export function MyMatchesPage() {
  const { user } = useAuthStore()
  const { matches, loading } = usePlayerMatches(user?.id)
  const [filter, setFilter] = useState<MatchStatus | 'all'>('all')

  const filtered = filter === 'all' ? matches : matches.filter((m) => m.status === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">My Matches</h1>
        <p className="text-slate-500 text-sm mt-1">All your tournament matches</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-emerald-gradient text-white shadow-glow-emerald'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Swords className="w-10 h-10" />}
          title="No matches found"
          description="Matches will appear here once your tournament starts"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  )
}
