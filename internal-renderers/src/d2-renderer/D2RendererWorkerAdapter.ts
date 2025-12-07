import {
  D2RendererWorker,
  D2WorkerEvent,
  D2WorkerEvents,
  D2WorkerRequest,
} from "./D2RendererWorker";

export const D2RendererWorkerAdapter = () => new D2RendererWorkerAdapterClass();

export class D2RendererWorkerAdapterClass extends Worker {
  constructor() {
    super("./D2Renderer.worker.ts", { type: "module" });
  }
  call<T extends keyof D2RendererWorker>(
    action: D2WorkerRequest<T>["action"],
    payload: D2WorkerRequest<T>["payload"],
    transfer: Transferable[] = [],
  ) {
    return this.postMessage({ action, payload }, transfer);
  }
  on<T extends keyof D2WorkerEvents>(
    event: T,
    handler: (payload: D2WorkerEvents[T]) => void,
  ) {
    const f = (e: MessageEvent<D2WorkerEvent>) => {
      const { action, payload } = e.data;
      if (action === event) handler(payload);
    };
    this.addEventListener("message", f);
    return () => this.removeEventListener("message", f);
  }
}
