# Trading Journal — permesso di modifica

Aggiunge la policy UPDATE mancante: senza questa, ogni utente poteva solo
creare ed eliminare i propri trade, non modificarli.

Supabase → **SQL Editor** → esegui:

```sql
create policy "trades update own" on public.trades for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```
