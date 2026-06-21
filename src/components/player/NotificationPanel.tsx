import { useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore } from '../../store/authStore'
import { formatRelative } from '../../utils/format'
import { Button } from '../ui/Button'

interface NotificationPanelProps {
  onClose: () => void
}

const typeIcons: Record<string, string> = {
  tournament_accepted: '🏆',
  match_assigned: '⚽',
  result_approved: '✅',
  result_rejected: '❌',
  tournament_started: '🚀',
  tournament_finished: '🏁',
  dispute_raised: '⚠️',
  default_win: '🎯',
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { notifications, loading, markAsRead, markAllAsRead } = useNotificationStore()
  const { user } = useAuthStore()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-pitch-800 border border-slate-700 rounded-xl shadow-2xl z-50 animate-slide-up overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white text-sm">Notifications</span>
        </div>
        {user && (
          <button
            onClick={() => markAllAsRead(user.id)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`flex gap-3 px-4 py-3 border-b border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-800/50 ${
                !n.is_read ? 'bg-emerald-500/5' : ''
              }`}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{typeIcons[n.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>
                    {n.title}
                  </p>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-600 mt-1">{formatRelative(n.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
