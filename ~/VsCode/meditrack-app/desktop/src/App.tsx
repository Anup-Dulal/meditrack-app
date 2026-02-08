import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import Transactions from './pages/Transactions'
import './App.css'

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
