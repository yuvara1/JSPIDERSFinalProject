# FoodDesk — Food Delivery Frontend

A production-grade React dashboard for the Food Delivery API, built with Vite + React + Tailwind CSS.

---

## Stack

| | |
|---|---|
| Build Tool | Vite 5 |
| Framework | React 18 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| HTTP | Axios |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Fonts | Syne (display) + DM Sans (body) |

---

## Setup

### Prerequisites
- Node.js 18+
- Food Delivery Spring Boot API running on `http://localhost:8080`

### Install & Run

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

The Vite dev server proxies `/api` → `http://localhost:8080` automatically.

---

## Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | JWT authentication |
| Register | `/register` | Create account |
| Dashboard | `/` | Stats overview + recent orders |
| Customers | `/customers` | List, create, edit customers |
| Restaurants | `/restaurants` | Card grid with CRUD |
| Menu Items | `/menu-items` | Items table with price update |
| Orders | `/orders` | Place orders, update status, view details |
| Payments | `/payments` | Status summary + inline status update |

---

## Auth Flow

1. Register at `/register`
2. Login at `/login` — JWT stored in `localStorage`
3. All API calls automatically include `Authorization: Bearer <token>`
4. On `401`, token is cleared and user is redirected to `/login`

---

## Build for Production

```bash
npm run build
```

Output in `dist/`. Point your backend to serve this or use a separate web server.

For production, update `vite.config.js` proxy target or set `VITE_API_BASE_URL` in a `.env` file and adjust `src/services/api.js`.
