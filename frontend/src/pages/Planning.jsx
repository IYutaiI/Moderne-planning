import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const HOURS = Array.from({ length: 15 }, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`)

function Planning() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [availabilities, setAvailabilities] = useState([])
  const [viewMode, setViewMode] = useState('week')

  useEffect(() => {
    fetchData()
  }, [currentDate])

  const fetchData = async () => {
    try {
      const [eventsRes, availRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/availabilities/team')
      ])
      setEvents(await eventsRes.json())
      setAvailabilities(await availRes.json())
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

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    setCurrentDate(newDate)
  }

  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.event_date === dateStr)
  }

  const getAvailabilitiesForDay = (dayIndex) => {
    return availabilities.filter(a => a.day_of_week === dayIndex)
  }

  const getEventColor = (type) => {
    const colors = {
      training: 'bg-lol-blue-500/30 border-lol-blue-500 text-lol-blue-300',
      match: 'bg-red-500/30 border-red-500 text-red-300',
      tournament: 'bg-lol-gold-500/30 border-lol-gold-500 text-lol-gold-300',
      review: 'bg-purple-500/30 border-purple-500 text-purple-300'
    }
    return colors[type] || 'bg-gray-500/30 border-gray-500 text-gray-300'
  }

  const formatWeekRange = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    const startMonth = start.toLocaleDateString('fr-FR', { month: 'short' })
    const endMonth = end.toLocaleDateString('fr-FR', { month: 'short' })
    const year = start.getFullYear()

    if (startMonth === endMonth) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth} ${year}`
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${year}`
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Planning</h1>
          <p className="text-lol-dark-400">Vue hebdomadaire de l'équipe</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-lol-dark-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-lol-blue-500 text-white'
                  : 'text-lol-dark-400 hover:text-white'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-lol-blue-500 text-white'
                  : 'text-lol-dark-400 hover:text-white'
              }`}
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 rounded-lg bg-lol-dark-700 hover:bg-lol-dark-600 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-lol-blue-400" />
            <span className="text-lg font-semibold text-white">{formatWeekRange()}</span>
          </div>

          <button
            onClick={() => navigateWeek(1)}
            className="p-2 rounded-lg bg-lol-dark-700 hover:bg-lol-dark-600 text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-8 gap-px bg-lol-dark-700 rounded-xl overflow-hidden">
          {/* Time column header */}
          <div className="bg-lol-dark-800 p-3">
            <Clock className="w-4 h-4 text-lol-dark-500 mx-auto" />
          </div>

          {/* Day headers */}
          {weekDates.map((date, index) => (
            <div
              key={index}
              className={`bg-lol-dark-800 p-3 text-center ${
                isToday(date) ? 'bg-lol-blue-500/20' : ''
              }`}
            >
              <p className="text-sm text-lol-dark-400">{DAYS[index]}</p>
              <p className={`text-lg font-bold ${
                isToday(date) ? 'text-lol-blue-400' : 'text-white'
              }`}>
                {date.getDate()}
              </p>
            </div>
          ))}

          {/* Time slots */}
          {HOURS.map((hour, hourIndex) => (
            <>
              {/* Time label */}
              <div key={`time-${hour}`} className="bg-lol-dark-900 p-2 text-center">
                <span className="text-xs text-lol-dark-500">{hour}</span>
              </div>

              {/* Day cells */}
              {weekDates.map((date, dayIndex) => {
                const dayEvents = getEventsForDay(date).filter(e => {
                  const eventHour = parseInt(e.start_time.split(':')[0])
                  return eventHour === hourIndex + 9
                })
                const dayAvail = getAvailabilitiesForDay(dayIndex).filter(a => {
                  const startHour = parseInt(a.start_time.split(':')[0])
                  const endHour = parseInt(a.end_time.split(':')[0])
                  return hourIndex + 9 >= startHour && hourIndex + 9 < endHour
                })

                return (
                  <div
                    key={`${date}-${hour}`}
                    className={`bg-lol-dark-900 p-1 min-h-[60px] relative ${
                      isToday(date) ? 'bg-lol-blue-500/5' : ''
                    } ${dayAvail.length > 0 ? 'bg-green-500/10' : ''}`}
                  >
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1.5 rounded border-l-2 ${getEventColor(event.event_type)} mb-1`}
                      >
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-[10px] opacity-75">
                          {event.start_time} - {event.end_time}
                        </p>
                      </div>
                    ))}
                    {dayAvail.length > 0 && dayEvents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] text-green-500/50">
                          {dayAvail.length} dispo
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-lol-dark-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-lol-blue-500/30 border border-lol-blue-500"></div>
            <span className="text-sm text-lol-dark-400">Entraînement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500"></div>
            <span className="text-sm text-lol-dark-400">Match</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-lol-gold-500/30 border border-lol-gold-500"></div>
            <span className="text-sm text-lol-dark-400">Tournoi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500"></div>
            <span className="text-sm text-lol-dark-400">Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/20"></div>
            <span className="text-sm text-lol-dark-400">Disponibilités</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Planning
