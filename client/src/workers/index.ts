import "./hash.worker";
import "./ipc.worker";

export class HashWorker extends Worker {
  constructor() {
    super(new URL("./hash.worker.ts", import.meta.url), { type: "module" });
  }
}
export class IPCWorker extends Worker {
  constructor() {
    super(new URL("./ipc.worker.ts", import.meta.url), { type: "module" });
  }
}
