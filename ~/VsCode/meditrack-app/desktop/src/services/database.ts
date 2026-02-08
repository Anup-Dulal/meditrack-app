import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database | null = null

export function initializeDatabase() {
  try {
    // For development, use a local database file
    const dbPath = path.join(process.cwd(), 'meditrack.db')
    db = new Database(dbPath)

    // Enable foreign keys
    db.pragma('foreign_keys = ON')

    // Create tables
    createTables()

    console.log('Database initialized successfully')
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

function createTables() {
  if (!db) throw new Error('Database not initialized')

  // Roles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT,
      createdAt TEXT
    )
  `)

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
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
    )
  `)

  // Medicines table
  db.exec(`
    CREATE TABLE IF NOT EXISTS medicines (
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
    )
  `)

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      medicineId TEXT NOT NULL,
      medicineName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      totalPrice REAL NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (medicineId) REFERENCES medicines(id)
    )
  `)

  // Alerts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      medicineId TEXT NOT NULL,
      type TEXT,
      message TEXT,
      createdAt TEXT,
      FOREIGN KEY (medicineId) REFERENCES medicines(id)
    )
  `)

  // Audit logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT,
      entityId TEXT,
      changes TEXT,
      timestamp TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `)

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      type TEXT,
      updatedAt TEXT
    )
  `)

  // Initialize default roles if they don't exist
  initializeDefaultRoles()
}

export function getDatabase() {
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

function initializeDefaultRoles() {
  if (!db) return

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

  const stmt = db.prepare('SELECT COUNT(*) as count FROM roles')
  const result = stmt.get() as any

  if (result.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO roles (id, name, description, permissions, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `)

    const now = new Date().toISOString()
    for (const role of roles) {
      insertStmt.run(role.id, role.name, role.description, JSON.stringify(role.permissions), now)
    }

    // Create default admin user
    const userStmt = db.prepare(`
      INSERT INTO users (id, username, email, password, firstName, lastName, roleId, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    userStmt.run(
      'user-admin',
      'admin',
      'admin@meditrack.local',
      Buffer.from('admin123').toString('base64'), // Simple hash for demo
      'Admin',
      'User',
      'role-admin',
      'active',
      now,
      now
    )
  }
}
