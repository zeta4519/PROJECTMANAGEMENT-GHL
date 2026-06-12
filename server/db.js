import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/pm.db')

import fs from 'fs'
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT NOT NULL DEFAULT '📁',
    account_id TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TEXT,
    group_id TEXT,
    account_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    week_key TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6366f1'
  );

  CREATE TABLE IF NOT EXISTS goal_subtasks (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
  );
`)

// Seed initial data if empty
const groupCount = db.prepare('SELECT COUNT(*) as n FROM groups').get()
if (groupCount.n === 0) {
  const insertGroup = db.prepare('INSERT INTO groups (id, name, color, icon, account_id) VALUES (?, ?, ?, ?, ?)')
  const seedGroups = db.transaction(() => {
    insertGroup.run('g1', 'Stark Sales', '#6366f1', '🏢', 'acc1')
    insertGroup.run('g2', 'Marketing', '#f59e0b', '📣', 'acc1')
    insertGroup.run('g3', 'Personale', '#10b981', '👤', null)
    insertGroup.run('g4', 'ROD', '#ef4444', '⚖️', 'acc1')
    insertGroup.run('g5', 'Vendite', '#8b5cf6', '💼', 'acc2')
    insertGroup.run('g6', 'Operations', '#06b6d4', '⚙️', 'acc2')
  })
  seedGroups()
}

export default db
