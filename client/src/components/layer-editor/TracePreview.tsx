import { Box } from "@mui/material";
import { ScriptViewer } from "components/script-editor/ScriptEditor";
import { dump } from "js-yaml";
import { take } from "lodash";
import { Trace } from "protocol";

export function TracePreview({
  trace,
  language = "yaml",
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
            ? dump(
                {
                  ...trace,
                  events: take(trace.events, 10),
                },
                { noCompatMode: true }
              )
            : "No data"
        }
      />
    </Box>
  );
}
