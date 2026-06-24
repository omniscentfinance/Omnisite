import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useAuth } from "@/context/AuthContext";
import {
  getGoogleBusy,
  getMyMonthMinutes,
  createBooking,
  MONTHLY_LIMIT_MIN,
  SLOT_MINUTES,
} from "@/lib/booking";

const EMAILJS_SERVICE_ID = "service_t060r7s";
const EMAILJS_TEMPLATE_ID = "template_zw256co";
const EMAILJS_PUBLIC_KEY = "Uk8xcFa3VjvjRAgAQ";

// Finestra di disponibilità del mentor (modificabile qui).
//   OPEN_HOUR  = prima ora prenotabile (inizio slot)
//   CLOSE_HOUR = ultima ora prenotabile (inizio slot)
//   AVAILABLE_DAYS = giorni prenotabili (0=Dom, 1=Lun ... 6=Sab)
// Google Calendar rimuove poi gli slot già occupati.
const OPEN_HOUR = 10;
const CLOSE_HOUR = 22;
const AVAILABLE_DAYS = [1, 2, 3, 4, 5]; // Lun-Ven (chiuso sabato e domenica)
// Pausa di chiusura (in minuti dalla mezzanotte): 16:30 -> 20:30.
// Gli slot che si sovrappongono a questa fascia vengono esclusi.
const BREAK_START_MIN = 16 * 60 + 30;
const BREAK_END_MIN = 20 * 60 + 30;

