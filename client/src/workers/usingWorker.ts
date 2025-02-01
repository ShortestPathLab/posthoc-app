import memoize from "memoizee";

type WorkerConstructor = new () => Worker;

type WorkerResult = { result: any } | { error: any };

export type OutErrorDetails = {
  name: string;
  reason: string;
  mark: {
    name: null | string;
    buffer: string;
    position: number;
    line: number;
    column: number;
    snippet: string;
  };
};

export class OutError extends Error {
  details: OutErrorDetails;
  constructor(message: string, details: any) {
    super(message);
    this.name = "OutError";
    this.details = details;
    Object.setPrototypeOf(this, OutError.prototype);
  }
}

export const usingWorker =
  <R>(w: WorkerConstructor) =>
  async (task: (w: Worker) => Promise<R>) => {
    const worker = new w();
    const out = (await task(worker)) as WorkerResult;
    if ("error" in out) {
      throw new OutError("Yaml parsing error", out.error);
    }
    worker.terminate();
    return out.result as R;
  };

export const usingWorkerTask =
  <T, R>(w: WorkerConstructor) =>
  (inp: T) =>
    usingWorker<R>(w)((worker) => {
      worker.postMessage(inp);
      return new Promise<R>((res, rej) => {
        worker.onmessage = (out) => {
          res(out.data as R);
        };
        worker.onerror = (e) => {
          console.error(e);
          rej(e);
        };
      });
    });

export const usingMemoizedWorkerTask = <T, R>(
  w: WorkerConstructor,
  o: memoize.Options<(t: T) => Promise<R>> = {
    async: true,
    length: 1,
  },
) => memoize(usingWorkerTask(w), o);

export const usingMessageHandler =
  <T, U>(f: (a: MessageEvent<T>) => Promise<U>) =>
  async (m: MessageEvent<T>) => {
    try {
      const output = await f(m);
      postMessage({ result: output });
    } catch (e) {
      postMessage({ error: e });
    }
  };
