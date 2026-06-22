import { Box, BoxProps } from "@mui/material";

export function Space({ sx, ...props }: BoxProps) {
  return (
    <Box
      sx={[{ px: 0.5, display: "inline-block" }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...props}
    />
  );
}
