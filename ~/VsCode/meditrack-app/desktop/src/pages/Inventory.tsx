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
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          + Add Medicine
        </Button>
      </div>

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
