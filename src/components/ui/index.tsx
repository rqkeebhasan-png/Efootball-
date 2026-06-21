import { type TournamentStatus, type MatchStatus } from '../../types'

// ─── Badge ───────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  variant?: 'emerald' | 'gold' | 'crimson' | 'slate' | 'blue'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'slate', size = 'sm' }: BadgeProps) {
  const variants = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    gold: 'bg-gold-500/15 text-gold-400 border-gold-500/25',
    crimson: 'bg-crimson-500/15 text-crimson-400 border-crimson-500/25',
    slate: 'bg-slate-700/50 text-slate-400 border-slate-600/25',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

// ─── Tournament Status Badge ──────────────────────────────────────────────────
export function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  const map: Record<TournamentStatus, { label: string; variant: BadgeProps['variant'] }> = {
    registration_open: { label: 'Registration Open', variant: 'emerald' },
    registration_closed: { label: 'Reg. Closed', variant: 'gold' },
    live: { label: '🔴 Live', variant: 'crimson' },
    completed: { label: 'Completed', variant: 'slate' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

// ─── Match Status Badge ───────────────────────────────────────────────────────
export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const map: Record<MatchStatus, { label: string; variant: BadgeProps['variant'] }> = {
    pending: { label: 'Pending', variant: 'slate' },
    awaiting_results: { label: 'Awaiting Results', variant: 'gold' },
    disputed: { label: 'Disputed', variant: 'crimson' },
    referee_review: { label: 'Under Review', variant: 'blue' },
    completed: { label: 'Completed', variant: 'emerald' },
    walkover: { label: 'Walkover', variant: 'slate' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border border-slate-700`}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-emerald-gradient flex items-center justify-center font-semibold text-white border border-slate-700 flex-shrink-0`}
    >
      {initials}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin`} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-slate-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-400 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-600 max-w-xs">{description}</p>}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, accent = 'emerald' }: {
  label: string
  value: string | number
  icon: React.ReactNode
  accent?: 'emerald' | 'gold' | 'crimson' | 'slate'
}) {
  const accents = {
    emerald: 'text-emerald-400',
    gold: 'text-gold-400',
    crimson: 'text-crimson-400',
    slate: 'text-slate-400',
  }
  return (
    <div className="bg-card-gradient border border-slate-700/50 rounded-xl p-5 shadow-card">
      <div className={`${accents[accent]} mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  )
}
