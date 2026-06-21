import { Trophy } from 'lucide-react'
import { Avatar, MatchStatusBadge } from '../ui/index'
import { getRoundName } from '../../utils/bracket'
import type { Match } from '../../types'

interface BracketViewProps {
  matches: Match[]
  totalRounds: number
  onMatchClick?: (match: Match) => void
}

export function BracketView({ matches, totalRounds, onMatchClick }: BracketViewProps) {
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1)

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {rounds.map((round) => {
          const roundMatches = matches.filter((m) => m.round_number === round)
          const roundName = getRoundName(round, totalRounds)

          return (
            <div key={round} className="flex flex-col gap-2">
              {/* Round header */}
              <div className="text-center mb-4">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{roundName}</span>
              </div>

              {/* Matches in this round */}
              <div
                className="flex flex-col"
                style={{ gap: `${Math.pow(2, round) * 16}px` }}
              >
                {roundMatches.map((match) => (
                  <MatchSlot
                    key={match.id}
                    match={match}
                    onClick={onMatchClick ? () => onMatchClick(match) : undefined}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Champion slot */}
        <div className="flex flex-col">
          <div className="text-center mb-4">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">Champion</span>
          </div>
          <div className="flex items-center justify-center w-40 h-16 bg-gold-500/10 border-2 border-gold-500/30 rounded-xl">
            <Trophy className="w-6 h-6 text-gold-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchSlot({ match, onClick }: { match: Match; onClick?: () => void }) {
  const isCompleted = match.status === 'completed'

  return (
    <div
      onClick={onClick}
      className={`w-44 bg-pitch-800 border rounded-xl overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-emerald-500/50' : ''
      } ${isCompleted ? 'border-slate-700' : 'border-slate-700/50'}`}
    >
      <PlayerRow
        profile={match.player_a}
        isWinner={match.winner_id === match.player_a_id}
        isCompleted={isCompleted}
        empty={!match.player_a_id}
      />
      <div className="border-t border-slate-800" />
      <PlayerRow
        profile={match.player_b}
        isWinner={match.winner_id === match.player_b_id}
        isCompleted={isCompleted}
        empty={!match.player_b_id}
      />
      {match.status !== 'pending' && (
        <div className="px-2 py-1 border-t border-slate-800 flex justify-center">
          <MatchStatusBadge status={match.status} />
        </div>
      )}
    </div>
  )
}

function PlayerRow({
  profile,
  isWinner,
  isCompleted,
  empty,
}: {
  profile?: { display_name: string; avatar_url?: string | null } | null
  isWinner: boolean
  isCompleted: boolean
  empty: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ${
        isWinner && isCompleted
          ? 'bg-emerald-500/10'
          : ''
      }`}
    >
      {empty ? (
        <span className="text-xs text-slate-600 italic">TBD</span>
      ) : profile ? (
        <>
          <Avatar src={profile.avatar_url} name={profile.display_name} size="xs" />
          <span
            className={`text-xs font-medium truncate ${
              isWinner && isCompleted ? 'text-emerald-400' : 'text-slate-300'
            }`}
          >
            {profile.display_name}
          </span>
          {isWinner && isCompleted && <span className="ml-auto text-emerald-400 text-xs">✓</span>}
        </>
      ) : (
        <span className="text-xs text-slate-600 italic">TBD</span>
      )}
    </div>
  )
}
