# Ticker di mercato (sito pubblico)

Il banner scorrevole con le quotazioni (Nasdaq, S&P 500, Dow Jones, Gold,
Silver, EUR/USD, DXY, VIX, WTI) usa i dati di **Twelve Data** tramite una
Edge Function proxy, così la API key non è mai esposta nel frontend.

## 1. API key Twelve Data (gratuita)
- Vai su https://twelvedata.com/ → **Get free API key**
- Piano free: 8 richieste/minuto — il ticker fa 1 sola richiesta (batch di
  9 simboli) ogni volta che viene ricaricato, quindi è ampiamente sufficiente.

## 2. Deploy della Edge Function
Supabase → **Edge Functions** → nuova function `market-quotes` → incolla il
contenuto di `functions/market-quotes/index.ts` → Deploy.

## 3. Secret
Edge Functions → **Secrets** → aggiungi:
- `TWELVE_DATA_API_KEY` = la tua chiave Twelve Data

(La key non va mai committata nel repo: resta solo nei secrets di Supabase.)

## Simboli usati
Alcuni simboli "puri" (indice VIX spot, DXY spot, XAG/USD) non sono
disponibili nel piano free di Twelve Data: usiamo ETF/coppie equivalenti.

| Etichetta | Simbolo Twelve Data | Nota |
|---|---|---|
| Nasdaq | QQQ | ETF Invesco QQQ (Nasdaq 100) |
| S&P 500 | SPY | ETF SPDR S&P 500 |
| Dow Jones | DIA | ETF SPDR Dow Jones |
| Gold/USD | XAU/USD | Oro spot |
| Silver/USD | SLV | ETF iShares Silver (XAG/USD è a pagamento) |
| EUR/USD | EUR/USD | Cambio spot |
| DXY | UUP | ETF Invesco DB US Dollar Index (proxy) |
| VIX | VIXY | ETF ProShares VIX Short-Term Futures (proxy) |
| WTI | USO | ETF United States Oil Fund |

## Come funziona
- Il frontend chiama `supabase.functions.invoke("market-quotes")`.
- La function fa 1 richiesta batch a Twelve Data e restituisce prezzo +
  variazione % giornaliera per ciascun simbolo.
- Il componente `TickerBanner.jsx` mostra i dati in un nastro scorrevole
  CSS, senza branding esterno, con ricaricamento periodico (ogni 60s).
