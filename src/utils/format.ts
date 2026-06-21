import { format, formatDistanceToNow, isPast, isWithinInterval, addHours } from 'date-fns'

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy • HH:mm')
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isDeadlinePassed(deadline: string): boolean {
  return isPast(new Date(deadline))
}

export function getResultDeadline(fromDate?: string): string {
  const base = fromDate ? new Date(fromDate) : new Date()
  return addHours(base, 1).toISOString()
}

export function isWithinResultWindow(deadline: string): boolean {
  return !isPast(new Date(deadline))
}

export function formatWinRate(wins: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((wins / total) * 100)}%`
}

export function getTournamentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    registration_open: 'Registration Open',
    registration_closed: 'Registration Closed',
    live: 'Live',
    completed: 'Completed',
  }
  return labels[status] ?? status
}

export function getMatchStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    awaiting_results: 'Awaiting Results',
    disputed: 'Disputed',
    referee_review: 'Under Review',
    completed: 'Completed',
    walkover: 'Walkover',
  }
  return labels[status] ?? status
}
