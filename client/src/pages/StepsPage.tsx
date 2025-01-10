import {
  FiberManualRecordOutlined,
  LayersOutlined as LayersIcon,
  SegmentOutlined,
} from "@mui-symbols-material/w400";
import {
  Box,
  Divider,
  Stack,
  Switch,
  SxProps,
  Theme,
  useTheme,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { FeaturePickerButton } from "components/app-bar/FeaturePickerButton";
import { Playback, PlaybackLayerData } from "components/app-bar/Playback";
import { Flex } from "components/generic/Flex";
import {
  LazyList as List,
  LazyListHandle as ListHandle,
} from "components/generic/LazyList";
import { EventInspector, Skeleton } from "components/inspector/EventInspector";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex, tint } from "components/renderer/colors";
import { useBreakpoints } from "hooks/useBreakpoints";
import { flattenSubtree, HighlightLayerData } from "hooks/useHighlight";
import { usePlaybackState } from "hooks/usePlaybackState";
import { inferLayerName } from "layers/inferLayerName";
import { getController } from "layers/layerControllers";
import {
  chain as _,
  clamp,
  find,
  findIndex,
  isEmpty,
  isUndefined,
  map,
  reduce,
  startCase,
} from "lodash";
import { nanoid as id } from "nanoid";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, useLayer } from "slices/layers";
import { useAcrylic, usePaper } from "theme";
import { PageContentProps } from "./PageMeta";

function lerp(start: number, end: number, amount: number): number {
  return start + clamp(amount, 0, 1) * (end - start);
}

const ITEM_HEIGHT = 80;

const PADDING_TOP = 8;

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

const pxToInt = (s: string) => Number(s.replace(/px$/, ""));

const SYMBOL_ALL = id();

const stepsLayerGuard = (
  l: Layer
): l is Layer<PlaybackLayerData & HighlightLayerData> =>
  !!getController(l).steps;

type StepsPageState = {
  layer?: string;
  selectedType?: string;
  showHighlighting?: boolean;
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

  const [showHighlighting, setLocalShowHighlighting] = useState(
    state?.showHighlighting
  );

  function setKey(k: string) {
    onChange?.({ layer: k });
    setLocalKey(k);
  }

  function setSelectedType(t: string) {
    onChange?.({ selectedType: t });
    setLocalSelectedType(t);
  }

  function setShowHighlighting(
    event: React.ChangeEvent<HTMLInputElement>,
    t: boolean
  ) {
    onChange?.({ showHighlighting: t });
    setLocalShowHighlighting(t);
  }

  function setExitShowHighlighting(t: boolean) {
    onChange?.({ showHighlighting: t });
    setLocalShowHighlighting(t);
  }
  return {
    setSelectedType,
    setKey,
    selectedType,
    showHighlighting,
    setShowHighlighting,
    setExitShowHighlighting,
    layers,
    allLayers,
    key,
    layer,
  };
}

const getStepsPageDescription = (s?: string) =>
  s
    ? `${s} contains 0 steps.`
    : "When you load a trace, you'll see its steps here.";

