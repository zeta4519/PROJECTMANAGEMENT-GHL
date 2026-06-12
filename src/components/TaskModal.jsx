import { useState } from 'react'
import { useApp, USERS } from '../store/AppContext'
import { api } from '../api.js'
import { X, Plus, Trash2 } from 'lucide-react'
import UserAvatar from './UserAvatar'

const STATUSES = ['todo', 'in-progress', 'done', 'cancelled']
const PRIORITIES = ['urgent', 'high', 'medium', 'low', 'none']
const STATUS_LABEL = { todo: 'Da fare', 'in-progress': 'In corso', done: 'Fatto', cancelled: 'Annullato' }
const PRIORITY_LABEL = { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Bassa', none: 'Nessuna' }

function uid() { return Math.random().toString(36).slice(2) }

export default function TaskModal() {
  const { state, dispatch } = useApp()
  const modal = state.modal
  if (!modal || !['new-task', 'edit-task'].includes(modal.type)) return null

  const existing = modal.type === 'edit-task' ? modal.task : null
  const defaults = modal.defaults || {}
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    title: existing?.title || '',
    description: existing?.description || '',
    status: existing?.status || defaults.status || 'todo',
    priority: existing?.priority || defaults.priority || 'medium',
    dueDate: existing?.dueDate || defaults.dueDate || today,
    groupId: existing?.groupId || defaults.groupId || (state.groups[0]?.id || ''),
    accountId: existing?.accountId ?? defaults.accountId ?? state.accountFilter ?? null,
    assigneeId: existing?.assigneeId ?? defaults.assigneeId ?? null,
    subtasks: existing?.subtasks || [],
  })
  const [newSubtask, setNewSubtask] = useState('')
  const [saving, setSaving] = useState(false)

  const close = () => dispatch({ type: 'SET_MODAL', modal: null })

  const save = async () => {
    if (!form.title.trim() || saving) return
    setSaving(true)
    try {
      if (existing) {
        const updated = await api.tasks.update(existing.id, form)
        dispatch({ type: 'UPDATE_TASK', task: updated })
      } else {
        const created = await api.tasks.create(form)
        dispatch({ type: 'ADD_TASK', task: created })
      }
      close()
    } catch (e) {
      alert('Errore nel salvataggio: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteTask = async () => {
    if (!existing || saving) return
    setSaving(true)
    try {
      await api.tasks.delete(existing.id)
      dispatch({ type: 'DELETE_TASK', id: existing.id })
      close()
    } catch (e) {
      alert('Errore eliminazione: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setForm(f => ({ ...f, subtasks: [...f.subtasks, { id: uid(), title: newSubtask.trim(), completed: false }] }))
    setNewSubtask('')
  }
  const removeSubtask = (id) => setForm(f => ({ ...f, subtasks: f.subtasks.filter(s => s.id !== id) }))
  const toggleSubtask = (id) => setForm(f => ({ ...f, subtasks: f.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s) }))

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={close}>
      <div className="w-full md:max-w-xl rounded-t-2xl md:rounded-xl border-t md:border border-white/10 shadow-2xl overflow-hidden max-h-[92dvh] overflow-y-auto" style={{ background: '#1a1a1d' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-white/90">{existing ? 'Modifica task' : 'Nuovo task'}</h2>
          <button onClick={close} className="text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-4">
          <input
            autoFocus
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Titolo del task..."
            className="w-full bg-transparent text-white text-base font-medium outline-none placeholder-white/20 border-b border-white/10 pb-2"
            onKeyDown={e => e.key === 'Enter' && save()}
          />

          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Aggiungi una descrizione..."
            rows={2}
            className="w-full bg-white/5 text-white/70 text-sm outline-none placeholder-white/20 rounded-lg px-3 py-2 resize-none border border-white/10 focus:border-white/20"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/30 mb-1 block">Stato</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white/80 text-sm rounded-lg px-3 py-1.5 outline-none">
                {STATUSES.map(s => <option key={s} value={s} style={{ background: '#1a1a1d' }}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/30 mb-1 block">Priorità</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white/80 text-sm rounded-lg px-3 py-1.5 outline-none">
                {PRIORITIES.map(p => <option key={p} value={p} style={{ background: '#1a1a1d' }}>{PRIORITY_LABEL[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/30 mb-1 block">Scadenza</label>
              <input type="date" value={form.dueDate || ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full bg-white/5 border border-white/10 text-white/80 text-sm rounded-lg px-3 py-1.5 outline-none" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="text-xs text-white/30 mb-1 block">Gruppo</label>
              <select value={form.groupId || ''} onChange={e => setForm(f => ({ ...f, groupId: e.target.value || null }))} className="w-full bg-white/5 border border-white/10 text-white/80 text-sm rounded-lg px-3 py-1.5 outline-none">
                <option value="" style={{ background: '#1a1a1d' }}>— nessuno —</option>
                {state.groups.map(g => <option key={g.id} value={g.id} style={{ background: '#1a1a1d' }}>{g.icon} {g.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/30 mb-2 block">Assegna a</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setForm(f => ({ ...f, assigneeId: null }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${!form.assigneeId ? 'border-indigo-500/50 bg-indigo-500/10 text-white/80' : 'border-white/10 text-white/40 hover:border-white/20'}`}
              >
                <span className="text-xs">—</span> Nessuno
              </button>
              {USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => setForm(f => ({ ...f, assigneeId: f.assigneeId === u.id ? null : u.id }))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${form.assigneeId === u.id ? 'border-indigo-500/50 bg-indigo-500/10 text-white/80' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                >
                  <UserAvatar userId={u.id} size={20} />
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/30 mb-2 block">Subtask</label>
            <div className="flex flex-col gap-1.5 mb-2">
              {form.subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-2 group">
                  <button onClick={() => toggleSubtask(s.id)} className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${s.completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 hover:border-indigo-500'}`}>
                    {s.completed && <span className="text-white text-xs">✓</span>}
                  </button>
                  <span className={`text-sm flex-1 ${s.completed ? 'line-through text-white/30' : 'text-white/70'}`}>{s.title}</span>
                  <button onClick={() => removeSubtask(s.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)} placeholder="Aggiungi subtask..." className="flex-1 bg-white/5 border border-white/10 text-white/70 text-sm rounded-lg px-3 py-1.5 outline-none placeholder-white/20 focus:border-white/20" onKeyDown={e => e.key === 'Enter' && addSubtask()} />
              <button onClick={addSubtask} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg transition-colors"><Plus size={14} /></button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            {existing && (
              <button onClick={deleteTask} disabled={saving} className="text-sm text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1.5 disabled:opacity-40">
                <Trash2 size={13} /> Elimina
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button onClick={close} className="px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors">Annulla</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium disabled:opacity-40">
                {saving ? 'Salvo...' : existing ? 'Salva' : 'Crea task'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
