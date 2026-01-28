import { useState, useEffect } from 'react'
import { Layers, Plus, Edit2, Trash2, X } from 'lucide-react'

const ROLES = ['Top Lane', 'Jungle', 'Mid Lane', 'Bot Lane (ADC)', 'Support']
const CHAMPIONS = [
  'Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Ambessa', 'Amumu', 'Anivia', 'Annie',
  'Aphelios', 'Ashe', 'Aurelion Sol', 'Aurora', 'Azir', 'Bard', 'Belveth', 'Blitzcrank',
  'Brand', 'Braum', 'Briar', 'Caitlyn', 'Camille', 'Cassiopeia', 'Chogath', 'Corki',
  'Darius', 'Diana', 'Dr. Mundo', 'Draven', 'Ekko', 'Elise', 'Evelynn', 'Ezreal',
  'Fiddlesticks', 'Fiora', 'Fizz', 'Galio', 'Gangplank', 'Garen', 'Gnar', 'Gragas',
  'Graves', 'Gwen', 'Hecarim', 'Heimerdinger', 'Hwei', 'Illaoi', 'Irelia', 'Ivern',
  'Janna', 'Jarvan IV', 'Jax', 'Jayce', 'Jhin', 'Jinx', 'Kaisa', 'Kalista', 'Karma',
  'Karthus', 'Kassadin', 'Katarina', 'Kayle', 'Kayn', 'Kennen', 'Khazix', 'Kindred',
  'Kled', 'Kogmaw', 'Ksante', 'Leblanc', 'Lee Sin', 'Leona', 'Lillia', 'Lissandra',
  'Lucian', 'Lulu', 'Lux', 'Malphite', 'Malzahar', 'Maokai', 'Master Yi', 'Milio',
  'Miss Fortune', 'Mordekaiser', 'Morgana', 'Naafiri', 'Nami', 'Nasus', 'Nautilus',
  'Neeko', 'Nidalee', 'Nilah', 'Nocturne', 'Nunu', 'Olaf', 'Orianna', 'Ornn', 'Pantheon',
  'Poppy', 'Pyke', 'Qiyana', 'Quinn', 'Rakan', 'Rammus', 'Rek\'Sai', 'Rell', 'Renata',
  'Renekton', 'Rengar', 'Riven', 'Rumble', 'Ryze', 'Samira', 'Sejuani', 'Senna', 'Seraphine',
  'Sett', 'Shaco', 'Shen', 'Shyvana', 'Singed', 'Sion', 'Sivir', 'Skarner', 'Smolder',
  'Sona', 'Soraka', 'Swain', 'Sylas', 'Syndra', 'Tahm Kench', 'Taliyah', 'Talon', 'Taric',
  'Teemo', 'Thresh', 'Tristana', 'Trundle', 'Tryndamere', 'Twisted Fate', 'Twitch', 'Udyr',
  'Urgot', 'Varus', 'Vayne', 'Veigar', 'Vel\'Koz', 'Vex', 'Vi', 'Viego', 'Viktor', 'Vladimir',
  'Volibear', 'Warwick', 'Wukong', 'Xayah', 'Xerath', 'Xin Zhao', 'Yasuo', 'Yone', 'Yorick',
  'Yuumi', 'Zac', 'Zed', 'Zeri', 'Ziggs', 'Zilean', 'Zoe', 'Zyra'
]

