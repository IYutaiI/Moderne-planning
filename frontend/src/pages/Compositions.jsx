import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Layers, Plus, Edit2, Trash2, X, Search } from 'lucide-react'

const ROLES = [
  { key: 'top', label: 'Toplane' },
  { key: 'jungle', label: 'Jungle' },
  { key: 'mid', label: 'Midlane' },
  { key: 'adc', label: 'Ad carry' },
  { key: 'support', label: 'Support' }
]

const DDRAGON_VERSION = '14.24.1'
const getChampionIcon = (championId) =>
  `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championId}.png`

function Compositions() {
  const [strategies, setStrategies] = useState([])
  const [champions, setChampions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    champions: { top: [], jungle: [], mid: [], adc: [], support: [] },
    bans: []
  })
  const [activeTab, setActiveTab] = useState('picks')
  const [filterRole, setFilterRole] = useState('all')
  const [targetRole, setTargetRole] = useState('top')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchChampions()
    const saved = localStorage.getItem('compositions')
    if (saved) setStrategies(JSON.parse(saved))
  }, [])

  const fetchChampions = async () => {
    try {
      const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/fr_FR/champion.json`)
      const data = await res.json()
      const champList = Object.values(data.data).map(champ => ({
        id: champ.id,
        name: champ.name,
        tags: champ.tags
      })).sort((a, b) => a.name.localeCompare(b.name))
      setChampions(champList)
    } catch (error) {
      console.error('Erreur chargement champions:', error)
    }
  }

  const saveStrategies = (newStrategies) => {
    setStrategies(newStrategies)
    localStorage.setItem('compositions', JSON.stringify(newStrategies))
  }

  const handleSubmit = () => {
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
    setActiveTab('picks')
    setFilterRole('all')
    setTargetRole('top')
    setSearchQuery('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStrategy(null)
  }

  const toggleChampion = (role, championId) => {
    const current = formData.champions[role] || []
    const updated = current.includes(championId)
      ? current.filter(c => c !== championId)
      : [...current, championId].slice(0, 4)
    setFormData({
      ...formData,
      champions: { ...formData.champions, [role]: updated }
    })
  }

  const toggleBan = (championId) => {
    const current = formData.bans || []
    const updated = current.includes(championId)
      ? current.filter(c => c !== championId)
      : [...current, championId].slice(0, 10)
    setFormData({ ...formData, bans: updated })
  }

  const isChampionSelected = (championId) => {
    return Object.values(formData.champions).some(arr => arr.includes(championId))
  }

  const getChampionRoles = (championId) => {
    return Object.entries(formData.champions)
      .filter(([_, arr]) => arr.includes(championId))
      .map(([role]) => role)
  }

  const getTotalChampions = (strategy) => {
    return Object.values(strategy.champions).reduce((sum, arr) => sum + arr.length, 0)
  }

  const getChampionName = (championId) => {
    const champ = champions.find(c => c.id === championId)
    return champ ? champ.name : championId
  }

  const filteredChampions = champions.filter(champ => {
    const matchesSearch = champ.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white italic">Mes Strategies</h1>
          <p className="text-sm text-purple-400 uppercase tracking-wider">Configurations tactiques officielles</p>
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
        <div className="text-center py-16 bg-lol-dark-800/30 rounded-xl border border-lol-dark-700/50">
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
                  <p className="text-sm text-lol-dark-400 uppercase">
                    Mis a jour {strategy.updatedAt ? new Date(strategy.updatedAt).toLocaleDateString('fr-FR') : 'N/A'} • {getTotalChampions(strategy)} champions
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(strategy)}
                    className="p-3 rounded-full bg-lol-dark-700 hover:bg-lol-dark-600 text-white border border-lol-dark-600"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(strategy.id)}
                    className="p-3 rounded-full bg-lol-dark-700 hover:bg-red-500/20 text-white hover:text-red-400 border border-lol-dark-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Champions by Role - Vertical Layout */}
              <div className="flex justify-center gap-8 mb-6">
                {ROLES.map(role => {
                  const champs = strategy.champions[role.key] || []

                  return (
                    <div key={role.key} className="text-center">
                      <p className="text-xs text-lol-dark-400 mb-3 uppercase font-medium">{role.label}</p>
                      <div className="flex flex-col items-center gap-2">
                        {/* Main champion - larger */}
                        {champs[0] ? (
                          <img
                            src={getChampionIcon(champs[0])}
                            alt={getChampionName(champs[0])}
                            className="w-16 h-16 rounded-full border-2 border-purple-500"
                            title={getChampionName(champs[0])}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-lol-dark-700/50 border-2 border-dashed border-lol-dark-600"></div>
                        )}
                        {/* Secondary champions - smaller, stacked */}
                        <div className="flex flex-col gap-1">
                          {[1, 2, 3].map(index => (
                            champs[index] ? (
                              <img
                                key={index}
                                src={getChampionIcon(champs[index])}
                                alt={getChampionName(champs[index])}
                                className="w-10 h-10 rounded-full border border-lol-dark-600"
                                title={getChampionName(champs[index])}
                              />
                            ) : (
                              <div
                                key={index}
                                className="w-10 h-10 rounded-full bg-lol-dark-700/30 border border-dashed border-lol-dark-600/50"
                              ></div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bans */}
              {strategy.bans && strategy.bans.length > 0 && (
                <div className="pt-4 border-t border-lol-dark-700/50 flex items-center justify-center gap-4">
                  <p className="text-xs text-lol-dark-500 uppercase">Bans</p>
                  <div className="flex gap-2 flex-wrap">
                    {strategy.bans.map(champ => (
                      <div key={champ} className="relative">
                        <img
                          src={getChampionIcon(champ)}
                          alt={getChampionName(champ)}
                          className="w-10 h-10 rounded-full opacity-50 grayscale"
                          title={getChampionName(champ)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-500 rotate-45 transform"></div>
                        </div>
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
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lol-dark-900 rounded-2xl border border-lol-dark-700 w-full max-w-6xl max-h-[90vh] flex flex-col animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold text-white bg-transparent border-none outline-none placeholder-lol-dark-500"
                  placeholder="Nom de la strategie..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                >
                  {editingStrategy ? 'Sauvegarder' : 'Creer'}
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Selected Champions Display - 4 vertical picks per role */}
            <div className="p-6 border-b border-lol-dark-700 bg-lol-dark-800/30">
              <div className="flex justify-center gap-12">
                {ROLES.map(role => {
                  const champs = formData.champions[role.key] || []
                  const isTargetRole = targetRole === role.key && activeTab === 'picks'

                  return (
                    <div
                      key={role.key}
                      className={`text-center cursor-pointer transition-all ${
                        isTargetRole ? 'transform scale-105' : ''
                      }`}
                      onClick={() => {
                        if (activeTab === 'picks') {
                          setTargetRole(role.key)
                        }
                      }}
                    >
                      <p className={`text-xs mb-3 uppercase font-medium tracking-wider ${
                        isTargetRole ? 'text-purple-400' : 'text-lol-dark-400'
                      }`}>
                        {role.label}
                      </p>
                      <div className="flex flex-col items-center gap-2">
                        {/* Main champion - larger */}
                        <div className={`relative ${isTargetRole ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-lol-dark-900 rounded-full' : ''}`}>
                          {champs[0] ? (
                            <img
                              src={getChampionIcon(champs[0])}
                              alt={getChampionName(champs[0])}
                              className="w-16 h-16 rounded-full border-2 border-purple-500 cursor-pointer hover:opacity-80"
                              title={`${getChampionName(champs[0])} - Cliquez pour retirer`}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleChampion(role.key, champs[0])
                              }}
                            />
                          ) : (
                            <div className={`w-16 h-16 rounded-full bg-lol-dark-700/50 border-2 border-dashed ${
                              isTargetRole ? 'border-purple-500' : 'border-lol-dark-600'
                            }`}></div>
                          )}
                        </div>
                        {/* Secondary champions - smaller, stacked vertically */}
                        <div className="flex flex-col gap-1">
                          {[1, 2, 3].map(index => (
                            champs[index] ? (
                              <img
                                key={index}
                                src={getChampionIcon(champs[index])}
                                alt={getChampionName(champs[index])}
                                className="w-10 h-10 rounded-full border border-lol-dark-600 cursor-pointer hover:opacity-80"
                                title={`${getChampionName(champs[index])} - Cliquez pour retirer`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleChampion(role.key, champs[index])
                                }}
                              />
                            ) : (
                              <div
                                key={index}
                                className={`w-10 h-10 rounded-full bg-lol-dark-700/30 border border-dashed ${
                                  isTargetRole ? 'border-purple-500/50' : 'border-lol-dark-600/50'
                                }`}
                              ></div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bans Display */}
              <div className="mt-6 pt-4 border-t border-lol-dark-700/50 flex items-center justify-center gap-4">
                <p className="text-xs text-lol-dark-500 uppercase">Bans</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {formData.bans && formData.bans.length > 0 ? (
                    formData.bans.map(champ => (
                      <div key={champ} className="relative cursor-pointer" onClick={() => toggleBan(champ)}>
                        <img
                          src={getChampionIcon(champ)}
                          alt={getChampionName(champ)}
                          className="w-10 h-10 rounded-full opacity-50 grayscale hover:opacity-70"
                          title={`${getChampionName(champ)} - Cliquez pour retirer`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-lol-dark-500">Aucun ban selectionne</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 py-3 border-b border-lol-dark-700">
              <button
                onClick={() => setActiveTab('picks')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  activeTab === 'picks'
                    ? 'text-white border-purple-500'
                    : 'text-lol-dark-400 border-transparent hover:text-white'
                }`}
              >
                Picks
              </button>
              <button
                onClick={() => setActiveTab('bans')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  activeTab === 'bans'
                    ? 'text-white border-red-500'
                    : 'text-lol-dark-400 border-transparent hover:text-white'
                }`}
              >
                Bans
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-lol-dark-700">
              {activeTab === 'picks' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-lol-dark-400">Role:</span>
                  <select
                    value={filterRole}
                    onChange={(e) => {
                      setFilterRole(e.target.value)
                      if (e.target.value !== 'all') {
                        setTargetRole(e.target.value)
                      }
                    }}
                    className="bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="all">All</option>
                    {ROLES.map(role => (
                      <option key={role.key} value={role.key}>{role.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lol-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search champion..."
                  className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-lol-dark-400"
                />
              </div>
              {activeTab === 'picks' && filterRole === 'all' && (
                <p className="text-xs text-purple-400">
                  Cliquez sur un role ci-dessus pour le selectionner ({ROLES.find(r => r.key === targetRole)?.label})
                </p>
              )}
            </div>

            {/* Champion Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-12 gap-2">
                {filteredChampions.map(champ => {
                  const isSelectedForPicks = isChampionSelected(champ.id)
                  const isBanned = formData.bans?.includes(champ.id)
                  const isSelected = activeTab === 'picks' ? isSelectedForPicks : isBanned
                  const selectedRoles = getChampionRoles(champ.id)

                  return (
                    <button
                      key={champ.id}
                      onClick={() => {
                        if (activeTab === 'picks') {
                          toggleChampion(targetRole, champ.id)
                        } else {
                          toggleBan(champ.id)
                        }
                      }}
                      className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                        isSelected
                          ? activeTab === 'bans'
                            ? 'bg-red-500/20 ring-2 ring-red-500'
                            : 'bg-purple-500/20 ring-2 ring-purple-500'
                          : 'hover:bg-lol-dark-700'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={getChampionIcon(champ.id)}
                          alt={champ.name}
                          className={`w-12 h-12 rounded-full ${isBanned && activeTab === 'picks' ? 'opacity-30 grayscale' : ''}`}
                        />
                        {isBanned && activeTab === 'picks' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                          </div>
                        )}
                        {activeTab === 'picks' && selectedRoles.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">{selectedRoles.length}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-lol-dark-300 mt-1 truncate w-full text-center">{champ.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Compositions
