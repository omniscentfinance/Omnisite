import { useState, useEffect } from "react";
import { CheckCircle2, Circle, PlayCircle, LineChart, Sparkles, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getWatchedVideoIds } from "@/lib/courses";
import { useAuth } from "@/context/AuthContext";

function dismissKey(userId) {
  return `onboarding_dismissed_${userId}`;
}

async function hasAnyTrade(userId) {
  const { count } = await supabase
    .from("trades")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return (count ?? 0) > 0;
}

export default function OnboardingChecklist({ onUpgrade }) {
  const { user, hasPaidPlan } = useAuth();
  const [loading, setLoading] = useState(true);
  const [watchedVideo, setWatchedVideo] = useState(false);
  const [loggedTrade, setLoggedTrade] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!user) return;
    setDismissed(localStorage.getItem(dismissKey(user.id)) === "1");
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [watchedIds, tradeDone] = await Promise.all([
        getWatchedVideoIds(),
        hasAnyTrade(user.id),
      ]);
      if (cancelled) return;
      setWatchedVideo(watchedIds.size > 0);
      setLoggedTrade(tradeDone);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || dismissed) return null;

  const unlockedAdvanced = hasPaidPlan();
  const steps = [
    {
      key: "video",
      done: watchedVideo,
      icon: PlayCircle,
      title: "Guarda la prima lezione",
      desc: "Inizia il Corso Base: le basi per muovere i primi passi.",
      cta: "Vai al corso",
      onClick: () => { window.location.hash = "#/dashboard/corso-base"; },
    },
    {
      key: "trade",
      done: loggedTrade,
      icon: LineChart,
      title: "Registra il tuo primo trade",
      desc: "Apri il Trading Journal e traccia un'operazione.",
      cta: "Apri il journal",
      onClick: () => { window.location.hash = "#/dashboard/trading-journal"; },
    },
    {
      key: "advanced",
      done: unlockedAdvanced,
      icon: Sparkles,
      title: "Sblocca i servizi Advanced",
      desc: "Forum, indicatori, bot e live trading.",
      cta: "Scopri i piani",
      onClick: () => onUpgrade?.(),
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);
  const allDone = doneCount === steps.length;

  const dismiss = () => {
    if (user) localStorage.setItem(dismissKey(user.id), "1");
    setDismissed(true);
  };

  return (
    <div className="mb-8 rounded-2xl border border-[#1E1E2A] bg-[#111113] p-5 sm:p-6 relative">
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 text-slate-600 hover:text-slate-300 transition-colors"
        aria-label="Chiudi"
      >
        <X size={16} />
      </button>

      <div className="mb-4 pr-6">
        <h2 className="text-base font-semibold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Primi passi {allDone ? "completati 🎉" : ""}
        </h2>
        <p className="text-xs text-slate-500">{doneCount}/{steps.length} completati</p>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/5 mt-2">
          <div
            className="h-full bg-violet-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((s) => (
          <button
            key={s.key}
            onClick={s.done ? undefined : s.onClick}
            disabled={s.done}
            className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
              s.done
                ? "border-emerald-500/20 bg-emerald-500/5 cursor-default"
                : "border-[#1E1E2A] hover:border-violet-500/40 hover:bg-violet-500/5"
            }`}
          >
            {s.done ? (
              <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-slate-600 flex-shrink-0" />
            )}
            <s.icon size={18} className={`flex-shrink-0 ${s.done ? "text-emerald-400/70" : "text-violet-400"}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${s.done ? "text-slate-400 line-through" : "text-white"}`}>
                {s.title}
              </p>
              <p className="text-xs text-slate-500 truncate">{s.desc}</p>
            </div>
            {!s.done && (
              <span className="flex-shrink-0 text-xs font-semibold text-violet-400">{s.cta} →</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
