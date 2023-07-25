import {
  BlurOnTwoTone as DisabledIcon,
  ViewInArTwoTone,
} from "@mui/icons-material";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { RendererProps } from "components/renderer/Renderer";
import { useParsedMap } from "hooks/useParsedMap";
import { find, uniq } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "react-use";
import { Renderer } from "renderer";
import { useRenderers } from "slices/renderers";
import { useSpecimen } from "slices/specimen";
import { Placeholder } from "./Placeholder";

const rendererOptions = {
  tileSubdivision: 1,
  workerCount: 2,
  tileResolution: {
    width: 512,
    height: 512,
  },
};

export function TraceRenderer({ width, height, renderer }: RendererProps) {
  const theme = useTheme();
  const [{ specimen }] = useSpecimen();
  const [renderers] = useRenderers();
  const { result: map, loading } = useParsedMap();
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [instance, setInstance] = useState<Renderer>();
  useEffect(() => {
    setError("");
    if (ref.current && width && height && renderer && map) {
      const entry = find(renderers, (r) => r.renderer.meta.id === renderer);
      if (entry) {
        const instance = new entry.renderer.constructor();
        instance.setup({
          ...rendererOptions,
          backgroundColor: theme.palette.background.paper,
          accentColor: theme.palette.primary.main,
        });
        instance.add(map.nodes);
        ref.current.append(instance.getView()!);
        setInstance(instance);
        return () => {
          ref.current?.removeChild?.(instance.getView()!);
          instance.destroy();
          setInstance(undefined);
        };
      } else {
        setError(
          `No installed renderer has support for ${uniq(
            map.nodes.map((c) => `"${c.$}"`)
          ).join(", ")}`
        );
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

  return (
    <>
      {specimen ? (
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
            <Box sx={{ display: loading ? "none" : "block" }} ref={ref} />
            <Box
              sx={{
                display: loading ? "flex" : "none",
                width,
                height,
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              <CircularProgress sx={{ mb: 2 }} />
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
    </>
  );
}
