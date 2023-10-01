import { Fade, LinearProgress } from "@mui/material";
import { some, values } from "lodash";
import { useLoading } from "slices/loading";

export function LoadIndicator() {
  const [loading] = useLoading();

  return (
    <Fade in={some(values(loading))}>
      <LinearProgress variant="indeterminate" sx={{ mb: -0.5, zIndex: 1 }} />
    </Fade>
  );
}