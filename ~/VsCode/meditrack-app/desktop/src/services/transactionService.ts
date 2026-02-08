import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database'
import { Transaction } from '../store/slices/transactionSlice'

export class TransactionService {
  static recordTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
    const db = getDatabase()
    const id = uuidv4()

    const stmt = db.prepare(`
      INSERT INTO transactions (
        id, medicineId, medicineName, quantity, unitPrice, totalPrice,
        date, type, paymentMethod, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      transaction.medicineId,
      transaction.medicineName,
      transaction.quantity,
      transaction.unitPrice,
      transaction.totalPrice,
      transaction.date,
      transaction.type,
      transaction.paymentMethod,
      transaction.notes || null
    )

    return {
      ...transaction,
      id,
    }
  }

  static getTransactions(): Transaction[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM transactions ORDER BY date DESC')
    return stmt.all() as Transaction[]
  }

  static getTransactionById(id: string): Transaction | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?')
    return (stmt.get(id) as Transaction) || null
  }

  static getTransactionsByDateRange(dateFrom: string, dateTo: string): Transaction[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM transactions
      WHERE date BETWEEN ? AND ?
      ORDER BY date DESC
    `)
    return stmt.all(dateFrom, dateTo) as Transaction[]
  }

  static getTransactionsByType(type: 'sale' | 'purchase'): Transaction[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM transactions
      WHERE type = ?
      ORDER BY date DESC
    `)
    return stmt.all(type) as Transaction[]
  }

  static deleteTransaction(id: string): void {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?')
    stmt.run(id)
  }

  static calculateDailySales(date: string): number {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT SUM(totalPrice) as total FROM transactions
      WHERE type = 'sale' AND DATE(date) = ?
    `)
    const result = stmt.get(date) as { total: number | null }
    return result.total || 0
  }

  static calculateMonthlySales(year: number, month: number): number {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT SUM(totalPrice) as total FROM transactions
      WHERE type = 'sale' AND strftime('%Y-%m', date) = ?
    `)
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    const result = stmt.get(monthStr) as { total: number | null }
    return result.total || 0
  }

  static getTopSellingMedicines(limit: number = 10): Array<{ medicineName: string; totalQuantity: number; totalRevenue: number }> {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT medicineName, SUM(quantity) as totalQuantity, SUM(totalPrice) as totalRevenue
      FROM transactions
      WHERE type = 'sale'
      GROUP BY medicineId
      ORDER BY totalRevenue DESC
      LIMIT ?
    `)
    return stmt.all(limit) as Array<{ medicineName: string; totalQuantity: number; totalRevenue: number }>
  }

  static getDailySalesData(days: number = 30): Array<{ date: string; sales: number }> {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT DATE(date) as date, SUM(totalPrice) as sales
      FROM transactions
      WHERE type = 'sale' AND date >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(date)
      ORDER BY date ASC
    `)
    return stmt.all(days) as Array<{ date: string; sales: number }>
  }
}
