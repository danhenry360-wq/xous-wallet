export const usd = (n: number, max = 2) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: max,
    maximumFractionDigits: max,
  });

export const usdCompact = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  });

export const coin = (n: number, decimals = 8) => {
  const s = n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return s;
};

export const shortAddr = (a: string) =>
  a.length > 14 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a;

export const dateLong = (ts: number) =>
  new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const dateShort = (ts: number) =>
  new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });

export const relativeDay = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" });
};
