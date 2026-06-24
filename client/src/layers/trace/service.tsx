import { useTheme } from "@mui/material";
import { PlaybackService } from "components/app-bar/Playback";
import { useUntrustedLayers } from "components/inspector/useUntrustedLayers";
import { colorsHex } from "components/renderer/colors";
import { useTraceParser } from "components/renderer/parser-v140/parseTrace";
import { useTraceContent } from "hooks/useTraceContent";
import { mapValues } from "es-toolkit/compat";
import { nanoid } from "nanoid";
import { Trace } from "protocol/Trace-v140";
import { withProduce } from "produce";
import { useEffect, useMemo } from "react";
import { BreakpointService } from "services/BreakpointService";
import { AccentColor, accentColors, getShade } from "theme";
import { set } from "utils/set";
import { Controller } from "./types";
import { useTraceStream } from "./useTraceStream";

export const service = withProduce(({ value, produce }) => {
  const { palette } = useTheme();
  const { result: trace, loading } = useTraceContent(value?.source?.trace);
  // Set playback
  useEffect(() => {
    produce((l) => void set(l, "source.playbackTo", trace?.content?.events?.length ?? 0));
    // `produce` is recreated every render, so it's intentionally omitted to avoid
    // re-running on every render; this reacts to the trace and its event count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trace?.key, trace?.content?.events?.length]);
  const { isTrusted } = useUntrustedLayers();

  const context = useMemo(
    () => ({
      theme: {
        foreground: palette.text.primary,
        background: palette.background.paper,
        accent: palette.primary.main,
      },
      color: {
        ...colorsHex,
        ...mapValues(accentColors, (_, v: AccentColor) => getShade(v, palette.mode, 500, 400)),
      },
      themeAccent: palette.primary.main,
      themeTextPrimary: palette.text.primary,
      themeBackground: palette.background.paper,
    }),
    [palette],
  );

  // v1.4.0 trusted traces stream their components in incrementally; everything
  // else (legacy formats, untrusted layers) uses the one-shot path below.
  const streaming = trace?.content?.version === "1.4.0" && isTrusted;

  useTraceStream({
    enabled: streaming,
    traceKey: trace?.key,
    content: trace?.content as Trace,
    context,
    view: "main",
    step: value?.source?.step ?? 0,
    produce,
  });

  // One-shot parser (legacy / untrusted only). v1.4.0 trusted traces stream.
  const { data: parsedTrace } = useTraceParser({
    key: trace?.key,
    trace: trace?.content,
    context,
    view: "main",
    trusted: isTrusted,
    contextKey: palette.mode,
    enabled: !loading && !streaming,
  });
  useEffect(() => {
    if (parsedTrace) {
      produce((l) => {
        set(l, "source.parsedTrace", parsedTrace);
        set(l, "viewKey", nanoid());
      });
    }
    // `produce` is recreated each render, so it's intentionally omitted; this
    // reacts to a fresh parse result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedTrace]);
  return (
    <>
      <PlaybackService value={value} />
      <BreakpointService value={value?.key} />
    </>
  );
}) satisfies Controller["service"];
