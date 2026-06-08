// ============================================================
//  Baza ishga tayyorlash — bo'sh bo'lsa namuna menyu yuklaydi
//  (server.js ham, `npm run seed` ham shu fayldan foydalanadi)
// ============================================================
const fs = require('fs');
const path = require('path');
const db = require('./database');

const count = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;

if (count === 0) {
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  db.exec(seed);
  const cats = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
  const prods = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
  console.log(`✅ Namuna menyu yuklandi: ${cats} kategoriya, ${prods} mahsulot.`);
} else {
  console.log(`ℹ️  Baza allaqachon to'ldirilgan (${count} kategoriya).`);
}

module.exports = db;
