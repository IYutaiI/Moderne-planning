import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const TeamContext = createContext()

export function TeamProvider({ children }) {
  const { authFetch, isAuthenticated } = useAuth()
  const [teams, setTeams] = useState([])
  const [currentTeam, setCurrentTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams()
    } else {
      setTeams([])
      setCurrentTeam(null)
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchTeams = async () => {
    try {
      const res = await authFetch('/api/teams')
      const data = await res.json()
      setTeams(data)

      // Load last selected team
      const lastTeamId = localStorage.getItem('currentTeamId')
      if (lastTeamId) {
        const team = data.find(t => t.id === lastTeamId)
        if (team) setCurrentTeam(team)
      }
    } catch (error) {
      console.error('Erreur chargement equipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (name, tag) => {
    const newTeam = {
      id: `team_${Date.now()}`,
      name,
      tag: tag || name.substring(0, 3).toUpperCase()
    }

    try {
      const res = await authFetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam)
      })
      const data = await res.json()
      const updatedTeams = [...teams, data]
      setTeams(updatedTeams)
      selectTeam(data)
      return data
    } catch (error) {
      console.error('Erreur creation equipe:', error)
      throw error
    }
  }

  const deleteTeam = async (teamId) => {
    try {
      await authFetch(`/api/teams/${teamId}`, { method: 'DELETE' })
      const updatedTeams = teams.filter(t => t.id !== teamId)
      setTeams(updatedTeams)

      if (currentTeam?.id === teamId) {
        if (updatedTeams.length > 0) {
          selectTeam(updatedTeams[0])
        } else {
          setCurrentTeam(null)
          localStorage.removeItem('currentTeamId')
        }
      }
    } catch (error) {
      console.error('Erreur suppression equipe:', error)
      throw error
    }
  }

  const selectTeam = (team) => {
    setCurrentTeam(team)
    localStorage.setItem('currentTeamId', team.id)
  }

  const updateTeam = async (teamId, updates) => {
    try {
      await authFetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const updatedTeams = teams.map(t =>
        t.id === teamId ? { ...t, ...updates } : t
      )
      setTeams(updatedTeams)

      if (currentTeam?.id === teamId) {
        setCurrentTeam({ ...currentTeam, ...updates })
      }
    } catch (error) {
      console.error('Erreur mise a jour equipe:', error)
      throw error
    }
  }

  const inviteUser = async (teamId, email) => {
    try {
      const res = await authFetch(`/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur invitation:', error)
      throw error
    }
  }

  return (
    <TeamContext.Provider value={{
      teams,
      currentTeam,
      loading,
      createTeam,
      deleteTeam,
      selectTeam,
      updateTeam,
      inviteUser,
      refreshTeams: fetchTeams
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}
