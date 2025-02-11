import {
  FiberManualRecordOutlined,
  SegmentOutlined,
} from "@mui-symbols-material/w400";
import { Box, Divider, Stack, SxProps, Theme, useTheme } from "@mui/material";
import { grey } from "@mui/material/colors";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { Playback, PlaybackLayerData } from "components/app-bar/Playback";
import { Block } from "components/generic/Block";
import { LayerPicker } from "components/generic/LayerPicker";
import {
  LazyList as List,
  LazyListHandle as ListHandle,
  WhenIdle,
} from "components/generic/LazyList";
import { useSurfaceAvailableCssSize } from "components/generic/surface/useSurfaceSize";
import { EventInspector, Skeleton } from "components/inspector/EventInspector";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex, tint } from "components/renderer/colors";
import { useEffectWhen } from "hooks/useEffectWhen";
import { flattenSubtree, HighlightLayerData } from "hooks/useHighlight";
import { computed, usePlaybackControls } from "hooks/usePlaybackState";
import { Steps } from "layers";
import { inferLayerName } from "layers/inferLayerName";
import { getController } from "layers/layerControllers";
import {
  chain as _,
  clamp,
  findIndex,
  isEqual,
  isUndefined,
  map,
  reduce,
  sortBy,
  startCase,
} from "lodash";
import { nanoid as id } from "nanoid";
import { useEffect, useMemo, useRef, useState } from "react";
import { slice } from "slices";
import { Layer, useLayerPicker, WithLayer } from "slices/layers";
import { equal } from "slices/selector";
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
const SYMBOL_HIGHLIGHTED = id();

export const isStepsLayer = (l: Layer<unknown>): l is StepsLayer =>
  !!getController(l).steps;

type StepsLayer = Layer<PlaybackLayerData & HighlightLayerData>;

type StepsPageState = {
  layer?: string;
  selectedType?: string;
  showHighlighting?: boolean;
};

function useStepsPageState(
  state?: StepsPageState,
  onChange?: (r: StepsPageState) => void
) {
  "use no memo";

  const { key, setKey: setLocalKey } = useLayerPicker(isStepsLayer);
  useEffect(() => setLocalKey(state?.layer), [state?.layer]);

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
    key,
  };
}

const getStepsPageDescription = (s?: string) =>
  s
    ? `${s} contains 0 steps.`
    : "When you load a trace, you'll see its steps here.";

export function StepsPage({ template: Page }: PageContentProps) {
  const { controls, onChange, state, dragHandle } =
    useViewTreeContext<StepsPageState>();

  const size = useSurfaceAvailableCssSize();

  const {
    key,
    selectedType: _selectedType,
    setSelectedType,
    setKey,
  } = useStepsPageState(state, onChange);

  const one = slice.layers.one<StepsLayer>(key);
  const { steps } =
    one.use<Steps | undefined>(
      (c) => getController(c)?.steps?.(c),
      equal("key")
    ) ?? {};

  // TODO: low performance `isEqual`
  const highlighting = one.use((c) => c?.source?.highlighting, isEqual);

  const { types, selectedType, isHighlighting } = useMemo(() => {
    if (steps) {
      const stepTypes = _(steps.map((a, b) => [a, b] as const))
        .map(([e]) => e.type)
        .filter()
        .uniq()
        .value();

      const allSelected = !stepTypes.includes(_selectedType);
      const showHighlighting = _selectedType === SYMBOL_HIGHLIGHTED;

      return {
        types: stepTypes,
        selectedType: showHighlighting
          ? SYMBOL_HIGHLIGHTED
          : allSelected
          ? SYMBOL_ALL
          : _selectedType,
        isHighlighting: !isUndefined(highlighting?.path),
      };
    }
    return {};
  }, [steps, _selectedType, highlighting?.path]);

  useEffectWhen(
    () => {
      setSelectedType(isHighlighting ? SYMBOL_HIGHLIGHTED : SYMBOL_ALL);
    },
    [isHighlighting, setSelectedType],
    [isHighlighting]
  );

  return (
    <Page onChange={onChange} stack={state}>
      <Page.Title>Steps</Page.Title>
      <Page.Handle>{dragHandle}</Page.Handle>
      <Page.Content>
        <Box sx={size}>
          <PageContent layer={key} />
        </Box>
      </Page.Content>
      <Page.Options>
        <LayerPicker value={key} onChange={setKey} guard={isStepsLayer} />
        {divider}
        <FeaturePicker
          icon={
            <FiberManualRecordOutlined
              sx={{
                color:
                  selectedType === SYMBOL_ALL ||
                  selectedType === SYMBOL_HIGHLIGHTED ||
                  !selectedType
                    ? grey[tint]
                    : getColorHex(selectedType),
              }}
            />
          }
          label="Filter Events"
          value={selectedType}
          items={[
            { id: SYMBOL_ALL, name: "All Events" },
            {
              id: SYMBOL_HIGHLIGHTED,
              name: "Focused Events",
              description: isHighlighting
                ? `${startCase(highlighting?.type)}, ${startCase(
                    steps?.[highlighting?.step ?? 0]?.type
                  )} ${steps?.[highlighting?.step ?? 0]?.id}, Step ${
                    highlighting?.step
                  }`
                : undefined,
              hidden: !isHighlighting,
            },
            ...map(types, (l) => ({
              id: `${l}`,
              name: `Type: ${startCase(l)}`,
            })),
          ]}
          onChange={setSelectedType}
          arrow
          ellipsis={12}
        />
      </Page.Options>
      <Page.Extras>{controls}</Page.Extras>
    </Page>
  );
}

