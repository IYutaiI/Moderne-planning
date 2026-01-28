import { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, X, Save } from 'lucide-react'

const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
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
    discord: '',
    role: 'Mid',
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
        discord: member.discord || '',
        role: member.role,
        rank: member.rank || 'Gold',
        main_champions: member.main_champions || ''
      })
    } else {
      setEditingMember(null)
      setFormData({
        pseudo: '',
        discord: '',
        role: 'Mid',
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

  const getRoleColor = (role) => {
    const colors = {
      Top: 'bg-red-500/20 text-red-400 border-red-500/30',
      Jungle: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      Mid: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ADC: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Support: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
    return colors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getRoleIcon = (role) => {
    const icons = { Top: '🛡️', Jungle: '🌲', Mid: '⚡', ADC: '🎯', Support: '💚' }
    return icons[role] || '🎮'
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Membres</h1>
          <p className="text-lol-dark-400">Gérez les membres de votre équipe</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ajouter un membre
        </button>
      </div>

      {/* Members Grid */}
      {members.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-lol-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucun membre</h3>
          <p className="text-lol-dark-400 mb-6">Commencez par ajouter les membres de votre équipe</p>
          <button onClick={() => openModal()} className="btn-gold">
            <Plus className="w-5 h-5 inline mr-2" />
            Ajouter le premier membre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member.id} className="card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-lol-dark-600 to-lol-dark-700 flex items-center justify-center text-2xl">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{member.pseudo}</h3>
                    {member.discord && (
                      <p className="text-sm text-lol-dark-400">{member.discord}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(member)}
                    className="p-2 rounded-lg bg-lol-dark-700 hover:bg-lol-dark-600 text-lol-dark-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 rounded-lg bg-lol-dark-700 hover:bg-red-500/20 text-lol-dark-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-lg border ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                  {member.rank && (
                    <span className="px-3 py-1 text-sm font-medium rounded-lg bg-lol-dark-700 text-lol-dark-300">
                      {member.rank}
                    </span>
                  )}
                </div>

                {member.main_champions && (
                  <div>
                    <p className="text-xs text-lol-dark-500 mb-1">Champions principaux</p>
                    <p className="text-sm text-lol-dark-300">{member.main_champions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-600 w-full max-w-md animate-fadeIn">
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
                  placeholder="Nom du joueur"
                  required
                />
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
                  placeholder="username#0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                    Rôle *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="select"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
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