const HOURS = [];
for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h++) {
  const slotStart = h * 60;
  const slotEnd = slotStart + SLOT_MINUTES;
  // Escludi se lo slot si sovrappone alla pausa
  if (slotStart < BREAK_END_MIN && slotEnd > BREAK_START_MIN) continue;
  HOURS.push(`${String(h).padStart(2, "0")}:00`);
}
const WEEKLY_SLOTS = AVAILABLE_DAYS.reduce((acc, day) => {
  acc[day] = HOURS;
  return acc;
}, {});

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function slotKey(date, time) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${time}`;
}

export default function BookingCalendar() {
  const { user, profile } = useAuth();
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState(null);
  const [busy, setBusy] = useState([]); // [{ start: Date, end: Date }]
  const [usedMinutes, setUsedMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "success"|"error", msg }

  const loadMonth = useCallback(async () => {
    setLoading(true);
    try {
      const [busyRaw, mine] = await Promise.all([
        getGoogleBusy(view.year, view.month),
        user ? getMyMonthMinutes(user.id, view.year, view.month) : Promise.resolve(0),
      ]);
      setBusy(busyRaw.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })));
      setUsedMinutes(mine);
    } catch {
      setBusy([]);
    } finally {
      setLoading(false);
    }
  }, [view.year, view.month, user]);

  // Uno slot è occupato se si sovrappone a un intervallo busy del calendario
  const isSlotBusy = (date, time) => {
    const [h, m] = time.split(":").map(Number);
    const s = new Date(date); s.setHours(h, m, 0, 0);
    const e = new Date(s.getTime() + SLOT_MINUTES * 60000);
    return busy.some((b) => s < b.end && e > b.start);
  };

  useEffect(() => { loadMonth(); }, [loadMonth]);

  const remaining = MONTHLY_LIMIT_MIN - usedMinutes;
  const canBook = remaining >= SLOT_MINUTES;

  // Costruisce le celle del mese (incluse celle vuote iniziali per allineare la griglia)
  const firstDay = new Date(view.year, view.month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // settimana che parte da Lunedì
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.year, view.month, d));

  const isPast = (date) => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return date < t;
  };
  const dayHasSlots = (date) => !isPast(date) && (WEEKLY_SLOTS[date.getDay()]?.length > 0);

  const changeMonth = (delta) => {
    setSelectedDay(null);
    setFeedback(null);
    const m = view.month + delta;
    setView({ year: view.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 });
  };

  const slotsForSelected = selectedDay ? (WEEKLY_SLOTS[selectedDay.getDay()] || []) : [];

  const handleBook = async (time) => {
    if (!canBook || booking) return;
    const [h, m] = time.split(":").map(Number);
    const start = new Date(selectedDay);
    start.setHours(h, m, 0, 0);
    setBooking(true);
    setFeedback(null);
    try {
      await createBooking(start.toISOString());
      // Notifica di prenotazione via EmailJS (non blocca la conferma se fallisce)
      const when = start.toLocaleString("it-IT", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: profile?.full_name || "Cliente",
          email: profile?.email || user?.email || "",
          service: "Prenotazione Mentorship 1to1",
          message: `Nuova sessione prenotata per: ${when} (durata ${SLOT_MINUTES} min).`,
        },
        { publicKey: EMAILJS_PUBLIC_KEY },
      ).catch(() => {});
      setFeedback({ type: "success", msg: "Prenotazione confermata! La trovi sul calendario." });
      await loadMonth();
    } catch (e) {
      setFeedback({ type: "error", msg: e?.message || "Errore durante la prenotazione. Riprova." });
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Prenota la tua sessione
        </h1>
        <p className="text-slate-400 text-sm">Scegli un giorno e un orario disponibile per la tua mentorship 1to1.</p>
      </div>

      {/* Quota banner */}
      <div className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 border ${
        canBook ? "border-violet-500/20 bg-violet-500/10" : "border-amber-500/20 bg-amber-500/10"
      }`}>
        <Clock size={16} className={canBook ? "text-violet-400" : "text-amber-400"} />
        <p className="text-sm text-slate-300">
          Hai usato <strong>{usedMinutes} min</strong> su <strong>{MONTHLY_LIMIT_MIN} min</strong> disponibili questo mese
          {!canBook && " — limite raggiunto."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Calendario */}
        <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {MONTH_NAMES[view.month]} {view.year}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Intestazione giorni */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wide py-1">{d}</div>
            ))}
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-violet-400" size={22} />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((date, i) => {
                if (!date) return <div key={`e${i}`} />;
                const available = dayHasSlots(date);
                const selected = selectedDay && date.toDateString() === selectedDay.toDateString();
                const isToday = date.toDateString() === today.toDateString();
                return (
                  <button
                    key={slotKey(date, "d")}
                    disabled={!available}
                    onClick={() => { setSelectedDay(date); setFeedback(null); }}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all ${
                      selected
                        ? "border-violet-500 bg-violet-500/15"
                        : available
                        ? "border-[#1E1E2A] bg-[#16161A] hover:border-violet-500/40 hover:bg-violet-500/5 cursor-pointer"
                        : "border-transparent bg-transparent opacity-30 cursor-not-allowed"
                    }`}
                  >
                    <span className={`text-[10px] uppercase tracking-wide ${available ? "text-slate-500" : "text-slate-700"}`}>
                      {DAY_NAMES[date.getDay()]}
                    </span>
                    <span className={`text-base font-semibold ${
                      selected ? "text-violet-300" : isToday ? "text-violet-400" : available ? "text-white" : "text-slate-700"
                    }`}>
                      {date.getDate()}
                    </span>
                    {available && <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Slot orari */}
        <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-5">
          {!selectedDay ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center">
              <Clock size={22} className="text-slate-600 mb-2" />
              <p className="text-sm text-slate-500">Seleziona un giorno per vedere gli orari disponibili.</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {DAY_NAMES[selectedDay.getDay()]} {selectedDay.getDate()} {MONTH_NAMES[selectedDay.getMonth()]}
              </p>
              <div className="space-y-2">
                {slotsForSelected.map((time) => {
                  const booked = isSlotBusy(selectedDay, time);
                  const disabled = booked || !canBook || booking;
                  return (
                    <button
                      key={time}
                      disabled={disabled}
                      onClick={() => handleBook(time)}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        booked
                          ? "border-[#1E1E2A] text-slate-600 line-through cursor-not-allowed"
                          : disabled
                          ? "border-[#1E1E2A] text-slate-600 cursor-not-allowed"
                          : "border-violet-500/40 text-violet-300 hover:bg-violet-500/10"
                      }`}
                    >
                      {time}{booked && " · occupato"}
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <div className={`mt-4 flex items-start gap-2 text-sm ${feedback.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {feedback.type === "success" ? <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />}
                  {feedback.msg}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
