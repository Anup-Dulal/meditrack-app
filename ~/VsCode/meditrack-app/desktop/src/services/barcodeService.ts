import { MedicineService, Medicine } from './medicineService'

export interface BarcodeResult {
  barcode: string
  medicineId: string
  medicineName: string
  quantity: number
  sellingPrice: number
  found: boolean
}

export class BarcodeService {
  /**
   * Validate barcode format
   * Supports: EAN-13, EAN-8, UPC-A, UPC-E
   */
  static validateBarcode(barcode: string): boolean {
    // Remove spaces and dashes
    const cleaned = barcode.replace(/[\s-]/g, '')

    // Check if it's a valid barcode format
    if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(cleaned)) {
      return false
    }

    // Validate EAN-13 checksum
    if (cleaned.length === 13) {
      return this.validateEAN13(cleaned)
    }

    // Validate EAN-8 checksum
    if (cleaned.length === 8) {
      return this.validateEAN8(cleaned)
    }

    return true
  }

  private static validateEAN13(barcode: string): boolean {
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcode[i], 10)
      sum += digit * (i % 2 === 0 ? 1 : 3)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === parseInt(barcode[12], 10)
  }

  private static validateEAN8(barcode: string): boolean {
    let sum = 0
    for (let i = 0; i < 7; i++) {
      const digit = parseInt(barcode[i], 10)
      sum += digit * (i % 2 === 0 ? 3 : 1)
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === parseInt(barcode[7], 10)
  }

  /**
   * Look up medicine by barcode
   */
  static lookupMedicine(barcode: string): Medicine | null {
    const medicines = MedicineService.getMedicines()
    return medicines.find((m) => m.barcode === barcode) || null
  }

  /**
   * Scan barcode and return result
   */
  static scanBarcode(barcode: string): BarcodeResult {
    const cleaned = barcode.replace(/[\s-]/g, '')

    // Validate barcode format
    if (!this.validateBarcode(cleaned)) {
      return {
        barcode: cleaned,
        medicineId: '',
        medicineName: '',
        quantity: 0,
        sellingPrice: 0,
        found: false,
      }
    }

    // Look up medicine
    const medicine = this.lookupMedicine(cleaned)

    if (!medicine) {
      return {
        barcode: cleaned,
        medicineId: '',
        medicineName: '',
        quantity: 0,
        sellingPrice: 0,
        found: false,
      }
    }

    return {
      barcode: cleaned,
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: 1,
      sellingPrice: medicine.sellingPrice,
      found: true,
    }
  }

  /**
   * Batch scan multiple barcodes
   */
  static batchScan(barcodes: string[]): BarcodeResult[] {
    return barcodes.map((barcode) => this.scanBarcode(barcode))
  }

  /**
   * Generate barcode for medicine
   * In production, this would integrate with a barcode generation library
   */
  static generateBarcode(medicineId: string): string {
    // Simple barcode generation (in production, use a proper library)
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8)
    const barcode = `${timestamp}${random}`.substring(0, 13)

    // Pad with zeros if needed
    return barcode.padEnd(13, '0')
  }

  /**
   * Assign barcode to medicine
   */
  static assignBarcode(medicineId: string, barcode: string): void {
    const medicine = MedicineService.getMedicineById(medicineId)
    if (!medicine) {
      throw new Error(`Medicine with id ${medicineId} not found`)
    }

    // Check if barcode already exists
    const existing = this.lookupMedicine(barcode)
    if (existing && existing.id !== medicineId) {
      throw new Error('Barcode already assigned to another medicine')
    }

    MedicineService.updateMedicine(medicineId, { barcode })
  }

  /**
   * Get all medicines with barcodes
   */
  static getMedicinesWithBarcodes(): Medicine[] {
    const medicines = MedicineService.getMedicines()
    return medicines.filter((m) => m.barcode)
  }

  /**
   * Get medicines without barcodes
   */
  static getMedicinesWithoutBarcodes(): Medicine[] {
    const medicines = MedicineService.getMedicines()
    return medicines.filter((m) => !m.barcode)
  }

  /**
   * Check barcode availability
   */
  static isBarcodeAvailable(barcode: string): boolean {
    const medicine = this.lookupMedicine(barcode)
    return !medicine
  }

  /**
   * Decode barcode (for QR codes with embedded data)
   */
  static decodeQRCode(qrData: string): { medicineId?: string; quantity?: number; price?: number } {
    try {
      // QR code format: medicineId:quantity:price
      const parts = qrData.split(':')
      return {
        medicineId: parts[0],
        quantity: parts[1] ? parseInt(parts[1], 10) : 1,
        price: parts[2] ? parseFloat(parts[2]) : undefined,
      }
    } catch {
      return {}
    }
  }

  /**
   * Generate QR code data for medicine
   */
  static generateQRCodeData(medicineId: string, quantity: number = 1): string {
    const medicine = MedicineService.getMedicineById(medicineId)
    if (!medicine) {
      throw new Error(`Medicine with id ${medicineId} not found`)
    }

    return `${medicineId}:${quantity}:${medicine.sellingPrice}`
  }
}
