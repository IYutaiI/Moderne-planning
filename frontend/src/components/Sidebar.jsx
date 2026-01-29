import { NavLink } from 'react-router-dom'
import {
  Users,
  Calendar,
  Layers,
  Wand2,
  BarChart3,
  Gamepad2
} from 'lucide-react'
import TeamSelector from './TeamSelector'
import { useTeam } from '../context/TeamContext'

const navItems = [
  { path: '/members', icon: Users, label: 'Roster' },
  { path: '/planning', icon: Calendar, label: 'Planning' },
  { path: '/compositions', icon: Layers, label: 'Compositions' },
  { path: '/draft', icon: Wand2, label: 'Draft Simulation' },
  { path: '/stats', icon: BarChart3, label: 'Statistiques' },
]

function Sidebar() {
  const { currentTeam } = useTeam()

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
      </nav>

      {/* Footer */}
      {currentTeam && (
        <div className="p-4 border-t border-lol-dark-700">
          <div className="text-xs text-lol-dark-500 text-center">
            Equipe: <span className="text-purple-400">{currentTeam.name}</span>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
