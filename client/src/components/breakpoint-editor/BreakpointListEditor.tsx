import { Box } from "@mui/material";
import { ListEditor } from "components/generic/list-editor/ListEditor";
import { Scroll } from "components/generic/Scrollbars";
import { Breakpoint, DebugLayerData } from "hooks/useBreakpoints";
import { getController } from "layers/layerControllers";
import { chain as _, keys, set } from "lodash";
import { produce } from "produce";
import { useMemo } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { BreakpointEditor } from "./BreakpointEditor";
import { comparators } from "./comparators";

type BreakpointListEditorProps = {
  breakpoints?: Breakpoint[];
  onValueChange?: (v: Breakpoint[]) => void;
  layer?: string;
};

export function BreakpointListEditor({
  layer: key,
}: BreakpointListEditorProps) {
  const one = slice.layers.one<Layer<DebugLayerData>>(key);
  const breakpoints = one.use((l) => l?.source?.breakpoints);
  const events = one.use((l) => getController(l)?.steps?.(l));

  function handleBreakpointsChange(updatedBreakpoints: Breakpoint[]) {
    one.set((l) => set(l, "source.breakpoints", updatedBreakpoints));
  }

  const properties = useMemo(
    () =>
      _(events)
        .flatMap(keys)
        .uniq()
        .filter((p) => p !== "type")
        .value(),
    [events]
  );

  return (
    <Box sx={{ overflow: "auto hidden", width: "100%" }}>
      <Scroll x>
        <Box sx={{ minWidth: 720, mb: 2 }}>
          <ListEditor<Breakpoint>
            sortable
            button={false}
            icon={null}
            value={breakpoints}
            deletable
            editable={false}
            editor={(v) => (
              <BreakpointEditor value={v} properties={properties} />
            )} //v = a breakpoint
            create={() => ({
              active: true,
              property: properties?.[0],
              condition: comparators?.[0],
              type: undefined,
              reference: 0,
            })}
            onChange={(f) =>
              handleBreakpointsChange(produce(breakpoints ?? [], f))
            }
            addItemLabel="Breakpoint"
            placeholder="Get started by adding a breakpoint."
          />
        </Box>
      </Scroll>
    </Box>
  );
}
