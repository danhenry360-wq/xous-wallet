import { useMemo, useState } from "react";
import { ArrowDown, CheckCircle2, Loader2, Repeat, ShieldCheck } from "lucide-react";
import { Modal } from "./Modal";
import { AssetGlyph } from "./AssetGlyph";
import { AssetSymbol, Tx } from "../lib/types";
import { ASSET_META } from "../lib/seed";
import { usd, coin } from "../lib/format";

type Step = "form" | "sending" | "done";

const SLIPPAGE = 0.005; // 0.5% simulated swap fee/slippage

function randomHash() {
  const hex = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 60; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

export function SwapModal({
  open,
  onClose,
  balances,
  prices,
  onSwap,
}: {
  open: boolean;
  onClose: () => void;
  balances: Record<AssetSymbol, number>;
  prices: Record<AssetSymbol, number>;
  onSwap: (tx: Tx) => void;
}) {
  const [from, setFrom] = useState<AssetSymbol>("BTC");
  const [to, setTo] = useState<AssetSymbol>("ETH");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("form");

  const amt = parseFloat(amount) || 0;
  const fromUsd = amt * prices[from];
  const rate = prices[from] / prices[to];
  const received = amt * rate * (1 - SLIPPAGE);
  const bal = balances[from];

  const error = useMemo(() => {
    if (from === to) return "Pick two different assets";
    if (amt <= 0) return "Enter an amount";
    if (amt > bal) return "Insufficient balance";
    return null;
  }, [from, to, amt, bal]);

  const flip = () => {
    setFrom(to);
    setTo(from);
    setAmount("");
  };

  const reset = () => {
    setFrom("BTC");
    setTo("ETH");
    setAmount("");
    setStep("form");
  };
  const close = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const confirm = () => {
    setStep("sending");
    setTimeout(() => {
      const tx: Tx = {
        id: randomHash().slice(0, 12),
        type: "swap",
        asset: from,
        amount: amt,
        usdAtTime: fromUsd,
        address: "Xous Swap",
        status: "completed",
        timestamp: Date.now(),
        toAsset: to,
        toAmount: received,
        note: `${from} → ${to}`,
      };
      onSwap(tx);
      setStep("done");
    }, 1600);
  };

  const Picker = ({
    value,
    onPick,
    exclude,
  }: {
    value: AssetSymbol;
    onPick: (s: AssetSymbol) => void;
    exclude?: AssetSymbol;
  }) => (
    <div className="flex gap-1.5">
      {(Object.keys(ASSET_META) as AssetSymbol[])
        .filter((s) => s !== exclude)
        .map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
              value === s
                ? "border-accent/60 bg-accent/10 text-white"
                : "border-white/10 bg-ink-800 text-gray-400 hover:border-white/20"
            }`}
          >
            <AssetGlyph symbol={s} size={18} color={ASSET_META[s].color} />
            {s}
          </button>
        ))}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={close}
      title={step === "done" ? "Swap complete" : "Swap crypto"}
      subtitle={
        step === "done"
          ? "Your simulated swap settled instantly"
          : "Simulated swap — balances update instantly"
      }
    >
      {step === "form" && (
        <div className="space-y-3">
          {/* From */}
          <div className="rounded-2xl border border-white/10 bg-ink-700 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                From
              </span>
              <Picker value={from} onPick={setFrom} exclude={to} />
            </div>
            <div className="flex items-center gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                inputMode="decimal"
                className="tabular min-w-0 flex-1 bg-transparent text-2xl font-bold text-white outline-none placeholder:text-gray-600"
              />
              <button
                onClick={() => setAmount(String(bal))}
                className="rounded-lg bg-accent/15 px-2 py-1 text-xs font-semibold text-accent-glow transition hover:bg-accent/25"
              >
                MAX
              </button>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>≈ {usd(fromUsd)}</span>
              <span>
                Balance: {coin(bal)} {from}
              </span>
            </div>
          </div>

          {/* Flip */}
          <div className="relative flex justify-center">
            <button
              onClick={flip}
              className="absolute -top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-ink-600 text-accent-glow shadow-card transition hover:rotate-180 hover:border-accent/50"
            >
              <ArrowDown size={16} />
            </button>
          </div>

          {/* To */}
          <div className="rounded-2xl border border-white/10 bg-ink-700 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                To (estimated)
              </span>
              <Picker value={to} onPick={setTo} exclude={from} />
            </div>
            <div className="tabular text-2xl font-bold text-white">
              {received > 0 ? coin(received, to === "USDT" ? 2 : 6) : "0.00"}
            </div>
            <div className="mt-1 text-xs text-gray-500">≈ {usd(received * prices[to])}</div>
          </div>

          <div className="space-y-1.5 rounded-2xl border border-white/10 bg-ink-700 p-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Rate</span>
              <span className="tabular text-gray-300">
                1 {from} = {coin(rate, 6)} {to}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network + slippage (0.5%)</span>
              <span className="tabular text-gray-300">{usd(fromUsd * SLIPPAGE)}</span>
            </div>
          </div>

          <button
            disabled={!!error}
            onClick={confirm}
            className="w-full rounded-2xl bg-accent-grad py-3.5 text-sm font-semibold text-white shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {error || `Swap ${from} for ${to}`}
          </button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck size={13} /> Simulated — no real assets are swapped
          </div>
        </div>
      )}

      {step === "sending" && (
        <div className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="animate-spin text-accent-glow" size={40} />
          <p className="text-sm text-gray-300">Executing swap…</p>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="pop">
            <CheckCircle2 className="text-money-up" size={64} strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="tabular text-xl font-bold text-white">
              <span className="text-money-down">-{coin(amt)} {from}</span>
              <span className="mx-2 text-gray-500">→</span>
              <span className="text-money-up">+{coin(received, to === "USDT" ? 2 : 6)} {to}</span>
            </p>
            <p className="mt-1 text-sm text-gray-400">≈ {usd(fromUsd)} swapped</p>
          </div>
          <button
            onClick={close}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-grad py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            <Repeat size={16} /> Done
          </button>
        </div>
      )}
    </Modal>
  );
}
