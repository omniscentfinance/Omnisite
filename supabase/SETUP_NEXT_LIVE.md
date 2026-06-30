# Live automatiche dal Google Calendar

Le live si programmano dal Google Calendar: il banner legge il prossimo evento
il cui titolo inizia con **LIVE** e ne usa titolo, orario e link Meet —
senza impostare nulla a mano.

## 1. Deploy della Edge Function
Supabase → **Edge Functions** → nuova function `next-live` → incolla il
contenuto di `functions/next-live/index.ts` → **Deploy**.

> Usa gli stessi secret già presenti per le prenotazioni:
> `GOOGLE_SERVICE_ACCOUNT_JSON` e `GOOGLE_CALENDAR_ID`. Non serve altro.

## 2. Come creare una live
Su Google Calendar (lo stesso calendario condiviso col service account):
1. Crea un evento con titolo che inizia con **LIVE**, es. `LIVE: Stock Market Review`.
2. Aggiungi **"Aggiungi videoconferenza Google Meet"** → Google genera il link.
3. Salva.

Il sito mostrerà automaticamente quell'evento nel banner (titolo senza il
prefisso "LIVE", countdown all'orario, pulsante per entrare nel Meet).

## Note
- La **copertina** non arriva dal calendario: impostala una volta dall'admin
  (banner → Modifica → carica copertina). Resta fissa per tutte le live.
- Se non c'è nessun evento "LIVE" futuro, il banner usa la live impostata
  manualmente (se presente).
- Meet si apre in una nuova scheda (non incorporabile). Per una videocall
  **dentro** al sito usa invece un link Jitsi nell'impostazione manuale.
