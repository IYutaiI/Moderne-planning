import { createContext, useContext, useState, useEffect } from 'react'

const TeamContext = createContext()

export function TeamProvider({ children }) {
  const [teams, setTeams] = useState([])
  const [currentTeam, setCurrentTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams')
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
      // Fallback to localStorage if API fails
      const savedTeams = localStorage.getItem('teams')
      if (savedTeams) {
        const parsedTeams = JSON.parse(savedTeams)
        setTeams(parsedTeams)
        const lastTeamId = localStorage.getItem('currentTeamId')
        if (lastTeamId) {
          const team = parsedTeams.find(t => t.id === lastTeamId)
          if (team) setCurrentTeam(team)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (name, tag) => {
    const newTeam = {
      id: `team_${Date.now()}`,
      name,
      tag: tag || name.substring(0, 3).toUpperCase(),
      createdAt: new Date().toISOString()
    }

    try {
      await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam)
      })
    } catch (error) {
      console.error('Erreur creation equipe:', error)
    }

    // Also save to localStorage as backup
    const updatedTeams = [...teams, newTeam]
    setTeams(updatedTeams)
    localStorage.setItem('teams', JSON.stringify(updatedTeams))
    selectTeam(newTeam)
    return newTeam
  }

  const deleteTeam = async (teamId) => {
    try {
      await fetch(`/api/teams/${teamId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Erreur suppression equipe:', error)
    }

    const updatedTeams = teams.filter(t => t.id !== teamId)
    setTeams(updatedTeams)
    localStorage.setItem('teams', JSON.stringify(updatedTeams))

    // Clean up localStorage data
    localStorage.removeItem(`compositions_${teamId}`)
    localStorage.removeItem(`gameHistory_${teamId}`)

    // If current team was deleted, switch to another
    if (currentTeam?.id === teamId) {
      if (updatedTeams.length > 0) {
        selectTeam(updatedTeams[0])
      } else {
        setCurrentTeam(null)
        localStorage.removeItem('currentTeamId')
      }
    }
  }

  const selectTeam = (team) => {
    setCurrentTeam(team)
    localStorage.setItem('currentTeamId', team.id)
  }

  const updateTeam = async (teamId, updates) => {
    try {
      await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error('Erreur mise a jour equipe:', error)
    }

    const updatedTeams = teams.map(t =>
      t.id === teamId ? { ...t, ...updates } : t
    )
    setTeams(updatedTeams)
    localStorage.setItem('teams', JSON.stringify(updatedTeams))

    if (currentTeam?.id === teamId) {
      setCurrentTeam({ ...currentTeam, ...updates })
    }
  }

  // Helper to get storage key for current team
  const getStorageKey = (key) => {
    if (!currentTeam) return null
    return `${key}_${currentTeam.id}`
  }

  // Helper to get/set team-specific data from localStorage
  const getTeamData = (key, defaultValue = null) => {
    const storageKey = getStorageKey(key)
    if (!storageKey) return defaultValue
    const data = localStorage.getItem(storageKey)
    return data ? JSON.parse(data) : defaultValue
  }

  const setTeamData = (key, value) => {
    const storageKey = getStorageKey(key)
    if (!storageKey) return
    localStorage.setItem(storageKey, JSON.stringify(value))
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
      getStorageKey,
      getTeamData,
      setTeamData
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
