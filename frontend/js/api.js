// ==========================================================
// Small wrapper around fetch() for talking to the backend API
// ==========================================================

async function apiRequest(path, method = 'GET', body = null, auth = false) {
    const headers = { 'Content-Type': 'application/json' };

    if (auth) {
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE_URL}${path}`, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
}

const API = {
    getProducts: (query = '') => apiRequest(`/products${query}`),
    getCategories: () => apiRequest('/products/categories'),
    register: (payload) => apiRequest('/auth/register', 'POST', payload),
    login: (payload) => apiRequest('/auth/login', 'POST', payload),
    placeOrder: (items) => apiRequest('/orders', 'POST', { items }, true),
    getOrders: () => apiRequest('/orders', 'GET', null, true),
};
