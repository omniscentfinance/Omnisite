import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Plus, Pencil, Trash2, PlayCircle, ListVideo, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  listPlaylists, createPlaylist, updatePlaylist, deletePlaylist,
  listVideos, createVideo, updateVideo, deleteVideo, parseYouTubeId,
} from "@/lib/courses";
import Quiz from "./Quiz";
import Comments from "./Comments";

export default function CoursesSection() {
  const { isAdmin } = useAuth();
  const admin = isAdmin();
  const [view, setView] = useState({ level: "playlists" }); // playlists | playlist | video

  if (view.level === "video") {
    return <VideoView video={view.video} playlist={view.playlist} admin={admin} onBack={() => setView({ level: "playlist", playlist: view.playlist })} />;
  }
  if (view.level === "playlist") {
    return <PlaylistView playlist={view.playlist} admin={admin}
      onBack={() => setView({ level: "playlists" })}
      onOpenVideo={(video) => setView({ level: "video", video, playlist: view.playlist })} />;
  }
  return <PlaylistsView admin={admin} onOpen={(playlist) => setView({ level: "playlist", playlist })} />;
}

/* ---------- Lista playlist ---------- */
function PlaylistsView({ admin, onOpen }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // playlist obj or {} for new

  const load = useCallback(async () => {
    setLoading(true);
    try { setPlaylists(await listPlaylists()); } catch { setPlaylists([]); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Corsi Privati</h1>
          <p className="text-slate-400 text-sm">Le tue playlist formative.</p>
        </div>
        {admin && (
          <button onClick={() => setEditing({})} className="flex items-center gap-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md">
            <Plus size={15} /> Nuova playlist
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-violet-400" size={22} /></div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">Nessuna playlist disponibile.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {playlists.map((p) => (
            <div key={p.id} className="group bg-[#111113] border border-[#1E1E2A] rounded-xl p-5 hover:border-violet-500/40 transition-colors cursor-pointer"
              onClick={() => onOpen(p)}>
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3">
                  <ListVideo size={18} className="text-violet-400" />
                </div>
                {admin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setEditing(p); }} className="text-slate-500 hover:text-white"><Pencil size={14} /></button>
                    <button onClick={async (e) => { e.stopPropagation(); if (confirm("Eliminare la playlist e tutti i suoi video?")) { await deletePlaylist(p.id); load(); } }} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <p className="text-base font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{p.title}</p>
              {p.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
            </div>
          ))}
        </div>
      )}

      {editing && <PlaylistModal playlist={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function PlaylistModal({ playlist, onClose, onSaved }) {
  const [title, setTitle] = useState(playlist.title || "");
  const [description, setDescription] = useState(playlist.description || "");
  const [saving, setSaving] = useState(false);
  const isNew = !playlist.id;

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (isNew) await createPlaylist({ title: title.trim(), description: description.trim() });
      else await updatePlaylist(playlist.id, { title: title.trim(), description: description.trim() });
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <Modal title={isNew ? "Nuova playlist" : "Modifica playlist"} onClose={onClose}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo"
        className="w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 mb-3" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Descrizione (opzionale)"
        className="w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 resize-none mb-4" />
      <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium">
        {saving ? "Salvataggio..." : "Salva"}
      </button>
    </Modal>
  );
}

/* ---------- Dettaglio playlist (lista video) ---------- */
function PlaylistView({ playlist, admin, onBack, onOpenVideo }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setVideos(await listVideos(playlist.id)); } catch { setVideos([]); }
    setLoading(false);
  }, [playlist.id]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4"><ChevronLeft size={16} /> Tutte le playlist</button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{playlist.title}</h1>
          {playlist.description && <p className="text-slate-400 text-sm">{playlist.description}</p>}
        </div>
        {admin && (
          <button onClick={() => setEditing({})} className="flex items-center gap-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md flex-shrink-0">
            <Plus size={15} /> Nuovo video
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-violet-400" size={22} /></div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">Nessun video in questa playlist.</div>
      ) : (
        <div className="space-y-2">
          {videos.map((v, i) => (
            <div key={v.id} className="group flex items-center gap-3 bg-[#111113] border border-[#1E1E2A] rounded-xl p-3 hover:border-violet-500/40 transition-colors cursor-pointer"
              onClick={() => onOpenVideo(v)}>
              <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-[#09090B] flex-shrink-0">
                <img src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                <PlayCircle size={22} className="absolute inset-0 m-auto text-white/90" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{i + 1}. {v.title}</p>
                {v.description && <p className="text-xs text-slate-500 line-clamp-1">{v.description}</p>}
              </div>
              {admin && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); setEditing(v); }} className="text-slate-500 hover:text-white"><Pencil size={14} /></button>
                  <button onClick={async (e) => { e.stopPropagation(); if (confirm("Eliminare il video?")) { await deleteVideo(v.id); load(); } }} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && <VideoModal playlistId={playlist.id} video={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function VideoModal({ playlistId, video, onClose, onSaved }) {
  const [title, setTitle] = useState(video.title || "");
  const [description, setDescription] = useState(video.description || "");
  const [url, setUrl] = useState(video.youtube_id ? `https://youtu.be/${video.youtube_id}` : "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const isNew = !video.id;

  const save = async () => {
    const ytid = parseYouTubeId(url);
    if (!title.trim()) { setErr("Inserisci un titolo."); return; }
    if (!ytid) { setErr("Link YouTube non valido."); return; }
    setSaving(true); setErr("");
    try {
      if (isNew) await createVideo({ playlist_id: playlistId, title: title.trim(), description: description.trim(), youtube_id: ytid });
      else await updateVideo(video.id, { title: title.trim(), description: description.trim(), youtube_id: ytid });
      onSaved();
    } catch { setErr("Errore nel salvataggio."); } finally { setSaving(false); }
  };

  return (
    <Modal title={isNew ? "Nuovo video" : "Modifica video"} onClose={onClose}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo del video"
        className="w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 mb-3" />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link YouTube (es. https://youtu.be/...)"
        className="w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 mb-3" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Descrizione (opzionale)"
        className="w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 resize-none mb-3" />
      {err && <p className="text-sm text-red-400 mb-3">{err}</p>}
      <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium">
        {saving ? "Salvataggio..." : "Salva"}
      </button>
    </Modal>
  );
}

/* ---------- Player video + quiz + commenti ---------- */
function VideoView({ video, admin, onBack }) {
  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4"><ChevronLeft size={16} /> Torna alla playlist</button>

      <div className="aspect-video rounded-2xl overflow-hidden border border-[#1E1E2A] mb-4 bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtube_id}`}
          title={video.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{video.title}</h1>
      {video.description && <p className="text-slate-400 text-sm mb-6 whitespace-pre-line">{video.description}</p>}

      <div className="space-y-6">
        <Quiz videoId={video.id} isAdmin={admin} />
        <Comments videoId={video.id} />
      </div>
    </div>
  );
}

/* ---------- Modal generico ---------- */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111113] border border-[#1E1E2A] rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={18} /></button>
        <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
