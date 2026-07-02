import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, BookMarked, BarChart2, Bot, CalendarDays, CalendarClock, Radio, MessagesSquare, Users, Lock, LogOut, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useForumUnread } from "@/lib/forumUnread";

const DASHBOARD_ITEM = { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, free: true, end: true };

const NAV = [
  // Free access
  { to: "/dashboard/corso-base", label: "Corso Base", icon: BookMarked, free: true, group: "free" },
  { to: "/dashboard/trading-journal", label: "Trading Journal", icon: BarChart2, free: true, group: "free" },
  { to: "/dashboard/news", label: "News Macro", icon: CalendarClock, free: true, group: "free" },
  // Advanced (tutto tranne mentorship)
  { to: "/dashboard/corsi-privati", label: "Corsi Privati", icon: BookOpen, free: false, group: "advanced" },
  { to: "/dashboard/indicatori-bot", label: "Indicatori & Bot", icon: Bot, free: false, group: "advanced" },
  { to: "/dashboard/forum", label: "Forum", icon: MessagesSquare, paidOnly: true, group: "advanced" },
  // Master + (mentorship private)
  { to: "/dashboard/calendario", label: "Prenota Sessione", icon: CalendarDays, mentorOnly: true, group: "master" },
];

const GROUPS = [
  { key: "free", label: "Free access" },
  { key: "advanced", label: "Advanced" },
  { key: "master", label: "Master +" },
];

const ADMIN_ITEM = { to: "/dashboard/studenti", label: "Studenti", icon: Users, adminOnly: true };
const LIVE_ITEM = { to: "/dashboard/live-trading", label: "Live Trading", icon: Radio, free: false, glow: true, spacer: true };

const PLAN_LABELS = {
  master_plus: "Master +",
  advanced: "Advanced",
  mentorship: "Master Mentor",
  free: "Free",
};

export default function Sidebar({ onClose }) {
  const { profile, signOut, hasAdvanced, isMentorshipActive, isAdmin, effectivePlan, hasPaidPlan } = useAuth();
  const active = hasAdvanced();
  const mentor = isMentorshipActive();
  const admin = isAdmin();
  const paid = hasPaidPlan();
  const plan = effectivePlan();
  const { hasUnread: forumUnread } = useForumUnread();

  const renderItem = ({ to, label, icon: Icon, free, end, mentorOnly, adminOnly, paidOnly, glow, spacer }) => {
    const locked = paidOnly ? !paid : (!free && !mentorOnly && !adminOnly && !active);
    const showUnreadDot = to === "/dashboard/forum" && !locked && forumUnread;
    const link = (
      <NavLink
        to={to}
        end={end}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${glow ? "bg-[#111113]" : ""} ${
            locked
              ? `text-slate-500 cursor-not-allowed ${glow ? "" : "pointer-events-none"}`
              : isActive
              ? "bg-violet-500/10 text-violet-300 font-medium"
              : glow ? "text-white hover:text-violet-200" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`
        }
      >
        <span className="relative flex-shrink-0">
          <Icon size={16} className={glow ? "text-red-500" : ""} />
          {showUnreadDot && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-400 ring-2 ring-[#111113]" />
          )}
        </span>
        <span className="flex-1 font-medium">{label}</span>
        {locked && <Lock size={13} className="text-slate-500" />}
      </NavLink>
    );
    if (glow) return <div key={to} className={`live-glow-wrap ${spacer ? "mt-4" : ""}`}>{link}</div>;
    return <div key={to}>{link}</div>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#1E1E2A]">
        <span className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
          OMNISCENT<span className="text-violet-400">®</span>
        </span>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-[#1E1E2A]">
        <p className="text-sm font-medium text-white truncate">{profile?.full_name || "Utente"}</p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
          plan === "master_plus"
            ? "bg-violet-500/15 text-violet-300"
            : plan !== "free"
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-slate-800 text-slate-400"
        }`}>
          {`Piano ${PLAN_LABELS[plan]}`}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {renderItem(DASHBOARD_ITEM)}

        {GROUPS.map((g) => {
          const items = NAV.filter((i) => i.group === g.key && !(i.mentorOnly && !mentor) && !(i.adminOnly && !admin));
          if (items.length === 0) return null;
          return (
            <div key={g.key} className="pt-4">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">{g.label}</p>
              {items.map(renderItem)}
            </div>
          );
        })}

        {admin && <div className="pt-4">{renderItem(ADMIN_ITEM)}</div>}

        {renderItem(LIVE_ITEM)}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#1E1E2A]">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Esci
        </button>
      </div>
    </div>
  );
}
