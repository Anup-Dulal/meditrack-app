import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roleId: string
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
      SELECT u.*, r.name as roleName FROM users u
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

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      status: user.status,
      lastLogin: new Date().toISOString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string): User {
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

    return {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now,
    }
  }

  static getUser(id: string): User | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    return (stmt.get(id) as User) || null
  }

  static getUserByUsername(username: string): User | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    return (stmt.get(username) as User) || null
  }

  static getAllUsers(): User[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM users ORDER BY createdAt DESC')
    return stmt.all() as User[]
  }

  static updateUser(id: string, updates: Partial<User>): User {
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

    return updated
  }

  static deleteUser(id: string): void {
    const db = getDatabase()
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    stmt.run(id)
  }

  static changePassword(userId: string, oldPassword: string, newPassword: string): boolean {
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

    return true
  }

  static createRole(roleData: Omit<Role, 'id' | 'createdAt'>): Role {
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
    return Buffer.from(password).toString('base64')
  }

  private static getStoredPassword(userId: string): string {
    const db = getDatabase()
    const stmt = db.prepare('SELECT password FROM users WHERE id = ?')
    const result = stmt.get(userId) as any
    return result?.password || ''
  }
}
