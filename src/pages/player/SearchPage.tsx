import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trophy, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Avatar, TournamentStatusBadge } from '../../components/ui/index'
import { Card } from '../../components/ui/Card'
import type { Profile, Tournament } from '../../types'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState<Profile[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setPlayers([]); setTournaments([]); return }

    const timer = setTimeout(async () => {
      setSearching(true)
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${q}%,display_name.ilike.%${q}%,efootball_uid.ilike.%${q}%`)
          .limit(10),
        supabase
          .from('tournaments')
          .select('*')
          .ilike('name', `%${q}%`)
          .limit(10),
      ])
      setPlayers(p ?? [])
      setTournaments(t ?? [])
      setSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const hasResults = players.length > 0 || tournaments.length > 0

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-slate-500 text-sm mt-1">Find players and tournaments</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, username, or eFootball UID..."
          className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
        )}
      </div>

      {query.length > 0 && query.length < 2 && (
        <p className="text-slate-500 text-sm text-center">Type at least 2 characters to search</p>
      )}

      {query.length >= 2 && !searching && !hasResults && (
        <p className="text-slate-500 text-sm text-center py-8">No results found for "{query}"</p>
      )}

      {/* Players */}
      {players.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> Players
          </h2>
          <div className="space-y-2">
            {players.map((p) => (
              <Link key={p.id} to={`/players/${p.username}`}>
                <Card padding="sm" className="hover:border-emerald-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar src={p.avatar_url} name={p.display_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{p.display_name}</p>
                      <p className="text-xs text-slate-500">
                        @{p.username}
                        {p.efootball_uid ? ` • UID: ${p.efootball_uid}` : ''}
                        {' • '}{p.country}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 flex-shrink-0">{p.total_wins}W / {p.total_losses}L</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tournaments */}
      {tournaments.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Tournaments
          </h2>
          <div className="space-y-2">
            {tournaments.map((t) => (
              <Link key={t.id} to={`/tournaments/${t.id}`}>
                <Card padding="sm" className="hover:border-emerald-500/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.current_players}/{t.max_players} players</p>
                    </div>
                    <TournamentStatusBadge status={t.status} />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
