import { Box, BoxProps } from "@material-ui/core";
import { Lazy } from "components/Lazy";
import { map } from "lodash";
import { useEffect, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { EventInspector } from "./EventInspector";

const estimateHeight = 113.556;

export function EventListInspector(props: BoxProps) {
  const [{ step = 0, playback }, setUIState] = useUIState();
  const [specimen] = useSpecimen();
  const [followEl, setFollowEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (followEl && playback === "playing") {
      followEl.scrollIntoView({ block: "start" });
    }
  }, [followEl, playback]);

  return (
    <Box p={2} overflow="auto" {...props}>
      <Lazy rowHeight={estimateHeight}>
        {map(specimen?.eventList, (event, i) => (
          <Box p={2}>
            <EventInspector
              key={i}
              cardRef={i === step ? setFollowEl : undefined}
              event={event}
              index={i}
              selected={i === step}
            />
          </Box>
        ))}
      </Lazy>
    </Box>
  );
}
