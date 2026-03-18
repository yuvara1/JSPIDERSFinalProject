import { useEffect, useState } from "react";
import { restaurantsAPI } from "../services/api";
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
import { Plus, Pencil, Trash2, Search, Store, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const EMPTY = { restaurantName: "", location: "" };

export default function RestaurantsPage() {
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
    restaurantsAPI
      .getAll()
      .then((r) => setRestaurants(r.data.data))
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setForm({ restaurantName: r.restaurantName, location: r.location });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      editing
        ? await restaurantsAPI.update(editing.restaurantId, form)
        : await restaurantsAPI.create(form);
      toast.success(editing ? "Restaurant updated" : "Restaurant added");
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
      await restaurantsAPI.delete(delConfirm.restaurantId);
      toast.success("Restaurant deleted");
      setDelConfirm(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const filtered = restaurants.filter(
    (r) =>
      r.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Restaurants"
        subtitle={`${restaurants.length} restaurants`}
        action={
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Restaurant
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
          placeholder="Search by name or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid view */}
      {!loading && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div
              key={r.restaurantId}
              className="card-hover p-5 flex flex-col gap-4 animate-slide-up"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20
                                flex items-center justify-center flex-shrink-0"
                >
                  <Store size={18} className="text-brand-400" />
                </div>
                <span className="font-mono text-xs text-surface-300">
                  #{r.restaurantId}
                </span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-white">
                  {r.restaurantName}
                </h3>
                <p className="flex items-center gap-1.5 text-surface-300 text-sm mt-1">
                  <MapPin size={12} />
                  {r.location}
                </p>
              </div>
              <div className="flex gap-2 pt-1 border-t border-surface-600">
                <button
                  onClick={() => openEdit(r)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={() => setDelConfirm(r)}
                  className="btn-danger flex items-center justify-center gap-1.5 text-xs py-1.5 px-3"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : (
        <EmptyState
          icon={Store}
          title="No restaurants found"
          description={
            search ? "Try a different search" : "Add your first restaurant"
          }
          action={
            <button
              onClick={openCreate}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={15} />
              Add Restaurant
            </button>
          }
        />
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Restaurant" : "New Restaurant"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <FormField label="Restaurant Name" required>
            <input
              className="input"
              placeholder="Spice Garden"
              value={form.restaurantName}
              onChange={set("restaurantName")}
              required
            />
          </FormField>
          <FormField label="Location" required>
            <input
              className="input"
              placeholder="Koramangala, Bengaluru"
              value={form.location}
              onChange={set("location")}
              required
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

      <ConfirmDialog
        open={!!delConfirm}
        onClose={() => setDelConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Restaurant"
        message={`Delete "${delConfirm?.restaurantName}"? This will also remove all its menu items.`}
      />
    </div>
  );
}
