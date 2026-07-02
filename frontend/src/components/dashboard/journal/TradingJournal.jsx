import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Trash2, Pencil, ImagePlus, Loader2,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { listMonthTrades, createTrade, updateTrade, deleteTrade, uploadImage, dateKey, listStudents } from "@/lib/journal";
import { useAuth } from "@/context/AuthContext";
import EquityChart from "./EquityChart";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTH_NAMES = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

const OUTCOMES = {
  win: { label: "Win", cls: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  loss: { label: "Loss", cls: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
  be: { label: "Break-even", cls: "text-slate-400", bg: "bg-slate-500/10", dot: "bg-slate-400" },
};

export default function TradingJournal() {
  const { user, isAdmin } = useAuth();
  const admin = isAdmin();
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [adding, setAdding] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [students, setStudents] = useState([]);
  const [viewUserId, setViewUserId] = useState(null); // null = il proprio journal

  // Sola lettura quando l'admin guarda il journal di un altro studente
  const readOnly = admin && viewUserId && viewUserId !== user?.id;
  const effectiveUserId = admin ? (viewUserId || user?.id) : user?.id;

  useEffect(() => {
    if (admin) listStudents().then(setStudents).catch(() => setStudents([]));
  }, [admin]);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTrades(await listMonthTrades(view.year, view.month, admin ? (viewUserId || user?.id) : null)); }
    catch { setTrades([]); }
    setLoading(false);
  }, [view.year, view.month, admin, viewUserId, user?.id]);
  useEffect(() => { load(); }, [load]);

  const tradesByDay = trades.reduce((acc, t) => {
    (acc[t.trade_date] = acc[t.trade_date] || []).push(t);
    return acc;
  }, {});

  const firstDay = new Date(view.year, view.month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.year, view.month, d));

  const isFuture = (date) => { const t = new Date(); t.setHours(23, 59, 59); return date > t; };

  const changeMonth = (delta) => {
    setSelectedDay(null);
    const m = view.month + delta;
    setView({ year: view.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 });
  };

  const dayTrades = selectedDay ? (tradesByDay[dateKey(selectedDay)] || []) : [];

  // Statistiche mese
  const stats = {
    total: trades.length,
    win: trades.filter((t) => t.outcome === "win").length,
    loss: trades.filter((t) => t.outcome === "loss").length,
  };
  const winRate = stats.total ? Math.round((stats.win / stats.total) * 100) : 0;

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Trading Journal</h1>
          <p className="text-slate-400 text-sm">
            {readOnly ? "Stai visualizzando il journal di uno studente (sola lettura)." : "Registra e analizza i tuoi trade giorno per giorno."}
          </p>
        </div>
        {admin && (
          <select
            value={viewUserId || user?.id || ""}
            onChange={(e) => { setViewUserId(e.target.value); setSelectedDay(null); }}
            className="px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#111113] text-sm text-white focus:outline-none focus:border-violet-500 sm:w-64"
          >
            <option value={user?.id}>Il mio journal</option>
            {students.filter((s) => s.id !== user?.id).map((s) => (
              <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Trade del mese", value: stats.total, icon: null },
          { label: "Win", value: stats.win, icon: <TrendingUp size={15} className="text-emerald-400" /> },
          { label: "Loss", value: stats.loss, icon: <TrendingDown size={15} className="text-red-400" /> },
          { label: "Win rate", value: `${winRate}%`, icon: null },
        ].map((s) => (
          <div key={s.label} className="bg-[#111113] border border-[#1E1E2A] rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5">
              {s.icon}
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.value}</p>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Equity curve */}
      <EquityChart userId={effectiveUserId} editable={!readOnly} refreshKey={trades.length} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Calendario */}
        <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {MONTH_NAMES[view.month]} {view.year}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><ChevronLeft size={18} /></button>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wide py-1">{d}</div>
            ))}
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-violet-400" size={22} /></div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((date, i) => {
                if (!date) return <div key={`e${i}`} />;
                const dayList = tradesByDay[dateKey(date)] || [];
                const future = isFuture(date);
                const selected = selectedDay && date.toDateString() === selectedDay.toDateString();
                const isToday = date.toDateString() === today.toDateString();
                const hasWin = dayList.some((t) => t.outcome === "win");
                const hasLoss = dayList.some((t) => t.outcome === "loss");
                return (
                  <button
                    key={dateKey(date)}
                    disabled={future}
                    onClick={() => setSelectedDay(date)}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative ${
                      selected ? "border-violet-500 bg-violet-500/15"
                      : future ? "border-transparent opacity-25 cursor-not-allowed"
                      : "border-[#1E1E2A] bg-[#16161A] hover:border-violet-500/40 cursor-pointer"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${selected ? "text-violet-300" : isToday ? "text-violet-400" : future ? "text-slate-700" : "text-white"}`}>
                      {date.getDate()}
                    </span>
                    {dayList.length > 0 && (
                      <span className="flex items-center gap-0.5">
                        {hasWin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        {hasLoss && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                        <span className="text-[10px] text-slate-500 ml-0.5">{dayList.length}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pannello giorno */}
        <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-5">
          {!selectedDay ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center">
              <TrendingUp size={22} className="text-slate-600 mb-2" />
              <p className="text-sm text-slate-500">Seleziona un giorno per vedere i tuoi report.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {DAY_NAMES[selectedDay.getDay()]} {selectedDay.getDate()} {MONTH_NAMES[selectedDay.getMonth()]}
                </p>
                {!readOnly && (
                  <button onClick={() => setAdding(true)} className="w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white"><Plus size={16} /></button>
                )}
              </div>

              {dayTrades.length === 0 ? (
                <p className="text-sm text-slate-500">{readOnly ? "Nessun report in questo giorno." : "Nessun report. Clicca + per aggiungerne uno."}</p>
              ) : (
                <div className="space-y-3">
                  {dayTrades.map((t) => <TradeCard key={t.id} trade={t} onDeleted={load} onEdit={() => setEditingTrade(t)} onExpand={() => setExpandedTrade(t)} readOnly={readOnly} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {adding && <TradeModal date={selectedDay} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); load(); }} />}
      {editingTrade && <TradeModal date={selectedDay} trade={editingTrade} onClose={() => setEditingTrade(null)} onSaved={() => { setEditingTrade(null); load(); }} />}
      {expandedTrade && <TradeDetailModal trade={expandedTrade} onClose={() => setExpandedTrade(null)} />}
    </div>
  );
}

function TradeCard({ trade, onDeleted, onEdit, onExpand, readOnly }) {
  const o = OUTCOMES[trade.outcome] || OUTCOMES.be;
  const dir = trade.direction === "long";
  return (
    <div
      onClick={onExpand}
      className="rounded-xl border border-[#1E1E2A] bg-[#16161A] overflow-hidden cursor-pointer hover:border-violet-500/40 transition-colors"
    >
      {trade.image_url && (
        <img src={trade.image_url} alt="" className="w-full max-h-48 object-cover" />
      )}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{trade.asset || "—"}</span>
            {trade.direction && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${dir ? "text-emerald-400" : "text-red-400"}`}>
                {dir ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{dir ? "Long" : "Short"}
              </span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${o.bg} ${o.cls}`}>{o.label}</span>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-slate-600 hover:text-violet-400"><Pencil size={13} /></button>
              <button onClick={async (e) => { e.stopPropagation(); if (confirm("Eliminare il report?")) { await deleteTrade(trade.id); onDeleted(); } }} className="text-slate-600 hover:text-red-400"><Trash2 size={13} /></button>
            </div>
          )}
        </div>
        {trade.pnl && <p className="text-sm text-slate-300">P&L / R: <span className="font-medium text-white">{trade.pnl}</span></p>}
        {trade.description && <p className="text-sm text-slate-400 whitespace-pre-line line-clamp-2">{trade.description}</p>}
        {trade.lessons && (
          <p className="text-xs text-slate-500 border-l-2 border-violet-500/40 pl-2 whitespace-pre-line line-clamp-1"><span className="text-violet-400 font-medium">Lezioni:</span> {trade.lessons}</p>
        )}
      </div>
    </div>
  );
}

function TradeDetailModal({ trade, onClose }) {
  const o = OUTCOMES[trade.outcome] || OUTCOMES.be;
  const dir = trade.direction === "long";
  const dateLabel = trade.trade_date
    ? new Date(`${trade.trade_date}T00:00:00`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-[#111113] border border-[#1E1E2A] rounded-2xl overflow-hidden relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-black/50 hover:bg-black/70 flex items-center justify-center text-white"><X size={18} /></button>

        {trade.image_url && (
          <img src={trade.image_url} alt="" className="w-full max-h-[70vh] object-contain bg-black" />
        )}

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-white">{trade.asset || "—"}</span>
            {trade.direction && (
              <span className={`text-sm font-medium flex items-center gap-0.5 ${dir ? "text-emerald-400" : "text-red-400"}`}>
                {dir ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{dir ? "Long" : "Short"}
              </span>
            )}
            <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${o.bg} ${o.cls}`}>{o.label}</span>
          </div>

          {dateLabel && <p className="text-sm text-slate-500 capitalize">{dateLabel}</p>}

          {trade.pnl && <p className="text-base text-slate-300">P&L / R: <span className="font-semibold text-white">{trade.pnl}</span></p>}
          {typeof trade.pnl_amount === "number" && trade.pnl_amount !== 0 && (
            <p className={`text-base font-semibold ${trade.pnl_amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trade.pnl_amount > 0 ? "+" : ""}{trade.pnl_amount} €
            </p>
          )}

          {trade.description && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Descrizione</p>
              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{trade.description}</p>
            </div>
          )}

          {trade.lessons && (
            <div className="border-l-2 border-violet-500/40 pl-3">
              <p className="text-xs uppercase tracking-wide text-violet-400 mb-1">Lezioni</p>
              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{trade.lessons}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TradeModal({ date, trade, onClose, onSaved }) {
  const isEdit = !!trade;
  const [form, setForm] = useState(trade ? {
    asset: trade.asset || "",
    direction: trade.direction || "long",
    outcome: trade.outcome || "win",
    pnl: trade.pnl || "",
    pnl_amount: trade.pnl_amount ?? "",
    description: trade.description || "",
    lessons: trade.lessons || "",
  } : { asset: "", direction: "long", outcome: "win", pnl: "", pnl_amount: "", description: "", lessons: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(trade?.image_url || null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const save = async () => {
    if (!form.asset.trim()) { setErr("Inserisci lo strumento."); return; }
    setSaving(true); setErr("");
    try {
      let image_url = trade?.image_url || null;
      if (file) image_url = await uploadImage(file);
      const payload = {
        asset: form.asset.trim(),
        direction: form.direction,
        outcome: form.outcome,
        pnl: form.pnl.trim(),
        pnl_amount: form.pnl_amount === "" ? 0 : parseFloat(String(form.pnl_amount).replace(",", ".")) || 0,
        description: form.description.trim(),
        lessons: form.lessons.trim(),
        image_url,
      };
      if (isEdit) await updateTrade(trade.id, payload);
      else await createTrade({ ...payload, trade_date: dateKey(date) });
      onSaved();
    } catch (e) { setErr(e?.message || "Errore nel salvataggio. Riprova."); } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-[#111113] border border-[#1E1E2A] rounded-2xl p-6 relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={18} /></button>
        <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>{isEdit ? "Modifica report" : "Nuovo report"}</h2>

        {/* Immagine */}
        <div onClick={() => fileRef.current?.click()}
          className="mb-4 rounded-xl border border-dashed border-[#2A2A38] hover:border-violet-500/50 cursor-pointer overflow-hidden transition-colors">
          {preview ? (
            <img src={preview} alt="" className="w-full max-h-52 object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <ImagePlus size={22} className="mb-1" />
              <span className="text-sm">Carica screenshot del grafico</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.asset} onChange={(e) => set("asset", e.target.value)} placeholder="Strumento (es. EUR/USD)" className={inputCls} />
          <input value={form.pnl} onChange={(e) => set("pnl", e.target.value)} placeholder="R / note (es. +2.5R)" className={inputCls} />
        </div>
        <div className="mb-3">
          <input value={form.pnl_amount} onChange={(e) => set("pnl_amount", e.target.value)} inputMode="decimal"
            placeholder="Risultato in € (es. 250 oppure -120)" className={inputCls} />
          <p className="text-xs text-slate-600 mt-1">Positivo se in profitto, negativo se in perdita. Aggiorna il grafico del conto.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex rounded-md border border-[#1E1E2A] overflow-hidden text-sm">
            {[["long", "Long"], ["short", "Short"]].map(([v, l]) => (
              <button key={v} onClick={() => set("direction", v)} className={`flex-1 py-2 transition-colors ${form.direction === v ? (v === "long" ? "bg-emerald-600 text-white" : "bg-red-600 text-white") : "text-slate-400"}`}>{l}</button>
            ))}
          </div>
          <select value={form.outcome} onChange={(e) => set("outcome", e.target.value)} className={inputCls}>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="be">Break-even</option>
          </select>
        </div>

        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Descrizione del trade (setup, entrata, gestione...)" className={`${inputCls} resize-none mb-3`} />
        <textarea value={form.lessons} onChange={(e) => set("lessons", e.target.value)} rows={2} placeholder="Lezioni / cosa miglioro" className={`${inputCls} resize-none mb-4`} />

        {err && <p className="text-sm text-red-400 mb-3">{err}</p>}
        <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2">
          {saving && <Loader2 size={15} className="animate-spin" />}{saving ? "Salvataggio..." : (isEdit ? "Salva modifiche" : "Salva report")}
        </button>
      </div>
    </div>
  );
}
