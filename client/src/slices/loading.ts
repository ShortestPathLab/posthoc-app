import { store } from "@davstack/store";
import { some, values } from "lodash-es";
import { useCallback } from "react";
import { useOne } from "./useOne";

const defaultLoadingStore = {
  layers: 0,
  connections: 0,
  features: 0,
  general: 0,
};

type Loading = keyof typeof defaultLoadingStore;

export const loading = store<Record<Loading, number>>(defaultLoadingStore, {
  devtools: { enabled: import.meta.env.DEV },
  name: "loading-state",
}).actions((a) => ({
  start: (key: Loading) => a.set((s) => void s[key]++),
  end: (key: Loading) => a.set((s) => void s[key]--),
}));

export function useAnyLoading() {
  return useOne(loading, (l) => some(values(l)));
}

export function useLoadingState(key: Loading = "general") {
  return useCallback(
    async <T>(task: () => Promise<T>) => {
      loading.start(key);
      try {
        return await task();
      } catch (e) {
        console.error(e);
      } finally {
        loading.end(key);
      }
    },
    [key],
  );
}
