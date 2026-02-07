import Button from './Common/Button'
import { Medicine } from '../services/medicineService'

interface MedicineTableProps {
  medicines: Medicine[]
  onEdit: (medicine: Medicine) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export default function MedicineTable({
  medicines,
  onEdit,
  onDelete,
  isLoading = false,
}: MedicineTableProps) {
  if (medicines.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No medicines found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Generic Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Manufacturer</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Quantity</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Price</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expiry</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((medicine) => (
            <tr key={medicine.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{medicine.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{medicine.genericName || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{medicine.manufacturer || '-'}</td>
              <td className="px-6 py-4 text-sm text-right">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    medicine.quantity <= medicine.minimumStock
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {medicine.quantity}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">
                ₹{medicine.sellingPrice.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-center">
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onEdit(medicine)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(medicine.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
