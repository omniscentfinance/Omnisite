import { useState, useEffect } from "react";
import { Send, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { listComments, createComment, deleteComment } from "@/lib/courses";
import { useAuth } from "@/context/AuthContext";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "ora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h fa`;
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

export default function Comments({ videoId }) {
  const { user, profile, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setComments(await listComments(videoId)); } catch { setComments([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [videoId]); // eslint-disable-line

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await createComment({ video_id: videoId, body: text.trim(), author_name: profile?.full_name || "Studente" });
      setText("");
      await load();
    } finally { setSending(false); }
  };

  return (
    <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-5">
      <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <MessageSquare size={16} className="text-violet-400" /> Commenti
      </h3>

      <div className="flex gap-2 mb-5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Scrivi un commento..."
          className="flex-1 px-3 py-2 rounded-lg border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
        />
        <button onClick={submit} disabled={!text.trim() || sending} className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex-shrink-0">
          {sending ? <Loader2 size={15} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-violet-400" /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-500">Ancora nessun commento. Scrivi il primo!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/15 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-violet-300">
                {(c.author_name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{c.author_name || "Studente"}</span>
                  <span className="text-xs text-slate-600">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-slate-300 break-words">{c.body}</p>
              </div>
              {(isAdmin() || c.user_id === user?.id) && (
                <button onClick={async () => { await deleteComment(c.id); load(); }} className="text-slate-600 hover:text-red-400 flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
