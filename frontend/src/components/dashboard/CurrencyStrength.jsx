import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Loader2, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { getCurrencyStrength } from "@/lib/currencyStrength";

const COLORS = {
  USD: "#a78bfa", EUR: "#34d399", GBP: "#60a5fa", JPY: "#f87171",
  CHF: "#fbbf24", AUD: "#f472b6", CAD: "#38bdf8", NZD: "#a3e635",
};

function fmtTime(iso) {
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function StrengthBar({ currency, strength, max }) {
  const pct = max ? Math.min(100, (Math.abs(strength) / max) * 100) : 0;
  const positive = strength >= 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-sm font-semibold text-white">{currency}</span>
      <div className="flex-1 h-2.5 rounded-full bg-[#1E1E2A] overflow-hidden">
        <div className={`h-full transition-all ${positive ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`w-16 text-right text-xs font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>
        {positive ? "+" : ""}{strength.toFixed(2)}%
      </span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#16161A] border border-[#1E1E2A] rounded-lg px-3 py-2 text-xs max-w-[220px]">
      <p className="text-slate-400 mb-1">{fmtTime(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.dataKey}: {Number(p.value).toFixed(2)}%</p>
      ))}
    </div>
  );
}

export default function CurrencyStrength() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [curA, setCurA] = useState("USD");
  const [curB, setCurB] = useState("JPY");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const d = await getCurrencyStrength();
        setData(d);
        if (d?.latest?.length) {
          setCurA(d.latest[0].currency);
          setCurB(d.latest[d.latest.length - 1].currency);
        }
      } catch (e) { setErr(e?.message || "Errore nel caricamento."); }
      setLoading(false);
    })();
  }, []);

  const chartData = useMemo(() => {
    if (!data?.series) return [];
    const byTime = {};
    for (const [currency, points] of Object.entries(data.series)) {
      for (const p of points) (byTime[p.t] ||= { t: p.t })[currency] = p.v;
    }
    return Object.values(byTime).sort((a, b) => new Date(a.t) - new Date(b.t));
  }, [data]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-violet-400" size={22} /></div>;
  }
  if (err) {
    return <p className="text-sm text-red-400">{err}</p>;
  }

  const latest = data?.latest ?? [];
  const currencies = latest.map((l) => l.currency);
  const maxAbs = Math.max(1, ...latest.map((l) => Math.abs(l.strength)));

  const a = latest.find((l) => l.currency === curA);
  const b = latest.find((l) => l.currency === curB);
  const delta = a && b ? Math.round((a.strength - b.strength) * 100) / 100 : 0;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Forza delle valute</h1>
        <p className="text-slate-400 text-sm">Forza relativa delle 8 valute major, calcolata sulla variazione % giornaliera di 28 coppie incrociate.</p>
      </div>

      {latest.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Nessun dato ancora disponibile. Lo storico si popola con i primi aggiornamenti automatici.
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-[#1E1E2A] bg-[#111113] p-5 space-y-3">
            <h2 className="text-sm font-semibold text-white mb-1">Ranking di oggi</h2>
            {latest.map((l) => (
              <StrengthBar key={l.currency} currency={l.currency} strength={l.strength} max={maxAbs} />
            ))}
          </div>

          <div className="rounded-2xl border border-[#1E1E2A] bg-[#111113] p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Andamento (ultime 48 ore)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2A" />
                  <XAxis dataKey="t" tickFormatter={fmtTime} tick={{ fill: "#64748b", fontSize: 11 }} minTickGap={40} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {currencies.map((c) => (
                    <Line key={c} type="monotone" dataKey={c} stroke={COLORS[c] || "#a78bfa"} dot={false} strokeWidth={2} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E1E2A] bg-[#111113] p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowLeftRight size={15} className="text-violet-400" /> Confronto per il tuo trade swing
            </h2>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <select value={curA} onChange={(e) => setCurA(e.target.value)} className="px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white focus:outline-none focus:border-violet-500">
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-slate-500 text-sm">vs</span>
              <select value={curB} onChange={(e) => setCurB(e.target.value)} className="px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white focus:outline-none focus:border-violet-500">
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {curA === curB ? (
              <p className="text-sm text-slate-500">Scegli due valute diverse per confrontarle.</p>
            ) : Math.abs(delta) < 0.15 ? (
              <div className="flex items-center gap-3 rounded-xl p-4 bg-slate-500/5 border border-slate-500/20">
                <ArrowLeftRight size={20} className="text-slate-400 flex-shrink-0" />
                <p className="text-sm text-slate-300">{curA} e {curB} hanno forza simile oggi: nessun bias direzionale chiaro su {curA}/{curB}.</p>
              </div>
            ) : delta > 0 ? (
              <div className="flex items-center gap-3 rounded-xl p-4 bg-emerald-500/5 border border-emerald-500/20">
                <TrendingUp size={20} className="text-emerald-400 flex-shrink-0" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">{curA}</strong> è più forte di <strong className="text-white">{curB}</strong> (Δ {delta.toFixed(2)}%):
                  il bias di oggi favorisce <strong className="text-emerald-400">{curA}/{curB} long</strong>.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl p-4 bg-red-500/5 border border-red-500/20">
                <TrendingDown size={20} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">{curB}</strong> è più forte di <strong className="text-white">{curA}</strong> (Δ {Math.abs(delta).toFixed(2)}%):
                  il bias di oggi favorisce <strong className="text-red-400">{curA}/{curB} short</strong>.
                </p>
              </div>
            )}
            <p className="text-xs text-slate-600 mt-3">
              Nota: è un indicatore di momentum relativo, non un segnale di trading. Conferma sempre con la tua analisi prima di aprire una posizione.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
