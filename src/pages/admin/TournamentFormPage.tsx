import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Textarea, Select } from '../../components/ui/Form'
import { Card, CardTitle } from '../../components/ui/Card'
import { PageLoader } from '../../components/ui/index'
import toast from 'react-hot-toast'

export function TournamentFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    max_players: '8',
    registration_deadline: '',
    start_date: '',
    rules: '',
    prize_info: '',
  })

  useEffect(() => {
    if (!isEdit || !id) return
    const fetch = async () => {
      const { data } = await supabase.from('tournaments').select('*').eq('id', id).single()
      if (data) {
        setForm({
          name: data.name,
          description: data.description ?? '',
          max_players: String(data.max_players),
          registration_deadline: data.registration_deadline.slice(0, 16),
          start_date: data.start_date.slice(0, 16),
          rules: data.rules ?? '',
          prize_info: data.prize_info ?? '',
        })
        if (data.banner_url) setBannerPreview(data.banner_url)
      }
      setFetchLoading(false)
    }
    fetch()
  }, [id, isEdit])

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Banner max 5MB'); return }
    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
  }

  const uploadBanner = async (): Promise<string | null> => {
    if (!bannerFile || !user) return null
    const ext = bannerFile.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('tournament-banners').upload(path, bannerFile)
    if (error) { toast.error('Banner upload failed'); return null }
    return supabase.storage.from('tournament-banners').getPublicUrl(path).data.publicUrl
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.registration_deadline || !form.start_date) {
      toast.error('Please fill all required fields')
      return
    }
    if (new Date(form.start_date) <= new Date(form.registration_deadline)) {
      toast.error('Start date must be after registration deadline')
      return
    }

    setLoading(true)
    const bannerUrl = bannerFile ? await uploadBanner() : undefined

    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description || null,
      max_players: parseInt(form.max_players),
      registration_deadline: new Date(form.registration_deadline).toISOString(),
      start_date: new Date(form.start_date).toISOString(),
      rules: form.rules || null,
      prize_info: form.prize_info || null,
      ...(bannerUrl !== undefined ? { banner_url: bannerUrl } : {}),
    }

    if (isEdit) {
      const { error } = await supabase.from('tournaments').update(payload).eq('id', id!)
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Tournament updated!')
    } else {
      payload.created_by = user?.id
      const { error } = await supabase.from('tournaments').insert(payload)
      if (error) { toast.error(error.message); setLoading(false); return }
      toast.success('Tournament created!')
    }

    navigate('/admin/tournaments')
  }

  if (fetchLoading) return <PageLoader />

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/tournaments')} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Tournament' : 'New Tournament'}</h1>
          <p className="text-slate-500 text-sm mt-1">{isEdit ? 'Update tournament details' : 'Set up a new tournament'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardTitle className="mb-5">Basic Information</CardTitle>
          <div className="space-y-4">
            <Input label="Tournament Name *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Bangladesh eFootball Championship" required />
            <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the tournament..." />
            <Input label="Prize Information" value={form.prize_info} onChange={(e) => set('prize_info', e.target.value)} placeholder="e.g. 1st Place: BDT 5,000" />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-5">Settings</CardTitle>
          <div className="space-y-4">
            <Select
              label="Max Players *"
              value={form.max_players}
              onChange={(e) => set('max_players', e.target.value)}
              options={[
                { value: '8', label: '8 Players' },
                { value: '16', label: '16 Players' },
                { value: '32', label: '32 Players' },
                { value: '64', label: '64 Players' },
              ]}
            />
            <Input
              label="Registration Deadline *"
              type="datetime-local"
              value={form.registration_deadline}
              onChange={(e) => set('registration_deadline', e.target.value)}
              required
            />
            <Input
              label="Tournament Start Date *"
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              required
            />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-5">Rules & Banner</CardTitle>
          <div className="space-y-4">
            <Textarea label="Rules" value={form.rules} onChange={(e) => set('rules', e.target.value)} placeholder="Tournament rules..." />
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Banner Image</label>
              {bannerPreview && (
                <img src={bannerPreview} alt="Banner preview" className="w-full h-32 object-cover rounded-xl mb-3 border border-slate-700" />
              )}
              <input
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/webp"
                onChange={handleBannerChange}
                className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white file:cursor-pointer hover:file:bg-slate-600 transition-all"
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/admin/tournaments')}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            {isEdit ? 'Save Changes' : 'Create Tournament'}
          </Button>
        </div>
      </form>
    </div>
  )
}
