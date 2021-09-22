import { transform } from "@babel/standalone";

export function transpile(script: string = "") {
  try {
    return transform(script, {}).code;
  } catch {
    return "";
  }
}
