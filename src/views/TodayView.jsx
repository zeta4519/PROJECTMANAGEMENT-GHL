import { useApp } from '../store/AppContext'
import { useFilteredTasks } from '../store/useFilteredTasks'
import TaskCard from '../components/TaskCard'
import { Plus, Sun } from 'lucide-react'

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 }

export default function TodayView() {
  const { dispatch } = useApp()
  const tasks = useFilteredTasks()
  const today = new Date().toISOString().split('T')[0]

  const todayTasks = tasks
    .filter(t => t.dueDate === today)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const pending = todayTasks.filter(t => t.status !== 'done')
  const done = todayTasks.filter(t => t.status === 'done')

  const dayName = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })

  const openNew = () => dispatch({ type: 'SET_MODAL', modal: { type: 'new-task' } })

  const completionPct = todayTasks.length ? Math.round((done.length / todayTasks.length) * 100) : 0

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 max-w-2xl w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Sun size={20} className="text-yellow-400" />
          <h1 className="text-xl font-semibold text-white/90">Oggi</h1>
        </div>
        <p className="text-sm text-white/35 capitalize">{dayName}</p>

        {/* Progress bar */}
        {todayTasks.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-xs text-white/30">{done.length}/{todayTasks.length} completati</span>
          </div>
        )}
      </div>

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col gap-2">
            {pending.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}

      {/* Add task button */}
      <button
        onClick={openNew}
        className="flex items-center gap-2 text-sm text-white/25 hover:text-white/50 transition-colors py-2 group mb-6"
      >
        <Plus size={14} className="group-hover:text-indigo-400 transition-colors" />
        Aggiungi task
      </button>

      {/* Done section */}
      {done.length > 0 && (
        <div>
          <p className="text-xs text-white/25 uppercase tracking-wider mb-3">Completati</p>
          <div className="flex flex-col gap-2">
            {done.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}

      {todayTasks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-white/40 text-sm">Nessun task per oggi</p>
          <button onClick={openNew} className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition-colors">+ Aggiungi il primo</button>
        </div>
      )}
    </div>
  )
}
