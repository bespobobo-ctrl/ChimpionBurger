// ============================================================
//  MENYU API — kategoriyalar va mahsulotlar
// ============================================================
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Butun menyu (kategoriyalar + mahsulotlar) — POS ekrani uchun
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories WHERE visible = 1 ORDER BY sort_order, id').all();
  const products = db.prepare('SELECT * FROM products WHERE available = 1 ORDER BY id').all();
  res.json({ categories, products });
});

// Faqat kategoriyalar
router.get('/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all());
});

// Mahsulotlar (ixtiyoriy: ?category_id=)
router.get('/products', (req, res) => {
  const { category_id } = req.query;
  if (category_id) {
    return res.json(db.prepare('SELECT * FROM products WHERE category_id = ? ORDER BY id').all(category_id));
  }
  res.json(db.prepare('SELECT * FROM products ORDER BY id').all());
});

// Mahsulot qo'shish (admin) — kelajakda menyu boshqaruvi uchun
router.post('/products', (req, res) => {
  const { category_id, name, price = 0, description = '', image = '' } = req.body;
  if (!category_id || !name) return res.status(400).json({ error: 'category_id va name majburiy' });
  const info = db.prepare(
    'INSERT INTO products (category_id, name, price, description, image) VALUES (?, ?, ?, ?, ?)'
  ).run(category_id, name, price, description, image);
  res.json({ id: info.lastInsertRowid });
});

module.exports = router;