export function StepsPage({ template: Page }: PageContentProps) {
  const { spacing } = useTheme();
  const paper = usePaper();
  const acrylic = useAcrylic();
  const ref = useRef<ListHandle | null>(null);
  const [scrollerRef, setScrollerRef] = useState<HTMLElement | Window | null>(
    null
  );

  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<StepsPageState>();

  const {
    allLayers,
    key,
    layers,
    selectedType: _selectedType,
    setKey,
    setSelectedType,
    showHighlighting,
    setShowHighlighting,
    setExitShowHighlighting,
    layer,
  } = useStepsPageState(state, onChange);

  const { step, playing, stepTo } = usePlaybackState(key);

  const rawSteps = useMemo(() => {
    if (layer) {
      const { steps: getSteps } = getController(layer)!;
      return getSteps!(layer);
    }
  }, [layer]);

  const { steps, types, stepToFilteredStep, selectedType } = useMemo(() => {
    if (rawSteps) {
      let steps = rawSteps.map((a, b) => [a, b] as const);
      const stepTypes = _(steps)
        .map(([e]) => e.type)
        .filter()
        .uniq()
        .value();
      const allSelected = !stepTypes.includes(_selectedType);

      if (!isEmpty(layer?.source?.highlighting) && showHighlighting) {
        const highlightData = layer?.source?.highlighting;
        let highlightStepsRaw: number[] = [];
        if (
          (highlightData?.type === "subtree" ||
            highlightData?.type === "precedent") &&
          !Array.isArray(highlightData.path)
        ) {
          highlightStepsRaw = flattenSubtree(highlightData.path);
        } else if (
          highlightData?.type === "backtracking" &&
          Array.isArray(highlightData.path)
        ) {
          highlightStepsRaw = highlightData.path;
        }
        steps = highlightStepsRaw.map((index) => steps[index]);
      } else if (isEmpty(layer?.source?.highlighting) && showHighlighting) {
        setExitShowHighlighting(false);
      }

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
  }, [rawSteps, _selectedType, layer?.source?.highlighting, showHighlighting]);

  const shouldBreak = useBreakpoints(key);

  useEffect(() => {
    if (stepToFilteredStep && scrollerRef && ref.current) {
      const i = stepToFilteredStep(step!);
      if (playing) {
        let cancelled = false;
        const f = (timestamp: DOMHighResTimeStamp) => {
          if (!cancelled && "scrollTop" in scrollerRef && !isUndefined(step)) {
            const { scrollTop } = scrollerRef;
            const offset = i * ITEM_HEIGHT;
            ref.current?.scrollTo({
              top: lerp(scrollTop, offset, 0.000001 * timestamp),
            });
            requestAnimationFrame(f);
          }
        };
        requestAnimationFrame(f);
        return () => {
          cancelled = true;
        };
      } else {
        ref.current.scrollToIndex({
          index: i,
          behavior: "smooth",
          offset: -pxToInt(spacing(12 + PADDING_TOP)),
        });
      }
    }
  }, [step, ref, scrollerRef, stepToFilteredStep, playing]);

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Title>Steps</Page.Title>
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
                  scrollerRef: setScrollerRef,
                  ref,
                  defaultItemHeight: ITEM_HEIGHT,
                  overscan: 0,
                }}
                renderItem={([event, eventIndex], i) =>
                  playing ? (
                    <Box
                      key={i}
                      sx={{
                        pt: i ? 0 : spacing(6 + PADDING_TOP),
                      }}
                    >
                      <Skeleton event={event} />
                    </Box>
                  ) : (
                    <Box
                      key={i}
                      sx={{
                        height:
                          pxToInt(spacing(i ? 0 : 6 + PADDING_TOP)) +
                          ITEM_HEIGHT,
                        pt: i ? 0 : spacing(6 + PADDING_TOP),
                      }}
                    >
                      <EventInspector
                        event={event}
                        index={eventIndex}
                        selected={eventIndex === step}
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
                icon={<SegmentOutlined />}
                label="Events"
                secondary={getStepsPageDescription(inferLayerName(layer))}
              />
            )
          ) : (
            <Placeholder
              icon={<SegmentOutlined />}
              label="Events"
              secondary={getStepsPageDescription()}
            />
          )}
        </Flex>
        {!!steps?.length && (
          <Stack
            direction="row"
            sx={
              {
                ...paper(1),
                ...acrylic,
                alignItems: "center",
                position: "absolute",
                top: (t) => t.spacing(6),
                height: (t) => t.spacing(6),
                borderRadius: 1,
                px: 1,
                m: 1,
              } as SxProps<Theme>
            }
          >
            <Playback layer={layer} />
          </Stack>
        )}
      </Page.Content>
      <Page.Options>
        <FeaturePicker
          icon={<LayersIcon />}
          label="Layer"
          value={key}
          items={map(allLayers, (l) => ({
            id: l.key,
            hidden: !find(layers, { key: l.key }),
            name: inferLayerName(l),
          }))}
          onChange={setKey}
          arrow
          ellipsis={12}
        />
        {divider}
        <FeaturePicker
          icon={
            <FiberManualRecordOutlined
              sx={{
                color:
                  selectedType === SYMBOL_ALL || !selectedType
                    ? grey[tint]
                    : getColorHex(selectedType),
              }}
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
          arrow
          ellipsis={12}
        />
        {divider}

        <FeaturePickerButton children="Show Highlighting" />
        <Switch
          checked={showHighlighting}
          onChange={setShowHighlighting}
          disabled={isEmpty(layer?.source?.highlighting)}
        />
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}
