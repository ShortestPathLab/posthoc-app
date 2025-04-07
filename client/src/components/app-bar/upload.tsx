import { fileDialog as file } from "file-select-dialog";
import { find, startCase } from "lodash-es";
import { nanoid as id } from "nanoid";
import { Trace as TraceLegacy } from "protocol";
import { Feature, FeatureDescriptor } from "protocol/FeatureQuery";
import { Trace } from "protocol/Trace-v140";
import { UploadedTrace } from "slices/UIState";
import { ext, name } from "utils/path";
import { parseYamlAsync } from "workers/async";

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

export const EXTENSIONS = ["json", "yaml", "yml"];

const FORMATS = EXTENSIONS.map((c) => `.trace.${c}`);

export type FileHandle<T> = {
  file: File;
  read: () => Promise<T>;
};

export async function uploadTrace(): Promise<
  FileHandle<UploadedTrace | undefined> | undefined
> {
  const f = await file({
    accept: EXTENSIONS.map((c) => `.${c}`),
    strict: true,
  });
  if (f) {
    return readUploadedTrace(f);
  }
}

export function readUploadedTrace(f: File) {
  return {
    file: f,
    read: async () => {
      if (isTraceFormat(f)) {
        const content = await f.text();
        const { result: parsed, error } = await parseYamlAsync({
          content,
        });
        if (error) throw error;
        return {
          ...custom(),
          content: parsed as TraceLegacy | Trace | undefined,
          name: startCase(name(f.name)),
          type: customId,
          key: id(),
        };
      }
      throw new Error(
        `The file should have one of these extensions: ${FORMATS.join(", ")}`
      );
    },
  };
}

export function isTraceFormat(f: File) {
  return !!find(FORMATS, (r) => f.name.endsWith(r));
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
    return readUploadedMap(f, accept);
  }
}

export function readUploadedMap(f: File, accept: FeatureDescriptor[]) {
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
