import { useRendererInstance } from "components/inspector/TraceRenderer";
import { slice } from "es-toolkit/compat";
import { useEffect, useRef } from "react";
import { ComponentEntry, RemoveElementCallback } from "renderer";

export type NodeListProps = {
  nodes?: ComponentEntry[][];
  start?: number;
  end?: number;
};

export type PersistentNodesProps = {
  nodes?: ComponentEntry[][];
  step?: number;
  chunkSize?: number;
};

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

/**
 * Imperatively keeps the renderer's persistent content in sync with `step`,
 * without mounting one React node per step/chunk.
 *
 * The previous declarative approach (`LazyNodeList`) collapsed the whole
 * `[0, step)` prefix into a single element that was re-sliced — and therefore
 * fully removed and re-added to the renderer — every `chunkSize` steps. That is
 * O(prefix) work at every boundary (O(n^2) over a playback) and it churns the
 * worker's body indices, busting the tile cache. Mounting one element per chunk
 * instead would bound the re-adds but reintroduce an O(n) React reconciliation
 * walk for large traces.
 *
 * This component sidesteps both: a single effect diffs the renderer's
 * applied step against the target and adds/removes only the delta.
 *
 * - Completed chunks `[c*chunkSize, (c+1)*chunkSize)` are added exactly once and
 *   only removed when scrubbed back past. Crossing a chunk boundary requires no
 *   re-add — the partial-chunk tail already covered those steps.
 * - The current partial chunk (the "tail", `[chunk*chunkSize, step]`) is the
 *   only thing re-applied as `step` changes, so per-step cost is O(chunkSize).
 *
 * React tree size is O(1) regardless of event count.
 */
export function PersistentNodes({ nodes, step: stepProp, chunkSize: chunkSizeProp }: PersistentNodesProps) {
  const step = stepProp ?? 0;
  const chunkSize = chunkSizeProp ?? 20;
  const { renderer } = useRendererInstance();

  const state = useRef<{
    nodes?: ComponentEntry[][];
    renderer?: typeof renderer;
    chunks: RemoveElementCallback[];
    tailRemove?: RemoveElementCallback;
    tailEnd: number;
  }>({ chunks: [], tailEnd: -1 });

  useEffect(() => {
    const s = state.current;

    // Reset everything when the source content or renderer instance changes.
    if (s.nodes !== nodes || s.renderer !== renderer) {
      s.tailRemove?.();
      for (const remove of s.chunks) remove();
      s.chunks = [];
      s.tailRemove = undefined;
      s.tailEnd = -1;
      s.nodes = nodes;
      s.renderer = renderer;
    }

    if (!renderer || !nodes?.length) return;

    const completedChunks = Math.floor(step / chunkSize);

    // When the tail already covers exactly the next chunk (the common case of
    // stepping forward across a boundary), promote it in place rather than
    // removing and re-adding the same components.
    if (
      s.tailRemove &&
      s.chunks.length < completedChunks &&
      s.tailEnd === (s.chunks.length + 1) * chunkSize - 1
    ) {
      s.chunks.push(s.tailRemove);
      s.tailRemove = undefined;
      s.tailEnd = -1;
    }

    // Add any remaining newly-completed chunks (each added exactly once).
    while (s.chunks.length < completedChunks) {
      const c = s.chunks.length;
      const components = slice(nodes, c * chunkSize, (c + 1) * chunkSize).flat();
      s.chunks.push(components.length ? renderer.add(components) : () => {});
    }
    // Remove chunks we've scrubbed back past.
    while (s.chunks.length > completedChunks) {
      s.chunks.pop()!();
    }

    // Re-apply the current partial chunk only when its extent changes.
    if (step !== s.tailEnd) {
      s.tailRemove?.();
      const tail = slice(nodes, completedChunks * chunkSize, step + 1).flat();
      s.tailRemove = tail.length ? renderer.add(tail) : undefined;
      s.tailEnd = step;
    }
  }, [renderer, nodes, step, chunkSize]);

  // Tear down on unmount.
  useEffect(
    () => () => {
      const s = state.current;
      s.tailRemove?.();
      for (const remove of s.chunks) remove();
      s.chunks = [];
      s.tailRemove = undefined;
      s.tailEnd = -1;
    },
    [],
  );

  return <></>;
}
