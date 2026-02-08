import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation()
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: 'M3 12l2-12v12H3zm0 0h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z' },
    { label: 'Inventory', path: '/inventory', icon: 'M20 7l-8-4-8 4m0 0l8 4 8-4m-8 4v10l-8-4v-10l8 4z' },
    { label: 'Sales', path: '/sales', icon: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z' },
    { label: 'Transactions', path: '/transactions', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' },
    { label: 'Reports', path: '/reports', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z' },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white transform transition-transform duration-300 z-50 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="p-6 border-b border-gray-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">MT</span>
              </div>
              <span className="font-bold text-lg">MediTrack</span>
            </Link>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer section */}
          <div className="p-4 border-t border-gray-800">
            <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm font-medium transition-colors">
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
