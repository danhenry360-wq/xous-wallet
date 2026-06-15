import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tx, AssetSymbol } from "../lib/types";
import { signedAmount } from "../lib/seed";
import { usdCompact, usd } from "../lib/format";

// Builds a daily portfolio-value series from the ledger, valuing each asset
// at its tx-time USD rate up to that day, then live price for the final point.
export function PortfolioChart({
  txs,
  livePrices,
}: {
  txs: Tx[];
  livePrices: Record<AssetSymbol, number>;
}) {
  const data = useMemo(() => {
    if (!txs.length) return [];
    const chrono = [...txs].sort((a, b) => a.timestamp - b.timestamp);
    const start = new Date(chrono[0].timestamp);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(0, 0, 0, 0);

    // running balances and a running "blended price" per asset from tx data
    const bal: Record<AssetSymbol, number> = { BTC: 0, ETH: 0, USDT: 0 };
    const lastPrice: Record<AssetSymbol, number> = { BTC: 0, ETH: 0, USDT: 1 };

    const points: { date: number; value: number }[] = [];
    let ti = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayEnd = d.getTime() + 86_400_000;
      while (ti < chrono.length && chrono[ti].timestamp < dayEnd) {
        const tx = chrono[ti];
        bal[tx.asset] += signedAmount(tx);
        if (tx.amount > 0) lastPrice[tx.asset] = tx.usdAtTime / tx.amount;
        ti++;
      }
      const value =
        bal.BTC * (lastPrice.BTC || livePrices.BTC) +
        bal.ETH * (lastPrice.ETH || livePrices.ETH) +
        bal.USDT * 1;
      points.push({ date: d.getTime(), value: Math.max(0, value) });
    }
    // value the final point at live prices
    if (points.length) {
      points[points.length - 1].value =
        bal.BTC * livePrices.BTC + bal.ETH * livePrices.ETH + bal.USDT * 1;
    }
    return points;
  }, [txs, livePrices]);

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b7bff" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#6d5efc" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(v) =>
              new Date(v).toLocaleString("en-US", { month: "short", day: "numeric" })
            }
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            hide
            domain={["dataMin - dataMin*0.05", "dataMax + dataMax*0.05"]}
          />
          <Tooltip
            contentStyle={{
              background: "#0f1117",
              border: "1px solid #262b38",
              borderRadius: 12,
              boxShadow: "0 20px 50px -20px rgba(0,0,0,0.8)",
            }}
            labelStyle={{ color: "#9ca3af", fontSize: 12 }}
            itemStyle={{ color: "#e6e8ee", fontSize: 13, fontWeight: 600 }}
            labelFormatter={(v) =>
              new Date(v as number).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
            formatter={(v: number) => [usd(v), "Portfolio"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8b7bff"
            strokeWidth={2.4}
            fill="url(#pv)"
            dot={false}
            activeDot={{ r: 4, fill: "#a78bfa", stroke: "#0a0b0f", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
