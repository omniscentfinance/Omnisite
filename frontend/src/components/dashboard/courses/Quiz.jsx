import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Trash2, Plus, HelpCircle } from "lucide-react";
import { listQuestions, createQuestion, deleteQuestion } from "@/lib/courses";

export default function Quiz({ videoId, isAdmin }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // questionId -> selected index
  const [submitted, setSubmitted] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setQuestions(await listQuestions(videoId)); } catch { setQuestions([]); }
    setLoading(false);
  };
  useEffect(() => { load(); setAnswers({}); setSubmitted(false); }, [videoId]); // eslint-disable-line

  const score = questions.reduce((n, q) => n + (answers[q.id] === q.correct_index ? 1 : 0), 0);

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
        {questions.map((q, qi) => (
          <div key={q.id}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-white">{qi + 1}. {q.question}</p>
              {isAdmin && (
                <button onClick={async () => { await deleteQuestion(q.id); load(); }} className="text-slate-600 hover:text-red-400 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                const correct = q.correct_index === oi;
                let cls = "border-[#1E1E2A] text-slate-300 hover:border-violet-500/40";
                if (submitted) {
                  if (correct) cls = "border-emerald-500/50 text-emerald-300 bg-emerald-500/5";
                  else if (selected) cls = "border-red-500/50 text-red-300 bg-red-500/5";
                  else cls = "border-[#1E1E2A] text-slate-500";
                } else if (selected) {
                  cls = "border-violet-500 text-violet-200 bg-violet-500/10";
                }
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((p) => ({ ...p, [q.id]: oi }))}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors flex items-center justify-between ${cls}`}
                  >
                    {opt}
                    {submitted && correct && <CheckCircle2 size={14} className="text-emerald-400" />}
                    {submitted && selected && !correct && <XCircle size={14} className="text-red-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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
              disabled={Object.keys(answers).length < questions.length}
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
  const [correct, setCorrect] = useState(0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const clean = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || clean.length < 2) return;
    const correctIdx = Math.min(correct, clean.length - 1);
    setSaving(true);
    try {
      await createQuestion({ video_id: videoId, question: question.trim(), options: clean, correct_index: correctIdx });
      onDone();
    } finally { setSaving(false); }
  };

  return (
    <div className="mt-4 p-4 rounded-xl border border-violet-500/30 bg-violet-500/5 space-y-3">
      <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Testo della domanda"
        className="w-full px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500" />
      {options.map((o, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="radio" name="correct" checked={correct === i} onChange={() => setCorrect(i)} className="accent-violet-500" />
          <input value={o} onChange={(e) => setOptions((p) => p.map((x, j) => j === i ? e.target.value : x))}
            placeholder={`Opzione ${i + 1}${i === correct ? " (corretta)" : ""}`}
            className="flex-1 px-3 py-2 rounded-md border border-[#1E1E2A] bg-[#09090B] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500" />
        </div>
      ))}
      <p className="text-xs text-slate-500">Seleziona il pallino della risposta corretta. Lascia vuote le opzioni che non servono.</p>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50">Salva domanda</button>
        <button onClick={onDone} className="px-4 py-2 rounded-md border border-[#1E1E2A] text-slate-400 hover:text-white text-sm">Annulla</button>
      </div>
    </div>
  );
}
