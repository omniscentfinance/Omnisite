# Setup Indicatori & Bot

Sezione con due riquadri ("Indicatori" e "BOT"): l'admin può aggiungere
contenuti (testo e/o file allegato), gli studenti Advanced li vedono in
sola lettura.

Esegui in **Supabase → SQL Editor**.

## 1. Tabella

```sql
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('indicatori', 'bot')),
  title text not null,
  content text,
  file_url text,
  file_name text,
  created_at timestamptz default now()
);
```

## 2. Row Level Security

```sql
alter table public.resources enable row level security;

-- Lettura: solo chi ha accesso ai contenuti advanced
create policy "resources read" on public.resources for select
  using (public.has_course_access());

-- Scrittura: solo admin
create policy "resources admin write" on public.resources for all
  using (public.is_admin()) with check (public.is_admin());
```

> `has_course_access()` e `is_admin()` sono già definite (vedi
> `SETUP_COURSES.md`), quindi non serve ricrearle.

## 3. Storage bucket

Supabase → **Storage** → **New bucket**:
- Nome: `resources`
- Public: **sì** (i file vanno linkati direttamente nel sito)

Poi in **SQL Editor**, policy per permettere upload solo agli admin e
lettura pubblica dei file:

```sql
create policy "resources bucket read" on storage.objects for select
  using (bucket_id = 'resources');

create policy "resources bucket admin write" on storage.objects for insert
  with check (bucket_id = 'resources' and public.is_admin());

create policy "resources bucket admin delete" on storage.objects for delete
  using (bucket_id = 'resources' and public.is_admin());
```

## Come funziona nel sito
- In **Indicatori & Bot** compaiono due grandi riquadri: "Indicatori" e "BOT".
- Cliccandoci sopra si apre l'elenco dei contenuti di quella categoria.
- L'admin vede il pulsante "Aggiungi": può inserire un titolo, un testo
  libero (opzionale) e allegare un file (opzionale, es. PDF, immagine, zip).
- Gli studenti Advanced vedono i contenuti e possono scaricare i file
  allegati.
