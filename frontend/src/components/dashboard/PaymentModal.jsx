import { X, Check } from "lucide-react";

// Inserisci qui i tuoi Stripe Payment Links
const STRIPE_LINKS = {
  monthly: "https://buy.stripe.com/XXXXXXX",
  semestral: "https://buy.stripe.com/XXXXXXX",
  annual: "https://buy.stripe.com/XXXXXXX",
};

const PLANS = [
  {
    id: "monthly",
    label: "Mensile",
    price: "€ —",
    period: "/ mese",
    features: ["Corsi Privati", "Indicatori & Bot", "Trading Journal", "Corso Base", "Supporto prioritario"],
    highlight: false,
  },
  {
    id: "semestral",
    label: "Semestrale",
    price: "€ —",
    period: "/ 6 mesi",
    badge: "Più scelto",
    features: ["Corsi Privati", "Indicatori & Bot", "Trading Journal", "Corso Base", "Supporto prioritario"],
    highlight: true,
  },
  {
    id: "annual",
    label: "Annuale",
    price: "€ —",
    period: "/ anno",
    badge: "Miglior valore",
    features: ["Corsi Privati", "Indicatori & Bot", "Trading Journal", "Corso Base", "Supporto prioritario"],
    highlight: false,
  },
];

export default function PaymentModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-[#111113] border border-[#1E1E2A] rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Sblocca tutti i servizi
        </h2>
        <p className="text-sm text-slate-500 mb-6">Scegli il piano più adatto a te. Cancella quando vuoi.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-5 flex flex-col gap-4 ${
                plan.highlight
                  ? "border-violet-500 bg-violet-500/5"
                  : "border-[#1E1E2A] bg-[#16161A]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div>
                <p className="text-sm font-semibold text-slate-300 mb-1">{plan.label}</p>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {plan.price}
                  <span className="text-sm font-normal text-slate-500 ml-1">{plan.period}</span>
                </p>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <Check size={13} className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={STRIPE_LINKS[plan.id]}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2.5 rounded-md text-sm font-medium text-center transition-colors ${
                  plan.highlight
                    ? "bg-violet-600 hover:bg-violet-500 text-white"
                    : "border border-[#1E1E2A] hover:border-violet-500/40 text-slate-300 hover:text-white"
                }`}
              >
                Attiva piano
              </a>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-600 text-center mt-4">
          I pagamenti sono gestiti in modo sicuro da Stripe. Nessun dato di pagamento viene salvato sui nostri server.
        </p>
      </div>
    </div>
  );
}
