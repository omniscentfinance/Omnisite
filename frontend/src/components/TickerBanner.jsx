import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

const REFRESH_MS = 60_000;

const nf = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

function QuoteItem({ q }) {
  if (q.price == null) return null;
  const up = q.changePercent >= 0;
  return (
    <div className="flex items-center gap-2 px-6 whitespace-nowrap">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{q.label}</span>
      <span className="text-sm font-semibold text-white">{nf.format(q.price)}</span>
      <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {up ? "+" : ""}{q.changePercent.toFixed(2)}%
      </span>
    </div>
  );
}

// Banner a scorrimento con le quotazioni principali (dati Twelve Data via edge function).
export default function TickerBanner() {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("market-quotes");
        if (error) throw error;
        if (!cancelled) setQuotes(data?.quotes?.filter((q) => q.price != null) ?? []);
      } catch {
        // Silenzioso: il banner semplicemente non appare se i dati non sono disponibili.
      }
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (quotes.length === 0) return null;

  // Duplichiamo la lista per un loop di scorrimento continuo.
  const track = [...quotes, ...quotes];

  return (
    <div className="relative z-10 w-full h-11 bg-[#09090B] border-y border-[#1E1E2A] overflow-hidden">
      <div className="ticker-track flex items-center h-full">
        {track.map((q, i) => <QuoteItem key={`${q.key}-${i}`} q={q} />)}
      </div>
    </div>
  );
}
