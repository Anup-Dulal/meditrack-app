import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Transaction {
  id: string
  medicineId: string
  quantity: number
  totalPrice: number
  date: string
  type: 'sale' | 'purchase'
}

interface TransactionState {
  items: Transaction[]
  loading: boolean
  error: string | null
}

const initialState: TransactionState = {
  items: [],
  loading: false,
  error: null,
}

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.items.push(action.payload)
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload
    },
  },
})

export const { addTransaction, setTransactions } = transactionSlice.actions
export default transactionSlice.reducer
