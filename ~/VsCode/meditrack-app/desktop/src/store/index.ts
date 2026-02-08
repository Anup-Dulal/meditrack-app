import { configureStore } from '@reduxjs/toolkit'
import medicineReducer from './slices/medicineSlice'
import transactionReducer from './slices/transactionSlice'
import cartReducer from './slices/cartSlice'
import authReducer from './slices/authSlice'

const store = configureStore({
  reducer: {
    medicines: medicineReducer,
    transactions: transactionReducer,
    cart: cartReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
