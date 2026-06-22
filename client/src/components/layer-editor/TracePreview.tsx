import { Box } from "@mui/material";
import { ScriptViewer } from "components/script-editor/ScriptEditor";
import { dump } from "js-yaml";
import { take } from "es-toolkit/compat";
import { Trace } from "protocol";

export function TracePreview({
  trace,
  language: languageProp,
}: {
  trace?: Trace;
  language?: string;
}) {
  // Default moved out of destructure to avoid React Compiler bailout.
  const language = languageProp ?? "yaml";
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <ScriptViewer
        options={{ readOnly: true }}
        language={language}
        value={
          trace
            ? dump({
                ...trace,
                events: take(trace.events, 10),
              })
            : "No data"
        }
      />
    </Box>
  );
}
