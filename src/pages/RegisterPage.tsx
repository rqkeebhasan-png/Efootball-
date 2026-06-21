import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Form'
import toast from 'react-hot-toast'

const COUNTRIES = [
  'Bangladesh', 'India', 'Pakistan', 'Nepal', 'Sri Lanka',
  'United States', 'United Kingdom', 'Germany', 'Brazil', 'Argentina',
  'Japan', 'South Korea', 'Other',
]

export function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    display_name: '',
    efootball_uid: '',
    country: 'Bangladesh',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Required'
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.username || form.username.length < 3) e.username = 'Min 3 characters'
    if (!/^[a-z0-9_]+$/.test(form.username)) e.username = 'Only lowercase letters, numbers, underscore'
    if (!form.display_name) e.display_name = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: form.username,
        display_name: form.display_name,
        efootball_uid: form.efootball_uid || null,
        country: form.country,
      })

      if (profileError) {
        toast.error(profileError.message)
        setLoading(false)
        return
      }
    }

    toast.success('Account created! Please check your email to verify.')
    navigate('/login')
  }

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="min-h-screen bg-pitch-gradient flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-emerald">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-500 mt-1 text-sm">Join the eFootball community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card-gradient border border-slate-700/50 rounded-2xl p-8 shadow-card space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} placeholder="you@example.com" />
          <Input label="Username" value={form.username} onChange={(e) => set('username', e.target.value.toLowerCase())} error={errors.username} placeholder="player123" hint="Lowercase letters, numbers, underscore only" />
          <Input label="Display Name" value={form.display_name} onChange={(e) => set('display_name', e.target.value)} error={errors.display_name} placeholder="Your Name" />
          <Input label="eFootball UID (optional)" value={form.efootball_uid} onChange={(e) => set('efootball_uid', e.target.value)} placeholder="123456789" />
          <Select
            label="Country"
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
            options={COUNTRIES.map((c) => ({ value: c, label: c }))}
          />
          <Input label="Password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} placeholder="Min 8 characters" />
          <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} error={errors.confirmPassword} placeholder="Repeat password" />

          <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
            Create Account
          </Button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
