import { useApp } from '../store/AppContext'
import { getWeekKey } from '../store/AppContext'
import { useFilteredTasks } from '../store/useFilteredTasks'
import TaskCard from '../components/TaskCard'
import GoalCard from '../components/GoalCard'
import { Plus, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

function getWeekDays(refDate) {
  const day = refDate.getDay()
  const monday = new Date(refDate)
  monday.setDate(refDate.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function isGoalDone(goal) {
  return goal.subtasks.length > 0 && goal.subtasks.every(s => s.completed)
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function WeeklyView() {
  const { state, dispatch } = useApp()
  const tasks = useFilteredTasks()
  const [weekOffset, setWeekOffset] = useState(0)

  const refDate = new Date()
  refDate.setDate(refDate.getDate() + weekOffset * 7)

  const days = getWeekDays(refDate)
  const todayStr = new Date().toISOString().split('T')[0]
  const weekKey = getWeekKey(refDate)
  const currentWeekKey = getWeekKey()
  const isCurrentWeek = weekOffset === 0

  let weekGoals = state.goals.filter(g => g.weekKey === weekKey)
  if (isCurrentWeek) {
    const carried = state.goals.filter(g => g.weekKey !== weekKey && g.weekKey < currentWeekKey && !isGoalDone(g))
    weekGoals = [...weekGoals, ...carried]
  }

  const openNew = (dueDate) => dispatch({ type: 'SET_MODAL', modal: { type: 'new-task', defaults: { dueDate } } })
  const openNewGoal = () => dispatch({ type: 'SET_MODAL', modal: { type: 'new-goal', defaults: { weekKey } } })

  const stats = {
    total: 0, done: 0, urgent: 0,
  }

  days.forEach(d => {
    const ds = d.toISOString().split('T')[0]
    tasks.filter(t => t.dueDate === ds).forEach(t => {
      stats.total++
      if (t.status === 'done') stats.done++
      if (t.priority === 'urgent') stats.urgent++
    })
  })

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      {/* Goals section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-white/40" />
            <span className="text-sm font-semibold text-white/70">Obiettivi della settimana</span>
            <span className="text-xs text-white/25 bg-white/8 px-1.5 py-0.5 rounded-full">{weekGoals.length}</span>
          </div>
          <button
            onClick={openNewGoal}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-indigo-400 transition-colors"
          >
            <Plus size={13} /> Aggiungi obiettivo
          </button>
        </div>
        {weekGoals.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {weekGoals.map(g => <GoalCard key={g.id} goal={g} carriedOver={g.weekKey !== weekKey} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
            <p className="text-white/25 text-sm mb-2">Nessun obiettivo per questa settimana</p>
            <button onClick={openNewGoal} className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">+ Crea il primo obiettivo</button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => setWeekOffset(o => o - 1)} className="text-white/30 hover:text-white/70 transition-colors p-1">
              <ChevronLeft size={16} />
            </button>
            <h1 className="text-xl font-semibold text-white/90">
              {isCurrentWeek ? 'Questa settimana' : weekOffset > 0 ? 'Settimana prossima' : 'Settimana passata'}
            </h1>
            <button onClick={() => setWeekOffset(o => o + 1)} className="text-white/30 hover:text-white/70 transition-colors p-1">
              <ChevronRight size={16} />
            </button>
            {!isCurrentWeek && (
              <button onClick={() => setWeekOffset(0)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors ml-1">
                Oggi
              </button>
            )}
          </div>
          <p className="text-sm text-white/35">
            {days[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} — {days[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        {/* Stats */}
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-white/80">{stats.total}</div>
            <div className="text-xs text-white/30">Task</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-400">{stats.done}</div>
            <div className="text-xs text-white/30">Fatti</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-400">{stats.urgent}</div>
            <div className="text-xs text-white/30">Urgenti</div>
          </div>
        </div>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, i) => {
          const ds = day.toISOString().split('T')[0]
          const isToday = ds === todayStr
          const isPast = ds < todayStr
          const dayTasks = tasks.filter(t => t.dueDate === ds)
          const pending = dayTasks.filter(t => t.status !== 'done')
          const done = dayTasks.filter(t => t.status === 'done')

          return (
            <div
              key={ds}
              className={`rounded-xl border p-3 flex flex-col min-h-48 ${
                isToday
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : isPast
                  ? 'border-white/5 bg-white/2 opacity-60'
                  : 'border-white/8 bg-white/3'
              }`}
            >
              {/* Day header */}
              <div className="mb-3">
                <div className="text-xs text-white/30 uppercase tracking-wider">{DAY_NAMES[i]}</div>
                <div className={`text-lg font-semibold mt-0.5 ${isToday ? 'text-indigo-400' : 'text-white/70'}`}>
                  {day.getDate()}
                </div>
                {isToday && <div className="text-xs text-indigo-400/70 mt-0.5">Oggi</div>}
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-1.5 flex-1">
                {pending.map(t => (
                  <div
                    key={t.id}
                    onClick={() => dispatch({ type: 'SET_MODAL', modal: { type: 'edit-task', task: t } })}
                    className="px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors hover:bg-white/10 border border-white/8 bg-white/5"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        t.priority === 'urgent' ? 'bg-red-500' :
                        t.priority === 'high' ? 'bg-orange-400' :
                        t.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-500'
                      }`} />
                      <span className="text-white/75 truncate leading-tight">{t.title}</span>
                    </div>
                    {t.subtasks.length > 0 && (
                      <div className="text-white/25 mt-1 text-[10px]">
                        {t.subtasks.filter(s => s.completed).length}/{t.subtasks.length} subtask
                      </div>
                    )}
                  </div>
                ))}
                {done.map(t => (
                  <div key={t.id} className="px-2 py-1.5 rounded-md text-xs opacity-35">
                    <span className="text-white/50 line-through truncate block">{t.title}</span>
                  </div>
                ))}
              </div>

              {/* Add */}
              {!isPast && (
                <button
                  onClick={() => openNew(ds)}
                  className="mt-2 text-xs text-white/20 hover:text-indigo-400 transition-colors text-left"
                >
                  + aggiungi
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
