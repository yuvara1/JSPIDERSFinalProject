import { useEffect, useState } from "react";
import { paymentsAPI } from "../services/api";
import {
  getErrorMessage,
  formatCurrency,
  statusColor,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  paymentMethodLabel,
} from "../utils/helpers";
import {
  EmptyState,
  PageHeader,
  Spinner,
  Badge,
  Select,
  Table,
} from "../components/ui";
import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  const load = () => {
    setLoading(true);
    // Fetch all via status filter (get each status and merge)
    Promise.allSettled(
      PAYMENT_STATUSES.map((s) => paymentsAPI.getByStatusPath(s)),
    )
      .then((results) => {
        const all = results.flatMap((r) =>
          r.status === "fulfilled" ? r.value.data.data : [],
        );
        // deduplicate by paymentId
        const map = new Map(all.map((p) => [p.paymentId, p]));
        setPayments([...map.values()]);
      })
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await paymentsAPI.updateStatus(id, status);
      toast.success("Payment status updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const filtered = payments
    .filter((p) => !filterStatus || p.paymentStatus === filterStatus)
    .filter((p) => !filterMethod || p.paymentMethod === filterMethod);

  const methodIcon = (m) =>
    ({ UPI: "📱", CREDIT_CARD: "💳", CASH_ON_DELIVERY: "💵" })[m] ?? "💰";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Payments"
        subtitle={`${payments.length} total payments`}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PAYMENT_STATUSES.map((s) => {
          const count = payments.filter((p) => p.paymentStatus === s).length;
          const total = payments
            .filter((p) => p.paymentStatus === s)
            .reduce((sum, p) => sum + p.amount, 0);
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`card p-4 text-left transition-all hover:border-surface-400 ${filterStatus === s ? "border-brand-500 bg-brand-500/5" : ""}`}
            >
              <Badge label={s} className={statusColor(s)} />
              <p className="font-display font-bold text-xl text-white mt-2">
                {count}
              </p>
              <p className="font-mono text-xs text-surface-300 mt-0.5">
                {formatCurrency(total)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Method filter */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setFilterMethod("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${!filterMethod ? "bg-brand-500 text-white" : "bg-surface-700 text-surface-200 hover:bg-surface-600"}`}
        >
          All Methods
        </button>
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMethod(filterMethod === m ? "" : m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${filterMethod === m ? "bg-brand-500 text-white" : "bg-surface-700 text-surface-200 hover:bg-surface-600"}`}
          >
            {methodIcon(m)} {paymentMethodLabel(m)}
          </button>
        ))}
      </div>

      <Table
        headers={["Payment ID", "Method", "Amount", "Status", "Update Status"]}
        loading={loading}
        empty={
          !loading &&
          filtered.length === 0 && (
            <EmptyState icon={CreditCard} title="No payments found" />
          )
        }
      >
        {filtered.map((p) => (
          <tr key={p.paymentId} className="table-row">
            <td className="td">
              <span className="font-mono text-brand-400">#{p.paymentId}</span>
            </td>
            <td className="td">
              <span className="flex items-center gap-2 text-surface-200">
                <span>{methodIcon(p.paymentMethod)}</span>
                {paymentMethodLabel(p.paymentMethod)}
              </span>
            </td>
            <td className="td font-mono text-white">
              {formatCurrency(p.amount)}
            </td>
            <td className="td">
              <Badge
                label={p.paymentStatus}
                className={statusColor(p.paymentStatus)}
              />
            </td>
            <td className="td">
              <Select
                className="py-1 px-2 text-xs w-36 bg-surface-600"
                value={p.paymentStatus}
                onChange={(e) =>
                  handleStatusUpdate(p.paymentId, e.target.value)
                }
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
