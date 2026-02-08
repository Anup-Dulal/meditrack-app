import { describe, it, expect, beforeEach } from 'vitest'
import { initializeDatabase } from '../services/database'
import { MedicineService } from '../services/medicineService'

describe('Medicine Service', () => {
  beforeEach(async () => {
    localStorage.clear()
    await initializeDatabase()
  })

  it('should create a medicine', () => {
    const medicine = MedicineService.createMedicine({
      name: 'Aspirin',
      genericName: 'Acetylsalicylic Acid',
      manufacturer: 'Pharma Co',
      quantity: 100,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
      minimumStock: 10,
      barcode: '1234567890123',
    })

    expect(medicine).toBeDefined()
    expect(medicine.name).toBe('Aspirin')
    expect(medicine.quantity).toBe(100)
  })

  it('should get all medicines', () => {
    MedicineService.createMedicine({
      name: 'Medicine 1',
      genericName: 'Generic 1',
      manufacturer: 'Pharma',
      quantity: 50,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
    })

    MedicineService.createMedicine({
      name: 'Medicine 2',
      genericName: 'Generic 2',
      manufacturer: 'Pharma',
      quantity: 75,
      purchasePrice: 8,
      sellingPrice: 15,
      expiryDate: '2026-12-31',
    })

    const medicines = MedicineService.getAllMedicines()
    expect(medicines.length).toBeGreaterThanOrEqual(2)
  })

  it('should update a medicine', () => {
    const medicine = MedicineService.createMedicine({
      name: 'Test Medicine',
      genericName: 'Test Generic',
      manufacturer: 'Test Pharma',
      quantity: 100,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
    })

    const updated = MedicineService.updateMedicine(medicine.id, {
      quantity: 150,
    })

    expect(updated.quantity).toBe(150)
  })

  it('should delete a medicine', () => {
    const medicine = MedicineService.createMedicine({
      name: 'Delete Me',
      genericName: 'Delete Generic',
      manufacturer: 'Delete Pharma',
      quantity: 100,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
    })

    MedicineService.deleteMedicine(medicine.id)
    const deleted = MedicineService.getMedicineById(medicine.id)
    expect(deleted).toBeNull()
  })

  it('should search medicines by name', () => {
    MedicineService.createMedicine({
      name: 'Aspirin',
      genericName: 'Acetylsalicylic Acid',
      manufacturer: 'Pharma',
      quantity: 100,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
    })

    const results = MedicineService.searchMedicines('Aspirin')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].name).toContain('Aspirin')
  })

  it('should get low stock medicines', () => {
    MedicineService.createMedicine({
      name: 'Low Stock',
      genericName: 'Low Generic',
      manufacturer: 'Pharma',
      quantity: 5,
      purchasePrice: 5,
      sellingPrice: 10,
      expiryDate: '2026-12-31',
      minimumStock: 10,
    })

    const lowStock = MedicineService.getLowStockMedicines()
    expect(lowStock.length).toBeGreaterThan(0)
  })
})
