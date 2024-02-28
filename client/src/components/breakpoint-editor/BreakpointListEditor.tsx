import { Box } from "@mui/material";
import { ListEditor } from "components/generic/ListEditor";
import { Breakpoint, DebugLayerData } from "hooks/useBreakpoints";
import { chain as _, keys, set } from "lodash";
import { produce } from "produce";
import { useMemo } from "react";
import { useLayer } from "slices/layers";
import { BreakpointEditor } from "./BreakpointEditor";
import { comparators } from "./comparators";
import { Scroll } from "components/generic/Scrollbars";

type BreakpointListEditorProps = {
  breakpoints?: Breakpoint[];
  onValueChange?: (v: Breakpoint[]) => void;
  layer?: string;
};

export function BreakpointListEditor({
  layer: key,
}: BreakpointListEditorProps) {
  const { layer, setLayer } = useLayer<DebugLayerData>(key);
  const { breakpoints } = layer?.source ?? {};

  function handleBreakpointsChange(updatedBreakpoints: Breakpoint[]) {
    if (layer) {
      setLayer(
        produce(layer, (layer) =>
          set(layer, "source.breakpoints", updatedBreakpoints)
        )
      );
    }
  }

  const properties = useMemo(
    () =>
      _(layer?.source?.trace?.content?.events)
        .flatMap(keys)
        .uniq()
        .filter((p) => p !== "type")
        .value(),
    [layer?.source?.trace?.content?.events]
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
            onChange={(updatedBreakpoints) =>
              handleBreakpointsChange(updatedBreakpoints)
            }
            addItemLabel="Breakpoint"
            placeholder="Get started by adding a breakpoint."
          />
        </Box>
      </Scroll>
    </Box>
  );
}
