import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTeam } from '../context/TeamContext'
import { KeyRound, Users, Star, AlertCircle, CheckCircle, ArrowLeft, Search, Plus, Send, Clock, Shield } from 'lucide-react'

function TeamJoin({ onBack }) {
  const { user, authFetch } = useAuth()
  const { refreshTeams } = useTeam()
  const [activeTab, setActiveTab] = useState('code') // 'code', 'browse', 'create', 'requests'
  const [joinCode, setJoinCode] = useState('')
  const [membershipType, setMembershipType] = useState('sub')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [teams, setTeams] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamTag, setNewTeamTag] = useState('')
  const [requestMessage, setRequestMessage] = useState('')

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchTeams()
    } else if (activeTab === 'requests') {
      fetchMyRequests()
    }
  }, [activeTab])

  const fetchTeams = async () => {
    try {
      const res = await authFetch('/api/teams/browse')
      const data = await res.json()
      setTeams(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchMyRequests = async () => {
    try {
      const res = await authFetch('/api/team-requests/mine')
      const data = await res.json()
      setMyRequests(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await authFetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          join_code: joinCode,
          membership_type: membershipType
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion')
      }

      setSuccess(`Vous avez rejoint ${data.team.name} en tant que ${membershipType === 'main' ? 'titulaire' : 'remplacant'} !`)
      setJoinCode('')
      refreshTeams()

      setTimeout(() => {
        onBack?.()
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestJoin = async (teamId, teamName) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await authFetch('/api/team-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: 'join',
          team_id: teamId,
          message: `Demande pour rejoindre ${teamName}`
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la demande')
      }

      setSuccess('Demande envoyee ! Un administrateur la traitera prochainement.')
      fetchTeams()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await authFetch('/api/team-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: 'create',
          team_name: newTeamName,
          team_tag: newTeamTag || newTeamName.substring(0, 3).toUpperCase(),
          message: requestMessage
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la demande')
      }

      setSuccess('Demande de creation envoyee ! Un administrateur la traitera prochainement.')
      setNewTeamName('')
      setNewTeamTag('')
      setRequestMessage('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRequest = async (requestId) => {
    try {
      await authFetch(`/api/team-requests/${requestId}`, { method: 'DELETE' })
      fetchMyRequests()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const isPlayer = user?.role === 'joueur'
  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">En attente</span>
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Approuvee</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Refusee</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-lol-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Rejoindre une equipe</h1>
          <p className="text-lol-dark-400 mt-2">Utilisez un code ou parcourez les equipes</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-lol-dark-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-green-600 text-white'
                : 'text-lol-dark-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4 inline mr-1" />
            Code
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'browse'
                ? 'bg-green-600 text-white'
                : 'text-lol-dark-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 inline mr-1" />
            Parcourir
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-green-600 text-white'
                : 'text-lol-dark-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Proposer
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-green-600 text-white'
                : 'text-lol-dark-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-1" />
            Mes demandes
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-700 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3 text-green-400">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Tab: Join by Code */}
          {activeTab === 'code' && (
            <form onSubmit={handleJoin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Code d'invitation
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lol-dark-500" />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none tracking-widest font-mono text-lg"
                    placeholder="XXXXXXXX"
                    maxLength={8}
                    required
                  />
                </div>
              </div>

              {isPlayer && (
                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-3">
                    Type de poste
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMembershipType('main')}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        membershipType === 'main'
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                          : 'border-lol-dark-600 bg-lol-dark-700 text-lol-dark-300 hover:border-lol-dark-500'
                      }`}
                    >
                      <Star className="w-5 h-5 mb-2" />
                      <div className="font-medium">Titulaire</div>
                      <div className="text-xs text-lol-dark-500 mt-1">Equipe principale</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMembershipType('sub')}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        membershipType === 'sub'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-lol-dark-600 bg-lol-dark-700 text-lol-dark-300 hover:border-lol-dark-500'
                      }`}
                    >
                      <Users className="w-5 h-5 mb-2" />
                      <div className="font-medium">Remplacant</div>
                      <div className="text-xs text-lol-dark-500 mt-1">Sub pour cette equipe</div>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !joinCode}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
              >
                {loading ? 'Connexion...' : 'Rejoindre l\'equipe'}
              </button>
            </form>
          )}

          {/* Tab: Browse Teams */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lol-dark-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Rechercher une equipe..."
                />
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredTeams.length === 0 ? (
                  <p className="text-center text-lol-dark-400 py-8">Aucune equipe trouvee</p>
                ) : (
                  filteredTeams.map(team => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 bg-lol-dark-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{team.name}</div>
                          <div className="text-xs text-lol-dark-400">[{team.tag}] • {team.member_count} membres</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRequestJoin(team.id, team.name)}
                        disabled={loading}
                        className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <p className="text-xs text-lol-dark-500 text-center">
                Envoyez une demande pour rejoindre une equipe. Un administrateur devra l'approuver.
              </p>
            </div>
          )}

          {/* Tab: Propose Team Creation */}
          {activeTab === 'create' && (
            <form onSubmit={handleRequestCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Nom de l'equipe
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none"
                  placeholder="Mon equipe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Tag (3-5 caracteres)
                </label>
                <input
                  type="text"
                  value={newTeamTag}
                  onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                  className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none"
                  placeholder="TAG"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none min-h-[80px]"
                  placeholder="Decrivez votre equipe..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || !newTeamName}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
              >
                {loading ? 'Envoi...' : 'Envoyer la demande de creation'}
              </button>

              <p className="text-xs text-lol-dark-500 text-center">
                Un administrateur devra approuver votre demande avant que l'equipe soit creee.
              </p>
            </form>
          )}

          {/* Tab: My Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {myRequests.length === 0 ? (
                <p className="text-center text-lol-dark-400 py-8">Aucune demande en cours</p>
              ) : (
                myRequests.map(request => (
                  <div
                    key={request.id}
                    className="p-4 bg-lol-dark-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        {request.request_type === 'join'
                          ? `Rejoindre ${request.existing_team_name || 'equipe'}`
                          : `Creer "${request.team_name}"`
                        }
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-xs text-lol-dark-400 mb-2">
                      {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    {request.message && (
                      <p className="text-sm text-lol-dark-300 mb-2">{request.message}</p>
                    )}
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Annuler la demande
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="w-full mt-6 flex items-center justify-center gap-2 text-lol-dark-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamJoin
