import { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, X, Save, ExternalLink } from 'lucide-react'

const ROLES = [
  { value: 'TOP', label: 'TOP', color: 'text-red-400' },
  { value: 'JNG', label: 'JNG', color: 'text-teal-400' },
  { value: 'MID', label: 'MID', color: 'text-blue-400' },
  { value: 'ADC', label: 'ADC', color: 'text-yellow-400' },
  { value: 'SUP', label: 'SUP', color: 'text-purple-400' }
]

const RANKS = [
  'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum',
  'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'
]

function Members() {
  const [members, setMembers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    pseudo: '',
    riot_id: '',
    discord: '',
    role: 'MID',
    rank: 'Gold',
    main_champions: ''
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      setMembers(await res.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members'
      const method = editingMember ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      fetchMembers()
      closeModal()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce membre ?')) return
    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE' })
      fetchMembers()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        pseudo: member.pseudo,
        riot_id: member.riot_id || member.discord || '',
        discord: member.discord || '',
        role: member.role || 'MID',
        rank: member.rank || 'Gold',
        main_champions: member.main_champions || ''
      })
    } else {
      setEditingMember(null)
      setFormData({
        pseudo: '',
        riot_id: '',
        discord: '',
        role: 'MID',
        rank: 'Gold',
        main_champions: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMember(null)
  }

  const getRoleData = (role) => {
    return ROLES.find(r => r.value === role) || ROLES[2]
  }

  const openOpggMulti = () => {
    const names = members
      .filter(m => m.riot_id || m.discord)
      .map(m => (m.riot_id || m.discord).replace('#', '-'))
      .join(',')
    if (names) {
      window.open(`https://www.op.gg/multisearch/euw?summoners=${encodeURIComponent(names)}`, '_blank')
    }
  }

  // Trier les membres par rôle
  const roleOrder = ['TOP', 'JNG', 'MID', 'ADC', 'SUP']
  const sortedMembers = [...members].sort((a, b) => {
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
  })

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Effectif</h1>
        <div className="flex items-center gap-3">
          {members.length > 0 && (
            <button
              onClick={openOpggMulti}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5383e8] hover:bg-[#4171d6] text-white font-medium transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              OP.GG Multi
            </button>
          )}
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Members Grid */}
      {members.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-20 h-20 text-lol-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucun membre</h3>
          <p className="text-lol-dark-400 mb-6">Commencez par ajouter les membres de votre equipe</p>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="w-5 h-5 inline mr-2" />
            Ajouter le premier membre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedMembers.map((member) => {
            const roleData = getRoleData(member.role)
            return (
              <div
                key={member.id}
                className="group relative bg-lol-dark-800/80 hover:bg-lol-dark-700/80 rounded-xl p-4 transition-all duration-200 border border-lol-dark-700/50 hover:border-lol-dark-600"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-lol-dark-700 flex items-center justify-center flex-shrink-0 border-2 border-lol-dark-600">
                    <Users className="w-7 h-7 text-lol-dark-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {member.pseudo}
                    </h3>
                    <p className="text-sm text-lol-dark-400 truncate">
                      {member.riot_id || member.discord || 'Pas de Riot ID'}
                    </p>
                    <p className={`text-sm font-bold mt-1 ${roleData.color}`}>
                      {roleData.label}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(member)}
                      className="p-2 rounded-lg bg-lol-dark-600 hover:bg-lol-dark-500 text-lol-dark-300 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 rounded-lg bg-lol-dark-600 hover:bg-red-500/30 text-lol-dark-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Extra info on hover */}
                {(member.rank || member.main_champions) && (
                  <div className="mt-3 pt-3 border-t border-lol-dark-700/50 flex items-center gap-3 text-sm">
                    {member.rank && (
                      <span className="px-2 py-1 rounded bg-lol-dark-700 text-lol-dark-300">
                        {member.rank}
                      </span>
                    )}
                    {member.main_champions && (
                      <span className="text-lol-dark-400 truncate">
                        {member.main_champions}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-600 w-full max-w-md mx-4 animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
              <h2 className="text-xl font-bold text-white">
                {editingMember ? 'Modifier le membre' : 'Nouveau membre'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Pseudo *
                </label>
                <input
                  type="text"
                  value={formData.pseudo}
                  onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
                  className="input"
                  placeholder="NexusPlayer1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Riot ID
                </label>
                <input
                  type="text"
                  value={formData.riot_id}
                  onChange={(e) => setFormData({ ...formData, riot_id: e.target.value })}
                  className="input"
                  placeholder="NexusPlayer1#EUW"
                />
                <p className="text-xs text-lol-dark-500 mt-1">Format: Pseudo#Tag (ex: Player#EUW)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Discord
                </label>
                <input
                  type="text"
                  value={formData.discord}
                  onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                  className="input"
                  placeholder="username"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="select"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                    Rang
                  </label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="select"
                  >
                    {RANKS.map((rank) => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Champions principaux
                </label>
                <input
                  type="text"
                  value={formData.main_champions}
                  onChange={(e) => setFormData({ ...formData, main_champions: e.target.value })}
                  className="input"
                  placeholder="Yasuo, Zed, Ahri..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingMember ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Members
