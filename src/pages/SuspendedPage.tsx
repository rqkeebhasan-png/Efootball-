import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function SuspendedPage() {
  const { signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-pitch-gradient flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-crimson-500/15 rounded-full flex items-center justify-center mx-auto">
          <ShieldOff className="w-8 h-8 text-crimson-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Account Suspended</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Your account has been suspended. Please contact an administrator for further information.
          </p>
        </div>
        <Button variant="secondary" onClick={handleSignOut}>Sign Out</Button>
      </div>
    </div>
  )
}
