import { fileDialog as file } from "file-select-dialog";
import { find, startCase } from "lodash";
import { Feature, FeatureDescriptor } from "protocol/FeatureQuery";
import { UploadedTrace } from "slices/UIState";
function ext(s: string) {
  return s.split(".").pop();
}
function name(s: string) {
  return s.split(".").shift();
}

const customMapId = "internal/custom";

const customTraceId = "json";

export const custom = (map?: Partial<Feature>) => ({
  name: map?.id === customMapId ? `Imported Map - ${map?.name}` : "Import Map",
  description: "Internal",
  id: customMapId,
});

export const customTrace = (trace?: any) => ({
  name:
    trace?.type === customTraceId
      ? `Imported Trace - ${trace?.name}`
      : "Import Trace",
  description: "Internal",
  id: customTraceId,
});

const TRACE_FORMAT = "json";

export async function uploadTrace(): Promise<
  (() => Promise<UploadedTrace | undefined>) | undefined
> {
  const f = await file({
    accept: [`.${TRACE_FORMAT}`],
    strict: true,
  });
  if (f) {
    return async () => {
      if (ext(f.name) === TRACE_FORMAT) {
        const content = await f.text();
        const parsed = JSON.parse(content);
        return {
          ...customTrace(),
          format: parsed?.format,
          content: parsed,
          name: startCase(name(f.name)),
          type: customTraceId,
        };
      } else {
        throw new Error(`The format (${ext(f.name)}) is unsupported.`);
      }
    };
  }
}

// async function readAll(f: File) {
//   const a = f.stream().getReader();
//   let out = "";
//   const decoder = new TextDecoder();
//   while (true) {
//     const { done, value } = await a.read();
//     out += decoder.decode(value);
//     console.log(value);
//     if (done) break;
//   }
//   return out;
// }

export async function uploadMap(accept: FeatureDescriptor[]) {
  const f = await file({
    accept: accept.map(({ id }) => `.${id}`),
    strict: true,
  });
  if (f) {
    return async () => {
      if (find(accept, { id: ext(f.name) })) {
        return {
          ...custom(),
          format: ext(f.name),
          content: await f.text(),
          name: startCase(name(f.name)),
        } as Feature & { format?: string };
      } else {
        throw new Error(`The format (${ext(f.name)}) is unsupported.`);
      }
    };
  }
}