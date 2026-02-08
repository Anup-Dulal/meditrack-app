import { useRef } from 'react'
import { CartItem } from '../store/slices/cartSlice'
import Button from './Common/Button'

interface ReceiptProps {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  transactionId: string
  paymentMethod: 'cash' | 'card' | 'check'
  date: string
  storeName?: string
  storeAddress?: string
  storePhone?: string
}

export default function Receipt({
  items,
  subtotal,
  discount,
  total,
  transactionId,
  paymentMethod,
  date,
  storeName = 'MediTrack Pharmacy',
  storeAddress = 'Your Address Here',
  storePhone = '+1-XXX-XXX-XXXX',
}: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800')
      if (printWindow) {
        printWindow.document.write(receiptRef.current.innerHTML)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Receipt Preview */}
      <div
        ref={receiptRef}
        className="bg-white p-8 rounded-lg border-2 border-gray-300 font-mono text-sm max-w-md mx-auto"
        style={{ width: '80mm' }}
      >
        {/* Header */}
        <div className="text-center border-b pb-3 mb-3">
          <h1 className="text-lg font-bold">{storeName}</h1>
          <p className="text-xs text-gray-600">{storeAddress}</p>
          <p className="text-xs text-gray-600">{storePhone}</p>
        </div>

        {/* Receipt Info */}
        <div className="text-xs mb-3 pb-3 border-b">
          <div className="flex justify-between">
            <span>Receipt #:</span>
            <span className="font-bold">{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(date).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment:</span>
            <span className="capitalize">{paymentMethod}</span>
          </div>
        </div>

        {/* Items Header */}
        <div className="text-xs font-bold mb-2 pb-2 border-b">
          <div className="flex justify-between">
            <span className="flex-1">Item</span>
            <span className="w-12 text-right">Qty</span>
            <span className="w-16 text-right">Price</span>
            <span className="w-16 text-right">Total</span>
          </div>
        </div>

        {/* Items */}
        <div className="text-xs mb-3 pb-3 border-b space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="flex-1 truncate">{item.name}</span>
              <span className="w-12 text-right">{item.cartQuantity}</span>
              <span className="w-16 text-right">₹{item.sellingPrice.toFixed(2)}</span>
              <span className="w-16 text-right">₹{(item.sellingPrice * item.cartQuantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="text-xs space-y-1 pb-3 border-b">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="text-sm font-bold mb-3 pb-3 border-b flex justify-between">
          <span>TOTAL:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600">
          <p>Thank you for your purchase!</p>
          <p>Please visit again</p>
        </div>
      </div>

      {/* Print Button */}
      <div className="flex gap-3 justify-center">
        <Button onClick={handlePrint} variant="primary">
          Print Receipt
        </Button>
      </div>
    </div>
  )
}
