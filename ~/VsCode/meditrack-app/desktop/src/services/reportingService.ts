import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database'
import { TransactionService } from './transactionService'
import { MedicineService } from './medicineService'

export interface SalesReport {
  id: string
  type: 'sales'
  period: 'daily' | 'weekly' | 'monthly'
  dateFrom: string
  dateTo: string
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  topMedicines: Array<{ name: string; quantity: number; revenue: number }>
  paymentMethods: Record<string, number>
  generatedAt: string
}

export interface InventoryReport {
  id: string
  type: 'inventory'
  period: 'daily' | 'weekly' | 'monthly'
  dateFrom: string
  dateTo: string
  totalMedicines: number
  lowStockItems: Array<{ name: string; quantity: number; minimumStock: number }>
  expiringItems: Array<{ name: string; expiryDate: string; quantity: number }>
  totalValue: number
  generatedAt: string
}

export interface FinancialReport {
  id: string
  type: 'financial'
  period: 'daily' | 'weekly' | 'monthly'
  dateFrom: string
  dateTo: string
  totalRevenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number
  transactionCount: number
  generatedAt: string
}

export type Report = SalesReport | InventoryReport | FinancialReport

export class ReportingService {
  static generateSalesReport(
    dateFrom: string,
    dateTo: string,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): SalesReport {
    const id = uuidv4()
    const transactions = TransactionService.getTransactionsByDateRange(dateFrom, dateTo)
    const salesTransactions = transactions.filter((t) => t.type === 'sale')

    const totalSales = salesTransactions.reduce((sum, t) => sum + t.totalPrice, 0)
    const totalTransactions = salesTransactions.length
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

    // Get top medicines
    const medicineMap = new Map<string, { name: string; quantity: number; revenue: number }>()
    salesTransactions.forEach((t) => {
      const existing = medicineMap.get(t.medicineId) || {
        name: t.medicineName,
        quantity: 0,
        revenue: 0,
      }
      medicineMap.set(t.medicineId, {
        name: t.medicineName,
        quantity: existing.quantity + t.quantity,
        revenue: existing.revenue + t.totalPrice,
      })
    })

    const topMedicines = Array.from(medicineMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Get payment methods breakdown
    const paymentMethods: Record<string, number> = {}
    salesTransactions.forEach((t) => {
      paymentMethods[t.paymentMethod] = (paymentMethods[t.paymentMethod] || 0) + t.totalPrice
    })

    return {
      id,
      type: 'sales',
      period,
      dateFrom,
      dateTo,
      totalSales,
      totalTransactions,
      averageTransaction,
      topMedicines,
      paymentMethods,
      generatedAt: new Date().toISOString(),
    }
  }

  static generateInventoryReport(
    dateFrom: string,
    dateTo: string,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): InventoryReport {
    const id = uuidv4()
    const medicines = MedicineService.getMedicines()
    const lowStockItems = MedicineService.getLowStockMedicines()

    // Get expiring items (within 30 days)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expiringItems = medicines.filter((m) => {
      if (!m.expiryDate) return false
      const expiryDate = new Date(m.expiryDate)
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today
    })

    // Calculate total inventory value
    const totalValue = medicines.reduce((sum, m) => sum + m.quantity * m.purchasePrice, 0)

