# Grafici indicatori macro (FRED)

I grafici degli indicatori usano i dati di **FRED** (Federal Reserve Economic
Data) tramite una Edge Function proxy.

## 1. API key FRED (gratuita)
- Vai su https://fred.stlouisfed.org/docs/api/api_key.html
- Crea account e richiedi una **API key** (32 caratteri).

## 2. Deploy della Edge Function
Supabase → **Edge Functions** → nuova function `fred-series` → incolla il
contenuto di `functions/fred-series/index.ts` → Deploy.

Disattiva **"Verify JWT"** non è necessario qui (la chiamiamo dal sito con la
sessione utente), ma se preferisci puoi lasciarlo attivo: il frontend usa
`supabase.functions.invoke` che passa il token automaticamente.

## 3. Secret
Edge Functions → **Secrets** → aggiungi:
- `FRED_API_KEY` = la tua chiave FRED

## Serie usate
| Indicatore | Serie FRED |
|---|---|
| Tasso Fed | FEDFUNDS |
| Inflazione CPI YoY | CPIAUCSL (calcolo YoY) |
| Core CPI YoY | CPILFESL (calcolo YoY) |
| Disoccupazione | UNRATE |
| Crescita PIL | A191RL1Q225SBEA |
| Non-Farm Payrolls | PAYEMS |
| Consumer Sentiment (Michigan) | UMCSENT |

> ISM Manufacturing/Services non sono inclusi: i dati ISM sono sotto licenza e
> non disponibili gratuitamente.
