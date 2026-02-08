import { useState, useEffect } from 'react'
import { SettingsService } from '../../services/settingsService'
import Button from '../../components/Common/Button'
import Input from '../../components/Common/Input'
import Loading from '../../components/Common/Loading'
import toast from 'react-hot-toast'

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    storeName: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    currency: '',
    taxRate: '',
    discountPolicy: '',
    receiptHeader: '',
    receiptFooter: '',
    autoLogoutMinutes: '',
    backupSchedule: '',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    setIsLoading(true)
    try {
      SettingsService.initializeDefaultSettings()
      
      setSettings({
        storeName: SettingsService.getSettingValue('store.name', ''),
        storeAddress: SettingsService.getSettingValue('store.address', ''),
        storePhone: SettingsService.getSettingValue('store.phone', ''),
        storeEmail: SettingsService.getSettingValue('store.email', ''),
        currency: SettingsService.getSettingValue('business.currency', ''),
        taxRate: SettingsService.getSettingValue('business.taxRate', ''),
        discountPolicy: SettingsService.getSettingValue('business.discountPolicy', ''),
        receiptHeader: SettingsService.getSettingValue('receipt.header', ''),
        receiptFooter: SettingsService.getSettingValue('receipt.footer', ''),
        autoLogoutMinutes: SettingsService.getSettingValue('system.autoLogoutMinutes', ''),
        backupSchedule: SettingsService.getSettingValue('system.backupSchedule', ''),
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      SettingsService.setSetting('store.name', settings.storeName, 'string')
      SettingsService.setSetting('store.address', settings.storeAddress, 'string')
      SettingsService.setSetting('store.phone', settings.storePhone, 'string')
      SettingsService.setSetting('store.email', settings.storeEmail, 'string')
      SettingsService.setSetting('business.currency', settings.currency, 'string')
      SettingsService.setSetting('business.taxRate', settings.taxRate, 'number')
      SettingsService.setSetting('business.discountPolicy', settings.discountPolicy, 'string')
      SettingsService.setSetting('receipt.header', settings.receiptHeader, 'string')
      SettingsService.setSetting('receipt.footer', settings.receiptFooter, 'string')
      SettingsService.setSetting('system.autoLogoutMinutes', settings.autoLogoutMinutes, 'number')
      SettingsService.setSetting('system.backupSchedule', settings.backupSchedule, 'string')

      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <Loading text="Loading settings..." />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>

      {/* Store Information */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Store Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Store Name"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
          />
          <Input
            label="Store Email"
            type="email"
            value={settings.storeEmail}
            onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
          />
          <Input
            label="Store Address"
            value={settings.storeAddress}
            onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
          />
          <Input
            label="Store Phone"
            value={settings.storePhone}
            onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
          />
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Business Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Currency"
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
          />
          <Input
            label="Tax Rate (%)"
            type="number"
            value={settings.taxRate}
            onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
            step="0.01"
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Policy</label>
            <textarea
              value={settings.discountPolicy}
              onChange={(e) => setSettings({ ...settings, discountPolicy: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Receipt Settings */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Receipt Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Header</label>
            <textarea
              value={settings.receiptHeader}
              onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Footer</label>
            <textarea
              value={settings.receiptFooter}
              onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Auto Logout (minutes)"
            type="number"
            value={settings.autoLogoutMinutes}
            onChange={(e) => setSettings({ ...settings, autoLogoutMinutes: e.target.value })}
            min="5"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Backup Schedule</label>
            <select
              value={settings.backupSchedule}
              onChange={(e) => setSettings({ ...settings, backupSchedule: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={loadSettings}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
