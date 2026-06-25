import { useState, useEffect, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Loader2, Pencil, Check, TrendingUp } from "lucide-react";
import { getAllTrades, getStartBalance, setStartBalance } from "@/lib/journal";

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}
function fmtMoney(n) {
  return `€ ${Number(n).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[#16161A] border border-[#1E1E2A] rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400">{p.label}</p>
      <p className="text-white font-semibold">{fmtMoney(p.balance)}</p>
    </div>
  );
}

export default function EquityChart({ userId, editable, refreshKey }) {
  const [trades, setTrades] = useState([]);
  const [startBalance, setStart] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [t, sb] = await Promise.all([getAllTrades(userId), getStartBalance(userId)]);
      setTrades(t);
      setStart(sb);
    } catch { setTrades([]); }
    setLoading(false);
  }, [userId]);
  useEffect(() => { load(); }, [load, refreshKey]);

  const data = useMemo(() => {
    const byDate = {};
    for (const t of trades) byDate[t.trade_date] = (byDate[t.trade_date] || 0) + Number(t.pnl_amount || 0);
    const dates = Object.keys(byDate).sort();
    let bal = startBalance;
    const pts = [{ label: "Inizio", balance: Math.round(bal * 100) / 100 }];
    for (const d of dates) {
      bal += byDate[d];
      pts.push({ label: fmtDate(d), balance: Math.round(bal * 100) / 100 });
    }
    return pts;
  }, [trades, startBalance]);

  const current = data[data.length - 1]?.balance ?? startBalance;
  const pnlTotal = current - startBalance;
  const up = pnlTotal >= 0;
  const roi = startBalance > 0 ? (pnlTotal / startBalance) * 100 : 0;

  const saveBalance = async () => {
    const val = parseFloat(draft.replace(",", "."));
    if (isNaN(val)) return;
    await setStartBalance(val);
    setStart(val);
    setEditing(false);
  };

  return (
    <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-base font-semibold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <TrendingUp size={16} className="text-violet-400" /> Andamento del conto
        </h2>
        <div className="flex items-center gap-3 text-sm">
          {editing ? (
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-xs">Balance iniziale €</span>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="10000"
                className="w-24 px-2 py-1 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white focus:outline-none focus:border-violet-500" />
              <button onClick={saveBalance} className="w-7 h-7 rounded-md bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white"><Check size={14} /></button>
            </div>
          ) : (
            <>
              <span className="text-slate-400">Iniziale: <span className="text-white font-medium">{fmtMoney(startBalance)}</span></span>
              {editable && (
                <button onClick={() => { setDraft(String(startBalance)); setEditing(true); }} className="text-slate-500 hover:text-white"><Pencil size={13} /></button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{fmtMoney(current)}</span>
        <span className={`text-sm font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
          {up ? "+" : ""}{fmtMoney(pnlTotal)}
        </span>
        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
          ROI {up ? "+" : ""}{roi.toFixed(2)}%
        </span>
      </div>

      {loading ? (
        <div className="h-56 flex items-center justify-center"><Loader2 className="animate-spin text-violet-400" size={22} /></div>
      ) : startBalance === 0 && trades.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center text-slate-500 text-sm">
          {editable ? "Imposta il balance iniziale e inizia a registrare i trade per vedere la curva." : "Nessun dato disponibile."}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2A" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#1E1E2A" }} tickLine={false} minTickGap={20} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={60}
              tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="balance" stroke={up ? "#34d399" : "#f87171"} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
