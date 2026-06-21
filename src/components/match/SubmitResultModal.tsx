import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image } from 'lucide-react'
import { Modal } from '../ui/Form'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/index'
import { submitMatchResult } from '../../hooks/useMatch'
import { useAuthStore } from '../../store/authStore'
import type { Match } from '../../types'

interface SubmitResultModalProps {
  match: Match
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function SubmitResultModal({ match, open, onClose, onSuccess }: SubmitResultModalProps) {
  const { user } = useAuthStore()
  const [claimedWinnerId, setClaimedWinnerId] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('File too large. Max 5MB.'); return }
    setScreenshot(file)
    setPreview(URL.createObjectURL(file))
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': [], 'image/jpeg': [], 'image/jpg': [] },
    maxFiles: 1,
  })

  const playerA = match.player_a
  const playerB = match.player_b

  const handleSubmit = async () => {
    if (!user || !claimedWinnerId || !screenshot) {
      setError('Please select a winner and upload a screenshot')
      return
    }
    setLoading(true)
    const success = await submitMatchResult(match.id, user.id, claimedWinnerId, screenshot)
    setLoading(false)
    if (success) { onSuccess(); onClose() }
  }

  const handleClose = () => {
    setClaimedWinnerId(null)
    setScreenshot(null)
    setPreview(null)
    setError(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Submit Match Result" size="md">
      <div className="space-y-5">
        {/* Who won? */}
        <div>
          <p className="text-sm font-medium text-slate-300 mb-3">Who won this match?</p>
          <div className="grid grid-cols-2 gap-3">
            {[playerA, playerB].map((player) => {
              if (!player) return null
              const pid = player === playerA ? match.player_a_id : match.player_b_id
              const selected = claimedWinnerId === pid
              return (
                <button
                  key={pid}
                  onClick={() => setClaimedWinnerId(pid!)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    selected
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <Avatar src={player.avatar_url} name={player.display_name} size="lg" />
                  <span className={`text-sm font-semibold ${selected ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {player.display_name}
                  </span>
                  {pid === user?.id && (
                    <span className="text-xs text-slate-500">(You)</span>
                  )}
                  {selected && <span className="text-xs font-bold text-emerald-400">✓ Winner</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Screenshot upload */}
        <div>
          <p className="text-sm font-medium text-slate-300 mb-3">Match Screenshot</p>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Screenshot" className="w-full h-48 object-cover rounded-xl border border-slate-700" />
              <button
                onClick={() => { setScreenshot(null); setPreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 bg-crimson-600 text-white rounded-full text-xs hover:bg-crimson-500 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Drop screenshot here or click to browse</p>
              <p className="text-xs text-slate-600 mt-1">PNG, JPG, JPEG • Max 5MB</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-crimson-400 bg-crimson-500/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={handleClose}>Cancel</Button>
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!claimedWinnerId || !screenshot}
            onClick={handleSubmit}
          >
            Submit Result
          </Button>
        </div>
      </div>
    </Modal>
  )
}
