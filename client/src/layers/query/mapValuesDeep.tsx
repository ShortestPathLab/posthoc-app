import { isArray, map, isObject, mapValues } from "lodash";

export function mapValuesDeep<T, U>(v: T, callback: (t: unknown) => any): U {
  return isArray(v)
    ? (map(v, (v) => mapValuesDeep(v, callback)) as U)
    : isObject(v)
    ? (mapValues(v, (v) => mapValuesDeep(v, callback)) as U)
    : (callback(v) as U);
}
