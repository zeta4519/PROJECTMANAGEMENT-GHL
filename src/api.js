const BASE = import.meta.env.VITE_API_URL || '/pm/api'

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`)
  return res.json()
}

export const api = {
  tasks: {
    list: () => req('GET', '/tasks'),
    create: (data) => req('POST', '/tasks', data),
    update: (id, data) => req('PATCH', `/tasks/${id}`, data),
    setStatus: (id, status) => req('PATCH', `/tasks/${id}/status`, { status }),
    toggleSubtask: (taskId, subId) => req('PATCH', `/tasks/${taskId}/subtasks/${subId}/toggle`),
    delete: (id) => req('DELETE', `/tasks/${id}`),
  },
  groups: {
    list: () => req('GET', '/groups'),
    create: (data) => req('POST', '/groups', data),
    update: (id, data) => req('PATCH', `/groups/${id}`, data),
    delete: (id) => req('DELETE', `/groups/${id}`),
  },
  goals: {
    list: () => req('GET', '/goals'),
    create: (data) => req('POST', '/goals', data),
    update: (id, data) => req('PATCH', `/goals/${id}`, data),
    toggleSubtask: (goalId, subId) => req('PATCH', `/goals/${goalId}/subtasks/${subId}/toggle`),
    delete: (id) => req('DELETE', `/goals/${id}`),
  },
}
