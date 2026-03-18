import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — clear token and reload
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
};

// ── Customers ─────────────────────────────────────────────────────────────────
export const customersAPI = {
  getAll: () => api.get("/customers"),
  getById: (id) => api.get(`/customers/${id}`),
  getByContact: (contact) => api.get(`/customers/contact/${contact}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
};

// ── Restaurants ───────────────────────────────────────────────────────────────
export const restaurantsAPI = {
  getAll: () => api.get("/restaurants"),
  getById: (id) => api.get(`/restaurants/${id}`),
  getByName: (name) => api.get(`/restaurants/name/${name}`),
  getByLocation: (loc) => api.get(`/restaurants/location/${loc}`),
  getMenu: (id) => api.get(`/restaurants/${id}/menu`),
  getPaginated: (page = 0, size = 10, sortBy = "restaurantName", dir = "ASC") =>
    api.get(
      `/restaurants/paginated?page=${page}&size=${size}&sortBy=${sortBy}&direction=${dir}`,
    ),
  create: (data) => api.post("/restaurants", data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
};

// ── Menu Items ────────────────────────────────────────────────────────────────
export const menuItemsAPI = {
  getAll: () => api.get("/menu-items"),
  getById: (id) => api.get(`/menu-items/${id}`),
  getByName: (name) => api.get(`/menu-items/name/${name}`),
  searchByName: (name) =>
    api.get(`/menu-items/search?name=${encodeURIComponent(name)}`),
  getAbovePrice: (price) => api.get(`/menu-items/price?price=${price}`),
  create: (data) => api.post("/menu-items", data),
  updatePrice: (id, price) => api.patch(`/menu-items/${id}/price`, { price }),
  delete: (id) => api.delete(`/menu-items/${id}`),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersAPI = {
  getAll: () => api.get("/orders"),
  getById: (id) => api.get(`/orders/${id}`),
  getByCustomer: (customerId) => api.get(`/orders/customer/${customerId}`),
  getByRestaurant: (restaurantId) =>
    api.get(`/orders/restaurant/${restaurantId}`),
  getByStatus: (status) => api.get(`/orders/status/${status}`),
  getByDatePath: (date) => api.get(`/orders/date/${date}`),
  getByDateQuery: (date) =>
    api.get(`/orders/by-date?date=${encodeURIComponent(date)}`),
  getByAmountRange: (min, max) =>
    api.get(`/orders/amount-range?min=${min}&max=${max}`),
  getByAmount: (minAmount, maxAmount) =>
    api.get(`/orders/amount?minAmount=${minAmount}&maxAmount=${maxAmount}`),
  place: (data) => api.post("/orders", data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel: (id) => api.delete(`/orders/${id}/cancel`),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  getById: (id) => api.get(`/payments/${id}`),
  getByStatusQuery: (status) =>
    api.get(`/payments/status?status=${encodeURIComponent(status)}`),
  getByStatusPath: (status) => api.get(`/payments/status/${status}`),
  getByMethodQuery: (method) =>
    api.get(`/payments/method?method=${encodeURIComponent(method)}`),
  getByMethodPath: (method) => api.get(`/payments/method/${method}`),
  updateStatusPatch: (id, status) =>
    api.patch(`/payments/${id}/status`, { paymentStatus: status }),
  updateStatusPut: (id, status) =>
    api.put(`/payments/${id}/status?status=${encodeURIComponent(status)}`),
};

export default api;
