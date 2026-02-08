import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database'

export interface Setting {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  updatedAt: string
}

export class SettingsService {
  static getSetting(key: string): Setting | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM settings WHERE key = ?')
    return (stmt.get(key) as Setting) || null
  }

  static getAllSettings(): Setting[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM settings ORDER BY key ASC')
    return stmt.all() as Setting[]
  }

  static setSetting(key: string, value: any, type: 'string' | 'number' | 'boolean' | 'json' = 'string'): Setting {
    const db = getDatabase()
    const existing = this.getSetting(key)
    const now = new Date().toISOString()

    let stringValue: string
    if (type === 'json') {
      stringValue = JSON.stringify(value)
    } else {
      stringValue = String(value)
    }

    if (existing) {
      const stmt = db.prepare('UPDATE settings SET value = ?, type = ?, updatedAt = ? WHERE key = ?')
      stmt.run(stringValue, type, now, key)
      return {
        id: existing.id,
        key,
        value: stringValue,
        type,
        updatedAt: now,
      }
    } else {
      const id = uuidv4()
      const stmt = db.prepare(`
        INSERT INTO settings (id, key, value, type, updatedAt)
        VALUES (?, ?, ?, ?, ?)
      `)
      stmt.run(id, key, stringValue, type, now)
      return {
        id,
        key,
        value: stringValue,
        type,
        updatedAt: now,
      }
    }
  }

  static getSettingValue(key: string, defaultValue?: any): any {
    const setting = this.getSetting(key)
    if (!setting) return defaultValue

    try {
      if (setting.type === 'json') {
        return JSON.parse(setting.value)
      } else if (setting.type === 'number') {
        return parseFloat(setting.value)
      } else if (setting.type === 'boolean') {
        return setting.value === 'true'
      }
      return setting.value
    } catch {
      return defaultValue
    }
  }

  static deleteSetting(key: string): void {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM settings WHERE key = ?')
    stmt.run(key)
  }

  static initializeDefaultSettings(): void {
    const defaults = {
      'store.name': { value: 'MediTrack Pharmacy', type: 'string' },
      'store.address': { value: 'Your Address Here', type: 'string' },
      'store.phone': { value: '+1-XXX-XXX-XXXX', type: 'string' },
      'store.email': { value: 'info@meditrack.local', type: 'string' },
      'business.currency': { value: '₹', type: 'string' },
      'business.taxRate': { value: '18', type: 'number' },
      'business.discountPolicy': { value: 'Allow discounts up to 10%', type: 'string' },
      'receipt.header': { value: 'Thank you for your purchase!', type: 'string' },
      'receipt.footer': { value: 'Please visit again', type: 'string' },
      'system.autoLogoutMinutes': { value: '30', type: 'number' },
      'system.backupSchedule': { value: 'daily', type: 'string' },
    }

    for (const [key, { value, type }] of Object.entries(defaults)) {
      if (!this.getSetting(key)) {
        this.setSetting(key, value, type as any)
      }
    }
  }
}
