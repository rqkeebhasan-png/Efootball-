import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'

// Auth pages
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'

// Shared pages
import { NotFoundPage } from './pages/NotFoundPage'
import { SuspendedPage } from './pages/SuspendedPage'

// Player pages
import { DashboardPage } from './pages/player/DashboardPage'
import { TournamentsPage } from './pages/player/TournamentsPage'
import { TournamentDetailPage } from './pages/player/TournamentDetailPage'
import { MyMatchesPage } from './pages/player/MyMatchesPage'
import { ProfilePage } from './pages/player/ProfilePage'
import { PublicProfilePage } from './pages/player/PublicProfilePage'
import { SearchPage } from './pages/player/SearchPage'

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminTournamentsPage } from './pages/admin/AdminTournamentsPage'
import { TournamentFormPage } from './pages/admin/TournamentFormPage'
import { AdminTournamentDetailPage } from './pages/admin/AdminTournamentDetailPage'
import { AdminPlayersPage } from './pages/admin/AdminPlayersPage'
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage'

export function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/suspended" element={<SuspendedPage />} />

      {/* Protected player routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/matches" element={<MyMatchesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/players/:username" element={<PublicProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>
      </Route>

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/tournaments" element={<AdminTournamentsPage />} />
          <Route path="/admin/tournaments/new" element={<TournamentFormPage />} />
          <Route path="/admin/tournaments/:id" element={<AdminTournamentDetailPage />} />
          <Route path="/admin/tournaments/:id/edit" element={<TournamentFormPage />} />
          <Route path="/admin/players" element={<AdminPlayersPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
