// ============================================================
//  Chempion Burger POS — frontend mantiq
// ============================================================
const state = {
  categories: [],
  products: [],
  activeCategory: 'all',
  cart: [],            // { product_id, name, price, qty }
  orderType: 'dine_in',
};

const fmt = n => Math.round(n || 0).toLocaleString('uz-UZ') + " so'm";
const TYPE_LABEL = { dine_in: 'Zal', takeout: 'Olib ketish', delivery: 'Yetkazib berish' };

// ---------- Menyuni yuklash ----------
async function loadMenu() {
  const res = await fetch('/api/menu');
  const data = await res.json();
  state.categories = data.categories;
  state.products = data.products;
  renderCategories();
  renderProducts();
}

function renderCategories() {
  const box = document.getElementById('cat-tabs');
  let html = `<button class="cat-tab ${state.activeCategory === 'all' ? 'active' : ''}" data-cat="all">Hammasi</button>`;
  state.categories.forEach(c => {
    html += `<button class="cat-tab ${state.activeCategory == c.id ? 'active' : ''}" data-cat="${c.id}">${c.icon || ''} ${c.name}</button>`;
  });
  box.innerHTML = html;
  box.querySelectorAll('.cat-tab').forEach(b => b.onclick = () => {
    state.activeCategory = b.dataset.cat === 'all' ? 'all' : Number(b.dataset.cat);
    renderCategories(); renderProducts();
  });
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  const list = state.activeCategory === 'all'
    ? state.products
    : state.products.filter(p => p.category_id === state.activeCategory);
  grid.innerHTML = list.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="p-name">${p.name}</div>
      <div class="p-desc">${p.description || ''}</div>
      <div class="p-price">${fmt(p.price)}</div>
    </div>`).join('');
  grid.querySelectorAll('.product-card').forEach(card => card.onclick = () => addToCart(Number(card.dataset.id)));
}

// ---------- Savat ----------
function addToCart(productId) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;
  const ex = state.cart.find(i => i.product_id === productId);
  if (ex) ex.qty++;
  else state.cart.push({ product_id: p.id, name: p.name, price: p.price, qty: 1 });
  renderCart();
}
function changeQty(productId, delta) {
  const it = state.cart.find(i => i.product_id === productId);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) state.cart = state.cart.filter(i => i.product_id !== productId);
  renderCart();
}

function renderCart() {
  const box = document.getElementById('cart-items');
  if (state.cart.length === 0) {
    box.innerHTML = `<div class="cart-empty" id="cart-empty">Savat bo'sh — taom tanlang</div>`;
  } else {
    box.innerHTML = state.cart.map(i => `
      <div class="cart-item">
        <div class="ci-name">${i.name}<small>${fmt(i.price)}</small></div>
        <div class="ci-qty">
          <button data-id="${i.product_id}" data-d="-1">−</button>
          <span>${i.qty}</span>
          <button data-id="${i.product_id}" data-d="1">+</button>
        </div>
        <div class="ci-sum">${fmt(i.price * i.qty)}</div>
      </div>`).join('');
    box.querySelectorAll('.ci-qty button').forEach(b => b.onclick = () => changeQty(Number(b.dataset.id), Number(b.dataset.d)));
  }
  updateSummary();
}

function calcTotals() {
  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const pct = parseFloat(document.getElementById('service-pct').value) || 0;
  const service = Math.round(subtotal * pct / 100);
  const discount = parseFloat(document.getElementById('discount-input').value) || 0;
  const total = Math.max(0, subtotal + service - discount);
  return { subtotal, service, discount, total };
}
function updateSummary() {
  const t = calcTotals();
  document.getElementById('sum-subtotal').textContent = fmt(t.subtotal);
  document.getElementById('sum-service').textContent = fmt(t.service);
  document.getElementById('sum-discount').textContent = fmt(t.discount);
  document.getElementById('sum-total').textContent = fmt(t.total);
  document.getElementById('btn-confirm').disabled = state.cart.length === 0;
}

// ---------- Buyurtma turi ----------
document.getElementById('order-types').addEventListener('click', e => {
  const b = e.target.closest('.otype'); if (!b) return;
  document.querySelectorAll('.otype').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.orderType = b.dataset.type;
  document.getElementById('cart-type-label').textContent = TYPE_LABEL[state.orderType];
  document.getElementById('table-row').style.display = state.orderType === 'dine_in' ? 'flex' : 'none';
});

