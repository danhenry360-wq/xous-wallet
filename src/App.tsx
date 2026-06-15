import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  Settings,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AssetGlyph } from "./components/AssetGlyph";
import { PortfolioChart } from "./components/PortfolioChart";
import { SendModal } from "./components/SendModal";
import { ReceiveModal } from "./components/ReceiveModal";
import { BuyModal } from "./components/BuyModal";
import { SwapModal } from "./components/SwapModal";
import { useLedger } from "./lib/store";
import { ASSET_META, balancesFrom } from "./lib/seed";
import { fetchPrices, PriceData } from "./lib/price";
import { AssetSymbol, Tx, TxType } from "./lib/types";
import { usd, coin, dateLong, shortAddr } from "./lib/format";

const TX_ICON: Record<TxType, JSX.Element> = {
  receive: <ArrowDownLeft size={16} />,
  deposit: <ArrowDownLeft size={16} />,
  send: <ArrowUpRight size={16} />,
  buy: <Plus size={16} />,
  swap: <Repeat size={16} />,
};

const TX_LABEL: Record<TxType, string> = {
  receive: "Received",
  deposit: "Deposit",
  send: "Sent",
  buy: "Bought",
  swap: "Swapped",
};

type Filter = "all" | "send" | "receive";

export default function App() {
  const { txs, addTx, reset } = useLedger();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [sendOpen, setSendOpen] = useState(false);
  const [recvOpen, setRecvOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const loadPrices = async () => {
    setLoadingPrice(true);
    const d = await fetchPrices();
    setPriceData(d);
    setLoadingPrice(false);
  };

  useEffect(() => {
    loadPrices();
    const id = setInterval(loadPrices, 60_000);
    return () => clearInterval(id);
  }, []);

  const prices = priceData?.prices ?? { BTC: 104250, ETH: 5640, USDT: 1 };
  const change = priceData?.change24h ?? { BTC: 0, ETH: 0, USDT: 0 };

  const balances = useMemo(() => balancesFrom(txs), [txs]);

  const assetRows = useMemo(
    () =>
      (Object.keys(ASSET_META) as AssetSymbol[])
        .map((s) => ({
          ...ASSET_META[s],
          balance: balances[s],
          price: prices[s],
          value: balances[s] * prices[s],
          change: change[s],
        }))
        .filter((a) => a.balance > 0)
        .sort((a, b) => b.value - a.value),
    [balances, prices, change]
  );

  const totalValue = assetRows.reduce((sum, a) => sum + a.value, 0);

  // weighted 24h change across holdings
  const total24h = assetRows.reduce((sum, a) => sum + (a.value * a.change) / 100, 0);
  const total24hPct = totalValue > 0 ? (total24h / totalValue) * 100 : 0;

  const filtered = useMemo(() => {
    return txs.filter((t) => {
      if (filter === "send" && t.type !== "send") return false;
      if (filter === "receive" && !["receive", "deposit"].includes(t.type)) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          t.address.toLowerCase().includes(q) ||
          t.asset.toLowerCase().includes(q) ||
          (t.note?.toLowerCase().includes(q) ?? false) ||
          t.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [txs, filter, query]);

  const fireToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleSend = (tx: Tx) => {
    addTx(tx);
    fireToast(`Sent ${coin(tx.amount)} ${tx.asset}`);
  };
  const handleDeposit = (tx: Tx) => {
    addTx(tx);
    fireToast(`Received ${coin(tx.amount)} ${tx.asset}`);
  };
  const handleBuy = (tx: Tx) => {
    addTx(tx);
    fireToast(`Bought ${coin(tx.amount)} ${tx.asset}`);
  };
  const handleSwap = (tx: Tx) => {
    addTx(tx);
    fireToast(`Swapped ${coin(tx.amount)} ${tx.asset} → ${coin(tx.toAmount ?? 0)} ${tx.toAsset}`);
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-5 sm:px-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-grad shadow-glow">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              Xous <span className="text-accent-glow">Wallet</span>
            </h1>
            <p className="-mt-0.5 text-[11px] font-medium text-gray-500">
              Self-custody · Multi-chain
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-ink-700 px-3 py-1.5 text-xs font-medium text-gray-300 sm:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                priceData?.live ? "bg-money-up" : "bg-amber-400"
              } ${loadingPrice ? "animate-pulse" : ""}`}
            />
            {priceData?.live ? "Live prices" : "Offline prices"}
          </span>
          <IconButton onClick={loadPrices}>
            <RefreshCw size={17} className={loadingPrice ? "animate-spin" : ""} />
          </IconButton>
          <IconButton>
            <Bell size={17} />
          </IconButton>
          <IconButton>
            <Settings size={17} />
          </IconButton>
        </div>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Balance hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-card-grad p-6 shadow-card sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total balance</p>
              <div className="mt-1.5 flex items-end gap-3">
                <h2 className="tabular text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {usd(totalValue)}
                </h2>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span
                  className={`tabular flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                    total24hPct >= 0
                      ? "bg-money-up/10 text-money-up"
                      : "bg-money-down/10 text-money-down"
                  }`}
                >
                  {total24hPct >= 0 ? "▲" : "▼"} {Math.abs(total24hPct).toFixed(2)}%
                </span>
                <span className="tabular text-gray-500">
                  {total24h >= 0 ? "+" : "-"}
                  {usd(Math.abs(total24h))} today
                </span>
              </div>
            </div>
            <div className="hidden flex-col items-end sm:flex">
              <div className="flex items-center gap-1.5 rounded-full border border-money-up/30 bg-money-up/10 px-3 py-1 text-xs font-semibold text-money-up">
                <ShieldCheck size={13} /> Secured
              </div>
              <p className="mt-2 font-mono text-[11px] text-gray-500">
                {coin(balances.BTC)} BTC primary
              </p>
            </div>
          </div>

          <PortfolioChart txs={txs} livePrices={prices} />

          {/* Action buttons */}
          <div className="mt-5 grid grid-cols-4 gap-2.5">
            <ActionBtn primary onClick={() => setSendOpen(true)} icon={<ArrowUpRight size={18} />}>
              Send
            </ActionBtn>
            <ActionBtn onClick={() => setRecvOpen(true)} icon={<ArrowDownLeft size={18} />}>
              Deposit
            </ActionBtn>
            <ActionBtn onClick={() => setBuyOpen(true)} icon={<Plus size={18} />}>
              Buy
            </ActionBtn>
            <ActionBtn onClick={() => setSwapOpen(true)} icon={<Repeat size={18} />}>
              Swap
            </ActionBtn>
          </div>
        </section>

        {/* Assets */}
        <section className="rounded-3xl border border-white/10 bg-ink-800/60 p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Your assets</h3>
            <span className="text-xs text-gray-500">{assetRows.length} coins</span>
          </div>
          <div className="space-y-1.5">
            {assetRows.map((a) => (
              <div
                key={a.symbol}
                className="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 transition hover:border-white/10 hover:bg-ink-700"
              >
                <AssetGlyph symbol={a.symbol} color={a.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{a.name}</p>
                    <span
                      className={`tabular text-[11px] font-medium ${
                        a.change >= 0 ? "text-money-up" : "text-money-down"
                      }`}
                    >
                      {a.change >= 0 ? "+" : ""}
                      {a.change.toFixed(2)}%
                    </span>
                  </div>
                  <p className="tabular text-xs text-gray-500">{usd(a.price)}</p>
                </div>
                <div className="text-right">
                  <p className="tabular font-semibold text-white">{usd(a.value)}</p>
                  <p className="tabular text-xs text-gray-500">
                    {coin(a.balance)} {a.symbol}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Transactions */}
      <section className="mt-5 rounded-3xl border border-white/10 bg-ink-800/60 p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-white">Transaction history</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-40 rounded-xl border border-white/10 bg-ink-700 py-2 pl-8 pr-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-accent/60 focus:w-52"
              />
            </div>
            <div className="flex rounded-xl border border-white/10 bg-ink-700 p-0.5">
              {(["all", "receive", "send"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    filter === f ? "bg-accent text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {f === "receive" ? "In" : f === "send" ? "Out" : "All"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-white/5">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-500">No transactions found.</p>
          )}
          {filtered.map((t) => {
            const out = t.type === "send";
            const isSwap = t.type === "swap";
            return (
              <div
                key={t.id}
                className="flex items-center gap-4 py-3.5 transition hover:bg-white/[0.015]"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isSwap
                      ? "bg-accent/10 text-accent-glow"
                      : out
                      ? "bg-money-down/10 text-money-down"
                      : "bg-money-up/10 text-money-up"
                  }`}
                >
                  {TX_ICON[t.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{TX_LABEL[t.type]}</p>
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400">
                      {isSwap ? `${t.asset}→${t.toAsset}` : t.asset}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    {isSwap ? (
                      <>via <span className="font-mono">{t.address}</span></>
                    ) : (
                      <>
                        {out ? "To " : "From "}
                        <span className="font-mono">{shortAddr(t.address)}</span>
                      </>
                    )}
                    {!isSwap && t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-gray-500">{dateLong(t.timestamp)}</p>
                  <p className="flex items-center justify-end gap-1 text-[11px] text-money-up">
                    <CheckCircle2 size={11} /> {t.status}
                  </p>
                </div>
                <div className="w-28 shrink-0 text-right sm:w-32">
                  {isSwap ? (
                    <>
                      <p className="tabular font-semibold text-money-up">
                        +{coin(t.toAmount ?? 0, t.toAsset === "USDT" ? 2 : 6)} {t.toAsset}
                      </p>
                      <p className="tabular text-xs text-money-down">
                        -{coin(t.amount)} {t.asset}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        className={`tabular font-semibold ${
                          out ? "text-white" : "text-money-up"
                        }`}
                      >
                        {out ? "-" : "+"}
                        {coin(t.amount)} {t.asset}
                      </p>
                      <p className="tabular text-xs text-gray-500">{usd(t.usdAtTime)}</p>
                    </>
                  )}
                </div>
                <ChevronRight size={16} className="hidden shrink-0 text-gray-600 sm:block" />
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            reset();
            fireToast("Wallet reset");
          }}
          className="mt-5 flex items-center gap-1.5 text-xs font-medium text-gray-600 transition hover:text-gray-400"
        >
          <RefreshCw size={12} /> Reset wallet
        </button>
      </section>

      <footer className="mt-8 text-center text-[11px] text-gray-600">
        Xous Wallet · Self-custody · Your keys, your crypto.
      </footer>

      <SendModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        balances={balances}
        prices={prices}
        onSend={handleSend}
      />
      <ReceiveModal
        open={recvOpen}
        onClose={() => setRecvOpen(false)}
        prices={prices}
        onDeposit={handleDeposit}
      />
      <BuyModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        prices={prices}
        onBuy={handleBuy}
      />
      <SwapModal
        open={swapOpen}
        onClose={() => setSwapOpen(false)}
        balances={balances}
        prices={prices}
        onSwap={handleSwap}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 fadeup">
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-ink-700 px-4 py-3 shadow-card">
            <CheckCircle2 size={18} className="text-money-up" />
            <span className="text-sm font-medium text-white">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-ink-700 text-gray-400 transition hover:border-white/20 hover:text-white"
    >
      {children}
    </button>
  );
}

function ActionBtn({
  children,
  icon,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-semibold transition ${
        primary
          ? "bg-accent-grad text-white shadow-glow hover:brightness-110"
          : "border border-white/10 bg-ink-700 text-gray-200 hover:border-white/20 hover:bg-ink-600"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
