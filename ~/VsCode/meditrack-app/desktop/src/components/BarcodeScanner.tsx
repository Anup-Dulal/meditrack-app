import { useState } from 'react'
import { BarcodeService } from '../services/barcodeService'
import Button from './Common/Button'
import Modal from './Common/Modal'

interface BarcodeScannerProps {
  onScan: (result: any) => void
  isOpen: boolean
  onClose: () => void
}

export default function BarcodeScanner({ onScan, isOpen, onClose }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState('')
  const [scanResults, setScanResults] = useState<any[]>([])
  const [error, setError] = useState('')

  const handleScan = () => {
    setError('')
    if (!barcode.trim()) {
      setError('Please enter a barcode')
      return
    }

    try {
      const result = BarcodeService.scanBarcode(barcode)

      if (!result.found) {
        setError('Medicine not found for this barcode')
        return
      }

      setScanResults([...scanResults, result])
      setBarcode('')
    } catch (err) {
      setError('Invalid barcode format')
    }
  }

  const handleAddToCart = (result: any) => {
    onScan(result)
    setScanResults(scanResults.filter((r) => r.barcode !== result.barcode))
  }

  const handleRemove = (barcode: string) => {
    setScanResults(scanResults.filter((r) => r.barcode !== barcode))
  }

  const handleClose = () => {
    setBarcode('')
    setScanResults([])
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Barcode Scanner">
      <div className="space-y-4">
        {/* Barcode Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Scan or Enter Barcode</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Scan barcode here..."
              autoFocus
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleScan}>Scan</Button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* Scan Results */}
        {scanResults.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Scanned Items ({scanResults.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scanResults.map((result, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{result.medicineName}</p>
                    <p className="text-sm text-gray-600">Barcode: {result.barcode}</p>
                    <p className="text-sm text-gray-600">Price: ₹{result.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(result)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => handleRemove(result.barcode)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Instructions:</strong> Scan or manually enter medicine barcodes. Click "Add" to add items to your cart.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
