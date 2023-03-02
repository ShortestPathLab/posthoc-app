import { Event, Nodes } from "protocol/Render";
import { Canvas } from "../types";
import { floor } from "lodash";
import { useEffect, useMemo } from "react";
import { useSettings } from "slices/settings";
import { useNodesMap } from "./NodesMap";
import { useUIState } from "slices/UIState";

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
  canvas
}: LazyNodeListProps) {
  const {nodes} = useNodesMap();
  const [{step}] = useUIState();

  const [{cacheSize=500}] = useSettings();

  // number of nodes needed to be cached
  const threshold = useMemo(() => {
    return floor((step??0) / cacheSize) * cacheSize
  }, [step]);

  const [cachedNodes, dynamicNodes] = useMemo(() => {
    const cached = new Map<string|number, Event[]>(), dynamic = new Map<string|number, Event[]>();
    let i = 0;
    if (nodes) {
      nodes.forEach((events, id) => {
        i < threshold ? cached.set(id, events) : dynamic.set(id, events);
        i++;
      })
    }
    return [cached, dynamic];
  }, [nodes, threshold, step]);

  return (
    <>
      {threshold!==0?<NodeList nodes={cachedNodes} canvas={canvas} hasCurrent={cachedNodes.size === step} />:<></>}
      <NodeList nodes={dynamicNodes} canvas={canvas} hasCurrent={true} />
    </>
  )
}