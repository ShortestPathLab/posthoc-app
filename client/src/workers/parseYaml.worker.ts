import { load, YAMLException } from "js-yaml";
import { usingMessageHandler } from "./usingWorker";
import Ajv, { Schema, ValidationError } from "ajv";

onmessage = usingMessageHandler(
  async (str: MessageEvent<{ content: string; schema?: Schema }>) => {
    try {
      const u = load(str.data.content);
      if (str.data.schema) {
        const ajv = new Ajv({ strict: false });
        const validate = ajv.compile(str.data.schema);
        const valid = validate(u);
        if (!valid) {
          console.log(JSON.stringify(validate.errors, null, 2));
          return { error: new ValidationError(validate.errors!) };
        }
      }
      return { result: u };
    } catch (e: unknown) {
      if (e instanceof YAMLException) return { error: e };
      throw e;
    }
  }
);
