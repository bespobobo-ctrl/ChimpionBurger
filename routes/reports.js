// ============================================================
//  HISOBOT API — kunlik savdo
// ============================================================
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Kunlik hisobot (ixtiyoriy: ?date=YYYY-MM-DD, standart: bugun)
router.get('/daily', (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const totals = db.prepare(`SELECT
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue,
      COALESCE(SUM(service_charge), 0) AS service,
      COALESCE(SUM(discount), 0) AS discount,
      COALESCE(SUM(subtotal), 0) AS subtotal
    FROM orders WHERE status = 'paid' AND date(created_at) = ?`).get(date);

  const byType = db.prepare(`SELECT type, COUNT(*) AS count, COALESCE(SUM(total), 0) AS sum
    FROM orders WHERE status = 'paid' AND date(created_at) = ? GROUP BY type`).all(date);

  const topProducts = db.prepare(`SELECT oi.name, SUM(oi.qty) AS qty, SUM(oi.subtotal) AS revenue
    FROM order_items oi JOIN orders o ON o.id = oi.order_id
    WHERE o.status = 'paid' AND date(o.created_at) = ?
    GROUP BY oi.name ORDER BY revenue DESC LIMIT 10`).all(date);

  res.json({ date, ...totals, byType, topProducts });
});

module.exports = router;
