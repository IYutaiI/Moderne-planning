import { useState, useEffect } from 'react'
import { BarChart3, Sword, Zap, Target, Users } from 'lucide-react'

function Stats() {
  const [members, setMembers] = useState([])
  const [teamStats, setTeamStats] = useState({
    kills: 0,
    deaths: 0,
    assists: 0,
    goldPerMin: 0,
    csTotal: 0,
    csPerMin: 0,
    games: 0
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      setMembers(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const kda = teamStats.deaths > 0
    ? ((teamStats.kills + teamStats.assists) / teamStats.deaths).toFixed(2)
    : '0.00'

  // Radar chart points (simplified SVG)
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Statistiques</h1>
          <p className="text-lol-dark-400">Performance de l'equipe</p>
        </div>
        <div className="flex items-center gap-4">
          <select className="select">
            <option>Toutes les games</option>
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
          </select>
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
              {/* Background pentagon */}
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
              {/* Data polygon */}
              <polygon
                points={radarPoints.map(p => getRadarPoint(p.angle, 20)).join(' ')}
                fill="rgba(147, 51, 234, 0.3)"
                stroke="rgb(147, 51, 234)"
                strokeWidth="2"
              />
              {/* Labels */}
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
              {/* Background pentagon */}
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
              {/* Data polygon */}
              <polygon
                points={radarPoints.map(p => getRadarPoint(p.angle, 20)).join(' ')}
                fill="rgba(147, 51, 234, 0.3)"
                stroke="rgb(147, 51, 234)"
                strokeWidth="2"
              />
              {/* Labels */}
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
        {/* Economy */}
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

        {/* Farming */}
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
              <span className="text-xl font-bold text-white">{teamStats.csPerMin.toFixed(1)}</span>
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
              <th className="pb-4 text-center">CS TOTAL</th>
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
              members.map(member => (
                <tr key={member.id} className="border-b border-lol-dark-700/50">
                  <td className="py-4">
                    <span className="font-bold text-white italic">{member.pseudo.toUpperCase()}</span>
                  </td>
                  <td className="py-4 text-center text-lol-dark-300">0</td>
                  <td className="py-4 text-center text-lol-dark-300">0.00</td>
                  <td className="py-4 text-center text-lol-dark-300">0%</td>
                  <td className="py-4 text-center text-lol-dark-300">0</td>
                  <td className="py-4 text-center text-lol-dark-300">0.0</td>
                  <td className="py-4 text-center text-lol-dark-300">0%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="text-center text-sm text-lol-dark-500">
        Les statistiques sont calculees a partir des donnees de scrims enregistrees
      </div>
    </div>
  )
}

export default Stats
