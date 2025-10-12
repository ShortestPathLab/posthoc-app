import { CircularProgress, Typography } from "@mui/material";
import { ReactNode } from "react";
import { Block } from "./Block";

export function Spinner({ message }: { message?: ReactNode }) {
  return (
    <Block
      sx={{
        flexDirection: "column",
        gap: 4,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
      <Typography
        component="div"
        variant="body2"
        sx={{
          px: 8,
          maxWidth: 480,
        }}
      >
        {message}
      </Typography>
    </Block>
  );
}
