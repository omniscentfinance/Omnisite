import { useState, useEffect, useCallback } from "react";
import { Radio, Loader2, ArrowLeft, Video, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// Converte il link della live in un URL embeddabile (YouTube / Twitch / Vimeo / Jitsi).
function toEmbed(url) {
  if (!url) return null;
  const u = url.trim();
  // YouTube
  let m = u.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
  // Twitch
  m = u.match(/twitch\.tv\/([A-Za-z0-9_]+)/);
  if (m) {
    const host = typeof window !== "undefined" ? window.location.hostname : "omniscent.space";
    return `https://player.twitch.tv/?channel=${m[1]}&parent=${host}&parent=omniscent.space&autoplay=true`;
  }
  // Vimeo
  m = u.match(/vimeo\.com\/event\/(\d+)/);
  if (m) return `https://vimeo.com/event/${m[1]}/embed`;
  m = u.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  // Jitsi (videocall interattiva di gruppo, incorporabile)
  if (/jit\.si\//.test(u)) return u;
  return null;
}

// True per i link che NON si possono incorporare (Meet, Discord, ecc.):
// vanno aperti esternamente.
function isVideoCallLink(url) {
  return /meet\.google\.com|discord\.(gg|com)|zoom\.us|teams\.microsoft/.test(url || "");
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
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; camera; microphone; display-capture"
            allowFullScreen
          />
        </div>
      ) : isVideoCallLink(live?.join_url) ? (
        <div className="rounded-2xl border border-violet-500/30 bg-[#111113] p-10 text-center ring-1 ring-violet-500/20">
          <Video size={26} className="text-violet-400 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Videocall di gruppo interattiva</p>
          <p className="text-sm text-slate-500 mb-5">Questa diretta usa una videocall che si apre in una nuova finestra.</p>
          <a
            href={live.join_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            Entra nella videocall <ExternalLink size={15} />
          </a>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1E1E2A] bg-[#111113] p-10 text-center">
          <Radio size={26} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium mb-1">Nessuna diretta attiva al momento</p>
          <p className="text-sm text-slate-500">
            {live?.join_url
              ? "Il link impostato non è riconosciuto. Usa YouTube, Twitch, Vimeo, Jitsi o un link Meet/Discord."
              : "L'amministratore non ha ancora impostato la live."}
          </p>
        </div>
      )}
    </div>
  );
}
