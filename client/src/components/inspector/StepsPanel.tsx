import { Box, BoxProps, Fade } from "@mui/material";
import { useUIState } from "slices/UIState";
import { EventListInspector } from "./EventListInspector";

export function StepsPanel(props: BoxProps) {
  const [{ playback }] = useUIState();
  return (
    <Fade unmountOnExit mountOnEnter in={playback === "paused"}>
      <Box height="100%" width="100%" pl={1} {...props}>
        <EventListInspector height="100%" width="100%" />
      </Box>
    </Fade>
  );
}
