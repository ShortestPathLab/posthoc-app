import { store } from "@davstack/store";

export type Screenshots = Record<string, (() => Promise<string | undefined>) | undefined>;

export const screenshots = store<Screenshots>(
  {},
  {
    name: "screenshots",
    devtools: { enabled: import.meta.env.DEV },
  },
);
