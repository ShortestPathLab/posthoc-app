import {
  D2RendererWorker,
  D2WorkerEvent,
  D2WorkerEvents,
  D2WorkerRequest,
} from "./D2RendererWorker";
import viteUrl from "./D2Renderer.worker.ts?worker&url";
import { url as BunUrl } from "./D2Renderer.worker";

const d2RendererWorkerUrl = viteUrl ?? BunUrl;

export class D2RendererWorkerAdapter extends Worker {
  constructor() {
    super(d2RendererWorkerUrl, { type: "module" });
  }
  call<T extends keyof D2RendererWorker>(
    action: D2WorkerRequest<T>["action"],
    payload: D2WorkerRequest<T>["payload"],
    transfer: Transferable[] = []
  ) {
    return this.postMessage({ action, payload }, transfer);
  }
  on<T extends keyof D2WorkerEvents>(
    event: T,
    handler: (payload: D2WorkerEvents[T]) => void
  ) {
    const f = (e: MessageEvent<D2WorkerEvent>) => {
      const { action, payload } = e.data;
      if (action === event) handler(payload);
    };
    this.addEventListener("message", f);
    return () => this.removeEventListener("message", f);
  }
}
