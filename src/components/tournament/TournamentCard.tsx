import { Link } from 'react-router-dom'
import { Users, Calendar, Trophy, Clock } from 'lucide-react'
import { Card } from '../ui/Card'
import { TournamentStatusBadge } from '../ui/index'
import { formatDate } from '../../utils/format'
import type { Tournament } from '../../types'

interface TournamentCardProps {
  tournament: Tournament
  isRegistered?: boolean
  linkPrefix?: string
}

export function TournamentCard({ tournament, isRegistered, linkPrefix = '/tournaments' }: TournamentCardProps) {
  const fillPercent = Math.round((tournament.current_players / tournament.max_players) * 100)

  return (
    <Link to={`${linkPrefix}/${tournament.id}`}>
      <Card
        padding="none"
        className="overflow-hidden hover:border-emerald-500/30 hover:shadow-glow-emerald transition-all duration-300 cursor-pointer group"
      >
        {/* Banner */}
        <div className="relative h-32 bg-gradient-to-br from-slate-800 to-pitch-700 overflow-hidden">
          {tournament.banner_url ? (
            <img
              src={tournament.banner_url}
              alt={tournament.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-pitch-900/80 to-transparent" />
          <div className="absolute top-3 right-3">
            <TournamentStatusBadge status={tournament.status} />
          </div>
          {isRegistered && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/90 text-white rounded-full">
                Registered
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-white text-base mb-1 truncate group-hover:text-emerald-400 transition-colors">
            {tournament.name}
          </h3>
          {tournament.description && (
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{tournament.description}</p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {tournament.current_players}/{tournament.max_players}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(tournament.start_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Reg: {formatDate(tournament.registration_deadline)}
            </span>
          </div>

          {/* Fill bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-emerald-gradient transition-all duration-500"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1">{fillPercent}% filled</p>

          {/* Prize */}
          {tournament.prize_info && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <p className="text-xs text-gold-400 font-medium truncate">🏆 {tournament.prize_info}</p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
