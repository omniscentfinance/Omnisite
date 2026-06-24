import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Trash2, Plus, HelpCircle } from "lucide-react";
import { listQuestions, createQuestion, deleteQuestion } from "@/lib/courses";

// Una domanda è "multipla" se ha un array correct_indexes valorizzato.
const isMulti = (q) => Array.isArray(q.correct_indexes);
const correctSet = (q) => new Set(isMulti(q) ? q.correct_indexes : [q.correct_index]);

function isQuestionCorrect(q, answer) {
  const correct = correctSet(q);
  if (isMulti(q)) {
    const sel = new Set(answer || []);
    return sel.size === correct.size && [...sel].every((i) => correct.has(i));
  }
  return answer === q.correct_index;
}

function isAnswered(q, answer) {
  return isMulti(q) ? Array.isArray(answer) && answer.length > 0 : answer !== undefined;
}

export default function Quiz({ videoId, isAdmin }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // questionId -> index | index[]
  const [submitted, setSubmitted] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setQuestions(await listQuestions(videoId)); } catch { setQuestions([]); }
    setLoading(false);
  };
  useEffect(() => { load(); setAnswers({}); setSubmitted(false); }, [videoId]); // eslint-disable-line

  const score = questions.reduce((n, q) => n + (isQuestionCorrect(q, answers[q.id]) ? 1 : 0), 0);
  const allAnswered = questions.every((q) => isAnswered(q, answers[q.id]));

  const toggle = (q, oi) => {
    setAnswers((p) => {
      if (isMulti(q)) {
        const cur = new Set(p[q.id] || []);
        cur.has(oi) ? cur.delete(oi) : cur.add(oi);
        return { ...p, [q.id]: [...cur] };
      }
      return { ...p, [q.id]: oi };
    });
  };

  if (loading) return null;

  return (
    <div className="bg-[#111113] border border-[#1E1E2A] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <HelpCircle size={16} className="text-violet-400" /> Quiz
        </h3>
        {isAdmin && (
          <button onClick={() => setAdding(true)} className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1">
            <Plus size={13} /> Domanda
          </button>
        )}
      </div>

      {questions.length === 0 && !adding && (
        <p className="text-sm text-slate-500">{isAdmin ? "Nessuna domanda. Aggiungine una." : "Nessun quiz per questo video."}</p>
      )}

      <div className="space-y-5">
        {questions.map((q, qi) => {
          const multi = isMulti(q);
          const sel = answers[q.id];
          return (
            <div key={q.id}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-white">{qi + 1}. {q.question}</p>
                {isAdmin && (
                  <button onClick={async () => { await deleteQuestion(q.id); load(); }} className="text-slate-600 hover:text-red-400 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              {multi && <p className="text-xs text-slate-500 mb-2">Seleziona tutte le risposte corrette</p>}
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isSel = multi ? (sel || []).includes(oi) : sel === oi;
                  const isCorrect = correctSet(q).has(oi);
                  let cls = "border-[#1E1E2A] text-slate-300 hover:border-violet-500/40";
                  if (submitted) {
                    if (isCorrect) cls = "border-emerald-500/50 text-emerald-300 bg-emerald-500/5";
                    else if (isSel) cls = "border-red-500/50 text-red-300 bg-red-500/5";
                    else cls = "border-[#1E1E2A] text-slate-500";
                  } else if (isSel) {
                    cls = "border-violet-500 text-violet-200 bg-violet-500/10";
                  }
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => toggle(q, oi)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors flex items-center justify-between ${cls}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 flex-shrink-0 border flex items-center justify-center ${multi ? "rounded" : "rounded-full"} ${isSel ? "border-violet-400 bg-violet-500/30" : "border-slate-600"}`}>
                          {isSel && <span className="w-1.5 h-1.5 bg-violet-300 rounded-sm" />}
                        </span>
                        {opt}
                      </span>
                      {submitted && isCorrect && <CheckCircle2 size={14} className="text-emerald-400" />}
                      {submitted && isSel && !isCorrect && <XCircle size={14} className="text-red-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {questions.length > 0 && (
        <div className="mt-5">
          {submitted ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">Punteggio: <strong className="text-white">{score}/{questions.length}</strong></p>
              <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="text-xs text-violet-400 hover:text-violet-300">Riprova</button>
            </div>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              className="w-full py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              Verifica risposte
            </button>
          )}
        </div>
      )}

      {adding && <AddQuestion videoId={videoId} onDone={() => { setAdding(false); load(); }} />}
    </div>
  );
}

function AddQuestion({ videoId, onDone }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [multi, setMulti] = useState(false);
  const [single, setSingle] = useState(0);       // indice corretto (risposta singola)
  const [multiCorrect, setMultiCorrect] = useState([]); // indici corretti (risposta multipla)
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const toggleMultiCorrect = (i) =>
    setMultiCorrect((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  const save = async () => {
    const clean = options.map((o) => o.trim());
    const filled = clean.filter(Boolean);
    if (!question.trim() || filled.length < 2) { setErr("Inserisci la domanda e almeno 2 opzioni."); return; }
    // Mappa gli indici corretti alle sole opzioni non vuote
    const indexMap = clean.map((o, i) => (o ? i : -1)).filter((i) => i >= 0);
    setSaving(true); setErr("");
    try {
      if (multi) {
        const correct = multiCorrect.filter((i) => clean[i]).map((i) => indexMap.indexOf(i)).filter((i) => i >= 0);
        if (correct.length < 1) { setErr("Seleziona almeno una risposta corretta."); setSaving(false); return; }
        await createQuestion({ video_id: videoId, question: question.trim(), options: filled, correct_index: correct[0], correct_indexes: correct });
      } else {
        const correctIdx = indexMap.indexOf(single);
        await createQuestion({ video_id: videoId, question: question.trim(), options: filled, correct_index: correctIdx >= 0 ? correctIdx : 0, correct_indexes: null });
      }
      onDone();
    } catch { setErr("Errore nel salvataggio."); } finally { setSaving(false); }
  };

  return (
    <div className="mt-4 p-4 rounded-xl border border-violet-500/30 bg-violet-500/5 space-y-3">
      <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Testo della domanda"
        className="w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500" />

      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} className="accent-violet-500" />
        Risposta multipla (più risposte corrette)
      </label>

      {options.map((o, i) => (
        <div key={i} className="flex items-center gap-2">
          {multi ? (
            <input type="checkbox" checked={multiCorrect.includes(i)} onChange={() => toggleMultiCorrect(i)} className="accent-violet-500" />
          ) : (
            <input type="radio" name="correct" checked={single === i} onChange={() => setSingle(i)} className="accent-violet-500" />
          )}
          <input value={o} onChange={(e) => setOptions((p) => p.map((x, j) => j === i ? e.target.value : x))}
            placeholder={`Opzione ${i + 1}`}
            className="flex-1 px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500" />
        </div>
      ))}
      <p className="text-xs text-slate-500">
        {multi ? "Spunta le caselle delle risposte corrette." : "Seleziona il pallino della risposta corretta."} Lascia vuote le opzioni che non servono.
      </p>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50">Salva domanda</button>
        <button onClick={onDone} className="px-4 py-2 rounded-md border border-[#1E1E2A] text-slate-400 hover:text-white text-sm">Annulla</button>
      </div>
    </div>
  );
}
