import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database'

export interface AuditLog {
  id: string
  userId: string
  action: string
  entity: string
  entityId: string
  changes?: Record<string, any>
  timestamp: string
}

export class AuditService {
  static logAction(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    changes?: Record<string, any>
  ): AuditLog {
    const db = getDatabase()
    const id = uuidv4()
    const timestamp = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, userId, action, entity, entityId, changes, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      userId,
      action,
      entity,
      entityId,
      changes ? JSON.stringify(changes) : null,
      timestamp
    )

    return {
      id,
      userId,
      action,
      entity,
      entityId,
      changes,
      timestamp,
    }
  }

  static getAuditLogs(limit: number = 100): AuditLog[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    const logs = stmt.all(limit) as any[]
    return logs.map((log) => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : undefined,
    }))
  }

  static getAuditLogsByUser(userId: string, limit: number = 100): AuditLog[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      WHERE userId = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    const logs = stmt.all(userId, limit) as any[]
    return logs.map((log) => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : undefined,
    }))
  }

  static getAuditLogsByEntity(entity: string, entityId: string): AuditLog[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      WHERE entity = ? AND entityId = ?
      ORDER BY timestamp DESC
    `)
    const logs = stmt.all(entity, entityId) as any[]
    return logs.map((log) => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : undefined,
    }))
  }

  static getAuditLogsByDateRange(dateFrom: string, dateTo: string): AuditLog[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `)
    const logs = stmt.all(dateFrom, dateTo) as any[]
    return logs.map((log) => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : undefined,
    }))
  }

  static deleteOldLogs(daysToKeep: number = 90): number {
    const db = getDatabase()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const stmt = db.prepare('DELETE FROM audit_logs WHERE timestamp < ?')
    const result = stmt.run(cutoffDate.toISOString())
    return result.changes
  }
}
