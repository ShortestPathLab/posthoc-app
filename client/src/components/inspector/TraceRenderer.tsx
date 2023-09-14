import {
  BlurOnTwoTone as DisabledIcon,
  ViewInArTwoTone,
} from "@mui/icons-material";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { RenderLayer } from "components/layer-editor/layers/LayerSource";
import { RendererProps, SelectEvent } from "components/renderer/Renderer";
import { find, map } from "lodash";
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
import { useRenderers } from "slices/renderers";
import { Placeholder } from "./Placeholder";
import { SelectionMenu } from "./SelectionMenu";
import { useLoading } from "slices/loading";

const rendererOptions = {
  tileSubdivision: 2,
  workerCount: 2,
  tileResolution: {
    width: 1024,
    height: 1024,
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
  const { instance, error, ref } = useRenderer(renderer, { width, height });

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
                {layers.map((l) => (
                  <RenderLayer key={l.key} layer={l} />
                ))}
              </Box>
            </>
          )
        ) : (
          <Placeholder
            icon={<ViewInArTwoTone />}
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
