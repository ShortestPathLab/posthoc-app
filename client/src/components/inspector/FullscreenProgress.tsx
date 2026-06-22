import { Backdrop, CircularProgress, Stack, Typography as Type } from "@mui/material";
import { values } from "es-toolkit/compat";
import { useBusy } from "slices/busy";
import { useAcrylic } from "theme";

export function FullscreenProgress() {
  const [busy] = useBusy();
  const acrylic = useAcrylic();

  const messages = values(busy);
  return (
    <Backdrop
      sx={{
        ...acrylic,
        zIndex: (t) => t.zIndex.tooltip + 1,
        WebkitAppRegion: "drag",
      }}
      open={!!messages.length}
    >
      <Stack spacing={4} sx={{ alignItems: "center" }}>
        <CircularProgress />
        {messages.map((v, message) => (
          <Type component="div" key={message} variant="body2" color="textSecondary">
            {v}
          </Type>
        ))}
      </Stack>
    </Backdrop>
  );
}
