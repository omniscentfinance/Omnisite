import { useState, useEffect, useCallback, useRef } from "react";
import { Radio, Lock, Pencil, X, ImagePlus, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/journal";
import { useAuth } from "@/context/AuthContext";

async function getLive() {
  const { data } = await supabase.from("live_session").select("*").eq("id", 1).single();
  return data;
}
async function saveLive(fields) {
  const { error } = await supabase.from("live_session").upsert({ id: 1, ...fields, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Countdown -> { d, h, m, s, live } (live = orario raggiunto/passato di recente)
function useCountdown(startsAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!startsAt) return null;
  const target = new Date(startsAt).getTime();
  const diff = target - now;
  // "Live ora" da -5 min fino a +3 ore dall'orario
  const live = diff <= 0 && now - target < 3 * 3600 * 1000;
  const sec = Math.max(0, Math.floor(diff / 1000));
  return {
    d: Math.floor(sec / 86400),
    h: Math.floor((sec % 86400) / 3600),
    m: Math.floor((sec % 3600) / 60),
    s: sec % 60,
    live,
    ended: diff <= 0 && !live,
  };
}

function Segment({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/40 backdrop-blur rounded-lg px-2.5 py-1.5 min-w-[44px] text-center">
        <span className="text-xl font-bold text-white tabular-nums" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wide text-white/60 mt-1">{label}</span>
    </div>
  );
}

export default function LiveBanner({ onUpgrade }) {
  const { hasAdvanced, isAdmin } = useAuth();
  const canAccess = hasAdvanced();
  const admin = isAdmin();

  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setLive(await getLive()); } catch { setLive(null); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const cd = useCountdown(live?.starts_at);

  if (loading) return null;
  // Nessuna live impostata: visibile solo all'admin (per impostarla)
  if (!live?.starts_at && !admin) return null;

  const handleClick = () => {
    if (!canAccess) { onUpgrade?.(); return; }
    if (live?.join_url) window.open(live.join_url, "_blank", "noopener");
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Radio size={16} className="text-violet-400" /> Live giornaliera
        </h2>
        {admin && (
          <button onClick={() => setEditing(true)} className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1">
            <Pencil size={13} /> Modifica
          </button>
        )}
      </div>

      {!live?.starts_at ? (
        <button onClick={() => setEditing(true)} className="w-full rounded-2xl border border-dashed border-violet-500/40 bg-violet-500/5 py-10 text-sm text-violet-300 hover:bg-violet-500/10 transition-colors">
          + Imposta la prossima live
        </button>
      ) : (
        <div
          onClick={handleClick}
          className="group relative rounded-2xl overflow-hidden cursor-pointer ring-1 ring-violet-500/40 shadow-[0_0_40px_-8px_rgba(124,58,237,0.6)] hover:shadow-[0_0_55px_-6px_rgba(124,58,237,0.85)] transition-shadow"
        >
          {/* Cover */}
          {live.cover_url ? (
            <img src={live.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-700 to-fuchsia-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

          {/* Content */}
          <div className="relative p-5 sm:p-6 min-h-[200px] flex flex-col justify-end">
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {cd?.live ? (
                <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE ORA
                </span>
              ) : (
                <span className="bg-violet-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full">PROSSIMA LIVE</span>
              )}
              {!canAccess && (
                <span className="flex items-center gap-1 bg-black/50 backdrop-blur text-white/80 text-xs px-2.5 py-1 rounded-full">
                  <Lock size={11} /> Riservata
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 drop-shadow" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {live.title || "Live di trading"}
            </h3>

            {cd && !cd.live && !cd.ended && (
              <div className="flex items-end gap-2 mb-4">
                {cd.d > 0 && <Segment value={cd.d} label="giorni" />}
                <Segment value={cd.h} label="ore" />
                <Segment value={cd.m} label="min" />
                <Segment value={cd.s} label="sec" />
              </div>
            )}

            <div>
              <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                canAccess ? "bg-white text-black group-hover:bg-violet-100" : "bg-violet-600 text-white group-hover:bg-violet-500"
              }`}>
                {canAccess ? (<>{cd?.live ? "Entra nella live" : "Vai alla live"} <ExternalLink size={14} /></>) : (<><Lock size={14} /> Sblocca l'accesso</>)}
              </span>
            </div>
          </div>
        </div>
      )}

      {editing && <EditLiveModal live={live} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />}
    </div>
  );
}

function EditLiveModal({ live, onClose, onSaved }) {
  const [title, setTitle] = useState(live?.title || "");
  const [joinUrl, setJoinUrl] = useState(live?.join_url || "");
  const [startsAt, setStartsAt] = useState(live?.starts_at ? toLocalInput(live.starts_at) : "");
  const [coverUrl, setCoverUrl] = useState(live?.cover_url || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(live?.cover_url || null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  function toLocalInput(iso) {
    const d = new Date(iso);
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
  }

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const save = async () => {
    if (!startsAt) { setErr("Imposta data e ora della live."); return; }
    setSaving(true); setErr("");
    try {
      let cover = coverUrl;
      if (file) cover = await uploadImage(file);
      await saveLive({
        title: title.trim(),
        join_url: joinUrl.trim(),
        starts_at: new Date(startsAt).toISOString(),
        cover_url: cover || null,
      });
      onSaved();
    } catch { setErr("Errore nel salvataggio."); } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-[#111113] border border-[#1E1E2A] rounded-2xl p-6 relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={18} /></button>
        <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Imposta la live</h2>

        <div onClick={() => fileRef.current?.click()} className="mb-4 rounded-xl border border-dashed border-[#2A2A38] hover:border-violet-500/50 cursor-pointer overflow-hidden">
          {preview ? <img src={preview} alt="" className="w-full max-h-44 object-cover" /> : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500"><ImagePlus size={22} className="mb-1" /><span className="text-sm">Carica copertina</span></div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Titolo</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Analisi mercati pre-apertura" className={`${inputCls} mb-3`} />

        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Data e ora</label>
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={`${inputCls} mb-3`} />

        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Link della live</label>
        <input value={joinUrl} onChange={(e) => setJoinUrl(e.target.value)} placeholder="https://... (YouTube, Zoom, ecc.)" className={`${inputCls} mb-4`} />

        {err && <p className="text-sm text-red-400 mb-3">{err}</p>}
        <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2">
          {saving && <Loader2 size={15} className="animate-spin" />}{saving ? "Salvataggio..." : "Salva live"}
        </button>
      </div>
    </div>
  );
}
