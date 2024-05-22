import { Feature, FeatureDescriptor } from "protocol/FeatureQuery";
import { ParamsOf } from "protocol/Message";
import { PathfindingTask } from "protocol/SolveTask";
import { Trace } from "protocol/Trace";
import { createSlice } from "./createSlice";
import { nanoid as id } from "nanoid";
import { pages } from "pages";

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

export type WorkspaceMeta = {
  screenshots?: string[];
  size?: number;
  author?: string;
} & FeatureDescriptor;

type WorkspaceMetaState = {
  workspaceMeta: WorkspaceMeta;
};

type SidebarState = {
  sidebarOpen: boolean;
};

type FullscreenModalState = {
  fullscreenModal?: keyof typeof pages;
  depth?: number;
};

export type UIState = BusyState &
  WorkspaceMetaState &
  FullscreenModalState &
  SidebarState;

export const [useUIState, UIStateProvider] = createSlice<
  UIState,
  Partial<UIState>
>({
  sidebarOpen: false,
  busy: {},
  depth: 0,
  fullscreenModal: undefined,
  workspaceMeta: {
    id: id(),
    name: "",
    description: "",
    screenshots: [],
    author: "",
    size: 0,
  },
});
