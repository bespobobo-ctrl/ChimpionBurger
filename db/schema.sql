-- ============================================================
--  Chempion Burger POS — Ma'lumotlar bazasi sxemasi (SQLite)
-- ============================================================

-- Kategoriyalar (menyu bo'limlari)
CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  icon       TEXT DEFAULT '🍔',
  sort_order INTEGER DEFAULT 0,
  visible    INTEGER DEFAULT 1
);

-- Mahsulotlar (menyu taomlari)
CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name        TEXT NOT NULL,
  price       REAL NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  image       TEXT DEFAULT '',
  available   INTEGER DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Buyurtmalar (tranzaksiyalar)
CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number   TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'dine_in',  -- dine_in | takeout | delivery
  table_number   TEXT,
  status         TEXT NOT NULL DEFAULT 'open',      -- open | paid | cancelled
  subtotal       REAL NOT NULL DEFAULT 0,
  service_charge REAL NOT NULL DEFAULT 0,
  discount       REAL NOT NULL DEFAULT 0,
  total          REAL NOT NULL DEFAULT 0,
  cashier        TEXT DEFAULT '',
  note           TEXT DEFAULT '',
  created_at     TEXT NOT NULL,
  paid_at        TEXT
);

-- Buyurtma qatorlari (har buyurtmadagi taomlar)
CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL,
  product_id INTEGER,
  name       TEXT NOT NULL,
  price      REAL NOT NULL,
  qty        INTEGER NOT NULL DEFAULT 1,
  subtotal   REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);
CREATE INDEX IF NOT EXISTS idx_items_order     ON order_items(order_id);
