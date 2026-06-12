import { useApp } from '../store/AppContext'
import { useFilteredTasks, useFilteredGroups } from '../store/useFilteredTasks'
import { api } from '../api.js'
import { Sun, CalendarDays, LayoutGrid, List, Plus, X, Trash2 } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { id: 'today',  label: 'Oggi',     icon: Sun },
  { id: 'weekly', label: 'Settimana', icon: CalendarDays },
  { id: 'kanban', label: 'Kanban',   icon: LayoutGrid },
  { id: 'all',    label: 'Tutti',    icon: List },
]

export default function MobileNav() {
  const { state, dispatch } = useApp()
  const visibleGroups = useFilteredGroups()
  const filteredTasks = useFilteredTasks()
  const [groupsOpen, setGroupsOpen] = useState(false)

  const todayTasks = filteredTasks.filter(
    t => t.dueDate === new Date().toISOString().split('T')[0] && t.status !== 'done'
  ).length

  const setView = (view, groupId) => {
    dispatch({ type: 'SET_VIEW', view, groupId })
    setGroupsOpen(false)
  }

  const openNewTask = () => dispatch({ type: 'SET_MODAL', modal: { type: 'new-task' } })

  const deleteGroup = async (e, g) => {
    e.stopPropagation()
    if (!confirm(`Eliminare "${g.name}"?`)) return
    try {
      await api.groups.delete(g.id)
      dispatch({ type: 'DELETE_GROUP', id: g.id })
      if (state.currentView === 'group' && state.selectedGroupId === g.id) {
        dispatch({ type: 'SET_VIEW', view: 'today' })
      }
    } catch (err) { alert('Errore: ' + err.message) }
  }

  return (
    <>
      {/* Groups drawer */}
      {groupsOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setGroupsOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative rounded-t-2xl border-t border-white/10 pb-safe"
            style={{ background: '#111113' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-xs text-white/40 uppercase tracking-wider">Gruppi</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { dispatch({ type: 'SET_MODAL', modal: { type: 'new-group' } }); setGroupsOpen(false) }}
                  className="text-indigo-400 text-sm"
                >
                  + Nuovo
                </button>
                <button onClick={() => setGroupsOpen(false)} className="text-white/30">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="px-3 pb-4 flex flex-col gap-1 max-h-64 overflow-y-auto">
              {visibleGroups.map(g => {
                const count = state.tasks.filter(t => t.groupId === g.id && t.status !== 'done').length
                const active = state.currentView === 'group' && state.selectedGroupId === g.id
                return (
                  <div key={g.id} className="flex items-center justify-between px-3 py-3 rounded-xl active:bg-white/5"
                    style={active ? { background: 'rgba(99,102,241,0.12)' } : {}}
                    onClick={() => setView('group', g.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{g.icon}</span>
                      <span className="text-sm text-white/80">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {count > 0 && <span className="text-xs text-white/30">{count}</span>}
                      <button onClick={e => deleteGroup(e, g)} className="text-white/20 hover:text-red-400 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
              {visibleGroups.length === 0 && (
                <p className="text-center text-white/25 text-sm py-4">Nessun gruppo</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center border-t border-white/8"
        style={{ background: '#111113', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = state.currentView === id && !state.selectedGroupId
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <div className="relative">
                <Icon size={20} className={active ? 'text-indigo-400' : 'text-white/30'} />
                {id === 'today' && todayTasks > 0 && (
                  <span className="absolute -top-1.5 -right-2 text-[9px] bg-indigo-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">{todayTasks}</span>
                )}
              </div>
              <span className={`text-[10px] ${active ? 'text-indigo-400' : 'text-white/25'}`}>{label}</span>
            </button>
          )
        })}

        {/* Groups button */}
        <button
          onClick={() => setGroupsOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-2.5"
        >
          <span className="text-xl leading-none" style={{ fontSize: 20, lineHeight: '20px' }}>
            {state.currentView === 'group'
              ? (visibleGroups.find(g => g.id === state.selectedGroupId)?.icon || '📁')
              : '📁'}
          </span>
          <span className={`text-[10px] ${state.currentView === 'group' ? 'text-indigo-400' : 'text-white/25'}`}>Gruppi</span>
        </button>

        {/* New task FAB */}
        <button
          onClick={openNewTask}
          className="flex-1 flex flex-col items-center gap-1 py-2.5"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center -mt-5 shadow-lg shadow-indigo-500/30">
            <Plus size={18} className="text-white" />
          </div>
          <span className="text-[10px] text-white/25 mt-1">Nuovo</span>
        </button>
      </nav>
    </>
  )
}
