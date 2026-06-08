// ============================================================
//  Chempion Burger POS — Express server
//  Ishga tushirish: npm install → npm start → http://localhost:3000
// ============================================================
const express = require('express');
const path = require('path');

require('./db/init'); // baza + namuna menyu (bo'sh bo'lsa)

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'Chempion Burger POS', time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n🍔  Chempion Burger POS ishga tushdi → http://localhost:${PORT}\n`);
});
