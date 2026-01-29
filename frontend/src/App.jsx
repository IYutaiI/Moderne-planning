import { Routes, Route, Navigate } from 'react-router-dom'
import { TeamProvider, useTeam } from './context/TeamContext'
import Sidebar from './components/Sidebar'
import Members from './pages/Members'
import Planning from './pages/Planning'
import Scrims from './pages/Scrims'
import Compositions from './pages/Compositions'
import DraftSimulation from './pages/DraftSimulation'
import Stats from './pages/Stats'
import { Shield } from 'lucide-react'

function NoTeamSelected() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mb-6">
        <Shield className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Bienvenue sur NexusManager</h1>
      <p className="text-lol-dark-400 mb-8 max-w-md">
        Selectionnez une equipe ou creez-en une nouvelle pour commencer a gerer votre roster, vos compositions et vos statistiques.
      </p>
      <div className="text-sm text-lol-dark-500">
        Utilisez le selecteur d'equipe dans la barre laterale pour commencer
      </div>
    </div>
  )
}

function AppContent() {
  const { currentTeam } = useTeam()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {!currentTeam ? (
          <NoTeamSelected />
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/members" replace />} />
            <Route path="/members" element={<Members />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/scrims" element={<Scrims />} />
            <Route path="/compositions" element={<Compositions />} />
            <Route path="/draft" element={<DraftSimulation />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <TeamProvider>
      <AppContent />
    </TeamProvider>
  )
}

export default App
