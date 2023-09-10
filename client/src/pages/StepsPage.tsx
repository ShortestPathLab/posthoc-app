import {
  LayersTwoTone as LayersIcon,
  SortTwoTone as StepsIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography as Type,
  useTheme,
} from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Playback } from "components/app-bar/Playback";
import { Flex } from "components/generic/Flex";
import {
  LazyList as List,
  LazyListHandle as ListHandle,
} from "components/generic/LazyList";
import { EventInspector, Skeleton } from "components/inspector/EventInspector";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import {
  inferLayerName,
  layerHandlers,
} from "components/layer-editor/layers/LayerSource";
import { delay, find, head, map } from "lodash";
import { Page } from "pages/Page";
import { TraceEvent } from "protocol";
import {
  cloneElement,
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUIState } from "slices/UIState";
import { useLoading } from "slices/loading";
import { usePlayback } from "slices/playback";

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

const pxToInt = (s: string) => Number(s.replace(/px$/, ""));

export function StepsPage() {
  const { spacing } = useTheme();
  const { controls, onChange, state } = useViewTreeContext();
  const [loading] = useLoading();
  const [{ step = 0, playback }, setPlayback] = usePlayback();
  const [{ layers }] = useUIState();
  const ref = useRef<ListHandle | null>(null);

  const [key, setKey] = useState(head(layers)?.key);
  const layer = find(layers, { key });

  const steps = useMemo(() => {
    if (layer) {
      return createElement(layerHandlers[layer?.source?.type ?? ""]?.steps!, {
        layer,
      });
    }
  }, [layer]);

  useEffect(() => {
    if (playback === "paused") {
      delay(
        () =>
          ref?.current?.scrollToIndex?.({
            index: step,
            align: "start",
            behavior: "smooth",
            offset: -pxToInt(spacing(6 + 2)),
          }),
        150
      );
    }
  }, [step, playback, spacing]);

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Content>
        <Flex vertical alignItems="center">
          {steps ? (
            playback !== "playing" ? (
              cloneElement(steps, {
                children: (steps: TraceEvent[]) =>
                  layer ? (
                    steps.length ? (
                      <List
                        sx={{
                          width: "100%",
                          height: "100%",
                        }}
                        items={steps}
                        listOptions={{ ref, defaultItemHeight: 80 }}
                        placeholder={<Skeleton />}
                        renderItem={(item, i) => (
                          <Box
                            sx={{
                              height: spacing(i ? 10 : 16),
                              pt: i ? 0 : spacing(6),
                            }}
                          >
                            <EventInspector
                              event={item}
                              index={i}
                              selected={i === step}
                              sx={{ height: "100%" }}
                            />
                            <Divider variant="inset" />
                          </Box>
                        )}
                      />
                    ) : (
                      <Placeholder
                        icon={<StepsIcon />}
                        label={`${inferLayerName(
                          layer
                        )} has no steps to display`}
                      />
                    )
                  ) : (
                    <Placeholder icon={<StepsIcon />} label="Steps" />
                  ),
              })
            ) : (
              <Placeholder
                icon={<CircularProgress />}
                label={
                  <>
                    <Type>Running</Type>
                    <Button onClick={() => setPlayback({ playback: "paused" })}>
                      Pause
                    </Button>
                  </>
                }
              />
            )
          ) : (
            <Placeholder icon={<StepsIcon />} label="Steps" />
          )}
        </Flex>
      </Page.Content>
      <Page.Options>
        <FeaturePicker
          icon={<LayersIcon />}
          label="Layer"
          value={key}
          items={map(layers, (l) => ({
            id: l.key,
            name: inferLayerName(l),
          }))}
          onChange={setKey}
          showArrow
        />
        {divider}
        <Playback layer={layer} />
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
