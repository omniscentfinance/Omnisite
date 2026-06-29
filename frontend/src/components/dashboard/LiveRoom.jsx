import { useState, useEffect, useCallback } from "react";
import { Radio, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// Converte il link della live in un URL embeddabile (YouTube / Twitch / Vimeo).
function toEmbed(url) {
  if (!url) return null;
  const u = url.trim();
  // YouTube
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
  // YouTube canale live (es. youtube.com/@nome/live senza id) -> non embeddabile direttamente
  // Twitch
  m = u.match(/twitch\.tv\/([A-Za-z0-9_]+)/);
  if (m) {
    const host = typeof window !== "undefined" ? window.location.hostname : "omniscent.space";
    return `https://player.twitch.tv/?channel=${m[1]}&parent=${host}&parent=omniscent.space&autoplay=true`;
  }
  // Vimeo event
  m = u.match(/vimeo\.com\/event\/(\d+)/);
  if (m) return `https://vimeo.com/event/${m[1]}/embed`;
  m = u.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return null;
}

export default function LiveRoom() {
  const navigate = useNavigate();
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("live_session").select("*").eq("id", 1).single();
      setLive(data);
    } catch { setLive(null); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const embed = toEmbed(live?.join_url);

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft size={15} /> Torna alla dashboard
      </button>

      <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <Radio size={20} className="text-red-500" /> {live?.title || "Live"}
      </h1>
      <p className="text-slate-400 text-sm mb-5">Trasmissione in diretta — riservata agli abbonati.</p>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-violet-400" size={22} /></div>
      ) : embed ? (
        <div className="rounded-2xl overflow-hidden border border-[#1E1E2A] bg-black aspect-video ring-1 ring-violet-500/30">
          <iframe
            src={embed}
            title="Live"
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1E1E2A] bg-[#111113] p-10 text-center">
          <Radio size={26} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium mb-1">Nessuna diretta attiva al momento</p>
          <p className="text-sm text-slate-500">
            {live?.join_url
              ? "Il link impostato non è incorporabile. Usa un link YouTube, Twitch o Vimeo."
              : "L'amministratore non ha ancora impostato la live."}
          </p>
        </div>
      )}
    </div>
  );
}
