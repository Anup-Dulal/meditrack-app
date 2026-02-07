import { useState } from 'react'
import Input from './Common/Input'
import Button from './Common/Button'
import { Medicine } from '../services/medicineService'

interface MedicineFormProps {
  medicine?: Medicine
  onSubmit: (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void
  isLoading?: boolean
}

export default function MedicineForm({ medicine, onSubmit, isLoading = false }: MedicineFormProps) {
  const [formData, setFormData] = useState({
    name: medicine?.name || '',
    genericName: medicine?.genericName || '',
    manufacturer: medicine?.manufacturer || '',
    batchNumber: medicine?.batchNumber || '',
    quantity: medicine?.quantity || 0,
    purchasePrice: medicine?.purchasePrice || 0,
    sellingPrice: medicine?.sellingPrice || 0,
    expiryDate: medicine?.expiryDate || '',
    minimumStock: medicine?.minimumStock || 10,
    barcode: medicine?.barcode || '',
    description: medicine?.description || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Medicine name is required'
    }
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative'
    }
    if (formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'Purchase price cannot be negative'
    }
    if (formData.sellingPrice < 0) {
      newErrors.sellingPrice = 'Selling price cannot be negative'
    }
    if (formData.minimumStock < 0) {
      newErrors.minimumStock = 'Minimum stock cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('quantity') || name.includes('Stock')
        ? parseFloat(value) || 0
        : value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Medicine Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <Input
          label="Generic Name"
          name="genericName"
          value={formData.genericName}
          onChange={handleChange}
        />
        <Input
          label="Manufacturer"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
        />
        <Input
          label="Batch Number"
          name="batchNumber"
          value={formData.batchNumber}
          onChange={handleChange}
        />
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
          min="0"
        />
        <Input
          label="Purchase Price"
          name="purchasePrice"
          type="number"
          value={formData.purchasePrice}
          onChange={handleChange}
          error={errors.purchasePrice}
          min="0"
          step="0.01"
        />
        <Input
          label="Selling Price"
          name="sellingPrice"
          type="number"
          value={formData.sellingPrice}
          onChange={handleChange}
          error={errors.sellingPrice}
          min="0"
          step="0.01"
        />
        <Input
          label="Expiry Date"
          name="expiryDate"
          type="date"
          value={formData.expiryDate}
          onChange={handleChange}
        />
        <Input
          label="Minimum Stock"
          name="minimumStock"
          type="number"
          value={formData.minimumStock}
          onChange={handleChange}
          error={errors.minimumStock}
          min="0"
        />
        <Input
          label="Barcode"
          name="barcode"
          value={formData.barcode}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="secondary" type="reset">
          Clear
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : medicine ? 'Update Medicine' : 'Add Medicine'}
        </Button>
      </div>
    </form>
  )
}
