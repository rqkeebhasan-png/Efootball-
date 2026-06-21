import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import toast from 'react-hot-toast'

export function LoginPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    await refreshProfile()
    const user = useAuthStore.getState().user
    navigate(user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-pitch-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-emerald">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">eFootball Tournament</h1>
          <p className="text-slate-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card-gradient border border-slate-700/50 rounded-2xl p-8 shadow-card space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>

          <p className="text-center text-sm text-slate-500">
            No account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
