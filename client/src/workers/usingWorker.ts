export const usingWorkerTask =
  <T, R>(w: Worker) =>
    (inp: T) => {
      w.postMessage(inp);
      return new Promise<R>((res) => {
        w.onmessage = (out) => {
          res(out.data as R);
        };
      });
    }
  ;
