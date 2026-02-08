import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setUser, setError, setLoading } from '../store/slices/authSlice'
import { AuthService } from '../services/authService'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import toast from 'react-hot-toast'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    dispatch(setLoading(true))

    try {
      const user = AuthService.login(username, password)

      if (!user) {
        const errorMsg = 'Invalid username or password'
        dispatch(setError(errorMsg))
        toast.error(errorMsg)
        setIsLoading(false)
        dispatch(setLoading(false))
        return
      }

      // Store user in Redux
      dispatch(setUser(user))

      // Store in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('meditrack_user', JSON.stringify(user))
      }

      toast.success(`Welcome back, ${user.firstName}!`)
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      const errorMsg = 'Login failed. Please try again.'
      dispatch(setError(errorMsg))
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg mb-4">
            <span className="text-3xl font-bold text-blue-600">MT</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">MediTrack</h1>
          <p className="text-blue-100">Pharmacy Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username) {
                  setErrors({ ...errors, username: '' })
                }
              }}
              error={errors.username}
              placeholder="Enter your username"
              required
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) {
                  setErrors({ ...errors, password: '' })
                }
              }}
              error={errors.password}
              placeholder="Enter your password"
              required
            />

            {/* Remember Me */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p>Username: <span className="font-mono">admin</span></p>
            <p>Password: <span className="font-mono">admin123</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-100">
          <p className="text-sm">© 2026 MediTrack. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
