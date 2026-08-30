import { useState, useEffect } from "react";

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=monad&vs_currencies=usd";
const CACHE_KEY = "mon_price_cache";
const CACHE_TTL = 60_000; // 1 minute

interface MonPriceData {
  usd: number;
  timestamp: number;
}

export function useMonPrice() {
  const [monPriceUsd, setMonPriceUsd] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: MonPriceData = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_TTL) {
          setMonPriceUsd(data.usd);
          setLoading(false);
          return;
        }
      }
    } catch {}

    fetch(COINGECKO_API)
      .then((r) => r.json())
      .then((data) => {
        const price = data?.monad?.usd;
        if (price && typeof price === "number") {
          setMonPriceUsd(price);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ usd: price, timestamp: Date.now() }));
        }
      })
      .catch(() => {
        // Fallback price if API fails
        setMonPriceUsd(0.025);
      })
      .finally(() => setLoading(false));
  }, []);

  // Convert USDT amount to MON
  const usdtToMon = (usdtAmount: number): string => {
    if (!monPriceUsd || monPriceUsd <= 0) return "—";
    const mon = usdtAmount / monPriceUsd;
    // Format with appropriate decimals
    if (mon >= 1000) return mon.toFixed(0);
    if (mon >= 100) return mon.toFixed(1);
    return mon.toFixed(2);
  };

  return { monPriceUsd, loading, usdtToMon };
}
