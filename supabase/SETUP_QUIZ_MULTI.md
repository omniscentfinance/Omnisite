# Quiz a risposta multipla

Aggiunge il supporto a domande con più risposte corrette.

Supabase → **SQL Editor** → esegui:

```sql
alter table public.quiz_questions
  add column if not exists correct_indexes jsonb;
```

## Come funziona
- Se `correct_indexes` è **null** → domanda a **risposta singola** (come prima,
  usa `correct_index`).
- Se contiene un array (es. `[0, 2]`) → domanda a **risposta multipla**: lo
  studente seleziona più opzioni e la risposta è giusta solo se coincide
  esattamente con quelle corrette.
