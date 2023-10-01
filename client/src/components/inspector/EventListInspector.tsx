import { SortOutlined as ListIcon } from "@mui/icons-material";
import { delay, map } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { cloneElement, createElement, useEffect, useRef } from "react";
import { EventInspector } from "./EventInspector";
import { Flex } from "components/generic/Flex";
import { layerHandlers } from "components/layer-editor/layers/LayerSource";
import { useLoading } from "slices/loading";
import { usePlayback } from "slices/playback";
import { useUIState } from "slices/UIState";
import {
  CircularProgress,
  Divider,
  ListItem,
  ListItemText,
  Stack,
  useTheme,
} from "@mui/material";

import {
  LazyList as List,
  LazyListHandle as ListHandle,
  LazyListProps as ListProps,
} from "components/generic/LazyList";

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
  const { spacing } = useTheme();
  const [{ step = 0, playback }] = usePlayback();
  const [{ layers }] = useUIState();
  const ref = useRef<ListHandle | null>(null);

  const steps = map(layers, (l) =>
    createElement(layerHandlers[l.source?.type ?? ""]?.steps!, { layer: l })
  );

  useEffect(() => {
    if ([undefined, "paused"].includes(playback)) {
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
      ) : (
        map(steps, (s) =>
          cloneElement(s, {
            children: (steps: TraceEvent[]) => (
              <List
                {...props}
                items={steps}
                listOptions={{ ref, fixedItemHeight: 80 }}
                placeholder={
                  <EventInspector
                    event={{ id: 0 }}
                    index={0}
                    selected={false}
                    sx={{ height: 80 }}
                  >
                    <Divider variant="inset" />
                  </EventInspector>
                }
                renderItem={(item, i) => (
                  <>
                    <EventInspector
                      event={item}
                      index={i}
                      selected={i === step}
                      sx={{ height: 80 }}
                    >
                      <Divider variant="inset" />
                    </EventInspector>
                  </>
                )}
              />
            ),
          })
        )
      )}
    </Flex>
  );
}
