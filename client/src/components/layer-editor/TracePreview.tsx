import { Box } from "@mui/material";
import { ScriptViewer } from "components/script-editor/ScriptEditor";
import beautify from "json-beautify";
import { take } from "lodash";
import { Trace } from "protocol";

export function TracePreview({
  trace,
  language = "json",
}: {
  trace?: Trace;
  language?: string;
}) {
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <ScriptViewer
        options={{ readOnly: true }}
        language={language}
        value={
          trace
            ? beautify(
                {
                  ...trace,
                  events: take(trace.events, 10),
                },
                null as any,
                2,
                1
              )
            : "No data"
        }
      />
    </Box>
  );
}
