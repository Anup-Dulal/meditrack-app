import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { ReportingService, SalesReport, InventoryReport, FinancialReport } from '../services/reportingService'
import Button from '../components/Common/Button'
import Loading from '../components/Common/Loading'

type Report = SalesReport | InventoryReport | FinancialReport

export default function Reports() {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'financial'>('sales')
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = () => {
    setLoading(true)
    try {
      let generatedReport: Report

      if (reportType === 'sales') {
        generatedReport = ReportingService.generateSalesReport(dateFrom, dateTo, period)
      } else if (reportType === 'inventory') {
        generatedReport = ReportingService.generateInventoryReport(dateFrom, dateTo, period)
      } else {
        generatedReport = ReportingService.generateFinancialReport(dateFrom, dateTo, period)
      }

      setReport(generatedReport)
      ReportingService.saveReport(generatedReport)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!report) return

    const csv = ReportingService.exportToCSV(report)
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv))
    element.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Generate and analyze business reports</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Report Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="financial">Financial Report</option>
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={generateReport} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
          {report && (
            <Button onClick={exportToCSV} variant="secondary">
              Export to CSV
            </Button>
          )}
        </div>
      </div>

      {/* Report Display */}
      {loading && <Loading />}

      {report && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {reportType === 'sales' && 'Sales Report'}
            {reportType === 'inventory' && 'Inventory Report'}
            {reportType === 'financial' && 'Financial Report'}
          </h2>

          {/* Sales Report */}
          {reportType === 'sales' && report.type === 'sales' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-blue-600">₹{report.totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-green-600">{report.totalTransactions}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average Transaction</p>
                  <p className="text-2xl font-bold text-purple-600">₹{report.averageTransaction.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Payment Methods</p>
                  <p className="text-2xl font-bold text-orange-600">{Object.keys(report.paymentMethods).length}</p>
                </div>
              </div>

              {/* Top Medicines */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Medicines</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Medicine Name</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Quantity Sold</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.topMedicines.map((medicine, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{medicine.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{medicine.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">₹{medicine.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(report.paymentMethods).map(([method, amount]) => (
                    <div key={method} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">{method}</p>
                      <p className="text-xl font-bold text-gray-900">₹{(amount as number).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Inventory Report */}
          {reportType === 'inventory' && report.type === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Medicines</p>
                  <p className="text-2xl font-bold text-blue-600">{report.totalMedicines}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">{report.lowStockItems.length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-yellow-600">{report.expiringItems.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{report.totalValue.toFixed(2)}</p>
                </div>
              </div>

              {/* Low Stock Items */}
              {report.lowStockItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Medicine Name</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Current Stock</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Minimum Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {report.lowStockItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-2 text-sm text-red-600 font-medium">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.minimumStock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Expiring Items */}
              {report.expiringItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiring Soon (30 days)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Medicine Name</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {report.expiringItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-2 text-sm text-yellow-600 font-medium">{item.expiryDate}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financial Report */}
          {reportType === 'financial' && report.type === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{report.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-red-600">₹{report.totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Gross Profit</p>
                  <p className="text-2xl font-bold text-blue-600">₹{report.grossProfit.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-purple-600">{report.profitMargin.toFixed(2)}%</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{report.transactionCount}</p>
              </div>
            </div>
          )}

          {/* Report Metadata */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <p>Report generated on: {new Date(report.generatedAt).toLocaleString()}</p>
            <p>Period: {report.dateFrom} to {report.dateTo}</p>
          </div>
        </div>
      )}
    </div>
  )
}
