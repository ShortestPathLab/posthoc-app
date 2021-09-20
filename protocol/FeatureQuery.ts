import { Method, Namespace, Response } from "./Message";

export interface FeatureDescriptor {
  id: string;
  name?: string;
  description?: string;
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

export type MapTypeFeatureQuery = FeatureQuery<"mapType">;

export type MapFeatureQuery = FeatureQuery<"map", { id: string }>;

export type MapsFeatureQuery = FeatureQuery<"maps">;

export type AlgorithmFeatureQuery = FeatureQuery<"algorithm">;

//
// ─── RESPONSE ───────────────────────────────────────────────────────────────────
//

export type FeatureDescriptorListResult = Response<FeatureDescriptor[]>;

export type MapListResult = Response<(FeatureDescriptor & { type: string })[]>;

export type MapResult = Response<(Feature & { type: string }) | undefined>;

//
// ─── METHOD ─────────────────────────────────────────────────────────────────────
//

export type MapTypeFeatureQueryMethod = Method<
  MapTypeFeatureQuery,
  FeatureDescriptorListResult
>;

export type MapFeatureQueryMethod = Method<MapFeatureQuery, MapResult>;

export type MapsFeatureQueryMethod = Method<MapsFeatureQuery, MapListResult>;

export type AlgorithmFeatureQueryMethod = Method<
  AlgorithmFeatureQuery,
  FeatureDescriptorListResult
>;
