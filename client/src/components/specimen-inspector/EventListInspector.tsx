import { Flex } from "components/generic/Flex";
import { TraceEvent } from "protocol/Trace";
import { useEffect, useState } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import {
  LazyList as List,
  LazyListProps as ListProps,
} from "components/generic/LazyList";
import { EventInspector } from "./EventInspector";

const ROW_HEIGHT = 75.56;
const PADDING = 16;

export function EventListInspector(props: ListProps<TraceEvent>) {
  const [{ step = 0, playback }] = useUIState();
  const [specimen] = useSpecimen();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref) {
      ref.scrollTo({
        top: (ROW_HEIGHT + PADDING) * step,
        behavior: playback === "playing" ? "auto" : "smooth",
      });
    }
  }, [ref, step, playback]);

  return (
    <List
      {...props}
      itemHeight={ROW_HEIGHT}
      items={specimen?.eventList}
      listPadding={PADDING}
      listOptions={{ outerRef: setRef }}
      renderItem={(item, i, style) => (
        <Flex p={`${PADDING}px`} style={style}>
          <EventInspector
            sx={{ flex: 1, height: ROW_HEIGHT }}
            event={item}
            index={i}
            selected={i === step}
          />
        </Flex>
      )}
    />
  );
}
