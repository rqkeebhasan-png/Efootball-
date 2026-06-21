import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, RotateCcw, AlertCircle, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { confirmMatchWinner } from '../../hooks/useMatch'
import { Avatar, PageLoader, EmptyState, MatchStatusBadge } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal, Textarea } from '../../components/ui/Form'
import { formatRelative } from '../../utils/format'
import toast from 'react-hot-toast'

interface ReviewItem {
  review_id: string
  match_id: string
  round_number: number
  match_number: number
  tournament_name: string
  decision: string
  notes: string | null
  created_at: string
  player_a: { id: string; display_name: string; avatar_url: string | null } | null
  player_b: { id: string; display_name: string; avatar_url: string | null } | null
  submission_a: { claimed_winner_id: string; screenshot_url: string } | null
  submission_b: { claimed_winner_id: string; screenshot_url: string } | null
}

export function AdminReviewsPage() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ReviewItem | null>(null)
  const [notes, setNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    const { data: reviewRows } = await supabase
      .from('referee_reviews')
      .select('id, match_id, decision, notes, created_at')
      .order('created_at', { ascending: false })

    if (!reviewRows) { setLoading(false); return }

    const enriched: ReviewItem[] = []

    for (const row of reviewRows) {
      const { data: match } = await supabase
        .from('matches')
        .select('round_number, match_number, player_a_id, player_b_id, tournament:tournaments(name), player_a:profiles!matches_player_a_id_fkey(id, display_name, avatar_url), player_b:profiles!matches_player_b_id_fkey(id, display_name, avatar_url)')
        .eq('id', row.match_id)
        .single()

      const { data: submissions } = await supabase
        .from('match_submissions')
        .select('submitted_by, claimed_winner_id, screenshot_url')
        .eq('match_id', row.match_id)

      if (!match) continue

      enriched.push({
        review_id: row.id,
        match_id: row.match_id,
        round_number: match.round_number,
        match_number: match.match_number,
        tournament_name: (match.tournament as any)?.name ?? 'Unknown',
        decision: row.decision,
        notes: row.notes,
        created_at: row.created_at,
        player_a: match.player_a as any,
        player_b: match.player_b as any,
        submission_a: submissions?.find((s) => s.submitted_by === (match.player_a as any)?.id) ?? null,
        submission_b: submissions?.find((s) => s.submitted_by === (match.player_b as any)?.id) ?? null,
      })
    }

    setReviews(enriched)
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [])

  const handleDecision = async (winnerId: string | null, decision: 'approved' | 'rejected' | 'resubmission_requested') => {
    if (!selected || !user) return
    setActionLoading(true)

    if (decision === 'approved' && winnerId) {
      await confirmMatchWinner(selected.match_id, winnerId)
    }

    await supabase
      .from('referee_reviews')
      .update({ decision, notes: notes || null, reviewed_by: user.id, resolved_at: new Date().toISOString() })
      .eq('id', selected.review_id)

    if (decision === 'rejected' || decision === 'resubmission_requested') {
      for (const pid of [selected.player_a?.id, selected.player_b?.id]) {
        if (pid) {
          await supabase.from('notifications').insert({
            user_id: pid,
            type: decision === 'rejected' ? 'result_rejected' : 'result_rejected',
            title: decision === 'resubmission_requested' ? 'Resubmission Requested' : 'Submission Rejected',
            message: notes || 'The referee has reviewed your match.',
            related_match_id: selected.match_id,
          })
        }
      }

      if (decision === 'resubmission_requested') {
        await supabase.from('matches').update({ status: 'awaiting_results' }).eq('id', selected.match_id)
        await supabase.from('match_submissions').delete().eq('match_id', selected.match_id)
      }
    }

    toast.success('Decision saved')
    setSelected(null)
    setNotes('')
    fetchReviews()
    setActionLoading(false)
  }

  const pending = reviews.filter((r) => r.decision === 'pending')
  const resolved = reviews.filter((r) => r.decision !== 'pending')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Referee Reviews</h1>
        <p className="text-slate-500 text-sm mt-1">Resolve disputed match results</p>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Pending */}
          <section>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gold-400" />
              Pending ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <EmptyState icon={<CheckCircle className="w-10 h-10" />} title="No pending reviews" description="All disputes have been resolved" />
            ) : (
              <div className="space-y-3">
                {pending.map((r) => (
                  <ReviewRow key={r.review_id} item={r} onReview={() => setSelected(r)} />
                ))}
              </div>
            )}
          </section>

          {/* Resolved */}
          {resolved.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-slate-400 mb-3">Resolved ({resolved.length})</h2>
              <div className="space-y-2 opacity-70">
                {resolved.map((r) => (
                  <ReviewRow key={r.review_id} item={r} resolved />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Review modal */}
      <Modal open={Boolean(selected)} onClose={() => { setSelected(null); setNotes('') }} title="Review Match" size="lg">
        {selected && (
          <div className="space-y-5">
            <p className="text-sm text-slate-400">
              {selected.tournament_name} • Round {selected.round_number} • Match #{selected.match_number}
            </p>

            {/* Submissions side by side */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { player: selected.player_a, sub: selected.submission_a, label: 'Player A' },
                { player: selected.player_b, sub: selected.submission_b, label: 'Player B' },
              ].map(({ player, sub, label }) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar src={player?.avatar_url} name={player?.display_name ?? '?'} size="sm" />
                    <span className="text-sm font-semibold text-white">{player?.display_name}</span>
                  </div>
                  {sub ? (
                    <>
                      <a href={sub.screenshot_url} target="_blank" rel="noreferrer">
                        <img src={sub.screenshot_url} alt="Screenshot" className="w-full h-36 object-cover rounded-xl border border-slate-700 hover:opacity-90 transition-opacity" />
                      </a>
                      <p className="text-xs text-slate-400">
                        Claims winner: <span className="text-emerald-400 font-medium">
                          {sub.claimed_winner_id === selected.player_a?.id ? selected.player_a?.display_name : selected.player_b?.display_name}
                        </span>
                      </p>
                    </>
                  ) : (
                    <div className="h-36 bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-sm">No submission</div>
                  )}
                </div>
              ))}
            </div>

            <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note about this decision..." />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-300">Declare winner:</p>
              <div className="grid grid-cols-2 gap-2">
                {[selected.player_a, selected.player_b].map((player) => player && (
                  <Button
                    key={player.id}
                    variant="primary"
                    loading={actionLoading}
                    onClick={() => handleDecision(player.id, 'approved')}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> {player.display_name} wins
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" loading={actionLoading} onClick={() => handleDecision(null, 'resubmission_requested')} className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Request Resubmission
                </Button>
                <Button variant="danger" loading={actionLoading} onClick={() => handleDecision(null, 'rejected')} className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Reject Both
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function ReviewRow({ item, onReview, resolved }: { item: ReviewItem; onReview?: () => void; resolved?: boolean }) {
  const decisionColors: Record<string, string> = {
    pending: 'text-gold-400',
    approved: 'text-emerald-400',
    rejected: 'text-crimson-400',
    resubmission_requested: 'text-blue-400',
  }

  return (
    <Card padding="sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex -space-x-2">
            <Avatar src={item.player_a?.avatar_url} name={item.player_a?.display_name ?? '?'} size="sm" />
            <Avatar src={item.player_b?.avatar_url} name={item.player_b?.display_name ?? '?'} size="sm" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {item.player_a?.display_name} vs {item.player_b?.display_name}
            </p>
            <p className="text-xs text-slate-500">
              {item.tournament_name} • R{item.round_number} • {formatRelative(item.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs font-semibold capitalize ${decisionColors[item.decision] ?? 'text-slate-400'}`}>
            {item.decision.replace('_', ' ')}
          </span>
          {!resolved && onReview && (
            <Button size="sm" variant="gold" onClick={onReview}>Review</Button>
          )}
        </div>
      </div>
    </Card>
  )
}
