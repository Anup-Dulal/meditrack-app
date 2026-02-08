import { useState } from 'react'
import Input from './Common/Input'
import Button from './Common/Button'

interface PaymentFormProps {
  total: number
  onSubmit: (paymentMethod: 'cash' | 'card' | 'check', amountPaid: number) => void
  isLoading?: boolean
}

export default function PaymentForm({ total, onSubmit, isLoading = false }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'check'>('cash')
  const [amountPaid, setAmountPaid] = useState(total)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const change = amountPaid - total

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (amountPaid < total) {
      newErrors.amountPaid = 'Amount paid must be at least equal to total'
    }

    if (Object.keys(newErrors).length === 0) {
      onSubmit(paymentMethod, amountPaid)
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Payment</h2>

      {/* Total */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-gray-600 text-sm">Total Amount</p>
        <p className="text-3xl font-bold text-blue-600">₹{total.toFixed(2)}</p>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
        <div className="space-y-2">
          {(['cash', 'card', 'check'] as const).map((method) => (
            <label key={method} className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'check')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700 capitalize">{method}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount Paid */}
      <Input
        label="Amount Paid"
        type="number"
        value={amountPaid}
        onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
        error={errors.amountPaid}
        min={total}
        step="0.01"
        required
      />

      {/* Change */}
      {change > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Change</p>
          <p className="text-2xl font-bold text-green-600">₹{change.toFixed(2)}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Processing...' : 'Complete Payment'}
      </Button>
    </form>
  )
}
