import { Method, Namespace, Response } from "./Message";

export type SolveTask<T extends string, Params = {}> = Namespace<
  "solve",
  T,
  Params
>;

type PathfindingTaskParams = {
  mapURI: string;
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

/**
 * TODO Create type definition for search trace.
 */
type SearchTrace = any;

export type SearchTraceResult = Response<SearchTrace>;

export type PathfindingTaskMethod = Method<PathfindingTask, SearchTraceResult>;
