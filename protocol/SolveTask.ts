import { Method, Namespace, Response } from "./Message";
import { Trace } from "./Trace";

export type SchemeBase = "hash" | "trace" | "map";

export type Scheme = `${SchemeBase}:`;

export type MapURI = `${Scheme}${string}`;

export type SolveTask<T extends string, Params = {}> = Namespace<
  "solve",
  T,
  Params
>;

export type PathfindingTaskInstance = {
  /**
   * The index of the start node.
   */
  start?: number;
  /**
   * The index of the end node.
   */
  end?: number;
};

export type Parameters = {
  [K in string]: any;
};

type PathfindingTaskParams<T extends Parameters = {}> = {
  mapURI: MapURI;
  format: string;
  algorithm?: string;
  parameters?: T;
  instances: PathfindingTaskInstance[];
};

export type PathfindingTask<T extends Parameters = {}> = SolveTask<
  "pathfinding",
  PathfindingTaskParams<T>
>;

export type SearchTraceResult = Response<Trace | undefined>;

export type PathfindingTaskMethod = Method<PathfindingTask, SearchTraceResult>;
