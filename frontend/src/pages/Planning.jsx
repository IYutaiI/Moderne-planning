import { useState, useEffect } from 'react'
import { Calendar, Users, ChevronLeft, ChevronRight, Plus, Check, X, Minus, Copy, Trash2, RotateCcw } from 'lucide-react'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const DAYS_SHORT = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
const HOURS = Array.from({ length: 13 }, (_, i) => i + 12) // 12h à 00h

function Planning() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('synthese') // 'agenda', 'dispo', 'synthese'
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [availabilities, setAvailabilities] = useState([])
  const [teamAvailabilities, setTeamAvailabilities] = useState([])
  const [events, setEvents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState('available') // 'available', 'maybe', 'unavailable', 'clear'
  const [isDragging, setIsDragging] = useState(false)

  // Handle mouse up globally to stop dragging
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  useEffect(() => {
    fetchData(getWeekStartString())
  }, [currentDate])

  useEffect(() => {
    if (members.length > 0 && !selectedMember) {
      setSelectedMember(members[0])
    }
  }, [members])

  useEffect(() => {
    if (selectedMember) {
      fetchMemberAvailabilities(selectedMember.id, getWeekStartString())
    }
  }, [selectedMember, currentDate])

  const fetchData = async (weekStart = null) => {
    const week = weekStart || getWeekStartString()
    try {
      const [membersRes, teamAvailRes, eventsRes] = await Promise.all([
        fetch('/api/members'),
        fetch(`/api/availabilities/team?week_start=${week}`),
        fetch('/api/events')
      ])
      setMembers(await membersRes.json())
      setTeamAvailabilities(await teamAvailRes.json())
      setEvents(await eventsRes.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchMemberAvailabilities = async (memberId, weekStart = null) => {
    const week = weekStart || getWeekStartString()
    try {
      const res = await fetch(`/api/members/${memberId}/availabilities?week_start=${week}`)
      setAvailabilities(await res.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getWeekDates = () => {
    const dates = []
    const start = new Date(currentDate)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates()

  // Get week start string (YYYY-MM-DD format for Monday)
  const getWeekStartString = (date = currentDate) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d.toISOString().split('T')[0]
  }

  const currentWeekStart = getWeekStartString()

  // Get previous week start
  const getPreviousWeekStart = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    return getWeekStartString(d)
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    setCurrentDate(newDate)
  }

  const formatWeekLabel = () => {
    const start = weekDates[0]
    return `${start.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'long' })}`
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Get member availability status at specific day/hour (returns status or null)
  const getMemberAvailabilityStatus = (memberId, dayIndex, hour) => {
    const avails = memberId === selectedMember?.id ? availabilities :
      teamAvailabilities.filter(a => a.member_id === memberId)

    const avail = avails.find(a => {
      if (a.day_of_week !== dayIndex) return false
      const startHour = parseInt(a.start_time.split(':')[0])
      const endHour = parseInt(a.end_time.split(':')[0]) || 24
      return hour >= startHour && hour < endHour
    })

    return avail ? (avail.status || 'available') : null
  }

  // Check if member is available at specific day/hour (for team count)
  const isMemberAvailable = (memberId, dayIndex, hour) => {
    const status = getMemberAvailabilityStatus(memberId, dayIndex, hour)
    return status === 'available'
  }

  // Get availability count for team at specific day/hour
  const getTeamAvailabilityCount = (dayIndex, hour) => {
    let count = 0
    members.forEach(member => {
      if (isMemberAvailable(member.id, dayIndex, hour)) count++
    })
    return count
  }

  // Apply selected tool status to a cell
  const applyAvailability = async (dayIndex, hour) => {
    if (!selectedMember) return

    const currentStatus = getMemberAvailabilityStatus(selectedMember.id, dayIndex, hour)

    // Find existing availability for this slot
    const avail = availabilities.find(a => {
      if (a.day_of_week !== dayIndex) return false
      const startHour = parseInt(a.start_time.split(':')[0])
      const endHour = parseInt(a.end_time.split(':')[0]) || 24
      return hour >= startHour && hour < endHour
    })

    // If clearing or the same status, delete
    if (selectedTool === 'clear' || currentStatus === selectedTool) {
      if (avail) {
        await fetch(`/api/availabilities/${avail.id}`, { method: 'DELETE' })
      }
    } else if (currentStatus === null) {
      // No existing status -> Create new
      await fetch(`/api/members/${selectedMember.id}/availabilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: dayIndex,
          start_time: `${hour.toString().padStart(2, '0')}:00`,
          end_time: `${((hour + 1) % 24).toString().padStart(2, '0')}:00`,
          status: selectedTool,
          week_start: getWeekStartString()
        })
      })
    } else {
      // Update existing status
      await fetch(`/api/availabilities/${avail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedTool })
      })
    }

    fetchMemberAvailabilities(selectedMember.id)
    fetchData()
  }

  // Clear all availabilities for current member
  const clearAllAvailabilities = async () => {
    if (!selectedMember) return
    if (!confirm('Voulez-vous vraiment effacer toutes les disponibilites ?')) return

    // Delete all availabilities for this member
    for (const avail of availabilities) {
      await fetch(`/api/availabilities/${avail.id}`, { method: 'DELETE' })
    }

    fetchMemberAvailabilities(selectedMember.id)
    fetchData()
  }

  // Copy availabilities from another member
  const copyFromMember = async (sourceMemberId) => {
    if (!selectedMember || sourceMemberId === selectedMember.id) return

    // Get source member availabilities
    const sourceAvails = teamAvailabilities.filter(a => a.member_id === sourceMemberId)

    if (sourceAvails.length === 0) {
      alert('Ce membre n\'a pas de disponibilites definies')
      return
    }

    // Clear current member availabilities first
    for (const avail of availabilities) {
      await fetch(`/api/availabilities/${avail.id}`, { method: 'DELETE' })
    }

    // Copy source availabilities to current member
    for (const avail of sourceAvails) {
      await fetch(`/api/members/${selectedMember.id}/availabilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: avail.day_of_week,
          start_time: avail.start_time,
          end_time: avail.end_time,
          status: avail.status || 'available',
          week_start: getWeekStartString()
        })
      })
    }

    fetchMemberAvailabilities(selectedMember.id, getWeekStartString())
    fetchData(getWeekStartString())
  }

  // Copy availabilities from previous week
  const copyFromPreviousWeek = async () => {
    if (!selectedMember) return

    const prevWeek = getPreviousWeekStart()
    const currentWeek = getWeekStartString()

    try {
      const res = await fetch(`/api/members/${selectedMember.id}/availabilities/copy-week`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_week: prevWeek,
          to_week: currentWeek
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Erreur lors de la copie')
        return
      }

      fetchMemberAvailabilities(selectedMember.id, currentWeek)
      fetchData(currentWeek)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la copie de la semaine precedente')
    }
  }

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.event_date === dateStr)
  }

  // Get event at specific hour
  const getEventAtHour = (date, hour) => {
    const dayEvents = getEventsForDate(date)
    return dayEvents.find(e => {
      const startHour = parseInt(e.start_time.split(':')[0])
      const endHour = parseInt(e.end_time.split(':')[0])
      return hour >= startHour && hour < endHour
    })
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-lol-blue-400" />
          <h1 className="text-2xl font-bold text-white">Systeme de Planning Team</h1>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-lol-dark-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('agenda')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'agenda'
                ? 'bg-lol-dark-700 text-white'
                : 'text-lol-dark-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Agenda
          </button>
          <button
            onClick={() => setViewMode('dispo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'dispo'
                ? 'bg-purple-600 text-white'
                : 'text-lol-dark-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Dispo
          </button>
          <button
            onClick={() => setViewMode('synthese')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'synthese'
                ? 'bg-purple-600 text-white'
                : 'text-lol-dark-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Synthese
          </button>
        </div>
      </div>

      {/* Week Navigation & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-lol-dark-800 rounded-lg px-4 py-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1 rounded hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center min-w-[140px]">
            <p className="text-xs text-purple-400 font-medium">SEMAINE DE</p>
            <p className="text-white font-semibold">{formatWeekLabel()}</p>
          </div>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1 rounded hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Planifier
        </button>
      </div>

      {/* Dispo View - Per Member */}
      {viewMode === 'dispo' && (
        <div className="flex gap-6">
          {/* Member List */}
          <div className="w-56 space-y-2">
            {members.length === 0 ? (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
                <p className="text-red-400 text-sm font-medium">Aucun membre</p>
                <p className="text-red-400/70 text-xs mt-1">Ajoutez des membres dans le Roster d'abord</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-lol-dark-500 uppercase mb-2">Selectionnez un membre</p>
                {members.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      selectedMember?.id === member.id
                        ? 'bg-lol-dark-700 border border-purple-500/50'
                        : 'bg-lol-dark-800/50 hover:bg-lol-dark-700/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-lol-dark-600 flex items-center justify-center">
                      <Users className="w-4 h-4 text-lol-dark-400" />
                    </div>
                    <span className="font-medium text-white">{member.pseudo}</span>
                  </button>
                ))}
              </>
            )}

            {/* Tool Selection */}
            <div className="mt-6 p-4 bg-lol-dark-800/50 rounded-xl">
              <p className="text-xs text-lol-dark-500 uppercase mb-3">Outil de selection</p>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTool('available')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    selectedTool === 'available'
                      ? 'bg-green-500/30 border-2 border-green-500'
                      : 'bg-lol-dark-700/50 border-2 border-transparent hover:border-green-500/50'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-green-500/30 border border-green-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm text-white font-medium">Disponible</span>
                </button>
                <button
                  onClick={() => setSelectedTool('maybe')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    selectedTool === 'maybe'
                      ? 'bg-yellow-500/30 border-2 border-yellow-500'
                      : 'bg-lol-dark-700/50 border-2 border-transparent hover:border-yellow-500/50'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-yellow-500/30 border border-yellow-500 flex items-center justify-center">
                    <Minus className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-sm text-white font-medium">A confirmer</span>
                </button>
                <button
                  onClick={() => setSelectedTool('unavailable')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    selectedTool === 'unavailable'
                      ? 'bg-red-500/30 border-2 border-red-500'
                      : 'bg-lol-dark-700/50 border-2 border-transparent hover:border-red-500/50'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-red-500/30 border border-red-500 flex items-center justify-center">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm text-white font-medium">Indisponible</span>
                </button>
                <button
                  onClick={() => setSelectedTool('clear')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    selectedTool === 'clear'
                      ? 'bg-lol-dark-600 border-2 border-lol-dark-400'
                      : 'bg-lol-dark-700/50 border-2 border-transparent hover:border-lol-dark-400/50'
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-lol-dark-600 border border-lol-dark-400 flex items-center justify-center">
                    <X className="w-4 h-4 text-lol-dark-400" />
                  </div>
                  <span className="text-sm text-white font-medium">Effacer</span>
                </button>
              </div>
              <p className="text-xs text-lol-dark-500 mt-3">Selectionnez puis cliquez sur les cases</p>
            </div>
          </div>

          {/* Availability Grid */}
          <div className="flex-1">
            {/* Selected Member Indicator & Actions */}
            {selectedMember ? (
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="p-3 bg-purple-600/20 border border-purple-500/50 rounded-xl flex items-center gap-3 flex-1">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Disponibilites de: <span className="text-purple-400">{selectedMember.pseudo}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Copy from previous week */}
                  <button
                    onClick={copyFromPreviousWeek}
                    className="flex items-center gap-2 px-4 py-3 bg-purple-600/20 border border-purple-500/50 rounded-xl hover:bg-purple-600/30 transition-colors"
                    title="Copier la semaine d'avant"
                  >
                    <RotateCcw className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-purple-400 font-medium">Copier semaine precedente</span>
                  </button>
                  {/* Copy from another member */}
                  <div className="relative group">
                    <button className="p-3 bg-blue-600/20 border border-blue-500/50 rounded-xl hover:bg-blue-600/30 transition-colors" title="Copier depuis un membre">
                      <Copy className="w-5 h-5 text-blue-400" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-lol-dark-800 border border-lol-dark-600 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <p className="text-xs text-lol-dark-400 p-3 border-b border-lol-dark-700">Copier depuis:</p>
                      {members.filter(m => m.id !== selectedMember.id).map(member => (
                        <button
                          key={member.id}
                          onClick={() => copyFromMember(member.id)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-lol-dark-700 transition-colors"
                        >
                          {member.pseudo}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Clear all */}
                  <button
                    onClick={clearAllAvailabilities}
                    className="p-3 bg-red-600/20 border border-red-500/50 rounded-xl hover:bg-red-600/30 transition-colors"
                    title="Tout effacer"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl flex items-center gap-3">
                <Users className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Selectionnez un membre dans la liste</span>
              </div>
            )}

            <div className="bg-lol-dark-800/30 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lol-dark-700">
                  <th className="text-left text-sm text-lol-dark-400 p-3 w-32">JOUR</th>
                  {HOURS.map(hour => (
                    <th key={hour} className="text-center text-xs text-lol-dark-500 p-2 w-12">
                      {hour === 24 ? '00h' : `${hour}h`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dayIndex) => (
                  <tr key={day} className="border-b border-lol-dark-700/50">
                    <td className="text-sm text-lol-dark-300 p-3 font-medium">{day}</td>
                    {HOURS.map(hour => {
                      const status = selectedMember ? getMemberAvailabilityStatus(selectedMember.id, dayIndex, hour) : null
                      const getStatusStyles = () => {
                        switch (status) {
                          case 'available':
                            return 'bg-green-500/30 hover:bg-green-500/40 border-2 border-green-500'
                          case 'maybe':
                            return 'bg-yellow-500/30 hover:bg-yellow-500/40 border-2 border-yellow-500'
                          case 'unavailable':
                            return 'bg-red-500/30 hover:bg-red-500/40 border-2 border-red-500'
                          default:
                            return 'bg-lol-dark-700/30 hover:bg-lol-dark-600/50 border border-lol-dark-600'
                        }
                      }
                      return (
                        <td key={hour} className="p-1 select-none">
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault()
                              setIsDragging(true)
                              applyAvailability(dayIndex, hour)
                            }}
                            onMouseEnter={() => {
                              if (isDragging) {
                                applyAvailability(dayIndex, hour)
                              }
                            }}
                            className={`w-full h-8 rounded flex items-center justify-center transition-all cursor-pointer ${getStatusStyles()}`}
                          >
                            {status === 'available' && (
                              <Check className="w-4 h-4 text-green-400" />
                            )}
                            {status === 'maybe' && (
                              <Minus className="w-4 h-4 text-yellow-400" />
                            )}
                            {status === 'unavailable' && (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {/* Synthese View - Team Overview */}
      {viewMode === 'synthese' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Synthese Equipe</h2>
              <p className="text-sm text-lol-dark-400">Apercu rapide des creneaux (12h - 00h).</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-lol-dark-400">5+ Dispo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-lol-dark-400">Activite</span>
              </div>
            </div>
          </div>

          {/* Week Header */}
          <div className="grid grid-cols-8 gap-2">
            <div></div>
            {weekDates.map((date, idx) => (
              <div
                key={idx}
                className={`text-center p-3 rounded-xl ${
                  isToday(date)
                    ? 'bg-purple-600/20 border border-purple-500/50'
                    : 'bg-lol-dark-800/50'
                }`}
              >
                <p className="text-xs text-lol-dark-400">{DAYS_SHORT[idx]}</p>
                <p className={`text-xl font-bold ${isToday(date) ? 'text-purple-400' : 'text-white'}`}>
                  {date.getDate()}
                </p>
                <p className="text-xs text-lol-dark-500">
                  {date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                </p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="bg-lol-dark-800/30 rounded-xl overflow-hidden">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-px border-b border-lol-dark-700/30">
                <div className="p-2 text-sm text-lol-dark-500 flex items-center">
                  {hour}:00
                </div>
                {weekDates.map((date, dayIdx) => {
                  const count = getTeamAvailabilityCount(dayIdx, hour)
                  const event = getEventAtHour(date, hour)
                  const isFullTeam = count >= 5

                  return (
                    <div
                      key={dayIdx}
                      className={`relative min-h-[50px] p-2 ${
                        event
                          ? 'bg-purple-600/30'
                          : isFullTeam
                          ? 'bg-green-500/20'
                          : ''
                      }`}
                    >
                      {event ? (
                        <div className="absolute inset-1 bg-purple-600/50 rounded-lg p-2 border border-purple-500/50">
                          <p className="text-xs font-bold text-white">{hour}h</p>
                          <p className="text-xs text-white truncate">{event.title.toUpperCase()}</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-lol-dark-500">{hour}h</span>
                          <span className={`font-medium ${
                            isFullTeam ? 'text-green-400' : 'text-lol-dark-500'
                          }`}>
                            {count}/{members.length || 5}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda View */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Evenements de la semaine</h2>

          {events.length === 0 ? (
            <div className="text-center py-12 bg-lol-dark-800/30 rounded-xl">
              <Calendar className="w-16 h-16 text-lol-dark-600 mx-auto mb-4" />
              <p className="text-lol-dark-400">Aucun evenement planifie</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
              >
                Creer un evenement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {weekDates.map((date, idx) => {
                const dayEvents = getEventsForDate(date)
                return (
                  <div key={idx} className="space-y-2">
                    <div className={`text-center p-2 rounded-lg ${
                      isToday(date) ? 'bg-purple-600' : 'bg-lol-dark-800'
                    }`}>
                      <p className="text-xs text-lol-dark-400">{DAYS_SHORT[idx]}</p>
                      <p className="text-lg font-bold text-white">{date.getDate()}</p>
                    </div>
                    <div className="space-y-2">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg bg-purple-600/30 border border-purple-500/30"
                        >
                          <p className="text-xs text-purple-300">{event.start_time}</p>
                          <p className="text-sm font-medium text-white">{event.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      {isModalOpen && (
        <EventModal
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            fetchData()
            setIsModalOpen(false)
          }}
          members={members}
        />
      )}
    </div>
  )
}

// Event Creation Modal
function EventModal({ onClose, onSave, members }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'training',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '20:00',
    end_time: '22:00',
    participant_ids: []
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      onSave()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const eventTypes = [
    { value: 'training', label: 'Entrainement' },
    { value: 'scrim', label: 'Scrim' },
    { value: 'match', label: 'Match Officiel' },
    { value: 'review', label: 'VOD Review' },
    { value: 'tournament', label: 'Tournoi' }
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-600 w-full max-w-md animate-fadeIn">
        <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
          <h2 className="text-xl font-bold text-white">Planifier un evenement</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-lol-dark-300 mb-2">Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Ex: Scrim vs G2 Academy"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lol-dark-300 mb-2">Type</label>
            <select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              className="select"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-lol-dark-300 mb-2">Date *</label>
            <input
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-lol-dark-300 mb-2">Debut</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lol-dark-300 mb-2">Fin</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-lol-dark-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Details de l'evenement..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium">
              Planifier
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Planning
