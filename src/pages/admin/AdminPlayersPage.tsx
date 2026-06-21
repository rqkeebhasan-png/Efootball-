import { useEffect, useState } from 'react'
import { Search, Shield, ShieldOff, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Avatar, PageLoader, EmptyState } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { formatDate, formatWinRate } from '../../utils/format'
import type { Profile } from '../../types'
import toast from 'react-hot-toast'

export function AdminPlayersPage() {
  const [players, setPlayers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPlayers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setPlayers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPlayers() }, [])

  const handleSuspend = async (player: Profile) => {
    const action = player.is_suspended ? 'unsuspend' : 'suspend'
    if (!confirm(`${action === 'suspend' ? 'Suspend' : 'Unsuspend'} ${player.display_name}?`)) return
    setActionLoading(player.id)
    const { error } = await supabase
      .from('profiles')
      .update({ is_suspended: !player.is_suspended })
      .eq('id', player.id)
    if (error) toast.error(error.message)
    else { toast.success(`Player ${action}ed`); fetchPlayers() }
    setActionLoading(null)
  }

  const handleMakeAdmin = async (player: Profile) => {
    if (!confirm(`Make ${player.display_name} an admin? This grants full access.`)) return
    setActionLoading(player.id)
    const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', player.id)
    if (error) toast.error(error.message)
    else { toast.success('Player promoted to admin'); fetchPlayers() }
    setActionLoading(null)
  }

  const filtered = players.filter(
    (p) =>
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.efootball_uid ?? '').includes(search)
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Players</h1>
        <p className="text-slate-500 text-sm mt-1">Manage registered players</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, username or eFootball UID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users className="w-10 h-10" />} title="No players found" />
      ) : (
        <div className="space-y-2">
          {filtered.map((player) => (
            <Card key={player.id} padding="sm">
              <div className="flex items-center gap-4">
                <Avatar src={player.avatar_url} name={player.display_name} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white truncate">{player.display_name}</p>
                    {player.role === 'admin' && (
                      <span className="px-1.5 py-0.5 text-xs bg-gold-500/15 text-gold-400 rounded font-semibold">Admin</span>
                    )}
                    {player.is_suspended && (
                      <span className="px-1.5 py-0.5 text-xs bg-crimson-500/15 text-crimson-400 rounded font-semibold">Suspended</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    @{player.username}
                    {player.efootball_uid ? ` • UID: ${player.efootball_uid}` : ''}
                    {' • '}{player.country}
                    {' • '}Joined {formatDate(player.created_at)}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {player.total_matches} matches • {player.total_wins}W {player.total_losses}L • {formatWinRate(player.total_wins, player.total_matches)} win rate
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {player.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant={player.is_suspended ? 'secondary' : 'danger'}
                      loading={actionLoading === player.id}
                      onClick={() => handleSuspend(player)}
                      className="flex items-center gap-1.5"
                    >
                      {player.is_suspended ? (
                        <><ShieldOff className="w-3.5 h-3.5" /> Unsuspend</>
                      ) : (
                        <><Shield className="w-3.5 h-3.5" /> Suspend</>
                      )}
                    </Button>
                  )}
                  {player.role === 'player' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={actionLoading === player.id}
                      onClick={() => handleMakeAdmin(player)}
                      className="text-gold-400 hover:text-gold-300 text-xs"
                    >
                      Make Admin
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
