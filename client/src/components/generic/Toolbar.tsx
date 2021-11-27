import { Card, Stack } from "@material-ui/core";
import { ReactNode } from "react";
import { acrylic } from "theme";

export function Toolbar({ children }: { children?: ReactNode }) {
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
