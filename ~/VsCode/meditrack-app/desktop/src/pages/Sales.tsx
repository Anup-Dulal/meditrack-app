import { useSelector } from 'react-redux'
import { RootState } from '../store'

export default function Sales() {
  const transactions = useSelector((state: RootState) => state.transactions.items)
  const sales = transactions.filter(t => t.type === 'sale')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Sales</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Medicine ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Total Price</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{sale.date}</td>
                <td className="px-6 py-4">{sale.medicineId}</td>
                <td className="px-6 py-4">{sale.quantity}</td>
                <td className="px-6 py-4">${sale.totalPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sales recorded
          </div>
        )}
      </div>
    </div>
  )
}
