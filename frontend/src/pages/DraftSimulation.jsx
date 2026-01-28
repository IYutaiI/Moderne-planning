import { useState } from 'react'
import { RotateCcw, Swords, Search } from 'lucide-react'

const CHAMPIONS = [
  'Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Ambessa', 'Amumu', 'Anivia', 'Annie',
  'Aphelios', 'Ashe', 'Aurelion Sol', 'Aurora', 'Azir', 'Bard', 'Belveth', 'Blitzcrank',
  'Brand', 'Braum', 'Briar', 'Caitlyn', 'Camille', 'Cassiopeia', 'Chogath', 'Corki',
  'Darius', 'Diana', 'Dr. Mundo', 'Draven', 'Ekko', 'Elise', 'Evelynn', 'Ezreal',
  'Fiddlesticks', 'Fiora', 'Fizz', 'Galio', 'Gangplank', 'Garen', 'Gnar', 'Gragas',
  'Graves', 'Gwen', 'Hecarim', 'Heimerdinger', 'Hwei', 'Illaoi', 'Irelia', 'Ivern',
  'Janna', 'Jarvan IV', 'Jax', 'Jayce', 'Jhin', 'Jinx', 'Kaisa', 'Kalista', 'Karma',
  'Karthus', 'Kassadin', 'Katarina', 'Kayle', 'Kayn', 'Kennen', 'Khazix', 'Kindred',
  'Kled', 'Kogmaw', 'Ksante', 'Leblanc', 'Lee Sin', 'Leona', 'Lillia', 'Lissandra',
  'Lucian', 'Lulu', 'Lux', 'Malphite', 'Malzahar', 'Maokai', 'Master Yi', 'Milio',
  'Miss Fortune', 'Mordekaiser', 'Morgana', 'Naafiri', 'Nami', 'Nasus', 'Nautilus',
  'Neeko', 'Nidalee', 'Nilah', 'Nocturne', 'Nunu', 'Olaf', 'Orianna', 'Ornn', 'Pantheon',
  'Poppy', 'Pyke', 'Qiyana', 'Quinn', 'Rakan', 'Rammus', 'Rek\'Sai', 'Rell', 'Renata',
  'Renekton', 'Rengar', 'Riven', 'Rumble', 'Ryze', 'Samira', 'Sejuani', 'Senna', 'Seraphine',
  'Sett', 'Shaco', 'Shen', 'Shyvana', 'Singed', 'Sion', 'Sivir', 'Skarner', 'Smolder',
  'Sona', 'Soraka', 'Swain', 'Sylas', 'Syndra', 'Tahm Kench', 'Taliyah', 'Talon', 'Taric',
  'Teemo', 'Thresh', 'Tristana', 'Trundle', 'Tryndamere', 'Twisted Fate', 'Twitch', 'Udyr',
  'Urgot', 'Varus', 'Vayne', 'Veigar', 'Vel\'Koz', 'Vex', 'Vi', 'Viego', 'Viktor', 'Vladimir',
  'Volibear', 'Warwick', 'Wukong', 'Xayah', 'Xerath', 'Xin Zhao', 'Yasuo', 'Yone', 'Yorick',
  'Yuumi', 'Zac', 'Zed', 'Zeri', 'Ziggs', 'Zilean', 'Zoe', 'Zyra'
]

const ROLES = {
  TOP: ['Aatrox', 'Camille', 'Darius', 'Fiora', 'Garen', 'Gnar', 'Gwen', 'Irelia', 'Jax', 'Ksante', 'Mordekaiser', 'Ornn', 'Renekton', 'Riven', 'Sett', 'Shen', 'Urgot', 'Volibear'],
  JGL: ['Amumu', 'Ekko', 'Elise', 'Evelynn', 'Graves', 'Hecarim', 'Jarvan IV', 'Kayn', 'Khazix', 'Kindred', 'Lee Sin', 'Lillia', 'Nidalee', 'Nocturne', 'Rek\'Sai', 'Sejuani', 'Vi', 'Viego', 'Xin Zhao'],
  MID: ['Ahri', 'Akali', 'Anivia', 'Azir', 'Cassiopeia', 'Katarina', 'Leblanc', 'Lissandra', 'Orianna', 'Ryze', 'Syndra', 'Sylas', 'Taliyah', 'Twisted Fate', 'Vex', 'Viktor', 'Yasuo', 'Yone', 'Zed', 'Zoe'],
  ADC: ['Aphelios', 'Ashe', 'Caitlyn', 'Draven', 'Ezreal', 'Jhin', 'Jinx', 'Kaisa', 'Kalista', 'Kogmaw', 'Lucian', 'Miss Fortune', 'Samira', 'Sivir', 'Tristana', 'Twitch', 'Varus', 'Vayne', 'Xayah', 'Zeri'],
  SUPP: ['Alistar', 'Bard', 'Blitzcrank', 'Braum', 'Janna', 'Karma', 'Leona', 'Lulu', 'Milio', 'Morgana', 'Nami', 'Nautilus', 'Pyke', 'Rakan', 'Rell', 'Renata', 'Senna', 'Seraphine', 'Sona', 'Soraka', 'Thresh', 'Yuumi']
}

