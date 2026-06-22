import { isArray, isObject, map, mapValues } from "es-toolkit/compat";

export function mapValuesDeep<T, U>(v: T, callback: (t: unknown) => any): U {
  return isArray(v)
    ? (map(v, (v) => mapValuesDeep(v, callback)) as U)
    : isObject(v)
      ? (mapValues(v, (v) => mapValuesDeep(v, callback)) as U)
      : (callback(v) as U);
}
