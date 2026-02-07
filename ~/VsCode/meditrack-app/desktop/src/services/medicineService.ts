import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database'

export interface Medicine {
  id: string
  name: string
  genericName?: string
  manufacturer?: string
  batchNumber?: string
  quantity: number
  purchasePrice: number
  sellingPrice: number
  expiryDate?: string
  minimumStock: number
  barcode?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export class MedicineService {
  static addMedicine(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine {
    const db = getDatabase()
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO medicines (
        id, name, genericName, manufacturer, batchNumber, quantity,
        purchasePrice, sellingPrice, expiryDate, minimumStock, barcode,
        description, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      medicine.name,
      medicine.genericName || null,
      medicine.manufacturer || null,
      medicine.batchNumber || null,
      medicine.quantity,
      medicine.purchasePrice,
      medicine.sellingPrice,
      medicine.expiryDate || null,
      medicine.minimumStock,
      medicine.barcode || null,
      medicine.description || null,
      now,
      now
    )

    return {
      ...medicine,
      id,
      createdAt: now,
      updatedAt: now,
    }
  }

  static getMedicines(): Medicine[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM medicines ORDER BY name ASC')
    return stmt.all() as Medicine[]
  }

  static getMedicineById(id: string): Medicine | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM medicines WHERE id = ?')
    return (stmt.get(id) as Medicine) || null
  }

  static searchMedicines(query: string): Medicine[] {
    const db = getDatabase()
    const searchTerm = `%${query}%`
    const stmt = db.prepare(`
      SELECT * FROM medicines
      WHERE name LIKE ? OR genericName LIKE ? OR barcode LIKE ?
      ORDER BY name ASC
    `)
    return stmt.all(searchTerm, searchTerm, searchTerm) as Medicine[]
  }

  static updateMedicine(id: string, updates: Partial<Medicine>): Medicine {
    const db = getDatabase()
    const now = new Date().toISOString()

    const medicine = this.getMedicineById(id)
    if (!medicine) {
      throw new Error(`Medicine with id ${id} not found`)
    }

    const updated = { ...medicine, ...updates, updatedAt: now }

    const stmt = db.prepare(`
      UPDATE medicines SET
        name = ?, genericName = ?, manufacturer = ?, batchNumber = ?,
        quantity = ?, purchasePrice = ?, sellingPrice = ?, expiryDate = ?,
        minimumStock = ?, barcode = ?, description = ?, updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.name,
      updated.genericName || null,
      updated.manufacturer || null,
      updated.batchNumber || null,
      updated.quantity,
      updated.purchasePrice,
      updated.sellingPrice,
      updated.expiryDate || null,
      updated.minimumStock,
      updated.barcode || null,
      updated.description || null,
      now,
      id
    )

    return updated
  }

  static deleteMedicine(id: string): void {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM medicines WHERE id = ?')
    stmt.run(id)
  }

  static updateStock(id: string, quantity: number): Medicine {
    const medicine = this.getMedicineById(id)
    if (!medicine) {
      throw new Error(`Medicine with id ${id} not found`)
    }

    return this.updateMedicine(id, { quantity })
  }

  static getLowStockMedicines(): Medicine[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM medicines
      WHERE quantity <= minimumStock
      ORDER BY quantity ASC
    `)
    return stmt.all() as Medicine[]
  }
}
