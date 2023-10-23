import memoize from "memoizee";

type WorkerConstructor = new () => Worker;

export const usingWorker =
  <R>(w: WorkerConstructor) =>
  async (task: (w: Worker) => Promise<R>) => {
    const worker = new w();
    const out = await task(worker);
    worker.terminate();
    return out;
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
        worker.onerror = rej;
      });
    });

export const usingMemoizedWorkerTask = <T, R>(
  w: WorkerConstructor,
  o: memoize.Options<(t: T) => Promise<R>> = {
    async: true,
    length: 1,
  }
) => memoize(usingWorkerTask(w), o);
