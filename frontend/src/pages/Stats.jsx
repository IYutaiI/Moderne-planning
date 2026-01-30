import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { BarChart3, Sword, Zap, Target, Users, Plus, Trash2, X, Trophy, Clock, Calendar } from 'lucide-react'
import { useTeam } from '../context/TeamContext'
import { useAuth } from '../context/AuthContext'

const DDRAGON_VERSION = '15.2.1'
const getChampionIcon = (championId) =>
  `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championId}.png`

function Stats() {
  const { currentTeam } = useTeam()
  const { authFetch } = useAuth()
  const [activeTab, setActiveTab] = useState('stats')
  const [members, setMembers] = useState([])
  const [champions, setChampions] = useState([])
  const [games, setGames] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGame, setNewGame] = useState({
    date: new Date().toISOString().split('T')[0],
    opponent: '',
    result: 'win',
    duration: 30,
    players: []
  })

  useEffect(() => {
    fetchChampions()
  }, [])

  useEffect(() => {
    if (currentTeam) {
      fetchMembers()
      fetchGames()
    }
  }, [currentTeam])

  const fetchMembers = async () => {
    try {
      const res = await authFetch(`/api/members?team_id=${currentTeam.id}`)
      const data = await res.json()
      setMembers(data)
      setNewGame(prev => ({
        ...prev,
        players: data.map(m => ({
          memberId: m.id,
          pseudo: m.pseudo,
          champion: '',
          kills: 0,
          deaths: 0,
          assists: 0,
          cs: 0,
          gold: 0
        }))
      }))
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchGames = async () => {
    try {
      const res = await authFetch(`/api/games?team_id=${currentTeam.id}`)
      const data = await res.json()
      setGames(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchChampions = async () => {
    try {
      const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/fr_FR/champion.json`)
      const data = await res.json()
      const champList = Object.values(data.data).map(champ => ({
        id: champ.id,
        name: champ.name
      })).sort((a, b) => a.name.localeCompare(b.name))
      setChampions(champList)
    } catch (error) {
      console.error('Erreur chargement champions:', error)
    }
  }

  const handleAddGame = async () => {
    try {
      await authFetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: currentTeam.id,
          game_date: newGame.date,
          opponent: newGame.opponent,
          result: newGame.result,
          duration: newGame.duration,
          players: newGame.players
        })
      })
      fetchGames()
      closeModal()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDeleteGame = async (id) => {
    if (!confirm('Supprimer cette game ?')) return
    try {
      await authFetch(`/api/games/${id}`, { method: 'DELETE' })
      fetchGames()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const openModal = () => {
    setNewGame({
      date: new Date().toISOString().split('T')[0],
      opponent: '',
      result: 'win',
      duration: 30,
      players: members.map(m => ({
        memberId: m.id,
        pseudo: m.pseudo,
        champion: '',
        kills: 0,
        deaths: 0,
        assists: 0,
        cs: 0,
        gold: 0
      }))
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const updatePlayerStat = (index, field, value) => {
    const newPlayers = [...newGame.players]
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setNewGame({ ...newGame, players: newPlayers })
  }

  // Calculate team stats from games
  const calculateTeamStats = () => {
    if (games.length === 0) {
      return { kills: 0, deaths: 0, assists: 0, goldPerMin: 0, csTotal: 0, csPerMin: 0, games: 0 }
    }

    let totalKills = 0, totalDeaths = 0, totalAssists = 0, totalCS = 0, totalGold = 0, totalDuration = 0

    games.forEach(game => {
      game.players.forEach(p => {
        totalKills += p.kills
        totalDeaths += p.deaths
        totalAssists += p.assists
        totalCS += p.cs
        totalGold += p.gold
      })
      totalDuration += game.duration
    })

    return {
      kills: totalKills / games.length,
      deaths: totalDeaths / games.length,
      assists: totalAssists / games.length,
      goldPerMin: totalDuration > 0 ? Math.round(totalGold / totalDuration) : 0,
      csTotal: Math.round(totalCS / games.length),
      csPerMin: totalDuration > 0 ? (totalCS / totalDuration).toFixed(1) : 0,
      games: games.length
    }
  }

  // Calculate player stats from games
  const calculatePlayerStats = (memberId) => {
    const playerGames = games.filter(g => g.players.some(p => (p.memberId || p.member_id) === memberId))
    if (playerGames.length === 0) {
      return { games: 0, kda: '0.00', kp: 0, cs: 0, csMin: 0, goldPercent: 0 }
    }

    let kills = 0, deaths = 0, assists = 0, cs = 0, gold = 0, totalTeamKills = 0, totalTeamGold = 0, totalDuration = 0

    playerGames.forEach(game => {
      const player = game.players.find(p => (p.memberId || p.member_id) === memberId)
      const teamKills = game.players.reduce((sum, p) => sum + p.kills, 0)
      const teamGold = game.players.reduce((sum, p) => sum + p.gold, 0)

      kills += player.kills
      deaths += player.deaths
      assists += player.assists
      cs += player.cs
      gold += player.gold
      totalTeamKills += teamKills
      totalTeamGold += teamGold
      totalDuration += game.duration
    })

    const kda = deaths > 0 ? ((kills + assists) / deaths).toFixed(2) : (kills + assists).toFixed(2)
    const kp = totalTeamKills > 0 ? Math.round(((kills + assists) / totalTeamKills) * 100) : 0
    const goldPercent = totalTeamGold > 0 ? Math.round((gold / totalTeamGold) * 100) : 0

    return {
      games: playerGames.length,
      kda,
      kp,
      cs: Math.round(cs / playerGames.length),
      csMin: totalDuration > 0 ? (cs / totalDuration).toFixed(1) : 0,
      goldPercent
    }
  }

  const teamStats = calculateTeamStats()

  const kda = teamStats.deaths > 0
    ? ((teamStats.kills + teamStats.assists) / teamStats.deaths).toFixed(2)
    : '0.00'

  const radarPoints = [
    { label: 'Top', angle: -90 },
    { label: 'Jun', angle: -18 },
    { label: 'Mid', angle: 54 },
    { label: 'Adc', angle: 126 },
    { label: 'Supp', angle: 198 }
  ]

  const getRadarPoint = (angle, radius) => {
    const rad = (angle * Math.PI) / 180
    const x = 50 + radius * Math.cos(rad)
    const y = 50 + radius * Math.sin(rad)
    return `${x},${y}`
  }

  const getChampionName = (championId) => {
    const champ = champions.find(c => c.id === championId)
    return champ ? champ.name : championId
  }

  const winRate = games.length > 0
    ? Math.round((games.filter(g => g.result === 'win').length / games.length) * 100)
    : 0

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Statistiques</h1>
          <p className="text-lol-dark-400">Performance de l'equipe</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Tabs */}
          <div className="flex bg-lol-dark-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-purple-600 text-white'
                  : 'text-lol-dark-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Stats
            </button>
            <button
              onClick={() => setActiveTab('historique')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'historique'
                  ? 'bg-purple-600 text-white'
                  : 'text-lol-dark-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Historique
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'stats' ? (
        <>
          {/* Stats Summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-lol-dark-800/50 rounded-lg">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-lol-dark-400">Win Rate:</span>
              <span className="text-white font-bold">{winRate}%</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-lol-dark-800/50 rounded-lg">
              <span className="text-lol-dark-400">Games:</span>
              <span className="text-white font-bold">{games.length}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6">
            {/* KDA Card */}
            <div className="bg-lol-dark-800/50 rounded-2xl p-6 border border-lol-dark-700/50">
              <div className="flex items-center gap-2 mb-6">
                <Sword className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-bold text-white">KDA</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lol-dark-400">KILLS PER GAME</span>
                  <span className="text-white font-bold">{teamStats.kills.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lol-dark-400">DEATHS PER GAME</span>
                  <span className="text-white font-bold">{teamStats.deaths.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lol-dark-400">ASSISTS PER GAME</span>
                  <span className="text-white font-bold">{teamStats.assists.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-lol-dark-700">
                  <span className="text-sm text-red-400 font-medium">RATIO KDA</span>
                  <span className="text-2xl font-bold text-red-400">{kda}</span>
                </div>
              </div>
            </div>

            {/* Gold % Radar */}
            <div className="bg-lol-dark-800/50 rounded-2xl p-6 border border-lol-dark-700/50">
              <h2 className="text-lg font-bold text-white mb-4">GOLD %</h2>
              <div className="flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-48 h-48">
                  <polygon
                    points={radarPoints.map(p => getRadarPoint(p.angle, 40)).join(' ')}
                    fill="none"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="1"
                  />
                  <polygon
                    points={radarPoints.map(p => getRadarPoint(p.angle, 30)).join(' ')}
                    fill="none"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="0.5"
                  />
                  <polygon
                    points={radarPoints.map(p => getRadarPoint(p.angle, 20)).join(' ')}
                    fill="none"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="0.5"
                  />
                  <polygon
                    points={radarPoints.map(p => getRadarPoint(p.angle, 20)).join(' ')}
                    fill="rgba(147, 51, 234, 0.3)"
                    stroke="rgb(147, 51, 234)"
                    strokeWidth="2"
                  />
                  {radarPoints.map(p => {
                    const point = getRadarPoint(p.angle, 48).split(',')
                    return (
                      <text
                        key={p.label}
                        x={point[0]}
                        y={point[1]}
                        fontSize="8"
                        fill="rgb(156, 163, 175)"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {p.label}
                      </text>
                    )
                  })}
                </svg>
              </div>
            </div>

            {/* Kill Participation % Radar */}
            <div className="bg-lol-dark-800/50 rounded-2xl p-6 border border-lol-dark-700/50">
              <h2 className="text-lg font-bold text-white mb-4">KILL PARTICIPATION %</h2>
              <div className="flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-48 h-48">
                  <polygon
                    points={radarPoints.map(p => getRadarPoint(p.angle, 40)).join(' ')}
                    fill="none"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="1"
                  />
                  <polygon
                    points={radarPoints.map(p => getRadarPoint(p.angle, 30)).join(' ')}
                    fill="none"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="0.5"
                  />
                  <polygon
                    points={radarPoints.map(p => getRadarPoint(p.angle, 20)).join(' ')}
                    fill="none"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="0.5"
                  />
                  <polygon
                    points={radarPoints.map(p => getRadarPoint(p.angle, 20)).join(' ')}
                    fill="rgba(147, 51, 234, 0.3)"
                    stroke="rgb(147, 51, 234)"
                    strokeWidth="2"
                  />
                  {radarPoints.map(p => {
                    const point = getRadarPoint(p.angle, 48).split(',')
                    return (
                      <text
                        key={p.label}
                        x={point[0]}
                        y={point[1]}
                        fontSize="8"
                        fill="rgb(156, 163, 175)"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {p.label}
                      </text>
                    )
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Economy & Farming */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-lol-dark-800/50 rounded-2xl p-6 border border-lol-dark-700/50">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">ECONOMY</h2>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-lol-dark-400">GOLD PER MINUTE</span>
                <span className="text-xl font-bold text-white">{teamStats.goldPerMin}</span>
              </div>
            </div>

            <div className="bg-lol-dark-800/50 rounded-2xl p-6 border border-lol-dark-700/50">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-bold text-white">FARMING</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lol-dark-400">CS TOTAL</span>
                  <span className="text-xl font-bold text-white">{teamStats.csTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lol-dark-400">CS PER MINUTE</span>
                  <span className="text-xl font-bold text-white">{teamStats.csPerMin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Stats Table */}
          <div className="bg-lol-dark-800/50 rounded-2xl p-6 border border-lol-dark-700/50">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">STATS PAR JOUEURS</h2>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-lol-dark-400 border-b border-lol-dark-700">
                  <th className="pb-4">JOUEUR</th>
                  <th className="pb-4 text-center">NB GAMES</th>
                  <th className="pb-4 text-center">KDA</th>
                  <th className="pb-4 text-center">KP %</th>
                  <th className="pb-4 text-center">CS MOY</th>
                  <th className="pb-4 text-center">CS / MIN</th>
                  <th className="pb-4 text-center">GOLD %</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-lol-dark-400">
                      Aucun joueur dans l'equipe
                    </td>
                  </tr>
                ) : (
                  members.map(member => {
                    const stats = calculatePlayerStats(member.id)
                    return (
                      <tr key={member.id} className="border-b border-lol-dark-700/50">
                        <td className="py-4">
                          <span className="font-bold text-white italic">{member.pseudo.toUpperCase()}</span>
                        </td>
                        <td className="py-4 text-center text-lol-dark-300">{stats.games}</td>
                        <td className="py-4 text-center text-lol-dark-300">{stats.kda}</td>
                        <td className="py-4 text-center text-lol-dark-300">{stats.kp}%</td>
                        <td className="py-4 text-center text-lol-dark-300">{stats.cs}</td>
                        <td className="py-4 text-center text-lol-dark-300">{stats.csMin}</td>
                        <td className="py-4 text-center text-lol-dark-300">{stats.goldPercent}%</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Historique Tab */
        <div className="space-y-6">
          {/* Add Game Button */}
          <div className="flex justify-end">
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Ajouter une game
            </button>
          </div>

          {/* Games List */}
          {games.length === 0 ? (
            <div className="text-center py-16 bg-lol-dark-800/30 rounded-xl border border-lol-dark-700/50">
              <Clock className="w-16 h-16 text-lol-dark-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune game enregistree</h3>
              <p className="text-lol-dark-400 mb-6">Ajoutez vos games pour suivre vos statistiques</p>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map(game => (
                <div
                  key={game.id}
                  className={`p-4 rounded-xl border ${
                    game.result === 'win'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        game.result === 'win'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {game.result === 'win' ? 'VICTOIRE' : 'DEFAITE'}
                      </div>
                      <div className="text-white font-medium">vs {game.opponent || 'Equipe adverse'}</div>
                      <div className="text-lol-dark-400 text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(game.game_date || game.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-lol-dark-400 text-sm">
                        {game.duration} min
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-lol-dark-400 hover:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Players */}
                  <div className="grid grid-cols-5 gap-3">
                    {game.players.map((player, idx) => (
                      <div key={idx} className="bg-lol-dark-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {player.champion && (
                            <img
                              src={getChampionIcon(player.champion)}
                              alt={player.champion}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span className="text-sm font-medium text-white truncate">{player.pseudo}</span>
                        </div>
                        <div className="text-xs text-lol-dark-400">
                          <span className="text-green-400">{player.kills}</span>
                          <span className="text-lol-dark-500">/</span>
                          <span className="text-red-400">{player.deaths}</span>
                          <span className="text-lol-dark-500">/</span>
                          <span className="text-blue-400">{player.assists}</span>
                          <span className="ml-2 text-yellow-400">{player.cs} CS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Game Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lol-dark-900 rounded-2xl border border-lol-dark-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
              <h2 className="text-xl font-bold text-white">Ajouter une game</h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Game Info */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-lol-dark-400 mb-2">Date</label>
                  <input
                    type="date"
                    value={newGame.date}
                    onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
                    className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-lol-dark-400 mb-2">Adversaire</label>
                  <input
                    type="text"
                    value={newGame.opponent}
                    onChange={(e) => setNewGame({ ...newGame, opponent: e.target.value })}
                    placeholder="Nom de l'equipe"
                    className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-2 text-white placeholder-lol-dark-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-lol-dark-400 mb-2">Resultat</label>
                  <select
                    value={newGame.result}
                    onChange={(e) => setNewGame({ ...newGame, result: e.target.value })}
                    className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="win">Victoire</option>
                    <option value="loss">Defaite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-lol-dark-400 mb-2">Duree (min)</label>
                  <input
                    type="number"
                    value={newGame.duration}
                    onChange={(e) => setNewGame({ ...newGame, duration: parseInt(e.target.value) || 0 })}
                    className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              {/* Player Stats */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Stats des joueurs</h3>
                <div className="space-y-3">
                  {newGame.players.map((player, index) => (
                    <div key={index} className="bg-lol-dark-800/50 rounded-lg p-4">
                      <div className="grid grid-cols-7 gap-3 items-center">
                        <div className="text-white font-medium">{player.pseudo}</div>
                        <div>
                          <select
                            value={player.champion}
                            onChange={(e) => updatePlayerStat(index, 'champion', e.target.value)}
                            className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-2 py-1 text-sm text-white"
                          >
                            <option value="">Champion</option>
                            {champions.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <input
                            type="number"
                            value={player.kills}
                            onChange={(e) => updatePlayerStat(index, 'kills', parseInt(e.target.value) || 0)}
                            placeholder="Kills"
                            className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-2 py-1 text-sm text-white text-center"
                          />
                          <span className="text-xs text-lol-dark-500 block text-center">Kills</span>
                        </div>
                        <div>
                          <input
                            type="number"
                            value={player.deaths}
                            onChange={(e) => updatePlayerStat(index, 'deaths', parseInt(e.target.value) || 0)}
                            placeholder="Deaths"
                            className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-2 py-1 text-sm text-white text-center"
                          />
                          <span className="text-xs text-lol-dark-500 block text-center">Deaths</span>
                        </div>
                        <div>
                          <input
                            type="number"
                            value={player.assists}
                            onChange={(e) => updatePlayerStat(index, 'assists', parseInt(e.target.value) || 0)}
                            placeholder="Assists"
                            className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-2 py-1 text-sm text-white text-center"
                          />
                          <span className="text-xs text-lol-dark-500 block text-center">Assists</span>
                        </div>
                        <div>
                          <input
                            type="number"
                            value={player.cs}
                            onChange={(e) => updatePlayerStat(index, 'cs', parseInt(e.target.value) || 0)}
                            placeholder="CS"
                            className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-2 py-1 text-sm text-white text-center"
                          />
                          <span className="text-xs text-lol-dark-500 block text-center">CS</span>
                        </div>
                        <div>
                          <input
                            type="number"
                            value={player.gold}
                            onChange={(e) => updatePlayerStat(index, 'gold', parseInt(e.target.value) || 0)}
                            placeholder="Gold"
                            className="w-full bg-lol-dark-700 border border-lol-dark-600 rounded-lg px-2 py-1 text-sm text-white text-center"
                          />
                          <span className="text-xs text-lol-dark-500 block text-center">Gold</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-lol-dark-700">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-lol-dark-700 hover:bg-lol-dark-600 text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleAddGame}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Stats
