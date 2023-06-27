import type { Point } from "protocol";

export const pointToIndex = ({ x, y }: Point) => {
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  // find loop number in spiral
  const loop = Math.max(ax, ay);
  // one less than the edge length of the current loop
  const edgeLen = 2 * loop;
  // the numbers in the inner loops
  const prev = Math.pow(edgeLen - 1, 2);
  if (x == loop && y > -loop) {
    // right edge
    return prev + y - (-loop + 1);
  }
  if (y == loop) {
    // top edge
    return prev + loop - x + edgeLen - 1;
  }
  if (x == -loop) {
    // left edge
    return prev + loop - y + 2 * edgeLen - 1;
  }
  if (y == -loop) {
    // bottom edge
    return prev + x + loop + 3 * edgeLen - 1;
  }
  return 0;
};
