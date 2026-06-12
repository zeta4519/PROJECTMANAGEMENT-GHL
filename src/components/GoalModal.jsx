import { useState } from 'react'
import { useApp, getWeekKey } from '../store/AppContext'
import { api } from '../api.js'
import { X, Plus, Trash2 } from 'lucide-react'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e']

function uid() { return Math.random().toString(36).slice(2) }

export default function GoalModal() {
  const { state, dispatch } = useApp()
  const modal = state.modal
  if (!modal || !['new-goal', 'edit-goal'].includes(modal.type)) return null

  const existing = modal.type === 'edit-goal' ? modal.goal : null

  const [form, setForm] = useState({
    title: existing?.title || '',
    description: existing?.description || '',
    color: existing?.color || '#6366f1',
    subtasks: existing?.subtasks || [],
  })
  const [newSub, setNewSub] = useState('')
  const [saving, setSaving] = useState(false)

  const close = () => dispatch({ type: 'SET_MODAL', modal: null })

  const save = async () => {
    if (!form.title.trim() || saving) return
    setSaving(true)
    try {
      if (existing) {
        const updated = await api.goals.update(existing.id, form)
        dispatch({ type: 'UPDATE_GOAL', goal: updated })
      } else {
        const created = await api.goals.create({ ...form, weekKey: getWeekKey() })
        dispatch({ type: 'ADD_GOAL', goal: created })
      }
      close()
    } catch (e) {
      alert('Errore: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteGoal = async () => {
    if (!existing || saving) return
    setSaving(true)
    try {
      await api.goals.delete(existing.id)
      dispatch({ type: 'DELETE_GOAL', id: existing.id })
      close()
    } catch (e) {
      alert('Errore eliminazione: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const addSub = () => {
    if (!newSub.trim()) return
    setForm(f => ({ ...f, subtasks: [...f.subtasks, { id: uid(), title: newSub.trim(), completed: false }] }))
    setNewSub('')
  }
  const removeSub = (id) => setForm(f => ({ ...f, subtasks: f.subtasks.filter(s => s.id !== id) }))
  const toggleSub = (id) => setForm(f => ({ ...f, subtasks: f.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s) }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={close}>
      <div className="w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden" style={{ background: '#1a1a1d' }} onClick={e => e.stopPropagation()}>
        <div className="h-1" style={{ background: form.color }} />
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <span>🎯</span>{existing ? 'Modifica obiettivo' : 'Nuovo obiettivo settimanale'}
            </h2>
            <button onClick={close} className="text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
          </div>

          <input autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Qual è l'obiettivo di questa settimana?" className="w-full bg-transparent text-white text-base font-medium outline-none placeholder-white/20 border-b border-white/10 pb-2" onKeyDown={e => e.key === 'Enter' && save()} />

          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Contesto o note..." rows={2} className="w-full bg-white/5 text-white/70 text-sm outline-none placeholder-white/20 rounded-lg px-3 py-2 resize-none border border-white/10 focus:border-white/20" />

          <div>
            <label className="text-xs text-white/30 mb-2 block">Colore</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} className="w-6 h-6 rounded-full transition-transform hover:scale-110" style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/30 mb-2 block">Step / Sotto-obiettivi</label>
            <div className="flex flex-col gap-1.5 mb-2">
              {form.subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-2 group">
                  <button onClick={() => toggleSub(s.id)} className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors" style={s.completed ? { background: form.color, borderColor: form.color } : { borderColor: 'rgba(255,255,255,0.2)' }}>
                    {s.completed && <span className="text-white text-[10px]">✓</span>}
                  </button>
                  <span className={`text-sm flex-1 ${s.completed ? 'line-through text-white/30' : 'text-white/70'}`}>{s.title}</span>
                  <button onClick={() => removeSub(s.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSub} onChange={e => setNewSub(e.target.value)} placeholder="Aggiungi step..." className="flex-1 bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg px-3 py-1.5 outline-none placeholder-white/20 focus:border-white/20" onKeyDown={e => e.key === 'Enter' && addSub()} />
              <button onClick={addSub} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-colors"><Plus size={14} /></button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            {existing && (
              <button onClick={deleteGoal} disabled={saving} className="text-sm text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1.5 disabled:opacity-40">
                <Trash2 size={13} /> Elimina
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button onClick={close} className="px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors">Annulla</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium disabled:opacity-40" style={{ background: form.color }}>
                {saving ? 'Salvo...' : existing ? 'Salva' : 'Crea obiettivo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
