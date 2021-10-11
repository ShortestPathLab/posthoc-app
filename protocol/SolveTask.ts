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

type PathfindingTaskParams = {
  mapURI: MapURI;
  algorithm: string;
  mapType: string;
  /**
   * The index of the start node.
   */
  start: number;
  /**
   * The index of the end node.
   */
  end: number;
};

export type PathfindingTask = SolveTask<"pathfinding", PathfindingTaskParams>;

export type SearchTraceResult = Response<Trace | undefined>;

export type PathfindingTaskMethod = Method<PathfindingTask, SearchTraceResult>;
