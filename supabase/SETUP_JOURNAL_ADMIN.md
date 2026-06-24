# Trading Journal — vista admin (tutti i report)

Permette all'admin di leggere i trade di tutti gli studenti.

Supabase → **SQL Editor**:

```sql
create policy "trades admin select all" on public.trades for select
  using (public.is_admin());
```

> Le policy SELECT sono in OR: gli studenti continuano a vedere solo i propri,
> l'admin vede quelli di tutti. La scrittura resta limitata al proprietario.

## Come funziona nel sito
- Per l'**admin** compare un selettore studente in cima al Trading Journal.
- Selezionando uno studente, il calendario e i report mostrano i trade di
  quella persona (sola lettura).
