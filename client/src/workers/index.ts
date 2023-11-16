import hashWorkerUrl from "./hash.worker.ts?worker&url";
import ipcWorkerUrl from "./ipc.worker.ts?worker&url";
import compressWorkerUrl from "./compress.worker.ts?worker&url";
import compressBinaryWorkerUrl from "./compressBinary.worker.ts?worker&url";
import decompressBinaryWorkerUrl from "./decompressBinary.worker.ts?worker&url";
import yamlWorkerUrl from "./parseYaml.worker.ts?worker&url";

export class HashWorker extends Worker {
  constructor() {
    super(hashWorkerUrl, { type: "module" });
  }
}

export class CompressWorker extends Worker {
  constructor() {
    super(compressWorkerUrl, { type: "module" });
  }
}
export class CompressBinaryWorker extends Worker {
  constructor() {
    super(compressBinaryWorkerUrl, { type: "module" });
  }
}
export class DecompressBinaryWorker extends Worker {
  constructor() {
    super(decompressBinaryWorkerUrl, { type: "module" });
  }
}

export class IPCWorker extends Worker {
  constructor() {
    super(ipcWorkerUrl, { type: "module" });
  }
}
export class ParseYamlWorker extends Worker {
  constructor() {
    super(yamlWorkerUrl, { type: "module" });
  }
}
