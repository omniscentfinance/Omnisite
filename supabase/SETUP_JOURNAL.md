# Setup Trading Journal

## 1. Tabella `trades`

Supabase → **SQL Editor**:

```sql
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  trade_date date not null,
  asset text,
  direction text,          -- 'long' | 'short'
  outcome text,            -- 'win' | 'loss' | 'be'
  pnl text,
  description text,
  lessons text,
  image_url text,
  created_at timestamptz default now()
);

create index if not exists trades_user_date_idx on public.trades (user_id, trade_date);

alter table public.trades enable row level security;

-- Ogni utente vede e gestisce solo i propri trade
create policy "trades select own" on public.trades for select using (auth.uid() = user_id);
create policy "trades insert own" on public.trades for insert with check (auth.uid() = user_id);
create policy "trades delete own" on public.trades for delete using (auth.uid() = user_id);
```

## 2. Storage per gli screenshot

Supabase → **Storage** → **New bucket**:
- Nome: `journal`
- **Public bucket**: attivo (ON)
- Crea

Poi → **SQL Editor** per le policy di upload (lettura pubblica, scrittura solo
nella propria cartella):

```sql
-- Lettura pubblica del bucket journal
create policy "journal public read" on storage.objects for select
  using (bucket_id = 'journal');

-- Upload consentito agli utenti autenticati nella propria cartella (uid/...)
create policy "journal user upload" on storage.objects for insert
  with check (
    bucket_id = 'journal'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Come funziona
- Calendario mensile fino a oggi; clic su un giorno → report di quel giorno + "+".
- Ogni report: screenshot, strumento, direzione (long/short), esito
  (win/loss/break-even), P&L/R, descrizione e lezioni.
- In alto: statistiche del mese (trade, win, loss, win rate).
- I dati sono **privati per utente** (RLS).
