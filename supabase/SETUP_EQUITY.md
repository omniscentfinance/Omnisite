# Equity curve del Trading Journal

Aggiunge il balance iniziale (per utente) e il risultato numerico per trade.

Supabase → **SQL Editor**:

```sql
alter table public.profiles
  add column if not exists journal_start_balance numeric default 0;

alter table public.trades
  add column if not exists pnl_amount numeric default 0;
```

## Come funziona
- Ogni studente imposta il **balance iniziale** del conto (modificabile).
- In ogni report c'è il campo **Risultato (€)** (positivo o negativo).
- Il grafico a linea parte dal balance iniziale e somma i risultati in ordine
  cronologico: passando il mouse su un punto vedi il **balance** a quella data.
- L'admin, selezionando uno studente, vede la sua equity curve (sola lettura).
