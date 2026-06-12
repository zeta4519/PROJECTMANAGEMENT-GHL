import { Router } from 'express'
import db from '../db.js'

const router = Router()
function uid() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) }

function rowToGoal(row, subtasks) {
  return {
    id: row.id, title: row.title, description: row.description,
    weekKey: row.week_key, color: row.color,
    subtasks: subtasks.map(s => ({ id: s.id, title: s.title, completed: !!s.completed })),
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
  const insertSub = db.prepare('INSERT INTO goal_subtasks (id, goal_id, title, completed, sort_order) VALUES (?, ?, ?, 0, ?)')
  subtasks.forEach((s, i) => insertSub.run(uid(), id, s.title, i))
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id)
  const gsubs = db.prepare('SELECT * FROM goal_subtasks WHERE goal_id = ? ORDER BY sort_order').all(id)
  res.status(201).json(rowToGoal(goal, gsubs))
})

router.patch('/:id', (req, res) => {
  const { title, description, color, subtasks } = req.body
  const info = db.prepare('UPDATE goals SET title = COALESCE(?, title), description = COALESCE(?, description), color = COALESCE(?, color) WHERE id = ?')
    .run(title ?? null, description ?? null, color ?? null, req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not found' })
  if (subtasks !== undefined) {
    db.prepare('DELETE FROM goal_subtasks WHERE goal_id = ?').run(req.params.id)
    const insertSub = db.prepare('INSERT INTO goal_subtasks (id, goal_id, title, completed, sort_order) VALUES (?, ?, ?, ?, ?)')
    subtasks.forEach((s, i) => insertSub.run(s.id || uid(), req.params.id, s.title, s.completed ? 1 : 0, i))
  }
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id)
  const gsubs = db.prepare('SELECT * FROM goal_subtasks WHERE goal_id = ? ORDER BY sort_order').all(req.params.id)
  res.json(rowToGoal(goal, gsubs))
})

router.patch('/:id/subtasks/:subId/toggle', (req, res) => {
  const { id, subId } = req.params
  const sub = db.prepare('SELECT * FROM goal_subtasks WHERE id = ? AND goal_id = ?').get(subId, id)
  if (!sub) return res.status(404).json({ error: 'not found' })
  db.prepare('UPDATE goal_subtasks SET completed = ? WHERE id = ?').run(sub.completed ? 0 : 1, subId)
  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id)
  const gsubs = db.prepare('SELECT * FROM goal_subtasks WHERE goal_id = ? ORDER BY sort_order').all(id)
  res.json(rowToGoal(goal, gsubs))
})

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not found' })
  res.status(204).end()
})

export default router
