# Setup Forum (canali + messaggi)

Supabase → **SQL Editor** → esegui tutto:

```sql
create table if not exists public.forum_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  admin_only_post boolean default false,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.forum_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references public.forum_channels on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  author_name text,
  body text,
  image_url text,
  created_at timestamptz default now()
);
create index if not exists forum_msg_channel_idx on public.forum_messages (channel_id, created_at);

alter table public.forum_channels enable row level security;
alter table public.forum_messages enable row level security;

-- Canali: lettura per autenticati, gestione admin
create policy "forum channels read" on public.forum_channels for select using (auth.uid() is not null);
create policy "forum channels admin" on public.forum_channels for all using (public.is_admin()) with check (public.is_admin());

-- Messaggi: lettura per autenticati
create policy "forum messages read" on public.forum_messages for select using (auth.uid() is not null);

-- Inserimento: se il canale è "solo team" -> solo admin; altrimenti qualsiasi autenticato
create policy "forum messages insert" on public.forum_messages for insert
  with check (
    auth.uid() = user_id
    and (
      public.is_admin()
      or not exists (select 1 from public.forum_channels c where c.id = channel_id and c.admin_only_post = true)
    )
  );

-- Cancellazione: proprio messaggio o admin
create policy "forum messages delete" on public.forum_messages for delete
  using (auth.uid() = user_id or public.is_admin());
```

## Realtime (opzionale, per la chat live)
Supabase → **Database → Replication** (o Table Editor → forum_messages →
Realtime) → abilita la **Realtime** sulla tabella `forum_messages`. Così i nuovi
messaggi appaiono senza ricaricare. Se non la abiliti, funziona comunque: i
messaggi si aggiornano all'invio e al cambio canale.

## Uso
- Come **admin**, apri **Forum** → "+" per creare un canale.
- Per il canale **Analisi**: spunta "Solo il team può pubblicare" così gli
  studenti leggono soltanto.
- Le immagini usano il bucket `journal` già esistente.
