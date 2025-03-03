import {
  BlurOnOutlined as DisabledIcon,
  ViewInArOutlined,
} from "@mui-symbols-material/w400";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { RendererProps, SelectEvent } from "components/renderer/Renderer";
import { RenderLayer } from "layers/RenderLayer";
import { clamp, find, floor, get, map, some } from "lodash";
import { nanoid } from "nanoid";
import { isStepsLayer } from "pages/steps/StepsLayer";
import { Size } from "protocol";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebounce } from "react-use";
import { Renderer, RendererEvent } from "renderer";
import { slice } from "slices";
import { useRenderers } from "slices/renderers";
import { useScreenshots } from "slices/screenshots";
import { Placeholder } from "./Placeholder";
import { SelectionMenu } from "./SelectionMenu";
import { TrustedContent } from "./TrustedContent";
import { isMobile } from "mobile-device-detect";

const TILE_RESOLUTION = 128;

const tileSize = (playing: boolean = false) =>
  (playing ? devicePixelRatio * 1.5 : devicePixelRatio * 2) *
  TILE_RESOLUTION *
  (isMobile ? 0.25 : 1);

const rendererOptions = {
  tileSubdivision: isMobile ? 1 : 2,
  // Use 25% of available CPUs
  workerCount: clamp(floor(navigator.hardwareConcurrency / 4), 1, 12),
  tileResolution: {
    width: tileSize(),
    height: tileSize(),
  },
};

const TraceRendererContext = createContext<{ renderer?: Renderer }>({});

export function useRendererInstance() {
  return useContext(TraceRendererContext);
}

function useRenderer(renderer?: string, { width, height }: Partial<Size> = {}) {
  const theme = useTheme();
  const [renderers] = useRenderers();
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [instance, setInstance] = useState<Renderer>();

  useEffect(() => {
    if (ref.current && width && height && renderer) {
      const entry = find(renderers, (r) => r.renderer.meta.id === renderer);
      if (entry) {
        try {
          const instance = new entry.renderer.constructor();
          instance.setup({
            ...rendererOptions,
            screenSize: {
              width,
              height,
            },
            backgroundColor: theme.palette.background.paper,
            accentColor: theme.palette.primary.main,
          });
          ref.current.append(instance.getView()!);
          setInstance(instance);
          setError("");
          const storedRef = ref.current;
          return () => {
            try {
              storedRef.removeChild(instance.getView()!);
              setInstance(undefined);
            } catch (e) {
              console.warn(e);
            } finally {
              instance.destroy();
            }
          };
        } catch (e) {
          setError(`${entry.renderer.meta.name}: ${get(e, "message")}`);
          setInstance(undefined);
        }
      }
    }
  }, [ref.current, map, renderer, renderers, theme, setError, setInstance]);

  useDebounce(
    () => {
      if (instance && width && height) {
        instance.setOptions({ screenSize: { width, height } });
      }
    },
    theme.transitions.duration.standard,
    [instance, width, height]
  );
  return { instance, ref, error };
}

function useLoading() {
  "use no memo";
  return slice.loading.use((l) => !!l.layers);
}

function TraceRendererCircularProgress() {
  const loading = useLoading();
  return loading ? (
    <CircularProgress
      sx={{
        position: "absolute",
        top: (t) => t.spacing(6 + 2),
        right: (t) => t.spacing(2),
      }}
    />
  ) : null;
}

const VIEWPORT_PAGE_DESCRIPTION =
  "When you create a layer, you'll see it visualised here.";

function useAnyLayerPlaying() {
  return slice.layers.use((l) =>
    some(l, (l) => isStepsLayer(l) && l.source?.playback === "playing")
  );
}

export function TraceRenderer({
  width,
  height,
  renderer,
  rendererRef,
  layers,
}: RendererProps) {
  const key = useMemo(() => nanoid(), []);
  const { instance, error, ref } = useRenderer(renderer, { width, height });
  const [, setScreenshots] = useScreenshots();

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
    setScreenshots(() => ({
      [key]: f,
    }));
    return () => setScreenshots(() => ({ [key]: undefined }));
  }, [key, instance]);

  useEffect(() => {
    if (instance) {
      instance.setOptions({
        // TODO: This is a 2D renderer specific setting
        tileResolution: {
          width: tileSize(playing),
          height: tileSize(playing),
        },
      } as any);
    }
  }, [instance, playing]);

  return (
    <>
      <TraceRendererCircularProgress />
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
                    color: "text.secondary",
                  }}
                >
                  <DisabledIcon sx={{ mb: 2 }} fontSize="large" />
                  {error}
                </Box>
              ) : (
                <Box
                  ref={ref}
                  sx={{
                    "> canvas": { position: "absolute" },
                    animation: "fadeIn 75ms linear 450ms both",
                  }}
                >
                  {layers.map((l, i) => (
                    <RenderLayer
                      index={i}
                      key={l.key}
                      layer={l}
                      width={width}
                      height={height}
                    />
                  ))}
                </Box>
              )}
            </TrustedContent>
          ) : (
            <Placeholder
              icon={<ViewInArOutlined />}
              label="Viewport"
              width={width}
              height={height}
              secondary={VIEWPORT_PAGE_DESCRIPTION}
            />
          )}
        </Box>
      </TraceRendererContext.Provider>
      <SelectionMenu
        selection={selection}
        onClose={() => setSelection(undefined)}
      />
    </>
  );
}
