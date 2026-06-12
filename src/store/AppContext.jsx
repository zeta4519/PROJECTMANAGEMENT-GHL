import { createContext, useContext, useReducer, useEffect } from 'react'
import { api } from '../api.js'

export const USERS = [
  { id: 'igor', name: 'Igor', initials: 'IC', color: '#3b82f6' },
  { id: 'beatrice', name: 'Beatrice', initials: 'BE', color: '#a855f7' },
]

export const ACCOUNTS = [
  { id: 'acc1', name: 'Igor Cretu (PB)', shortName: 'Igor Cretu', color: '#3b82f6' },
  { id: 'acc2', name: 'Looking4', shortName: 'Looking4', color: '#ffffff' },
]

export function getWeekKey(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.toISOString().split('T')[0]
}

function reducer(state, action) {
  switch (action.type) {
    // Bootstrap
    case 'LOAD_ALL':
      return { ...state, tasks: action.tasks, groups: action.groups, goals: action.goals, loading: false }

    // Tasks
    case 'SET_TASKS': return { ...state, tasks: action.tasks }
    case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.task] }
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) }
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) }

    // Groups
    case 'SET_GROUPS': return { ...state, groups: action.groups }
    case 'ADD_GROUP': return { ...state, groups: [...state.groups, action.group] }
    case 'UPDATE_GROUP': return { ...state, groups: state.groups.map(g => g.id === action.group.id ? action.group : g) }
    case 'DELETE_GROUP': return { ...state, groups: state.groups.filter(g => g.id !== action.id) }

    // Goals
    case 'SET_GOALS': return { ...state, goals: action.goals }
    case 'ADD_GOAL': return { ...state, goals: [...state.goals, action.goal] }
    case 'UPDATE_GOAL': return { ...state, goals: state.goals.map(g => g.id === action.goal.id ? action.goal : g) }
    case 'DELETE_GOAL': return { ...state, goals: state.goals.filter(g => g.id !== action.id) }

    // UI
    case 'SET_ACCOUNT_FILTER': return { ...state, accountFilter: action.accountId }
    case 'SET_VIEW': return { ...state, currentView: action.view, selectedGroupId: action.groupId || null }
    case 'SET_MODAL': return { ...state, modal: action.modal }
    case 'SET_ERROR': return { ...state, error: action.error }
    default: return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    tasks: [], groups: [], goals: [],
    currentView: 'today', selectedGroupId: null,
    accountFilter: null, modal: null,
    loading: true, error: null,
  })

  // Load all data on mount
  useEffect(() => {
    Promise.all([api.tasks.list(), api.groups.list(), api.goals.list()])
      .then(([tasks, groups, goals]) => dispatch({ type: 'LOAD_ALL', tasks, groups, goals }))
      .catch(err => dispatch({ type: 'SET_ERROR', error: err.message }))
  }, [])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
