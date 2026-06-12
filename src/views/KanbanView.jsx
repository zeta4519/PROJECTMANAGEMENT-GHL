import { useApp } from '../store/AppContext'
import { useFilteredTasks } from '../store/useFilteredTasks'
import { api } from '../api.js'
import { useState, useRef } from 'react'
import { Plus, Circle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'

const COLUMNS = [
  { id: 'todo',        label: 'Da fare',   color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
  { id: 'in-progress', label: 'In corso',  color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
  { id: 'done',        label: 'Fatto',     color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
  { id: 'cancelled',   label: 'Annullato', color: '#ef4444', bg: 'rgba(239,68,68,0.08)'   },
]

const PRIORITY_DOT = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#6b7280', none: '#374151' }

function KanbanCard({ task, onDragStart }) {
  const { state, dispatch } = useApp()
  const [subsOpen, setSubsOpen] = useState(false)
  const group = state.groups.find(g => g.id === task.groupId)
  const done = task.status === 'done'
  const completed = task.subtasks.filter(s => s.completed).length

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      onClick={() => dispatch({ type: 'SET_MODAL', modal: { type: 'edit-task', task } })}
      className="rounded-lg border border-white/8 bg-white/4 hover:bg-white/7 hover:border-white/15 px-3 py-2.5 cursor-grab active:cursor-grabbing select-none transition-all group"
    >
      <div className="flex items-start gap-2">
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation()
            dispatch({ type: 'SET_TASK_STATUS', id: task.id, status: done ? 'todo' : 'done' })
          }}
          className="mt-0.5 flex-shrink-0 text-white/25 hover:text-indigo-400 transition-colors"
        >
          {done
            ? <CheckCircle2 size={15} className="text-green-500/60" />
            : <Circle size={15} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${done ? 'line-through text-white/30' : 'text-white/85'}`}>
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_DOT[task.priority] }} />
            {group && <span className="text-xs">{group.icon}</span>}
            {task.subtasks.length > 0 && (
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); setSubsOpen(o => !o) }}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white/50"
              >
                {subsOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                {completed}/{task.subtasks.length}
              </button>
            )}
          </div>

          {subsOpen && (
            <div className="mt-2 flex flex-col gap-1.5 border-t border-white/5 pt-2">
              {task.subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-1.5" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_SUBTASK', taskId: task.id, subtaskId: s.id })}
                    className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${s.completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 hover:border-indigo-400'}`}
                  >
                    {s.completed && <span className="text-white text-[9px]">✓</span>}
                  </button>
                  <span className={`text-xs ${s.completed ? 'line-through text-white/25' : 'text-white/55'}`}>{s.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function KanbanView() {
  const { dispatch } = useApp()
  const tasks = useFilteredTasks()
  const [dragOverCol, setDragOverCol] = useState(null)
  const dragTaskId = useRef(null)

  const openNew = (status) => dispatch({ type: 'SET_MODAL', modal: { type: 'new-task', defaults: { status } } })

  const handleDragStart = (e, taskId) => {
    dragTaskId.current = taskId
    e.dataTransfer.effectAllowed = 'move'
    // minimal ghost — browser default is fine
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }

  const handleDrop = async (e, colId) => {
    e.preventDefault()
    if (dragTaskId.current) {
      const id = dragTaskId.current
      dragTaskId.current = null
      setDragOverCol(null)
      try {
        const updated = await api.tasks.setStatus(id, colId)
        dispatch({ type: 'UPDATE_TASK', task: updated })
      } catch (err) { console.error(err) }
    } else {
      setDragOverCol(null)
    }
  }

  const handleDragEnd = () => {
    dragTaskId.current = null
    setDragOverCol(null)
  }

  return (
    <div className="flex-1 overflow-x-auto px-8 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white/90">Kanban</h1>
        <p className="text-sm text-white/35 mt-1">Trascina le card per cambiare stato</p>
      </div>

      <div className="flex gap-4 min-w-max pb-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id)
          const isOver = dragOverCol === col.id

          return (
            <div
              key={col.id}
              className="w-72 flex flex-col"
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-medium text-white/70">{col.label}</span>
                  <span className="text-xs text-white/30 bg-white/8 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <button onClick={() => openNew(col.id)} className="text-white/25 hover:text-white/60 transition-colors">
                  <Plus size={14} />
                </button>
              </div>

              {/* Drop zone */}
              <div
                className="flex flex-col gap-2 p-2 rounded-xl min-h-32 transition-all duration-150 border"
                style={{
                  background: isOver ? col.color + '18' : col.bg,
                  borderColor: isOver ? col.color + '60' : 'rgba(255,255,255,0.05)',
                }}
              >
                {colTasks.map(t => (
                  <KanbanCard
                    key={t.id}
                    task={t}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className={`flex items-center justify-center h-20 text-xs transition-colors ${isOver ? 'text-white/40' : 'text-white/15'}`}>
                    {isOver ? 'Rilascia qui' : 'Nessun task'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
