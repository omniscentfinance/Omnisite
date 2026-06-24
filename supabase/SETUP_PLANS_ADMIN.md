# Setup nuovo modello piani + account admin

Passa dal singolo campo `plan` a due entitlement separate, così un utente può
avere **advanced + mentorship insieme** ("Master +"). Alla scadenza della
mentorship, l'utente torna automaticamente "advanced".

## 1. Migrazione schema `profiles`

Supabase → **SQL Editor** → esegui:

```sql
alter table public.profiles
  add column if not exists has_advanced boolean default false,
  add column if not exists mentorship_expires_at timestamptz,
  add column if not exists is_admin boolean default false;

-- Migra i dati esistenti dal vecchio campo `plan`
update public.profiles set has_advanced = true
  where plan = 'advanced' and has_advanced is distinct from true;
update public.profiles set mentorship_expires_at = plan_expires_at
  where plan = 'mentorship' and mentorship_expires_at is null;
```

## 2. Permessi admin (lettura di tutti i profili)

```sql
-- Funzione helper: l'utente corrente è admin? (security definer evita ricorsione RLS)
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Gli admin possono leggere TUTTI i profili (gli altri solo il proprio)
drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles" on public.profiles
  for select using (public.is_admin());
```

## 3. Rendi admin il tuo account "master"

Registra prima l'account sul sito con la tua email, poi:

```sql
update public.profiles
set is_admin = true, has_advanced = true
where email ilike 'LA-TUA-EMAIL@esempio.com';
```

`is_admin = true` sblocca automaticamente **tutto** (advanced + mentorship +
sezione Studenti). Sostituisci l'email con la tua.

## Note
- Il webhook Stripe ora scrive `has_advanced` / `mentorship_expires_at` (vedi
  `functions/stripe-webhook/index.ts`): va ri-deployato con il codice aggiornato.
- Il vecchio campo `plan` non viene più usato: puoi lasciarlo o rimuoverlo in
  seguito. Il vincolo `profiles_plan_check` non dà più fastidio.