document.getElementById('service-pct').oninput = updateSummary;
document.getElementById('discount-input').oninput = updateSummary;
document.getElementById('btn-clear').onclick = () => { state.cart = []; renderCart(); };

// ---------- Tasdiqlash ----------
document.getElementById('btn-confirm').onclick = async () => {
  if (state.cart.length === 0) return;
  const t = calcTotals();
  const payload = {
    type: state.orderType,
    table_number: state.orderType === 'dine_in' ? (document.getElementById('table-number').value || null) : null,
    items: state.cart,
    service_charge: t.service,
    discount: t.discount,
    cashier: 'Kassir',
  };
  const res = await fetch('/api/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!res.ok) { alert('Xato: buyurtma saqlanmadi'); return; }
  const order = await res.json();
  // To'langan deb belgilash (kassada darhol to'lov)
  await fetch('/api/orders/' + order.id, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid' }),
  });
  showReceipt(order, t);
};

function showReceipt(order, t) {
  const now = new Date();
  const itemsHtml = state.cart.map(i =>
    `<div class="r-line"><span>${i.name} ×${i.qty}</span><b>${fmt(i.price * i.qty)}</b></div>`).join('');
  document.getElementById('receipt-body').innerHTML = `
    <div class="r-store">
      <h3>🍔 CHEMPION BURGER</h3>
      <small>Chek: #${order.order_number}</small>
    </div>
    <div class="r-line"><span>Sana</span><span>${now.toLocaleString('uz-UZ')}</span></div>
    <div class="r-line"><span>Turi</span><span>${TYPE_LABEL[order.type]}</span></div>
    ${order.table_number ? `<div class="r-line"><span>Stol</span><span>№${order.table_number}</span></div>` : ''}
    <div class="r-items">${itemsHtml}</div>
    <div class="r-line"><span>Oraliq</span><span>${fmt(t.subtotal)}</span></div>
    <div class="r-line"><span>Xizmat haqi</span><span>${fmt(t.service)}</span></div>
    <div class="r-line"><span>Chegirma</span><span>${fmt(t.discount)}</span></div>
    <div class="r-total"><span>JAMI</span><b>${fmt(t.total)}</b></div>`;
  document.getElementById('receipt-modal').classList.add('open');
}
document.getElementById('receipt-print').onclick = () => window.print();
document.getElementById('receipt-close').onclick = () => {
  document.getElementById('receipt-modal').classList.remove('open');
  state.cart = [];
  document.getElementById('table-number').value = '';
  document.getElementById('service-pct').value = '0';
  document.getElementById('discount-input').value = '0';
  renderCart();
};

// ---------- Hisobot ----------
const reportDate = document.getElementById('report-date');
document.getElementById('open-reports').onclick = () => {
  reportDate.value = new Date().toISOString().slice(0, 10);
  loadReport();
  document.getElementById('reports-modal').classList.add('open');
};
document.getElementById('reports-close').onclick = () => document.getElementById('reports-modal').classList.remove('open');
reportDate.onchange = loadReport;

async function loadReport() {
  const res = await fetch('/api/reports/daily?date=' + reportDate.value);
  const r = await res.json();
  const types = (r.byType || []).map(x => `<div class="rrow"><span>${TYPE_LABEL[x.type] || x.type}</span><span>${x.count} ta · ${fmt(x.sum)}</span></div>`).join('') || '<div class="rrow"><span>—</span></div>';
  const top = (r.topProducts || []).map(x => `<div class="rrow"><span>${x.name}</span><span>${x.qty} dona · ${fmt(x.revenue)}</span></div>`).join('') || '<div class="rrow"><span>Sotuv yo\'q</span></div>';
  document.getElementById('report-body').innerHTML = `
    <div class="kpi-grid">
      <div class="kpi"><small>Buyurtmalar</small><b>${r.orders} ta</b></div>
      <div class="kpi"><small>Tushum</small><b>${fmt(r.revenue)}</b></div>
      <div class="kpi"><small>Xizmat haqi</small><b>${fmt(r.service)}</b></div>
      <div class="kpi"><small>Chegirma</small><b>${fmt(r.discount)}</b></div>
    </div>
    <h4>Buyurtma turlari</h4>${types}
    <h4>Eng ko'p sotilgan</h4>${top}`;
}

// ---------- Ishga tushirish ----------
loadMenu();
renderCart();
