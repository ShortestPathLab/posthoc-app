import { BlurOnOutlined as DisabledIcon, ViewInArOutlined } from "@mui-symbols-material/w300";
import { Box, useTheme } from "@mui/material";
import { StatusBanner } from "components/generic/StatusBanner";
import { RendererProps, SelectEvent } from "components/renderer/Renderer";
import { RenderLayer } from "layers/RenderLayer";
import { clamp } from "es-toolkit";
import { find, floor, get, some } from "es-toolkit/compat";
import { nanoid } from "nanoid";
import { isStepsLayer } from "pages/steps/StepsLayer";
import { Size } from "protocol";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { Renderer, RendererEvent } from "renderer";
import { slice } from "slices";
import { Placeholder } from "./Placeholder";
import { SelectionMenu } from "./SelectionMenu";
import { TrustedContent } from "./TrustedContent";
import { isMobile } from "mobile-device-detect";
import { useOne } from "slices/useOne";

const TILE_RESOLUTION = 128;

const tileSize = (playing: boolean = false) =>
  (playing ? devicePixelRatio * 1.5 : devicePixelRatio * 2) *
  TILE_RESOLUTION *
  (isMobile ? 0.25 : 1);

const rendererOptions = {
  tileSubdivision: isMobile ? 1 : 2,
  // Use 25% of available CPUs
  workerCount: clamp(floor(navigator.hardwareConcurrency / 4), 1, 12),
  tileResolution: { width: tileSize(), height: tileSize() },
};

const TraceRendererContext = createContext<{ renderer?: Renderer }>({});

export function useRendererInstance() {
  return useContext(TraceRendererContext);
}

function useRenderer(renderer?: string, { width, height }: Partial<Size> = {}) {
  const theme = useTheme();
  const renderers = useOne(slice.renderers);
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [error, setError] = useState("");
  const [instance, setInstance] = useState<Renderer>();

  useEffect(() => {
    if (ref && renderer) {
      const entry = find(renderers, (r) => r.renderer.meta.id === renderer);
      if (entry) {
        try {
          const instance = new entry.renderer.constructor();
          instance.setup({
            ...rendererOptions,
            screenSize: { width: 256, height: 256 },
            backgroundColor: theme.palette.background.paper,
            accentColor: theme.palette.primary.main,
          });
          ref.append(instance.getView()!);
          setInstance(instance);
          setError("");
          return () => {
            try {
              ref.removeChild(instance.getView()!);
              setInstance(undefined);
            } catch (e) {
              console.warn(e);
            }
            instance.destroy();
          };
        } catch (e) {
          setError(`${entry.renderer.meta.name}: ${get(e, "message")}`);
          setInstance(undefined);
        }
      }
    }
  }, [ref, theme.palette.primary.main, theme.palette.background.paper, renderer, renderers]);

  useDebounce(
    () => {
      if (instance && width && height) {
        instance.setOptions({ screenSize: { width, height } });
      }
    },
    theme.transitions.duration.standard,
    [instance, width, height],
  );
  return { instance, ref, error, setRef };
}

function useLoading() {
  return useOne(slice.loading, (l) => !!l.layers);
}

/**
 * Aggregate streaming status across all layers:
 * - "partial": some streaming trace is showing a preview ahead of its frontier
 *   (the current step isn't fully generated yet).
 * - "loading": something is generating, but what's shown is correct.
 * - "idle": nothing in flight.
 */
function useTraceStreamStatus(): "idle" | "loading" | "partial" {
  const oneShot = useLoading();
  return useOne(slice.layers, (layers) => {
    let loading = oneShot;
    let partial = false;
    for (const l of layers) {
      const stream = (l as any)?.source?.parsedTrace?.stream;
      if (stream && !stream.complete) {
        loading = true;
        if (((l as any)?.source?.step ?? 0) >= stream.frontier) partial = true;
      }
    }
    return partial ? "partial" : loading ? "loading" : "idle";
  });
}

function TraceRendererStatusBanner() {
  const status = useTraceStreamStatus();
  if (status === "idle") return null;
  const partial = status === "partial";
  return (
    <StatusBanner
      color={partial ? "warning" : "info"}
      label={partial ? "This is a partial preview, processing" : "Processing"}

    />
  );
}

const VIEWPORT_PAGE_DESCRIPTION = "When you create a layer, you'll see it visualised here.";

function useAnyLayerPlaying() {
  return useOne(slice.layers, (l) =>
    some(l, (l) => isStepsLayer(l) && l.source?.playback === "playing"),
  );
}

export function TraceRenderer({ width, height, renderer, rendererRef, layers }: RendererProps) {
  const key = useMemo(() => nanoid(), []);
  const { instance, error, setRef } = useRenderer(renderer, { width, height });

  const playing = useAnyLayerPlaying();

  const [selection, setSelection] = useState<SelectEvent>();

  useEffect(() => {
    if (instance) {
      const handleClick = (e: Event, e1: RendererEvent): void => {
        const e2 = e as MouseEvent;
        setSelection({
          client: { x: e2.clientX, y: e2.clientY },
          world: e1.world,
          info: { point: e1.world, components: e1.components },
        });
      };
      instance.on("click", handleClick);
      return () => void instance.off("click", handleClick);
    }
  }, [instance]);
  const context = useMemo(() => ({ renderer: instance }), [instance]);

  useEffect(() => rendererRef?.(instance), [instance, rendererRef]);

  useEffect(() => {
    const f = async () => await instance?.toDataUrl?.();
    slice.screenshots.set((s) => void (s[key] = f));
    return () => slice.screenshots.set((s) => void delete s[key]);
  }, [key, instance]);

  useEffect(() => {
    if (instance) {
      instance.setOptions({
        // TODO: This is a 2D renderer specific setting
        tileResolution: { width: tileSize(playing), height: tileSize(playing) },
      } as any);
    }
  }, [instance, playing]);

  return (
    <>
      <TraceRendererStatusBanner />
      <TraceRendererContext.Provider value={context}>
        <Box sx={{ width, height }}>
          {layers?.length ? (
            <TrustedContent>
              {error ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width,
                    height,
                    alignItems: "center",
                    justifyContent: "center",
                    color: (t) => t.palette.text.secondary,
                  }}
                >
                  <DisabledIcon sx={{ mb: 2 }} fontSize="large" />
                  {error}
                </Box>
              ) : (
                <Box
                  ref={setRef}
                  sx={{
                    "> canvas": { position: "absolute" },
                    animation: "fadeIn 75ms linear 450ms both",
                  }}
                >
                  {layers.map((l, i) => (
                    <RenderLayer index={i} key={l.key} layer={l} width={width} height={height} />
                  ))}
                </Box>
              )}
            </TrustedContent>
          ) : (
            <Placeholder
              icon={<ViewInArOutlined />}
              label="Viewport"
              sx={{ width, height }}
              secondary={VIEWPORT_PAGE_DESCRIPTION}
            />
          )}
        </Box>
      </TraceRendererContext.Provider>
      <SelectionMenu selection={selection} onClose={() => setSelection(undefined)} />
    </>
  );
}
