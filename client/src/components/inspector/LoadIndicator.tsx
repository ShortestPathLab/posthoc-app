import { useLoading } from "slices/loading";
import { Fade, LinearProgress } from "@material-ui/core";
import { some, values } from "lodash";

export function LoadIndicator() {
  const [loading] = useLoading();

  return (
    <Fade in={some(values(loading))}>
      <LinearProgress variant="indeterminate" sx={{ mb: -0.5, zIndex: 1 }} />
    </Fade>
  );
}
