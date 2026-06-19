import { Tx, AssetSymbol, Asset } from "./types";

export const STORAGE_KEY = "xous-wallet:v1";

export const WALLET_ADDRESSES: Record<AssetSymbol, string> = {
  BTC: "bc1qx0us9p4r7e2vhk3m8zql5n6td0fj8ya2cw4rq2",
  ETH: "0x7Af3C1b9E0d2A45F8c6B1e3D9a07F2b4C8e15D6a",
  USDT: "0x7Af3C1b9E0d2A45F8c6B1e3D9a07F2b4C8e15D6a",
};

export const ASSET_META: Record<AssetSymbol, Omit<Asset, "balance">> = {
  BTC: { symbol: "BTC", name: "Bitcoin", color: "#f7931a" },
  ETH: { symbol: "ETH", name: "Ethereum", color: "#627eea" },
  USDT: { symbol: "USDT", name: "Tether", color: "#26a17b" },
};

const t = (iso: string) => new Date(iso).getTime();

// Seeded, simulated ledger — May → June 2026.
// BTC deposits/receives/buys net to 3.0, less the small send fees below.
export const SEED_TXS: Tx[] = [
  // ---- BTC ----
  {
    id: "btc-001",
    type: "deposit",
    asset: "BTC",
    amount: 1.5,
    usdAtTime: 1.5 * 96000,
    address: "bc1qp9f0e7s2t4u6v8w0x2y4z6a8b0c2d4e6f8g0h2",
    status: "completed",
    timestamp: t("2026-05-03T14:23:00"),
    note: "Cold storage transfer",
  },
  {
    id: "btc-002",
    type: "receive",
    asset: "BTC",
    amount: 0.85,
    usdAtTime: 0.85 * 98500,
    address: "bc1qm3n5b7v9c1x3z5l7k9j1h3g5f7d9s1a3q5w7e9",
    status: "completed",
    timestamp: t("2026-05-09T09:11:00"),
    note: "Invoice #2291 settlement",
  },
  {
    id: "btc-003",
    type: "buy",
    asset: "BTC",
    amount: 0.2,
    usdAtTime: 0.2 * 99800,
    address: "Xous Exchange",
    status: "completed",
    timestamp: t("2026-05-14T17:46:00"),
    note: "Recurring buy",
  },
  {
    id: "btc-004",
    type: "send",
    asset: "BTC",
    amount: 0.25,
    usdAtTime: 0.25 * 101200,
    address: "bc1qz8y6w4t2r0e8d6c4b2a0q8w6e4r2t0y8u6i4o2",
    status: "completed",
    timestamp: t("2026-05-20T11:38:00"),
    fee: 0.00012,
    note: "Hardware purchase",
  },
  {
    id: "btc-005",
    type: "receive",
    asset: "BTC",
    amount: 0.6,
    usdAtTime: 0.6 * 100400,
    address: "bc1q4r6t8y0u2i4o6p8a0s2d4f6g8h0j2k4l6z8x0c",
    status: "completed",
    timestamp: t("2026-05-27T20:02:00"),
    note: "Affiliate payout",
  },
  {
    id: "btc-006",
    type: "send",
    asset: "BTC",
    amount: 0.15,
    usdAtTime: 0.15 * 103100,
    address: "bc1q7g9h1j3k5l7z9x1c3v5b7n9m1q3w5e7r9t1y3u",
    status: "completed",
    timestamp: t("2026-06-02T08:54:00"),
    fee: 0.0001,
    note: "Vendor invoice",
  },
  {
    id: "btc-007",
    type: "buy",
    asset: "BTC",
    amount: 0.2,
    usdAtTime: 0.2 * 102600,
    address: "Xous Exchange",
    status: "completed",
    timestamp: t("2026-06-07T16:20:00"),
    note: "Recurring buy",
  },
  {
    id: "btc-008",
    type: "receive",
    asset: "BTC",
    amount: 0.1,
    usdAtTime: 0.1 * 104000,
    address: "bc1q2w4e6r8t0y2u4i6o8p0a2s4d6f8g0h2j4k6l8z",
    status: "completed",
    timestamp: t("2026-06-11T13:07:00"),
    note: "Refund",
  },
  {
    id: "btc-009",
    type: "send",
    asset: "BTC",
    amount: 0.05,
    usdAtTime: 0.05 * 104250,
    address: "bc1q9p7o5i3u1y9t7r5e3w1q9z7x5c3v1b9n7m5q3w",
    status: "completed",
    timestamp: t("2026-06-14T19:45:00"),
    fee: 0.00009,
    note: "Coffee with a friend",
  },

  // ---- ETH ----
  {
    id: "eth-001",
    type: "deposit",
    asset: "ETH",
    amount: 3.0,
    usdAtTime: 3.0 * 5180,
    address: "0x9c2A4f6E8b0D1a3C5e7F9b1D3a5C7e9F1b3D5a7C",
    status: "completed",
    timestamp: t("2026-05-06T10:15:00"),
    note: "Wallet migration",
  },
  {
    id: "eth-002",
    type: "receive",
    asset: "ETH",
    amount: 1.5,
    usdAtTime: 1.5 * 5420,
    address: "0x3b5D7f9A1c3E5b7D9f1A3c5E7b9D1f3A5c7E9b1D",
    status: "completed",
    timestamp: t("2026-05-18T22:31:00"),
    note: "NFT royalty",
  },
  {
    id: "eth-003",
    type: "send",
    asset: "ETH",
    amount: 0.3,
    usdAtTime: 0.3 * 5510,
    address: "0x6e8F0a2C4b6D8f0A2c4E6b8D0f2A4c6E8b0D2f4A",
    status: "completed",
    timestamp: t("2026-06-04T15:09:00"),
    fee: 0.0021,
    note: "Gas + bridge",
  },

  // ---- USDT ----
  {
    id: "usdt-001",
    type: "deposit",
    asset: "USDT",
    amount: 8000,
    usdAtTime: 8000,
    address: "0x1a3C5e7B9d1F3a5C7e9B1d3F5a7C9e1B3d5F7a9C",
    status: "completed",
    timestamp: t("2026-05-11T12:00:00"),
    note: "Bank on-ramp",
  },
  {
    id: "usdt-002",
    type: "send",
    asset: "USDT",
    amount: 3000,
    usdAtTime: 3000,
    address: "0x5c7E9b1D3f5A7c9E1b3D5f7A9c1E3b5D7f9A1c3E",
    status: "completed",
    timestamp: t("2026-06-09T18:42:00"),
    note: "Contractor payment",
  },
];

export function signedAmount(tx: Tx): number {
  // amount on the primary `asset`: sends and the "from" side of swaps debit it.
  return tx.type === "send" || tx.type === "swap" ? -tx.amount : tx.amount;
}

export function balancesFrom(txs: Tx[]): Record<AssetSymbol, number> {
  const bal: Record<AssetSymbol, number> = { BTC: 0, ETH: 0, USDT: 0 };
  for (const tx of txs) {
    if (tx.status !== "completed") continue;
    bal[tx.asset] += signedAmount(tx);
    // a send's network fee is debited on top of the amount sent
    if (tx.type === "send" && tx.fee) {
      bal[tx.asset] -= tx.fee;
    }
    // swap credits the "to" asset
    if (tx.type === "swap" && tx.toAsset && tx.toAmount) {
      bal[tx.toAsset] += tx.toAmount;
    }
  }
  // keep float noise out of the headline numbers
  (Object.keys(bal) as AssetSymbol[]).forEach((k) => {
    bal[k] = Math.round(bal[k] * 1e8) / 1e8;
  });
  return bal;
}
