import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Planning from './pages/Planning'
import Events from './pages/Events'
import Availabilities from './pages/Availabilities'

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/events" element={<Events />} />
          <Route path="/availabilities" element={<Availabilities />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
