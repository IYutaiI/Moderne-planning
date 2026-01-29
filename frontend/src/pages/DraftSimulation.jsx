import { useState, useEffect } from 'react'
import { RotateCcw, Swords, Search } from 'lucide-react'

const DDRAGON_VERSION = '14.24.1'
const getChampionIcon = (championId) =>
  `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championId}.png`

const ROLES = {
  TOP: ['Aatrox', 'Ambessa', 'Camille', 'Darius', 'Fiora', 'Garen', 'Gnar', 'Gwen', 'Irelia', 'Jax', 'KSante', 'Mordekaiser', 'Ornn', 'Renekton', 'Riven', 'Sett', 'Shen', 'Urgot', 'Volibear'],
  JGL: ['Amumu', 'Ekko', 'Elise', 'Evelynn', 'Graves', 'Hecarim', 'JarvanIV', 'Kayn', 'Khazix', 'Kindred', 'LeeSin', 'Lillia', 'Nidalee', 'Nocturne', 'RekSai', 'Sejuani', 'Vi', 'Viego', 'XinZhao'],
  MID: ['Ahri', 'Akali', 'Anivia', 'Aurora', 'Azir', 'Cassiopeia', 'Hwei', 'Katarina', 'Leblanc', 'Lissandra', 'Orianna', 'Ryze', 'Syndra', 'Sylas', 'Taliyah', 'TwistedFate', 'Vex', 'Viktor', 'Yasuo', 'Yone', 'Zed', 'Zoe'],
  ADC: ['Aphelios', 'Ashe', 'Caitlyn', 'Draven', 'Ezreal', 'Jhin', 'Jinx', 'Kaisa', 'Kalista', 'KogMaw', 'Lucian', 'MissFortune', 'Samira', 'Sivir', 'Smolder', 'Tristana', 'Twitch', 'Varus', 'Vayne', 'Xayah', 'Zeri'],
  SUPP: ['Alistar', 'Bard', 'Blitzcrank', 'Braum', 'Janna', 'Karma', 'Leona', 'Lulu', 'Milio', 'Morgana', 'Nami', 'Nautilus', 'Pyke', 'Rakan', 'Rell', 'Renata', 'Senna', 'Seraphine', 'Sona', 'Soraka', 'Thresh', 'Yuumi']
}

