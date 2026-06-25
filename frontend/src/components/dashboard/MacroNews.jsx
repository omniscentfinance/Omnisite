import { useEffect, useRef } from "react";
import { CalendarClock } from "lucide-react";

// Calendario economico di TradingView (gratuito, embeddabile).
// Filtrato sugli eventi di importanza media/alta (i principali).
export default function MacroNews() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: true,
      locale: "it",
      importanceFilter: "0,1", // media e alta importanza
      width: "100%",
      height: 600,
    });
    container.appendChild(script);
    return () => { container.innerHTML = ""; };
  }, []);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <CalendarClock size={22} className="text-violet-400" /> News Macroeconomiche
        </h1>
        <p className="text-slate-400 text-sm">I principali eventi macroeconomici globali, in tempo reale.</p>
      </div>

      <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-3">
        <div ref={ref} className="tradingview-widget-container" />
      </div>

      <p className="text-xs text-slate-600 mt-3">Dati forniti da TradingView. Gli orari sono nel tuo fuso locale.</p>
    </div>
  );
}
