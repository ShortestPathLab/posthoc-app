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
  start: number;
  /**
   * The index of the end node.
   */
  end: number;
};

type PathfindingTaskParams = {
  mapURI: MapURI;
  format: string;
  algorithm?: string;
  instances: PathfindingTaskInstance[];
};

export type PathfindingTask = SolveTask<"pathfinding", PathfindingTaskParams>;

export type SearchTraceResult = Response<Trace | undefined>;

export type PathfindingTaskMethod = Method<PathfindingTask, SearchTraceResult>;
