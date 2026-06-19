import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "./Modal";
import { usd } from "../lib/format";

export function SettingsModal({
  open,
  onClose,
  btcFeeUsd,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  btcFeeUsd: number;
  onSave: (btcFeeUsd: number) => void;
}) {
  const [value, setValue] = useState(String(btcFeeUsd));

  // Keep the field in sync when the modal (re)opens.
  useEffect(() => {
    if (open) setValue(String(btcFeeUsd));
  }, [open, btcFeeUsd]);

  const parsed = parseFloat(value);
  const valid = !isNaN(parsed) && parsed >= 0;

  const save = () => {
    if (!valid) return;
    onSave(parsed);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      subtitle="Configure your wallet preferences"
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-400">
            Bitcoin network fee
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">
              $
            </span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="150"
              inputMode="decimal"
              className="tabular w-full rounded-2xl border border-white/10 bg-ink-700 py-3 pl-9 pr-4 text-lg font-semibold text-white outline-none transition placeholder:text-gray-600 focus:border-accent/60"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Flat fee you must confirm before each Bitcoin transfer.
          </p>
        </div>

        <button
          disabled={!valid}
          onClick={save}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-grad py-3.5 text-sm font-semibold text-white shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={16} />
          {valid ? `Save · ${usd(parsed)} fee` : "Enter a valid amount"}
        </button>
      </div>
    </Modal>
  );
}
