import { BlurOnTwoTone as DisabledIcon } from "@mui/icons-material";
import { Box, CircularProgress, useTheme } from "@mui/material";
import { RendererProps } from "components/renderer/Renderer";
import { useParsedMap } from "hooks/useParsedMap";
import { every, find, keyBy, uniq } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useRenderers } from "slices/renderers";

export function TraceRenderer({ width, height }: RendererProps) {
  const theme = useTheme();
  const [renderers] = useRenderers();
  const { result: map, loading } = useParsedMap();
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setError("");
    if (ref.current && width && height && map) {
      const entry = find(renderers, (r) => {
        const components = keyBy(r.renderer.meta.components);
        return every(map.nodes, (n) => n.$ in components);
      });
      if (entry) {
        const instance = new entry.renderer.constructor();
        instance.setup({
          accentColor: theme.palette.primary.main,
          tileSubdivision: 1,
          workerCount: 8,
          tileResolution: {
            width: 512,
            height: 512,
          },
          screenSize: {
            width,
            height,
          },
        });
        instance.add(map.nodes);
        ref.current.append(instance.getView()!);
        return () => {
          ref.current?.removeChild?.(instance.getView()!);
          instance.destroy();
        };
      } else {
        setError(
          `No installed renderer has support for ${uniq(
            map.nodes.map((c) => `"${c.$}"`)
          ).join(", ")}`
        );
      }
    }
  }, [ref.current, width, height, map, renderers, theme, setError]);

  return (
    <>
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
      )}
    </>
  );
}
