import { Controller } from "./types";

export const steps: Controller["steps"] = (layer) => ({
  key: layer?.source?.trace?.key,
  steps: layer?.source?.trace?.content?.events ?? [],
});
