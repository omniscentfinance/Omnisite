import { useEffect, useRef } from "react";

const SYMBOLS = [
  { proName: "FOREXCOM:NSXUSD", title: "Nasdaq" },
  { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
  { proName: "FOREXCOM:DJI", title: "Dow Jones" },
  { proName: "TVC:GOLD", title: "Gold/USD" },
  { proName: "TVC:SILVER", title: "Silver/USD" },
  { proName: "FX:EURUSD", title: "EUR/USD" },
  { proName: "CAPITALCOM:DXY", title: "DXY" },
  { proName: "TVC:USOIL", title: "WTI" },
];

// Banner a scorrimento con le quotazioni principali (TradingView ticker tape).
export default function TickerBanner() {
  const ref = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    const s = document.createElement("script");
    s.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    s.async = true;
    s.innerHTML = JSON.stringify({
      symbols: SYMBOLS,
      colorTheme: "dark",
      isTransparent: true,
      showSymbolLogo: false,
      displayMode: "compact",
      locale: "it",
    });
    c.appendChild(s);
    return () => { c.innerHTML = ""; };
  }, []);

  return (
    <div className="fixed top-16 lg:top-20 left-0 right-0 z-40 h-[46px] bg-black overflow-hidden shadow-[0_8px_16px_-4px_rgba(0,0,0,0.9)]">
      <div ref={ref} className="tradingview-widget-container" />
    </div>
  );
}
