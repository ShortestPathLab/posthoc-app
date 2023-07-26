import { EditorProps } from "components/Editor";
import { MapPicker, TracePicker } from "components/app-bar/Input";
import { NodeList } from "components/render/renderer/generic/NodeList";
import { useMapContent } from "hooks/useMapContent";
import { useParsedMap } from "hooks/useParsedMap";
import { Dictionary, map, set } from "lodash";
import { withProduce } from "produce";
import { FC, createElement, useMemo } from "react";
import { Layer, Map, UploadedTrace } from "slices/UIState";
import { Option } from "./Option";
import {
  CompiledComponent,
  ParsedComponent,
  Trace,
  TraceEvent,
} from "protocol";
import { parse } from "components/renderer/parser";
import { mapProperties } from "components/renderer/parser/mapProperties";

type LayerSource<K extends string, T> = {
  key: K;
  editor: FC<EditorProps<Layer<T>>>;
  renderer: FC<{ layer?: Layer<T> }>;
};

const mapLayerSource: LayerSource<"map", { map?: Map }> = {
  key: "map",
  editor: withProduce(({ value, produce }) => {
    return (
      <>
        <Option
          label="Source"
          content={
            <MapPicker
              value={value?.source?.map}
              onChange={(v) => produce((d) => set(d, "source.map", v))}
            />
          }
        />
      </>
    );
  }),
  renderer: ({ layer }) => {
    const { result: mapContent } = useMapContent(layer?.source?.map);
    const { result: parsedMap } = useParsedMap(mapContent);

    return (
      <>
        <NodeList nodes={parsedMap?.nodes} />
      </>
    );
  },
};

function useTraceContent(trace?: Trace, view: "main" = "main") {
  return useMemo(() => {
    const parsed = parse(
      trace?.render?.views?.[view]?.components ?? [],
      trace?.render?.components ?? {}
    );
    return {
      events: trace?.events ?? [],
      apply: (event: TraceEvent) =>
        map(parsed, (p) =>
          mapProperties<
            ParsedComponent<string, any>,
            CompiledComponent<string, any>
          >(p, (c) => c(event))
        ),
    };
  }, [trace, view]);
}

const traceLayerSource: LayerSource<"trace", { trace?: UploadedTrace }> = {
  key: "trace",
  editor: withProduce(({ value, produce }) => {
    return (
      <>
        <Option
          label="Trace"
          content={
            <TracePicker
              onChange={(v) => produce((d) => set(d, "source.trace", v))}
              value={value?.source?.trace}
            />
          }
        />
      </>
    );
  }),
  renderer: ({ layer }) => {
    const {} = useTraceContent(layer?.source?.trace?.content);
    return <></>;
  },
};
const queryLayerSource: LayerSource<"query", {}> = {
  key: "query",
  editor: withProduce(({ value, produce }) => {
    return (
      <>
        <Option label="This source type is not implemented" />
      </>
    );
  }),
  renderer: ({ layer }) => {
    return <></>;
  },
};

export const layerHandlers: Dictionary<LayerSource<string, any>> = {
  map: mapLayerSource,
  trace: traceLayerSource,
  query: queryLayerSource,
};

export function RenderLayer({ layer }: { layer?: Layer }) {
  return (
    <>
      {layer &&
        createElement(layerHandlers[layer?.source?.type ?? ""]?.renderer, {
          layer,
        })}
    </>
  );
}
