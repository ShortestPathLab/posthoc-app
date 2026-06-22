import { Box, BoxProps } from "@mui/material";

export type BlockProps = {
  vertical?: boolean;
} & BoxProps;

export const Block = ({ vertical, sx, ...props }: BlockProps) => (
  <Box
    sx={[
      {
        position: "relative",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: vertical ? "column" : "row",
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...props}
  />
);
