# Xous Wallet

A polished, **fully simulated** multi-chain crypto wallet UI. No real keys, funds, or
blockchain transactions — everything is local and seeded for demo/portfolio use.

## Features
- **3.00000000 BTC** seeded balance (plus ETH + USDT holdings) valued at the **live**
  Bitcoin price from CoinGecko, with an offline fallback.
- Seeded transaction history spanning **May → June 2026** (deposits, receives, buys, sends).
- **Send** flow that debits the balance (asset picker → address → amount → review →
  broadcast animation → confirmed with tx hash).
- **Deposit / Receive** flow with address, copy button, QR-style code, and a
  "simulate incoming deposit" action that credits the balance.
- Portfolio value chart, per-asset 24h change, searchable + filterable history.
- All state persists in `localStorage` (key `xous-wallet:v1`). "Reset demo data"
  restores the seeded ledger.

## Stack
Vite · React · TypeScript · Tailwind CSS · Recharts · lucide-react

## Run
```bash
npm install
npm run dev      # http://localhost:5180  (LAN: http://192.168.1.109:5180)
npm run build    # production build → dist/
```

## Notes
- Live prices refresh every 60s; the header dot shows live (green) vs offline (amber).
- This is a simulation. It is not a wallet, does not hold or move value, and generates
  no real addresses or signatures.
