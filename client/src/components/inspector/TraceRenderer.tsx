import {
  BlurOnOutlined as DisabledIcon,
  ViewInArOutlined,
} from "@mui/icons-material";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { RendererProps, SelectEvent } from "components/renderer/Renderer";
import { usePlaybackState } from "hooks/usePlaybackState";
import { RenderLayer } from "layers/RenderLayer";
import { clamp, find, map } from "lodash";
import { nanoid } from "nanoid";
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
import { useLoading } from "slices/loading";
import { useRenderers } from "slices/renderers";
import { useScreenshots } from "slices/screenshots";
import { Placeholder } from "./Placeholder";
import { SelectionMenu } from "./SelectionMenu";

const TILE_RESOLUTION = 128;

const tileSize = (playing: boolean = false) =>
  (playing ? 0.75 : devicePixelRatio) * TILE_RESOLUTION;

const rendererOptions = {
  tileSubdivision: 2,
  workerCount: clamp(navigator.hardwareConcurrency - 1, 1, 12),
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
    setError("");
    if (ref.current && width && height && renderer) {
      const entry = find(renderers, (r) => r.renderer.meta.id === renderer);
      if (entry) {
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
        return () => {
          try {
            ref.current?.removeChild?.(instance.getView()!);
            setInstance(undefined);
          } catch (e) {
            console.warn(e);
          } finally {
            instance.destroy();
          }
        };
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

function TraceRendererCircularProgress() {
  const [{ map, specimen }] = useLoading();
  return (
    !!(map || specimen) && (
      <CircularProgress
        sx={{
          position: "absolute",
          top: (t) => t.spacing(6 + 2),
          right: (t) => t.spacing(2),
        }}
      />
    )
  );
}

export function TraceRenderer({
  width,
  height,
  renderer,
  rendererRef,
  layers,
}: RendererProps) {
  const key = useMemo(nanoid, []);
  const { instance, error, ref } = useRenderer(renderer, { width, height });
  const { playing } = usePlaybackState();

  const [, setScreenshots] = useScreenshots();

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
        {layers?.length ? (
          error ? (
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
            <>
              <Box ref={ref}>
                {layers.map((l, i) => (
                  <RenderLayer index={i} key={l.key} layer={l} />
                ))}
              </Box>
            </>
          )
        ) : (
          <Placeholder
            icon={<ViewInArOutlined />}
            label="No layers to render"
            width={width}
            height={height}
          />
        )}
      </TraceRendererContext.Provider>
      <SelectionMenu
        selection={selection}
        onClose={() => setSelection(undefined)}
      />
    </>
  );
}
