import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { addToCart, clearCart } from '../store/slices/cartSlice'
import { addTransaction } from '../store/slices/transactionSlice'
import { updateMedicine } from '../store/slices/medicineSlice'
import { MedicineService } from '../services/medicineService'
import { TransactionService } from '../services/transactionService'
import ShoppingCart from '../components/ShoppingCart'
import PaymentForm from '../components/PaymentForm'
import Receipt from '../components/Receipt'
import SearchBar from '../components/SearchBar'
import Button from '../components/Common/Button'
import Modal from '../components/Common/Modal'
import Loading from '../components/Common/Loading'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

export default function Sales() {
  const dispatch = useDispatch()
  const medicines = useSelector((state: RootState) => state.medicines.items)
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const cartTotal = useSelector((state: RootState) => state.cart.total)
  const cartDiscount = useSelector((state: RootState) => state.cart.discount)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [showPayment, setShowPayment] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  const filteredMedicines = searchQuery
    ? MedicineService.searchMedicines(searchQuery)
    : medicines

  const handleAddToCart = () => {
    if (!selectedMedicine || quantity <= 0) {
      toast.error('Please select a medicine and quantity')
      return
    }

    if (quantity > selectedMedicine.quantity) {
      toast.error('Insufficient stock')
      return
    }

    dispatch(addToCart({ medicine: selectedMedicine, quantity }))
    toast.success(`${selectedMedicine.name} added to cart`)
    setSelectedMedicine(null)
    setQuantity(1)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty')
      return
    }
    setShowPayment(true)
  }

  const handlePayment = async (paymentMethod: 'cash' | 'card' | 'check', amountPaid: number) => {
    setIsProcessing(true)
    try {
      const transactionId = uuidv4()
      const now = new Date().toISOString()

      // Record each item as a transaction
      for (const item of cartItems) {
        const transaction = {
          medicineId: item.id,
          medicineName: item.name,
          quantity: item.cartQuantity,
          unitPrice: item.sellingPrice,
          totalPrice: item.sellingPrice * item.cartQuantity,
          date: now,
          type: 'sale' as const,
          paymentMethod,
        }

        TransactionService.recordTransaction(transaction)
        dispatch(addTransaction({ ...transaction, id: uuidv4() }))

        // Update medicine quantity
        const updatedMedicine = MedicineService.updateMedicine(item.id, {
          quantity: item.quantity - item.cartQuantity,
        })
        dispatch(updateMedicine(updatedMedicine))
      }

      setLastTransaction({
        id: transactionId,
        items: cartItems,
        subtotal: cartItems.reduce((sum, item) => sum + item.sellingPrice * item.cartQuantity, 0),
        discount: cartDiscount,
        total: cartTotal,
        paymentMethod,
        date: now,
      })

      setShowPayment(false)
      setShowReceipt(true)
      dispatch(clearCart())
      toast.success('Payment processed successfully')
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewSale = () => {
    setShowReceipt(false)
    setLastTransaction(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Point of Sale</h1>
        <Button onClick={() => dispatch(clearCart())} variant="secondary">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">Select Medicine</h2>

            <SearchBar onSearch={setSearchQuery} placeholder="Search medicines..." />

            {/* Medicine List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  onClick={() => setSelectedMedicine(medicine)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMedicine?.id === medicine.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-sm text-gray-600">{medicine.genericName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">₹{medicine.sellingPrice.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Stock: {medicine.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity Input */}
            {selectedMedicine && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedMedicine.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-sm text-gray-600">
                    (Available: {selectedMedicine.quantity})
                  </span>
                </div>
                <Button onClick={handleAddToCart} className="w-full">
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Shopping Cart */}
        <div>
          <ShoppingCart onCheckout={handleCheckout} />
        </div>
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Payment">
        {isProcessing ? (
          <Loading text="Processing payment..." />
        ) : (
          <PaymentForm
            total={cartTotal}
            onSubmit={handlePayment}
            isLoading={isProcessing}
          />
        )}
      </Modal>

      {/* Receipt Modal */}
      <Modal isOpen={showReceipt} onClose={handleNewSale} title="Receipt">
        {lastTransaction && (
          <div className="space-y-4">
            <Receipt
              items={lastTransaction.items}
              subtotal={lastTransaction.subtotal}
              discount={lastTransaction.discount}
              total={lastTransaction.total}
              transactionId={lastTransaction.id}
              paymentMethod={lastTransaction.paymentMethod}
              date={lastTransaction.date}
            />
            <Button onClick={handleNewSale} className="w-full">
              New Sale
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
