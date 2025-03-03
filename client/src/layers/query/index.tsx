import { RouteOutlined } from "@mui-symbols-material/w400";
import { LayerController } from "layers";
import { controller as traceController } from "layers/trace";
import { TraceLayerData } from "layers/trace/TraceLayer";
import { omit } from "lodash-es";
import { compress } from "./compress";
import { editor } from "./editor";
import { getSources } from "./getSources";
import { provideSelectionInfo } from "./provideSelectionInfo";
import { service } from "./service";

export type QueryLayerData = {
  mapLayerKey?: string;
  query?: any;
  start?: number;
  end?: number;
  algorithm?: string;
} & TraceLayerData;

export const maxStringPropLength = 40;

export type Controller = LayerController<"query", QueryLayerData>;

export const controller = {
  ...omit(traceController, "claimImportedFile"),
  key: "query",
  icon: <RouteOutlined />,
  inferName: (l) => l.source?.trace?.name ?? "Untitled Query",
  compress,
  editor,
  service,
  provideSelectionInfo,
  getSources,
} satisfies LayerController<"query", QueryLayerData>;
