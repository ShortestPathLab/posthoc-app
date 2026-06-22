import { store } from "@davstack/store";
import { delay } from "es-toolkit/compat";
import { useCallback } from "react";

export const LARGE_FILE_B = 20 * 1024 * 1024;

type Busy = {
  [K in string]?: string;
};

export const busy = store<Busy>(
  {},
  {
    name: "busy",
    devtools: { enabled: import.meta.env.DEV },
  },
);

function wait(ms: number) {
  return new Promise((res) => delay(res, ms));
}

export function useBusyState(key: string) {
  return useCallback(
    async <T>(task: () => Promise<T>, description: string) => {
      busy.set((s) => void (s[key] = description));
      wait(300);
      const out = await task();
      busy.set((s) => void delete s[key]);
      return out;
    },
    [key],
  );
}

export function formatByte(b: number) {
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}
