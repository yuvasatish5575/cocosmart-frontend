import { Building2, FileText, Truck } from "lucide-react";
import { Button, Input } from "@/components/Frontend";
import { useToast } from "@/hooks/useToast";

const perks = [
  { icon: Building2, title: "Account-specific pricing", desc: "Pricing tailored to your customer tier and volume." },
  { icon: Truck, title: "Scheduled bulk delivery", desc: "Reliable recurring supply for cafes, restaurants and manufacturers." },
  { icon: FileText, title: "GST-compliant invoicing", desc: "Automatic invoicing aligned with your tax configuration." },
];

export default function Wholesale() {
  const { show } = useToast();
  return (
    <div>
      <section className="bg-coconut px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="eyebrow text-gold-light">B2B &amp; Bulk</span>
        <h1 className="mx-auto mt-3 max-w-lg font-display text-3xl text-white sm:text-4xl">Wholesale, built for your business</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/75">
          For cafes, restaurants, gyms and food manufacturers who need reliable bulk supply.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
        {perks.map((p) => (
          <div key={p.title} className="rounded-lg border border-line p-6 text-center">
            <p.icon className="mx-auto h-6 w-6 text-coconut" strokeWidth={1.6} />
            <h3 className="mt-3 text-sm font-bold text-charcoal">{p.title}</h3>
            <p className="mt-1 text-xs text-charcoal-muted">{p.desc}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-md px-4 pb-16 sm:px-6 lg:px-8">
        <form
          className="flex flex-col gap-4 rounded-2xl border border-line p-6"
          onSubmit={(e) => {
            e.preventDefault();
            show("Request received", "Our B2B team will reach out within 2 business days.");
          }}
        >
          <h2 className="font-display text-lg text-charcoal">Request a wholesale account</h2>
          <Input label="Business name" required />
          <Input label="Contact email" type="email" required />
          <Input label="Estimated monthly volume" placeholder="e.g. 500L coconut water" />
          <Button size="lg" type="submit">Submit Request</Button>
        </form>
      </section>
    </div>
  );
}