function PageContent({ layer: key }: { layer?: string }) {
  const { spacing } = useTheme();
  const paper = usePaper();
  const acrylic = useAcrylic();
  const ref = useRef<ListHandle | null>(null);
  const [scrollerRef, setScrollerRef] = useState<HTMLElement | Window | null>(
    null
  );

  const {
    isViewTree,
    state: { selectedType: _selectedType, showHighlighting } = {},
  } = useViewTreeContext<StepsPageState>();

  const one = slice.layers.one<StepsLayer>(key);

  const step = one.use(computed("step"));
  const playing = one.use(computed("playing"));

  const { steps: rawSteps } =
    one.use<Steps | undefined>(
      (c) => getController(c)?.steps?.(c),
      equal("key")
    ) ?? {};

  // TODO: low performance `isEqual`
  const highlighting = one.use((c) => c?.source?.highlighting, isEqual);
  const isHighlighting = _selectedType === SYMBOL_HIGHLIGHTED;

  const { steps, stepToFilteredStep, isDisabled } = useMemo(() => {
    if (rawSteps) {
      const steps = rawSteps.map((a, b) => [a, b] as const);
      const stepTypes = _(steps)
        .map(([e]) => e.type)
        .filter()
        .uniq()
        .value();

      const allSelected = !stepTypes.includes(_selectedType);

      const path = highlighting?.path;

      const highlighted = path
        ? path instanceof Array
          ? path
          : flattenSubtree(path)
        : [];

      const highlightedSet = new Set(highlighted);

      const filtered = sortBy(
        showHighlighting
          ? steps.filter(([, step]) => highlightedSet.has(step))
          : allSelected
          ? steps
          : steps.filter(([a]) => a.type === _selectedType),
        ([, step]) => step
      );

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
        stepToFilteredStep: (i: number) => stepMap[i],
        isDisabled: (i: number) =>
          isHighlighting ? !highlightedSet.has(i) : false,
      };
    }
    return {};
  }, [rawSteps, _selectedType, highlighting, showHighlighting]);

  useEffect(() => {
    if (stepToFilteredStep && scrollerRef && ref.current) {
      const i = stepToFilteredStep(step!);
      if (playing) {
        let cancelled = false;
        const f = (timestamp: DOMHighResTimeStamp) => {
          if (cancelled || !("scrollTop" in scrollerRef) || isUndefined(step))
            return;
          const { scrollTop } = scrollerRef;
          const offset = i * ITEM_HEIGHT;
          ref.current?.scrollTo?.({
            top: lerp(scrollTop, offset, 0.000001 * timestamp),
          });
          requestAnimationFrame(f);
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
    <>
      <Block vertical alignItems="center">
        {steps ? (
          steps.length ? (
            <List
              sx={{ width: "100%", height: "100%" }}
              listOptions={{
                scrollerRef: setScrollerRef,
                ref,
                defaultItemHeight: ITEM_HEIGHT,
                overscan: 0,
                totalCount: steps.length,
                itemContent: (i) => (
                  <Item
                    disabled={isDisabled(i)}
                    key={i}
                    index={i}
                    layer={key}
                  />
                ),
              }}
            />
          ) : (
            <Placeholder
              icon={<SegmentOutlined />}
              label="Events"
              secondary={
                <WithLayer key={key}>
                  {(l) => getStepsPageDescription(inferLayerName(l))}
                </WithLayer>
              }
            />
          )
        ) : (
          <Placeholder
            icon={<SegmentOutlined />}
            label="Events"
            secondary={getStepsPageDescription()}
          />
        )}
      </Block>
      {!!steps?.length && (
        <Stack
          direction="row"
          sx={
            {
              ...paper(1),
              ...acrylic,
              alignItems: "center",
              position: "absolute",
              top: (t) => t.spacing(isViewTree ? 6 : 6 + 7),
              height: (t) => t.spacing(6),
              borderRadius: 1,
              px: 1,
              m: 1,
            } as SxProps<Theme>
          }
        >
          <Playback layer={key} />
        </Stack>
      )}
    </>
  );
}

function useItemState({
  layer,
  index = 0,
}: {
  layer?: string;
  index?: number;
}) {
  "use no memo";
  const one = slice.layers.one<StepsLayer>(layer);
  const event = one.use<Steps | undefined>(
    (l) => getController(l)?.steps?.(l),
    equal("key")
  )?.steps?.[index];
  const isSelected = one.use((l) => l.source?.step === index);
  return { event, isSelected };
}
function useItemPlaybackState(layer?: string) {
  "use no memo";
  const one = slice.layers.one<StepsLayer>(layer);
  const playing = one.use(computed("playing"));

  const { stepTo } = usePlaybackControls(layer);
  return { stepTo, playing };
}

function Item({
  layer,
  index = 0,
  disabled,
}: {
  disabled?: boolean;
  layer?: string;
  index?: number;
}) {
  const { spacing } = useTheme();

  const { stepTo, playing } = useItemPlaybackState(layer);
  const { event, isSelected } = useItemState({ layer, index });

  return (
    <Box
      sx={{
        height: pxToInt(spacing(index ? 0 : 6 + PADDING_TOP)) + ITEM_HEIGHT,
        pt: index ? 0 : spacing(6 + PADDING_TOP),
      }}
    >
      <WhenIdle>
        {playing ? (
          <Skeleton event={event} />
        ) : (
          <EventInspector
            sx={{
              opacity: disabled ? 0.25 : 1,
            }}
            event={event}
            index={index}
            selected={isSelected}
            // TODO: Temporarily disabled breakpoint features
            // label={shouldBreak(eventIndex)?.result}
            onClick={() => stepTo(index)}
          />
        )}
      </WhenIdle>
      <Divider variant="inset" />
    </Box>
  );
}
