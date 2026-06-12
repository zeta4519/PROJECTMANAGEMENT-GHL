import { Router } from 'express'
import db from '../db.js'

const router = Router()

function uid() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) }

function rowToTask(row, subtasks) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    groupId: row.group_id,
    accountId: row.account_id,
    createdAt: row.created_at,
    subtasks: subtasks.map(s => ({ id: s.id, title: s.title, completed: !!s.completed })),
  }
}

// GET /api/tasks
router.get('/', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all()
  const subtasks = db.prepare('SELECT * FROM subtasks ORDER BY sort_order').all()
  const subsByTask = {}
  subtasks.forEach(s => { (subsByTask[s.task_id] = subsByTask[s.task_id] || []).push(s) })
  res.json(tasks.map(t => rowToTask(t, subsByTask[t.id] || [])))
})

// POST /api/tasks
router.post('/', (req, res) => {
  const { title, description = '', status = 'todo', priority = 'medium', dueDate = null, groupId = null, accountId = null, subtasks = [] } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'title required' })
  const id = uid()
  const createdAt = new Date().toISOString().split('T')[0]
  db.prepare('INSERT INTO tasks (id, title, description, status, priority, due_date, group_id, account_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, title.trim(), description, status, priority, dueDate, groupId, accountId, createdAt)
  const insertSub = db.prepare('INSERT INTO subtasks (id, task_id, title, completed, sort_order) VALUES (?, ?, ?, 0, ?)')
  subtasks.forEach((s, i) => insertSub.run(uid(), id, s.title, i))
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  const subs = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order').all(id)
  res.status(201).json(rowToTask(task, subs))
})

// PATCH /api/tasks/:id
router.patch('/:id', (req, res) => {
  const { id } = req.params
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'not found' })
  const { title, description, status, priority, dueDate, groupId, accountId, subtasks } = req.body
  db.prepare(`UPDATE tasks SET
    title = COALESCE(?, title),
    description = COALESCE(?, description),
    status = COALESCE(?, status),
    priority = COALESCE(?, priority),
    due_date = COALESCE(?, due_date),
    group_id = COALESCE(?, group_id),
    account_id = COALESCE(?, account_id)
    WHERE id = ?`).run(title ?? null, description ?? null, status ?? null, priority ?? null, dueDate ?? null, groupId ?? null, accountId ?? null, id)
  if (subtasks !== undefined) {
    db.prepare('DELETE FROM subtasks WHERE task_id = ?').run(id)
    const insertSub = db.prepare('INSERT INTO subtasks (id, task_id, title, completed, sort_order) VALUES (?, ?, ?, ?, ?)')
    subtasks.forEach((s, i) => insertSub.run(s.id || uid(), id, s.title, s.completed ? 1 : 0, i))
  }
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  const subs = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order').all(id)
  res.json(rowToTask(task, subs))
})

// PATCH /api/tasks/:id/status — quick status update (used by kanban drag)
router.patch('/:id/status', (req, res) => {
  const { id } = req.params
  const { status } = req.body
  if (!status) return res.status(400).json({ error: 'status required' })
  const info = db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id)
  if (info.changes === 0) return res.status(404).json({ error: 'not found' })
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  const subs = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order').all(id)
  res.json(rowToTask(task, subs))
})

// PATCH /api/tasks/:id/subtasks/:subId/toggle
router.patch('/:id/subtasks/:subId/toggle', (req, res) => {
  const { id, subId } = req.params
  const sub = db.prepare('SELECT * FROM subtasks WHERE id = ? AND task_id = ?').get(subId, id)
  if (!sub) return res.status(404).json({ error: 'not found' })
  db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?').run(sub.completed ? 0 : 1, subId)
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  const subs = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order').all(id)
  res.json(rowToTask(task, subs))
})

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not found' })
  res.status(204).end()
})

export default router
