// ============================================================
//  BUYURTMA API — yaratish, ro'yxat, holatni o'zgartirish
// ============================================================
const express = require('express');
const router = express.Router();
const db = require('../db/database');

const VALID_TYPES = ['dine_in', 'takeout', 'delivery'];
const VALID_STATUS = ['open', 'paid', 'cancelled'];

function genOrderNumber() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// Yangi buyurtma yaratish (savatni tasdiqlash)
router.post('/', (req, res) => {
  const {
    type = 'dine_in', table_number = null, items = [],
    service_charge = 0, discount = 0, cashier = '', note = ''
  } = req.body;

  if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: "Noto'g'ri buyurtma turi" });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Savat bo'sh" });

  const subtotal = items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
  const total = Math.max(0, subtotal + (Number(service_charge) || 0) - (Number(discount) || 0));
  const now = new Date().toISOString();
  const orderNumber = genOrderNumber();

  const insOrder = db.prepare(`INSERT INTO orders
    (order_number, type, table_number, status, subtotal, service_charge, discount, total, cashier, note, created_at)
    VALUES (?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?)`);
  const insItem = db.prepare(`INSERT INTO order_items
    (order_id, product_id, name, price, qty, subtotal) VALUES (?, ?, ?, ?, ?, ?)`);

  // node:sqlite'da .transaction() yo'q — qo'lda BEGIN/COMMIT
  let orderId;
  db.exec('BEGIN');
  try {
    const info = insOrder.run(orderNumber, type, table_number, subtotal, service_charge, discount, total, cashier, note, now);
    orderId = Number(info.lastInsertRowid);
    for (const it of items) {
      const line = (Number(it.price) || 0) * (Number(it.qty) || 0);
      insItem.run(orderId, it.product_id || null, it.name, Number(it.price) || 0, Number(it.qty) || 1, line);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: 'Buyurtma saqlanmadi: ' + e.message });
  }

  res.json({ id: orderId, order_number: orderNumber, type, table_number, subtotal, service_charge, discount, total, status: 'open', created_at: now });
});

// Buyurtmalar ro'yxati (ixtiyoriy: ?status=&date=YYYY-MM-DD)
router.get('/', (req, res) => {
  const { status, date } = req.query;
  const where = [], params = [];
  if (status) { where.push('status = ?'); params.push(status); }
  if (date) { where.push('date(created_at) = ?'); params.push(date); }
  let sql = 'SELECT * FROM orders';
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY id DESC LIMIT 200';
  res.json(db.prepare(sql).all(...params));
});

// Bitta buyurtma + qatorlari
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Buyurtma topilmadi' });
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json(order);
});

// Holatni o'zgartirish (to'lash / bekor qilish)
router.patch('/:id', (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUS.includes(status)) return res.status(400).json({ error: "Noto'g'ri status" });
  const paidAt = status === 'paid' ? new Date().toISOString() : null;
  const info = db.prepare(
    'UPDATE orders SET status = ?, paid_at = CASE WHEN ? IS NOT NULL THEN ? ELSE paid_at END WHERE id = ?'
  ).run(status, paidAt, paidAt, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Buyurtma topilmadi' });
  res.json({ ok: true, id: Number(req.params.id), status });
});

module.exports = router;
