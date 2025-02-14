import { produce } from "produce";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToggle } from "react-use";
import { Transaction } from "slices/selector";

function useGet<T>(v: T) {
  const val = useRef(v);
  useEffect(() => {
    val.current = v;
  }, [v]);
  return useCallback(() => val.current, []);
}

function useOptimisticState<T>(value: T) {
  const [enabled, setEnabled] = useToggle(false);
  const [optimistic, setOptimistic] = useState(value);
  const get = useGet(value);

  const start = () => {
    setOptimistic(get());
    setEnabled(true);
  };
  const end = () => {
    setEnabled(false);
  };

  const latest = useRef<Promise<void> | null>(null);

  return { latest, end, start, enabled, optimistic, setOptimistic };
}

export function useOptimistic<T>(value: T, update: (f: T) => Promise<void>) {
  const { enabled, optimistic, start, end, setOptimistic, latest } =
    useOptimisticState(value);
  return [
    enabled ? optimistic : value,
    async (f: T) => {
      start();
      const job = update(f);
      latest.current = job;
      setOptimistic(f);
      await job;
      if (latest.current === job) end();
    },
  ] as const;
}

export function useOptimisticTransaction<T>(
  value: T,
  update: (f: Transaction<T>) => Promise<void>
) {
  const { enabled, optimistic, start, end, setOptimistic, latest } =
    useOptimisticState(value);

  return [
    enabled ? optimistic : value,
    async (f: Transaction<T>) => {
      start();
      const job = update(f);
      latest.current = job;
      setOptimistic((l) => produce(l, f));
      await job;
      if (latest.current === job) end();
    },
    enabled,
  ] as const;
}
