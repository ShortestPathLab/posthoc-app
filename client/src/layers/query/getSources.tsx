import { dump } from "js-yaml";
import { truncate } from "lodash-es";
import { maxStringPropLength, Controller } from ".";
import { mapValuesDeep } from "./mapValuesDeep";

export const getSources = ((layer) => {
  const { algorithm = null, start = 0, end = 0, query } = layer?.source ?? {};

  return [
    {
      id: "params",
      name: "Query",
      language: "yaml",
      readonly: true,
      content: dump(
        {
          algorithm,
          instances: [{ start, end }],
          mapURI: "(...)",
          format: "(...)",
          ...mapValuesDeep(query, (t) =>
            typeof t === "string"
              ? t.length > maxStringPropLength
                ? `${truncate(t, { length: maxStringPropLength })} (${
                    t.length
                  } characters)`
                : t
              : t
          ),
        },
        { noCompatMode: true }
      ),
    },
  ];
}) satisfies Controller["getSources"];