function DraftSimulation() {
  const [champions, setChampions] = useState([])
  const [blueBans, setBlueBans] = useState(Array(5).fill(null))
  const [redBans, setRedBans] = useState(Array(5).fill(null))
  const [bluePicks, setBluePicks] = useState(Array(5).fill(null))
  const [redPicks, setRedPicks] = useState(Array(5).fill(null))
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('TOUT')

  useEffect(() => {
    fetchChampions()
  }, [])

  const fetchChampions = async () => {
    try {
      const res = await fetch(`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/fr_FR/champion.json`)
      const data = await res.json()
      const champList = Object.values(data.data).map(champ => ({
        id: champ.id,
        name: champ.name,
        tags: champ.tags
      })).sort((a, b) => a.name.localeCompare(b.name))
      setChampions(champList)
    } catch (error) {
      console.error('Erreur chargement champions:', error)
    }
  }

  const allSelected = [...blueBans, ...redBans, ...bluePicks, ...redPicks].filter(Boolean)

  const filteredChampions = champions.filter(champ => {
    if (allSelected.includes(champ.id)) return false
    if (searchTerm && !champ.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (roleFilter !== 'TOUT' && !ROLES[roleFilter]?.includes(champ.id)) return false
    return true
  })

  const getChampionName = (championId) => {
    const champ = champions.find(c => c.id === championId)
    return champ ? champ.name : championId
  }

  const selectChampion = (championId) => {
    if (!selectedSlot) return

    const { side, type, index } = selectedSlot

    if (side === 'blue') {
      if (type === 'ban') {
        const newBans = [...blueBans]
        newBans[index] = championId
        setBlueBans(newBans)
      } else {
        const newPicks = [...bluePicks]
        newPicks[index] = championId
        setBluePicks(newPicks)
      }
    } else {
      if (type === 'ban') {
        const newBans = [...redBans]
        newBans[index] = championId
        setRedBans(newBans)
      } else {
        const newPicks = [...redPicks]
        newPicks[index] = championId
        setRedPicks(newPicks)
      }
    }

    setSelectedSlot(null)
  }

  const reset = () => {
    setBlueBans(Array(5).fill(null))
    setRedBans(Array(5).fill(null))
    setBluePicks(Array(5).fill(null))
    setRedPicks(Array(5).fill(null))
    setSelectedSlot(null)
  }

  const BanSlot = ({ champion, side, index }) => {
    const isSelected = selectedSlot?.side === side && selectedSlot?.type === 'ban' && selectedSlot?.index === index
    const borderColor = side === 'blue' ? 'border-blue-500 bg-blue-500/20' : 'border-red-500 bg-red-500/20'

    return (
      <div
        onClick={() => setSelectedSlot({ side, type: 'ban', index })}
        className={`w-12 h-12 rounded border-2 flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
          isSelected
            ? borderColor
            : champion
            ? 'border-lol-dark-600 bg-lol-dark-700'
            : 'border-lol-dark-700 border-dashed hover:border-lol-dark-500'
        }`}
      >
        {champion && (
          <div className="relative w-full h-full">
            <img
              src={getChampionIcon(champion)}
              alt={getChampionName(champion)}
              className="w-full h-full object-cover opacity-50 grayscale"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const PickSlot = ({ champion, side, index, label }) => {
    const isSelected = selectedSlot?.side === side && selectedSlot?.type === 'pick' && selectedSlot?.index === index
    const borderColor = side === 'blue' ? 'border-blue-500' : 'border-red-500'
    const bgColor = side === 'blue' ? 'bg-blue-500/20' : 'bg-red-500/20'

    return (
      <div className={`flex items-center gap-3 ${side === 'red' ? 'flex-row-reverse' : ''}`}>
        <div className="text-xs text-lol-dark-500 w-6 text-center">{label}</div>
        <div
          onClick={() => setSelectedSlot({ side, type: 'pick', index })}
          className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
            isSelected
              ? `${borderColor} ${bgColor}`
              : champion
              ? `${borderColor} bg-lol-dark-700`
              : 'border-lol-dark-700 border-dashed hover:border-lol-dark-500'
          }`}
        >
          {champion && (
            <img
              src={getChampionIcon(champion)}
              alt={getChampionName(champion)}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className={`text-sm text-white truncate w-24 ${side === 'red' ? 'text-right' : ''}`}>
          {champion ? getChampionName(champion) : ''}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Draft Simulation</h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-lol-dark-400 hover:text-white">
            <Swords className="w-5 h-5" />
            VERSUS MODE
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 text-lol-dark-400 hover:text-white"
          >
            <RotateCcw className="w-5 h-5" />
            RESET
          </button>
        </div>
      </div>

      {/* Draft Board */}
      <div className="bg-lol-dark-800/50 rounded-2xl p-6">
        {/* Side Headers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-600 rounded-lg py-3 px-6">
            <span className="text-white font-bold">BLUE SIDE</span>
          </div>
          <div className="bg-red-600 rounded-lg py-3 px-6 text-right">
            <span className="text-white font-bold">RED SIDE</span>
          </div>
        </div>

        {/* Bans */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex gap-2">
            {blueBans.map((champ, i) => (
              <BanSlot key={i} champion={champ} side="blue" index={i} />
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            {redBans.map((champ, i) => (
              <BanSlot key={i} champion={champ} side="red" index={i} />
            ))}
          </div>
        </div>

        {/* Picks */}
        <div className="grid grid-cols-3 gap-8">
          {/* Blue Picks */}
          <div className="space-y-3">
            {['B1', 'B2', 'B3', 'B4', 'B5'].map((label, i) => (
              <PickSlot
                key={label}
                champion={bluePicks[i]}
                side="blue"
                index={i}
                label={label}
              />
            ))}
          </div>

          {/* Champion Pool */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lol-dark-500" />
              <input
                type="text"
                placeholder="Search champion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-lol-dark-800 border border-lol-dark-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-lol-dark-400"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-2 justify-center">
              {['TOUT', 'TOP', 'JGL', 'MID', 'ADC', 'SUPP'].map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1 rounded text-sm ${
                    roleFilter === role
                      ? 'bg-white text-lol-dark-900'
                      : 'bg-lol-dark-700 text-lol-dark-300 hover:bg-lol-dark-600'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Champions Grid */}
            <div className="grid grid-cols-6 gap-2 max-h-[400px] overflow-y-auto p-2">
              {filteredChampions.map(champ => (
                <button
                  key={champ.id}
                  onClick={() => selectChampion(champ.id)}
                  disabled={!selectedSlot}
                  className={`flex flex-col items-center p-1 rounded-lg transition-all ${
                    !selectedSlot
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-lol-dark-700'
                  }`}
                >
                  <img
                    src={getChampionIcon(champ.id)}
                    alt={champ.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="text-[10px] text-lol-dark-300 truncate w-full text-center mt-1">{champ.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Red Picks */}
          <div className="space-y-3">
            {['R1', 'R2', 'R3', 'R4', 'R5'].map((label, i) => (
              <PickSlot
                key={label}
                champion={redPicks[i]}
                side="red"
                index={i}
                label={label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-lol-dark-500">
        Cliquez sur un slot puis selectionnez un champion pour le placer
      </div>
    </div>
  )
}

export default DraftSimulation
