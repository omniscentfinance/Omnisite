# Setup webhook Stripe → Supabase

Questo collega i pagamenti Stripe all'aggiornamento automatico del piano utente.

## 1. Database: aggiungi la colonna email a `profiles`

Supabase → **SQL Editor** → esegui:

```sql
-- Aggiunge la colonna email
alter table public.profiles add column if not exists email text;

-- Aggiorna il trigger così i nuovi utenti salvano anche l'email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Backfill: popola l'email per gli utenti già registrati
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;
```

## 2. Deploy della Edge Function

Opzione A — **dal dashboard** (più semplice):
Supabase → **Edge Functions** → **Deploy a new function** → nome `stripe-webhook` →
incolla il contenuto di `functions/stripe-webhook/index.ts`.

Opzione B — **da CLI**:
```bash
npx supabase functions deploy stripe-webhook --no-verify-jwt
```
(`--no-verify-jwt` è necessario: Stripe non invia un JWT Supabase.)

## 3. Imposta i secret della function

Supabase → **Edge Functions → stripe-webhook → Secrets** (o Project Settings → Edge Functions):

- `STRIPE_SECRET_KEY` = la tua chiave segreta Stripe (`sk_live_...`, da Stripe → Developers → API keys)
- `STRIPE_WEBHOOK_SECRET` = lo ottieni allo step 4

> `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sono già disponibili in automatico.

## 4. Crea il webhook su Stripe

Stripe → **Developers → Webhooks → Add endpoint**:

- **Endpoint URL**: `https://xbjfpbegulqxwfyhfacg.supabase.co/functions/v1/stripe-webhook`
- **Eventi da ascoltare**: `checkout.session.completed`
- Dopo la creazione, copia il **Signing secret** (`whsec_...`) e mettilo come `STRIPE_WEBHOOK_SECRET` (step 3).

## 5. Aggiungi i metadata ai Payment Links

Per ogni Payment Link su Stripe → modifica → sezione **Metadata**, aggiungi:

| Payment Link            | plan         | duration   |
|-------------------------|--------------|------------|
| Advanced (intero)       | `advanced`   | `lifetime` |
| Advanced (12 rate)      | `advanced`   | `lifetime` |
| Master Mentor (intero)  | `mentorship` | `3months`  |
| Master Mentor (3 rate)  | `mentorship` | `3months`  |

> ⚠️ Importante: l'email che il cliente usa al checkout Stripe **deve coincidere**
> con quella di registrazione sul sito, altrimenti il piano non viene trovato.

## Test

Stripe ha una modalità test webhook: dopo aver creato l'endpoint, usa
**"Send test event"** con `checkout.session.completed` per verificare i log
della function (Supabase → Edge Functions → Logs).
