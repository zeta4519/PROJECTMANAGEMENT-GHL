import { useApp } from '../store/AppContext'
import { api } from '../api.js'
import { Circle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import UserAvatar from './UserAvatar'

const PRIORITY_DOT = { urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-gray-500', none: 'bg-gray-700' }
const PRIORITY_LABEL = { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Bassa', none: '' }

export default function TaskCard({ task, compact = false }) {
  const { state, dispatch } = useApp()
  const [subtasksOpen, setSubtasksOpen] = useState(false)
  const group = state.groups.find(g => g.id === task.groupId)
  const done = task.status === 'done'
  const completedSubs = task.subtasks.filter(s => s.completed).length
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = task.dueDate && task.dueDate < today && !done

  const openEdit = () => dispatch({ type: 'SET_MODAL', modal: { type: 'edit-task', task } })

  const toggleDone = async (e) => {
    e.stopPropagation()
    const newStatus = done ? 'todo' : 'done'
    try {
      const updated = await api.tasks.setStatus(task.id, newStatus)
      dispatch({ type: 'UPDATE_TASK', task: updated })
    } catch (e) { console.error(e) }
  }

  const toggleSub = async (e, subtaskId) => {
    e.stopPropagation()
    try {
      const updated = await api.tasks.toggleSubtask(task.id, subtaskId)
      dispatch({ type: 'UPDATE_TASK', task: updated })
    } catch (e) { console.error(e) }
  }

  const formatDate = (d) => {
    if (!d) return null
    const date = new Date(d + 'T00:00:00')
    const todayD = new Date(today + 'T00:00:00')
    const diff = Math.round((date - todayD) / 86400000)
    if (diff === 0) return 'Oggi'
    if (diff === 1) return 'Domani'
    if (diff === -1) return 'Ieri'
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  }

  return (
    <div onClick={openEdit} className={`group flex flex-col gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${done ? 'border-white/5 opacity-50' : 'border-white/8 bg-white/4 hover:bg-white/7 hover:border-white/15'}`}>
      <div className="flex items-start gap-2.5">
        <button onClick={toggleDone} className="mt-0.5 flex-shrink-0 text-white/30 hover:text-indigo-400 transition-colors">
          {done ? <CheckCircle2 size={16} className="text-green-500/60" /> : <Circle size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`text-sm font-medium leading-snug ${done ? 'line-through text-white/30' : 'text-white/85'}`}>{task.title}</span>
            {task.assigneeId && <UserAvatar userId={task.assigneeId} size={20} showTooltip />}
          </div>
          {!compact && task.description && <p className="text-xs text-white/35 mt-0.5 line-clamp-1">{task.description}</p>}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority] || 'bg-gray-700'}`} />
              {!compact && <span className="text-xs text-white/25">{PRIORITY_LABEL[task.priority]}</span>}
            </div>
            {group && (
              <div className="flex items-center gap-1">
                <span className="text-xs">{group.icon}</span>
                {!compact && <span className="text-xs text-white/25">{group.name}</span>}
              </div>
            )}
            {task.dueDate && (
              <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-white/25'}`}>{formatDate(task.dueDate)}</span>
            )}
            {task.subtasks.length > 0 && (
              <button onClick={e => { e.stopPropagation(); setSubtasksOpen(o => !o) }} className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors">
                {subtasksOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                {completedSubs}/{task.subtasks.length}
              </button>
            )}
          </div>
        </div>
      </div>

      {subtasksOpen && task.subtasks.length > 0 && (
        <div className="ml-7 flex flex-col gap-1.5 pt-1 border-t border-white/5">
          {task.subtasks.map(s => (
            <div key={s.id} className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={e => toggleSub(e, s.id)} className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${s.completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 hover:border-indigo-400'}`}>
                {s.completed && <span className="text-white text-[9px]">✓</span>}
              </button>
              <span className={`text-xs ${s.completed ? 'line-through text-white/25' : 'text-white/55'}`}>{s.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
