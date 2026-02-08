import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database'
import { AuditService } from './auditService'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roleId: string
  role?: string
  name?: string
  status: 'active' | 'inactive'
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  createdAt: string
}

export class AuthService {
  static login(username: string, password: string): User | null {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT u.*, r.name as role FROM users u
      JOIN roles r ON u.roleId = r.id
      WHERE u.username = ? AND u.status = 'active'
    `)
    const user = stmt.get(username) as any

    if (!user) {
      return null
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== this.hashPassword(password)) {
      return null
    }

    // Update last login
    const updateStmt = db.prepare('UPDATE users SET lastLogin = ? WHERE id = ?')
    updateStmt.run(new Date().toISOString(), user.id)

    // Log login action
    AuditService.logAction(user.id, 'LOGIN', 'User', user.id, {
      username: user.username,
    })

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      status: user.status,
      lastLogin: new Date().toISOString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string, auditUserId?: string): User {
    const db = getDatabase()
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO users (
        id, username, email, password, firstName, lastName,
        roleId, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      userData.username,
      userData.email,
      this.hashPassword(password),
      userData.firstName,
      userData.lastName,
      userData.roleId,
      userData.status,
      now,
      now
    )

    // Log audit action
    if (auditUserId) {
      AuditService.logAction(auditUserId, 'CREATE', 'User', id, {
        username: userData.username,
        email: userData.email,
        role: userData.role,
      })
    }

    return {
      ...userData,
      id,
      name: `${userData.firstName} ${userData.lastName}`,
      createdAt: now,
      updatedAt: now,
    }
  }

  static getUser(id: string): User | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const user = stmt.get(id) as any
    if (!user) return null

    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`,
    }
  }

  static getUserByUsername(username: string): User | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    const user = stmt.get(username) as any
    if (!user) return null

    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`,
    }
  }

  static getAllUsers(): User[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users ORDER BY createdAt DESC')
    const users = stmt.all() as any[]
    return users.map((user) => ({
      ...user,
      name: `${user.firstName} ${user.lastName}`,
    }))
  }

  static updateUser(id: string, updates: Partial<User>, auditUserId?: string): User {
    const db = getDatabase()
    const user = this.getUser(id)
    if (!user) {
      throw new Error(`User with id ${id} not found`)
    }

    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() }

    const stmt = db.prepare(`
      UPDATE users SET
        username = ?, email = ?, firstName = ?, lastName = ?,
        roleId = ?, status = ?, updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.username,
      updated.email,
      updated.firstName,
      updated.lastName,
      updated.roleId,
      updated.status,
      updated.updatedAt,
      id
    )

    // Log audit action
    if (auditUserId) {
      const changes: Record<string, any> = {}
      Object.keys(updates).forEach((key) => {
        if (updates[key as keyof User] !== user[key as keyof User]) {
          changes[key] = {
            old: user[key as keyof User],
            new: updates[key as keyof User],
          }
        }
      })
      if (Object.keys(changes).length > 0) {
        AuditService.logAction(auditUserId, 'UPDATE', 'User', id, changes)
      }
    }

    return updated
  }

  static deleteUser(id: string, auditUserId?: string): void {
    const db = getDatabase()
    const user = this.getUser(id)

    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    stmt.run(id)

    // Log audit action
    if (auditUserId && user) {
      AuditService.logAction(auditUserId, 'DELETE', 'User', id, {
        username: user.username,
        email: user.email,
      })
    }
  }

  static changePassword(userId: string, oldPassword: string, newPassword: string, auditUserId?: string): boolean {
    const user = this.getUser(userId)
    if (!user) {
      return false
    }

    // Verify old password (in production, use bcrypt)
    if (this.hashPassword(oldPassword) !== this.getStoredPassword(userId)) {
      return false
    }

    const db = getDatabase()
    const stmt = db.prepare('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?')
    stmt.run(this.hashPassword(newPassword), new Date().toISOString(), userId)

    // Log audit action
    if (auditUserId) {
      AuditService.logAction(auditUserId, 'UPDATE', 'User', userId, {
        action: 'password_changed',
      })
    }

    return true
  }

  static createRole(roleData: Omit<Role, 'id' | 'createdAt'>, auditUserId?: string): Role {
    const db = getDatabase()
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO roles (id, name, description, permissions, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      roleData.name,
      roleData.description,
      JSON.stringify(roleData.permissions),
      now
    )

    // Log audit action
    if (auditUserId) {
      AuditService.logAction(auditUserId, 'CREATE', 'Role', id, {
        name: roleData.name,
        permissions: roleData.permissions,
      })
    }

    return {
      ...roleData,
      id,
      createdAt: now,
    }
  }

  static getRole(id: string): Role | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM roles WHERE id = ?')
    const role = stmt.get(id) as any
    if (!role) return null

    return {
      ...role,
      permissions: JSON.parse(role.permissions || '[]'),
    }
  }

  static getAllRoles(): Role[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM roles ORDER BY name ASC')
    const roles = stmt.all() as any[]
    return roles.map((role) => ({
      ...role,
      permissions: JSON.parse(role.permissions || '[]'),
    }))
  }

  static hasPermission(userId: string, permission: string): boolean {
    const user = this.getUser(userId)
    if (!user) return false

    const role = this.getRole(user.roleId)
    if (!role) return false

    return role.permissions.includes(permission)
  }

  private static hashPassword(password: string): string {
    // Simple hash for demo (in production, use bcrypt)
    return btoa(password)
  }

  private static getStoredPassword(userId: string): string {
    const db = getDatabase()
    const stmt = db.prepare('SELECT password FROM users WHERE id = ?')
    const result = stmt.get(userId) as any
    return result?.password || ''
  }
}
