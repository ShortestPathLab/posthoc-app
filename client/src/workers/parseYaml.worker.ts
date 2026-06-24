import Ajv, { Schema, ValidationError } from "ajv";
import { load, YAMLException } from "js-yaml";

export type ParseYamlResult<T = unknown> =
  | { result: T; error: undefined }
  | { error: YAMLException | ValidationError; result: undefined };

export function parseYaml({
  content,
  schema,
}: {
  content: string;
  schema?: Schema;
}): ParseYamlResult {
  try {
    const u = load(content);
    if (schema) {
      const ajv = new Ajv({ strict: false });
      const validate = ajv.compile(schema);
      const valid = validate(u);
      if (!valid) {
        console.log(JSON.stringify(validate.errors, null, 2));
        return { error: new ValidationError(validate.errors!), result: undefined };
      }
    }
    return { result: u, error: undefined };
  } catch (e: unknown) {
    if (e instanceof YAMLException) return { error: e, result: undefined };
    throw e;
  }
}
