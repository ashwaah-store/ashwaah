import Database from "better-sqlite3";
const db = new Database("sqlite.db");

try {
  // Create coupons table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_purchase_amount REAL NOT NULL DEFAULT 0,
      cutoff_price REAL,
      target_type TEXT NOT NULL DEFAULT 'all',
      target_value TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `).run();

  console.log("Successfully created coupons table in SQLite.");

  // Helper to check if a column exists
  const checkColumnExists = (tableName: string, columnName: string) => {
    const info = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
    return info.some((col: any) => col.name === columnName);
  };

  // Add columns to orders table
  if (!checkColumnExists("orders", "coupon_code")) {
    db.prepare(`ALTER TABLE orders ADD COLUMN coupon_code TEXT`).run();
    console.log("Added column coupon_code to orders table.");
  } else {
    console.log("Column coupon_code already exists in orders table.");
  }

  if (!checkColumnExists("orders", "discount_amount")) {
    db.prepare(`ALTER TABLE orders ADD COLUMN discount_amount REAL`).run();
    console.log("Added column discount_amount to orders table.");
  } else {
    console.log("Column discount_amount already exists in orders table.");
  }

  console.log("Successfully ran coupon database migration.");
} catch (error: any) {
  console.error("Migration Error:", error.message);
  process.exit(1);
}
