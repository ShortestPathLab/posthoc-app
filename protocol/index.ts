import { CheckConnectionMethod } from "./CheckConnection";
import {
  AlgorithmFeatureQueryMethod,
  MapTypeFeatureQueryMethod,
} from "./FeatureQuery";
import { Method, RequestOf } from "./Message";
import { PathfindingTaskMethod } from "./SolveTask";

type Entry<T extends Method> = { [K in T["name"]]: T };

export type NameMethodMap = Entry<CheckConnectionMethod> &
  Entry<AlgorithmFeatureQueryMethod> &
  Entry<MapTypeFeatureQueryMethod> &
  Entry<PathfindingTaskMethod>;
