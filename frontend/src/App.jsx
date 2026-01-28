import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Members from './pages/Members'
import Planning from './pages/Planning'
import Scrims from './pages/Scrims'
import Compositions from './pages/Compositions'
import DraftSimulation from './pages/DraftSimulation'
import Stats from './pages/Stats'

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/members" replace />} />
          <Route path="/members" element={<Members />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/scrims" element={<Scrims />} />
          <Route path="/compositions" element={<Compositions />} />
          <Route path="/draft" element={<DraftSimulation />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
