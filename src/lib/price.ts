import { AssetSymbol } from "./types";

// Fallback prices used if the live API is unreachable (offline / rate limited).
// These are sane 2026 estimates; the UI clearly fetches live values when online.
export const FALLBACK_PRICES: Record<AssetSymbol, number> = {
  BTC: 104250,
  ETH: 5640,
  USDT: 1,
};

const COINGECKO_IDS: Record<AssetSymbol, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
};

export interface PriceData {
  prices: Record<AssetSymbol, number>;
  change24h: Record<AssetSymbol, number>;
  live: boolean;
}

export async function fetchPrices(): Promise<PriceData> {
  const ids = Object.values(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();

    const prices = { ...FALLBACK_PRICES };
    const change24h: Record<AssetSymbol, number> = { BTC: 0, ETH: 0, USDT: 0 };
    (Object.keys(COINGECKO_IDS) as AssetSymbol[]).forEach((sym) => {
      const node = data[COINGECKO_IDS[sym]];
      if (node?.usd) prices[sym] = node.usd;
      if (typeof node?.usd_24h_change === "number") change24h[sym] = node.usd_24h_change;
    });

    return { prices, change24h, live: true };
  } catch {
    return {
      prices: { ...FALLBACK_PRICES },
      change24h: { BTC: 1.84, ETH: 2.31, USDT: 0.01 },
      live: false,
    };
  }
}
