import { useState } from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import { Card } from '../ui/Card'
import { Avatar, MatchStatusBadge } from '../ui/index'
import { Button } from '../ui/Button'
import { formatDateTime, isWithinResultWindow } from '../../utils/format'
import { SubmitResultModal } from './SubmitResultModal'
import { useAuthStore } from '../../store/authStore'
import type { Match } from '../../types'

interface MatchCardProps {
  match: Match
  onUpdate?: () => void
  showTournament?: boolean
}

export function MatchCard({ match, onUpdate, showTournament }: MatchCardProps) {
  const { user } = useAuthStore()
  const [submitOpen, setSubmitOpen] = useState(false)

  const isParticipant = user && (match.player_a_id === user.id || match.player_b_id === user.id)
  const canSubmit =
    isParticipant &&
    match.status === 'awaiting_results' &&
    match.result_deadline &&
    isWithinResultWindow(match.result_deadline)

  const playerA = match.player_a
  const playerB = match.player_b

  return (
    <>
      <Card padding="sm" className="hover:border-slate-600 transition-all duration-200">
        <div className="flex items-center gap-3">
          {/* Round info */}
          <div className="hidden sm:flex flex-col items-center w-12 flex-shrink-0">
            <span className="text-xs font-bold text-emerald-400">R{match.round_number}</span>
            <span className="text-xs text-slate-600">#{match.match_number}</span>
          </div>

          {/* Players */}
          <div className="flex-1 flex items-center gap-3">
            {/* Player A */}
            <div className={`flex items-center gap-2 flex-1 min-w-0 ${match.winner_id === match.player_a_id ? 'opacity-100' : match.winner_id ? 'opacity-40' : ''}`}>
              {playerA ? (
                <>
                  <Avatar src={playerA.avatar_url} name={playerA.display_name} size="sm" />
                  <span className={`text-sm font-semibold truncate ${match.winner_id === match.player_a_id ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {playerA.display_name}
                    {user?.id === match.player_a_id && <span className="text-slate-500 font-normal ml-1">(You)</span>}
                  </span>
                </>
              ) : (
                <span className="text-sm text-slate-600 italic">TBD</span>
              )}
            </div>

            {/* VS */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-500">VS</span>
            </div>

            {/* Player B */}
            <div className={`flex items-center gap-2 flex-1 min-w-0 justify-end ${match.winner_id === match.player_b_id ? 'opacity-100' : match.winner_id ? 'opacity-40' : ''}`}>
              {playerB ? (
                <>
                  <span className={`text-sm font-semibold truncate text-right ${match.winner_id === match.player_b_id ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {playerB.display_name}
                    {user?.id === match.player_b_id && <span className="text-slate-500 font-normal ml-1">(You)</span>}
                  </span>
                  <Avatar src={playerB.avatar_url} name={playerB.display_name} size="sm" />
                </>
              ) : (
                <span className="text-sm text-slate-600 italic">TBD</span>
              )}
            </div>
          </div>

          {/* Status & Action */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <MatchStatusBadge status={match.status} />
            {match.result_deadline && match.status === 'awaiting_results' && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{formatDateTime(match.result_deadline)}</span>
              </div>
            )}
            {canSubmit && (
              <Button size="sm" variant="primary" onClick={() => setSubmitOpen(true)}>
                Submit Result
              </Button>
            )}
          </div>
        </div>
      </Card>

      {canSubmit && (
        <SubmitResultModal
          match={match}
          open={submitOpen}
          onClose={() => setSubmitOpen(false)}
          onSuccess={() => onUpdate?.()}
        />
      )}
    </>
  )
}
