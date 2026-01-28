import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2, Users } from 'lucide-react'

const DAYS = [
  { value: 0, label: 'Lundi' },
  { value: 1, label: 'Mardi' },
  { value: 2, label: 'Mercredi' },
  { value: 3, label: 'Jeudi' },
  { value: 4, label: 'Vendredi' },
  { value: 5, label: 'Samedi' },
  { value: 6, label: 'Dimanche' }
]

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

function Availabilities() {
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [availabilities, setAvailabilities] = useState([])
  const [teamAvailabilities, setTeamAvailabilities] = useState([])
  const [newAvail, setNewAvail] = useState({
    day_of_week: 0,
    start_time: '20:00',
    end_time: '23:00'
  })

  useEffect(() => {
    fetchMembers()
    fetchTeamAvailabilities()
  }, [])

  useEffect(() => {
    if (selectedMember) {
      fetchMemberAvailabilities(selectedMember.id)
    }
  }, [selectedMember])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      setMembers(data)
      if (data.length > 0) {
        setSelectedMember(data[0])
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchMemberAvailabilities = async (memberId) => {
    try {
      const res = await fetch(`/api/members/${memberId}/availabilities`)
      setAvailabilities(await res.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchTeamAvailabilities = async () => {
    try {
      const res = await fetch('/api/availabilities/team')
      setTeamAvailabilities(await res.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleAddAvailability = async (e) => {
    e.preventDefault()
    if (!selectedMember) return

    try {
      await fetch(`/api/members/${selectedMember.id}/availabilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAvail)
      })
      fetchMemberAvailabilities(selectedMember.id)
      fetchTeamAvailabilities()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDeleteAvailability = async (id) => {
    try {
      await fetch(`/api/availabilities/${id}`, { method: 'DELETE' })
      fetchMemberAvailabilities(selectedMember.id)
      fetchTeamAvailabilities()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getDayLabel = (dayValue) => {
    return DAYS.find(d => d.value === dayValue)?.label || ''
  }

  const getRoleColor = (role) => {
    const colors = {
      Top: 'bg-red-500',
      Jungle: 'bg-teal-500',
      Mid: 'bg-blue-500',
      ADC: 'bg-yellow-500',
      Support: 'bg-purple-500'
    }
    return colors[role] || 'bg-gray-500'
  }

  const getTeamAvailabilityMatrix = () => {
    const matrix = {}

    DAYS.forEach(day => {
      matrix[day.value] = {}
      for (let hour = 0; hour < 24; hour++) {
        matrix[day.value][hour] = []
      }
    })

    teamAvailabilities.forEach(avail => {
      const startHour = parseInt(avail.start_time.split(':')[0])
      const endHour = parseInt(avail.end_time.split(':')[0])

      for (let hour = startHour; hour < endHour; hour++) {
        if (matrix[avail.day_of_week] && matrix[avail.day_of_week][hour]) {
          matrix[avail.day_of_week][hour].push({
            pseudo: avail.pseudo,
            role: avail.role
          })
        }
      }
    })

    return matrix
  }

  const matrix = getTeamAvailabilityMatrix()

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Disponibilités</h1>
        <p className="text-lol-dark-400">Gérez les disponibilités de chaque membre</p>
      </div>

      {members.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-lol-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucun membre</h3>
          <p className="text-lol-dark-400">Ajoutez des membres pour gérer leurs disponibilités</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Selection & Individual Availabilities */}
          <div className="space-y-6">
            {/* Member Selector */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-lol-blue-400" />
                Sélectionner un membre
              </h2>
              <div className="space-y-2">
                {members.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      selectedMember?.id === member.id
                        ? 'bg-lol-blue-500/20 border border-lol-blue-500'
                        : 'bg-lol-dark-900/50 hover:bg-lol-dark-700/50 border border-transparent'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${getRoleColor(member.role)}`}></div>
                    <span className="font-medium text-white">{member.pseudo}</span>
                    <span className="text-sm text-lol-dark-400 ml-auto">{member.role}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Availability */}
            {selectedMember && (
              <div className="card">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-400" />
                  Ajouter une disponibilité
                </h2>
                <form onSubmit={handleAddAvailability} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-lol-dark-300 mb-2">Jour</label>
                    <select
                      value={newAvail.day_of_week}
                      onChange={(e) => setNewAvail({ ...newAvail, day_of_week: parseInt(e.target.value) })}
                      className="select"
                    >
                      {DAYS.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-lol-dark-300 mb-2">Début</label>
                      <select
                        value={newAvail.start_time}
                        onChange={(e) => setNewAvail({ ...newAvail, start_time: e.target.value })}
                        className="select"
                      >
                        {HOURS.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-lol-dark-300 mb-2">Fin</label>
                      <select
                        value={newAvail.end_time}
                        onChange={(e) => setNewAvail({ ...newAvail, end_time: e.target.value })}
                        className="select"
                      >
                        {HOURS.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Ajouter
                  </button>
                </form>
              </div>
            )}

            {/* Current Member Availabilities */}
            {selectedMember && (
              <div className="card">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-lol-gold-400" />
                  Disponibilités de {selectedMember.pseudo}
                </h2>
                {availabilities.length === 0 ? (
                  <p className="text-lol-dark-400 text-center py-4">Aucune disponibilité</p>
                ) : (
                  <div className="space-y-2">
                    {availabilities.map(avail => (
                      <div
                        key={avail.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-lol-dark-900/50"
                      >
                        <div>
                          <p className="font-medium text-white">{getDayLabel(avail.day_of_week)}</p>
                          <p className="text-sm text-lol-dark-400">
                            {avail.start_time} - {avail.end_time}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAvailability(avail.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-lol-dark-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Team Availability Matrix */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-lol-blue-400" />
                Vue d'ensemble de l'équipe
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm text-lol-dark-400 p-2">Heure</th>
                      {DAYS.map(day => (
                        <th key={day.value} className="text-center text-sm text-lol-dark-400 p-2">
                          {day.label.substring(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(15)].map((_, i) => {
                      const hour = i + 9
                      return (
                        <tr key={hour} className="border-t border-lol-dark-700">
                          <td className="text-sm text-lol-dark-500 p-2">
                            {hour.toString().padStart(2, '0')}:00
                          </td>
                          {DAYS.map(day => {
                            const available = matrix[day.value]?.[hour] || []
                            const count = available.length
                            const isFullTeam = count >= 5

                            return (
                              <td
                                key={day.value}
                                className={`p-1 text-center ${
                                  isFullTeam
                                    ? 'bg-green-500/30'
                                    : count > 0
                                    ? 'bg-lol-blue-500/20'
                                    : ''
                                }`}
                              >
                                {count > 0 && (
                                  <div className="flex flex-wrap justify-center gap-0.5">
                                    {available.map((member, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full ${getRoleColor(member.role)}`}
                                        title={`${member.pseudo} (${member.role})`}
                                      ></div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-lol-dark-700 flex-wrap">
                <span className="text-sm text-lol-dark-400">Rôles:</span>
                {['Top', 'Jungle', 'Mid', 'ADC', 'Support'].map(role => (
                  <div key={role} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${getRoleColor(role)}`}></div>
                    <span className="text-xs text-lol-dark-400">{role}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1 ml-4">
                  <div className="w-4 h-4 rounded bg-green-500/30"></div>
                  <span className="text-xs text-lol-dark-400">Équipe complète</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Availabilities
