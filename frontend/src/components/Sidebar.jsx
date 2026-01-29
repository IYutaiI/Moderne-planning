import { NavLink } from 'react-router-dom'
import {
  Users,
  Calendar,
  Layers,
  Wand2,
  BarChart3,
  Gamepad2
} from 'lucide-react'

const navItems = [
  { path: '/members', icon: Users, label: 'Roster' },
  { path: '/planning', icon: Calendar, label: 'Planning' },
  { path: '/compositions', icon: Layers, label: 'Compositions' },
  { path: '/draft', icon: Wand2, label: 'Draft Simulation' },
  { path: '/stats', icon: BarChart3, label: 'Statistiques' },
]

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-lol-dark-900/95 backdrop-blur-sm border-r border-lol-dark-700 z-50">
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

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
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
    </aside>
  )
}

export default Sidebar