function DraftSimulation() {
  const [blueBans, setBlueBans] = useState(Array(5).fill(null))
  const [redBans, setRedBans] = useState(Array(5).fill(null))
  const [bluePicks, setBluePicks] = useState(Array(5).fill(null))
  const [redPicks, setRedPicks] = useState(Array(5).fill(null))
  const [selectedSlot, setSelectedSlot] = useState(null) // { side: 'blue'|'red', type: 'ban'|'pick', index: 0-4 }
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('TOUT')

  const allSelected = [...blueBans, ...redBans, ...bluePicks, ...redPicks].filter(Boolean)

  const filteredChampions = CHAMPIONS.filter(champ => {
    if (allSelected.includes(champ)) return false
    if (searchTerm && !champ.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (roleFilter !== 'TOUT' && !ROLES[roleFilter]?.includes(champ)) return false
    return true
  })

  const selectChampion = (champion) => {
    if (!selectedSlot) return

    const { side, type, index } = selectedSlot

    if (side === 'blue') {
      if (type === 'ban') {
        const newBans = [...blueBans]
        newBans[index] = champion
        setBlueBans(newBans)
      } else {
        const newPicks = [...bluePicks]
        newPicks[index] = champion
        setBluePicks(newPicks)
      }
    } else {
      if (type === 'ban') {
        const newBans = [...redBans]
        newBans[index] = champion
        setRedBans(newBans)
      } else {
        const newPicks = [...redPicks]
        newPicks[index] = champion
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

  const ChampionSlot = ({ champion, side, type, index, label }) => {
    const isSelected = selectedSlot?.side === side && selectedSlot?.type === type && selectedSlot?.index === index
    const bgColor = side === 'blue' ? 'border-blue-500' : 'border-red-500'

    return (
      <div className="flex items-center gap-2">
        {side === 'blue' && (
          <button
            onClick={() => setSelectedSlot({ side, type, index })}
            className="text-xs text-lol-dark-400 hover:text-white px-2 py-1 rounded bg-lol-dark-700"
          >
            SELECT
          </button>
        )}
        <div className="text-xs text-lol-dark-500 w-6">{label}</div>
        <div
          onClick={() => setSelectedSlot({ side, type, index })}
          className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
            isSelected
              ? `${bgColor} bg-white/10`
              : champion
              ? 'border-lol-dark-600 bg-lol-dark-700'
              : 'border-lol-dark-700 border-dashed hover:border-lol-dark-500'
          }`}
        >
          {champion ? (
            <span className="text-xs text-white text-center px-1">{champion}</span>
          ) : null}
        </div>
        {side === 'red' && (
          <button
            onClick={() => setSelectedSlot({ side, type, index })}
            className="text-xs text-lol-dark-400 hover:text-white px-2 py-1 rounded bg-lol-dark-700"
          >
            SELECT
          </button>
        )}
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
              <div
                key={i}
                onClick={() => setSelectedSlot({ side: 'blue', type: 'ban', index: i })}
                className={`w-12 h-12 rounded border-2 flex items-center justify-center cursor-pointer ${
                  selectedSlot?.side === 'blue' && selectedSlot?.type === 'ban' && selectedSlot?.index === i
                    ? 'border-blue-500 bg-blue-500/20'
                    : champ
                    ? 'border-lol-dark-600 bg-lol-dark-700'
                    : 'border-lol-dark-700 border-dashed'
                }`}
              >
                {champ && <span className="text-[10px] text-white">{champ.substring(0, 3)}</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            {redBans.map((champ, i) => (
              <div
                key={i}
                onClick={() => setSelectedSlot({ side: 'red', type: 'ban', index: i })}
                className={`w-12 h-12 rounded border-2 flex items-center justify-center cursor-pointer ${
                  selectedSlot?.side === 'red' && selectedSlot?.type === 'ban' && selectedSlot?.index === i
                    ? 'border-red-500 bg-red-500/20'
                    : champ
                    ? 'border-lol-dark-600 bg-lol-dark-700'
                    : 'border-lol-dark-700 border-dashed'
                }`}
              >
                {champ && <span className="text-[10px] text-white">{champ.substring(0, 3)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Picks */}
        <div className="grid grid-cols-3 gap-8">
          {/* Blue Picks */}
          <div className="space-y-3">
            {['B1', 'B2', 'B3', 'B4', 'B5'].map((label, i) => (
              <ChampionSlot
                key={label}
                champion={bluePicks[i]}
                side="blue"
                type="pick"
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
                className="input pl-10"
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
                  key={champ}
                  onClick={() => selectChampion(champ)}
                  disabled={!selectedSlot}
                  className={`aspect-square rounded-lg bg-lol-dark-700 hover:bg-lol-dark-600 flex flex-col items-center justify-center p-1 transition-all ${
                    !selectedSlot ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="w-10 h-10 rounded bg-lol-dark-600 mb-1"></div>
                  <span className="text-[10px] text-lol-dark-300 truncate w-full text-center">{champ}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Red Picks */}
          <div className="space-y-3">
            {['R1', 'R2', 'R3', 'R4', 'R5'].map((label, i) => (
              <ChampionSlot
                key={label}
                champion={redPicks[i]}
                side="red"
                type="pick"
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
