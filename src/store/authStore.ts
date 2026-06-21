import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthState {
  user: Profile | null
  loading: boolean
  initialized: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  refreshProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ user: null, loading: false, initialized: true })
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    set({ user: profile ?? null, loading: false, initialized: true })
  },
}))
