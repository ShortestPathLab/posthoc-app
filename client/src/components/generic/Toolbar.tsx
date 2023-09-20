import { Card, Stack } from "@mui/material";
import { ReactNode } from "react";
import { useAcrylic } from "theme";

export function Toolbar({ children }: { children?: ReactNode }) {
  const acrylic = useAcrylic();
  return (
    <Card
      sx={{
        m: 3,
        px: 1.25,
        height: 56,
        display: "flex",
        alignItems: "center",
        pointerEvents: "all",
        ...acrylic,
      }}
    >
      <Stack spacing={1.25} direction="row">
        {children}
      </Stack>
    </Card>
  );
}
