import { useApp } from '../store/AppContext'
import { useFilteredTasks, useFilteredGroups } from '../store/useFilteredTasks'
import { api } from '../api.js'
import {
  Sun, CalendarDays, LayoutGrid, List, Plus, ChevronDown, Trash2
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { id: 'today', label: 'Oggi', icon: Sun },
  { id: 'weekly', label: 'Questa settimana', icon: CalendarDays },
  { id: 'all', label: 'Tutti i task', icon: List },
  { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
]

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const visibleGroups = useFilteredGroups()
  const [groupsOpen, setGroupsOpen] = useState(true)

  const setView = (view, groupId) => dispatch({ type: 'SET_VIEW', view, groupId })
  const openNewTask = () => dispatch({ type: 'SET_MODAL', modal: { type: 'new-task' } })

  const filteredTasks = useFilteredTasks()
  const todayTasks = filteredTasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0] && t.status !== 'done').length

  return (
    <aside className="w-60 min-h-screen flex flex-col border-r border-white/5" style={{ background: '#111113' }}>
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2 border-b border-white/5">
        <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center text-xs font-bold">P</div>
        <span className="text-sm font-semibold text-white/90">TaskFlow</span>
      </div>

      {/* New Task */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={openNewTask}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <Plus size={14} />
          Nuovo task
        </button>
      </div>

      {/* Main Nav */}
      <nav className="px-3 flex flex-col gap-0.5">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              state.currentView === id && !state.selectedGroupId
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon size={14} />
              {label}
            </div>
            {id === 'today' && todayTasks > 0 && (
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">{todayTasks}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Groups */}
      <div className="px-3 mt-4">
        <div className="flex items-center justify-between px-3 py-1.5">
          <button
            onClick={() => setGroupsOpen(!groupsOpen)}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors uppercase tracking-wider"
          >
            <ChevronDown size={12} className={`transition-transform ${groupsOpen ? '' : '-rotate-90'}`} />
            Gruppi
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', modal: { type: 'new-group' } })}
            className="text-white/20 hover:text-indigo-400 transition-colors"
            title="Nuovo gruppo"
          >
            <Plus size={13} />
          </button>
        </div>
        {groupsOpen && (
          <div className="mt-1 flex flex-col gap-0.5">
            {visibleGroups.map(g => {
              const count = state.tasks.filter(t => t.groupId === g.id && t.status !== 'done').length
              const active = state.currentView === 'group' && state.selectedGroupId === g.id

              const deleteGroup = async (e) => {
                e.stopPropagation()
                if (!confirm(`Eliminare il gruppo "${g.name}"?`)) return
                try {
                  await api.groups.delete(g.id)
                  dispatch({ type: 'DELETE_GROUP', id: g.id })
                  if (active) dispatch({ type: 'SET_VIEW', view: 'today' })
                } catch (err) { alert('Errore: ' + err.message) }
              }

              return (
                <div key={g.id} className="group/item relative">
                  <button
                    onClick={() => setView('group', g.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{g.icon}</span>
                    <span className="truncate">{g.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="text-xs text-white/25 group-hover/item:hidden">{count}</span>
                  )}
                </button>
                  <button
                    onClick={deleteGroup}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 text-white/25 hover:text-red-400 transition-all p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* User */}
      <div className="px-4 py-4 border-t border-white/5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">IC</div>
        <div>
          <div className="text-xs text-white/80 font-medium">Igor Cretu</div>
          <div className="text-xs text-white/30">Pro</div>
        </div>
      </div>
    </aside>
  )
}
