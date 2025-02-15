import { Box, Typography } from "@mui/material";
import { TracePicker } from "components/app-bar/Input";
import { Heading, Option } from "components/layer-editor/Option";
import { TracePreview } from "components/layer-editor/TracePreview";
import { withProduce } from "produce";
import { set } from "utils/set";
import { Controller } from "./types";

export const editor = withProduce(({ value, produce }) => {
  return (
    <>
      <Option
        label="Trace"
        content={
          <TracePicker
            onChange={(v) => produce((d) => set(d, "source.trace", v))}
            value={value?.source?.trace}
          />
        }
      />
      {value?.source?.trace?.error && (
        <Typography
          component="div"
          variant="body2"
          color="error"
          sx={{
            whiteSpace: "pre-wrap",
            mb: 1,
            mt: 1,
          }}
        >
          <code>{value?.source?.trace?.error}</code>
        </Typography>
      )}
      {value?.source?.parsedTrace?.error && (
        <Typography
          component="div"
          variant="body2"
          color="error"
          sx={{
            whiteSpace: "pre-wrap",
            mb: 1,
            mt: 1,
          }}
        >
          <code>{value?.source?.parsedTrace?.error}</code>
        </Typography>
      )}
      <Heading label="Preview" />
      <Box sx={{ height: 240, mx: -2 }}>
        <TracePreview trace={value?.source?.parsedTrace?.content} />
      </Box>
    </>
  );
}) satisfies Controller["editor"];
