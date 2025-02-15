import { Controller } from "./types";

export const error = ((layer) =>
  layer?.source?.trace?.error ||
  layer?.source?.parsedTrace?.error) satisfies Controller["error"];
