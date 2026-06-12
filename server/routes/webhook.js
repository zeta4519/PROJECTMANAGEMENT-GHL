import { Router } from 'express'
import db from '../db.js'

const router = Router()
function uid() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) }

// Map GHL pipeline stages → task auto-creation rules
const STAGE_RULES = {
  'proposal-sent':    { title: 'Follow-up proposta', priority: 'high',   daysOffset: 3 },
  'negotiation':      { title: 'Chiamata negoziazione', priority: 'urgent', daysOffset: 1 },
  'new-lead':         { title: 'Prima chiamata lead', priority: 'medium', daysOffset: 1 },
  'form-submitted':   { title: 'Qualifica lead', priority: 'medium',     daysOffset: 0 },
  'appointment-set':  { title: 'Preparazione appuntamento', priority: 'high', daysOffset: 0 },
}

function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// POST /api/webhook/ghl
// Called by GHL Workflow → Webhook action
router.post('/ghl', (req, res) => {
  const secret = process.env.WEBHOOK_SECRET
  if (secret && req.headers['x-webhook-secret'] !== secret) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  const { event, contact, pipeline, stage, locationId, customFields = {} } = req.body

  // Determine accountId from GHL locationId
  const GHL_LOCATION_MAP = {
    [process.env.GHL_LOCATION_ACC1]: 'acc1',
    [process.env.GHL_LOCATION_ACC2]: 'acc2',
  }
  const accountId = GHL_LOCATION_MAP[locationId] || null

  const contactName = contact?.name || contact?.email || 'Contatto GHL'
  const stageName = stage?.name?.toLowerCase().replace(/\s+/g, '-') || ''
  const rule = STAGE_RULES[stageName] || STAGE_RULES[event] || null

  const tasksCreated = []

  if (rule) {
    const id = uid()
    const title = `${rule.title} — ${contactName}`
    const dueDate = addDays(rule.daysOffset)
    const createdAt = new Date().toISOString().split('T')[0]
    db.prepare('INSERT INTO tasks (id, title, description, status, priority, due_date, group_id, account_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, title, `Pipeline: ${pipeline?.name || ''} | Stage: ${stage?.name || ''}`, 'todo', rule.priority, dueDate, null, accountId, createdAt)
    tasksCreated.push({ id, title, dueDate, priority: rule.priority })
  }

  // Also handle direct task creation payload
  if (req.body.task) {
    const { title, description = '', priority = 'medium', dueDate = null, groupId = null } = req.body.task
    if (title?.trim()) {
      const id = uid()
      const createdAt = new Date().toISOString().split('T')[0]
      db.prepare('INSERT INTO tasks (id, title, description, status, priority, due_date, group_id, account_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, title.trim(), description, 'todo', priority, dueDate, groupId, accountId, createdAt)
      tasksCreated.push({ id, title: title.trim(), dueDate, priority })
    }
  }

  res.json({ received: true, tasksCreated })
})

export default router
