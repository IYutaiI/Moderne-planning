import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTeam } from '../context/TeamContext'
import {
  Settings, Users, Plus, Trash2, Copy, Check, RefreshCw,
  Shield, UserPlus, X, Mail, Crown, UserMinus, Eye
} from 'lucide-react'

function Admin() {
  const { user, authFetch } = useAuth()
  const { teams, currentTeam, createTeam, deleteTeam, refreshTeams } = useTeam()
  const [activeTab, setActiveTab] = useState('teams')
  const [teamMembers, setTeamMembers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamTag, setNewTeamTag] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (currentTeam) {
      fetchTeamMembers()
    }
  }, [currentTeam])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllUsers()
    }
  }, [user])

  const fetchTeamMembers = async () => {
    try {
      const res = await authFetch(`/api/teams/${currentTeam.id}`)
      const data = await res.json()
      setTeamMembers(data.members || [])
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const res = await authFetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setAllUsers(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const copyJoinCode = () => {
    if (currentTeam?.join_code) {
      navigator.clipboard.writeText(currentTeam.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createTeam(newTeamName, newTeamTag || newTeamName.substring(0, 3).toUpperCase())
      setShowCreateModal(false)
      setNewTeamName('')
      setNewTeamTag('')
      setSuccess('Equipe creee avec succes!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authFetch(`/api/teams/${currentTeam.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowInviteModal(false)
      setInviteEmail('')
      setSuccess('Invitation envoyee!')
      fetchTeamMembers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Retirer ce membre de l\'equipe?')) return
    try {
      await authFetch(`/api/teams/${currentTeam.id}/members/${userId}`, {
        method: 'DELETE'
      })
      fetchTeamMembers()
      setSuccess('Membre retire')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Supprimer cette equipe et toutes ses donnees?')) return
    try {
      await deleteTeam(teamId)
      setSuccess('Equipe supprimee')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Erreur lors de la suppression')
    }
  }

  const membershipLabels = {
    main: { label: 'Titulaire', color: 'text-yellow-400 bg-yellow-500/20' },
    sub: { label: 'Sub', color: 'text-blue-400 bg-blue-500/20' },
    manager: { label: 'Manager', color: 'text-purple-400 bg-purple-500/20' },
    coach: { label: 'Coach', color: 'text-green-400 bg-green-500/20' },
    owner: { label: 'Owner', color: 'text-red-400 bg-red-500/20' }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-purple-400" />
            Administration
          </h1>
          <p className="text-lol-dark-400">Gestion des equipes et membres</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouvelle equipe
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-lol-dark-800/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'teams' ? 'bg-purple-600 text-white' : 'text-lol-dark-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Mes Equipes
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'members' ? 'bg-purple-600 text-white' : 'text-lol-dark-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Membres
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-lol-dark-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Tous les utilisateurs
          </button>
        )}
      </div>

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="grid gap-4">
          {teams.length === 0 ? (
            <div className="text-center py-16 bg-lol-dark-800/30 rounded-xl border border-lol-dark-700/50">
              <Shield className="w-16 h-16 text-lol-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune equipe</h3>
              <p className="text-lol-dark-400">Creez votre premiere equipe pour commencer</p>
            </div>
          ) : (
            teams.map(team => (
              <div
                key={team.id}
                className={`p-6 rounded-xl border ${
                  currentTeam?.id === team.id
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-lol-dark-800/50 border-lol-dark-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{team.tag?.substring(0, 2)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{team.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-lol-dark-400">
                        <span>[{team.tag}]</span>
                        {team.membership_type && membershipLabels[team.membership_type] && (
                          <span className={`px-2 py-0.5 rounded text-xs ${membershipLabels[team.membership_type].color}`}>
                            {membershipLabels[team.membership_type].label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Join Code */}
                    <div className="bg-lol-dark-800 rounded-lg px-4 py-2">
                      <div className="text-xs text-lol-dark-500 mb-1">Code d'invitation</div>
                      <div className="flex items-center gap-2">
                        <code className="text-purple-400 font-mono">{team.join_code}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(team.join_code)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }}
                          className="p-1 hover:bg-lol-dark-700 rounded"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-lol-dark-400" />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="p-2 text-lol-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && currentTeam && (
        <div className="bg-lol-dark-800/50 rounded-xl border border-lol-dark-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              Membres de {currentTeam.name}
            </h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Inviter
            </button>
          </div>

          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-lol-dark-400">
              Aucun membre dans cette equipe
            </div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-lol-dark-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-lol-dark-700 flex items-center justify-center">
                      <Users className="w-5 h-5 text-lol-dark-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{member.username}</span>
                        {member.role === 'owner' && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="text-sm text-lol-dark-400">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {member.membership_type && membershipLabels[member.membership_type] && (
                      <span className={`px-3 py-1 rounded-lg text-sm ${membershipLabels[member.membership_type].color}`}>
                        {membershipLabels[member.membership_type].label}
                      </span>
                    )}
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="p-2 text-lol-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Users Tab (Admin only) */}
      {activeTab === 'users' && user?.role === 'admin' && (
        <div className="bg-lol-dark-800/50 rounded-xl border border-lol-dark-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Tous les utilisateurs</h3>
            <button
              onClick={fetchAllUsers}
              className="p-2 text-lol-dark-400 hover:text-white hover:bg-lol-dark-700 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-lol-dark-400 border-b border-lol-dark-700">
                <th className="pb-3">Utilisateur</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Inscription</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u.id} className="border-b border-lol-dark-700/50">
                  <td className="py-3 font-medium text-white">{u.username}</td>
                  <td className="py-3 text-lol-dark-300">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      u.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      u.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                      u.role === 'coach' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-lol-dark-400 text-sm">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lol-dark-900 rounded-2xl border border-lol-dark-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
              <h2 className="text-xl font-bold text-white">Creer une equipe</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-lol-dark-700 rounded-lg">
                <X className="w-6 h-6 text-lol-dark-400" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-lol-dark-400 mb-2">Nom de l'equipe</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-3 text-white"
                  placeholder="Team Nexus"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-lol-dark-400 mb-2">Tag</label>
                <input
                  type="text"
                  value={newTeamTag}
                  onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                  className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-3 text-white"
                  placeholder="TNX"
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
                  disabled={loading || !newTeamName}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-medium"
                >
                  {loading ? 'Creation...' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lol-dark-900 rounded-2xl border border-lol-dark-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
              <h2 className="text-xl font-bold text-white">Inviter un membre</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-lol-dark-700 rounded-lg">
                <X className="w-6 h-6 text-lol-dark-400" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-lol-dark-400 mb-2">Email du joueur</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lol-dark-500" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg pl-11 pr-4 py-3 text-white"
                    placeholder="joueur@email.com"
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-lol-dark-500">
                Ou partagez le code d'invitation: <code className="text-purple-400">{currentTeam?.join_code}</code>
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-lol-dark-700 hover:bg-lol-dark-600 text-white rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !inviteEmail}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg font-medium"
                >
                  {loading ? 'Envoi...' : 'Inviter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
