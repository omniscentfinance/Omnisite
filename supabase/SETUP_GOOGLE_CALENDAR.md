# Setup Google Calendar per le prenotazioni mentorship

Prerequisiti già fatti: progetto Google Cloud, Calendar API abilitata,
service account creato, chiave JSON scaricata, calendario condiviso con il
service account ("Apportare modifiche agli eventi").

- ID calendario: `omniscent.finance@gmail.com`
- Service account: `calendar-bot@omniscent-calendar-for-mentor.iam.gserviceaccount.com`

## 1. Deploy della function `book-session`

Supabase → **Edge Functions → Deploy a new function** → nome `book-session` →
incolla il contenuto di `functions/book-session/index.ts`.

## 2. Secrets

Supabase → **Edge Functions → Secrets**, aggiungi:

- `GOOGLE_CALENDAR_ID` = `omniscent.finance@gmail.com`
- `GOOGLE_SERVICE_ACCOUNT_JSON` = **tutto il contenuto** del file `.json`
  scaricato (incolla l'intero JSON, dalla `{` iniziale alla `}` finale).

> `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sono già disponibili.

## 3. Verify JWT — lasciare ON

A differenza del webhook Stripe, qui la function è chiamata dal sito con il
token dell'utente loggato, quindi **"Verify JWT" resta attivo** (default).
La function controlla che l'utente abbia la mentorship attiva.

## Come funziona

1. Il cliente sceglie giorno + orario dal calendario.
2. La function verifica: piano mentorship attivo, slot non già prenotato,
   slot libero sul tuo Google Calendar (free/busy).
3. Inserisce la prenotazione (il trigger DB blocca oltre 2h/mese).
4. Crea l'evento sul tuo Google Calendar.

## Nota sugli inviti

Il service account crea l'evento **sul tuo calendario** con nome ed email del
cliente nel titolo/descrizione. Non invia un invito Google al cliente (richiede
Google Workspace con delega a livello di dominio, non disponibile su account
Gmail personali). Il cliente vede la conferma sul sito; volendo, in seguito
possiamo inviargli un'email di conferma via EmailJS.