function Compositions() {
  const [strategies, setStrategies] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    champions: { top: [], jungle: [], mid: [], adc: [], support: [] },
    bans: []
  })

  useEffect(() => {
    const saved = localStorage.getItem('compositions')
    if (saved) setStrategies(JSON.parse(saved))
  }, [])

  const saveStrategies = (newStrategies) => {
    setStrategies(newStrategies)
    localStorage.setItem('compositions', JSON.stringify(newStrategies))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const now = new Date().toISOString()
    if (editingStrategy) {
      const updated = strategies.map(s =>
        s.id === editingStrategy.id ? { ...formData, id: s.id, updatedAt: now } : s
      )
      saveStrategies(updated)
    } else {
      const newStrategy = { ...formData, id: Date.now(), createdAt: now, updatedAt: now }
      saveStrategies([...strategies, newStrategy])
    }
    closeModal()
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer cette strategie ?')) {
      saveStrategies(strategies.filter(s => s.id !== id))
    }
  }

  const openModal = (strategy = null) => {
    if (strategy) {
      setEditingStrategy(strategy)
      setFormData(strategy)
    } else {
      setEditingStrategy(null)
      setFormData({
        name: '',
        champions: { top: [], jungle: [], mid: [], adc: [], support: [] },
        bans: []
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStrategy(null)
  }

  const toggleChampion = (role, champion) => {
    const current = formData.champions[role] || []
    const updated = current.includes(champion)
      ? current.filter(c => c !== champion)
      : [...current, champion].slice(0, 4)
    setFormData({
      ...formData,
      champions: { ...formData.champions, [role]: updated }
    })
  }

  const toggleBan = (champion) => {
    const current = formData.bans || []
    const updated = current.includes(champion)
      ? current.filter(c => c !== champion)
      : [...current, champion].slice(0, 10)
    setFormData({ ...formData, bans: updated })
  }

  const getTotalChampions = (strategy) => {
    return Object.values(strategy.champions).reduce((sum, arr) => sum + arr.length, 0)
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white italic">Mes Strategies</h1>
          <p className="text-sm text-purple-400 uppercase tracking-wide">Configurations tactiques officielles</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-white text-white font-medium hover:bg-white hover:text-lol-dark-900 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Strategie
        </button>
      </div>

      {/* Strategies List */}
      {strategies.length === 0 ? (
        <div className="text-center py-16 bg-lol-dark-800/30 rounded-xl">
          <Layers className="w-16 h-16 text-lol-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucune strategie</h3>
          <p className="text-lol-dark-400 mb-6">Creez votre premiere composition d'equipe</p>
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
          >
            Creer une strategie
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {strategies.map(strategy => (
            <div
              key={strategy.id}
              className="p-6 bg-lol-dark-800/50 rounded-2xl border border-lol-dark-700/50"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{strategy.name}</h2>
                  <p className="text-sm text-lol-dark-400">
                    MIS A JOUR {strategy.updatedAt ? new Date(strategy.updatedAt).toLocaleDateString('fr-FR') : 'N/A'} - {getTotalChampions(strategy)} CHAMPIONS
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(strategy)}
                    className="p-3 rounded-full bg-lol-dark-700 hover:bg-lol-dark-600 text-white"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(strategy.id)}
                    className="p-3 rounded-full bg-lol-dark-700 hover:bg-red-500/20 text-white hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Champions by Role */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                {ROLES.map((role, idx) => {
                  const roleKey = ['top', 'jungle', 'mid', 'adc', 'support'][idx]
                  const champs = strategy.champions[roleKey] || []
                  return (
                    <div key={role} className="text-center">
                      <p className="text-xs text-lol-dark-400 mb-3">{role}</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {champs.length > 0 ? (
                          champs.map(champ => (
                            <div
                              key={champ}
                              className="w-14 h-14 rounded-full bg-lol-dark-700 flex items-center justify-center text-xs text-white border-2 border-lol-dark-600"
                              title={champ}
                            >
                              {champ.substring(0, 2)}
                            </div>
                          ))
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-lol-dark-700/50 border-2 border-dashed border-lol-dark-600"></div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bans */}
              {strategy.bans && strategy.bans.length > 0 && (
                <div className="pt-4 border-t border-lol-dark-700">
                  <p className="text-xs text-lol-dark-500 uppercase mb-3">Bans Prioritaires</p>
                  <div className="flex gap-2 flex-wrap">
                    {strategy.bans.map(champ => (
                      <div
                        key={champ}
                        className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-xs text-red-400"
                        title={champ}
                      >
                        {champ.substring(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-600 w-full max-w-4xl animate-fadeIn my-8">
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
              <h2 className="text-xl font-bold text-white">
                {editingStrategy ? 'Modifier la strategie' : 'Nouvelle strategie'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Nom de la strategie *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Strategie Standard, Comp Teamfight..."
                  required
                />
              </div>

              {/* Champions by Role */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-lol-dark-300">Champions par role (max 4)</p>
                {ROLES.map((role, idx) => {
                  const roleKey = ['top', 'jungle', 'mid', 'adc', 'support'][idx]
                  const selected = formData.champions[roleKey] || []
                  return (
                    <div key={role} className="space-y-2">
                      <p className="text-xs text-lol-dark-400">{role}</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.map(champ => (
                          <button
                            key={champ}
                            type="button"
                            onClick={() => toggleChampion(roleKey, champ)}
                            className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-lg text-sm border border-purple-500/50"
                          >
                            {champ} ×
                          </button>
                        ))}
                        <select
                          className="select text-sm"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) toggleChampion(roleKey, e.target.value)
                          }}
                        >
                          <option value="">+ Ajouter</option>
                          {CHAMPIONS.filter(c => !selected.includes(c)).map(champ => (
                            <option key={champ} value={champ}>{champ}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bans */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-lol-dark-300">Bans prioritaires (max 10)</p>
                <div className="flex flex-wrap gap-2">
                  {(formData.bans || []).map(champ => (
                    <button
                      key={champ}
                      type="button"
                      onClick={() => toggleBan(champ)}
                      className="px-3 py-1 bg-red-500/30 text-red-300 rounded-lg text-sm border border-red-500/50"
                    >
                      {champ} ×
                    </button>
                  ))}
                  <select
                    className="select text-sm"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) toggleBan(e.target.value)
                    }}
                  >
                    <option value="">+ Ajouter ban</option>
                    {CHAMPIONS.filter(c => !(formData.bans || []).includes(c)).map(champ => (
                      <option key={champ} value={champ}>{champ}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium">
                  {editingStrategy ? 'Modifier' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Compositions
