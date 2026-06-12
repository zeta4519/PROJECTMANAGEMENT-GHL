import { useApp } from '../store/AppContext'
import { useFilteredTasks } from '../store/useFilteredTasks'
import TaskCard from '../components/TaskCard'
import { Plus } from 'lucide-react'

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 }
const STATUS_SECTIONS = [
  { id: 'todo', label: 'Da fare' },
  { id: 'in-progress', label: 'In corso' },
  { id: 'done', label: 'Fatto' },
]

export default function GroupView() {
  const { state, dispatch } = useApp()
  const tasks = useFilteredTasks()
  const group = state.groups.find(g => g.id === state.selectedGroupId)
  if (!group) return null

  const openNew = () => dispatch({ type: 'SET_MODAL', modal: { type: 'new-task', defaults: { groupId: group.id } } })

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 max-w-2xl w-full mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{group.icon}</span>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: group.color }}>{group.name}</h1>
            <p className="text-sm text-white/35 mt-0.5">
              {tasks.filter(t => t.groupId === group.id && t.status !== 'done').length} task attivi
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/12 text-white/60 hover:text-white/80 transition-colors"
        >
          <Plus size={13} /> Nuovo
        </button>
      </div>

      {STATUS_SECTIONS.map(section => {
        const sectionTasks = tasks
          .filter(t => t.groupId === group.id && t.status === section.id)
          .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
        if (sectionTasks.length === 0) return null

        return (
          <div key={section.id} className="mb-6">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-3">{section.label} · {sectionTasks.length}</p>
            <div className="flex flex-col gap-2">
              {sectionTasks.map(t => <TaskCard key={t.id} task={t} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
