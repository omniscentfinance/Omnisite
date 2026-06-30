# Corso Base (gratuito) — separazione contenuti + accesso libero

Aggiunge la colonna `section` alle playlist ('base' = gratuito, 'private' =
premium) e aggiorna le policy RLS: il Corso Base è leggibile da **tutti gli
utenti registrati**, i Corsi Privati restano riservati.

Supabase → **SQL Editor** → esegui tutto:

```sql
alter table public.playlists add column if not exists section text default 'private';

-- PLAYLIST: base per tutti gli autenticati, private gated
drop policy if exists "courses read playlists" on public.playlists;
create policy "courses read playlists" on public.playlists for select
  using ( (section = 'base' and auth.uid() is not null) or public.has_course_access() );

-- VIDEO
drop policy if exists "courses read videos" on public.videos;
create policy "courses read videos" on public.videos for select
  using ( exists (
    select 1 from public.playlists p
    where p.id = videos.playlist_id
      and ((p.section = 'base' and auth.uid() is not null) or public.has_course_access())
  ));

-- QUIZ
drop policy if exists "courses read quiz" on public.quiz_questions;
create policy "courses read quiz" on public.quiz_questions for select
  using ( exists (
    select 1 from public.videos v
    join public.playlists p on p.id = v.playlist_id
    where v.id = quiz_questions.video_id
      and ((p.section = 'base' and auth.uid() is not null) or public.has_course_access())
  ));

-- COMMENTI (lettura)
drop policy if exists "courses read comments" on public.video_comments;
create policy "courses read comments" on public.video_comments for select
  using ( exists (
    select 1 from public.videos v
    join public.playlists p on p.id = v.playlist_id
    where v.id = video_comments.video_id
      and ((p.section = 'base' and auth.uid() is not null) or public.has_course_access())
  ));

-- COMMENTI (inserimento): consentito anche agli utenti free sul Corso Base
drop policy if exists "comments insert" on public.video_comments;
create policy "comments insert" on public.video_comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.videos v
      join public.playlists p on p.id = v.playlist_id
      where v.id = video_comments.video_id
        and ((p.section = 'base' and auth.uid() is not null) or public.has_course_access())
    )
  );
```

> Le playlist esistenti restano `private` (default). Le nuove playlist create
> dalla sezione **Corso Base** vengono salvate con `section = 'base'`.
