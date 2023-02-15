export const HashWorker = new Worker(new URL("./hash.worker", import.meta.url));
export const IPCWorker = new Worker(new URL("./hash.worker", import.meta.url))