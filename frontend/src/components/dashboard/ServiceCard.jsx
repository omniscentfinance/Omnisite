import { CheckCircle2, XCircle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ServiceCard({ label, icon: Icon, unlocked, to, onUpgrade }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => unlocked ? navigate(to) : onUpgrade()}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer select-none ${
        unlocked
          ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
          : "border-[#1E1E2A] bg-[#16161A] hover:border-violet-500/30 opacity-70 hover:opacity-90"
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        unlocked ? "bg-emerald-500/10" : "bg-[#1E1E2A]"
      }`}>
        <Icon size={16} className={unlocked ? "text-emerald-400" : "text-slate-500"} />
      </div>

      <span className={`text-sm font-medium flex-1 ${unlocked ? "text-white" : "text-slate-500"}`}>
        {label}
      </span>

      {unlocked ? (
        <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
      ) : (
        <div className="flex items-center gap-1.5">
          <XCircle size={16} className="text-red-500/60 flex-shrink-0" />
          <Lock size={12} className="text-slate-600" />
        </div>
      )}
    </div>
  );
}
