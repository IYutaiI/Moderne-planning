import { useState, useEffect } from 'react'
import { Swords, Plus, Calendar, Clock, Trophy, X, Edit2, Trash2 } from 'lucide-react'
import { useTeam } from '../context/TeamContext'
import { useAuth } from '../context/AuthContext'

function Scrims() {
  const { currentTeam } = useTeam()
  const { authFetch } = useAuth()
  const [scrims, setScrims] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingScrim, setEditingScrim] = useState(null)
  const [formData, setFormData] = useState({
    opponent: '',
    date: new Date().toISOString().split('T')[0],
    time: '20:00',
    result: '',
    notes: ''
  })

  useEffect(() => {
    if (currentTeam) {
      fetchScrims()
    }
  }, [currentTeam])

  const fetchScrims = async () => {
    try {
      const res = await authFetch(`/api/events?team_id=${currentTeam.id}&event_type=scrim`)
      const data = await res.json()
      // Map events to scrims format
      const mapped = data.map(e => ({
        id: e.id,
        opponent: e.title,
        date: e.event_date,
        time: e.start_time,
        result: e.description?.split('|')[0] || '',
        notes: e.description?.split('|')[1] || ''
      }))
      setScrims(mapped)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingScrim) {
        await authFetch(`/api/events/${editingScrim.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.opponent,
            event_type: 'scrim',
            event_date: formData.date,
            start_time: formData.time,
            end_time: formData.time,
            description: `${formData.result}|${formData.notes}`
          })
        })
      } else {
        await authFetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_id: currentTeam.id,
            title: formData.opponent,
            event_type: 'scrim',
            event_date: formData.date,
            start_time: formData.time,
            end_time: formData.time,
            description: `${formData.result}|${formData.notes}`
          })
        })
      }
      fetchScrims()
      closeModal()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce scrim ?')) return
    try {
      await authFetch(`/api/events/${id}`, { method: 'DELETE' })
      fetchScrims()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const openModal = (scrim = null) => {
    if (scrim) {
      setEditingScrim(scrim)
      setFormData(scrim)
    } else {
      setEditingScrim(null)
      setFormData({
        opponent: '',
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        result: '',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingScrim(null)
  }

  const getResultColor = (result) => {
    if (!result) return 'text-lol-dark-400'
    const [wins, losses] = result.split('-').map(Number)
    if (wins > losses) return 'text-green-400'
    if (wins < losses) return 'text-red-400'
    return 'text-yellow-400'
  }

  const upcomingScrims = scrims
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const pastScrims = scrims
    .filter(s => new Date(s.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scrims</h1>
          <p className="text-lol-dark-400">Gerez vos matchs d'entrainement</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau Scrim
        </button>
      </div>

      {/* Upcoming Scrims */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Scrims a venir
        </h2>
        {upcomingScrims.length === 0 ? (
          <div className="text-center py-12 bg-lol-dark-800/30 rounded-xl border border-lol-dark-700/50">
            <Swords className="w-16 h-16 text-lol-dark-600 mx-auto mb-4" />
            <p className="text-lol-dark-400">Aucun scrim planifie</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingScrims.map(scrim => (
              <div
                key={scrim.id}
                className="p-4 bg-lol-dark-800/50 rounded-xl border border-lol-dark-700/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Swords className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">vs {scrim.opponent}</h3>
                    <div className="flex items-center gap-4 text-sm text-lol-dark-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(scrim.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {scrim.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(scrim)}
                    className="p-2 text-lol-dark-400 hover:text-white hover:bg-lol-dark-700 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(scrim.id)}
                    className="p-2 text-lol-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Scrims */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Historique
        </h2>
        {pastScrims.length === 0 ? (
          <div className="text-center py-8 bg-lol-dark-800/30 rounded-xl border border-lol-dark-700/50">
            <p className="text-lol-dark-400">Aucun scrim passe</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {pastScrims.map(scrim => (
              <div
                key={scrim.id}
                className="p-4 bg-lol-dark-800/30 rounded-xl border border-lol-dark-700/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-white font-medium">vs {scrim.opponent}</h3>
                    <div className="text-sm text-lol-dark-400">
                      {new Date(scrim.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {scrim.result && (
                    <span className={`font-bold text-lg ${getResultColor(scrim.result)}`}>
                      {scrim.result}
                    </span>
                  )}
                  <button
                    onClick={() => openModal(scrim)}
                    className="p-2 text-lol-dark-400 hover:text-white hover:bg-lol-dark-700 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lol-dark-900 rounded-2xl border border-lol-dark-700 w-full max-w-md animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
              <h2 className="text-xl font-bold text-white">
                {editingScrim ? 'Modifier le scrim' : 'Nouveau scrim'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Adversaire
                </label>
                <input
                  type="text"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-3 text-white"
                  placeholder="Nom de l'equipe adverse"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-3 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Resultat (ex: 2-1)
                </label>
                <input
                  type="text"
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-3 text-white"
                  placeholder="2-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-3 text-white min-h-[80px]"
                  placeholder="Notes sur le scrim..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-lol-dark-700 hover:bg-lol-dark-600 text-white rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                >
                  {editingScrim ? 'Modifier' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Scrims
