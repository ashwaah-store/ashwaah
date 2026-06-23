import Database from "better-sqlite3";
const db = new Database("sqlite.db");

try {
  const checkColumnExists = (tableName: string, columnName: string) => {
    const info = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
    return info.some((col: any) => col.name === columnName);
  };

  if (!checkColumnExists("coupons", "is_visible")) {
    db.prepare(`ALTER TABLE coupons ADD COLUMN is_visible INTEGER NOT NULL DEFAULT 1`).run();
    console.log("Added column is_visible to coupons table.");
  } else {
    console.log("Column is_visible already exists in coupons table.");
  }

  if (!checkColumnExists("coupons", "expires_at")) {
    db.prepare(`ALTER TABLE coupons ADD COLUMN expires_at TEXT`).run();
    console.log("Added column expires_at to coupons table.");
  } else {
    console.log("Column expires_at already exists in coupons table.");
  }

  console.log("Successfully ran local sqlite schema update for coupons v2.");
} catch (error: any) {
  console.error("Migration Error:", error.message);
  process.exit(1);
}
