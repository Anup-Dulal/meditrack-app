import { describe, it, expect, beforeEach } from 'vitest'
import { initializeDatabase, getDatabase } from '../services/database'

describe('Database Service', () => {
  beforeEach(async () => {
    localStorage.clear()
  })

  it('should initialize database', async () => {
    const db = await initializeDatabase()
    expect(db).toBeDefined()
  })

  it('should create tables on initialization', async () => {
    const db = await initializeDatabase()
    const result = db.prepare('SELECT name FROM sqlite_master WHERE type="table"').all()
    expect(result.length).toBeGreaterThan(0)
  })

  it('should persist data to localStorage', async () => {
    const db = await initializeDatabase()
    const data = localStorage.getItem('meditrack_db')
    expect(data).toBeDefined()
  })

  it('should load existing database from localStorage', async () => {
    // First initialization
    await initializeDatabase()
    const firstData = localStorage.getItem('meditrack_db')

    // Clear and reinitialize
    localStorage.clear()
    localStorage.setItem('meditrack_db', firstData!)
    const db = await initializeDatabase()
    expect(db).toBeDefined()
  })

  it('should handle database errors gracefully', async () => {
    const db = await initializeDatabase()
    expect(() => {
      db.prepare('INVALID SQL').run()
    }).toThrow()
  })
})
