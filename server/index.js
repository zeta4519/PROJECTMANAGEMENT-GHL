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

// API routes
app.use('/api/tasks', tasksRouter)
app.use('/api/groups', groupsRouter)
app.use('/api/goals', goalsRouter)
app.use('/api/webhook', webhookRouter)

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

// Serve built frontend in production
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`PM server running on http://localhost:${PORT}`)
})
