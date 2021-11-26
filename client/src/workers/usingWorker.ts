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
      return new Promise<R>((res) => {
        worker.onmessage = (out) => {
          res(out.data as R);
        };
      });
    });
