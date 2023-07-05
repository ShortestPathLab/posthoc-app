import { D2RendererWorker } from "./D2RendererWorker";

self.document = new Proxy<any>(() => self.document, {
  get: () => self.document,
  set: () => true,
});

const instance = new D2RendererWorker();

instance.on("message", (m, t) => self.postMessage(m, t));

self.onmessage = (e: MessageEvent) => {
  const { action, payload } = e.data;
  ///@ts-ignore
  instance[action](...payload);
};
