import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Medicine {
  id: string
  name: string
  genericName?: string
  manufacturer?: string
  batchNumber?: string
  quantity: number
  purchasePrice: number
  sellingPrice: number
  expiryDate?: string
  minimumStock: number
  barcode?: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface MedicineState {
  items: Medicine[]
  loading: boolean
  error: string | null
}

const initialState: MedicineState = {
  items: [],
  loading: false,
  error: null,
}

const medicineSlice = createSlice({
  name: 'medicines',
  initialState,
  reducers: {
    addMedicine: (state, action: PayloadAction<Medicine>) => {
      state.items.push(action.payload)
    },
    updateMedicine: (state, action: PayloadAction<Medicine>) => {
      const index = state.items.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteMedicine: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(m => m.id !== action.payload)
    },
    setMedicines: (state, action: PayloadAction<Medicine[]>) => {
      state.items = action.payload
    },
  },
})

export const { addMedicine, updateMedicine, deleteMedicine, setMedicines } = medicineSlice.actions
export default medicineSlice.reducer
