import { useTheme } from "@mui/material";
import { EditorProps } from "components/Editor";
import { MapPicker, TracePicker } from "components/app-bar/Input";
import {
  LazyNodeList,
  NodeList,
} from "components/render/renderer/generic/NodeList";
import { useMapContent } from "hooks/useMapContent";
import { useParsedMap } from "hooks/useParsedMap";
import { Dictionary, flatMap, set } from "lodash";
import { withProduce } from "produce";
import { TraceEvent } from "protocol";
import { FC, ReactNode, createElement, useMemo } from "react";
import { useThrottle } from "react-use";
import { Layer, Map, UploadedTrace } from "slices/UIState";
import { usePlayback } from "slices/playback";
import { useTraceContent } from "../../../hooks/useTraceContent";
import { Option } from "./Option";

type LayerSource<K extends string, T> = {
  key: K;
  editor: FC<EditorProps<Layer<T>>>;
  renderer: FC<{ layer?: Layer<T> }>;
  steps: FC<{
    layer?: Layer<T>;
    children?: (steps: TraceEvent[]) => ReactNode;
  }>;
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
  steps: ({ children }) => <>{children?.([])}</>,
};

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
    const { palette } = useTheme();
    const [{ step = 0 }] = usePlayback();
    const throttledStep = useThrottle(step, 300);
    const { events, apply } = useTraceContent(layer?.source?.trace?.content);
    const nodes = useMemo(() => flatMap(events, apply), [events, apply]);
    const shadow = useMemo(
      () =>
        flatMap(events, (e) => apply(e)).map((c) => ({
          ...c,
          fill: palette.text.primary,
          alpha: palette.action.hoverOpacity,
        })),
      [events, apply, palette]
    );
    return (
      <>
        <NodeList nodes={shadow} />
        <LazyNodeList step={throttledStep} nodes={nodes} />
      </>
    );
  },
  steps: ({ layer, children }) => {
    const { events } = useTraceContent(layer?.source?.trace?.content);
    return <>{children?.(events)}</>;
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
  steps: ({ children }) => <>{children?.([])}</>,
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
