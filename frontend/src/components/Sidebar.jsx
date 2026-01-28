import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  Clock,
  Gamepad2
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/members', icon: Users, label: 'Membres' },
  { path: '/planning', icon: Calendar, label: 'Planning' },
  { path: '/events', icon: CalendarDays, label: 'Événements' },
  { path: '/availabilities', icon: Clock, label: 'Disponibilités' },
]

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-lol-dark-900/95 backdrop-blur-sm border-r border-lol-dark-700 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-lol-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-lol-blue-500 to-lol-blue-700 flex items-center justify-center animate-glow">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">LoL Scheduler</h1>
            <p className="text-xs text-lol-dark-400">Team Planning</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-lol-blue-500/20 text-lol-blue-400 border border-lol-blue-500/30'
                  : 'text-lol-dark-300 hover:bg-lol-dark-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-lol-dark-700">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-lol-dark-800/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lol-gold-500 to-lol-gold-700 flex items-center justify-center">
            <span className="text-sm font-bold text-lol-dark-900">T</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Team</p>
            <p className="text-xs text-lol-dark-400">Saison 2024</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
