import { Box } from "@mui/material";
import { ListEditor } from "components/generic/ListEditor";
import { Breakpoint, DebugLayerData } from "hooks/useBreakpoints";
import { flatMap as flat, get, keys, map, set, uniq } from "lodash";
import { produce } from "produce";
import { useLayer } from "slices/layers";
import { BreakpointEditor } from "./BreakpointEditor";
import { comparators } from "./comparators";
import { intrinsicProperties } from "./intrinsicProperties";
import { propertyPaths as paths } from "./propertyPaths";

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
    layer &&
      setLayer(
        produce(layer, (layer) =>
          set(layer, "source.breakpoints", updatedBreakpoints)
        )
      );
  }

  const properties = uniq([
    ...intrinsicProperties,
    ...flat(paths, (p) =>
      //TODO:
      flat([], (v) => map(keys(get(v, p)), (k) => `${p}.${k}`))
    ),
  ]);

  return (
    <Box sx={{ overflow: "auto hidden", width: "100%" }}>
      <Box sx={{ minWidth: 720, mb: 2 }}>
        <ListEditor<Breakpoint>
          icon={null}
          value={breakpoints}
          useDelete
          useEdit={false}
          editor={(v) => <BreakpointEditor value={v} properties={properties} />} //v = a breakpoint
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
          placeholderText="Click the button below to add a breakpoint."
        />
      </Box>
    </Box>
  );
}
