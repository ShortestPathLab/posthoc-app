import { CheckConnectionMethod } from "./CheckConnection";
import {
  AlgorithmFeatureQueryMethod,
  MapFeatureQueryMethod,
  MapTypeFeatureQueryMethod,
} from "./FeatureQuery";
import { Method } from "./Message";
import { PathfindingTaskMethod } from "./SolveTask";

type Entry<T extends Method> = { [K in T["name"]]: T };

export type NameMethodMap = Entry<CheckConnectionMethod> &
  Entry<AlgorithmFeatureQueryMethod> &
  Entry<MapTypeFeatureQueryMethod> &
  Entry<MapFeatureQueryMethod> &
  Entry<PathfindingTaskMethod>;
