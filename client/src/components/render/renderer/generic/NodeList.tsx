import { Event } from "components/render/types/render";
import { Canvas } from "../types";
import { floor, memoize, slice } from "lodash";
import { useEffect, useMemo } from "react";
import { useSettings } from "slices/settings";

/**
 * For distinguish between persisted views like grid, mesh, tree, map
 * and non-persisted views like tile and multiagent
 * if true, then use split nodelists and draw every history event
 * if false, use a single nodelist and draw current event
 */
export type NodeListProps = {
  canvas?: Canvas;
  events?: Event[];
  hasCurrent?: boolean;
}

export type LazyNodeListProps = {
  canvas?: Canvas;
  events?: Event[];
  step?: number;
  persist?: boolean;
}

export function NodeList({
  canvas, events, hasCurrent=false
}: NodeListProps) {
  if (!canvas || !events) {
    throw new Error("Prop is missing on NodeList");
  }
  useEffect(() => {
    const remove = canvas().add(events, hasCurrent);
    return () => {
      remove();
    }
  }, [canvas, events, hasCurrent]);
  return <></>
}

export function LazyNodeList({
  canvas, events, step, persist
}: LazyNodeListProps) {

  if (!events || step === undefined || !canvas) {
    throw new Error("Prop is missing on LazyNodeList");
  }

  const [{cacheSize=500}] = useSettings();

  const threshold = useMemo(() => {
    return floor(step / cacheSize) * cacheSize
  }, [step]);

  const chunk = useMemo(
    () => memoize((n: number) => slice(events, 0, n))(threshold),
    [events, threshold]
  );

  // Configue state/search at view level
  if(persist) {
    return (
      <>
        {threshold!==0?<NodeList events={chunk} canvas={canvas} hasCurrent={chunk.length === step} />:<></>}
        <NodeList events={slice(events, threshold, step + 1)} canvas={canvas} hasCurrent={chunk.length !== step} />
      </>
    )
  } else {
    return (
      <>
        <NodeList events={
          events.length !== 0?
            [events[-1]]: []
        } canvas={canvas} />
      </>
    )
  }
}