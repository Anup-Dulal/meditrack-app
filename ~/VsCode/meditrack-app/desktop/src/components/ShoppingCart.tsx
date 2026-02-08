import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { updateCartQuantity, removeFromCart, setDiscount } from '../store/slices/cartSlice'
import Button from './Common/Button'
import Input from './Common/Input'

interface ShoppingCartProps {
  onCheckout?: () => void
}

export default function ShoppingCart({ onCheckout }: ShoppingCartProps) {
  const dispatch = useDispatch()
  const { items, total, discount } = useSelector((state: RootState) => state.cart)

  const subtotal = items.reduce((sum, item) => sum + item.sellingPrice * item.cartQuantity, 0)

  const handleQuantityChange = (medicineId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartQuantity({ medicineId, quantity }))
    }
  }

  const handleRemove = (medicineId: string) => {
    dispatch(removeFromCart(medicineId))
  }

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    dispatch(setDiscount(Math.max(0, value)))
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 text-lg">Shopping cart is empty</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-xl font-bold">Shopping Cart</h2>

      {/* Cart Items */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">₹{item.sellingPrice.toFixed(2)} each</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={item.cartQuantity}
                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
              />
              <p className="w-20 text-right font-medium">₹{(item.sellingPrice * item.cartQuantity).toFixed(2)}</p>
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Discount */}
      <div className="border-t pt-4">
        <Input
          label="Discount (₹)"
          type="number"
          value={discount}
          onChange={handleDiscountChange}
          min="0"
          step="0.01"
        />
      </div>

      {/* Summary */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Discount:</span>
          <span>-₹{discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      {onCheckout && (
        <Button onClick={onCheckout} className="w-full">
          Proceed to Checkout
        </Button>
      )}
    </div>
  )
}
