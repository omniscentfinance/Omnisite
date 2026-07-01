# Forum — riservato ai piani a pagamento

Restringe la lettura/scrittura del forum a chi ha un piano a pagamento
(advanced, master mentor o master+). Da eseguire dopo `SETUP_FORUM.md`.

Supabase → **SQL Editor** → esegui:

```sql
-- Helper: l'utente corrente ha un piano a pagamento?
create or replace function public.has_paid_plan()
returns boolean language sql security definer stable as $$
  select coalesce((
    select is_admin or has_advanced
      or (mentorship_expires_at is not null and mentorship_expires_at > now())
    from public.profiles where id = auth.uid()
  ), false);
$$;

-- Canali: lettura solo per piani a pagamento
drop policy if exists "forum channels read" on public.forum_channels;
create policy "forum channels read" on public.forum_channels for select
  using (public.has_paid_plan());

-- Messaggi: lettura solo per piani a pagamento
drop policy if exists "forum messages read" on public.forum_messages;
create policy "forum messages read" on public.forum_messages for select
  using (public.has_paid_plan());

-- Inserimento: richiede piano a pagamento; nei canali "solo team" scrive solo l'admin
drop policy if exists "forum messages insert" on public.forum_messages;
create policy "forum messages insert" on public.forum_messages for insert
  with check (
    auth.uid() = user_id
    and public.has_paid_plan()
    and (
      public.is_admin()
      or not exists (select 1 from public.forum_channels c where c.id = channel_id and c.admin_only_post = true)
    )
  );
```

> Gli utenti **free** non vedono più i contenuti del forum (né dal sito né dal
> database). La voce "Forum" in sidebar appare loro con il lucchetto e cliccando
> vedono l'invito ai piani.
