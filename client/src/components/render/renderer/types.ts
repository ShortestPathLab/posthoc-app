import { Event } from "../types/render"

/**
 * Remove events that previously added by AddToCanvasCb from the
 * canvas
 */
export type RemoveFromCanvasCb = () => void;

/**
 * Add events to canvas, return a callback that can remove
 * those events from the canvas
 */
export type AddToCanvasCb = (events: Event[], hasCurrent: boolean) => RemoveFromCanvasCb;

/**
 * A medium providing "add" and "remove" event from canvas function 
 * to child components
 */
export type Canvas = () => {
  add: AddToCanvasCb;
}

/**
 * 
 */
export type StageChild = 
  (canvas:Canvas) => React.ReactFragment;