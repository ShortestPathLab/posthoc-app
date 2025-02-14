import { TextField } from "@mui/material";
import { BreakpointFieldProps } from "../breakpoints/Breakpoint";

export const ReferenceInput = (props: BreakpointFieldProps<number>) => {
  return (
    <TextField
      disabled={props.disabled}
      variant="outlined"
      label="Reference"
      fullWidth
      sx={{
        minWidth: 160,
      }}
      defaultValue={`${props.value ?? 0}`}
      onChange={(v) => props.onChange?.(+v.target.value)}
      type="number"
      slotProps={{
        htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
      }}
    />
  );
};
