import { getParser } from "components/renderer";
import { useAsync } from "react-async-hook";
import { Map } from "slices/UIState";

const noop = () => <></>;

export function useMapOptions(map?: Map) {
  const { format } = map ?? {};
  return useAsync(async () => {
    return (await getParser(format)?.editor?.(map?.content)) ?? noop;
  }, [format, map?.content]);
}
