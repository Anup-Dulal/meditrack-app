import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { setMedicines, addMedicine as addMedicineAction, updateMedicine as updateMedicineAction, deleteMedicine as deleteMedicineAction } from '../store/slices/medicineSlice'
import { MedicineService, Medicine } from '../services/medicineService'
import MedicineTable from '../components/MedicineTable'
import MedicineForm from '../components/MedicineForm'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import Modal from '../components/Common/Modal'
import Button from '../components/Common/Button'
import Loading from '../components/Common/Loading'
import toast from 'react-hot-toast'

export default function Inventory() {
  const dispatch = useDispatch()
  const medicines = useSelector((state: RootState) => state.medicines.items)
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([])
  const [barcode, setBarcode] = useState('')
  const [scannedMedicine, setScannedMedicine] = useState<Medicine | null>(null)
  const [quantityToAdd, setQuantityToAdd] = useState(1)

  // Load medicines on mount
  useEffect(() => {
    try {
      const allMedicines = MedicineService.getMedicines()
      dispatch(setMedicines(allMedicines))
    } catch (error) {
      console.error('Failed to load medicines:', error)
      toast.error('Failed to load medicines')
    }
  }, [dispatch])

  // Filter and search medicines
  useEffect(() => {
    let result = medicines

    // Apply search
    if (searchQuery) {
      result = MedicineService.searchMedicines(searchQuery)
    }

    // Apply filter
    if (filter === 'low-stock') {
      result = result.filter(m => m.quantity <= m.minimumStock)
    } else if (filter === 'expiring') {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      result = result.filter(m => {
        if (!m.expiryDate) return false
        return new Date(m.expiryDate) <= thirtyDaysFromNow
      })
    }

    setFilteredMedicines(result)
  }, [medicines, searchQuery, filter])

  const handleAddMedicine = async (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    try {
      const newMedicine = MedicineService.addMedicine(data)
      dispatch(addMedicineAction(newMedicine))
      setIsFormOpen(false)
      toast.success('Medicine added successfully')
    } catch (error) {
      console.error('Failed to add medicine:', error)
      toast.error('Failed to add medicine')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateMedicine = async (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingMedicine) return

    setIsLoading(true)
    try {
      const updated = MedicineService.updateMedicine(editingMedicine.id, data)
      dispatch(updateMedicineAction(updated))
      setEditingMedicine(null)
      setIsFormOpen(false)
      toast.success('Medicine updated successfully')
    } catch (error) {
      console.error('Failed to update medicine:', error)
      toast.error('Failed to update medicine')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMedicine = (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      try {
        MedicineService.deleteMedicine(id)
        dispatch(deleteMedicineAction(id))
        toast.success('Medicine deleted successfully')
      } catch (error) {
        console.error('Failed to delete medicine:', error)
        toast.error('Failed to delete medicine')
      }
    }
  }

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMedicine(null)
  }

  const handleScanBarcode = () => {
    if (!barcode.trim()) {
      toast.error('Please enter a barcode')
      return
    }

    const found = medicines.find(m => m.barcode === barcode)
    if (found) {
      setScannedMedicine(found)
      setQuantityToAdd(1)
    } else {
      toast.error('Medicine not found with this barcode')
      setBarcode('')
    }
  }

  const handleAddScannedMedicine = async () => {
    if (!scannedMedicine) return

    setIsLoading(true)
    try {
      const updated = MedicineService.updateMedicine(scannedMedicine.id, {
        ...scannedMedicine,
        quantity: scannedMedicine.quantity + quantityToAdd,
      })
      dispatch(updateMedicineAction(updated))
      toast.success(`Added ${quantityToAdd} units of ${scannedMedicine.name}`)
      setScannedMedicine(null)
      setBarcode('')
      setQuantityToAdd(1)
    } catch (error) {
      console.error('Failed to update medicine:', error)
      toast.error('Failed to update medicine')
    } finally {
      setIsLoading(false)
    }
  }

  const getLowStockMedicines = () => {
    return medicines.filter(m => m.quantity <= m.minimumStock)
  }

  const lowStockCount = getLowStockMedicines().length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsScannerOpen(true)} className="bg-blue-600">
            📱 Scan Barcode
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            + Add Medicine
          </Button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <span className="text-red-600 font-bold text-lg">⚠️</span>
            <div className="ml-3">
              <p className="text-red-800 font-semibold">Low Stock Alert</p>
              <p className="text-red-700">{lowStockCount} medicine(s) below minimum stock level</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          <FilterBar onFilterChange={setFilter} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <Loading text="Loading medicines..." />
        ) : (
          <MedicineTable
            medicines={filteredMedicines}
            onEdit={handleEditMedicine}
            onDelete={handleDeleteMedicine}
          />
        )}
      </div>

      {/* Barcode Scanner Modal */}
      <Modal
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false)
          setScannedMedicine(null)
          setBarcode('')
          setQuantityToAdd(1)
        }}
        title="Scan Medicine Barcode"
      >
        <div className="space-y-4">
          {!scannedMedicine ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScanBarcode()}
                    placeholder="Enter or scan barcode"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <Button onClick={handleScanBarcode} disabled={isLoading}>
                    Search
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Medicine Found</p>
                <p className="text-lg font-bold text-blue-900">{scannedMedicine.name}</p>
                <p className="text-sm text-gray-600">Current Stock: {scannedMedicine.quantity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddScannedMedicine}
                  disabled={isLoading}
                  className="flex-1 bg-green-600"
                >
                  {isLoading ? 'Adding...' : 'Add to Inventory'}
                </Button>
                <Button
                  onClick={() => {
                    setScannedMedicine(null)
                    setBarcode('')
                    setQuantityToAdd(1)
                  }}
                  className="flex-1 bg-gray-400"
                >
                  Scan Another
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
      >
        <MedicineForm
          medicine={editingMedicine || undefined}
          onSubmit={editingMedicine ? handleUpdateMedicine : handleAddMedicine}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  )
}
