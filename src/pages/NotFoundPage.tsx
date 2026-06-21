import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-pitch-gradient flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-6xl font-black text-slate-700 mb-3">404</h1>
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-slate-400 mt-2 text-sm">The page you're looking for doesn't exist.</p>
        </div>
        <Link to="/dashboard">
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
