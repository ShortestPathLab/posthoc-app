import { D2RendererWorker } from "./D2RendererWorker";

const instance = new D2RendererWorker();

instance.on("message", (m, t) => self.postMessage(m, t));

self.onmessage = (e: MessageEvent) => {
  const { action, payload } = e.data;
  ///@ts-ignore
  instance[action](...payload);
};
