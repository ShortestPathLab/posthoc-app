import { Box, BoxProps } from "@material-ui/core";
import { Lazy } from "components/Lazy";
import { map } from "lodash";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { EventInspector } from "./EventInspector";

const estimateHeight = 113.556;

export function EventListInspector(props: BoxProps) {
  const [{ step = 0 }] = useUIState();
  const [specimen] = useSpecimen();

  return (
    <Box p={2} overflow="auto" {...props}>
      <Lazy
        rowHeight={estimateHeight}
        items={specimen?.eventList}
        renderItem={(event, i) => (
          <Box p={2}>
            <EventInspector
              key={i}
              event={event}
              index={i}
              selected={i === step}
            />
          </Box>
        )}
      ></Lazy>
    </Box>
  );
}
