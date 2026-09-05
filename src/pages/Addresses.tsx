import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { Button, Input, EmptyState, Modal, Badge } from "@/components/Frontend";
import { useToast } from "@/hooks/useToast";
import { addressService, type AddressInput } from "@/services/addressService";
import { ApiClientError } from "@/lib/apiClient";
import type { Address } from "@/data/types";

const emptyForm: AddressInput = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export default function Addresses() {
  const { show } = useToast();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    addressService
      .list()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }

  useEffect(load, []);

  const formValid = !!(form.fullName && form.phone && form.addressLine1 && form.city && form.state && form.postalCode.length >= 3);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(a: Address) {
    setEditingId(a.id);
    setForm({
      fullName: a.fullName,
      phone: a.phone,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 ?? "",
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    });
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editingId) {
        await addressService.update(editingId, form);
      } else {
        await addressService.create(form);
      }
      setModalOpen(false);
      load();
      show(editingId ? "Address updated" : "Address added");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "We couldn't save this address. Please try again.";
      show("Save failed", message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setDeletingId(id);
    try {
      await addressService.remove(id);
      load();
      show("Address removed");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "We couldn't remove this address. Please try again.";
      show("Delete failed", message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function makeDefault(a: Address) {
    try {
      await addressService.update(a.id, { isDefault: true });
      load();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "We couldn't update your default address.";
      show("Update failed", message, "error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl text-charcoal">My Addresses</h1>
        {addresses && addresses.length > 0 && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Address
          </Button>
        )}
      </div>

      {addresses === null ? (
        <p className="text-sm text-charcoal-muted">Loading your addresses…</p>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-8 w-8" strokeWidth={1.5} />}
          title="No saved addresses"
          description="Add a delivery address so checkout is quicker next time."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Address
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start gap-3 rounded-lg border border-line bg-white p-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coconut" strokeWidth={1.8} />
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal">{a.fullName}</span>
                  {a.isDefault && <Badge tone="gold">Default</Badge>}
                </div>
                <p className="text-charcoal-muted">
                  {a.addressLine1}
                  {a.addressLine2 ? `, ${a.addressLine2}` : ""}, {a.city}, {a.state} {a.postalCode}
                </p>
                <p className="text-charcoal-soft">{a.phone}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-bold">
                  <button onClick={() => openEdit(a)} className="flex items-center gap-1 text-coconut hover:underline">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    disabled={deletingId === a.id}
                    className="flex items-center gap-1 text-error hover:underline disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {deletingId === a.id ? "Removing…" : "Remove"}
                  </button>
                  {!a.isDefault && (
                    <button onClick={() => makeDefault(a)} className="text-charcoal-muted hover:underline">
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editingId ? "Edit Address" : "Add Address"}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input
            label="Address line 1"
            className="sm:col-span-2"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
          />
          <Input
            label="Address line 2 (optional)"
            className="sm:col-span-2"
            value={form.addressLine2}
            onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
          />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <Input label="PIN code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!formValid || saving}>
            {editingId ? "Save Changes" : "Add Address"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
