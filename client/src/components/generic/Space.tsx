import { Box, BoxProps } from "@mui/material";

export function Space(props: BoxProps) {
  return <Box px={0.5} display="inline-block" {...props} />;
}