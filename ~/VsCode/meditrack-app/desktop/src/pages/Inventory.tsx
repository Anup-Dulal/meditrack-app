import { useSelector } from 'react-redux'
import { RootState } from '../store'

export default function Inventory() {
  const medicines = useSelector((state: RootState) => state.medicines.items)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(medicine => (
              <tr key={medicine.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{medicine.name}</td>
                <td className="px-6 py-4">{medicine.quantity}</td>
                <td className="px-6 py-4">${medicine.sellingPrice}</td>
                <td className="px-6 py-4">{medicine.expiryDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {medicines.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No medicines in inventory
          </div>
        )}
      </div>
    </div>
  )
}
