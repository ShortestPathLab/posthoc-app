import { Event, Nodes } from "components/render/types/render";
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
  nodes?: Nodes;
  hasCurrent?: boolean;
}

export type LazyNodeListProps = {
  canvas?: Canvas;
  nodes?: Nodes;
  step?: number;
}

export function NodeList({
  canvas, nodes, hasCurrent=false
}: NodeListProps) {
  if (!canvas || !nodes) {
    throw new Error("Prop is missing on NodeList");
  }
  useEffect(() => {
    const remove = canvas().add(nodes, hasCurrent);
    return () => {
      remove();
    }
  }, [canvas, nodes, hasCurrent]);
  return <></>
}

export function LazyNodeList({
  canvas, nodes, step
}: LazyNodeListProps) {
  if (!nodes || step === undefined || !canvas) {
    throw new Error("Prop is missing on LazyNodeList");
  }

  const [{cacheSize=500}] = useSettings();

  // number of nodes needed to be cached
  const threshold = useMemo(() => {
    return floor(step / cacheSize) * cacheSize
  }, [step]);

  const [cachedNodes, dynamicNodes] = useMemo(() => {
    const cached = new Map<string|number, Event[]>(), dynamic = new Map<string|number, Event[]>();
    let i = 0;
    nodes.forEach((events, id) => {
      i < threshold ? cached.set(id, events) : dynamic.set(id, events);
      i++;
    })
    return [cached, dynamic];
  }, [nodes, threshold, step]);

  return (
    <>
      {threshold!==0?<NodeList nodes={cachedNodes} canvas={canvas} hasCurrent={cachedNodes.size === step} />:<></>}
      <NodeList nodes={dynamicNodes} canvas={canvas} hasCurrent={true} />
    </>
  )
}