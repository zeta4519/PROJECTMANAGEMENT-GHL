import { useApp } from './AppContext'

export function useFilteredTasks() {
  const { state } = useApp()
  const { tasks, groups, accountFilter } = state

  if (!accountFilter) return tasks

  return tasks.filter(t => {
    if (t.accountId === accountFilter) return true
    if (t.accountId === null) return true
    const group = groups.find(g => g.id === t.groupId)
    if (group && group.accountId === accountFilter) return true
    return false
  })
}

export function useFilteredGroups() {
  const { state } = useApp()
  const { groups, accountFilter } = state
  if (!accountFilter) return groups
  return groups.filter(g => g.accountId === accountFilter || g.accountId === null)
}
