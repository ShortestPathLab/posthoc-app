import {
  FiberManualRecordOutlined,
  LayersOutlined as LayersIcon,
  SortOutlined as StepsIcon,
} from "@mui/icons-material";
import { Box, Divider, Typography, useTheme } from "@mui/material";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Playback, PlaybackLayerData } from "components/app-bar/Playback";
import { Flex } from "components/generic/Flex";
import {
  LazyList as List,
  LazyListHandle as ListHandle,
} from "components/generic/LazyList";
import { EventInspector, Skeleton } from "components/inspector/EventInspector";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex } from "components/renderer/colors";
import { useBreakpoints } from "hooks/useBreakpoints";
import { usePlaybackState } from "hooks/usePlaybackState";
import { inferLayerName } from "layers/inferLayerName";
import { getLayerHandler } from "layers/layerHandlers";
import {
  chain as _,
  defer,
  find,
  findIndex,
  map,
  reduce,
  startCase,
  throttle,
} from "lodash";
import { nanoid as id } from "nanoid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, useLayer } from "slices/layers";
import { usePaper } from "theme";
import { PageContentProps } from "./PageMeta";
const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

const pxToInt = (s: string) => Number(s.replace(/px$/, ""));

const SYMBOL_ALL = id();

const stepsLayerGuard = (l: Layer): l is Layer<PlaybackLayerData> =>
  !!getLayerHandler(l).steps;

type StepsPageState = {
  layer?: string;
  selectedType?: string;
};

function useStepsPageState(
  state?: StepsPageState,
  onChange?: (r: StepsPageState) => void
) {
  const {
    key,
    setKey: setLocalKey,
    layers,
    layer,
    allLayers,
  } = useLayer(state?.layer, stepsLayerGuard);

  const [selectedType, setLocalSelectedType] = useState(state?.selectedType);

  function setKey(k: string) {
    onChange?.({ layer: k });
    setLocalKey(k);
  }

  function setSelectedType(t: string) {
    onChange?.({ selectedType: t });
    setLocalSelectedType(t);
  }
  return {
    setSelectedType,
    setKey,
    selectedType,
    layers,
    allLayers,
    key,
    layer,
  };
}

export function StepsPage({ template: Page }: PageContentProps) {
  const { spacing } = useTheme();
  const paper = usePaper();
  const ref = useRef<ListHandle | null>(null);

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<StepsPageState>();

  const {
    allLayers,
    key,
    layers,
    selectedType: _selectedType,
    setKey,
    setSelectedType,
    layer,
  } = useStepsPageState(state, onChange);

  const { step, playing, stepTo } = usePlaybackState(key);

  const rawSteps = useMemo(() => {
    if (layer) {
      const { steps: getSteps } = getLayerHandler(layer)!;
      return getSteps!(layer);
    }
  }, [layer]);

  const { steps, types, stepToFilteredStep, selectedType } = useMemo(() => {
    if (rawSteps) {
      const steps = rawSteps.map((a, b) => [a, b] as const);
      const stepTypes = _(steps)
        .map(([e]) => e.type)
        .filter()
        .uniq()
        .value();
      const allSelected = !stepTypes.includes(_selectedType);
      const filtered = allSelected
        ? steps
        : steps.filter(([a]) => a.type === _selectedType);
      const { stepMap } = reduce(
        steps,
        (prev, [, i]) => {
          const j = findIndex(filtered, ([, j]) => j >= i, prev.from);
          const k = j === -1 ? filtered.length : j;
          prev.from = k;
          prev.stepMap.push(k);
          return prev;
        },
        { from: 0, stepMap: [] as number[] }
      );
      return {
        steps: filtered,
        types: stepTypes,
        stepToFilteredStep: (i: number) => stepMap[i],
        selectedType: allSelected ? SYMBOL_ALL : _selectedType,
      };
    }
    return {};
  }, [rawSteps, _selectedType]);

  const shouldBreak = useBreakpoints(key);

  const snapTo = useCallback(
    throttle((step: number) => {
      if (stepToFilteredStep) {
        ref?.current?.scrollToIndex?.({
          index: stepToFilteredStep(step),
          align: "start",
          behavior: "smooth",
          offset: -pxToInt(spacing(6 + 2)),
        });
      }
    }, 1000 / 30),
    [ref, stepToFilteredStep]
  );

  useEffect(() => {
    defer(() => snapTo(step));
  }, [snapTo, step]);

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Flex vertical alignItems="center">
          {steps ? (
            steps.length ? (
              <List
                sx={{
                  width: "100%",
                  height: "100%",
                }}
                items={steps}
                listOptions={{
                  ref,
                  defaultItemHeight: 80,
                  overscan: 0,
                }}
                renderItem={([event, eventIndex], i) =>
                  playing ? (
                    <Box
                      sx={{
                        pt: i ? 0 : spacing(6),
                      }}
                    >
                      <Skeleton event={event} />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: spacing(i ? 10 : 16),
                        pt: i ? 0 : spacing(6),
                      }}
                    >
                      <EventInspector
                        event={event}
                        index={eventIndex}
                        selected={eventIndex === step}
                        sx={{ height: "100%" }}
                        label={shouldBreak(eventIndex)?.result}
                        onClick={() => stepTo(eventIndex)}
                      />
                      <Divider variant="inset" />
                    </Box>
                  )
                }
              />
            ) : (
              <Placeholder
                icon={<StepsIcon />}
                label={`${inferLayerName(layer)} no steps`}
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
        {divider}
        <Typography
          component="div"
          variant="body2"
          color="text.secondary"
          sx={{
            px: 1,
            py: 0.25,
            textAlign: "center",
            ...paper(0),
            borderRadius: 1,
          }}
        >
          {step}
        </Typography>
        {divider}
        <FeaturePicker
          icon={
            <FiberManualRecordOutlined
              sx={{ color: getColorHex(selectedType) }}
            />
          }
          label="Event Type"
          value={selectedType}
          items={[
            { id: SYMBOL_ALL, name: "All Events" },
            ...map(types, (l) => ({
              id: `${l}`,
              name: startCase(l),
            })),
          ]}
          onChange={setSelectedType}
          showArrow
          ellipsis={12}
        />
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
