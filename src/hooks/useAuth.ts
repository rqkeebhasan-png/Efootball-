import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'

export function useAuth() {
  const { user, loading, initialized, refreshProfile, signOut } = useAuthStore()
  const { fetchNotifications } = useNotificationStore()

  useEffect(() => {
    refreshProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshProfile()
        } else if (event === 'SIGNED_OUT') {
          useAuthStore.getState().setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id)

      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            useNotificationStore.getState().addNotification(payload.new as any)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user?.id])

  return { user, loading, initialized, signOut }
}
