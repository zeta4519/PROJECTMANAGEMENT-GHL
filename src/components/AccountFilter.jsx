import { useApp } from '../store/AppContext'
import { ACCOUNTS } from '../store/AppContext'

export default function AccountFilter() {
  const { state, dispatch } = useApp()
  const { accountFilter } = state

  const set = (id) => dispatch({ type: 'SET_ACCOUNT_FILTER', accountId: id })

  return (
    <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-white/5" style={{ background: '#111113', paddingTop: 'max(10px, env(safe-area-inset-top))' }}>
      <span className="text-xs text-white/25 mr-1">Account:</span>
      <button
        onClick={() => set(null)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          accountFilter === null
            ? 'bg-white/15 text-white/90'
            : 'text-white/35 hover:text-white/60 hover:bg-white/8'
        }`}
      >
        Tutti
      </button>
      {ACCOUNTS.map(acc => (
        <button
          key={acc.id}
          onClick={() => set(acc.id)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            accountFilter === acc.id
              ? 'text-white/90'
              : 'text-white/35 hover:text-white/60 hover:bg-white/8'
          }`}
          style={accountFilter === acc.id ? { background: acc.color + '33', color: acc.color } : {}}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: acc.color }} />
          {acc.shortName}
        </button>
      ))}
    </div>
  )
}
