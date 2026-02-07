# Phase 2: Inventory Management

## Overview

Phase 2 focuses on building comprehensive inventory management features. This includes medicine CRUD operations, stock management, database integration, and search/filtering capabilities.

## Objectives

1. Create layout components (Header, Sidebar, MainLayout)
2. Implement React Router for navigation
3. Set up SQLite database
4. Build medicine CRUD operations
5. Create medicine form component
6. Implement search and filtering
7. Add stock management features

## Tasks

### Task 2.1: Layout Components
**Status**: ⏳ TODO

Create reusable layout components for consistent UI across pages.

**Components to Create**:
- `src/components/Layout/Header.tsx` - Top navigation bar
- `src/components/Layout/Sidebar.tsx` - Left sidebar navigation
- `src/components/Layout/MainLayout.tsx` - Main layout wrapper

**Features**:
- Navigation menu
- User profile section
- Responsive design
- Active route highlighting

**Files to Create**:
```
src/components/
├── Layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── MainLayout.tsx
└── Common/
    ├── Button.tsx
    ├── Input.tsx
    └── Modal.tsx
```

### Task 2.2: React Router Setup
**Status**: ⏳ TODO

Implement proper routing with React Router v6.

**Routes to Create**:
- `/` - Dashboard
- `/inventory` - Inventory management
- `/inventory/add` - Add medicine
- `/inventory/:id/edit` - Edit medicine
- `/sales` - Sales page
- `/reports` - Reports page
- `/settings` - Settings page

**Implementation**:
- Update App.tsx with Router
- Create route configuration
- Add route guards if needed
- Implement navigation

### Task 2.3: Database Setup
**Status**: ⏳ TODO

Set up SQLite database for local data persistence.

**Database Schema**:
```sql
CREATE TABLE medicines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  genericName TEXT,
  manufacturer TEXT,
  batchNumber TEXT,
  quantity INTEGER DEFAULT 0,
  purchasePrice REAL,
  sellingPrice REAL,
  expiryDate TEXT,
  minimumStock INTEGER DEFAULT 10,
  barcode TEXT UNIQUE,
  description TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  medicineId TEXT NOT NULL,
  quantity INTEGER,
  totalPrice REAL,
  date TEXT,
  type TEXT, -- 'sale' or 'purchase'
  FOREIGN KEY (medicineId) REFERENCES medicines(id)
);

CREATE TABLE alerts (
  id TEXT PRIMARY KEY,
  medicineId TEXT NOT NULL,
  type TEXT, -- 'low_stock', 'expiry'
  message TEXT,
  createdAt TEXT,
  FOREIGN KEY (medicineId) REFERENCES medicines(id)
);
```

**Implementation**:
- Install better-sqlite3
- Create database service
- Implement migrations
- Add seed data

### Task 2.4: Medicine CRUD Operations
**Status**: ⏳ TODO

Build complete Create, Read, Update, Delete operations for medicines.

**Services to Create**:
- `src/services/medicineService.ts` - Medicine operations

**Functions**:
```typescript
// Create
addMedicine(medicine: Medicine): Promise<Medicine>

// Read
getMedicines(): Promise<Medicine[]>
getMedicineById(id: string): Promise<Medicine>
searchMedicines(query: string): Promise<Medicine[]>

// Update
updateMedicine(id: string, medicine: Partial<Medicine>): Promise<Medicine>

// Delete
deleteMedicine(id: string): Promise<void>

// Stock Management
updateStock(id: string, quantity: number): Promise<void>
getLowStockMedicines(): Promise<Medicine[]>
```

**Redux Actions**:
- `setMedicines` - Load all medicines
- `addMedicine` - Add new medicine
- `updateMedicine` - Update existing medicine
- `deleteMedicine` - Delete medicine
- `searchMedicines` - Search medicines

### Task 2.5: Medicine Form Component
**Status**: ⏳ TODO

Create a reusable form for adding and editing medicines.

