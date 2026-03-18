import { useEffect, useState } from "react";
import {
  customersAPI,
  restaurantsAPI,
  ordersAPI,
  menuItemsAPI,
} from "../services/api";
import { formatCurrency, formatDate, statusColor } from "../utils/helpers";
import { StatCard, Badge } from "../components/ui";
import { Users, Store, ShoppingBag, UtensilsCrossed } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    restaurants: 0,
    orders: 0,
    menuItems: 0,
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      customersAPI.getAll(),
      restaurantsAPI.getAll(),
      ordersAPI.getAll(),
      menuItemsAPI.getAll(),
    ])
      .then(([c, r, o, m]) => {
        const orders = o.status === "fulfilled" ? o.value.data.data : [];
        setStats({
          customers: c.status === "fulfilled" ? c.value.data.data.length : 0,
          restaurants: r.status === "fulfilled" ? r.value.data.data.length : 0,
          orders: orders.length,
          menuItems: m.status === "fulfilled" ? m.value.data.data.length : 0,
        });
        setRecent(
          [...orders]
            .sort(
              (a, b) => new Date(b.orderDateTime) - new Date(a.orderDateTime),
            )
            .slice(0, 8),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = recent.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">
          Dashboard
        </h1>
        <p className="text-surface-200 text-sm mt-1">
          Overview of your food delivery platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={loading ? "—" : stats.customers}
          icon={Users}
          color="brand"
        />
        <StatCard
          label="Restaurants"
          value={loading ? "—" : stats.restaurants}
          icon={Store}
          color="blue"
        />
        <StatCard
          label="Total Orders"
          value={loading ? "—" : stats.orders}
          icon={ShoppingBag}
          color="green"
        />
        <StatCard
          label="Menu Items"
          value={loading ? "—" : stats.menuItems}
          icon={UtensilsCrossed}
          color="purple"
        />
      </div>

      {/* Revenue highlight */}
      <div className="card p-5 flex items-center gap-5">
        <div className="flex-1">
          <p className="text-surface-200 text-sm">Total Revenue (all orders)</p>
          <p className="font-display font-bold text-4xl text-white mt-1">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="hidden sm:flex flex-col gap-1 text-right">
          <p className="text-surface-300 text-xs">
            Based on {stats.orders} orders
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="font-display font-semibold text-lg text-white mb-3">
          Recent Orders
        </h2>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-700/50 border-b border-surface-600">
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Restaurant",
                  "Amount",
                  "Status",
                  "Date",
                ].map((h) => (
                  <th key={h} className="th">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="td text-center text-surface-300 py-8"
                  >
                    Loading…
                  </td>
                </tr>
              ) : recent.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="td text-center text-surface-300 py-8"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                recent.map((o) => (
                  <tr key={o.orderId} className="table-row">
                    <td className="td">
                      <span className="font-mono text-brand-400">
                        #{o.orderId}
                      </span>
                    </td>
                    <td className="td text-white">{o.customerName}</td>
                    <td className="td">{o.restaurantName}</td>
                    <td className="td font-mono">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="td">
                      <Badge
                        label={o.status}
                        className={statusColor(o.status)}
                      />
                    </td>
                    <td className="td text-surface-300 text-xs">
                      {formatDate(o.orderDateTime)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
