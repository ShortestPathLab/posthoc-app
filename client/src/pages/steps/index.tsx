import { FiberManualRecordOutlined } from "@mui-symbols-material/w400";
import { Box, Divider } from "@mui/material";
import { grey } from "@mui/material/colors";
import { FeaturePicker } from "components/app-bar/FeaturePicker";
import { LayerPicker } from "components/generic/LayerPicker";
import { useSurfaceAvailableCssSize } from "components/generic/surface/useSurfaceSize";
import { useViewTreeContext } from "components/inspector/ViewTree";
import { getColorHex, tint } from "components/renderer/colors";
import { useEffectWhen } from "hooks/useEffectWhen";
import { Steps } from "layers";
import { getController } from "layers/layerControllers";
import { chain as _, isEqual, isUndefined, map, startCase } from "lodash";
import { nanoid as id } from "nanoid";
import { useMemo } from "react";
import { slice } from "slices";
import { equal } from "slices/selector";
import { PageContentProps } from "../PageMeta";
import { PageContent } from "./PageContent";
import { StepsLayer, isStepsLayer } from "./StepsLayer";
import { StepsPageState, useStepsPageState } from "./StepsPageState";

const divider = <Divider orientation="vertical" flexItem sx={{ m: 1 }} />;

const SYMBOL_ALL = id();
export const SYMBOL_HIGHLIGHTED = id();

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
