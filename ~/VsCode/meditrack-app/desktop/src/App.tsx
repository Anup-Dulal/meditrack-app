import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import MainLayout from './components/Layout/MainLayout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import Transactions from './pages/Transactions'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminUsers from './pages/Admin/Users'
import AdminSettings from './pages/Admin/Settings'
import AdminAuditLogs from './pages/Admin/AuditLogs'
import './App.css'

function App() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/transactions" element={<Transactions />} />

                  {/* Admin Routes - Only accessible to Admin role */}
                  {user?.role === 'Admin' && (
                    <>
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                    </>
                  )}
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
