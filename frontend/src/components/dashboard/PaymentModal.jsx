import { useState } from "react";
import { X, Check, Zap, User } from "lucide-react";

// Inserisci qui i tuoi Stripe Payment Links
const STRIPE_LINKS = {
  advanced_full: "https://buy.stripe.com/28EfZj1xc4aQbr192c3gk00",
  advanced_installments: "https://buy.stripe.com/28E4gB5Ns9vagLl2DO3gk01",
  mentorship_full: "https://buy.stripe.com/dRmaEZejYcHm7aL7Y83gk02",
  mentorship_installments: "https://buy.stripe.com/eVq8wR8ZE8r62Uva6g3gk03",
};

const PACKAGES = [
  {
    id: "advanced",
    icon: Zap,
    label: "Advanced",
    badge: null,
    description: "Corsi completi + classi private in gruppo",
    price: "€ 2.500",
    priceInstallments: "€ 225 x 12 mesi",
    features: [
      "Accesso a tutti i corsi privati",
      "Classi private in gruppo",
      "Indicatori & Bot per il trading",
      "Trading Journal",
      "Corso Base incluso",
      "Supporto prioritario",
    ],
    highlight: false,
    installmentsLabel: "12 rate",
    linkFull: "advanced_full",
    linkInstallments: "advanced_installments",
  },
  {
    id: "mentorship",
    icon: User,
    label: "Master Mentor",
    badge: "Esclusivo",
    description: "3 mesi · 6h totali · chat privata diretta",
    price: "€ 1.500",
    priceInstallments: "€ 500 x 3 mesi",
    features: [
      "6 ore di sessioni private 1to1",
      "3 mesi di percorso dedicato",
      "Chat privata diretta con il mentor",
      "Strategia personalizzata",
      "Accesso a tutti i corsi privati",
      "Classi private in gruppo",
      "Indicatori & Bot per il trading",
      "Trading Journal",
      "Corso Base incluso",
      "Priorità assoluta nel supporto",
    ],
    highlight: true,
    installmentsLabel: "3 mesi",
    linkFull: "mentorship_full",
    linkInstallments: "mentorship_installments",
  },
];

export default function PaymentModal({ onClose }) {
  const [selected, setSelected] = useState({
    advanced: "full",
    mentorship: "full",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#111113] border border-[#1E1E2A] rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Scegli il tuo percorso
        </h2>
        <p className="text-sm text-slate-500 mb-6">Investi nella tua crescita. Disponibile anche a rate.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            const isInstallments = selected[pkg.id] === "installments";

            return (
              <div
                key={pkg.id}
                className={`relative rounded-xl border flex flex-col gap-4 overflow-hidden ${
                  pkg.highlight
                    ? "border-violet-500 bg-violet-500/5"
                    : "border-[#1E1E2A] bg-[#16161A]"
                }`}
              >
                {pkg.badge && (
                  <span className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    {pkg.badge}
                  </span>
                )}

                <div className="p-5 pb-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${pkg.highlight ? "bg-violet-500/20" : "bg-[#1E1E2A]"}`}>
                    <Icon size={18} className={pkg.highlight ? "text-violet-400" : "text-slate-400"} />
                  </div>

                  <p className="text-base font-bold text-white mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {pkg.label}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">{pkg.description}</p>

                  <p className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {isInstallments ? pkg.priceInstallments : pkg.price}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                        <Check size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Payment toggle */}
                <div className="px-5 pb-5 flex flex-col gap-3 mt-auto">
                  <div className="flex rounded-lg border border-[#1E1E2A] overflow-hidden text-xs font-medium">
                    <button
                      onClick={() => setSelected((prev) => ({ ...prev, [pkg.id]: "full" }))}
                      className={`flex-1 py-2 transition-colors ${
                        !isInstallments ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Unica soluzione
                    </button>
                    <button
                      onClick={() => setSelected((prev) => ({ ...prev, [pkg.id]: "installments" }))}
                      className={`flex-1 py-2 transition-colors ${
                        isInstallments ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {pkg.installmentsLabel}
                    </button>
                  </div>

                  <a
                    href={STRIPE_LINKS[isInstallments ? pkg.linkInstallments : pkg.linkFull]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 rounded-md text-sm font-medium text-center transition-colors ${
                      pkg.highlight
                        ? "bg-violet-600 hover:bg-violet-500 text-white"
                        : "border border-[#1E1E2A] hover:border-violet-500/40 text-slate-300 hover:text-white"
                    }`}
                  >
                    Acquista ora
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-600 text-center mt-4">
          Pagamenti gestiti in modo sicuro da Stripe. Nessun dato salvato sui nostri server.
        </p>
      </div>
    </div>
  );
}
