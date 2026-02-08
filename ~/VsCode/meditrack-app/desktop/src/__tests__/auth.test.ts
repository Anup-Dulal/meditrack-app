import { describe, it, expect, beforeEach } from 'vitest'
import { AuthService } from '../services/authService'

describe('Authentication Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should login with valid credentials', () => {
    const user = AuthService.login('admin', 'admin123')
    expect(user).toBeDefined()
    expect(user?.username).toBe('admin')
    expect(user?.roleId).toBe('role-admin')
  })

  it('should fail login with invalid credentials', () => {
    const user = AuthService.login('invalid', 'wrong')
    expect(user).toBeNull()
  })

  it('should fail login with empty username', () => {
    const user = AuthService.login('', 'admin123')
    expect(user).toBeNull()
  })

  it('should fail login with empty password', () => {
    const user = AuthService.login('admin', '')
    expect(user).toBeNull()
  })

  it('should get current user after login', () => {
    AuthService.login('admin', 'admin123')
    const user = AuthService.getCurrentUser()
    expect(user).toBeDefined()
    expect(user?.username).toBe('admin')
  })

  it('should logout successfully', () => {
    AuthService.login('admin', 'admin123')
    AuthService.logout()
    const user = AuthService.getCurrentUser()
    expect(user).toBeNull()
  })

  it('should verify user role', () => {
    AuthService.login('admin', 'admin123')
    const user = AuthService.getCurrentUser()
    expect(user?.roleId).toBe('role-admin')
  })
})
