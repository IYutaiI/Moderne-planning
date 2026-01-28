import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Edit2, Trash2, X, Save, Users } from 'lucide-react'

const EVENT_TYPES = [
  { value: 'training', label: 'Entraînement', color: 'bg-lol-blue-500' },
  { value: 'match', label: 'Match', color: 'bg-red-500' },
  { value: 'tournament', label: 'Tournoi', color: 'bg-lol-gold-500' },
  { value: 'review', label: 'Review VOD', color: 'bg-purple-500' }
]

function Events() {
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'training',
    event_date: '',
    start_time: '20:00',
    end_time: '22:00',
    participant_ids: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [eventsRes, membersRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/members')
      ])
      setEvents(await eventsRes.json())
      setMembers(await membersRes.json())
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      fetchData()
      closeModal()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event)
      setFormData({
        title: event.title,
        description: event.description || '',
        event_type: event.event_type,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        participant_ids: []
      })
    } else {
      setEditingEvent(null)
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        title: '',
        description: '',
        event_type: 'training',
        event_date: today,
        start_time: '20:00',
        end_time: '22:00',
        participant_ids: []
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
  }

  const toggleParticipant = (memberId) => {
    setFormData(prev => ({
      ...prev,
      participant_ids: prev.participant_ids.includes(memberId)
        ? prev.participant_ids.filter(id => id !== memberId)
        : [...prev.participant_ids, memberId]
    }))
  }

  const getEventTypeInfo = (type) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0]
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date())
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date())

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Événements</h1>
          <p className="text-lol-dark-400">Gérez les entraînements, matchs et tournois</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouvel événement
        </button>
      </div>

      {/* Event Type Filter */}
      <div className="flex items-center gap-3">
        {EVENT_TYPES.map(type => (
          <div key={type.value} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-lol-dark-800 border border-lol-dark-700">
            <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
            <span className="text-sm text-lol-dark-300">{type.label}</span>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-lol-blue-400" />
          Événements à venir ({upcomingEvents.length})
        </h2>

        {upcomingEvents.length === 0 ? (
          <div className="card text-center py-12">
            <CalendarDays className="w-16 h-16 text-lol-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun événement prévu</h3>
            <p className="text-lol-dark-400 mb-6">Planifiez votre prochain entraînement ou match</p>
            <button onClick={() => openModal()} className="btn-gold">
              <Plus className="w-5 h-5 inline mr-2" />
              Créer un événement
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingEvents.map(event => {
              const typeInfo = getEventTypeInfo(event.event_type)
              return (
                <div key={event.id} className="card group flex items-center gap-6">
                  <div className={`w-2 h-16 rounded-full ${typeInfo.color}`}></div>

                  <div className="text-center min-w-[80px]">
                    <p className="text-3xl font-bold text-white">
                      {new Date(event.event_date).getDate()}
                    </p>
                    <p className="text-sm text-lol-dark-400">
                      {new Date(event.event_date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </p>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{event.title}</h3>
                    <p className="text-sm text-lol-dark-400">{formatDate(event.event_date)}</p>
                    {event.description && (
                      <p className="text-sm text-lol-dark-500 mt-1">{event.description}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">
                      {event.start_time} - {event.end_time}
                    </p>
                    <span className={`inline-block px-3 py-1 mt-2 text-xs font-medium rounded-full ${typeInfo.color}/20 text-white`}>
                      {typeInfo.label}
                    </span>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(event)}
                      className="p-2 rounded-lg bg-lol-dark-700 hover:bg-lol-dark-600 text-lol-dark-300 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 rounded-lg bg-lol-dark-700 hover:bg-red-500/20 text-lol-dark-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-lol-dark-500 mb-4">
            Événements passés ({pastEvents.length})
          </h2>
          <div className="grid gap-3 opacity-60">
            {pastEvents.slice(0, 5).map(event => {
              const typeInfo = getEventTypeInfo(event.event_type)
              return (
                <div key={event.id} className="card flex items-center gap-4 py-4">
                  <div className={`w-2 h-10 rounded-full ${typeInfo.color} opacity-50`}></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lol-dark-400">{event.title}</h3>
                    <p className="text-sm text-lol-dark-600">{formatDate(event.event_date)}</p>
                  </div>
                  <span className="text-sm text-lol-dark-500">
                    {event.start_time} - {event.end_time}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-lol-dark-800 rounded-2xl border border-lol-dark-600 w-full max-w-lg animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700 sticky top-0 bg-lol-dark-800">
              <h2 className="text-xl font-bold text-white">
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="Ex: Entraînement Clash"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Type d'événement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, event_type: type.value })}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                        formData.event_type === type.value
                          ? `${type.color}/20 border-${type.color.replace('bg-', '')} text-white`
                          : 'bg-lol-dark-900 border-lol-dark-600 text-lol-dark-400 hover:border-lol-dark-500'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Date *
                </label>
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
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                    Début *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                    Fin *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[80px] resize-none"
                  placeholder="Détails de l'événement..."
                />
              </div>

              {!editingEvent && members.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-lol-dark-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Participants
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {members.map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleParticipant(member.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
                          formData.participant_ids.includes(member.id)
                            ? 'bg-lol-blue-500/20 border-lol-blue-500 text-white'
                            : 'bg-lol-dark-900 border-lol-dark-600 text-lol-dark-400 hover:border-lol-dark-500'
                        }`}
                      >
                        <span className="font-medium">{member.pseudo}</span>
                        <span className="text-xs opacity-60">{member.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingEvent ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events
