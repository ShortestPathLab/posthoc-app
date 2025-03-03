import { PlaybackLayerData } from "components/app-bar/Playback";
import { ParseTraceWorkerReturnType } from "components/renderer/parser/ParseTraceSlaveWorker";
import { DebugLayerData } from "hooks/DebugLayerData";
import { Trace as TraceLegacy } from "protocol";
import { Trace } from "protocol/Trace-v140";
import { Layer } from "slices/layers";
import { UploadedTrace } from "slices/UIState";
import { TrustedLayerData } from "../TrustedLayerData";

export type TraceLayerData = {
  trace?: UploadedTrace & { error?: string };
  parsedTrace?: {
    components?: ParseTraceWorkerReturnType;
    content?: Trace | TraceLegacy;
    error?: string;
  };
  onion?: "off" | "transparent" | "solid";
} & PlaybackLayerData &
  DebugLayerData &
  TrustedLayerData;

export type TraceLayer = Layer<TraceLayerData>;
