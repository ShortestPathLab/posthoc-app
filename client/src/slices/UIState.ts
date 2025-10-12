import { store } from "@davstack/store";
import { nanoid as id } from "nanoid";
import { pages } from "pages";
import { Feature, FeatureDescriptor } from "protocol/FeatureQuery";
import { ParamsOf } from "protocol/Message";
import { PathfindingTask } from "protocol/SolveTask";
import { Trace } from "protocol/Trace-v140";

export type Map = Partial<
  Feature & {
    format: string;
    source?: string;
  }
>;

type BusyState = {
  busy?: { [K in string]: string };
};

export type Specimen = {
  specimen?: Trace;
  map?: string;
  error?: string;
} & Partial<ParamsOf<PathfindingTask>>;

export type UploadedTrace = FeatureDescriptor & {
  content?: Trace;
  source?: string;
  /**
   * Uniquely identifies a trace.
   * The difference between this and `id` is that `key` changes whenever
   * the contents of the trace change, but `id` stays the same.
   */
  key?: string;
};

export type TrustedState = {
  isTrusted?: boolean;
  origin: string | undefined;
};

export type WorkspaceMeta = {
  screenshots?: string[];
  size?: number;
  author?: string;
} & FeatureDescriptor;

type SidebarState = {
  sidebarOpen: boolean;
};

type FullscreenModalState = {
  fullscreenModal: keyof typeof pages | undefined;
  depth?: number;
};

export type UIState = BusyState &
  FullscreenModalState &
  SidebarState &
  TrustedState;

export const workspaceMeta = store<WorkspaceMeta>(
  { id: id(), name: "", description: "", screenshots: [], author: "", size: 0 },
  {
    devtools: { enabled: import.meta.env.DEV },
    name: "workspace-meta",
  }
);

export const UI = store<Required<UIState>>(
  {
    sidebarOpen: false,
    busy: {},
    depth: 0,
    fullscreenModal: undefined,
    isTrusted: false,
    origin: undefined,
  },
  {
    devtools: { enabled: import.meta.env.DEV },
    name: "ui-state",
  }
);