    return {
      id,
      type: 'inventory',
      period,
      dateFrom,
      dateTo,
      totalMedicines: medicines.length,
      lowStockItems: lowStockItems.map((m) => ({
        name: m.name,
        quantity: m.quantity,
        minimumStock: m.minimumStock,
      })),
      expiringItems: expiringItems.map((m) => ({
        name: m.name,
        expiryDate: m.expiryDate || '',
        quantity: m.quantity,
      })),
      totalValue,
      generatedAt: new Date().toISOString(),
    }
  }

  static generateFinancialReport(
    dateFrom: string,
    dateTo: string,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): FinancialReport {
    const id = uuidv4()
    const transactions = TransactionService.getTransactionsByDateRange(dateFrom, dateTo)

    // Calculate revenue (sales)
    const salesTransactions = transactions.filter((t) => t.type === 'sale')
    const totalRevenue = salesTransactions.reduce((sum, t) => sum + t.totalPrice, 0)

    // Calculate cost (purchases)
    const purchaseTransactions = transactions.filter((t) => t.type === 'purchase')
    const totalCost = purchaseTransactions.reduce((sum, t) => sum + t.totalPrice, 0)

    const grossProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    return {
      id,
      type: 'financial',
      period,
      dateFrom,
      dateTo,
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin,
      transactionCount: transactions.length,
      generatedAt: new Date().toISOString(),
    }
  }

  static saveReport(report: Report): void {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO reports (id, type, period, data, generatedAt)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(report.id, report.type, report.period, JSON.stringify(report), report.generatedAt)
  }

  static getReport(id: string): Report | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM reports WHERE id = ?')
    const result = stmt.get(id) as any

    if (!result) return null

    return JSON.parse(result.data)
  }

  static getReports(type?: string, limit: number = 100): Report[] {
    const db = getDatabase()
    let stmt

    if (type) {
      stmt = db.prepare(`
        SELECT * FROM reports
        WHERE type = ?
        ORDER BY generatedAt DESC
        LIMIT ?
      `)
      const results = stmt.all(type, limit) as any[]
      return results.map((r) => JSON.parse(r.data))
    } else {
      stmt = db.prepare(`
        SELECT * FROM reports
        ORDER BY generatedAt DESC
        LIMIT ?
      `)
      const results = stmt.all(limit) as any[]
      return results.map((r) => JSON.parse(r.data))
    }
  }

  static exportToPDF(report: Report): string {
    // This would use a library like pdfkit or jsPDF
    // For now, return a JSON representation
    return JSON.stringify(report, null, 2)
  }

  static exportToCSV(report: Report): string {
    if (report.type === 'sales') {
      const r = report as SalesReport
      let csv = 'Sales Report\n'
      csv += `Period: ${r.dateFrom} to ${r.dateTo}\n`
      csv += `Total Sales,${r.totalSales}\n`
      csv += `Total Transactions,${r.totalTransactions}\n`
      csv += `Average Transaction,${r.averageTransaction}\n\n`
      csv += 'Top Medicines\n'
      csv += 'Name,Quantity,Revenue\n'
      r.topMedicines.forEach((m) => {
        csv += `${m.name},${m.quantity},${m.revenue}\n`
      })
      return csv
    } else if (report.type === 'inventory') {
      const r = report as InventoryReport
      let csv = 'Inventory Report\n'
      csv += `Period: ${r.dateFrom} to ${r.dateTo}\n`
      csv += `Total Medicines,${r.totalMedicines}\n`
      csv += `Total Value,${r.totalValue}\n\n`
      csv += 'Low Stock Items\n'
      csv += 'Name,Quantity,Minimum Stock\n'
      r.lowStockItems.forEach((m) => {
        csv += `${m.name},${m.quantity},${m.minimumStock}\n`
      })
      csv += '\nExpiring Items\n'
      csv += 'Name,Expiry Date,Quantity\n'
      r.expiringItems.forEach((m) => {
        csv += `${m.name},${m.expiryDate},${m.quantity}\n`
      })
      return csv
    } else {
      const r = report as FinancialReport
      let csv = 'Financial Report\n'
      csv += `Period: ${r.dateFrom} to ${r.dateTo}\n`
      csv += `Total Revenue,${r.totalRevenue}\n`
      csv += `Total Cost,${r.totalCost}\n`
      csv += `Gross Profit,${r.grossProfit}\n`
      csv += `Profit Margin,${r.profitMargin}%\n`
      csv += `Transaction Count,${r.transactionCount}\n`
      return csv
    }
  }

  static deleteReport(id: string): void {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM reports WHERE id = ?')
    stmt.run(id)
  }
}
