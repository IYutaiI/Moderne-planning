import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTeam } from '../context/TeamContext'
import { KeyRound, Users, Star, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

function TeamJoin({ onBack }) {
  const { user, authFetch } = useAuth()
  const { refreshTeams } = useTeam()
  const [joinCode, setJoinCode] = useState('')
  const [membershipType, setMembershipType] = useState('sub')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

      // Return to team selection after delay
      setTimeout(() => {
        onBack?.()
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isPlayer = user?.role === 'joueur'

  return (
    <div className="min-h-screen bg-lol-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Rejoindre une equipe</h1>
          <p className="text-lol-dark-400 mt-2">Entrez le code d'invitation de l'equipe</p>
        </div>

        {/* Form Card */}
        <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-700 p-8">
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

          <form onSubmit={handleJoin} className="space-y-6">
            {/* Join Code Input */}
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

            {/* Membership Type (only for players) */}
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
                <p className="text-xs text-lol-dark-500 mt-2">
                  Vous ne pouvez avoir qu'une seule equipe principale.
                </p>
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

          {onBack && (
            <button
              onClick={onBack}
              className="w-full mt-4 flex items-center justify-center gap-2 text-lol-dark-400 hover:text-white transition-colors"
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
