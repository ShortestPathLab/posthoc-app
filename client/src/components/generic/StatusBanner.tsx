import { alpha, CircularProgress, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useAcrylic } from "theme";

export type StatusBannerColor = "info" | "warning";

/**
 * Small acrylic status pill shown over a viewport. Generalised from the focused-
 * view bar in `pages/tree/TreeGraph.tsx`. Used to signal background work:
 * `info` (blue) = loading but what's shown is correct, `warning` (orange) = a
 * partial preview is being shown while generation catches up.
 */
export function StatusBanner({
  color = "info",
  label,
  busy = true,
}: {
  color?: StatusBannerColor;
  label: ReactNode;
  busy?: boolean;
}) {
  const acrylic = useAcrylic();
  return (
    <Stack
      direction="row"
      sx={{
        ...acrylic,
        position: "absolute",
        zIndex: 5,
        top: (t) => t.spacing(6 + 1),
        right: t => t.spacing(1),

        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        height: (t) => t.spacing(5),
        borderRadius: 1,
        pointerEvents: "none",
        bgcolor: (t) => alpha(t.palette[color].main, 0.15),
        border: (t) => `1px solid ${alpha(t.palette[color].main, 0.2)}`,
        transition: (t) => t.transitions.create(["background-color", "border-color"]),
      }}
    >
      {busy && <CircularProgress size={16} color={color} />}
      <Typography variant="body2" sx={{ lineHeight: 1 }}>
        {label}
      </Typography>

    </Stack>
  );
}
