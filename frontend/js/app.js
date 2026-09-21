// ==========================================================
// FreshCart Frontend Application Logic
// ==========================================================

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

// ---------- DOM Elements ----------
const productGrid = document.getElementById('productGrid');
const categoryBar = document.getElementById('categoryBar');
const statusMsg = document.getElementById('statusMsg');
const cartCount = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

const authModal = document.getElementById('authModal');
const authOverlay = document.getElementById('authOverlay');
const ordersModal = document.getElementById('ordersModal');
const ordersOverlay = document.getElementById('ordersOverlay');

// ==========================================================
// INIT
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();
    updateCartUI();
    updateAuthUI();
});

// ==========================================================
// STATUS MESSAGE HELPER
// ==========================================================
function showStatus(message, type = 'success') {
    statusMsg.textContent = message;
    statusMsg.className = `status-msg ${type}`;
    statusMsg.classList.remove('hidden');
    setTimeout(() => statusMsg.classList.add('hidden'), 3000);
}

// ==========================================================
// LOAD PRODUCTS
// ==========================================================
async function loadProducts(query = '') {
    try {
        productGrid.innerHTML = '<p class="empty-msg">Loading products...</p>';
        allProducts = await API.getProducts(query);
        renderProducts(allProducts);
    } catch (err) {
        productGrid.innerHTML = `<p class="empty-msg">⚠️ Could not load products. Is the backend server running?<br>(${err.message})</p>`;
    }
}

async function loadCategories() {
    try {
        const categories = await API.getCategories();
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'cat-btn';
            btn.dataset.category = cat;
            btn.textContent = cat;
            categoryBar.appendChild(btn);
        });
    } catch (err) {
        console.error('Failed to load categories', err);
    }
}

categoryBar.addEventListener('click', (e) => {
    if (!e.target.classList.contains('cat-btn')) return;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const cat = e.target.dataset.category;
    loadProducts(cat ? `?category=${encodeURIComponent(cat)}` : '');
});

// ---------- Search ----------
document.getElementById('searchBtn').addEventListener('click', doSearch);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
});
function doSearch() {
    const val = document.getElementById('searchInput').value.trim();
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.cat-btn[data-category=""]').classList.add('active');
    loadProducts(val ? `?search=${encodeURIComponent(val)}` : '');
}

// ==========================================================
// RENDER PRODUCTS
// ==========================================================
function renderProducts(products) {
    if (products.length === 0) {
        productGrid.innerHTML = '<p class="empty-msg">No products found.</p>';
        return;
    }
    productGrid.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${p.name}">
            <div class="product-info">
                <span class="product-category">${p.category}</span>
                <div class="product-name">${p.name}</div>
                <div class="product-desc">${p.description || ''}</div>
                ${p.stock <= 5 && p.stock > 0 ? `<div class="stock-warning">Only ${p.stock} left!</div>` : ''}
                ${p.stock === 0 ? `<div class="stock-warning">Out of stock</div>` : ''}
                <div class="product-footer">
                    <span class="product-price">₹${Number(p.price).toFixed(2)}</span>
                    <button class="btn-add" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
                        ${p.stock === 0 ? 'Unavailable' : 'Add +'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

productGrid.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-add')) return;
    const id = parseInt(e.target.dataset.id);
    addToCart(id);
});

// ==========================================================
// CART LOGIC
// ==========================================================
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, qty: 1 });
    }
    saveCart();
    updateCartUI();
    showStatus(`${product.name} added to cart`, 'success');
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    saveCart();
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    cartCount.textContent = totalQty;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    } else {
        cartItemsEl.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image_url || 'https://via.placeholder.com/60'}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="name">${item.name}</div>
                    <div class="price">₹${Number(item.price).toFixed(2)} x ${item.qty}</div>
                </div>
                <div class="qty-controls">
                    <button onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">&times;</button>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    cartTotalEl.textContent = `₹${total.toFixed(2)}`;
}

// ---------- Cart sidebar open/close ----------
document.getElementById('cartBtn').addEventListener('click', () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.remove('hidden');
});
function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.add('hidden');
}
document.getElementById('closeCart').addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

