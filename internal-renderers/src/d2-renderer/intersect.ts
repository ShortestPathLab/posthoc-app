import { Bounds } from "protocol";

export function intersect(r1: Bounds, r2: Bounds) {
  return !(
    r2.left >= r1.right ||
    r2.right <= r1.left ||
    r2.top >= r1.bottom ||
    r2.bottom <= r1.top
  );
}
