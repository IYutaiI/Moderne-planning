import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTeam } from '../context/TeamContext'
import { ChevronDown, Plus, Trash2, X, Shield, Edit2, Check } from 'lucide-react'

function TeamSelector() {
  const { teams, currentTeam, createTeam, deleteTeam, selectTeam, updateTeam } = useTeam()
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamTag, setNewTeamTag] = useState('')
  const [editingTeam, setEditingTeam] = useState(null)

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      createTeam(newTeamName.trim(), newTeamTag.trim())
      setNewTeamName('')
      setNewTeamTag('')
      setIsModalOpen(false)
    }
  }

  const handleDeleteTeam = (e, teamId) => {
    e.stopPropagation()
    if (confirm('Supprimer cette equipe et toutes ses donnees ?')) {
      deleteTeam(teamId)
    }
  }

  const handleEditTeam = (e, team) => {
    e.stopPropagation()
    setEditingTeam({ ...team })
  }

  const handleSaveEdit = (e) => {
    e.stopPropagation()
    if (editingTeam && editingTeam.name.trim()) {
      updateTeam(editingTeam.id, {
        name: editingTeam.name.trim(),
        tag: editingTeam.tag.trim() || editingTeam.name.substring(0, 3).toUpperCase()
      })
      setEditingTeam(null)
    }
  }

  return (
    <>
      {/* Team Selector Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-lol-dark-800 hover:bg-lol-dark-700 rounded-lg border border-lol-dark-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {currentTeam ? (
              <div className="text-left">
                <div className="text-sm font-medium text-white">{currentTeam.name}</div>
                <div className="text-xs text-lol-dark-400">[{currentTeam.tag}]</div>
              </div>
            ) : (
              <span className="text-sm text-lol-dark-400">Choisir une equipe</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-lol-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-lol-dark-800 border border-lol-dark-600 rounded-lg overflow-hidden z-50 shadow-xl">
            {/* Team List */}
            <div className="max-h-60 overflow-y-auto">
              {teams.length === 0 ? (
                <div className="p-4 text-center text-lol-dark-400 text-sm">
                  Aucune equipe
                </div>
              ) : (
                teams.map(team => (
                  <div
                    key={team.id}
                    onClick={() => {
                      selectTeam(team)
                      setIsOpen(false)
                    }}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-lol-dark-700 cursor-pointer ${
                      currentTeam?.id === team.id ? 'bg-purple-600/20' : ''
                    }`}
                  >
                    {editingTeam?.id === team.id ? (
                      <div className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTeam.name}
                          onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                          className="flex-1 bg-lol-dark-700 border border-lol-dark-500 rounded px-2 py-1 text-sm text-white"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editingTeam.tag}
                          onChange={(e) => setEditingTeam({ ...editingTeam, tag: e.target.value.toUpperCase() })}
                          className="w-16 bg-lol-dark-700 border border-lol-dark-500 rounded px-2 py-1 text-sm text-white"
                          maxLength={4}
                          placeholder="TAG"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-green-400 hover:text-green-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingTeam(null) }}
                          className="p-1 text-lol-dark-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{team.tag.substring(0, 2)}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{team.name}</div>
                            <div className="text-xs text-lol-dark-400">[{team.tag}]</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleEditTeam(e, team)}
                            className="p-1 text-lol-dark-400 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteTeam(e, team.id)}
                            className="p-1 text-lol-dark-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Create Team Button */}
            <div className="border-t border-lol-dark-600">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsModalOpen(true)
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-purple-400 hover:bg-lol-dark-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Creer une equipe</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-lol-dark-900 rounded-2xl border border-lol-dark-700 w-full max-w-md animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-lol-dark-700">
              <h2 className="text-xl font-bold text-white">Creer une equipe</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-lol-dark-700 text-lol-dark-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-lol-dark-400 mb-2">Nom de l'equipe</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Ex: Team Nexus"
                  className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-3 text-white placeholder-lol-dark-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-lol-dark-400 mb-2">Tag (optionnel)</label>
                <input
                  type="text"
                  value={newTeamTag}
                  onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                  placeholder="Ex: TNX"
                  maxLength={4}
                  className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg px-4 py-3 text-white placeholder-lol-dark-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-lol-dark-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-lol-dark-700 hover:bg-lol-dark-600 text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                Creer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default TeamSelector
