import { Typography } from "@mui/material";
import { TracePicker } from "components/app-bar/Input";
import { Option } from "components/layer-editor/Option";
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
    </>
  );
}) satisfies Controller["editor"];
