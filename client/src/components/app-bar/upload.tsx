import { fileDialog as file } from "file-select-dialog";
import { find, startCase } from "lodash";
import { Feature, FeatureDescriptor } from "protocol/FeatureQuery";

function ext(s: string) {
  return s.split(".").pop();
}
function name(s: string) {
  return s.split(".").shift();
}

const customMapId = "internal/custom";

export const custom = (map?: Partial<Feature>) => ({
  name: map?.id === customMapId ? `Custom - ${map?.name}` : "Custom",
  description: "Import Map",
  id: customMapId,
});

export async function upload(accept: FeatureDescriptor[]) {
  const f = await file({
    accept: accept.map(({ id }) => `.${id}`),
    strict: true,
  });
  if (f) {
    if (find(accept, { id: ext(f.name) })) {
      return {
        ...custom(),
        type: ext(f.name),
        content: await f.text(),
        name: startCase(name(f.name)),
      } as Feature;
    } else {
      throw new Error(`The format (${ext(f.name)}) is unsupported.`);
    }
  }
}
