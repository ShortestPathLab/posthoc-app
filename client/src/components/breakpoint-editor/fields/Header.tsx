import { Typography } from "@mui/material";
import { BreakpointFieldProps } from "../breakpoints/Breakpoint";

export const Header = (props: BreakpointFieldProps<string>) => {
  return (
    <Typography component="div" variant="overline" color="text.secondary">
      {props.value}
    </Typography>
  );
};
