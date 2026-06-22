import { useRendererInstance } from "components/inspector/TraceRenderer";
import { floor, slice } from "es-toolkit/compat";
import { useEffect, useMemo } from "react";
import { ComponentEntry } from "renderer";

export type NodeListProps = {
  nodes?: ComponentEntry[][];
  start?: number;
  end?: number;
};
export type NodeList2Props = {
  nodes?: ComponentEntry[];
};

export type LazyNodeListProps = NodeListProps;

export function NodeList({ nodes, start: startProp, end: stepProp }: NodeListProps) {
  // Defaults moved out of the destructure: object-destructuring defaults make
  // the React Compiler bail out of optimizing this component.
  const start = startProp ?? 0;
  const step = stepProp ?? nodes?.length ?? 0;
  const { renderer } = useRendererInstance();
  useEffect(() => {
    if (renderer && nodes?.length) {
      return renderer.add(slice(nodes, start, step).flat());
    }
  }, [renderer, nodes, start, step]);

  return <></>;
}
export function NodeList2({ nodes }: NodeList2Props) {
  const { renderer } = useRendererInstance();
  useEffect(() => {
    if (renderer && nodes?.length) {
      return renderer.add(nodes);
    }
  }, [renderer, nodes]);

  return <></>;
}

export function LazyNodeList({ nodes, end }: LazyNodeListProps) {
  const cacheSize = 20;

  // number of nodes needed to be cached
  const threshold = floor((end ?? 0) / cacheSize) * cacheSize;

  const cached = useMemo(() => slice(nodes, 0, threshold), [nodes, threshold]);
  const uncached = useMemo(() => slice(nodes, threshold, (end ?? 0) + 1), [nodes, threshold, end]);
  return (
    <>
      {!!threshold && <NodeList nodes={cached} />}
      {uncached.map((c, i) => (
        <NodeList2 key={threshold + i} nodes={c} />
      ))}
    </>
  );
}
