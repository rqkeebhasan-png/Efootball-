import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Users, Swords, AlertCircle, ChevronRight, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { StatCard, PageLoader } from '../../components/ui/index'
import { Card, CardTitle } from '../../components/ui/Card'
import { TournamentStatusBadge } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../utils/format'
import type { Tournament } from '../../types'

interface AdminStats {
  totalUsers: number
  activeTournaments: number
  completedTournaments: number
  pendingReviews: number
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeTournaments: 0, completedTournaments: 0, pendingReviews: 0 })
  const [recentTournaments, setRecentTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [
        { count: users },
        { count: active },
        { count: completed },
        { count: reviews },
        { data: tournaments },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'player'),
        supabase.from('tournaments').select('*', { count: 'exact', head: true }).in('status', ['live', 'registration_open']),
        supabase.from('tournaments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('referee_reviews').select('*', { count: 'exact', head: true }).eq('decision', 'pending'),
        supabase.from('tournaments').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        totalUsers: users ?? 0,
        activeTournaments: active ?? 0,
        completedTournaments: completed ?? 0,
        pendingReviews: reviews ?? 0,
      })
      setRecentTournaments(tournaments ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Platform overview and management</p>
        </div>
        <Link to="/admin/tournaments/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Tournament
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Players" value={stats.totalUsers} icon={<Users className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Active Tournaments" value={stats.activeTournaments} icon={<Trophy className="w-5 h-5" />} accent="gold" />
        <StatCard label="Completed" value={stats.completedTournaments} icon={<Trophy className="w-5 h-5" />} accent="slate" />
        <StatCard label="Pending Reviews" value={stats.pendingReviews} icon={<AlertCircle className="w-5 h-5" />} accent="crimson" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/tournaments', label: 'Manage Tournaments', icon: <Trophy className="w-5 h-5" />, accent: 'emerald' },
          { to: '/admin/players', label: 'Manage Players', icon: <Users className="w-5 h-5" />, accent: 'gold' },
          { to: '/admin/reviews', label: 'Referee Reviews', icon: <AlertCircle className="w-5 h-5" />, accent: 'crimson', badge: stats.pendingReviews },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card padding="md" className="hover:border-emerald-500/30 transition-all group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-${item.accent}-400`}>{item.icon}</div>
                  <span className="font-semibold text-white text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge ? (
                    <span className="px-2 py-0.5 text-xs bg-crimson-500/15 text-crimson-400 rounded-full font-bold">{item.badge}</span>
                  ) : null}
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent tournaments */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <CardTitle>Recent Tournaments</CardTitle>
          <Link to="/admin/tournaments" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentTournaments.map((t) => (
            <Link key={t.id} to={`/admin/tournaments/${t.id}`}>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.current_players}/{t.max_players} players • {formatDate(t.start_date)}</p>
                </div>
                <TournamentStatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
