import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import RestaurantsPage from './pages/RestaurantsPage'
import MenuItemsPage from './pages/MenuItemsPage'
import OrdersPage from './pages/OrdersPage'
import PaymentsPage from './pages/PaymentsPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<AppLayout />}>
          <Route path="/"              element={<DashboardPage />} />
          <Route path="/customers"     element={<CustomersPage />} />
          <Route path="/restaurants"   element={<RestaurantsPage />} />
          <Route path="/menu-items"    element={<MenuItemsPage />} />
          <Route path="/orders"        element={<OrdersPage />} />
          <Route path="/payments"      element={<PaymentsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
