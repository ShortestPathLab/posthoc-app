import { SortOutlined as ListIcon } from "@mui/icons-material";
import { CircularProgress, Divider, Stack } from "@mui/material";
import { Flex } from "components/generic/Flex";
import {
  LazyList as List,
  LazyListHandle as ListHandle,
  LazyListProps as ListProps,
} from "components/generic/LazyList";
import { layerHandlers } from "components/layer-editor/layers/LayerSource";
import { delay, map } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { cloneElement, createElement, useEffect, useRef } from "react";
import { useUIState } from "slices/UIState";
import { useLoading } from "slices/loading";
import { usePlayback } from "slices/playback";
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
  const [{ step = 0, playback }] = usePlayback();
  const [{ layers }] = useUIState();
  const ref = useRef<ListHandle | null>(null);

  const steps = map(layers, (l) =>
    createElement(layerHandlers[l.source?.type ?? ""]?.steps!, { layer: l })
  );

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
      ) : (
        map(steps, (s) =>
          cloneElement(s, {
            children: (steps: TraceEvent[]) => (
              <List
                {...props}
                items={steps}
                listOptions={{ ref }}
                renderItem={(item, i) => (
                  <>
                    <EventInspector
                      event={item}
                      index={i}
                      selected={i === step}
                    />
                    <Divider variant="inset" />
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
