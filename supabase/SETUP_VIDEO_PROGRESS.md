# Setup tracciamento video visti

Supabase → **SQL Editor** → esegui:

```sql
create table if not exists public.video_progress (
  user_id uuid references auth.users on delete cascade,
  video_id uuid references public.videos on delete cascade,
  watched_at timestamptz default now(),
  primary key (user_id, video_id)
);

alter table public.video_progress enable row level security;

-- Lo studente vede/segna i propri progressi; l'admin vede quelli di tutti
create policy "progress select" on public.video_progress for select
  using (auth.uid() = user_id or public.is_admin());
create policy "progress insert" on public.video_progress for insert
  with check (auth.uid() = user_id);
```

## Come funziona
- Quando uno **studente** apre un video, viene segnato come visto (gli admin no).
- Nella playlist lo studente vede una **barra di avanzamento** e una **spunta
  verde** sui video già visti.
- Nella sezione **Studenti** (admin) compare la colonna **"Video visti"** con il
  numero di video guardati da ciascuno.
