import { D2RendererWorker } from "./D2RendererWorker";

export const url = import.meta.url;

if (
  typeof WorkerGlobalScope !== "undefined" &&
  self instanceof WorkerGlobalScope
) {
  const instance = new D2RendererWorker();

  instance.on("message", (m, t) => self.postMessage(m, t));

  self.onmessage = (e: MessageEvent) => {
    const { action, payload } = e.data;
    ///@ts-ignore
    instance[action](...payload);
  };
}
