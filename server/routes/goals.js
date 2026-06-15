import { Router } from 'express'
import db from '../db.js'

const router = Router()
function uid() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) }

function rowToGoal(row, subtasks) {
  return {
    id: row.id, title: row.title, description: row.description,
    weekKey: row.week_key, color: row.color,
    subtasks: subtasks.map(s => ({ id: s.id, title: s.title, completed: !!s.completed, dueDate: s.due_date || null })),
  }
}

// Create or update the task linked to a goal subtask, based on its due date.
// Returns the linked_task_id to store on the goal_subtask row (or null).
function syncSubtaskTask(sub, goal) {
  if (sub.dueDate) {
    if (sub.linkedTaskId) {
      const existingTask = db.prepare('SELECT id FROM tasks WHERE id = ?').get(sub.linkedTaskId)
      if (existingTask) {
        db.prepare('UPDATE tasks SET title = ?, due_date = ?, status = ? WHERE id = ?')
          .run(sub.title, sub.dueDate, sub.completed ? 'done' : 'todo', sub.linkedTaskId)
        return sub.linkedTaskId
      }
    }
    const taskId = uid()
    const createdAt = new Date().toISOString().split('T')[0]
    db.prepare('INSERT INTO tasks (id, title, description, status, priority, due_date, group_id, account_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(taskId, sub.title, `Obiettivo: ${goal.title}`, sub.completed ? 'done' : 'todo', 'medium', sub.dueDate, null, null, createdAt)
    return taskId
  } else {
    if (sub.linkedTaskId) {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(sub.linkedTaskId)
    }
    return null
  }
}

router.get('/', (req, res) => {
  const goals = db.prepare('SELECT * FROM goals ORDER BY week_key DESC').all()
  const subs = db.prepare('SELECT * FROM goal_subtasks ORDER BY sort_order').all()
  const subsByGoal = {}
  subs.forEach(s => { (subsByGoal[s.goal_id] = subsByGoal[s.goal_id] || []).push(s) })
  res.json(goals.map(g => rowToGoal(g, subsByGoal[g.id] || [])))
})

router.post('/', (req, res) => {
  const { title, description = '', weekKey, color = '#6366f1', subtasks = [] } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'title required' })
  if (!weekKey) return res.status(400).json({ error: 'weekKey required' })
  const id = uid()
  db.prepare('INSERT INTO goals (id, title, description, week_key, color) VALUES (?, ?, ?, ?, ?)').run(id, title.trim(), description, weekKey, color)
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id)
  const insertSub = db.prepare('INSERT INTO goal_subtasks (id, goal_id, title, completed, sort_order, due_date, linked_task_id) VALUES (?, ?, ?, 0, ?, ?, ?)')
  subtasks.forEach((s, i) => {
    const linkedTaskId = syncSubtaskTask({ title: s.title, completed: false, dueDate: s.dueDate, linkedTaskId: null }, goal)
    insertSub.run(uid(), id, s.title, i, s.dueDate || null, linkedTaskId)
  })
  const gsubs = db.prepare('SELECT * FROM goal_subtasks WHERE goal_id = ? ORDER BY sort_order').all(id)
  res.status(201).json(rowToGoal(goal, gsubs))
})

router.patch('/:id', (req, res) => {
  const { title, description, color, weekKey, subtasks } = req.body
  const info = db.prepare('UPDATE goals SET title = COALESCE(?, title), description = COALESCE(?, description), color = COALESCE(?, color), week_key = COALESCE(?, week_key) WHERE id = ?')
    .run(title ?? null, description ?? null, color ?? null, weekKey ?? null, req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not found' })
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id)

  if (subtasks !== undefined) {
    const existing = db.prepare('SELECT * FROM goal_subtasks WHERE goal_id = ?').all(req.params.id)
    const existingById = {}
    existing.forEach(s => { existingById[s.id] = s })

    db.prepare('DELETE FROM goal_subtasks WHERE goal_id = ?').run(req.params.id)
    const insertSub = db.prepare('INSERT INTO goal_subtasks (id, goal_id, title, completed, sort_order, due_date, linked_task_id) VALUES (?, ?, ?, ?, ?, ?, ?)')

    const keptTaskIds = new Set()
    subtasks.forEach((s, i) => {
      const prev = existingById[s.id]
      const linkedTaskId = syncSubtaskTask({
        title: s.title,
        completed: !!s.completed,
        dueDate: s.dueDate,
        linkedTaskId: prev?.linked_task_id || null,
      }, goal)
      if (linkedTaskId) keptTaskIds.add(linkedTaskId)
      insertSub.run(s.id || uid(), req.params.id, s.title, s.completed ? 1 : 0, i, s.dueDate || null, linkedTaskId)
    })

    // Remove tasks linked to subtasks that were deleted
    existing.forEach(s => {
      if (s.linked_task_id && !keptTaskIds.has(s.linked_task_id)) {
        db.prepare('DELETE FROM tasks WHERE id = ?').run(s.linked_task_id)
      }
    })
  }

  const gsubs = db.prepare('SELECT * FROM goal_subtasks WHERE goal_id = ? ORDER BY sort_order').all(req.params.id)
  res.json(rowToGoal(goal, gsubs))
})

router.patch('/:id/subtasks/:subId/toggle', (req, res) => {
  const { id, subId } = req.params
  const sub = db.prepare('SELECT * FROM goal_subtasks WHERE id = ? AND goal_id = ?').get(subId, id)
  if (!sub) return res.status(404).json({ error: 'not found' })
  const newCompleted = sub.completed ? 0 : 1
  db.prepare('UPDATE goal_subtasks SET completed = ? WHERE id = ?').run(newCompleted, subId)
  if (sub.linked_task_id) {
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(newCompleted ? 'done' : 'todo', sub.linked_task_id)
  }
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id)
  const gsubs = db.prepare('SELECT * FROM goal_subtasks WHERE goal_id = ? ORDER BY sort_order').all(id)
  res.json(rowToGoal(goal, gsubs))
})

router.delete('/:id', (req, res) => {
  const subs = db.prepare('SELECT * FROM goal_subtasks WHERE goal_id = ?').all(req.params.id)
  subs.forEach(s => {
    if (s.linked_task_id) db.prepare('DELETE FROM tasks WHERE id = ?').run(s.linked_task_id)
  })
  const info = db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not found' })
  res.status(204).end()
})

export default router
