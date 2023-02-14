import { Event } from "components/render/types/render";
import { UseCanvas } from "../types";
import { floor, memoize, slice } from "lodash";
import { useMemo } from "react";

// TODO config the cacheSize & type to setting slice
const cacheSize: number = 500;
/**
 * For distinguish between persisted views like grid, mesh, tree, map
 * and non-persisted views like tile and multiagent
 * if true, then use split nodelists and draw every history event
 * if false, use a single nodelist and draw current event
 */
const isPersisted: boolean = true;

export type NodeListProps = {
  useCanvas?: UseCanvas;
  events?: Event[];
  hasCurrent?: boolean;
}

export type LazyNodeListProps = {
  useCanvas?: UseCanvas;
  events?: Event[];
  step?: number;
}

export function NodeList({
  useCanvas, events, hasCurrent=false
}: NodeListProps) {
  if (!useCanvas || !events) {
    throw new Error("Prop is missing on NodeList");
  }
  useCanvas().add(events, hasCurrent);
  return <></>
}

export function LazyNodeList({
  useCanvas, events, step
}: LazyNodeListProps) {
  if (!events || step === undefined || !useCanvas) {
    throw new Error("Prop is missing on LazyNodeList");
  }

  const threshold = floor(step / cacheSize) * cacheSize;

  const chunk = useMemo(
    () => memoize((n: number) => slice(events, 0, n))(threshold),
    [events, threshold]
  );  

  // Configue state/search at view level
  if(isPersisted) {
    return (
      <>
        {threshold!==0?<NodeList events={chunk} useCanvas={useCanvas} hasCurrent={chunk.length === step} />:<></>}
        <NodeList events={slice(events, threshold, step + 1)} useCanvas={useCanvas} hasCurrent={chunk.length !== step} />
      </>
    )
  } else {
    return (
      <>
        <NodeList events={
          events.length !== 0?
            [events[-1]]: []
        } useCanvas={useCanvas} />
      </>
    )
  }
}