import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, BookMarked, BarChart2, Bot, CalendarDays, Lock, LogOut, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, free: true, end: true },
  { to: "/dashboard/trading-journal", label: "Trading Journal", icon: BarChart2, free: true },
  { to: "/dashboard/corso-base", label: "Corso Base", icon: BookMarked, free: true },
  { to: "/dashboard/corsi-privati", label: "Corsi Privati", icon: BookOpen, free: false },
  { to: "/dashboard/indicatori-bot", label: "Indicatori & Bot", icon: Bot, free: false },
  { to: "/dashboard/calendario", label: "Prenota Sessione", icon: CalendarDays, mentorOnly: true },
];

export default function Sidebar({ onClose }) {
  const { profile, signOut, isPlanActive, isMentorshipActive } = useAuth();
  const active = isPlanActive();
  const mentor = isMentorshipActive();

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
          active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
        }`}>
          {active ? `Piano ${profile?.plan}` : "Piano Free"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, free, end, mentorOnly }) => {
          if (mentorOnly && !mentor) return null; // visibile solo ai Master Mentor
          const locked = !free && !mentorOnly && !active;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  locked
                    ? "text-slate-600 cursor-not-allowed pointer-events-none"
                    : isActive
                    ? "bg-violet-500/10 text-violet-300 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {locked && <Lock size={13} className="text-slate-600" />}
            </NavLink>
          );
        })}
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
