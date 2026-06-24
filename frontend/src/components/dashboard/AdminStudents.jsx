import { useState, useEffect } from "react";
import { Loader2, Search, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getWatchedCountsByUser } from "@/lib/courses";

const PLAN_BADGE = {
  master_plus: { label: "Master +", cls: "bg-violet-500/15 text-violet-300" },
  advanced: { label: "Advanced", cls: "bg-emerald-500/10 text-emerald-400" },
  mentorship: { label: "Master Mentor", cls: "bg-sky-500/10 text-sky-400" },
  free: { label: "Free", cls: "bg-slate-800 text-slate-400" },
};

function computePlan(p) {
  if (p.is_admin) return "master_plus";
  const adv = p.has_advanced === true;
  const ment = !!p.mentorship_expires_at && new Date(p.mentorship_expires_at) > new Date();
  if (adv && ment) return "master_plus";
  if (ment) return "mentorship";
  if (adv) return "advanced";
  return "free";
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [watchedCounts, setWatchedCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data, error }, counts] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, has_advanced, mentorship_expires_at, is_admin, created_at")
          .order("created_at", { ascending: false }),
        getWatchedCountsByUser(),
      ]);
      if (!error) setStudents(data ?? []);
      setWatchedCounts(counts);
      setLoading(false);
    })();
  }, []);

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    return (s.full_name || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
  });

  const stats = {
    total: students.length,
    advanced: students.filter((s) => computePlan(s) === "advanced").length,
    mentorship: students.filter((s) => computePlan(s) === "mentorship").length,
    masterPlus: students.filter((s) => computePlan(s) === "master_plus").length,
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Studenti
        </h1>
        <p className="text-slate-400 text-sm">Tutti gli account registrati e i relativi abbonamenti.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Totale", value: stats.total },
          { label: "Advanced", value: stats.advanced },
          { label: "Master Mentor", value: stats.mentorship },
          { label: "Master +", value: stats.masterPlus },
        ].map((s) => (
          <div key={s.label} className="bg-[#111113] border border-[#1E1E2A] rounded-xl px-4 py-3">
            <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome o email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#1E1E2A] bg-[#111113] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/40"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="animate-spin text-violet-400" size={22} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <Users size={22} className="text-slate-600 mb-2" />
            <p className="text-sm text-slate-500">Nessuno studente trovato.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E2A] text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Piano</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Video visti</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mentorship fino al</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Registrato</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const plan = computePlan(s);
                  const badge = PLAN_BADGE[plan];
                  return (
                    <tr key={s.id} className="border-b border-[#1E1E2A]/50 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white">{s.full_name || "—"}</td>
                      <td className="px-4 py-3 text-slate-400">{s.email || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{watchedCounts[s.id] || 0}</td>
                      <td className="px-4 py-3 text-slate-400">{plan === "mentorship" || plan === "master_plus" ? formatDate(s.mentorship_expires_at) : "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(s.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
