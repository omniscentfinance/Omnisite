import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(form.email, form.password);
      if (error) setError(error.message);
      else navigate("/dashboard");
    } else {
      if (!form.fullName.trim()) { setError("Inserisci il tuo nome."); setLoading(false); return; }
      const { error } = await signUp(form.email, form.password, form.fullName);
      if (error) setError(error.message);
      else setError("Controlla la tua email per confermare l'account.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <a href="/" className="mb-8 text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
        OMNISCENT<span className="text-violet-400">®</span>
      </a>

      <div className="w-full max-w-md bg-[#111113] border border-[#1E1E2A] rounded-2xl p-8">
        <h1 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {mode === "login" ? "Accedi al tuo account" : "Crea un account"}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {mode === "login" ? "Bentornato in OMNISCENT®" : "Inizia il tuo percorso con OMNISCENT®"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Nome e Cognome</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Mario Rossi"
                required
                className="w-full px-4 py-3 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="la-tua@email.com"
              required
              className="w-full px-4 py-3 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all pr-10"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className={`text-sm ${error.includes("email") && mode === "register" ? "text-emerald-400" : "text-red-400"}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Accedi" : "Registrati"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          {mode === "login" ? "Non hai un account?" : "Hai già un account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            {mode === "login" ? "Registrati" : "Accedi"}
          </button>
        </p>
      </div>
    </div>
  );
}
