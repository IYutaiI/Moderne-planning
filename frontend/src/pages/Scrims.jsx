import { useState, useEffect } from 'react'
import { Swords, Plus, Calendar, Clock, Trophy, X, Edit2, Trash2 } from 'lucide-react'

function Scrims() {
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
    // Load scrims from localStorage for now
    const saved = localStorage.getItem('scrims')
    if (saved) setScrims(JSON.parse(saved))
  }, [])

  const saveScrims = (newScrims) => {
    setScrims(newScrims)
    localStorage.setItem('scrims', JSON.stringify(newScrims))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingScrim) {
      const updated = scrims.map(s =>
        s.id === editingScrim.id ? { ...formData, id: s.id } : s
      )
      saveScrims(updated)
    } else {
      const newScrim = { ...formData, id: Date.now() }
      saveScrims([...scrims, newScrim])
    }
    closeModal()
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer ce scrim ?')) {
      saveScrims(scrims.filter(s => s.id !== id))
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
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Scrims a venir
        </h2>
        {upcomingScrims.length === 0 ? (
          <div className="text-center py-8 bg-lol-dark-800/30 rounded-xl">
            <Swords className="w-12 h-12 text-lol-dark-600 mx-auto mb-3" />
            <p className="text-lol-dark-400">Aucun scrim prevu</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingScrims.map(scrim => (
              <div
                key={scrim.id}
                className="group flex items-center justify-between p-4 bg-lol-dark-800/50 rounded-xl border border-lol-dark-700/50 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Swords className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">vs {scrim.opponent}</h3>
                    <div className="flex items-center gap-3 text-sm text-lol-dark-400">
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
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(scrim)}
                    className="p-2 rounded-lg bg-lol-dark-700 hover:bg-lol-dark-600 text-lol-dark-300 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(scrim.id)}
                    className="p-2 rounded-lg bg-lol-dark-700 hover:bg-red-500/20 text-lol-dark-300 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Scrims */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-lol-gold-400" />
          Historique
        </h2>
        {pastScrims.length === 0 ? (
          <div className="text-center py-8 bg-lol-dark-800/30 rounded-xl">
            <p className="text-lol-dark-400">Aucun historique</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {pastScrims.map(scrim => (
              <div
                key={scrim.id}
                className="group flex items-center justify-between p-4 bg-lol-dark-800/30 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm text-lol-dark-500">
                      {new Date(scrim.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">vs {scrim.opponent}</h3>
                    {scrim.notes && (
                      <p className="text-sm text-lol-dark-400">{scrim.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {scrim.result && (
                    <span className={`text-xl font-bold ${getResultColor(scrim.result)}`}>
                      {scrim.result}
                    </span>
                  )}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(scrim)}
                      className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-600 w-full max-w-md animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
              <h2 className="text-xl font-bold text-white">
                {editingScrim ? 'Modifier le scrim' : 'Nouveau scrim'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Adversaire *
                </label>
                <input
                  type="text"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  className="input"
                  placeholder="G2 Academy, Vitality.Bee..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">Heure</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input"
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
                  className="input"
                  placeholder="2-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input min-h-[80px]"
                  placeholder="Notes sur le scrim..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium">
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
