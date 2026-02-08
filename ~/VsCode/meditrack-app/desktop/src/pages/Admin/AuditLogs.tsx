import { useState, useEffect } from 'react'
import { AuditService } from '../../services/auditService'
import { AuthService } from '../../services/authService'
import Button from '../../components/Common/Button'
import Input from '../../components/Common/Input'
import Loading from '../../components/Common/Loading'
import toast from 'react-hot-toast'

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entity: '',
    dateFrom: '',
    dateTo: '',
  })

  useEffect(() => {
    loadLogs()
    loadUsers()
  }, [])

  const loadLogs = () => {
    setIsLoading(true)
    try {
      const allLogs = AuditService.getAuditLogs(1000)
      setLogs(allLogs)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = () => {
    try {
      const allUsers = AuthService.getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleFilterByDateRange = () => {
    if (!filters.dateFrom || !filters.dateTo) {
      toast.error('Please select both dates')
      return
    }

    setIsLoading(true)
    try {
      const filtered = AuditService.getAuditLogsByDateRange(filters.dateFrom, filters.dateTo)
      setLogs(filtered)
      toast.success('Logs filtered by date range')
    } catch (error) {
      console.error('Failed to filter logs:', error)
      toast.error('Failed to filter logs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterByUser = () => {
    if (!filters.userId) {
      toast.error('Please select a user')
      return
    }

    setIsLoading(true)
    try {
      const filtered = AuditService.getAuditLogsByUser(filters.userId, 1000)
      setLogs(filtered)
      toast.success('Logs filtered by user')
    } catch (error) {
      console.error('Failed to filter logs:', error)
      toast.error('Failed to filter logs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFilters({
      userId: '',
      action: '',
      entity: '',
      dateFrom: '',
      dateTo: '',
    })
    loadLogs()
  }

  const filteredLogs = logs.filter((log) => {
    if (filters.action && log.action !== filters.action) return false
    if (filters.entity && log.entity !== filters.entity) return false
    return true
  })

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Logs</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-bold">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              placeholder="e.g., CREATE, UPDATE"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
            <input
              type="text"
              value={filters.entity}
              onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              placeholder="e.g., Medicine, User"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleFilterByUser} size="sm" className="flex-1">
              Filter by User
            </Button>
            <Button onClick={handleReset} variant="secondary" size="sm" className="flex-1">
              Reset
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="From Date"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          />
          <Input
            label="To Date"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          />
          <div className="flex items-end">
            <Button onClick={handleFilterByDateRange} className="w-full">
              Filter by Date
            </Button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <Loading text="Loading audit logs..." />
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Entity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Entity ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Changes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{getUserName(log.userId)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.entity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{log.entityId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.changes ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">View</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Total Logs</p>
              <p className="text-3xl font-bold text-gray-900">{filteredLogs.length}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Unique Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Set(filteredLogs.map((l) => l.userId)).size}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Unique Actions</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Set(filteredLogs.map((l) => l.action)).size}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
