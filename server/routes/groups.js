import { Router } from 'express'
import db from '../db.js'

const router = Router()
function uid() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) }

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM groups ORDER BY name').all().map(g => ({
    id: g.id, name: g.name, color: g.color, icon: g.icon, accountId: g.account_id
  })))
})

router.post('/', (req, res) => {
  const { name, color = '#6366f1', icon = '📁', accountId = null } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'name required' })
  const id = uid()
  db.prepare('INSERT INTO groups (id, name, color, icon, account_id) VALUES (?, ?, ?, ?, ?)').run(id, name.trim(), color, icon, accountId)
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(id)
  res.status(201).json({ id: g.id, name: g.name, color: g.color, icon: g.icon, accountId: g.account_id })
})

router.patch('/:id', (req, res) => {
  const { name, color, icon, accountId } = req.body
  const info = db.prepare('UPDATE groups SET name = COALESCE(?, name), color = COALESCE(?, color), icon = COALESCE(?, icon), account_id = COALESCE(?, account_id) WHERE id = ?')
    .run(name ?? null, color ?? null, icon ?? null, accountId ?? null, req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not found' })
  const g = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id)
  res.json({ id: g.id, name: g.name, color: g.color, icon: g.icon, accountId: g.account_id })
})

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM groups WHERE id = ?').run(req.params.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not found' })
  res.status(204).end()
})

export default router
