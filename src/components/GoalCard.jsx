import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { api } from '../api.js'
import { ChevronDown, ChevronRight, Edit2 } from 'lucide-react'

export default function GoalCard({ goal }) {
  const { dispatch } = useApp()
  const [open, setOpen] = useState(true)

  const completed = goal.subtasks.filter(s => s.completed).length
  const total = goal.subtasks.length
  const pct = total ? Math.round((completed / total) * 100) : 0
  const done = pct === 100

  const toggle = async (subtaskId) => {
    try {
      const updated = await api.goals.toggleSubtask(goal.id, subtaskId)
      dispatch({ type: 'UPDATE_GOAL', goal: updated })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="rounded-xl border p-4 transition-all" style={{
      borderColor: done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
      borderLeftColor: goal.color, borderLeftWidth: 3,
      background: done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.04)',
    }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <button onClick={() => setOpen(o => !o)} className="mt-0.5 text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-semibold ${done ? 'text-white/40 line-through' : 'text-white/90'}`}>{goal.title}</span>
              {done && <span className="text-xs text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">✓ Completato</span>}
            </div>
            {goal.description && <p className="text-xs text-white/35 mt-0.5">{goal.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: done ? '#10b981' : goal.color }} />
              </div>
              <span className="text-xs text-white/30 flex-shrink-0">{completed}/{total}</span>
            </div>
          </div>
        </div>
        <button onClick={() => dispatch({ type: 'SET_MODAL', modal: { type: 'edit-goal', goal } })} className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0 mt-0.5">
          <Edit2 size={13} />
        </button>
      </div>

      {open && total > 0 && (
        <div className="ml-6 mt-3 flex flex-col gap-2">
          {goal.subtasks.map(s => (
            <button key={s.id} onClick={() => toggle(s.id)} className="flex items-center gap-2.5 group text-left">
              <div className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors" style={s.completed ? { background: goal.color, borderColor: goal.color } : { borderColor: 'rgba(255,255,255,0.2)' }}>
                {s.completed && <span className="text-white text-[10px]">✓</span>}
              </div>
              <span className={`text-sm transition-colors ${s.completed ? 'line-through text-white/25' : 'text-white/65 group-hover:text-white/80'}`}>{s.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
