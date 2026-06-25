import { useEffect, useRef, useState } from "react";
import { CalendarClock, LineChart } from "lucide-react";

// Inietta un widget TradingView (src + config) dentro un container.
function TVWidget({ src, config }) {
  const ref = useRef(null);
  const configKey = JSON.stringify(config);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.innerHTML = configKey;
    c.appendChild(s);
    return () => { c.innerHTML = ""; };
  }, [src, configKey]);
  return <div ref={ref} className="tradingview-widget-container" />;
}

// Principali indicatori macro globali (simboli TradingView ECONOMICS).
const INDICATORS = [
  { label: "USA · Tasso d'interesse (Fed)", symbol: "ECONOMICS:USINTR" },
  { label: "USA · Inflazione (CPI YoY)", symbol: "ECONOMICS:USIRYY" },
  { label: "USA · Disoccupazione", symbol: "ECONOMICS:USUR" },
  { label: "USA · Crescita PIL", symbol: "ECONOMICS:USGDPQQ" },
  { label: "USA · Non-Farm Payrolls", symbol: "ECONOMICS:USNFP" },
  { label: "Eurozona · Tasso d'interesse (BCE)", symbol: "ECONOMICS:EUINTR" },
  { label: "Eurozona · Inflazione (CPI YoY)", symbol: "ECONOMICS:EUIRYY" },
  { label: "Eurozona · Disoccupazione", symbol: "ECONOMICS:EUUR" },
  { label: "Germania · Crescita PIL", symbol: "ECONOMICS:DEGDPQQ" },
  { label: "Cina · Crescita PIL (YoY)", symbol: "ECONOMICS:CNGDPYY" },
];

export default function MacroNews() {
  const [indicator, setIndicator] = useState(INDICATORS[0]);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <CalendarClock size={22} className="text-violet-400" /> News Macroeconomiche
        </h1>
        <p className="text-slate-400 text-sm">I principali eventi macroeconomici globali, in tempo reale.</p>
      </div>

      {/* Calendario economico */}
      <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-3 mb-6">
        <TVWidget
          src="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
          config={{ colorTheme: "dark", isTransparent: true, locale: "it", importanceFilter: "0,1", width: "100%", height: 600 }}
        />
      </div>

      {/* Grafici degli indicatori */}
      <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="text-base font-semibold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <LineChart size={16} className="text-violet-400" /> Andamento indicatori
          </h2>
          <select
            value={indicator.symbol}
            onChange={(e) => setIndicator(INDICATORS.find((i) => i.symbol === e.target.value))}
            className="px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white focus:outline-none focus:border-violet-500 max-w-full sm:w-72"
          >
            {INDICATORS.map((i) => (
              <option key={i.symbol} value={i.symbol}>{i.label}</option>
            ))}
          </select>
        </div>

        <TVWidget
          src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
          config={{
            symbol: indicator.symbol,
            interval: "M",
            theme: "dark",
            style: "3", // area
            locale: "it",
            width: "100%",
            height: 420,
            hide_side_toolbar: true,
            hide_legend: false,
            allow_symbol_change: false,
            backgroundColor: "rgba(17,17,19,1)",
          }}
        />
      </div>

      <p className="text-xs text-slate-600 mt-3">Dati forniti da TradingView.</p>
    </div>
  );
}
