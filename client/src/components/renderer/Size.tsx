export type Point = {
  x: number;
  y: number;
};

export type Bounds = {
  width: number;
  height: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

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
