import { useRendererInstance } from "components/inspector/TraceRenderer";
import { floor, slice } from "lodash";
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

export function NodeList({
  nodes,
  start = 0,
  end: step = nodes?.length ?? 0,
}: NodeListProps) {
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
// export function LazyNodeList({ nodes, start = 0, end = 0 }: LazyNodeListProps) {
//   return pairwise(range(start, end, 1), (x, y) => (
//     <NodeList key={`${x}::${y}`} nodes={nodes} start={x} end={y} />
//   ));
// const c2 = generateNumberArray(end);
// return pairwise(c2, (start, end) => {
//   const end2 = end + 1;
//   const cacheSize = 2;
//   const run = end2 - start;
//   // number of nodes needed to be cached
//   const threshold = floor((run ?? 0) / 2 / cacheSize) * cacheSize;
//   return [
//     !!threshold && (
//       <NodeList
//         key={`${start}::${start + threshold}`}
//         nodes={nodes}
//         start={start}
//         end={start + threshold}
//       />
//     ),
//     !!(end2 - (start + threshold)) && (
//       <NodeList
//         key={`${start + threshold}::${end2}`}
//         nodes={nodes}
//         start={start + threshold}
//         end={end2}
//       />
//     ),
//   ];
// }).flat();
// }

export function LazyNodeList({ nodes, end }: LazyNodeListProps) {
  const cacheSize = 100;

  // number of nodes needed to be cached
  const threshold = floor((end ?? 0) / cacheSize) * cacheSize;

  const cached = useMemo(() => slice(nodes, 0, threshold), [nodes, threshold]);
  const uncached = useMemo(
    () => slice(nodes, threshold, (end ?? 0) + 1),
    [nodes, threshold, end]
  );
  return (
    <>
      {!!threshold && <NodeList nodes={cached} />}
      {uncached.map((c, i) => (
        <NodeList2 key={threshold + i} nodes={c} />
      ))}
    </>
  );
}
