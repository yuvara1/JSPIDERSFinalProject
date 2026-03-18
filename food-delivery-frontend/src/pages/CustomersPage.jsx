import { useEffect, useState } from "react";
import { customersAPI } from "../services/api";
import { getErrorMessage } from "../utils/helpers";
import {
  Modal,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  FormField,
  Spinner,
  Table,
} from "../components/ui";
import { Plus, Pencil, Search, Users } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY = { customerName: "", email: "", contact: "", address: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    customersAPI
      .getAll()
      .then((r) => setCustomers(r.data.data))
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      customerName: c.customerName,
      email: c.email,
      contact: c.contact,
      address: c.address || "",
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await customersAPI.update(editing.customerId, form);
        toast.success("Customer updated");
      } else {
        await customersAPI.create(form);
        toast.success("Customer created");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const filtered = customers.filter(
    (c) =>
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.includes(search),
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} total customers`}
        action={
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Customer
          </button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300"
        />
        <input
          className="input pl-9"
          placeholder="Search by name, email, contact…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        headers={["ID", "Name", "Email", "Contact", "Address", "Actions"]}
        loading={loading}
        empty={
          !loading &&
          filtered.length === 0 && (
            <EmptyState
              icon={Users}
              title="No customers found"
              description={
                search ? "Try a different search" : "Add your first customer"
              }
            />
          )
        }
      >
        {filtered.map((c) => (
          <tr key={c.customerId} className="table-row">
            <td className="td">
              <span className="font-mono text-brand-400">#{c.customerId}</span>
            </td>
            <td className="td font-medium text-white">{c.customerName}</td>
            <td className="td text-surface-200">{c.email}</td>
            <td className="td font-mono text-sm">{c.contact}</td>
            <td className="td text-surface-300 max-w-xs truncate">
              {c.address || "—"}
            </td>
            <td className="td">
              <button
                onClick={() => openEdit(c)}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs"
              >
                <Pencil size={12} /> Edit
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {/* Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Customer" : "New Customer"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <FormField label="Full Name" required>
            <input
              className="input"
              placeholder="Rahul Sharma"
              value={form.customerName}
              onChange={set("customerName")}
              required
            />
          </FormField>
          <FormField label="Email" required>
            <input
              className="input"
              type="email"
              placeholder="rahul@example.com"
              value={form.email}
              onChange={set("email")}
              required
            />
          </FormField>
          <FormField label="Contact (10 digits)" required>
            <input
              className="input"
              placeholder="9876543210"
              maxLength={10}
              value={form.contact}
              onChange={set("contact")}
              pattern="[0-9]{10}"
              required
            />
          </FormField>
          <FormField label="Address">
            <textarea
              className="input resize-none h-20"
              placeholder="12, MG Road, Bengaluru"
              value={form.address}
              onChange={set("address")}
            />
          </FormField>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving && <Spinner size={14} />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
