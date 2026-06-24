# Setup Corsi Privati (playlist, video, quiz, commenti)

Esegui in **Supabase → SQL Editor**.

## 1. Tabelle

```sql
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references public.playlists on delete cascade not null,
  title text not null,
  description text,
  youtube_id text not null,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.videos on delete cascade not null,
  question text not null,
  options jsonb not null default '[]',
  correct_index int not null default 0,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.videos on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  author_name text,
  body text not null,
  created_at timestamptz default now()
);
```

## 2. Funzione "ha accesso ai corsi" (advanced o admin)

```sql
create or replace function public.has_course_access()
returns boolean language sql security definer stable as $$
  select coalesce((
    select is_admin or has_advanced from public.profiles where id = auth.uid()
  ), false);
$$;
```

## 3. Row Level Security

```sql
alter table public.playlists enable row level security;
alter table public.videos enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.video_comments enable row level security;

-- Lettura contenuti: solo chi ha accesso ai corsi
create policy "courses read playlists" on public.playlists for select using (public.has_course_access());
create policy "courses read videos" on public.videos for select using (public.has_course_access());
create policy "courses read quiz" on public.quiz_questions for select using (public.has_course_access());
create policy "courses read comments" on public.video_comments for select using (public.has_course_access());

-- Scrittura contenuti (playlist/video/quiz): solo admin
create policy "admin write playlists" on public.playlists for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write videos" on public.videos for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write quiz" on public.quiz_questions for all using (public.is_admin()) with check (public.is_admin());

-- Commenti: lo studente crea i propri; cancella i propri o l'admin cancella qualunque
create policy "comments insert" on public.video_comments for insert
  with check (auth.uid() = user_id and public.has_course_access());
create policy "comments delete" on public.video_comments for delete
  using (auth.uid() = user_id or public.is_admin());
```

## Note
- I video sono **YouTube** (consigliato: "non in elenco"). In fase di
  inserimento incolli il link YouTube: il sistema estrae l'ID automaticamente.
- Solo l'**admin** vede i pulsanti per creare/modificare/eliminare playlist,
  video e domande quiz. Gli studenti (piano Advanced) vedono e usano i contenuti.
- I **commenti** sono visibili a tutti gli studenti che hanno accesso ai corsi.
