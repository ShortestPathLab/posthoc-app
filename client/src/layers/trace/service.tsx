import { useTheme } from "@mui/material";
import { PlaybackService } from "components/app-bar/Playback";
import { useUntrustedLayers } from "components/inspector/useUntrustedLayers";
import { colorsHex } from "components/renderer/colors";
import { useTraceParser } from "components/renderer/parser-v140/parseTrace";
import { useTraceContent } from "hooks/useTraceContent";
import { mapValues } from "lodash-es";
import { nanoid } from "nanoid";
import { withProduce } from "produce";
import { useEffect } from "react";
import { useAsync } from "react-use";
import { BreakpointService } from "services/BreakpointService";
import { AccentColor, accentColors, getShade } from "theme";
import { set } from "utils/set";
import { Controller } from "./types";

export const service = withProduce(({ value, produce }) => {
  const { palette } = useTheme();
  const { result: trace, loading } = useTraceContent(value?.source?.trace);
  // Set playback
  useEffect(() => {
    produce(
      (l) =>
        void set(l, "source.playbackTo", trace?.content?.events?.length ?? 0)
    );
  }, [trace?.key]);
  const { isTrusted } = useUntrustedLayers();
  // Make the trace parser
  const parseTrace = useTraceParser(
    {
      trace: trace?.content,
      context: {
        theme: {
          foreground: palette.text.primary,
          background: palette.background.paper,
          accent: palette.primary.main,
        },
        color: {
          ...colorsHex,
          ...mapValues(accentColors, (_, v: AccentColor) =>
            getShade(v, palette.mode, 500, 400)
          ),
        },
        themeAccent: palette.primary.main,
        themeTextPrimary: palette.text.primary,
        themeBackground: palette.background.paper,
      },
      view: "main",
    },
    isTrusted,
    [trace?.key, palette.mode, isTrusted]
  );
  // Parse the trace
  useAsync(async () => {
    if (parseTrace && !loading) {
      const parsedTrace = await parseTrace();
      produce((l) => {
        set(l, "source.parsedTrace", parsedTrace);
        set(l, "viewKey", nanoid());
      });
    }
  }, [loading, parseTrace]);
  return (
    <>
      <PlaybackService value={value} />
      <BreakpointService value={value?.key} />
    </>
  );
}) satisfies Controller["service"];
