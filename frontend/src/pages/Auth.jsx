import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Gamepad2, Mail, Lock, User, AlertCircle, Users, Trophy, ClipboardList, Shield, Zap } from 'lucide-react'

function Auth() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'joueur'
  })

  const testAccounts = [
    { email: 'joueur@test.com', password: 'test123', label: 'Joueur', color: 'bg-yellow-600 hover:bg-yellow-500', icon: Trophy },
    { email: 'coach@test.com', password: 'test123', label: 'Coach', color: 'bg-green-600 hover:bg-green-500', icon: Users },
    { email: 'manager@test.com', password: 'test123', label: 'Manager', color: 'bg-blue-600 hover:bg-blue-500', icon: ClipboardList },
    { email: 'admin@test.com', password: 'admin123', label: 'Admin', color: 'bg-red-600 hover:bg-red-500', icon: Shield }
  ]

  const handleTestLogin = async (account) => {
    setError('')
    setLoading(true)
    try {
      await login(account.email, account.password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
        await register(formData.username, formData.email, formData.password, formData.role)
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
      confirmPassword: '',
      role: 'joueur'
    })
  }

  const roles = [
    { id: 'joueur', label: 'Joueur', icon: Trophy, desc: '1 equipe main + subs' },
    { id: 'manager', label: 'Manager', icon: ClipboardList, desc: 'Gere plusieurs equipes' },
    { id: 'coach', label: 'Coach', icon: Users, desc: 'Coache plusieurs equipes' }
  ]

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

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-3">
                  Je suis...
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.role === role.id
                          ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                          : 'border-lol-dark-600 bg-lol-dark-700 text-lol-dark-300 hover:border-lol-dark-500'
                      }`}
                    >
                      <role.icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">{role.label}</div>
                      <div className="text-xs text-lol-dark-500 mt-1">{role.desc}</div>
                    </button>
                  ))}
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

        {/* Test Accounts */}
        <div className="mt-6 bg-lol-dark-800/50 rounded-2xl border border-lol-dark-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-lol-dark-300">Comptes de test</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {testAccounts.map(account => (
              <button
                key={account.email}
                onClick={() => handleTestLogin(account)}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-3 py-2 ${account.color} disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors`}
              >
                <account.icon className="w-4 h-4" />
                {account.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-lol-dark-500 mt-3 text-center">
            Code equipe test: TESTCODE
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
