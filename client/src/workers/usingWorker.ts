import memoize from "memoizee";

type WorkerConstructor = new () => Worker;

type WorkerResult = { result: unknown } | { error: unknown };

export const usingWorker = <R>(w: WorkerConstructor) => {
  const worker = new w();
  return async (task: (w: Worker) => Promise<R>) => {
    const out = (await task(worker)) as WorkerResult;
    if ("error" in out) {
      console.error(out.error);
      throw new Error(`${out.error}`);
    }
    worker.terminate();
    return out.result as R;
  };
};

export const usingWorkerTask = <T, R>(w: WorkerConstructor) => {
  return (inp: T) =>
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
};

export const usingMemoizedWorkerTask = <T, R>(
  w: WorkerConstructor,
  o: memoize.Options<(t: T) => Promise<R>> = {
    async: true,
    length: 1,
  }
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
