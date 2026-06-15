import { useCallback, useEffect, useState } from "react";
import { Tx } from "./types";
import { SEED_TXS, STORAGE_KEY } from "./seed";

interface Persisted {
  txs: Tx[];
}

function load(): Tx[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...SEED_TXS];
    const parsed = JSON.parse(raw) as Persisted;
    if (!parsed?.txs?.length) return [...SEED_TXS];
    return parsed.txs;
  } catch {
    return [...SEED_TXS];
  }
}

function save(txs: Tx[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ txs }));
  } catch {
    /* ignore quota errors */
  }
}

export function useLedger() {
  const [txs, setTxs] = useState<Tx[]>(() => load());

  useEffect(() => {
    save(txs);
  }, [txs]);

  const addTx = useCallback((tx: Tx) => {
    setTxs((prev) => [tx, ...prev]);
  }, []);

  const reset = useCallback(() => {
    setTxs([...SEED_TXS]);
    save([...SEED_TXS]);
  }, []);

  // newest first for display
  const sorted = [...txs].sort((a, b) => b.timestamp - a.timestamp);

  return { txs: sorted, addTx, reset };
}
