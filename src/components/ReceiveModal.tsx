import { useState } from "react";
import { Copy, Check, Download, Plus } from "lucide-react";
import { Modal } from "./Modal";
import { AssetGlyph } from "./AssetGlyph";
import { FauxQR } from "./FauxQR";
import { AssetSymbol, Tx } from "../lib/types";
import { ASSET_META, WALLET_ADDRESSES } from "../lib/seed";
import { coin, usd } from "../lib/format";

function randomHash(asset: AssetSymbol) {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 60; i++) s += hex[Math.floor(Math.random() * 16)];
  return asset === "BTC" ? s : "0x" + s;
}

export function ReceiveModal({
  open,
  onClose,
  prices,
  onDeposit,
}: {
  open: boolean;
  onClose: () => void;
  prices: Record<AssetSymbol, number>;
  onDeposit: (tx: Tx) => void;
}) {
  const [asset, setAsset] = useState<AssetSymbol>("BTC");
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const addr = WALLET_ADDRESSES[asset];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(addr);
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const simulateDeposit = () => {
    const amt = parseFloat(amount) || (asset === "USDT" ? 500 : asset === "ETH" ? 0.5 : 0.05);
    const tx: Tx = {
      id: randomHash(asset).slice(0, 12),
      type: "deposit",
      asset,
      amount: amt,
      usdAtTime: amt * prices[asset],
      address: addr,
      status: "completed",
      timestamp: Date.now(),
      note: "Incoming deposit",
    };
    onDeposit(tx);
    setAmount("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deposit / Receive"
      subtitle="Share your address to receive funds"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(ASSET_META) as AssetSymbol[]).map((s) => (
            <button
              key={s}
              onClick={() => setAsset(s)}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition ${
                asset === s
                  ? "border-accent/60 bg-accent/10"
                  : "border-white/10 bg-ink-700 hover:border-white/20"
              }`}
            >
              <AssetGlyph symbol={s} size={26} color={ASSET_META[s].color} />
              <span className="text-sm font-semibold">{s}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <FauxQR seed={addr} />
          <p className="mt-3 text-xs text-gray-500">
            Your {ASSET_META[asset].name} address
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-700 p-2 pl-4">
          <span className="flex-1 break-all font-mono text-xs text-gray-300">{addr}</span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-xl bg-accent/15 px-3 py-2 text-xs font-semibold text-accent-glow transition hover:bg-accent/25"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="rounded-2xl border border-dashed border-white/15 bg-ink-700/50 p-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            <Download size={13} /> Request a deposit
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder={asset === "USDT" ? "500" : asset === "ETH" ? "0.50" : "0.05"}
                inputMode="decimal"
                className="tabular w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-2.5 pr-14 text-sm font-semibold text-white outline-none focus:border-accent/60"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                {asset}
              </span>
            </div>
            <button
              onClick={simulateDeposit}
              className="flex items-center gap-1.5 rounded-xl bg-money-up/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-money-up"
            >
              <Plus size={15} /> Receive
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Credits your wallet instantly · {usd(prices[asset])} per {asset}
          </p>
        </div>
      </div>
    </Modal>
  );
}
