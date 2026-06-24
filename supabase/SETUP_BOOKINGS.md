# Setup calendario prenotazioni (Master Mentor)

## 1. Tabella `bookings` + limite 2h/mese

Supabase → **SQL Editor** → esegui:

```sql
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  email text,
  starts_at timestamptz not null,
  duration_min int not null default 60,
  google_event_id text,
  created_at timestamptz default now()
);

create index if not exists bookings_starts_at_idx on public.bookings (starts_at);
create index if not exists bookings_user_month_idx on public.bookings (user_id, starts_at);

alter table public.bookings enable row level security;

-- Tutti gli utenti autenticati possono LEGGERE gli slot occupati (solo orari, per oscurarli)
create policy "Authenticated can read bookings" on public.bookings
  for select using (auth.role() = 'authenticated');

-- L'inserimento avviene SOLO dalla Edge Function (service role), mai dal client:
-- non creiamo policy di insert per gli utenti, così il limite 2h non è aggirabile.
```

## 2. Limite 2h/mese — enforcement a livello DB

Per impedire che il limite venga aggirato anche se qualcuno chiamasse il DB
direttamente, lo blocchiamo con un trigger:

```sql
create or replace function public.check_monthly_limit()
returns trigger as $$
declare
  total int;
begin
  select coalesce(sum(duration_min), 0) into total
  from public.bookings
  where user_id = new.user_id
    and date_trunc('month', starts_at) = date_trunc('month', new.starts_at);

  if total + new.duration_min > 120 then
    raise exception 'Limite mensile di 120 minuti superato';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_monthly_limit
  before insert on public.bookings
  for each row execute procedure public.check_monthly_limit();
```

## 3. Prossimo step — Google Calendar

La Edge Function `book-session` (da creare) farà:
1. verifica del limite + che lo slot sia libero;
2. lettura free/busy dal tuo Google Calendar (service account);
3. creazione evento Google + invito al cliente;
4. salvataggio in `bookings`.

Serve prima la configurazione del service account Google (Google Cloud →
abilita Calendar API → crea service account → condividi il tuo calendario con
la sua email). Vedi `SETUP_GOOGLE_CALENDAR.md` (in arrivo).
