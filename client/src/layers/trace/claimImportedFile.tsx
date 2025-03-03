import {
  custom,
  isTraceFormat,
  readUploadedTrace,
} from "components/app-bar/upload";
import { get, startCase } from "lodash-es";
import { nanoid } from "nanoid";
import { name } from "utils/path";
import { Controller } from "./types";

export const claimImportedFile = (async (file: File) =>
  isTraceFormat(file)
    ? {
        claimed: true,
        layer: async (notify) => {
          notify("Opening trace...");
          try {
            const output = readUploadedTrace(file);
            return { trace: await output.read() };
          } catch (e) {
            console.error(e);
            notify(`Error opening, ${get(e, "message")}`);
            return {
              trace: {
                key: nanoid(),
                id: custom().id,
                error: get(e, "message"),
                name: startCase(name(file.name)),
              },
            };
          }
        },
      }
    : { claimed: false }) satisfies Controller["claimImportedFile"];
