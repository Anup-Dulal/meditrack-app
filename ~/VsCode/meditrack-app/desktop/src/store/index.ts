import { configureStore } from '@reduxjs/toolkit'
import medicineReducer from './slices/medicineSlice'
import transactionReducer from './slices/transactionSlice'

const store = configureStore({
  reducer: {
    medicines: medicineReducer,
    transactions: transactionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
