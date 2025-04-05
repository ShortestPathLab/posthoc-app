import { decompressFromUint8Array as decompress } from "lz-string";
import { usingMessageHandler } from "./usingWorker";
onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<ReadableStream<Uint8Array> | Uint8Array>) => {
    if (data instanceof ReadableStream) {
      const reader = data.getReader();
      const chunks: Uint8Array[] = [];
      let result;
      while (!(result = await reader.read()).done) {
        chunks.push(result.value);
      }
      const completeData = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        completeData.set(chunk, offset);
        offset += chunk.length;
      }
      return decompress(completeData);
    } else {
      decompress(data);
    }
  }
);
