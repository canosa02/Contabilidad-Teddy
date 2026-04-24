const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'casa.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('expense','income')),
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT,
    budget_cents INTEGER
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('expense','income')),
    amount_cents INTEGER NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    recurrence TEXT CHECK(recurrence IN ('none','monthly','weekly','yearly')) DEFAULT 'none',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'personal' CHECK (category IN ('mortgage','personal','card','other')),
    total_amount_cents INTEGER NOT NULL,
    remaining_amount_cents INTEGER NOT NULL,
    monthly_payment_cents INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    interest_rate REAL DEFAULT 0,
    notes TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Add active column to transactions if it doesn't exist
try {
  db.exec('ALTER TABLE transactions ADD COLUMN active INTEGER DEFAULT 1;');
} catch (e) {
  // Ignore error if column already exists
}

// Seed default categories
const defaultCategories = [
  { name: 'Alimentación', type: 'expense', color: '#f97316', icon: '🛒' },
  { name: 'Transporte', type: 'expense', color: '#3b82f6', icon: '🚗' },
  { name: 'Hogar', type: 'expense', color: '#8b5cf6', icon: '🏠' },
  { name: 'Salud', type: 'expense', color: '#10b981', icon: '💊' },
  { name: 'Ocio', type: 'expense', color: '#ec4899', icon: '🎬' },
  { name: 'Ropa', type: 'expense', color: '#f59e0b', icon: '👕' },
  { name: 'Suscripciones', type: 'expense', color: '#6366f1', icon: '📱' },
  { name: 'Otros gastos', type: 'expense', color: '#94a3b8', icon: '📦' },
  { name: 'Salario', type: 'income', color: '#22c55e', icon: '💼' },
  { name: 'Freelance', type: 'income', color: '#06b6d4', icon: '💻' },
  { name: 'Otros ingresos', type: 'income', color: '#84cc16', icon: '✨' },
  { name: 'Deudas', type: 'expense', color: '#ef4444', icon: '💳' }
];

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, type, color, icon) 
  VALUES (@name, @type, @color, @icon)
`);

const insertMany = db.transaction((cats) => {
  for (const cat of cats) insertCategory.run(cat);
});

insertMany(defaultCategories);

module.exports = db;
