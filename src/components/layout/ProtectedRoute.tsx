import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { PageLoader } from '../ui/index'

interface ProtectedRouteProps {
  requireAdmin?: boolean
}

export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { user, initialized } = useAuthStore()

  if (!initialized) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (user.is_suspended) return <Navigate to="/suspended" replace />
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <Outlet />
}
