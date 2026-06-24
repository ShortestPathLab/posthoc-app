import { get, values } from "es-toolkit/compat";
import { TraceEvent } from "protocol";
import { ComponentEntry } from "renderer";

/**
 * Mutable, per-stream frame buffers. These live OUTSIDE the immer/davstack
 * layer store on purpose: immer auto-freeze is on, so anything committed to the
 * store is frozen and could not be mutated in place. The layer store instead
 * holds only a lightweight handle (`streamKey` + `frontier`/`version`); the
 * heavy, incrementally-filled arrays live here and are looked up by key.
 *
 * Reference stability: a buffer object is created once per stream and mutated in
 * place as frames arrive, so consumers can hold a stable reference and re-read
 * on `version` bumps rather than re-deriving everything.
 */
export type StreamBuffers = {
  total: number;
  /** Per-frame persistent entries (visibility-filtered). Sparse until filled. */
  persistent: ComponentEntry[][];
  /** Per-frame own transient entries, pre-merge. Sparse until filled. */
  transientOwn: ComponentEntry[][];
  /** Per-frame "special" entries (string `clear`), pre-merge. Sparse. */
  special: ComponentEntry[][];
  /** Sequentially-merged transient, valid only for index < `mergedTo`. */
  mergedTransient: ComponentEntry[][];
  /** 1 once a frame's raw components have arrived (may be out of order). */
  generated: Uint8Array;
  /** Running "special" stack for the sequential merge. */
  stack: Record<string, ComponentEntry[]>;
  /** Contiguous fully-merged frontier: indices [0, mergedTo) are fully correct. */
  mergedTo: number;
};

/**
 * Lightweight, immer-safe handle stored on the layer. Points at the external
 * `StreamBuffers` by `streamKey`; `version` bumps on every commit so consumers
 * re-read, `frontier` is the contiguous fully-correct prefix length.
 */
export type TraceStreamHandle = {
  streamKey: string;
  total: number;
  frontier: number;
  version: number;
  complete: boolean;
  /** Generation failed (e.g. malformed trace). Terminal, like `complete`. */
  error?: boolean;
};

const store = new Map<string, StreamBuffers>();

export function createStreamBuffers(key: string, total: number): StreamBuffers {
  // Sparse arrays on purpose: frames fill in out of order, and for large traces
  // a sparse `new Array(total)` avoids eagerly allocating `total` undefined slots.
  /* eslint-disable unicorn/no-new-array */
  const buffers: StreamBuffers = {
    total,
    persistent: new Array(total),
    transientOwn: new Array(total),
    special: new Array(total),
    mergedTransient: new Array(total),
    generated: new Uint8Array(total),
    stack: {},
    mergedTo: 0,
  };
  /* eslint-enable unicorn/no-new-array */
  store.set(key, buffers);
  return buffers;
}

export const getStreamBuffers = (key?: string) => (key ? store.get(key) : undefined);

export function disposeStreamBuffers(key?: string) {
  if (key) store.delete(key);
}

const makeKey = (id: string | number = "", condition: string | number = "") =>
  `${id}::::${condition}`;

const isVisible = ({ component: c }: ComponentEntry) =>
  c && Object.hasOwn(c, "alpha") ? get(c, "alpha")! > 0 : true;

export const visible = (entries: ComponentEntry[] = []) => entries.filter(isVisible);

/**
 * Advance the sequential transient merge over the contiguous run of generated
 * frames starting at `mergedTo`. Mirrors the stateful `stack` fold in
 * `parseTrace.worker.ts`, but resumable so it can follow the streaming frontier.
 * Stops at the first gap (ungenerated frame). Returns true if it advanced.
 */
export function advanceMerge(b: StreamBuffers, events: TraceEvent[]): boolean {
  const before = b.mergedTo;
  while (b.mergedTo < b.total && b.generated[b.mergedTo]) {
    const i = b.mergedTo;
    const event = events[i]!;
    const transient = [...(b.transientOwn[i] ?? [])];
    // Clear any stacked specials keyed by this event's (id, type).
    delete b.stack[makeKey(event.id, event.type)];
    transient.push(...values(b.stack).flat());
    for (const a of b.special[i] ?? []) {
      const key = makeKey(event.id, get(a.component, "clear"));
      (b.stack[key] = b.stack[key] ?? []).push(a);
      transient.push(a);
    }
    b.mergedTransient[i] = visible(transient);
    b.mergedTo = i + 1;
  }
  return b.mergedTo !== before;
}
