import { useState, useRef, type FormEvent } from 'react'
import { Camera, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Avatar, StatCard } from '../../components/ui/index'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardTitle } from '../../components/ui/Card'
import { formatWinRate, formatDate } from '../../utils/format'
import { Trophy, Swords, History, Percent } from 'lucide-react'
import toast from 'react-hot-toast'

export function ProfilePage() {
  const { user, refreshProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    display_name: user?.display_name ?? '',
    efootball_uid: user?.efootball_uid ?? '',
    country: user?.country ?? '',
  })

  if (!user) return null

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Avatar max size is 2MB'); return }

    setAvatarLoading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) { toast.error('Upload failed'); setAvatarLoading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    await refreshProfile()
    toast.success('Avatar updated!')
    setAvatarLoading(false)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.display_name) { toast.error('Display name required'); return }
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name,
        efootball_uid: form.efootball_uid || null,
        country: form.country,
      })
      .eq('id', user.id)

    if (error) { toast.error(error.message) }
    else {
      await refreshProfile()
      toast.success('Profile updated!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar */}
      <Card className="flex items-center gap-6">
        <div className="relative">
          <Avatar src={user.avatar_url} name={user.display_name} size="xl" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarLoading}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <div>
          <p className="font-bold text-white text-lg">{user.display_name}</p>
          <p className="text-slate-500 text-sm">@{user.username}</p>
          <p className="text-slate-600 text-xs mt-1">Member since {formatDate(user.created_at)}</p>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Matches" value={user.total_matches} icon={<Swords className="w-5 h-5" />} accent="emerald" />
        <StatCard label="Wins" value={user.total_wins} icon={<Trophy className="w-5 h-5" />} accent="gold" />
        <StatCard label="Losses" value={user.total_losses} icon={<History className="w-5 h-5" />} accent="slate" />
        <StatCard label="Win Rate" value={formatWinRate(user.total_wins, user.total_matches)} icon={<Percent className="w-5 h-5" />} accent="emerald" />
      </div>

      {/* Edit form */}
      <Card>
        <CardTitle className="mb-5">Edit Profile</CardTitle>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Username" value={user.username} disabled hint="Username cannot be changed" />
          <Input
            label="Display Name"
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          />
          <Input
            label="eFootball UID"
            value={form.efootball_uid}
            onChange={(e) => setForm((f) => ({ ...f, efootball_uid: e.target.value }))}
            placeholder="Your eFootball UID"
          />
          <Input
            label="Country"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          />
          <Button type="submit" loading={loading} className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </form>
      </Card>
    </div>
  )
}
