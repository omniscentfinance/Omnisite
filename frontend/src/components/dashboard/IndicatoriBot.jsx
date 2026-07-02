import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Plus, Pencil, Trash2, Loader2, X, TrendingUp, Bot as BotIcon, FileText, Paperclip, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listResources, createResource, updateResource, deleteResource } from "@/lib/resources";

const CATEGORIES = {
  indicatori: { label: "Indicatori", icon: TrendingUp, desc: "I nostri indicatori proprietari: guide, file e configurazioni." },
  bot: { label: "BOT", icon: BotIcon, desc: "I nostri bot di trading: guide, file e configurazioni." },
};

export default function IndicatoriBot() {
  const [category, setCategory] = useState(null); // "indicatori" | "bot" | null

  if (category) {
    return <CategoryView category={category} onBack={() => setCategory(null)} />;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Indicatori & Bot
        </h1>
        <p className="text-slate-400 text-sm">Scegli una sezione per vedere i contenuti disponibili.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className="group text-left bg-[#111113] border border-[#1E1E2A] rounded-2xl p-8 hover:border-violet-500/40 hover:bg-violet-500/[0.03] transition-colors"
          >
            <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-5 group-hover:bg-violet-500/15 transition-colors">
              <c.icon size={26} className="text-violet-400" />
            </div>
            <p className="text-xl font-bold text-white mb-1.5" style={{ fontFamily: "'Outfit', sans-serif" }}>{c.label}</p>
            <p className="text-sm text-slate-500">{c.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function CategoryView({ category, onBack }) {
  const { isAdmin } = useAuth();
  const admin = isAdmin();
  const meta = CATEGORIES[category];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // {} per nuovo, item per modifica

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await listResources(category)); } catch { setItems([]); }
    setLoading(false);
  }, [category]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4">
        <ChevronLeft size={16} /> Indicatori & Bot
      </button>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <meta.icon size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{meta.label}</h1>
            <p className="text-slate-500 text-sm">{meta.desc}</p>
          </div>
        </div>
        {admin && (
          <button onClick={() => setEditing({})} className="flex items-center gap-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md flex-shrink-0">
            <Plus size={15} /> Aggiungi
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-violet-400" size={22} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">Nessun contenuto disponibile per ora.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="group bg-[#111113] border border-[#1E1E2A] rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{it.title}</p>
                {admin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => setEditing(it)} className="text-slate-500 hover:text-white"><Pencil size={14} /></button>
                    <button onClick={async () => { if (window.confirm("Eliminare questo contenuto?")) { await deleteResource(it.id); load(); } }} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              {it.content && <p className="text-sm text-slate-400 mt-2 whitespace-pre-line">{it.content}</p>}
              {it.file_url && (
                <a href={it.file_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm text-violet-400 hover:text-violet-300 border border-violet-500/30 rounded-lg px-3 py-1.5">
                  <Download size={14} /> {it.file_name || "Scarica file"}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ResourceModal
          category={category}
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ResourceModal({ category, item, onClose, onSaved }) {
  const [title, setTitle] = useState(item.title || "");
  const [content, setContent] = useState(item.content || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const isNew = !item.id;

  const save = async () => {
    if (!title.trim()) { setErr("Inserisci un titolo."); return; }
    setSaving(true); setErr("");
    try {
      if (isNew) {
        await createResource({ category, title: title.trim(), content: content.trim(), file });
      } else {
        await updateResource(item.id, { title: title.trim(), content: content.trim() });
      }
      onSaved();
    } catch {
      setErr("Errore nel salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111113] border border-[#1E1E2A] rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={18} /></button>
        <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {isNew ? "Nuovo contenuto" : "Modifica contenuto"}
        </h2>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titolo"
          className="w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 mb-3" />

        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Testo / descrizione (opzionale)"
          className="w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 resize-none mb-3" />

        {isNew && (
          <label className="flex items-center gap-2 text-sm text-slate-400 border border-dashed border-[#1E1E2A] rounded-md px-3 py-2.5 mb-3 cursor-pointer hover:border-violet-500/40">
            <Paperclip size={14} className="flex-shrink-0" />
            <span className="truncate">{file ? file.name : "Allega un file (opzionale)"}</span>
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        )}
        {!isNew && item.file_url && (
          <p className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <FileText size={13} /> File allegato: {item.file_name} (non modificabile qui — elimina e ricrea per sostituirlo)
          </p>
        )}

        {err && <p className="text-sm text-red-400 mb-3">{err}</p>}

        <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium">
          {saving ? "Salvataggio..." : "Salva"}
        </button>
      </div>
    </div>
  );
}
