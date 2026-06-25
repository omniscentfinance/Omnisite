import { useEffect, useRef, useState, useCallback } from "react";
import { CalendarClock, LineChart as LineIcon, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/lib/supabase";

// Indicatori macro (chiavi allineate alla Edge Function fred-series).
const MACRO_INDICATORS = [
  { key: "fed_funds", label: "USA · Tasso d'interesse (Fed)", unit: "%" },
  { key: "cpi_yoy", label: "USA · Inflazione CPI (YoY)", unit: "%" },
  { key: "core_cpi_yoy", label: "USA · Core CPI (YoY)", unit: "%" },
  { key: "unemployment", label: "USA · Disoccupazione", unit: "%" },
  { key: "gdp_growth", label: "USA · Crescita PIL (annualizz.)", unit: "%" },
  { key: "payrolls", label: "USA · Non-Farm Payrolls", unit: "K" },
  { key: "consumer_sentiment", label: "USA · Consumer Sentiment (Michigan)", unit: "" },
];

async function getFredSeries(key) {
  const { data, error } = await supabase.functions.invoke("fred-series", { body: { key } });
  if (error) throw error;
  return data?.points ?? [];
}

// Inietta il widget del calendario economico TradingView (questo funziona gratis).
function CalendarWidget() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    const s = document.createElement("script");
    s.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    s.async = true;
    s.innerHTML = JSON.stringify({ colorTheme: "dark", isTransparent: true, locale: "it", importanceFilter: "0,1", width: "100%", height: 600 });
    c.appendChild(s);
    return () => { c.innerHTML = ""; };
  }, []);
  return <div ref={ref} className="tradingview-widget-container" />;
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("it-IT", { month: "short", year: "2-digit" });
}

function MacroTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[#16161A] border border-[#1E1E2A] rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400">{new Date(p.date).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}</p>
      <p className="text-white font-semibold">{p.value}{unit}</p>
    </div>
  );
}

export default function MacroNews() {
  const [indicator, setIndicator] = useState(MACRO_INDICATORS[0]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { setPoints(await getFredSeries(indicator.key)); }
    catch { setError(true); setPoints([]); }
    setLoading(false);
  }, [indicator.key]);
  useEffect(() => { load(); }, [load]);

  const last = points[points.length - 1];

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
        <CalendarWidget />
      </div>

      {/* Grafici degli indicatori (dati FRED) */}
      <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <LineIcon size={16} className="text-violet-400" /> Andamento indicatori
            </h2>
            {last && !loading && (
              <p className="text-sm text-slate-400 mt-1">
                Ultimo dato: <span className="text-white font-medium">{last.value}{indicator.unit}</span> · {new Date(last.date).toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <select
            value={indicator.key}
            onChange={(e) => setIndicator(MACRO_INDICATORS.find((i) => i.key === e.target.value))}
            className="px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white focus:outline-none focus:border-violet-500 max-w-full sm:w-72"
          >
            {MACRO_INDICATORS.map((i) => (
              <option key={i.key} value={i.key}>{i.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center"><Loader2 className="animate-spin text-violet-400" size={22} /></div>
        ) : error ? (
          <div className="h-72 flex items-center justify-center text-center text-sm text-slate-500">
            Dati non disponibili al momento. Riprova più tardi.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2A" vertical={false} />
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#1E1E2A" }} tickLine={false} minTickGap={40} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={45} domain={["auto", "auto"]} />
              <Tooltip content={<MacroTooltip unit={indicator.unit} />} />
              <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <p className="text-xs text-slate-600 mt-3">Calendario: TradingView · Indicatori: FRED (Federal Reserve Economic Data).</p>
    </div>
  );
}
