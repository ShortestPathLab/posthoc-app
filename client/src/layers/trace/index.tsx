import { RouteOutlined } from "@mui-symbols-material/w400";
import { claimImportedFile } from "./claimImportedFile";
import { compress } from "./compress";
import { editor } from "./editor";
import { error } from "./error";
import { getSources } from "./getSources";
import { inferName } from "./inferName";
import { onEditSource } from "./onEditSource";
import { provideSelectionInfo } from "./provideSelectionInfo";
import { renderer } from "./renderer";
import { service } from "./service";
import { steps } from "./steps";
import { Controller } from "./types";

export const controller = {
  key: "trace",
  icon: <RouteOutlined />,
  inferName,
  error,
  compress,
  claimImportedFile,
  editor,
  service,
  renderer,
  steps,
  provideSelectionInfo,
  getSources,
  onEditSource,
} satisfies Controller;
