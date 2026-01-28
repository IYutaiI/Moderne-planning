import { useState, useEffect } from 'react'
import { Users, Calendar, Trophy, Clock } from 'lucide-react'

function Dashboard() {
  const [stats, setStats] = useState({ memberCount: 0, upcomingEvents: 0, nextEvent: null })
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, membersRes, eventsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/members'),
        fetch('/api/events')
      ])
      setStats(await statsRes.json())
      setMembers(await membersRes.json())
      setEvents(await eventsRes.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      top: 'text-red-400',
      jungle: 'text-teal-400',
      mid: 'text-blue-400',
      adc: 'text-yellow-400',
      support: 'text-purple-400'
    }
    return colors[role?.toLowerCase()] || 'text-gray-400'
  }

  const getRoleIcon = (role) => {
    const icons = {
      top: '🛡️',
      jungle: '🌲',
      mid: '⚡',
      adc: '🎯',
      support: '💚'
    }
    return icons[role?.toLowerCase()] || '🎮'
  }

  const getEventTypeColor = (type) => {
    const colors = {
      training: 'bg-lol-blue-500/20 text-lol-blue-400 border-lol-blue-500/30',
      match: 'bg-red-500/20 text-red-400 border-red-500/30',
      tournament: 'bg-lol-gold-500/20 text-lol-gold-400 border-lol-gold-500/30',
      review: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const upcomingEvents = events
    .filter(e => new Date(e.event_date) >= new Date())
    .slice(0, 5)

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-lol-dark-400">Vue d'ensemble de votre équipe</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card group hover:border-lol-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lol-dark-400 text-sm">Membres</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.memberCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-lol-blue-500/20 flex items-center justify-center group-hover:bg-lol-blue-500/30 transition-colors">
              <Users className="w-6 h-6 text-lol-blue-400" />
            </div>
          </div>
        </div>

        <div className="card group hover:border-lol-gold-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lol-dark-400 text-sm">Événements à venir</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.upcomingEvents}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-lol-gold-500/20 flex items-center justify-center group-hover:bg-lol-gold-500/30 transition-colors">
              <Calendar className="w-6 h-6 text-lol-gold-400" />
            </div>
          </div>
        </div>

        <div className="card group hover:border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lol-dark-400 text-sm">Prochain événement</p>
              <p className="text-lg font-bold text-white mt-1 truncate">
                {stats.nextEvent?.title || 'Aucun'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="card group hover:border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lol-dark-400 text-sm">Statut équipe</p>
              <p className="text-lg font-bold text-green-400 mt-1">Active</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <Trophy className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Roster */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-lol-blue-400" />
            Équipe
          </h2>
          {members.length === 0 ? (
            <p className="text-lol-dark-400 text-center py-8">Aucun membre dans l'équipe</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-lol-dark-900/50 hover:bg-lol-dark-700/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lol-dark-600 to-lol-dark-700 flex items-center justify-center text-lg">
                    {getRoleIcon(member.role)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{member.pseudo}</p>
                    <p className={`text-sm ${getRoleColor(member.role)}`}>
                      {member.role}
                    </p>
                  </div>
                  {member.rank && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-lol-dark-700 text-lol-dark-300">
                      {member.rank}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-lol-gold-400" />
            Événements à venir
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-lol-dark-400 text-center py-8">Aucun événement planifié</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-lol-dark-900/50 hover:bg-lol-dark-700/50 transition-colors"
                >
                  <div className="text-center min-w-[50px]">
                    <p className="text-2xl font-bold text-white">
                      {new Date(event.event_date).getDate()}
                    </p>
                    <p className="text-xs text-lol-dark-400">
                      {new Date(event.event_date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="text-sm text-lol-dark-400">
                      {event.start_time} - {event.end_time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getEventTypeColor(event.event_type)}`}>
                    {event.event_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
