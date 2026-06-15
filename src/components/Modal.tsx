import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md fadeup">
        <div className="m-3 overflow-hidden rounded-3xl border border-white/10 bg-ink-800 shadow-card">
          <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 pb-4 pt-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-6 pb-6 pt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
