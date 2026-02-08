import { describe, it, expect, beforeEach } from 'vitest'
import { initializeDatabase } from '../services/database'
import { TransactionService } from '../services/transactionService'
import { MedicineService } from '../services/medicineService'

describe('Transaction Service', () => {
  beforeEach(async () => {
    localStorage.clear()
    await initializeDatabase()
  })

  it('should create a transaction', () => {
    const medicine = MedicineService.createMedicine({
      name: 'Test Medicine',
      genericName: 'Test Generic',
      manufacturer: 'Test Pharma',
      quantity: 100,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
    })

    const transaction = TransactionService.createTransaction({
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: 5,
      unitPrice: 10,
      totalPrice: 50,
      paymentMethod: 'cash',
      type: 'sale',
    })

    expect(transaction).toBeDefined()
    expect(transaction.quantity).toBe(5)
    expect(transaction.totalPrice).toBe(50)
  })

  it('should get all transactions', () => {
    const medicine = MedicineService.createMedicine({
      name: 'Test Medicine',
      genericName: 'Test Generic',
      manufacturer: 'Test Pharma',
      quantity: 100,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
    })

    TransactionService.createTransaction({
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: 5,
      unitPrice: 10,
      totalPrice: 50,
      paymentMethod: 'cash',
      type: 'sale',
    })

    const transactions = TransactionService.getAllTransactions()
    expect(transactions.length).toBeGreaterThan(0)
  })

  it('should calculate total sales', () => {
    const medicine = MedicineService.createMedicine({
      name: 'Test Medicine',
      genericName: 'Test Generic',
      manufacturer: 'Test Pharma',
      quantity: 100,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
    })

    TransactionService.createTransaction({
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: 5,
      unitPrice: 10,
      totalPrice: 50,
      paymentMethod: 'cash',
      type: 'sale',
    })

    const stats = TransactionService.getTransactionStats()
    expect(stats.totalSales).toBeGreaterThan(0)
  })

  it('should filter transactions by date', () => {
    const medicine = MedicineService.createMedicine({
      name: 'Test Medicine',
      genericName: 'Test Generic',
      manufacturer: 'Test Pharma',
      quantity: 100,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
    })

    TransactionService.createTransaction({
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: 5,
      unitPrice: 10,
      totalPrice: 50,
      paymentMethod: 'cash',
      type: 'sale',
    })

    const today = new Date().toISOString().split('T')[0]
    const filtered = TransactionService.getTransactionsByDateRange(today, today)
    expect(filtered.length).toBeGreaterThan(0)
  })
})
