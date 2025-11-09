import { SegmentOutlined } from "@mui-symbols-material/w400";
import { Stack, SxProps, Theme, useTheme } from "@mui/material";
import { Playback } from "components/app-bar/Playback";
import { Block } from "components/generic/Block";
import {
  LazyList as List,
  LazyListHandle as ListHandle,
} from "components/generic/LazyList";
import { Placeholder } from "components/inspector/Placeholder";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { flattenSubtree } from "hooks/useHighlight";
import { computed } from "hooks/usePlaybackState";
import { Steps } from "layers";
import { inferLayerName } from "layers/inferLayerName";
import { getController } from "layers/layerControllers";
import {
  filter,
  findIndex,
  isEqual,
  isUndefined,
  reduce,
  sortBy,
  uniq,
} from "lodash-es";
import { useEffect, useMemo, useRef, useState } from "react";
import { slice } from "slices";
import { WithLayer } from "slices/layers";
import { equal } from "slices/selector";
import { useAcrylic, usePaper } from "theme";
import { SYMBOL_HIGHLIGHTED } from ".";
import { lerp } from "utils/lerp";
import { description } from "./description";
import { ITEM_HEIGHT, PADDING_TOP, pxToInt } from "./constants";
import { StepsLayer } from "./StepsLayer";
import { StepsPageState } from "./StepsPageState";
import { Item } from "./Item";
import { _ } from "utils/chain";
import { result } from "utils/result";
export function PageContent({ layer: key }: { layer?: string }) {
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

  const { steps, stepToFilteredStep, isDisabled } = useMemo(
    () =>
      result(() => {
        if (rawSteps) {
          const steps = rawSteps.map((a, b) => [a, b] as const);
          const stepTypes = _(
            steps,
            (s) => s.map(([e]) => e?.type),
            (s) => filter(s),
            uniq
          );

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
      }).result ?? {},
    [rawSteps, _selectedType, highlighting, showHighlighting]
  );

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
                    event={steps[i][1]}
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
                  {(l) => description(inferLayerName(l))}
                </WithLayer>
              }
            />
          )
        ) : (
          <Placeholder
            icon={<SegmentOutlined />}
            label="Events"
            secondary={description()}
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
