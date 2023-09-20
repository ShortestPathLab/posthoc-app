import { map } from "lodash";
import { useMemo } from "react";
import {
  CompiledComponent,
  EventContext,
  ParsedComponent,
  Trace,
  TraceEvent,
} from "protocol";
import { parse } from "components/renderer/parser";
import { mapProperties } from "components/renderer/parser/mapProperties";
import { colors, useTheme } from "@mui/material";
import { colorsHex } from "components/renderer/colors";

export const context: EventContext = {
  color: colorsHex,
};

export function useTraceContent(trace?: Trace, view: "main" = "main") {
  const theme = useTheme();
  return useMemo(() => {
    const parsed = parse(
      trace?.render?.views?.[view]?.components ?? [],
      trace?.render?.components ?? {}
    );
    return {
      events: trace?.events ?? [],
      apply: (event: TraceEvent, ctx?: EventContext) =>
        map(parsed, (p) =>
          mapProperties<
            ParsedComponent<string, any>,
            CompiledComponent<string, {}>
          >(p, (c) =>
            c({
              fill: theme.palette.primary.main,
              alpha: 1,
              ...context,
              ...ctx,
              ...event,
            })
          )
        ),
    };
  }, [trace, view, theme]);
}
