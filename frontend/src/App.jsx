import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TeamProvider, useTeam } from './context/TeamContext'
import Sidebar from './components/Sidebar'
import Auth from './pages/Auth'
import TeamJoin from './pages/TeamJoin'
import Members from './pages/Members'
import Planning from './pages/Planning'
import Scrims from './pages/Scrims'
import Compositions from './pages/Compositions'
import DraftSimulation from './pages/DraftSimulation'
import Stats from './pages/Stats'
import Admin from './pages/Admin'
import { Shield, Loader2, Plus, KeyRound } from 'lucide-react'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-lol-dark-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
        <p className="text-lol-dark-400">Chargement...</p>
      </div>
    </div>
  )
}

function NoTeamSelected({ onJoinTeam }) {
  const { user } = useAuth()
  const { teams, createTeam } = useTeam()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamTag, setNewTeamTag] = useState('')
  const [creating, setCreating] = useState(false)

  const isPlayer = user?.role === 'joueur'
  const canCreateTeam = !isPlayer // Only managers and coaches can create teams

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    if (!newTeamName) return
    setCreating(true)
    try {
      await createTeam(newTeamName, newTeamTag || newTeamName.substring(0, 3).toUpperCase())
      setShowCreateModal(false)
      setNewTeamName('')
      setNewTeamTag('')
    } catch (error) {
      console.error(error)
    } finally {
      setCreating(false)
    }
  }

  // If user has teams, just show team selector message
  if (teams.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Selectionnez une equipe</h1>
        <p className="text-lol-dark-400 mb-8 max-w-md">
          Utilisez le selecteur d'equipe dans la barre laterale pour choisir l'equipe a gerer.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mb-6">
        <Shield className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Bienvenue sur NexusManager</h1>
      <p className="text-lol-dark-400 mb-8 max-w-md">
        {isPlayer
          ? "Rejoignez une equipe avec un code d'invitation pour commencer."
          : "Creez votre premiere equipe ou rejoignez-en une existante."
        }
      </p>

      <div className="flex gap-4">
        <button
          onClick={onJoinTeam}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
        >
          <KeyRound className="w-5 h-5" />
          Rejoindre avec un code
        </button>

        {canCreateTeam && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Creer une equipe
          </button>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-700 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">Creer une equipe</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Nom de l'equipe
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Mon Equipe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Tag (3 caracteres)
                </label>
                <input
                  type="text"
                  value={newTeamTag}
                  onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                  className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none"
                  placeholder="TAG"
                  maxLength={5}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-lol-dark-700 hover:bg-lol-dark-600 text-white rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTeamName}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-medium"
                >
                  {creating ? 'Creation...' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AppContent() {
  const { currentTeam, loading: teamLoading } = useTeam()
  const [showJoinPage, setShowJoinPage] = useState(false)

  if (teamLoading) {
    return <LoadingScreen />
  }

  if (showJoinPage) {
    return <TeamJoin onBack={() => setShowJoinPage(false)} />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar onJoinTeam={() => setShowJoinPage(true)} />
      <main className="flex-1 ml-64 p-8">
        {!currentTeam ? (
          <NoTeamSelected onJoinTeam={() => setShowJoinPage(true)} />
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/members" replace />} />
            <Route path="/members" element={<Members />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/scrims" element={<Scrims />} />
            <Route path="/compositions" element={<Compositions />} />
            <Route path="/draft" element={<DraftSimulation />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        )}
      </main>
    </div>
  )
}

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Auth />
  }

  return (
    <TeamProvider>
      <AppContent />
    </TeamProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}

export default App
