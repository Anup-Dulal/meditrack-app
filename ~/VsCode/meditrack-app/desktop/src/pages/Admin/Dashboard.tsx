import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { TransactionService } from '../../services/transactionService'
import { AuthService } from '../../services/authService'
import { AuditService } from '../../services/auditService'
import Loading from '../../components/Common/Loading'

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.auth.user)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    todaySales: 0,
    recentTransactions: [] as any[],
    recentAuditLogs: [] as any[],
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    setIsLoading(true)
    try {
      const users = AuthService.getAllUsers()
      const transactions = TransactionService.getTransactions()
      const auditLogs = AuditService.getAuditLogs(5)

      const today = new Date().toISOString().split('T')[0]
      const todayTransactions = transactions.filter(
        (t) => t.date.split('T')[0] === today && t.type === 'sale'
      )

      const totalRevenue = transactions
        .filter((t) => t.type === 'sale')
        .reduce((sum, t) => sum + t.totalPrice, 0)

      const todaySales = todayTransactions.reduce((sum, t) => sum + t.totalPrice, 0)

      setStats({
        totalUsers: users.length,
        totalTransactions: transactions.length,
        totalRevenue,
        todaySales,
        recentTransactions: transactions.slice(0, 5),
        recentAuditLogs: auditLogs,
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Loading text="Loading dashboard..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTransactions}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Today's Sales</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">₹{stats.todaySales.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
          {stats.recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.medicineName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{transaction.totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 capitalize">{transaction.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {stats.recentAuditLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentAuditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">{log.action}</p>
                    <p className="text-sm text-gray-600">{log.entity}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <p className="font-medium text-gray-900">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">API</p>
              <p className="font-medium text-gray-900">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Storage</p>
              <p className="font-medium text-gray-900">Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
