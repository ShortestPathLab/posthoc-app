import hashWorkerUrl from "./hash.worker.ts?worker&url";
import ipcWorkerUrl from "./ipc.worker.ts?worker&url";

export class HashWorker extends Worker {
  constructor() {
    super(hashWorkerUrl, { type: "module" });
  }
}

export class IPCWorker extends Worker {
  constructor() {
    super(ipcWorkerUrl, { type: "module" });
  }
}
