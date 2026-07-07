# Forza delle valute (Currency Strength Meter)

Dashboard con la forza relativa delle 8 valute major (USD, EUR, GBP, JPY, CHF,
AUD, CAD, NZD), calcolata sulla variazione % giornaliera di 28 coppie
incrociate, storico salvato nel tempo e confronto tra due valute per
orientarsi su un trade swing. Usa **Twelve Data** (già in uso per il ticker).

## 1. Tabella storico

Supabase → **SQL Editor**:

```sql
create table if not exists public.currency_strength_snapshot (
  id bigint generated always as identity primary key,
  currency text not null,
  strength numeric not null,
  taken_at timestamptz not null default now()
);

create index if not exists idx_currency_strength_taken_at
  on public.currency_strength_snapshot (currency, taken_at);

alter table public.currency_strength_snapshot enable row level security;

create policy "Authenticated can read currency strength"
  on public.currency_strength_snapshot for select
  using (auth.role() = 'authenticated');
```

Nessuna policy di insert: la Edge Function scrive con la service role key
(bypassa RLS), gli utenti possono solo leggere.

## 2. Deploy della Edge Function

Supabase → **Edge Functions** → nuova function `currency-strength` → incolla
il contenuto di `functions/currency-strength/index.ts` → **Deploy**.

## 3. Secrets

Edge Functions → **Secrets**:
- `TWELVE_DATA_API_KEY` = la stessa chiave già usata per `market-quotes`
- `CRON_SECRET` = una stringa a caso generata da te (es. `openssl rand -hex 24`),
  usata per autenticare solo la chiamata di refresh schedulata.

## 4. Estensioni per il cron

Supabase → **Database → Extensions** → abilita `pg_cron` e `pg_net` (se non
già attive).

## 5. Job schedulato (refresh orario)

Supabase → **SQL Editor** (sostituisci `<PROJECT_REF>` e `<CRON_SECRET>` con i
tuoi valori reali):

```sql
select cron.schedule(
  'currency-strength-refresh',
  '0 * * * *', -- ogni ora, in punto
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/currency-strength',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<CRON_SECRET>'),
    body := jsonb_build_object('action', 'refresh')
  );
  $$
);
```

Per verificare che giri: `select * from cron.job_run_details order by start_time desc limit 5;`

## Come funziona

- Ogni ora il cron chiama la function con `action: "refresh"` → questa
  interroga Twelve Data (4 richieste da 8 simboli, ben sotto il limite del
  piano free) e salva uno snapshot per ciascuna delle 8 valute.
- Il frontend chiama la stessa function senza `action` → legge solo dal
  database (nessuna chiamata a Twelve Data, nessun limite di rate lato utenti).
- La pagina mostra: ranking del giorno, grafico storico (ultime 48h) e un
  confronto diretto tra due valute con un bias direzionale suggerito — utile
  per orientarsi su un trade swing, non un segnale automatico.
- Lo storico impiega qualche ora a popolarsi dopo il primo deploy: finché non
  ci sono snapshot, la pagina mostra un messaggio invece del grafico.
