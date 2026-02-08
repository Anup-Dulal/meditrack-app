import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Medicine } from '../../services/medicineService'

export interface CartItem extends Medicine {
  cartQuantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  discount: number
}

const initialState: CartState = {
  items: [],
  total: 0,
  discount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ medicine: Medicine; quantity: number }>) => {
      const { medicine, quantity } = action.payload
      const existingItem = state.items.find(item => item.id === medicine.id)

      if (existingItem) {
        existingItem.cartQuantity += quantity
      } else {
        state.items.push({
          ...medicine,
          cartQuantity: quantity,
        })
      }

      state.total = calculateTotal(state.items, state.discount)
    },

    updateCartQuantity: (state, action: PayloadAction<{ medicineId: string; quantity: number }>) => {
      const { medicineId, quantity } = action.payload
      const item = state.items.find(item => item.id === medicineId)

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== medicineId)
        } else {
          item.cartQuantity = quantity
        }
      }

      state.total = calculateTotal(state.items, state.discount)
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      state.total = calculateTotal(state.items, state.discount)
    },

    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload
      state.total = calculateTotal(state.items, state.discount)
    },

    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.discount = 0
    },
  },
})

function calculateTotal(items: CartItem[], discount: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.sellingPrice * item.cartQuantity, 0)
  return Math.max(0, subtotal - discount)
}

export const { addToCart, updateCartQuantity, removeFromCart, setDiscount, clearCart } = cartSlice.actions
export default cartSlice.reducer
