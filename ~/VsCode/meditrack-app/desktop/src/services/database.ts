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
