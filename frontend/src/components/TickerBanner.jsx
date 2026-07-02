import { useEffect, useRef } from "react";

const SYMBOLS = [
  { proName: "FOREXCOM:NSXUSD", title: "Nasdaq" },
  { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
  { proName: "FOREXCOM:DJI", title: "Dow Jones" },
  { proName: "TVC:GOLD", title: "Gold/USD" },
  { proName: "TVC:SILVER", title: "Silver/USD" },
  { proName: "FX:EURUSD", title: "EUR/USD" },
  { proName: "TVC:DXY", title: "DXY" },
  { proName: "TVC:VIX", title: "VIX" },
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
    <div className="fixed top-16 lg:top-20 left-0 right-0 z-40 h-[46px] border-b border-[#1E1E2A] bg-[#09090B] overflow-hidden">
      <div ref={ref} className="tradingview-widget-container" />
    </div>
  );
}
