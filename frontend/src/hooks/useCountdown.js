import { useEffect, useMemo, useState } from "react";

function split(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    total: s,
    done: ms <= 0,
  };
}

/**
 * Tempo che resta fino a `target`, aggiornato ogni secondo.
 * L'intervallo si ferma da solo quando arriva a zero.
 */
export function useCountdown(target) {
  const targetMs = useMemo(() => new Date(target).getTime(), [target]);
  const [left, setLeft] = useState(() => split(targetMs - Date.now()));

  useEffect(() => {
    // Ricalcolo subito: il tab può essere stato in background per ore.
    setLeft(split(targetMs - Date.now()));

    const id = setInterval(() => {
      const next = split(targetMs - Date.now());
      setLeft(next);
      if (next.done) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [targetMs]);

  return left;
}
