import { useEffect, useState } from "react";
import { menuItemsAPI, restaurantsAPI } from "../services/api";
import { getErrorMessage, formatCurrency } from "../utils/helpers";
import {
  Modal,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  FormField,
  Spinner,
  Table,
  Select,
  Badge,
} from "../components/ui";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  UtensilsCrossed,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";

const EMPTY = { itemName: "", price: "", availability: true, restaurantId: "" };

export default function MenuItemsPage() {
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([menuItemsAPI.getAll(), restaurantsAPI.getAll()])
      .then(([i, r]) => {
        setItems(i.data.data);
        setRestaurants(r.data.data);
      })
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, restaurantId: restaurants[0]?.restaurantId ?? "" });
    setModal(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      itemName: item.itemName,
      price: item.price,
      availability: item.availability,
      restaurantId: item.restaurantId,
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        restaurantId: parseInt(form.restaurantId),
      };
      if (editing) {
        // Update price separately if changed
        if (parseFloat(form.price) !== editing.price) {
          await menuItemsAPI.updatePrice(
            editing.itemId,
            parseFloat(form.price),
          );
        }
      } else {
        await menuItemsAPI.create(payload);
      }
      toast.success(editing ? "Item updated" : "Item added");
      setModal(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await menuItemsAPI.delete(delConfirm.itemId);
      toast.success("Item deleted");
      setDelConfirm(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const filtered = items.filter(
    (i) =>
      i.itemName.toLowerCase().includes(search.toLowerCase()) ||
      i.restaurantName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Menu Items"
        subtitle={`${items.length} items across all restaurants`}
        action={
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Item
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-300"
        />
        <input
          className="input pl-9"
          placeholder="Search by name or restaurant…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        headers={[
          "ID",
          "Item Name",
          "Restaurant",
          "Price",
          "Available",
          "Actions",
        ]}
        loading={loading}
        empty={
          !loading &&
          filtered.length === 0 && (
            <EmptyState
              icon={UtensilsCrossed}
              title="No items found"
              description={
                search ? "Try a different search" : "Add your first menu item"
              }
              action={
                <button
                  onClick={openCreate}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={15} />
                  Add Item
                </button>
              }
            />
          )
        }
      >
        {filtered.map((item) => (
          <tr key={item.itemId} className="table-row">
            <td className="td">
              <span className="font-mono text-brand-400">#{item.itemId}</span>
            </td>
            <td className="td font-medium text-white">{item.itemName}</td>
            <td className="td text-surface-200">{item.restaurantName}</td>
            <td className="td font-mono text-brand-400">
              {formatCurrency(item.price)}
            </td>
            <td className="td">
              {item.availability ? (
                <span className="flex items-center gap-1.5 text-green-400 text-xs">
                  <ToggleRight size={16} />
                  Available
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-surface-300 text-xs">
                  <ToggleLeft size={16} />
                  Unavailable
                </span>
              )}
            </td>
            <td className="td">
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={() => setDelConfirm(item)}
                  className="btn-danger py-1.5 px-3 flex items-center gap-1.5 text-xs"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Menu Item" : "New Menu Item"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <FormField label="Item Name" required>
            <input
              className="input"
              placeholder="Paneer Butter Masala"
              value={form.itemName}
              onChange={set("itemName")}
              required
              disabled={!!editing}
            />
          </FormField>
          <FormField label="Price (₹)" required>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="220.00"
              value={form.price}
              onChange={set("price")}
              required
            />
          </FormField>
          {!editing && (
            <FormField label="Restaurant" required>
              <Select
                value={form.restaurantId}
                onChange={set("restaurantId")}
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
          )}
          {!editing && (
            <FormField label="Availability">
              <Select
                value={form.availability.toString()}
                onChange={(e) =>
                  setForm({ ...form, availability: e.target.value === "true" })
                }
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </Select>
            </FormField>
          )}
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

      <ConfirmDialog
        open={!!delConfirm}
        onClose={() => setDelConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Menu Item"
        message={`Delete "${delConfirm?.itemName}"?`}
      />
    </div>
  );
}
