export type AssetSymbol = "BTC" | "ETH" | "USDT";

export type TxType = "receive" | "send" | "deposit" | "buy" | "swap";

export interface Tx {
  id: string;
  type: TxType;
  asset: AssetSymbol;
  amount: number; // in asset units, always positive
  usdAtTime: number; // usd value at the time of the tx
  address: string; // counterparty address
  status: "completed" | "pending";
  timestamp: number; // epoch ms
  note?: string;
  fee?: number; // asset units
  // swap-only: the credited side. `asset`/`amount` hold the debited (from) side.
  toAsset?: AssetSymbol;
  toAmount?: number;
}

export interface Asset {
  symbol: AssetSymbol;
  name: string;
  balance: number;
  color: string;
}
