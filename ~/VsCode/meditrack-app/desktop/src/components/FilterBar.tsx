interface FilterBarProps {
  onFilterChange: (filter: string) => void
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onFilterChange('all')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('low-stock')}
        className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Low Stock
      </button>
      <button
        onClick={() => onFilterChange('expiring')}
        className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Expiring Soon
      </button>
    </div>
  )
}
