import { useApp } from '../store/AppContext'
import { useFilteredTasks, useFilteredGroups } from '../store/useFilteredTasks'
import TaskCard from '../components/TaskCard'
import { Plus, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 }

export default function AllTasksView() {
  const { state, dispatch } = useApp()
  const tasks = useFilteredTasks()
  const groups = useFilteredGroups()
  const [collapsed, setCollapsed] = useState({})

  const openNew = (groupId) => dispatch({ type: 'SET_MODAL', modal: { type: 'new-task', defaults: { groupId } } })
  const toggle = (id) => setCollapsed(c => ({ ...c, [id]: !c[id] }))

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white/90">Tutti i task</h1>
        <p className="text-sm text-white/35 mt-1">{tasks.filter(t => t.status !== 'done').length} attivi · {tasks.filter(t => t.status === 'done').length} completati</p>
      </div>

      {groups.map(group => {
        const groupTasks = tasks
          .filter(t => t.groupId === group.id)
          .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
        const isCollapsed = collapsed[group.id]
        const active = groupTasks.filter(t => t.status !== 'done')
        const done = groupTasks.filter(t => t.status === 'done')

        return (
          <div key={group.id} className="mb-6">
            <button
              onClick={() => toggle(group.id)}
              className="flex items-center gap-2 w-full mb-3 group"
            >
              <ChevronDown size={14} className={`text-white/30 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
              <span className="text-sm" style={{ color: group.color }}>{group.icon}</span>
              <span className="text-sm font-semibold text-white/70">{group.name}</span>
              <span className="text-xs text-white/25 ml-1">{active.length}</span>
            </button>

            {!isCollapsed && (
              <div className="flex flex-col gap-2 ml-4">
                {active.map(t => <TaskCard key={t.id} task={t} />)}
                <button
                  onClick={() => openNew(group.id)}
                  className="flex items-center gap-2 text-sm text-white/20 hover:text-indigo-400 transition-colors py-1.5"
                >
                  <Plus size={13} /> Aggiungi task
                </button>
                {done.length > 0 && (
                  <details className="mt-1">
                    <summary className="text-xs text-white/25 cursor-pointer hover:text-white/40 transition-colors list-none flex items-center gap-1">
                      <ChevronDown size={11} /> {done.length} completati
                    </summary>
                    <div className="flex flex-col gap-2 mt-2">
                      {done.map(t => <TaskCard key={t.id} task={t} />)}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
