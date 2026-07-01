import { useState, useEffect, useCallback, useRef } from "react";
import { Hash, Plus, Send, Trash2, Loader2, X, Lock, ImagePlus, MessagesSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/journal";
import { useAuth } from "@/context/AuthContext";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "ora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h fa`;
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Forum() {
  const { user, profile, isAdmin } = useAuth();
  const admin = isAdmin();
  const [channels, setChannels] = useState([]);
  const [active, setActive] = useState(null);
  const [loadingCh, setLoadingCh] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadChannels = useCallback(async () => {
    setLoadingCh(true);
    const { data } = await supabase.from("forum_channels").select("*").order("position").order("created_at");
    setChannels(data ?? []);
    setActive((cur) => cur || (data && data[0]) || null);
    setLoadingCh(false);
  }, []);
  useEffect(() => { loadChannels(); }, [loadChannels]);

  const canPost = active && (!active.admin_only_post || admin);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <MessagesSquare size={22} className="text-violet-400" /> Forum
        </h1>
        <p className="text-slate-400 text-sm">Confrontati con la community e leggi le analisi del team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Canali */}
        <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-3">
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Canali</span>
            {admin && <button onClick={() => setCreating(true)} className="text-violet-400 hover:text-violet-300"><Plus size={16} /></button>}
          </div>
          {loadingCh ? (
            <div className="py-6 flex justify-center"><Loader2 className="animate-spin text-violet-400" size={18} /></div>
          ) : channels.length === 0 ? (
            <p className="text-sm text-slate-600 px-2 py-4">Nessun canale.</p>
          ) : (
            <div className="space-y-0.5">
              {channels.map((c) => (
                <button key={c.id} onClick={() => setActive(c)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                    active?.id === c.id ? "bg-violet-500/10 text-violet-300 font-medium" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}>
                  {c.admin_only_post ? <Lock size={13} className="flex-shrink-0" /> : <Hash size={14} className="flex-shrink-0" />}
                  <span className="flex-1 text-left truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl flex flex-col min-h-[460px] max-h-[70vh]">
          {active ? (
            <ChannelChat channel={active} canPost={canPost} admin={admin} user={user} profile={profile} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500">Seleziona un canale.</div>
          )}
        </div>
      </div>

      {creating && <ChannelModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); loadChannels(); }} />}
    </div>
  );
}

function ChannelChat({ channel, canPost, admin, user, profile }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("forum_messages").select("*").eq("channel_id", channel.id).order("created_at");
    setMessages(data ?? []);
    setLoading(false);
  }, [channel.id]);
  useEffect(() => { load(); }, [load]);

  // Realtime (se abilitato sulla tabella)
  useEffect(() => {
    const sub = supabase.channel(`forum-${channel.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "forum_messages", filter: `channel_id=eq.${channel.id}` },
        (payload) => setMessages((m) => m.some((x) => x.id === payload.new.id) ? m : [...m, payload.new]))
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [channel.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const onFile = (e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } };

  const send = async () => {
    if ((!text.trim() && !file) || sending) return;
    setSending(true);
    try {
      let image_url = null;
      if (file) image_url = await uploadImage(file);
      await supabase.from("forum_messages").insert({
        channel_id: channel.id, user_id: user.id,
        author_name: profile?.full_name || "Utente", body: text.trim(), image_url,
      });
      setText(""); setFile(null); setPreview(null);
      load();
    } finally { setSending(false); }
  };

  const del = async (id) => { await supabase.from("forum_messages").delete().eq("id", id); load(); };

  return (
    <>
      {/* Header canale */}
      <div className="px-4 py-3 border-b border-[#1E1E2A] flex items-center gap-2">
        {channel.admin_only_post ? <Lock size={15} className="text-violet-400" /> : <Hash size={16} className="text-violet-400" />}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{channel.name}</p>
          {channel.description && <p className="text-xs text-slate-500 truncate">{channel.description}</p>}
        </div>
      </div>

      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-violet-400" size={20} /></div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            {channel.admin_only_post ? "Nessuna analisi ancora pubblicata." : "Nessun messaggio. Scrivi il primo!"}
          </div>
        ) : messages.map((m) => (
          <div key={m.id} className="flex gap-3 group">
            <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-violet-300">
              {(m.author_name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{m.author_name || "Utente"}</span>
                <span className="text-xs text-slate-600">{timeAgo(m.created_at)}</span>
              </div>
              {m.body && <p className="text-sm text-slate-300 whitespace-pre-line break-words">{m.body}</p>}
              {m.image_url && <img src={m.image_url} alt="" className="mt-2 rounded-lg max-h-72 border border-[#1E1E2A]" />}
            </div>
            {(admin || m.user_id === user?.id) && (
              <button onClick={() => del(m.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 flex-shrink-0"><Trash2 size={13} /></button>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      {canPost ? (
        <div className="px-3 py-3 border-t border-[#1E1E2A]">
          {preview && (
            <div className="relative inline-block mb-2">
              <img src={preview} alt="" className="h-16 rounded-lg border border-[#1E1E2A]" />
              <button onClick={() => { setFile(null); setPreview(null); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"><X size={11} /></button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="text-slate-500 hover:text-violet-400 flex-shrink-0"><ImagePlus size={18} /></button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={channel.admin_only_post ? "Pubblica un'analisi..." : "Scrivi un messaggio..."}
              className="flex-1 bg-[#09090B] border border-[#1E1E2A] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
            />
            <button onClick={send} disabled={sending || (!text.trim() && !file)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex-shrink-0">
              {sending ? <Loader2 size={15} className="animate-spin text-white" /> : <Send size={15} className="text-white" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-[#1E1E2A] text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Lock size={12} /> Solo il team può pubblicare in questo canale.
        </div>
      )}
    </>
  );
}

function ChannelModal({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [adminOnly, setAdminOnly] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await supabase.from("forum_channels").insert({ name: name.trim(), description: description.trim(), admin_only_post: adminOnly });
      onSaved();
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111113] border border-[#1E1E2A] rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={18} /></button>
        <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Nuovo canale</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (es. Analisi, Generale, Forex...)" className={`${inputCls} mb-3`} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Descrizione (opzionale)" className={`${inputCls} resize-none mb-3`} />
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer mb-4">
          <input type="checkbox" checked={adminOnly} onChange={(e) => setAdminOnly(e.target.checked)} className="accent-violet-500" />
          Solo il team può pubblicare (gli studenti leggono soltanto)
        </label>
        <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium">
          {saving ? "Creazione..." : "Crea canale"}
        </button>
      </div>
    </div>
  );
}
