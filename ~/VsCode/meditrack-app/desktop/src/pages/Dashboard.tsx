import { useSelector } from 'react-redux'
import { RootState } from '../store'

export default function Dashboard() {
  const medicines = useSelector((state: RootState) => state.medicines.items)
  const transactions = useSelector((state: RootState) => state.transactions.items)

  const totalMedicines = medicines.length
  const totalValue = medicines.reduce((sum, m) => sum + (m.quantity * m.sellingPrice), 0)
  const totalSales = transactions.filter(t => t.type === 'sale').length

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Medicines</h3>
          <p className="text-3xl font-bold mt-2">{totalMedicines}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Inventory Value</h3>
          <p className="text-3xl font-bold mt-2">${totalValue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Total Sales</h3>
          <p className="text-3xl font-bold mt-2">{totalSales}</p>
        </div>
      </div>
    </div>
  )
}