// ---------- Checkout ----------
document.getElementById('checkoutBtn').addEventListener('click', async () => {
    if (!currentUser) {
        showStatus('Please login to checkout.', 'error');
        closeCartSidebar();
        openAuthModal();
        return;
    }
    if (cart.length === 0) {
        showStatus('Your cart is empty.', 'error');
        return;
    }
    try {
        const items = cart.map(i => ({ product_id: i.id, quantity: i.qty }));
        const result = await API.placeOrder(items);
        showStatus(`✅ Order #${result.orderId} placed! Total: ₹${Number(result.totalAmount).toFixed(2)}`, 'success');
        cart = [];
        saveCart();
        updateCartUI();
        closeCartSidebar();
        loadProducts(); // refresh stock counts
    } catch (err) {
        showStatus(`Checkout failed: ${err.message}`, 'error');
    }
});

// ==========================================================
// AUTH LOGIC
// ==========================================================
function openAuthModal() {
    authModal.classList.remove('hidden');
    authOverlay.classList.remove('hidden');
}
function closeAuthModal() {
    authModal.classList.add('hidden');
    authOverlay.classList.add('hidden');
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
}

document.getElementById('loginBtn').addEventListener('click', openAuthModal);
document.getElementById('closeAuth').addEventListener('click', closeAuthModal);
authOverlay.addEventListener('click', closeAuthModal);

document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
});
document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
});

document.getElementById('submitLogin').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    try {
        const result = await API.login({ email, password });
        loginSuccess(result);
    } catch (err) {
        errEl.textContent = err.message;
    }
});

document.getElementById('submitRegister').addEventListener('click', async () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errEl = document.getElementById('registerError');
    try {
        const result = await API.register({ name, email, password });
        loginSuccess(result);
    } catch (err) {
        errEl.textContent = err.message;
    }
});

function loginSuccess(result) {
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    currentUser = result.user;
    updateAuthUI();
    closeAuthModal();
    showStatus(`Welcome, ${currentUser.name}!`, 'success');
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateAuthUI();
    showStatus('Logged out successfully.', 'success');
});

function updateAuthUI() {
    const greeting = document.getElementById('userGreeting');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const ordersBtn = document.getElementById('ordersBtn');

    if (currentUser) {
        greeting.textContent = `Hi, ${currentUser.name}`;
        greeting.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        ordersBtn.classList.remove('hidden');
    } else {
        greeting.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        ordersBtn.classList.add('hidden');
    }
}

// ==========================================================
// ORDERS MODAL
// ==========================================================
document.getElementById('ordersBtn').addEventListener('click', async () => {
    ordersModal.classList.remove('hidden');
    ordersOverlay.classList.remove('hidden');
    const listEl = document.getElementById('ordersList');
    listEl.innerHTML = '<p class="empty-msg">Loading...</p>';
    try {
        const orders = await API.getOrders();
        if (orders.length === 0) {
            listEl.innerHTML = '<p class="empty-msg">You have no orders yet.</p>';
            return;
        }
        listEl.innerHTML = orders.map(o => `
            <div class="order-card">
                <div class="order-top">
                    <span>Order #${o.id}</span>
                    <span class="order-status">${o.status}</span>
                </div>
                <div style="font-size:12px;color:#78909c;margin-bottom:8px;">
                    ${new Date(o.created_at).toLocaleString()}
                </div>
                ${o.items.map(it => `
                    <div class="order-item-row">
                        <span>${it.name} x ${it.quantity}</span>
                        <span>₹${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="order-item-row" style="font-weight:700;color:#263238;margin-top:6px;">
                    <span>Total</span>
                    <span>₹${Number(o.total_amount).toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        listEl.innerHTML = `<p class="empty-msg">Failed to load orders: ${err.message}</p>`;
    }
});

document.getElementById('closeOrders').addEventListener('click', closeOrdersModal);
ordersOverlay.addEventListener('click', closeOrdersModal);
function closeOrdersModal() {
    ordersModal.classList.add('hidden');
    ordersOverlay.classList.add('hidden');
}
