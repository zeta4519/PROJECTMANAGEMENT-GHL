import { useState, useEffect } from 'react'

const CORRECT = '361207'
const STORAGE_KEY = 'pm_unlocked'

export default function PinLock({ children }) {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(STORAGE_KEY) === '1')
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === CORRECT) {
        localStorage.setItem(STORAGE_KEY, '1')
        setUnlocked(true)
      } else {
        setShake(true)
        setTimeout(() => { setPin(''); setShake(false) }, 600)
      }
    }
  }, [pin])

  if (unlocked) return children

  const press = (d) => { if (pin.length < 6) setPin(p => p + d) }
  const del = () => setPin(p => p.slice(0, -1))

  const KEYS = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    [null,'0','del'],
  ]

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#0d0d0f' }}>
      <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center text-xs font-bold text-white mb-8">P</div>
      <p className="text-white/40 text-sm mb-8 tracking-wide">Inserisci il codice</p>

      {/* Dots */}
      <div className={`flex gap-4 mb-10 ${shake ? 'animate-shake' : ''}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-150"
            style={{
              borderColor: i < pin.length ? '#6366f1' : '#ffffff22',
              background: i < pin.length ? '#6366f1' : 'transparent',
            }}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="flex flex-col gap-3">
        {KEYS.map((row, ri) => (
          <div key={ri} className="flex gap-3">
            {row.map((k, ki) => {
              if (k === null) return <div key={ki} className="w-20 h-14" />
              if (k === 'del') return (
                <button
                  key={ki}
                  onClick={del}
                  className="w-20 h-14 rounded-2xl flex items-center justify-center text-white/50 hover:text-white/80 text-lg transition-colors"
                  style={{ background: '#1a1a1d' }}
                >
                  ⌫
                </button>
              )
              return (
                <button
                  key={ki}
                  onClick={() => press(k)}
                  className="w-20 h-14 rounded-2xl text-white font-light text-2xl transition-all active:scale-95 hover:brightness-125"
                  style={{ background: '#1e1e22' }}
                >
                  {k}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0) }
          20% { transform: translateX(-8px) }
          40% { transform: translateX(8px) }
          60% { transform: translateX(-6px) }
          80% { transform: translateX(6px) }
        }
        .animate-shake { animation: shake 0.5s ease }
      `}</style>
    </div>
  )
}
