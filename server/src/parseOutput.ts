import { slice, indexOf, lastIndexOf } from "lodash-es";

export function parseOutput(output: string) {
  return JSON.parse(
    slice(output, indexOf(output, "{"), lastIndexOf(output, "}") + 1).join("")
  );
}
