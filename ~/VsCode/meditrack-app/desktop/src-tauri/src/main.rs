// Tauri backend for MediTrack
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use rusqlite::{Connection, params};
use std::sync::Mutex;
use tauri::State;

struct DbState {
    db: Mutex<Option<Connection>>,
}

#[tauri::command]
fn init_database(state: State<DbState>) -> Result<(), String> {
    let mut db_guard = state.db.lock().map_err(|e| e.to_string())?;
    
    let db = Connection::open("meditrack.db").map_err(|e| e.to_string())?;
    db.execute_batch("PRAGMA foreign_keys = ON;").map_err(|e| e.to_string())?;
    
    // Create tables
    create_tables(&db)?;
    
    *db_guard = Some(db);
    Ok(())
}

fn create_tables(db: &Connection) -> Result<(), String> {
    db.execute_batch(
        "CREATE TABLE IF NOT EXISTS roles (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            permissions TEXT,
            createdAt TEXT
        );
        
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            firstName TEXT,
            lastName TEXT,
            roleId TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            lastLogin TEXT,
            createdAt TEXT,
            updatedAt TEXT,
            FOREIGN KEY (roleId) REFERENCES roles(id)
        );
        
        CREATE TABLE IF NOT EXISTS medicines (
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
        
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            medicineId TEXT NOT NULL,
            medicineName TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unitPrice REAL NOT NULL,
            totalPrice REAL NOT NULL,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            paymentMethod TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (medicineId) REFERENCES medicines(id)
        );
        
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            action TEXT NOT NULL,
            entity TEXT,
            entityId TEXT,
            changes TEXT,
            timestamp TEXT,
            FOREIGN KEY (userId) REFERENCES users(id)
        );
        
        CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            type TEXT,
            updatedAt TEXT
        );"
    ).map_err(|e| e.to_string())?;
    
    initialize_default_roles(db)?;
    Ok(())
}

fn initialize_default_roles(db: &Connection) -> Result<(), String> {
    let count: i32 = db.query_row(
        "SELECT COUNT(*) FROM roles",
        [],
        |row| row.get(0)
    ).unwrap_or(0);
    
    if count == 0 {
        let now = chrono::Utc::now().to_rfc3339();
        
        let roles = vec![
            ("role-admin", "Admin", "Full system access", "[\"all\"]"),
            ("role-manager", "Manager", "Inventory and sales management", "[\"inventory.view\",\"inventory.edit\",\"sales.view\",\"sales.edit\",\"transactions.view\"]"),
            ("role-cashier", "Cashier", "Sales only", "[\"sales.view\",\"sales.edit\",\"transactions.view\"]"),
            ("role-viewer", "Viewer", "Read-only access", "[\"inventory.view\",\"sales.view\",\"transactions.view\"]"),
        ];
        
        for (id, name, desc, perms) in roles {
            db.execute(
                "INSERT INTO roles (id, name, description, permissions, createdAt) VALUES (?, ?, ?, ?, ?)",
                params![id, name, desc, perms, now],
            ).map_err(|e| e.to_string())?;
        }
        
        // Create default admin user
        db.execute(
            "INSERT INTO users (id, username, email, password, firstName, lastName, roleId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params!["user-admin", "admin", "admin@meditrack.local", base64::encode("admin123"), "Admin", "User", "role-admin", "active", now, now],
        ).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
fn db_run(state: State<DbState>, sql: String, params: Vec<String>) -> Result<serde_json::Value, String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
    
    db.execute(&sql, rusqlite::params_from_iter(params.iter())).map_err(|e| e.to_string())?;
    
    Ok(serde_json::json!({"changes": 1}))
}

#[tauri::command]
fn db_get(state: State<DbState>, sql: String, params: Vec<String>) -> Result<serde_json::Value, String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
    
    let mut stmt = db.prepare(&sql).map_err(|e| e.to_string())?;
    let result = stmt.query_row(rusqlite::params_from_iter(params.iter()), |row| {
        Ok(serde_json::json!({}))
    });
    
    match result {
        Ok(val) => Ok(val),
        Err(_) => Ok(serde_json::json!(null)),
    }
}

#[tauri::command]
fn db_all(state: State<DbState>, sql: String, params: Vec<String>) -> Result<Vec<serde_json::Value>, String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
    
    let mut stmt = db.prepare(&sql).map_err(|e| e.to_string())?;
    let rows = stmt.query_map(rusqlite::params_from_iter(params.iter()), |_row| {
        Ok(serde_json::json!({}))
    }).map_err(|e| e.to_string())?;
    
    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| e.to_string())?);
    }
    
    Ok(results)
}

#[tauri::command]
fn db_exec(state: State<DbState>, sql: String) -> Result<(), String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;
    
    db.execute_batch(&sql).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn db_close(state: State<DbState>) -> Result<(), String> {
    let mut db_guard = state.db.lock().map_err(|e| e.to_string())?;
    *db_guard = None;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .manage(DbState {
            db: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            init_database,
            db_run,
            db_get,
            db_all,
            db_exec,
            db_close
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
