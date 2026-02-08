import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setTransactions, setFilter } from '../store/slices/transactionSlice'
import { TransactionService } from '../services/transactionService'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import Loading from '../components/Common/Loading'
import toast from 'react-hot-toast'

export default function Transactions() {
  const dispatch = useDispatch()
  const transactions = useSelector((state: RootState) => state.transactions.items)
  const filter = useSelector((state: RootState) => state.transactions.filter)
  const [isLoading, setIsLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Load transactions on mount
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = () => {
    setIsLoading(true)
    try {
      const allTransactions = TransactionService.getTransactions()
      dispatch(setTransactions(allTransactions))
    } catch (error) {
      console.error('Failed to load transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterByType = (type: 'all' | 'sale' | 'purchase') => {
    dispatch(setFilter({ ...filter, type }))
  }

  const handleFilterByDate = () => {
    if (!dateFrom || !dateTo) {
      toast.error('Please select both dates')
      return
    }

    setIsLoading(true)
    try {
      const filtered = TransactionService.getTransactionsByDateRange(dateFrom, dateTo)
      dispatch(setTransactions(filtered))
      toast.success('Transactions filtered by date')
    } catch (error) {
      console.error('Failed to filter transactions:', error)
      toast.error('Failed to filter transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    try {
      const csv = [
        ['ID', 'Medicine', 'Quantity', 'Unit Price', 'Total Price', 'Date', 'Type', 'Payment Method'],
        ...transactions.map((t) => [
          t.id,
          t.medicineName,
          t.quantity,
          t.unitPrice,
          t.totalPrice,
          t.date,
          t.type,
          t.paymentMethod,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      toast.success('Transactions exported to CSV')
    } catch (error) {
      console.error('Failed to export:', error)
      toast.error('Failed to export transactions')
    }
  }

  const filteredTransactions = transactions.filter((t) => filter.type === 'all' || t.type === filter.type)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <Button onClick={handleExportCSV} variant="secondary">
          Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-bold">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="flex gap-2">
              {(['all', 'sale', 'purchase'] as const).map((type) => (
                <Button
                  key={type}
                  onClick={() => handleFilterByType(type)}
                  variant={filter.type === type ? 'primary' : 'secondary'}
                  size="sm"
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
              />
              <Button onClick={handleFilterByDate} size="sm">
                Filter
              </Button>
            </div>
          </div>
        </div>

        <Button onClick={loadTransactions} variant="secondary" className="w-full">
          Reset Filters
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <Loading text="Loading transactions..." />
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Medicine</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Qty</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {transaction.medicineName}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      ₹{transaction.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                      ₹{transaction.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'sale'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {transaction.paymentMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900">{filteredTransactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{filteredTransactions.reduce((sum, t) => sum + t.totalPrice, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Quantity Sold</p>
            <p className="text-3xl font-bold text-blue-600">
              {filteredTransactions.reduce((sum, t) => sum + t.quantity, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
