import ipcWorkerUrl from "./ipc.worker.ts?worker&url";

// The IPC worker is long-lived and bidirectional (see IPCTransport), so it is
// intentionally NOT migrated to the one-shot Comlink lane helper.
export class IPCWorker extends Worker {
  constructor() {
    super(ipcWorkerUrl, { type: "module" });
  }
}
