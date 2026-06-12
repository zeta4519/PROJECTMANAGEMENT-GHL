import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

import tasksRouter from './routes/tasks.js'
import groupsRouter from './routes/groups.js'
import goalsRouter from './routes/goals.js'
import webhookRouter from './routes/webhook.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API routes (accessible both at /api and /pm/api for flexibility)
app.use('/api/tasks', tasksRouter)
app.use('/api/groups', groupsRouter)
app.use('/api/goals', goalsRouter)
app.use('/api/webhook', webhookRouter)
app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.use('/pm/api/tasks', tasksRouter)
app.use('/pm/api/groups', groupsRouter)
app.use('/pm/api/goals', goalsRouter)
app.use('/pm/api/webhook', webhookRouter)
app.get('/pm/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

// Serve built frontend under /pm/
const distPath = path.join(__dirname, '../dist')
app.use('/pm', express.static(distPath))
app.get('/pm/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`PM server running on http://localhost:${PORT}`)
})
