import { Dictionary } from "lodash";
import { useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { MapParserOptions } from "components/renderer/Parser";

export function useMap<
  T extends {},
  M extends Dictionary<string>,
  K extends string
>({ parse, options, normalize }: MapParserOptions<T, M, K>) {
  const [{ map, specimen }] = useSpecimen();
  const m = useMemo(() => parse(map ?? "", options), [map, parse, options]);
  const t = useMemo(() => {
    return normalize(m, specimen?.eventList);
  }, [m, specimen?.eventList, normalize]);
  return useMemo(
    () => ({
      map: m,
      scale: t,
    }),
    [m, t]
  );
}
