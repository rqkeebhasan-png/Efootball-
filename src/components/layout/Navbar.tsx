import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Bell, User, LogOut, Menu, X, Shield } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { Avatar } from '../ui/index'
import { NotificationPanel } from '../player/NotificationPanel'

export function Navbar() {
  const { user, signOut } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'
  const basePath = isAdmin ? '/admin' : '/dashboard'

  const navLinks = isAdmin
    ? [
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/tournaments', label: 'Tournaments' },
        { to: '/admin/players', label: 'Players' },
        { to: '/admin/reviews', label: 'Reviews' },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/tournaments', label: 'Tournaments' },
        { to: '/matches', label: 'My Matches' },
      ]

  return (
    <nav className="sticky top-0 z-40 bg-pitch-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={basePath} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-gradient rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">eFootball</span>
            <span className="font-light text-emerald-400 text-sm hidden sm:block">Tournament</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-gold-500/15 border border-gold-500/25">
                <Shield className="w-3 h-3 text-gold-400" />
                <span className="text-xs font-semibold text-gold-400">Admin</span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-crimson-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {/* Profile */}
            <Link
              to={isAdmin ? '/admin/profile' : '/profile'}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Avatar src={user?.avatar_url} name={user?.display_name ?? 'User'} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-slate-300">
                {user?.display_name}
              </span>
            </Link>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-slate-500 hover:text-crimson-400 hover:bg-slate-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
