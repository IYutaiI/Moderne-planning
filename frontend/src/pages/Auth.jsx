import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Gamepad2, Mail, Lock, User, AlertCircle } from 'lucide-react'

function Auth() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas')
        }
        await register(formData.username, formData.email, formData.password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="min-h-screen bg-lol-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 mb-4">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-purple-400">NexusManager</h1>
          <p className="text-lol-dark-400 mt-2">Gestionnaire d'equipe LoL</p>
        </div>

        {/* Form Card */}
        <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-700 p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lol-dark-500" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none"
                    placeholder="Pseudo"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lol-dark-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none"
                  placeholder="exemple@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lol-dark-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lol-dark-500" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-lol-dark-500 focus:border-purple-500 focus:outline-none"
                    placeholder="••••••••"
                    required={!isLogin}
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors mt-6"
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'S\'inscrire'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-sm text-lol-dark-400 hover:text-purple-400 transition-colors"
            >
              {isLogin ? 'Pas de compte ? S\'inscrire' : 'Deja un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
