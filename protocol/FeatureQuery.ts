import { Method, Namespace, Response } from "./Message";

export interface FeatureDescriptor {
  id: string;
  name?: string;
  description?: string;
}

export type FeatureQuery<T extends string, Params = {}> = Namespace<
  "features",
  T,
  Params
>;

export type MapTypeFeatureQuery = FeatureQuery<"mapType">;

export type AlgorithmFeatureQuery = FeatureQuery<"algorithm">;

export type FeatureDescriptorListResult = Response<FeatureDescriptor[]>;

export type EnvironmentFeatureQueryMethod = Method<
  MapTypeFeatureQuery,
  FeatureDescriptorListResult
>;

export type AlgorithmFeatureQueryMethod = Method<
  MapTypeFeatureQuery,
  FeatureDescriptorListResult
>;
