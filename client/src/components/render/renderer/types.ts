import { Nodes } from "protocol/Render";

/**
 * Remove events that previously added by AddToCanvasCb from the
 * canvas
 */
export type RemoveFromCanvasCb = () => void;

/**
 * Add events to canvas, return a callback that can remove
 * those events from the canvas
 */
export type AddToCanvasCb = (
  nodes: Nodes,
  hasCurrent: boolean
) => RemoveFromCanvasCb;

/**
 * A medium providing "add" and "remove" event from canvas function
 * to child components
 */
export type Canvas = () => {
  add: AddToCanvasCb;
};

/**
 *
 */
export type StageChild = (canvas: Canvas) => React.ReactFragment;

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

export type Successors = { [key: number | string]: Set<string | number> };
