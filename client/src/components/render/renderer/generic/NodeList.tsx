import { useRendererInstance } from "components/inspector/TraceRenderer";
import { floor, slice } from "lodash";
import { CompiledComponent } from "protocol";
import { useEffect, useMemo } from "react";

/**
 * For distinguish between persisted views like grid, mesh, tree, map
 * and non-persisted views like tile and multiagent
 * if true, then use split nodelists and draw every history event
 * if false, use a single nodelist and draw current event
 */
export type NodeListProps = {
  nodes?: CompiledComponent<any, any>[];
};

export type LazyNodeListProps = NodeListProps & {
  step?: number;
};

export function NodeList({ nodes = [] }: NodeListProps) {
  const { renderer } = useRendererInstance();
  useEffect(() => {
    if (renderer && nodes.length) {
      return renderer.add(nodes);
    }
  }, [renderer, nodes]);

  return <></>;
}

export function LazyNodeList({ nodes, step }: LazyNodeListProps) {
  const cacheSize = 10000;

  // number of nodes needed to be cached
  const threshold = floor((step ?? 0) / cacheSize) * cacheSize;

  const cached = useMemo(() => slice(nodes, 0, threshold), [nodes, threshold]);
  const uncached = useMemo(
    () => slice(nodes, threshold, step),
    [nodes, threshold, step]
  );
  return (
    <>
      {!!threshold && <NodeList nodes={cached} />}
      <NodeList nodes={uncached} />
    </>
  );
}
