import { Sema } from "async-sema";
import { clamp } from "es-toolkit/compat";
import { settings as settingsStore } from "slices/settings";

/**
 * Generic worker concurrency limiter.
 *
 * Worker-threaded jobs are grouped into named "lanes" (task classes). Each lane
 * has its own counting semaphore with an INDEPENDENT cap, so a long-running job
 * in one lane (e.g. a streaming trace) can never starve a short job in another
 * (e.g. parsing a freshly imported file). Caps are weighted rather than an
 * equal split, so the heavy parallel lane (`trace-gen`) keeps ~the whole budget
 * while light lanes stay small. The total is soft-bounded by Σ caps — lanes are
 * meant to separate work that rarely runs simultaneously, so the sum is rarely
 * realised, but it is always finite (unlike the old ungated spawning).
 *
 * This is the substrate for the Comlink migration: every short one-shot worker
 * class is routed through it via `withWorker`, and the streaming `trace-gen`
 * fleet via `leaseWorkers`.
 */
export type LaneName =
  | "trace-gen"
  | "parse"
  | "tree"
  | "hash"
  | "compress"
  | "map-parse"
  | "breakpoint";

const { max, floor } = Math;

/**
 * The preferred worker count, read live from settings. Mirrors `useTraceStream`:
 * a configured value ≤1 means "auto" — a fraction of the hardware threads,
 * clamped to a sane range. Lane callers no longer need to thread this through;
 * leases resolve it here so every lane is sized consistently.
 */
export function resolveWorkerCount(): number {
  const configured = settingsStore.get((s) => s["performance/workerCount"]);
  return configured && configured > 1
    ? configured
    : clamp(floor(navigator.hardwareConcurrency / 4), 1, 12);
}

/** Weighted, independent per-lane caps derived from the preferred worker count. */
function laneCap(name: LaneName, workerCount: number): number {
  switch (name) {
    case "trace-gen":
      return max(1, workerCount); // heavy + parallel: keep the full budget
    case "tree":
      return max(2, floor(workerCount / 2));
    case "parse":
    case "map-parse":
      return 2;
    case "hash":
    case "compress":
    case "breakpoint":
      return 1;
  }
}

const lanes = new Map<LaneName, { sema: Sema; cap: number }>();

/**
 * Get (or build) the semaphore for a lane sized for `workerCount`. If the
 * preferred count changed, the lane is rebuilt with a new cap; any outstanding
 * leases keep a reference to their original semaphore and release into it
 * harmlessly, so a live settings change is safe (it just takes effect for
 * subsequent leases).
 */
function laneSema(name: LaneName, workerCount: number = resolveWorkerCount()): Sema {
  const cap = laneCap(name, workerCount);
  const existing = lanes.get(name);
  if (existing && existing.cap === cap) return existing.sema;
  const entry = { sema: new Sema(cap), cap };
  lanes.set(name, entry);
  return entry.sema;
}

export type WorkerLease<T> = {
  /** The spawned workers (one per acquired permit). */
  workers: T[];
  /** Idempotent: terminates every worker and releases every token, 1:1. */
  release: () => void;
};

export type LeaseOptions = {
  /** Preferred fleet size; defaults to the live `performance/workerCount` setting. */
  workerCount?: number;
  /** Permits to acquire blocking before starting (waits for availability). */
  min?: number;
  /** Upper bound on permits; `Infinity` greedily takes all currently free. */
  max?: number;
  signal?: AbortSignal;
};

/**
 * Acquire one permit, aborting the wait if `signal` fires. If the abort wins the
 * race the underlying `acquire()` is still pending, so we release its token once
 * it eventually resolves — never leaking a permit.
 */
async function acquireOrAbort(sema: Sema, signal?: AbortSignal): Promise<unknown | null> {
  if (signal?.aborted) return null;
  const acquired = sema.acquire();
  if (!signal) return acquired;
  const aborted = new Promise<null>((resolve) =>
    signal.addEventListener("abort", () => resolve(null), { once: true }),
  );
  const winner = await Promise.race([acquired.then((token) => ({ token })), aborted]);
  if (winner === null) {
    acquired.then((token) => sema.release(token)).catch(() => {});
    return null;
  }
  return winner.token;
}

/**
 * Lease workers from a lane: blocks for `min` permits, then greedily takes up to
 * `max` more without waiting. Spawns one worker per permit via `spawn`, and
 * returns an idempotent `release` (also wired to `signal`) that terminates every
 * worker and frees every permit. Resolves `null` if aborted before the workers
 * could be spawned.
 */
export async function leaseWorkers<T>(
  lane: LaneName,
  spawn: () => T,
  terminate: (worker: T) => void,
  { workerCount, min = 1, max = Infinity, signal }: LeaseOptions,
): Promise<WorkerLease<T> | null> {
  const sema = laneSema(lane, workerCount);
  const tokens: unknown[] = [];
  const workers: T[] = [];
  let released = false;

  const release = () => {
    if (released) return;
    released = true;
    signal?.removeEventListener("abort", release);
    for (const w of workers) {
      try {
        terminate(w);
      } catch (e) {
        console.warn(e);
      }
    }
    for (const t of tokens) sema.release(t);
    workers.length = 0;
    tokens.length = 0;
  };

  // Blocking acquire of the minimum, abortable.
  for (let i = 0; i < min; i++) {
    const token = await acquireOrAbort(sema, signal);
    if (token === null) {
      release();
      return null;
    }
    tokens.push(token);
  }
  // Greedily grab whatever else is free right now.
  while (tokens.length < max) {
    const token = sema.tryAcquire();
    if (token === undefined) break;
    tokens.push(token);
  }
  if (signal?.aborted) {
    release();
    return null;
  }

  for (let i = 0; i < tokens.length; i++) workers.push(spawn());
  signal?.addEventListener("abort", release, { once: true });
  return { workers, release };
}

/**
 * Run a one-shot job on a single leased worker from `lane`. Acquires exactly one
 * permit, spawns the worker, runs `task`, and always terminates + releases.
 * Intended for short jobs as they migrate onto Comlink.
 */
export async function withWorker<T, R>(
  lane: LaneName,
  spawn: () => T,
  terminate: (worker: T) => void,
  task: (worker: T) => Promise<R>,
  options: Omit<LeaseOptions, "min" | "max"> = {},
): Promise<R> {
  const lease = await leaseWorkers(lane, spawn, terminate, { ...options, min: 1, max: 1 });
  if (!lease) throw new DOMException("Aborted", "AbortError");
  try {
    return await task(lease.workers[0]);
  } finally {
    lease.release();
  }
}
