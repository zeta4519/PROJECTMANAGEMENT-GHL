import { useState } from 'react'
import { useApp, ACCOUNTS } from '../store/AppContext'
import { api } from '../api.js'
import { X } from 'lucide-react'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16']
const ICONS = ['🏢', '📣', '👤', '⚖️', '💼', '⚙️', '📊', '🎯', '💡', '📦', '🔧', '🌍']

export default function GroupModal() {
  const { state, dispatch } = useApp()
  const modal = state.modal
  if (!modal || modal.type !== 'new-group') return null

  const [form, setForm] = useState({
    name: '',
    color: '#6366f1',
    icon: '🏢',
    accountId: state.accountFilter || ACCOUNTS[0].id,
  })
  const [saving, setSaving] = useState(false)

  const close = () => dispatch({ type: 'SET_MODAL', modal: null })

  const save = async () => {
    if (!form.name.trim() || saving) return
    setSaving(true)
    try {
      const created = await api.groups.create(form)
      dispatch({ type: 'ADD_GROUP', group: created })
      close()
    } catch (e) {
      alert('Errore: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={close}>
      <div className="w-full max-w-sm rounded-xl border border-white/10 shadow-2xl" style={{ background: '#1a1a1d' }} onClick={e => e.stopPropagation()}>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90">Nuovo gruppo</h2>
            <button onClick={close} className="text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/8">
            <span className="text-xl">{form.icon}</span>
            <span className="text-sm font-medium" style={{ color: form.color }}>{form.name || 'Nome gruppo...'}</span>
          </div>

          <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome del gruppo" className="w-full bg-white/5 border border-white/10 text-white/80 text-sm rounded-lg px-3 py-2 outline-none placeholder-white/20 focus:border-white/25" onKeyDown={e => e.key === 'Enter' && save()} />

          <div>
            <label className="text-xs text-white/30 mb-2 block">Icona</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${form.icon === ic ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>{ic}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/30 mb-2 block">Colore</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} className="w-6 h-6 rounded-full transition-transform hover:scale-110" style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/30 mb-2 block">Account</label>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setForm(f => ({ ...f, accountId: null }))} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${form.accountId === null ? 'bg-white/15 text-white/80' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                Personale
              </button>
              {ACCOUNTS.map(acc => (
                <button key={acc.id} onClick={() => setForm(f => ({ ...f, accountId: acc.id }))} className="px-3 py-1.5 rounded-lg text-xs transition-colors" style={form.accountId === acc.id ? { background: acc.color + '33', color: acc.color } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                  {acc.shortName}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button onClick={close} className="px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors">Annulla</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium disabled:opacity-40" style={{ background: form.color }}>
              {saving ? 'Creo...' : 'Crea gruppo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
