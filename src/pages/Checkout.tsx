import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, MapPin, Plus } from "lucide-react";
import { CheckoutStepper, Input, Button } from "@/components/Frontend";
import { useCart } from "@/hooks/CartContext";
import { useToast } from "@/hooks/useToast";
import { addressService } from "@/services/addressService";
import { orderService } from "@/services/orderService";
import { ApiClientError } from "@/lib/apiClient";
import { formatINR } from "@/lib/utils";
import type { Address, PaymentMethod } from "@/data/types";

const slots = ["Tomorrow, 9am–12pm", "Tomorrow, 2pm–6pm", "Sat, 9am–12pm", "Sat, 2pm–6pm"];
const paymentMethods: { id: PaymentMethod; label: string }[] = [
  { id: "UPI", label: "UPI" },
  { id: "CARD", label: "Card" },
  { id: "COD", label: "Cash on Delivery" },
];

interface AddressForm {
  fullName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
}

const emptyAddress: AddressForm = { fullName: "", phone: "", addressLine1: "", city: "", state: "", postalCode: "" };

export default function Checkout() {
  const { lines, subtotal, delivery, total, refresh } = useCart();
  const { show } = useToast();
  const [step, setStep] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState<AddressForm>(emptyAddress);
  const [slot, setSlot] = useState(slots[0]);
  const [payment, setPayment] = useState<PaymentMethod>("UPI");
  const [promo, setPromo] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    addressService
      .list()
      .then((addresses) => {
        setSavedAddresses(addresses);
        const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (preferred) setSelectedAddressId(preferred.id);
        else setAddingNew(true);
      })
      .catch(() => setAddingNew(true))
      .finally(() => setAddressesLoading(false));
  }, []);

  const formValid = !!(form.fullName && form.phone && form.addressLine1 && form.city && form.state && form.postalCode.length >= 3);
  const addressValid = addingNew ? formValid : !!selectedAddressId;
  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

  useEffect(() => {
    if (lines.length === 0) navigate("/shop", { replace: true });
  }, [lines.length, navigate]);

  if (lines.length === 0) return null;

  async function placeOrder() {
    setPlaceError(null);
    setPlacing(true);
    try {
      const order = await orderService.checkout({
        addressId: !addingNew ? selectedAddressId ?? undefined : undefined,
        newAddress: addingNew
          ? {
              fullName: form.fullName,
              phone: form.phone,
              addressLine1: form.addressLine1,
              city: form.city,
              state: form.state,
              postalCode: form.postalCode,
            }
          : undefined,
        paymentMethod: payment,
        deliverySlot: slot,
      });
      await refresh();
      navigate("/order-confirmation", { state: { orderNumber: order.orderNumber } });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "We couldn't place your order. Please try again.";
      setPlaceError(message);
      show("Order failed", message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <CheckoutStepper current={step} />

      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-xl text-charcoal">Delivery Address</h2>

            {addressesLoading ? (
              <p className="text-sm text-charcoal-muted">Loading your addresses…</p>
            ) : (
              <>
                {savedAddresses.length > 0 && !addingNew && (
                  <div className="flex flex-col gap-3">
                    {savedAddresses.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAddressId(a.id)}
                        className={
                          selectedAddressId === a.id
                            ? "flex items-start gap-3 rounded-md border border-coconut bg-coconut-50 p-4 text-left"
                            : "flex items-start gap-3 rounded-md border border-line p-4 text-left hover:border-coconut"
                        }
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coconut" strokeWidth={1.8} />
                        <span className="text-sm">
                          <span className="block font-bold text-charcoal">
                            {a.fullName} {a.isDefault && <span className="ml-1 text-xs font-semibold text-coconut">(Default)</span>}
                          </span>
                          <span className="block text-charcoal-muted">
                            {a.addressLine1}
                            {a.addressLine2 ? `, ${a.addressLine2}` : ""}, {a.city}, {a.state} {a.postalCode}
                          </span>
                          <span className="block text-charcoal-soft">{a.phone}</span>
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => setAddingNew(true)}
                      className="flex items-center gap-2 rounded-md border border-dashed border-line p-3 text-left text-sm font-semibold text-coconut hover:border-coconut"
                    >
                      <Plus className="h-4 w-4" /> Add a new address
                    </button>
                  </div>
                )}

                {(addingNew || savedAddresses.length === 0) && (
                  <div className="flex flex-col gap-4">
                    {savedAddresses.length > 0 && (
                      <button onClick={() => setAddingNew(false)} className="self-start text-xs font-bold text-coconut">
                        ← Use a saved address
                      </button>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                      <Input label="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      <Input
                        label="Address line"
                        className="sm:col-span-2"
                        value={form.addressLine1}
                        onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                      />
                      <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                      <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                      <Input label="PIN code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                    </div>
                  </div>
                )}
              </>
            )}

            <Button size="lg" disabled={!addressValid} onClick={() => setStep(1)} className="self-end">
              Continue to Delivery
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-xl text-charcoal">Delivery Slot</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={
                    slot === s
                      ? "rounded-md border border-coconut bg-coconut-50 p-3 text-left text-sm font-semibold text-coconut-dark"
                      : "rounded-md border border-line p-3 text-left text-sm font-semibold text-charcoal-muted hover:border-coconut"
                  }
                >
                  {s}
                </button>
              ))}
            </div>
            <Button size="lg" onClick={() => setStep(2)} className="self-end">
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-xl text-charcoal">Payment</h2>
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={
                    payment === m.id
                      ? "rounded-md border border-coconut bg-coconut-50 px-5 py-3 text-sm font-semibold text-coconut-dark"
                      : "rounded-md border border-line px-5 py-3 text-sm font-semibold text-charcoal-muted hover:border-coconut"
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Input placeholder="Promo code" value={promo} onChange={(e) => setPromo(e.target.value)} className="flex-1" />
              <Button variant="secondary" disabled>
                Apply
              </Button>
            </div>
            <span className="flex items-center gap-2 text-xs text-charcoal-soft">
              <ShieldCheck className="h-4 w-4 text-success" />
              {payment === "COD" ? "Pay with cash when your order arrives." : "Payments are processed through a secure, compliant gateway."}
            </span>
            <Button size="lg" onClick={() => setStep(3)} className="self-end">
              Review Order
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-xl text-charcoal">Review &amp; Place Order</h2>
            <div className="flex flex-col gap-2 text-sm text-charcoal-muted">
              <p>
                <strong className="text-charcoal">Deliver to:</strong>{" "}
                {addingNew
                  ? `${form.fullName}, ${form.addressLine1}, ${form.city}, ${form.state} ${form.postalCode}`
                  : `${selectedAddress?.fullName}, ${selectedAddress?.addressLine1}, ${selectedAddress?.city}, ${selectedAddress?.state} ${selectedAddress?.postalCode}`}
              </p>
              <p><strong className="text-charcoal">Slot:</strong> {slot}</p>
              <p><strong className="text-charcoal">Payment:</strong> {paymentMethods.find((m) => m.id === payment)?.label}</p>
            </div>
            <div className="rounded-lg bg-cream p-4">
              <div className="flex justify-between text-sm text-charcoal-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-charcoal-muted">
                <span>Delivery</span>
                <span className="font-semibold text-charcoal">{delivery === 0 ? "Free" : formatINR(delivery)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-2 text-base font-bold text-charcoal">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
            {placeError && (
              <p role="alert" className="rounded-md bg-error-soft px-4 py-3 text-sm text-error">
                {placeError}
              </p>
            )}
            <Button size="lg" variant="gold" onClick={placeOrder} loading={placing} disabled={placing}>
              Place Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
