import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Transaction {
  id: string
  medicineId: string
  medicineName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  date: string
  type: 'sale' | 'purchase'
  paymentMethod: 'cash' | 'card' | 'check'
  notes?: string
}

interface TransactionState {
  items: Transaction[]
  loading: boolean
  error: string | null
  filter: {
    type: 'all' | 'sale' | 'purchase'
    dateFrom?: string
    dateTo?: string
  }
}

const initialState: TransactionState = {
  items: [],
  loading: false,
  error: null,
  filter: {
    type: 'all',
  },
}

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.items.unshift(action.payload)
    },

    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload
    },

    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload)
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    setFilter: (state, action: PayloadAction<TransactionState['filter']>) => {
      state.filter = action.payload
    },

    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  addTransaction,
  setTransactions,
  deleteTransaction,
  setLoading,
  setError,
  setFilter,
  clearError,
} = transactionSlice.actions
export default transactionSlice.reducer
