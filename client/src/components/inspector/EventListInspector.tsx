import { CircularProgress, Stack } from "@mui/material";
import { SortOutlined as ListIcon } from "@mui/icons-material";
import { Flex } from "components/generic/Flex";
import {
  LazyList as List,
  LazyListHandle as ListHandle,
  LazyListProps as ListProps,
} from "components/generic/LazyList";
import { PlaceholderCard } from "components/generic/PlaceholderCard";
import { delay } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { useEffect, useRef } from "react";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { EventInspector } from "./EventInspector";

function Placeholder() {
  return (
    <Stack alignItems="center" p={4} color="text.secondary" textAlign="center">
      <p>
        <ListIcon />
      </p>
      <p>
        Select a source & destination node on the map to see the steps here.
      </p>
    </Stack>
  );
}

export function EventListInspector(props: ListProps<TraceEvent>) {
  const [loading] = useLoading();
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
    <Flex vertical alignItems="center">
      {loading.map || loading.specimen ? (
        <CircularProgress />
      ) : specimen?.eventList?.length ? (
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
      ) : (
        <Flex>
          <Placeholder />
        </Flex>
      )}
    </Flex>
  );
}
