import download from "downloadjs";
import stringify from "json-beautify";
import { Trace } from "protocol/Trace";

export function saveJSON(filename: string, specimen?: Trace) {
  download(
    stringify(specimen, null as any, 2),
    `${filename}.json`,
    "application/json"
  );
}