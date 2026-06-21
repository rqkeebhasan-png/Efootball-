import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Trophy, Swords, Globe } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Avatar, StatCard, PageLoader } from '../../components/ui/index'
import { Card, CardTitle } from '../../components/ui/Card'
import { MatchCard } from '../../components/match/MatchCard'
import { formatDate, formatWinRate } from '../../utils/format'
import type { Profile, Match } from '../../types'

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    const fetch = async () => {
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (!p) { setLoading(false); return }
      setProfile(p)

      const { data: m } = await supabase
        .from('matches')
        .select('*, player_a:profiles!matches_player_a_id_fkey(*), player_b:profiles!matches_player_b_id_fkey(*), winner:profiles!matches_winner_id_fkey(*)')
        .or(`player_a_id.eq.${p.id},player_b_id.eq.${p.id}`)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(10)

      setMatches(m ?? [])
      setLoading(false)
    }
    fetch()
  }, [username])

  if (loading) return <PageLoader />
  if (!profile) return (
    <div className="text-center py-16 text-slate-400">Player not found</div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card className="flex items-center gap-6">
        <Avatar src={profile.avatar_url} name={profile.display_name} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-white">{profile.display_name}</h1>
          <p className="text-slate-500 text-sm">@{profile.username}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> {profile.country}
            </span>
            {profile.efootball_uid && (
              <span>UID: {profile.efootball_uid}</span>
            )}
            <span>Joined {formatDate(profile.created_at)}</span>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Matches" value={profile.total_matches} icon={<Swords className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Wins" value={profile.total_wins} icon={<Trophy className="w-5 h-5" />} accent="gold" />
        <StatCard label="Losses" value={profile.total_losses} icon={<Swords className="w-5 h-5" />} accent="slate" />
        <StatCard label="Win Rate" value={formatWinRate(profile.total_wins, profile.total_matches)} icon={<Trophy className="w-5 h-5" />} accent="emerald" />
      </div>

      {/* Match history */}
      {matches.length > 0 && (
        <Card>
          <CardTitle className="mb-4">Recent Match History</CardTitle>
          <div className="space-y-3">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
