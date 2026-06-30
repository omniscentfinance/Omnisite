import { useState, useEffect, useCallback } from "react";
import { Radio, Loader2, ExternalLink, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function isExternalCall(url) {
  return /meet\.google\.com|discord\.(gg|com)|zoom\.us|teams\.microsoft/.test(url || "");
}
function isEmbeddable(url) {
  return /youtube\.com|youtu\.be|twitch\.tv|vimeo\.com|jit\.si/.test(url || "");
}

function Countdown({ startsAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!startsAt) return null;
  const diff = new Date(startsAt).getTime() - now;
  if (diff <= 0 && now - new Date(startsAt).getTime() < 3 * 3600 * 1000) {
    return <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE ORA</span>;
  }
  const s = Math.max(0, Math.floor(diff / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return <span className="text-xs text-violet-300 font-medium">tra {d > 0 ? `${d}g ` : ""}{h}h {m}m</span>;
}

export default function LiveTrading() {
  const navigate = useNavigate();
  const [lives, setLives] = useState([]);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: fn }, { data: manual }] = await Promise.all([
        supabase.functions.invoke("next-live"),
        supabase.from("live_session").select("cover_url").eq("id", 1).single(),
      ]);
      setLives(fn?.lives || []);
      setCover(manual?.cover_url || null);
    } catch { setLives([]); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openLive = (live) => {
    if (isExternalCall(live.join_url)) { window.open(live.join_url, "_blank", "noopener"); return; }
    if (isEmbeddable(live.join_url)) {
      navigate(`/dashboard/live?u=${encodeURIComponent(live.join_url)}&t=${encodeURIComponent(live.title)}`);
      return;
    }
    if (live.join_url) window.open(live.join_url, "_blank", "noopener");
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <Radio size={20} className="text-red-500" /> Live Trading
        </h1>
        <p className="text-slate-400 text-sm">Tutte le live programmate. Clicca per partecipare.</p>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-violet-400" size={22} /></div>
      ) : lives.length === 0 ? (
        <div className="rounded-2xl border border-[#1E1E2A] bg-[#111113] p-10 text-center">
          <Radio size={26} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium mb-1">Nessuna live programmata</p>
          <p className="text-sm text-slate-500">Le nuove live appariranno qui automaticamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lives.map((live, i) => {
            const d = live.starts_at ? new Date(live.starts_at) : null;
            const external = isExternalCall(live.join_url);
            return (
              <div
                key={i}
                onClick={() => openLive(live)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer ring-1 ring-violet-500/30 hover:ring-violet-500/60 shadow-[0_0_30px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_45px_-8px_rgba(124,58,237,0.8)] transition-all"
              >
                {cover ? <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-violet-700 to-fuchsia-700" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
                <div className="relative p-4 min-h-[170px] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <Countdown startsAt={live.starts_at} />
                    {d && <span className="text-xs text-white/70 font-medium">{d.getDate()} {MONTHS[d.getMonth()]} · {String(d.getHours()).padStart(2, "0")}:{String(d.getMinutes()).padStart(2, "0")}</span>}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 drop-shadow" style={{ fontFamily: "'Outfit', sans-serif" }}>{live.title}</h3>
                    <span className="inline-flex items-center gap-1.5 bg-white text-black group-hover:bg-violet-100 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                      Partecipa {external ? <ExternalLink size={13} /> : <Video size={13} />}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
