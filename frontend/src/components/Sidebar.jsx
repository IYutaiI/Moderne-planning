import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Users,
  Calendar,
  Layers,
  Wand2,
  BarChart3,
  Gamepad2,
  LogOut,
  User,
  KeyRound,
  Copy,
  Check,
  Trophy,
  ClipboardList,
  Settings,
  Shield
} from 'lucide-react'
import TeamSelector from './TeamSelector'
import { useTeam } from '../context/TeamContext'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/members', icon: Users, label: 'Roster' },
  { path: '/planning', icon: Calendar, label: 'Planning' },
  { path: '/compositions', icon: Layers, label: 'Compositions' },
  { path: '/draft', icon: Wand2, label: 'Draft Simulation' },
  { path: '/stats', icon: BarChart3, label: 'Statistiques' },
]

const roleLabels = {
  joueur: { label: 'Joueur', color: 'text-yellow-400 bg-yellow-500/20', icon: Trophy },
  manager: { label: 'Manager', color: 'text-blue-400 bg-blue-500/20', icon: ClipboardList },
  coach: { label: 'Coach', color: 'text-green-400 bg-green-500/20', icon: Users },
  admin: { label: 'Admin', color: 'text-red-400 bg-red-500/20', icon: Shield }
}

function Sidebar({ onJoinTeam }) {
  const { currentTeam } = useTeam()
  const { user, logout } = useAuth()
  const [copied, setCopied] = useState(false)

  const roleInfo = roleLabels[user?.role] || roleLabels.joueur

  const copyJoinCode = () => {
    if (currentTeam?.join_code) {
      navigator.clipboard.writeText(currentTeam.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-lol-dark-900/95 backdrop-blur-sm border-r border-lol-dark-700 z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-lol-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-purple-400">NexusManager</h1>
          </div>
        </div>
      </div>

      {/* Team Selector */}
      <div className="p-4 border-b border-lol-dark-700">
        <TeamSelector />

        {/* Join Code (for managers/coaches) */}
        {currentTeam?.join_code && user?.role !== 'joueur' && (
          <div className="mt-3 p-2 bg-lol-dark-800/50 rounded-lg">
            <div className="text-xs text-lol-dark-500 mb-1">Code d'invitation</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-purple-400">{currentTeam.join_code}</code>
              <button
                onClick={copyJoinCode}
                className="p-1 hover:bg-lol-dark-700 rounded transition-colors"
                title="Copier"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-lol-dark-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Join Team Button */}
        {onJoinTeam && (
          <button
            onClick={onJoinTeam}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            Rejoindre une equipe
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                !currentTeam
                  ? 'opacity-50 pointer-events-none text-lol-dark-500'
                  : isActive
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-lol-dark-400 hover:bg-lol-dark-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}

        {/* Admin link for managers/coaches/admins */}
        {user?.role && user.role !== 'joueur' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-lol-dark-400 hover:bg-lol-dark-800 hover:text-white'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Administration</span>
          </NavLink>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-lol-dark-700">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-lol-dark-700 flex items-center justify-center">
            <User className="w-4 h-4 text-lol-dark-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white truncate">{user?.username}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
            <div className="text-xs text-lol-dark-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-lol-dark-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Deconnexion</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
