import { Fade } from "@material-ui/core";
import { Box } from "@material-ui/system";
import { Flex } from "components/generic/Flex";
import {
  LazyList as List,
  LazyListHandle as ListHandle,
  LazyListProps as ListProps,
} from "components/generic/LazyList";
import { delay } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { useEffect, useRef } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { EventInspector } from "./EventInspector";

export function EventListInspector(props: ListProps<TraceEvent>) {
  const [{ step = 0, playback }] = useUIState();
  const [{ specimen }] = useSpecimen();
  const ref = useRef<ListHandle | null>(null);

  useEffect(() => {
    if (playback === "paused") {
      delay(
        () =>
          ref?.current?.scrollToIndex?.({
            index: step,
            align: "start",
            behavior: "smooth",
            offset: -16,
          }),
        150
      );
    }
  }, [step, playback]);

  return (
    <Fade unmountOnExit mountOnEnter in={playback === "paused"}>
      <Box>
        <List
          {...props}
          items={specimen?.eventList}
          listOptions={{ ref }}
          renderItem={(item, i) => (
            <Flex p={2} pt={i ? 0 : 2}>
              <EventInspector
                sx={{ flex: 1 }}
                event={item}
                index={i}
                selected={i === step}
              />
            </Flex>
          )}
        />
      </Box>
    </Fade>
  );
}
