import { Dictionary } from "lodash";
import { useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { MapParserOptions } from "./index";

export function useMapInfo<T extends {}, M extends Dictionary<string>>({
  parser,
  options,
  transformer,
}: MapParserOptions<T, M>) {
  const [{ map, specimen }] = useSpecimen();
  const m = useMemo(() => parser(map ?? "", options), [map, parser, options]);
  const t = useMemo(() => transformer(m, specimen), [m, specimen, transformer]);
  return useMemo(
    () => ({
      map: m,
      transform: t,
    }),
    [m, t]
  );
}
