import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './database'
import { AuditService } from './auditService'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  loyaltyPoints: number
  totalSpent: number
  lastPurchase?: string
  createdAt: string
  updatedAt: string
}

export interface LoyaltyTransaction {
  id: string
  customerId: string
  points: number
  reason: string
  timestamp: string
}

export class CustomerService {
  static createCustomer(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'loyaltyPoints' | 'totalSpent'>,
    userId?: string
  ): Customer {
    const db = getDatabase()
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO customers (
        id, name, email, phone, address, loyaltyPoints, totalSpent, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, data.name, data.email, data.phone, data.address, 0, 0, now, now)

    // Log audit action
    if (userId) {
      AuditService.logAction(userId, 'CREATE', 'Customer', id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
      })
    }

    return {
      ...data,
      id,
      loyaltyPoints: 0,
      totalSpent: 0,
      createdAt: now,
      updatedAt: now,
    }
  }

  static getCustomer(id: string): Customer | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM customers WHERE id = ?')
    return (stmt.get(id) as Customer) || null
  }

  static getCustomerByEmail(email: string): Customer | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM customers WHERE email = ?')
    return (stmt.get(email) as Customer) || null
  }

  static getCustomerByPhone(phone: string): Customer | null {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM customers WHERE phone = ?')
    return (stmt.get(phone) as Customer) || null
  }

  static getAllCustomers(): Customer[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM customers ORDER BY createdAt DESC')
    return stmt.all() as Customer[]
  }

  static searchCustomers(query: string): Customer[] {
    const db = getDatabase()
    const searchTerm = `%${query}%`
    const stmt = db.prepare(`
      SELECT * FROM customers
      WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
      ORDER BY name ASC
    `)
    return stmt.all(searchTerm, searchTerm, searchTerm) as Customer[]
  }

  static updateCustomer(id: string, updates: Partial<Customer>, userId?: string): Customer {
    const db = getDatabase()
    const customer = this.getCustomer(id)
    if (!customer) {
      throw new Error(`Customer with id ${id} not found`)
    }

    const updated = { ...customer, ...updates, updatedAt: new Date().toISOString() }

    const stmt = db.prepare(`
      UPDATE customers SET
        name = ?, email = ?, phone = ?, address = ?,
        loyaltyPoints = ?, totalSpent = ?, lastPurchase = ?, updatedAt = ?
      WHERE id = ?
    `)

    stmt.run(
      updated.name,
      updated.email,
      updated.phone,
      updated.address,
      updated.loyaltyPoints,
      updated.totalSpent,
      updated.lastPurchase || null,
      updated.updatedAt,
      id
    )

    // Log audit action
    if (userId) {
      const changes: Record<string, any> = {}
      Object.keys(updates).forEach((key) => {
        if (updates[key as keyof Customer] !== customer[key as keyof Customer]) {
          changes[key] = {
            old: customer[key as keyof Customer],
            new: updates[key as keyof Customer],
          }
        }
      })
      if (Object.keys(changes).length > 0) {
        AuditService.logAction(userId, 'UPDATE', 'Customer', id, changes)
      }
    }

    return updated
  }

  static deleteCustomer(id: string, userId?: string): void {
    const db = getDatabase()
    const customer = this.getCustomer(id)

    const stmt = db.prepare('DELETE FROM customers WHERE id = ?')
    stmt.run(id)

    // Log audit action
    if (userId && customer) {
      AuditService.logAction(userId, 'DELETE', 'Customer', id, {
        name: customer.name,
        email: customer.email,
      })
    }
  }

  static getCustomerHistory(customerId: string): any[] {
    // This will be implemented when transactions are updated to include customerId
    return []
  }

  static addLoyaltyPoints(customerId: string, points: number, reason: string = 'Purchase'): void {
    const db = getDatabase()
    const customer = this.getCustomer(customerId)
    if (!customer) {
      throw new Error(`Customer with id ${customerId} not found`)
    }

    const newPoints = customer.loyaltyPoints + points
    this.updateCustomer(customerId, { loyaltyPoints: newPoints })

    // Log loyalty transaction
    const id = uuidv4()
    const stmt = db.prepare(`
      INSERT INTO loyalty_transactions (id, customerId, points, reason, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(id, customerId, points, reason, new Date().toISOString())
  }

  static redeemLoyaltyPoints(customerId: string, points: number, reason: string = 'Redemption'): void {
    const db = getDatabase()
    const customer = this.getCustomer(customerId)
    if (!customer) {
      throw new Error(`Customer with id ${customerId} not found`)
    }

    if (customer.loyaltyPoints < points) {
      throw new Error('Insufficient loyalty points')
    }

    const newPoints = customer.loyaltyPoints - points
    this.updateCustomer(customerId, { loyaltyPoints: newPoints })

    // Log loyalty transaction
    const id = uuidv4()
    const stmt = db.prepare(`
      INSERT INTO loyalty_transactions (id, customerId, points, reason, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(id, customerId, -points, reason, new Date().toISOString())
  }

  static getLoyaltyHistory(customerId: string): LoyaltyTransaction[] {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM loyalty_transactions
      WHERE customerId = ?
      ORDER BY timestamp DESC
    `)
    return stmt.all(customerId) as LoyaltyTransaction[]
  }

  static updateCustomerSpent(customerId: string, amount: number): void {
    const customer = this.getCustomer(customerId)
    if (!customer) {
      throw new Error(`Customer with id ${customerId} not found`)
    }

    const newTotal = customer.totalSpent + amount
    this.updateCustomer(customerId, {
      totalSpent: newTotal,
      lastPurchase: new Date().toISOString(),
    })

    // Add loyalty points (1 point per currency unit)
    this.addLoyaltyPoints(customerId, Math.floor(amount), 'Purchase')
  }

  static getTopCustomers(limit: number = 10): Array<Customer & { purchaseCount: number }> {
    const customers = this.getAllCustomers()
    // This will be implemented when transactions are updated to include customerId
    const customerStats = customers.map((c) => ({
      ...c,
      purchaseCount: 0,
    }))

    return customerStats.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit)
  }

  static getCustomerStats(): {
    totalCustomers: number
    totalLoyaltyPoints: number
    averageSpent: number
    totalSpent: number
  } {
    const customers = this.getAllCustomers()
    const totalCustomers = customers.length
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const averageSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0

    return {
      totalCustomers,
      totalLoyaltyPoints,
      averageSpent,
      totalSpent,
    }
  }
}
