import { JSONSchema } from "monaco-yaml";

export const schema: JSONSchema = {
  definitions: {
    view: {
      type: "object",
      /**
       * Intrinsic properties
       */
      properties: {
        $: {
          type: "string",
          description:
            "The view type. This must either be one of the views defined here or a primitive.",
        },
        type: {
          markdownDescription:
            "The `type` property should succinctly represent the kind of event that was recorded. It's used everywhere in Posthoc's UI to identify events.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#type)",
        },
        clear: {
          type: ["string", "boolean"],
          markdownDescription:
            "Control when elements should be cleared.\n\n - `false`: Event remains visible until the end of the search trace.\n - `true`: Event clears immediately after the step they're drawn.\n - `string`: Event remains visible until another event of the same `id`, and the specified type (e.g. `close`), is encountered. This can also be an expression that evaluates to a string.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#clear)",
        },
        $if: {
          type: ["string", "boolean"],
          markdownDescription:
            "Conditionally render a view. This property is only evaluated at the time of the event.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#if)",
        },
        $for: {
          type: "object",
          markdownDescription:
            "Repeat a view based on a value. This property is only evaluated at the time of the event.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#for)",
        },
        $info: {
          type: "object",
          markdownDescription:
            "By default, clicking on elements in the viewport will show you info about the event that rendered it. However, you can define information that will only be shown when a specific part of the event was clicked.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#info)",
        },
      },
      patternProperties: {
        "^(.+)$": {
          description: "View property.",
        },
      },
    },
  },
  type: "object",
  required: ["version", "views", "events"],
  properties: {
    version: {
      type: "string",
      enum: ["1.4.0"],
      markdownDescription:
        "The search trace version. This value dictates whether the legacy or the modern parser is used. Currently, versions below `1.4.0` will use the legacy parser. The legacy format also has no intellisense support.",
    },
    views: {
      type: "object",
      description:
        "Define custom visualisations for your data. Here, you can write custom views that define how your events translate to renderable objects.",
      properties: {
        main: {
          type: "array",
          items: { $ref: "#/definitions/view" },
          description:
            "Main view. A view is a reusable component that defines how to translate some event to renderable objects. This view is also the entry point to your visualisation.",
        },
      },
      patternProperties: {
        "^(.+)$": {
          type: "array",
          items: { $ref: "#/definitions/view" },
          description:
            "View. A view is a reusable component that defines how to translate some event to renderable objects.",
        },
      },
    },
    pivot: {
      markdownDescription:
        "Define an expression for `x` and `y` that determines the center of each event. This is used to draw features like paths to root or event labels.",
      deprecationMessage:
        "Pivot is deprecated. In the future, the functionality provided by pivot will be replaced by the views system.",
    },
    events: {
      type: "array",
      items: { type: "object" },
      description: "Your recorded data.",
    },
  },
};