**Component**: `src/components/MedicineForm.tsx`

**Features**:
- Form validation
- Error handling
- Loading states
- Success/error messages
- Image upload (optional)

**Form Fields**:
- Name (required)
- Generic Name
- Manufacturer
- Batch Number
- Quantity
- Purchase Price
- Selling Price
- Expiry Date
- Minimum Stock
- Barcode
- Description

### Task 2.6: Inventory Page Enhancement
**Status**: ⏳ TODO

Enhance the inventory page with full CRUD functionality.

**Features**:
- Display medicines in table
- Add new medicine button
- Edit medicine button
- Delete medicine button
- Search functionality
- Filter by category/status
- Sort by columns
- Pagination
- Bulk actions

**Components**:
- `src/pages/Inventory.tsx` - Main page
- `src/components/MedicineTable.tsx` - Table display
- `src/components/MedicineForm.tsx` - Add/Edit form
- `src/components/SearchBar.tsx` - Search component
- `src/components/FilterBar.tsx` - Filter component

### Task 2.7: Stock Management
**Status**: ⏳ TODO

Implement stock tracking and low stock alerts.

**Features**:
- Track medicine quantities
- Set minimum stock levels
- Low stock alerts
- Stock adjustment
- Stock history

**Components**:
- `src/components/StockAdjustment.tsx` - Adjust stock
- `src/components/LowStockAlert.tsx` - Alert display

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install react-router-dom better-sqlite3 uuid
npm install -D @types/better-sqlite3
```

### Step 2: Create Layout Components
- Header with navigation
- Sidebar with menu
- MainLayout wrapper

### Step 3: Set Up React Router
- Update App.tsx
- Create route configuration
- Implement navigation

### Step 4: Database Setup
- Create database service
- Set up schema
- Add seed data

### Step 5: Medicine Service
- Implement CRUD operations
- Add search functionality
- Add stock management

### Step 6: Redux Integration
- Update medicineSlice
- Add async thunks
- Connect to components

### Step 7: UI Components
- Create form component
- Create table component
- Create search/filter components

### Step 8: Testing
- Test CRUD operations
- Test search/filter
- Test database persistence

## File Structure After Phase 2

```
desktop/src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── Common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Loading.tsx
│   ├── MedicineForm.tsx
│   ├── MedicineTable.tsx
│   ├── SearchBar.tsx
│   ├── FilterBar.tsx
│   ├── StockAdjustment.tsx
│   └── LowStockAlert.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Inventory.tsx
│   ├── Sales.tsx
│   └── Settings.tsx
├── services/
│   ├── database.ts
│   └── medicineService.ts
├── store/
│   ├── index.ts
│   └── slices/
│       ├── medicineSlice.ts
│       └── transactionSlice.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Success Criteria

- ✅ Layout components created and styled
- ✅ React Router fully implemented
- ✅ SQLite database set up and working
- ✅ Medicine CRUD operations functional
- ✅ Form validation working
- ✅ Search and filter working
- ✅ Stock management implemented
- ✅ Low stock alerts working
- ✅ All components tested
- ✅ No console errors

## Timeline

- **Day 1-2**: Layout components & React Router
- **Day 3-4**: Database setup & medicine service
- **Day 5-6**: Form component & CRUD UI
- **Day 7**: Search, filter & stock management
- **Day 8**: Testing & bug fixes

## Dependencies to Install

```json
{
  "dependencies": {
    "react-router-dom": "^6.x",
    "better-sqlite3": "^9.x",
    "uuid": "^9.x"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.x"
  }
}
```

## Notes

- Use TypeScript for all new code
- Follow existing code style
- Add proper error handling
- Test locally before committing
- Update Redux store as needed
- Keep components small and focused

## Next Phase

After Phase 2 is complete, we'll move to **Phase 3: Sales & Transactions** which will include:
- Point-of-sale interface
- Shopping cart functionality
- Transaction tracking
- Receipt generation
