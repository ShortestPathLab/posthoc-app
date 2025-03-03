import { clamp } from "lodash-es";

export function lerp(start: number, end: number, amount: number): number {
  return start + clamp(amount, 0, 1) * (end - start);
}
