import { Method, Namespace, Response } from "./Message";
import { Trace } from "./Trace";

export interface FeatureDescriptor {
  id: string;
  name?: string;
  description?: string;
  hidden?: boolean;
  lastModified?: number;
}

export interface Feature extends FeatureDescriptor {
  content?: string;
}

export type FeatureQuery<T extends string, Params = {}> = Namespace<
  "features",
  T,
  Params
>;

//
// ─── REQUEST ────────────────────────────────────────────────────────────────────
//

export type MapTypeFeatureQuery = FeatureQuery<"formats">;

export type MapFeatureQuery = FeatureQuery<"map", { id: string }>;

export type MapsFeatureQuery = FeatureQuery<"maps">;

export type AlgorithmFeatureQuery = FeatureQuery<"algorithms">;

export type TraceFeatureQuery = FeatureQuery<"trace", { id: string }>;

export type TracesFeatureQuery = FeatureQuery<"traces">;

export type ChangedFeatureQuery = FeatureQuery<"changed">;

//
// ─── RESPONSE ───────────────────────────────────────────────────────────────────
//

export type FeatureDescriptorListResult = Response<FeatureDescriptor[]>;

export type MapListResult = Response<
  (FeatureDescriptor & { format: string })[]
>;

export type MapResult = Response<(Feature & { format: string }) | undefined>;

export type TraceListResult = Response<FeatureDescriptor[]>;

export type TraceResult = Response<
  (FeatureDescriptor & { content?: Trace }) | undefined
>;

//
// ─── METHOD ─────────────────────────────────────────────────────────────────────
//

export type MapTypeFeatureQueryMethod = Method<
  MapTypeFeatureQuery,
  FeatureDescriptorListResult
>;

export type MapFeatureQueryMethod = Method<MapFeatureQuery, MapResult>;

export type MapsFeatureQueryMethod = Method<MapsFeatureQuery, MapListResult>;

export type TraceFeatureQueryMethod = Method<TraceFeatureQuery, TraceResult>;

export type TracesFeatureQueryMethod = Method<
  TracesFeatureQuery,
  TraceListResult
>;

export type AlgorithmFeatureQueryMethod = Method<
  AlgorithmFeatureQuery,
  FeatureDescriptorListResult
>;

export type ChangedFeatureQueryMethod = Method<ChangedFeatureQuery>;
