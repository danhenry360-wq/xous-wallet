import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, Plus, ShieldCheck } from "lucide-react";
import { Modal } from "./Modal";
import { AssetGlyph } from "./AssetGlyph";
import { AssetSymbol, Tx } from "../lib/types";
import { ASSET_META } from "../lib/seed";
import { usd, coin } from "../lib/format";

type Step = "form" | "sending" | "done";

const PRESETS = [50, 100, 250, 1000];
const FEE_PCT = 0.015; // 1.5% processing fee

function randomHash(asset: AssetSymbol) {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 60; i++) s += hex[Math.floor(Math.random() * 16)];
  return asset === "BTC" ? s : "0x" + s;
}

export function BuyModal({
  open,
  onClose,
  prices,
  onBuy,
}: {
  open: boolean;
  onClose: () => void;
  prices: Record<AssetSymbol, number>;
  onBuy: (tx: Tx) => void;
}) {
  const [asset, setAsset] = useState<AssetSymbol>("BTC");
  const [spend, setSpend] = useState("100");
  const [step, setStep] = useState<Step>("form");

  const usdSpend = parseFloat(spend) || 0;
  const fee = usdSpend * FEE_PCT;
  const netUsd = Math.max(0, usdSpend - fee);
  const received = netUsd / prices[asset];

  const error = useMemo(() => {
    if (usdSpend < 10) return "Minimum purchase is $10";
    if (usdSpend > 50000) return "Maximum is $50,000";
    return null;
  }, [usdSpend]);

  const reset = () => {
    setAsset("BTC");
    setSpend("100");
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
        id: randomHash(asset).slice(0, 12),
        type: "buy",
        asset,
        amount: received,
        usdAtTime: usdSpend,
        address: "Visa •••• 4242",
        status: "completed",
        timestamp: Date.now(),
        note: "Card purchase",
      };
      onBuy(tx);
      setStep("done");
    }, 1600);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={step === "done" ? "Purchase complete" : "Buy crypto"}
      subtitle={
        step === "done"
          ? "Your simulated purchase settled instantly"
          : "Simulated card purchase — credited to your wallet"
      }
    >
      {step === "form" && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
              You buy
            </label>
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
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
              You pay (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">
                $
              </span>
              <input
                value={spend}
                onChange={(e) => setSpend(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                className="tabular w-full rounded-2xl border border-white/10 bg-ink-700 px-4 py-3 pl-8 text-lg font-semibold text-white outline-none transition focus:border-accent/60"
              />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSpend(String(p))}
                  className={`rounded-xl border py-1.5 text-xs font-semibold transition ${
                    usdSpend === p
                      ? "border-accent/60 bg-accent/10 text-accent-glow"
                      : "border-white/10 bg-ink-700 text-gray-300 hover:border-white/20"
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-white/10 bg-ink-700 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">You receive</span>
              <span className="tabular font-semibold text-white">
                {coin(received)} {asset}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rate</span>
              <span className="tabular text-gray-300">
                {usd(prices[asset])} / {asset}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Processing fee (1.5%)</span>
              <span className="tabular text-gray-300">{usd(fee)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-700 px-4 py-3">
            <CreditCard size={18} className="text-accent-glow" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Visa •••• 4242</p>
              <p className="text-xs text-gray-500">Default payment method</p>
            </div>
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-semibold text-gray-400">
              DEMO
            </span>
          </div>

          <button
            disabled={!!error}
            onClick={confirm}
            className="w-full rounded-2xl bg-accent-grad py-3.5 text-sm font-semibold text-white shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {error || `Buy ${coin(received)} ${asset} for ${usd(usdSpend)}`}
          </button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck size={13} /> Simulated — no card is charged
          </div>
        </div>
      )}

      {step === "sending" && (
        <div className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="animate-spin text-accent-glow" size={40} />
          <p className="text-sm text-gray-300">Processing payment…</p>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="pop">
            <CheckCircle2 className="text-money-up" size={64} strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="tabular text-2xl font-bold text-money-up">
              +{coin(received)} {asset}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              for {usd(usdSpend)} · {usd(prices[asset])}/{asset}
            </p>
          </div>
          <button
            onClick={close}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-grad py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            <Plus size={16} /> Done
          </button>
        </div>
      )}
    </Modal>
  );
}
