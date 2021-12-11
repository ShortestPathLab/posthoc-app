import { Bounds } from "./Bounds";
import { Point } from "./Renderer";

export type Scale<T = Point> = Bounds & {
  scale: number;
  /**
   * Transform from world coordinate space to renderer coordinate space.
   */
  to: (point: T) => T;
  /**
   * Transform from renderer coordinate space to world coordinate space.
   */
  from: (point: T) => T;
};
