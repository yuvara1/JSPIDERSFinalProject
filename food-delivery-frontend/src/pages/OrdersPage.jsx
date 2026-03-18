import { useEffect, useState } from "react";
import {
  ordersAPI,
  customersAPI,
  restaurantsAPI,
  menuItemsAPI,
} from "../services/api";
import {
  getErrorMessage,
  formatCurrency,
  formatDate,
  statusColor,
  ORDER_STATUSES,
  PAYMENT_METHODS,
} from "../utils/helpers";
import {
  Modal,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  FormField,
  Spinner,
  Badge,
  Select,
  Table,
} from "../components/ui";
import {
  Plus,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [placeModal, setPlaceModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [saving, setSaving] = useState(false);

  // Place order form state
  const [orderForm, setOrderForm] = useState({
    customerId: "",
    restaurantId: "",
    paymentMethod: "UPI",
    orderItems: [],
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      ordersAPI.getAll(),
      customersAPI.getAll(),
      restaurantsAPI.getAll(),
    ])
      .then(([o, c, r]) => {
        setOrders(o.data.data);
        setCustomers(c.data.data);
        setRestaurants(r.data.data);
      })
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRestaurantChange = async (rid) => {
    setOrderForm((f) => ({ ...f, restaurantId: rid, orderItems: [] }));
    if (rid) {
      try {
        const res = await restaurantsAPI.getMenu(rid);
        // Fix: extract menu items from res.data.data
        setMenuItems((res.data.data || []).filter((i) => i.availability));
      } catch {
        setMenuItems([]);
      }
    } else {
      setMenuItems([]);
    }
  };

  const addItem = (itemId) => {
    const item = menuItems.find((i) => i.itemId === parseInt(itemId));
    if (!item) return;
    setOrderForm((f) => {
      const existing = f.orderItems.find((oi) => oi.itemId === item.itemId);
      if (existing)
        return {
          ...f,
          orderItems: f.orderItems.map((oi) =>
            oi.itemId === item.itemId
              ? { ...oi, quantity: oi.quantity + 1 }
              : oi,
          ),
        };
      return {
        ...f,
        orderItems: [
          ...f.orderItems,
          {
            itemId: item.itemId,
            itemName: item.itemName,
            price: item.price,
            quantity: 1,
          },
        ],
      };
    });
  };

  const updateQty = (itemId, qty) => {
    if (qty < 1) return removeItem(itemId);
    setOrderForm((f) => ({
      ...f,
      orderItems: f.orderItems.map((oi) =>
        oi.itemId === itemId ? { ...oi, quantity: qty } : oi,
      ),
    }));
  };

  const removeItem = (itemId) =>
    setOrderForm((f) => ({
      ...f,
      orderItems: f.orderItems.filter((oi) => oi.itemId !== itemId),
    }));

  const orderTotal = orderForm.orderItems.reduce(
    (s, oi) => s + oi.price * oi.quantity,
    0,
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.orderItems.length)
      return toast.error("Add at least one item");
    setSaving(true);
    try {
      await ordersAPI.place({
        customerId: parseInt(orderForm.customerId),
        restaurantId: parseInt(orderForm.restaurantId),
        paymentMethod: orderForm.paymentMethod,
        orderItems: orderForm.orderItems.map((oi) => ({
          itemId: oi.itemId,
          quantity: oi.quantity,
        })),
      });
      toast.success("Order placed!");
      setPlaceModal(false);
      setOrderForm({
        customerId: "",
        restaurantId: "",
        paymentMethod: "UPI",
        orderItems: [],
      });
      setMenuItems([]);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await ordersAPI.cancel(cancelConfirm.orderId);
      toast.success("Order cancelled");
      setCancelConfirm(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const filtered = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders;
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.orderDateTime) - new Date(a.orderDateTime),
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
        action={
          <button
            onClick={() => setPlaceModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Place Order
          </button>
        }
      />

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setFilterStatus("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${!filterStatus ? "bg-brand-500 text-white" : "bg-surface-700 text-surface-200 hover:bg-surface-600"}`}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s === filterStatus ? "" : s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${filterStatus === s ? "bg-brand-500 text-white" : "bg-surface-700 text-surface-200 hover:bg-surface-600"}`}
          >
            {s.replace(/_/g, " ")} (
            {orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      <Table
        headers={[
          "Order ID",
          "Customer",
          "Restaurant",
          "Amount",
          "Payment",
          "Status",
          "Date",
          "Actions",
        ]}
        loading={loading}
        empty={
          !loading &&
          sorted.length === 0 && (
            <EmptyState icon={ShoppingBag} title="No orders found" />
          )
        }
      >
        {sorted.map((o) => (
          <tr key={o.orderId} className="table-row">
            <td className="td">
              <span className="font-mono text-brand-400">#{o.orderId}</span>
            </td>
            <td className="td text-white">{o.customerName}</td>
            <td className="td text-surface-200">{o.restaurantName}</td>
            <td className="td font-mono">{formatCurrency(o.totalAmount)}</td>
            <td className="td text-xs text-surface-300">
              {o.payment?.paymentMethod?.replace(/_/g, " ")}
            </td>
            <td className="td">
              <Select
                className="py-1 px-2 text-xs w-44 bg-surface-600"
                value={o.status}
                onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </td>
            <td className="td text-xs text-surface-300">
              {formatDate(o.orderDateTime)}
            </td>
            <td className="td">
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailModal(o)}
                  className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs"
                >
                  <Eye size={12} />
                  View
                </button>
                {o.status === "PENDING" && (
                  <button
                    onClick={() => setCancelConfirm(o)}
                    className="btn-danger py-1.5 px-3 text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Place Order Modal */}
      <Modal
        open={placeModal}
        onClose={() => setPlaceModal(false)}
        title="Place New Order"
        size="lg"
      >
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Customer" required>
              <Select
                value={orderForm.customerId}
                onChange={(e) =>
                  setOrderForm((f) => ({ ...f, customerId: e.target.value }))
                }
                required
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.customerName}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Payment Method" required>
              <Select
                value={orderForm.paymentMethod}
                onChange={(e) =>
                  setOrderForm((f) => ({ ...f, paymentMethod: e.target.value }))
                }
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Restaurant" required>
            <Select
              value={orderForm.restaurantId}
              onChange={(e) => handleRestaurantChange(e.target.value)}
              required
            >
              <option value="">Select restaurant…</option>
              {restaurants.map((r) => (
                <option key={r.restaurantId} value={r.restaurantId}>
                  {r.restaurantName}
                </option>
              ))}
            </Select>
          </FormField>

          {menuItems.length > 0 && (
            <FormField label="Add Menu Item">
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value) addItem(e.target.value);
                }}
              >
                <option value="">Choose item to add…</option>
                {menuItems.map((i) => (
                  <option key={i.itemId} value={i.itemId}>
                    {i.itemName} — {formatCurrency(i.price)}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          {orderForm.orderItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="label">Order Items</label>
              <div className="card p-3 flex flex-col gap-2">
                {orderForm.orderItems.map((oi) => (
                  <div
                    key={oi.itemId}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-white flex-1">
                      {oi.itemName}
                    </span>
                    <span className="font-mono text-xs text-brand-400">
                      {formatCurrency(oi.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(oi.itemId, oi.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-surface-600 hover:bg-surface-500 flex items-center justify-center text-white text-sm transition-colors"
                      >
                        −
                      </button>
                      <span className="font-mono text-sm w-6 text-center">
                        {oi.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(oi.itemId, oi.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-surface-600 hover:bg-surface-500 flex items-center justify-center text-white text-sm transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-mono text-sm text-white w-20 text-right">
                      {formatCurrency(oi.price * oi.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(oi.itemId)}
                      className="text-surface-300 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div className="border-t border-surface-600 pt-2 mt-1 flex justify-between">
                  <span className="font-display font-semibold text-sm text-white">
                    Total
                  </span>
                  <span className="font-mono font-bold text-brand-400">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setPlaceModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !orderForm.orderItems.length}
              className="btn-primary flex items-center gap-2"
            >
              {saving && <Spinner size={14} />}
              {saving
                ? "Placing…"
                : `Place Order — ${formatCurrency(orderTotal)}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Order #${detailModal?.orderId}`}
        size="md"
      >
        {detailModal && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Customer", detailModal.customerName],
                ["Restaurant", detailModal.restaurantName],
                ["Date", formatDate(detailModal.orderDateTime)],
                [
                  "Payment",
                  detailModal.payment?.paymentMethod?.replace(/_/g, " "),
                ],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface-700/50 rounded-xl p-3">
                  <p className="text-surface-300 text-xs">{k}</p>
                  <p className="text-white text-sm font-medium mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <label className="label">Order Items</label>
              <div className="card overflow-hidden">
                {detailModal.orderItems?.map((oi) => (
                  <div
                    key={oi.orderItemId}
                    className="flex justify-between items-center px-4 py-3 border-b border-surface-700 last:border-0"
                  >
                    <span className="text-sm text-white">{oi.itemName}</span>
                    <span className="text-xs text-surface-300">
                      ×{oi.quantity}
                    </span>
                    <span className="font-mono text-sm text-brand-400">
                      {formatCurrency(oi.subtotal)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 bg-surface-700/50">
                  <span className="font-display font-semibold text-white">
                    Total
                  </span>
                  <span className="font-mono font-bold text-brand-400">
                    {formatCurrency(detailModal.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                label={detailModal.status}
                className={statusColor(detailModal.status)}
              />
              <Badge
                label={detailModal.payment?.paymentStatus}
                className={statusColor(detailModal.payment?.paymentStatus)}
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel Order"
        message={`Cancel Order #${cancelConfirm?.orderId}? This cannot be undone.`}
      />
    </div>
  );
}
