// ============================================================
//  SQLite ulanish — Node ICHKI moduli (node:sqlite, kompilyatsiyasiz)
//  better-sqlite3 native build talab qilgani uchun node:sqlite ishlatildi.
//  API o'xshash: db.prepare(...).all()/.get()/.run(); db.exec(...).
// ============================================================
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'chempion.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Sxemani qo'llash (jadvallar bo'lmasa yaratiladi)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
