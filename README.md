# 🍔 Chempion Burger — Restoran POS

Restoran/kafe uchun kassa (POS) tizimi. **Node.js + Express + SQLite + vanilla frontend.**
Lokal ishlaydi (internetsiz, kassa kompyuterida).

## Ishga tushirish

```bash
npm install        # paketlarni o'rnatish (express, better-sqlite3)
npm start          # serverni ishga tushirish
```

So'ng brauzerда oching: **http://localhost:3000**

Birinchi ishga tushirishda baza (`db/chempion.db`) avtomatik yaratiladi va namuna menyu yuklanadi.

## Buyruqlar
- `npm start` — server (http://localhost:3000)
- `npm run dev` — avto-qayta yuklash bilan (kod o'zgarsa)
- `npm run seed` — bazani namuna menyu bilan to'ldirish (bo'sh bo'lsa)

## Tuzilma
```
server.js            Express server
db/
  schema.sql         jadvallar (categories, products, orders, order_items)
  seed.sql           namuna menyu
  database.js        SQLite ulanish
  init.js            baza tayyorlash + seed
routes/
  menu.js            GET /api/menu, /categories, /products
  orders.js          POST/GET/PATCH /api/orders
  reports.js         GET /api/reports/daily
public/
  index.html, style.css, app.js   POS interfeysi
```

## Imkoniyatlar (poydevor)
- Menyu (kategoriya + mahsulot), savat, miqdor +/−
- Buyurtma turlari: **Zal / Olib ketish / Yetkazib berish**
- Xizmat haqi (%), chegirma, jami hisob
- Buyurtmani tasdiqlash → bazaga saqlash → chek
- Kunlik hisobot (tushum, turlar, eng ko'p sotilgan)

## Keyingi bosqichlar (arxitektura bo'yicha)
- Termal printer integratsiyasi
- Foydalanuvchi rollari (kassir/admin)
- Stol xaritasi
- Ombor hisobi
- Click / Payme to'lov
