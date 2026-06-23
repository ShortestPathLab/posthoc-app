import { useRendererInstance } from "components/inspector/TraceRenderer";
import { useEffect, useRef } from "react";
import { ComponentEntry, RemoveElementCallback } from "renderer";
import { StreamBuffers } from "layers/trace/traceStreamStore";

const { floor, min } = Math;

export type StreamingPersistentNodesProps = {
  buffers?: StreamBuffers;
  /** Inclusive playhead — persistent state accumulates over [0, step]. */
  step?: number;
  /** Bumps on every commit; forces a re-evaluation as frames stream/backfill. */
  version?: number;
  /** Stable string identifying the current layer meta; changes force re-add. */
  metaKey?: string;
  /** Applies layer meta (sourceLayer/alpha/displayMode) at add-time. */
  decorate: (entries: ComponentEntry[]) => ComponentEntry[];
  chunkSize?: number;
};

type ChunkState = { remove: RemoveElementCallback; sig: string };

/**
 * Streaming-aware counterpart to `PersistentNodes`. Persistent components
 * accumulate over the whole prefix [0, step], but under streaming that prefix
 * may have *gaps* (frames not generated yet) and those gaps backfill later.
 *
 * Strategy: bucket steps into chunks; each chunk's applied content is keyed by a
 * signature of (range length, number of generated frames in range, meta). When a
 * frame backfills into a chunk the count changes, so the chunk is removed and
 * re-added — the O(chunk) re-add cost the design explicitly accepts. A fully
 * generated chunk's signature is stable, so it is never re-added again (the tile
 * cache stays warm once the prefix is complete). Only generated frames are added,
 * so ungenerated gaps simply render nothing until they arrive (partial preview).
 */
export function StreamingPersistentNodes({
  buffers,
  step: stepProp,
  version,
  metaKey,
  decorate,
  chunkSize: chunkSizeProp,
}: StreamingPersistentNodesProps) {
  const step = stepProp ?? 0;
  const chunkSize = chunkSizeProp ?? 20;
  const { renderer } = useRendererInstance();

  const state = useRef<{
    buffers?: StreamBuffers;
    renderer?: typeof renderer;
    chunks: ChunkState[];
  }>({ chunks: [] });

  useEffect(() => {
    const s = state.current;

    // Reset when the source buffers or renderer instance change.
    if (s.buffers !== buffers || s.renderer !== renderer) {
      for (const c of s.chunks) c.remove();
      s.chunks = [];
      s.buffers = buffers;
      s.renderer = renderer;
    }

    if (!renderer || !buffers) return;

    const last = min(step, buffers.total - 1);
    const neededChunks = last < 0 ? 0 : floor(last / chunkSize) + 1;

    // Drop chunks we've scrubbed back past.
    while (s.chunks.length > neededChunks) s.chunks.pop()!.remove();

    for (let c = 0; c < neededChunks; c++) {
      const from = c * chunkSize;
      const to = min((c + 1) * chunkSize, last + 1);
      const entries: ComponentEntry[] = [];
      let generated = 0;
      for (let i = from; i < to; i++) {
        const p = buffers.persistent[i];
        if (p) {
          generated++;
          for (const e of p) entries.push(e);
        }
      }
      const sig = `${to - from}:${generated}:${metaKey}`;
      const existing = s.chunks[c];
      if (existing && existing.sig === sig) continue;
      existing?.remove();
      s.chunks[c] = {
        remove: entries.length ? renderer.add(decorate(entries)) : () => {},
        sig,
      };
    }
    // `version` participates so backfills (which mutate `buffers` in place
    // without changing its reference) trigger this effect.
  }, [renderer, buffers, step, version, metaKey, chunkSize, decorate]);

  // Tear down on unmount.
  useEffect(
    () => () => {
      for (const c of state.current.chunks) c.remove();
      state.current.chunks = [];
    },
    [],
  );

  return <></>;
}
