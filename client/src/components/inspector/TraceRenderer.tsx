import {
  BlurOnTwoTone as DisabledIcon,
  ViewInArTwoTone,
} from "@mui/icons-material";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { RendererProps } from "components/renderer/Renderer";
import { useParsedMap } from "hooks/useParsedMap";
import { filter, find, map, uniq } from "lodash";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebounce } from "react-use";
import { Renderer } from "renderer";
import { useRenderers } from "slices/renderers";
import { useSpecimen } from "slices/specimen";
import { Placeholder } from "./Placeholder";
import { useLoading } from "slices/loading";
import { RenderLayer } from "components/layer-editor/layers/LayerSource";
import { useUIState } from "slices/UIState";
import { Size } from "protocol";

const rendererOptions = {
  tileSubdivision: 1,
  workerCount: 4,
  tileResolution: {
    width: 512,
    height: 512,
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
            instance.destroy();
            setInstance(undefined);
          } catch (e) {
            console.warn(e);
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

export function TraceRenderer({
  width,
  height,
  renderer,
  rendererRef,
  layers,
}: RendererProps) {
  const { instance, error, ref } = useRenderer(renderer, { width, height });

  const context = useMemo(() => ({ renderer: instance }), [instance]);

  useEffect(() => rendererRef?.(instance), [instance, rendererRef]);

  return (
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
  );
}
