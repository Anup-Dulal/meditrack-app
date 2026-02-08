// Database abstraction layer that works for web and native platforms

export interface DatabaseStatement {
  run(...params: any[]): { changes: number }
  get(...params: any[]): any
  all(...params: any[]): any[]
}

export interface Database {
  prepare(sql: string): DatabaseStatement
  exec(sql: string): void
  pragma(pragma: string): void
  close(): void
}

class TauriDatabase implements Database {
  private invoke: any

  async init() {
    const { invoke } = await import('@tauri-apps/api/tauri')
    this.invoke = invoke
    await invoke('init_database')
  }

  prepare(sql: string): DatabaseStatement {
    return {
      run: (...params: any[]) => {
        return this.invoke('db_run', { sql, params }).then((result: any) => ({
          changes: result.changes || 1,
        }))
      },
      get: (...params: any[]) => {
        return this.invoke('db_get', { sql, params })
      },
      all: (...params: any[]) => {
        return this.invoke('db_all', { sql, params })
      },
    }
  }

  exec(sql: string) {
    return this.invoke('db_exec', { sql })
  }

  pragma(pragma: string) {
    // Handled by Tauri backend
  }

  close() {
    return this.invoke('db_close')
  }
}

class WebDatabase implements Database {
  private db: any = null
  private SQL: any = null

  async init() {
    const initSqlJs = (await import('sql.js')).default
    this.SQL = await initSqlJs()

    const savedDb = localStorage.getItem('meditrack_db')
    if (savedDb) {
      const buffer = new Uint8Array(JSON.parse(savedDb))
      this.db = new this.SQL.Database(buffer)
    } else {
      this.db = new this.SQL.Database()
    }

    await this.createTables()
  }

  private async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        permissions TEXT,
        createdAt TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT,
        roleId TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        lastLogin TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY (roleId) REFERENCES roles(id)
      )`,
      `CREATE TABLE IF NOT EXISTS medicines (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        genericName TEXT,
        manufacturer TEXT,
        batchNumber TEXT,
        quantity INTEGER DEFAULT 0,
        purchasePrice REAL,
        sellingPrice REAL,
        expiryDate TEXT,
        minimumStock INTEGER DEFAULT 10,
        barcode TEXT UNIQUE,
        description TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        medicineId TEXT NOT NULL,
        medicineName TEXT NOT NULL,
        customerId TEXT,
        quantity INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        totalPrice REAL NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        paymentMethod TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (medicineId) REFERENCES medicines(id),
        FOREIGN KEY (customerId) REFERENCES customers(id)
      )`,
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        action TEXT NOT NULL,
        entity TEXT,
        entityId TEXT,
        changes TEXT,
        timestamp TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        type TEXT,
        updatedAt TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        address TEXT,
        loyaltyPoints INTEGER DEFAULT 0,
        totalSpent REAL DEFAULT 0,
        lastPurchase TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS loyalty_transactions (
        id TEXT PRIMARY KEY,
        customerId TEXT NOT NULL,
        points INTEGER NOT NULL,
        reason TEXT,
        timestamp TEXT,
        FOREIGN KEY (customerId) REFERENCES customers(id)
      )`,
      `CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        period TEXT NOT NULL,
        data TEXT NOT NULL,
        generatedAt TEXT
      )`,
    ]

    for (const sql of tables) {
      this.db.run(sql)
    }

    await this.initializeDefaultRoles()
    this.save()
  }

  private async initializeDefaultRoles() {
    const roles = [
      {
        id: 'role-admin',
        name: 'Admin',
        description: 'Full system access',
        permissions: ['all'],
      },
      {
        id: 'role-manager',
        name: 'Manager',
        description: 'Inventory and sales management',
        permissions: ['inventory.view', 'inventory.edit', 'sales.view', 'sales.edit', 'transactions.view'],
      },
      {
        id: 'role-cashier',
        name: 'Cashier',
        description: 'Sales only',
        permissions: ['sales.view', 'sales.edit', 'transactions.view'],
      },
      {
        id: 'role-viewer',
        name: 'Viewer',
        description: 'Read-only access',
        permissions: ['inventory.view', 'sales.view', 'transactions.view'],
      },
    ]

    try {
      const result = this.db.exec('SELECT COUNT(*) as count FROM roles')
      const count = result.length > 0 ? result[0].values[0][0] : 0

      if (count === 0) {
        const now = new Date().toISOString()
        for (const role of roles) {
          this.db.run(
            `INSERT INTO roles (id, name, description, permissions, createdAt)
             VALUES (?, ?, ?, ?, ?)`,
            [role.id, role.name, role.description, JSON.stringify(role.permissions), now]
          )
        }

        // Create default admin user
        this.db.run(
          `INSERT INTO users (id, username, email, password, firstName, lastName, roleId, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ['user-admin', 'admin', 'admin@meditrack.local', btoa('admin123'), 'Admin', 'User', 'role-admin', 'active', now, now]
        )
      }
    } catch (error) {
      console.error('Failed to initialize default roles:', error)
    }
  }

  private save() {
    try {
      const data = this.db.export()
      const arr = Array.from(data)
      localStorage.setItem('meditrack_db', JSON.stringify(arr))
    } catch (error) {
      console.error('Failed to save database:', error)
    }
  }

  prepare(sql: string): DatabaseStatement {
    return {
      run: (...params: any[]) => {
        try {
          this.db.run(sql, params)
          this.save()
          return { changes: 1 }
        } catch (error) {
          console.error('Database error:', error)
          throw error
        }
      },
      get: (...params: any[]) => {
        try {
          const result = this.db.exec(sql, params)
          if (result.length === 0 || result[0].values.length === 0) {
            return undefined
          }
          const columns = result[0].columns
          const values = result[0].values[0]
          const row: any = {}
          columns.forEach((col, idx) => {
            row[col] = values[idx]
          })
          return row
        } catch (error) {
          console.error('Database error:', error)
          throw error
        }
      },
      all: (...params: any[]) => {
        try {
          const result = this.db.exec(sql, params)
          if (result.length === 0) {
            return []
          }
          const columns = result[0].columns
          return result[0].values.map((values) => {
            const row: any = {}
            columns.forEach((col, idx) => {
              row[col] = values[idx]
            })
            return row
          })
        } catch (error) {
          console.error('Database error:', error)
          throw error
        }
      },
    }
  }

  exec(sql: string) {
    try {
      this.db.run(sql)
      this.save()
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  }

  pragma(pragma: string) {
    // sql.js doesn't support pragmas
  }

  close() {
    if (this.db) {
      this.save()
      this.db.close()
    }
  }
}

let db: Database | null = null

export async function initializeDatabase(): Promise<Database> {
  try {
    // Detect if running in Tauri
    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window

    if (isTauri) {
      db = new TauriDatabase()
      await (db as TauriDatabase).init()
    } else {
      db = new WebDatabase()
      await (db as WebDatabase).init()
    }

    console.log('Database initialized successfully')
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.')
  }
  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
