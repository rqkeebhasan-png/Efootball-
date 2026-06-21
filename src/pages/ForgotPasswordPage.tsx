import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import toast from 'react-hot-toast'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/efootball-tournament/reset-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-pitch-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-emerald">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-500 mt-1 text-sm">We'll send a reset link to your email</p>
        </div>

        <div className="bg-card-gradient border border-slate-700/50 rounded-2xl p-8 shadow-card">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📧</span>
              </div>
              <p className="text-white font-semibold">Check your inbox</p>
              <p className="text-slate-400 text-sm">We sent a password reset link to <strong>{email}</strong></p>
              <Link to="/login">
                <Button variant="secondary" fullWidth className="mt-4">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" fullWidth loading={loading}>Send Reset Link</Button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
