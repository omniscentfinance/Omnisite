# Setup banner Live giornaliera

Banner promozionale della live quotidiana, visibile a chi ha **Advanced** o
**Master +** (i Free, cliccando, vedono la schermata pagamenti).

## Tabella `live_session` (riga singola id=1)

Supabase → **SQL Editor**:

```sql
create table if not exists public.live_session (
  id int primary key default 1,
  title text,
  cover_url text,
  starts_at timestamptz,
  join_url text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

alter table public.live_session enable row level security;

-- Tutti gli autenticati possono vedere il banner
create policy "live read" on public.live_session for select
  using (auth.role() = 'authenticated');

-- Solo l'admin può impostare/modificare la live
create policy "live admin write" on public.live_session for all
  using (public.is_admin()) with check (public.is_admin());
```

## Immagine di copertina
La copertina viene caricata nel bucket **`journal`** (già esistente e pubblico),
quindi non serve creare nuovi bucket.

## Come funziona
- L'admin clicca **Modifica** sul banner → imposta copertina, titolo, data/ora e
  link della live.
- Il banner mostra la copertina, un **countdown** e, all'orario, il badge
  **"LIVE ORA"** con il pulsante per entrare.
- **Advanced / Master +**: pulsante apre il link della live.
- **Free**: il click apre la schermata di acquisto dei servizi.
