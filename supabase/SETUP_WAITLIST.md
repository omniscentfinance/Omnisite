# Setup Waitlist (iscrizioni al lancio)

Raccoglie le iscrizioni della sezione **Lancio** della home e delle CTA dei piani
mentre la piattaforma è marcata come non disponibile.

Supabase → **SQL Editor** → esegui tutto:

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  interest text,
  lang text default 'it',
  source text default 'site',
  created_at timestamptz not null default now()
);

-- Un indirizzo una volta sola, senza badare a maiuscole.
-- Il doppio invio torna come errore 23505 e il sito lo tratta come "eri già in lista".
create unique index if not exists waitlist_email_uniq on public.waitlist (lower(email));
create index if not exists waitlist_created_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- Inserimento aperto: serve a chiunque visiti il sito, anche senza account.
create policy "waitlist insert public" on public.waitlist
  for insert to anon, authenticated with check (true);

-- Lettura solo admin. La chiave anon è pubblica (sta nel bundle JS):
-- senza questo vincolo la lista email sarebbe scaricabile da chiunque.
create policy "waitlist read admin" on public.waitlist
  for select using (public.is_admin());

create policy "waitlist delete admin" on public.waitlist
  for delete using (public.is_admin());
```

## Perché non c'è una policy di SELECT per `anon`

Il client inserisce con `supabase.from("waitlist").insert(...)` **senza** `.select()`:
supabase-js manda `Prefer: return=minimal`, quindi l'inserimento non richiede permessi
di lettura. Così il sito può scrivere in lista ma non rileggerla.

Conseguenza voluta: **non si può mostrare un contatore pubblico** del tipo
"1.248 persone in lista" senza aprire la tabella in lettura. Se lo vuoi, la strada
pulita è una `security definer` function che ritorna solo `count(*)`:

```sql
create or replace function public.waitlist_count()
returns bigint language sql security definer set search_path = public as $$
  select count(*) from public.waitlist;
$$;
grant execute on function public.waitlist_count() to anon, authenticated;
```

## Leggere ed esportare la lista

- Supabase → **Table editor** → `waitlist` → *Export CSV* (il pannello usa la
  service role e passa sopra la RLS).
- Oppure SQL Editor:

```sql
select created_at, email, name, interest, lang, source
from public.waitlist
order by created_at desc;
```

Segmentazione per capire da dove arrivano, utile prima di scrivere l'email di apertura:

```sql
select interest, count(*) from public.waitlist group by interest order by 2 desc;
select source,   count(*) from public.waitlist group by source   order by 2 desc;
```

## GDPR — i tre punti che contano

1. Il form ha un **consenso esplicito** (checkbox non pre-spuntata), obbligatorio per inviare.
2. Finalità dichiarata e unica: avvisare dell'apertura. Niente newsletter travestita.
3. Cancellazione su richiesta:

```sql
delete from public.waitlist where lower(email) = lower('indirizzo@esempio.it');
```

## Dopo il lancio

In `frontend/src/lib/launch.js` metti `LAUNCH_MODE = false`: la barra in alto e la
sezione lancio spariscono, i piani tornano acquistabili. La tabella resta lì come
archivio dei primi iscritti — comoda per riconoscere chi era in lista.
