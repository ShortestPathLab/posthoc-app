import { fileDialog as file } from "file-select-dialog";
import { find, startCase } from "lodash";
import { Feature, FeatureDescriptor } from "protocol/FeatureQuery";
import { UploadedTrace } from "slices/UIState";
import { parseYamlAsync } from "workers/async";

function ext(s: string) {
  return s.split(".").pop();
}
function name(s: string) {
  return s.split(".").shift();
}

const customId = "internal/custom";

export const custom = (
  resource?: Partial<Pick<Feature, "id" | "name">>,
  name = "resource"
) => ({
  name:
    resource?.id === customId
      ? `Imported ${startCase(name)} - ${resource?.name}`
      : `Import ${startCase(name)}`,
  description: "Internal",
  id: customId,
});

const FORMATS = ["json", "yaml", "yml"];

export type FileHandle<T> = {
  file: File;
  read: () => Promise<T>;
};

export async function uploadTrace(): Promise<
  FileHandle<UploadedTrace | undefined> | undefined
> {
  const f = await file({
    accept: FORMATS.map((c) => `.trace.${c}`),
    strict: true,
  });
  if (f) {
    return {
      file: f,
      read: async () => {
        if (FORMATS.includes(ext(f.name)!)) {
          const content = await f.text();
          const parsed = await parseYamlAsync(content);
          return {
            ...custom(),
            format: parsed?.format,
            content: parsed,
            name: startCase(name(f.name)),
            type: customId,
          };
        } else {
          throw new Error(`The format (${ext(f.name)}) is unsupported.`);
        }
      },
    };
  }
}

export async function uploadMap(
  accept: FeatureDescriptor[]
): Promise<
  FileHandle<(FeatureDescriptor & { content?: string }) | undefined> | undefined
> {
  const f = await file({
    accept: accept.map(({ id }) => `.${id}`),
    strict: true,
  });
  if (f) {
    return {
      file: f,
      read: async () => {
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
      },
    };
  }
}
