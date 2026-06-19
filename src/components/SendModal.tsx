import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "./Modal";
import { AssetGlyph } from "./AssetGlyph";
import { AssetSymbol, Tx } from "../lib/types";
import { ASSET_META } from "../lib/seed";
import { usd, coin } from "../lib/format";

type Step = "form" | "review" | "fee" | "sending" | "done";

const FEE_RATE: Record<AssetSymbol, number> = {
  BTC: 0.00009,
  ETH: 0.0018,
  USDT: 1.5,
};

function randomHash(asset: AssetSymbol) {
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 60; i++) s += hex[Math.floor(Math.random() * 16)];
  return asset === "BTC" ? s : "0x" + s;
}

export function SendModal({
  open,
  onClose,
  balances,
  prices,
  onSend,
  btcFeeUsd,
}: {
  open: boolean;
  onClose: () => void;
  balances: Record<AssetSymbol, number>;
  prices: Record<AssetSymbol, number>;
  onSend: (tx: Tx) => void;
  btcFeeUsd: number;
}) {
  const [asset, setAsset] = useState<AssetSymbol>("BTC");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [feeAck, setFeeAck] = useState(false);

  const amt = parseFloat(amount) || 0;
  // BTC fee is a configurable flat USD amount, converted to BTC at the live price.
  const fee =
    asset === "BTC"
      ? prices.BTC
        ? btcFeeUsd / prices.BTC
        : 0
      : FEE_RATE[asset];
  const bal = balances[asset];
  const usdValue = amt * prices[asset];
  const totalDebit = amt + fee;

  const error = useMemo(() => {
    if (!address.trim()) return "Enter a recipient address";
    if (address.trim().length < 12) return "Address looks too short";
    if (amt <= 0) return "Enter an amount";
    if (amt + fee > bal) return "Insufficient balance for amount + fee";
    return null;
  }, [address, amt, fee, bal]);

  const reset = () => {
    setAsset("BTC");
    setAddress("");
    setAmount("");
    setNote("");
    setStep("form");
    setFeeAck(false);
  };

  // BTC sends require an explicit $150 fee confirmation before broadcasting.
  const proceedFromReview = () => {
    if (asset === "BTC") {
      setFeeAck(false);
      setStep("fee");
    } else {
      confirm();
    }
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
        type: "send",
        asset,
        amount: amt,
        usdAtTime: usdValue,
        address: address.trim(),
        status: "completed",
        timestamp: Date.now(),
        fee,
        note: note.trim() || undefined,
      };
      onSend(tx);
      setStep("done");
    }, 1600);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={step === "done" ? "Transfer sent" : "Send crypto"}
      subtitle={
        step === "done"
          ? "Your transfer is confirmed"
          : "Transfer to any wallet address"
      }
    >
      {step === "form" && (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
              Asset
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
            <p className="mt-2 text-xs text-gray-500">
              Available:{" "}
              <span className="tabular font-medium text-gray-300">
                {coin(bal)} {asset}
              </span>
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
              Recipient address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={asset === "BTC" ? "bc1q…" : "0x…"}
              className="w-full rounded-2xl border border-white/10 bg-ink-700 px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-accent/60"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
              Amount
            </label>
            <div className="relative">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                inputMode="decimal"
                className="tabular w-full rounded-2xl border border-white/10 bg-ink-700 px-4 py-3 pr-28 text-lg font-semibold text-white outline-none transition placeholder:text-gray-600 focus:border-accent/60"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <button
                  onClick={() => setAmount(String(bal))}
                  className="rounded-lg bg-accent/15 px-2 py-1 text-xs font-semibold text-accent-glow transition hover:bg-accent/25"
                >
                  MAX
                </button>
                <span className="pr-1 text-sm font-semibold text-gray-400">{asset}</span>
              </div>
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-gray-500">
              <span>≈ {usd(usdValue)}</span>
              <span>
                Network fee: {coin(fee)} {asset}
              </span>
            </div>
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="w-full rounded-2xl border border-white/10 bg-ink-700 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-accent/60"
          />

          <button
            disabled={!!error}
            onClick={() => setStep("review")}
            className="w-full rounded-2xl bg-accent-grad py-3.5 text-sm font-semibold text-white shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {error || "Review transfer"}
          </button>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center py-2">
            <AssetGlyph symbol={asset} size={48} color={ASSET_META[asset].color} />
            <p className="tabular mt-3 text-3xl font-bold text-white">
              {coin(amt)} {asset}
            </p>
            <p className="mt-1 text-sm text-gray-400">≈ {usd(usdValue)}</p>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-ink-700 p-4 text-sm">
            <Row label="To" value={address} mono />
            <Row
              label="Network fee"
              value={asset === "BTC" ? usd(btcFeeUsd) : `${coin(fee)} ${asset}`}
            />
            <Row label="Total debit" value={`${coin(totalDebit)} ${asset}`} strong />
            {note && <Row label="Note" value={note} />}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-money-up/10 px-3 py-2 text-xs text-money-up">
            <ShieldCheck size={15} />
            Secured · transactions are end-to-end encrypted
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStep("form")}
              className="rounded-2xl border border-white/10 bg-ink-700 py-3 text-sm font-semibold text-gray-300 transition hover:border-white/20"
            >
              Back
            </button>
            <button
              onClick={proceedFromReview}
              className="flex items-center justify-center gap-2 rounded-2xl bg-accent-grad py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              <ArrowUpRight size={16} /> Confirm
            </button>
          </div>
        </div>
      )}

      {step === "fee" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center py-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
              <AlertTriangle size={28} />
            </div>
            <p className="mt-3 text-lg font-semibold text-white">
              Confirm network fee
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Bitcoin transfers carry a flat network fee that is deducted on top
              of the amount you send.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-ink-700 p-4 text-sm">
            <Row label="Sending" value={`${coin(amt)} ${asset}`} />
            <Row label="Bitcoin network fee" value={usd(btcFeeUsd)} strong />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-ink-700 px-4 py-3 text-sm text-gray-300 transition hover:border-white/20">
            <input
              type="checkbox"
              checked={feeAck}
              onChange={(e) => setFeeAck(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            />
            <span>
              I understand and agree to pay the{" "}
              <span className="font-semibold text-white">{usd(btcFeeUsd)}</span>{" "}
              Bitcoin network fee.
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStep("review")}
              className="rounded-2xl border border-white/10 bg-ink-700 py-3 text-sm font-semibold text-gray-300 transition hover:border-white/20"
            >
              Back
            </button>
            <button
              disabled={!feeAck}
              onClick={confirm}
              className="flex items-center justify-center gap-2 rounded-2xl bg-accent-grad py-3 text-sm font-semibold text-white shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUpRight size={16} /> Pay {usd(btcFeeUsd)} fee
            </button>
          </div>
        </div>
      )}

      {step === "sending" && (
        <div className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="animate-spin text-accent-glow" size={40} />
          <p className="text-sm text-gray-300">Broadcasting transaction…</p>
          <p className="font-mono text-xs text-gray-600">confirming on network</p>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="pop">
            <CheckCircle2 className="text-money-up" size={64} strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="tabular text-2xl font-bold text-white">
              -{coin(amt)} {asset}
            </p>
            <p className="mt-1 text-sm text-gray-400">Sent to {address.slice(0, 10)}…</p>
          </div>
          <div className="w-full space-y-3 rounded-2xl border border-white/10 bg-ink-700 p-4 text-sm">
            <Row label="Status" value="Completed" up />
            <Row
              label="Network fee"
              value={asset === "BTC" ? usd(btcFeeUsd) : `${coin(fee)} ${asset}`}
            />
            <Row label="Total debited" value={`${coin(totalDebit)} ${asset}`} strong />
            <Row label="Tx hash" value={randomHash(asset)} mono />
          </div>
          <button
            onClick={close}
            className="w-full rounded-2xl bg-accent-grad py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}

function Row({
  label,
  value,
  mono,
  strong,
  up,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
  up?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-gray-400">{label}</span>
      <span
        className={`break-all text-right ${mono ? "font-mono text-xs" : ""} ${
          strong ? "font-semibold text-white" : up ? "font-medium text-money-up" : "text-gray-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
