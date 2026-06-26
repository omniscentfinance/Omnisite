import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Menu, BookOpen, BookMarked, BarChart2, Bot, CalendarClock, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";
import ServiceCard from "@/components/dashboard/ServiceCard";
import PaymentModal from "@/components/dashboard/PaymentModal";
import BookingCalendar from "@/components/dashboard/BookingCalendar";
import AdminStudents from "@/components/dashboard/AdminStudents";
import CoursesSection from "@/components/dashboard/courses/CoursesSection";
import TradingJournal from "@/components/dashboard/journal/TradingJournal";
import MacroNews from "@/components/dashboard/MacroNews";

const SERVICES = [
  { id: "corso-base", label: "Corso Base", icon: BookMarked, free: true, to: "/dashboard/corso-base" },
  { id: "trading-journal", label: "Trading Journal", icon: BarChart2, free: true, to: "/dashboard/trading-journal" },
  { id: "news", label: "News Macro", icon: CalendarClock, free: true, to: "/dashboard/news" },
  { id: "corsi-privati", label: "Corsi Privati", icon: BookOpen, free: false, to: "/dashboard/corsi-privati" },
  { id: "indicatori-bot", label: "Indicatori & Bot", icon: Bot, free: false, to: "/dashboard/indicatori-bot" },
];

function DashboardHome({ onUpgrade }) {
  const { profile, hasAdvanced } = useAuth();
  const active = hasAdvanced();
  const firstName = profile?.full_name?.split(" ")[0] || "Utente";

  return (
    <div className="max-w-2xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Bentornato, {firstName} 👋
        </h1>
        <p className="text-slate-400 text-sm">
          Ecco una panoramica dei tuoi servizi attivi.
        </p>
      </div>

      {/* Upgrade banner */}
      {!active && (
        <div className="mb-6 flex items-center justify-between gap-4 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-violet-400 flex-shrink-0" />
            <p className="text-sm text-violet-300">
              Sblocca <strong>Corsi Privati</strong> e <strong>Indicatori & Bot</strong> con un piano premium.
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="flex-shrink-0 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            Sblocca
          </button>
        </div>
      )}

      {/* Service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICES.map((s) => (
          <ServiceCard
            key={s.id}
            label={s.label}
            icon={s.icon}
            unlocked={s.free || active}
            to={s.to}
            onUpgrade={onUpgrade}
          />
        ))}
      </div>
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
      <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
        <Zap size={22} className="text-violet-400" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
      <p className="text-slate-500 text-sm">Sezione in arrivo. Stiamo preparando i contenuti per te.</p>
    </div>
  );
}

function ProtectedSection({ children }) {
  const { hasAdvanced } = useAuth();
  const navigate = useNavigate();
  if (!hasAdvanced()) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
          <BookOpen size={22} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Sezione bloccata
        </h2>
        <p className="text-slate-500 text-sm mb-4">Questa sezione richiede un piano attivo.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          ← Torna alla dashboard
        </button>
      </div>
    );
  }
  return children;
}

function MentorSection({ children }) {
  const { isMentorshipActive } = useAuth();
  const navigate = useNavigate();
  if (!isMentorshipActive()) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
          <BookOpen size={22} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Sezione riservata
        </h2>
        <p className="text-slate-500 text-sm mb-4">Il calendario è disponibile solo con il piano Master Mentor.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          ← Torna alla dashboard
        </button>
      </div>
    );
  }
  return children;
}

function AdminSection({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#111113] border-r border-[#1E1E2A] fixed left-0 top-0 bottom-0 z-30">
        <Sidebar />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-[#111113] border-r border-[#1E1E2A] flex flex-col">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#09090B]/80 backdrop-blur border-b border-[#1E1E2A] px-4 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm text-slate-500">Area Riservata</span>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<DashboardHome onUpgrade={() => setPaymentOpen(true)} />} />
            <Route path="corso-base" element={<ComingSoon title="Corso Base" />} />
            <Route path="trading-journal" element={<TradingJournal />} />
            <Route path="news" element={<MacroNews />} />
            <Route
              path="corsi-privati"
              element={<ProtectedSection><CoursesSection /></ProtectedSection>}
            />
            <Route
              path="indicatori-bot"
              element={<ProtectedSection><ComingSoon title="Indicatori & Bot" /></ProtectedSection>}
            />
            <Route
              path="calendario"
              element={<MentorSection><BookingCalendar /></MentorSection>}
            />
            <Route
              path="studenti"
              element={<AdminSection><AdminStudents /></AdminSection>}
            />
          </Routes>
        </main>
      </div>

      {paymentOpen && <PaymentModal onClose={() => setPaymentOpen(false)} />}
    </div>
  );
}
