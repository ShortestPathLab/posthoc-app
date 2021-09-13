import { ListEditor } from "components/generic/ListEditor";
import { debounce, flatMap as flat, get, keys, map, uniq } from "lodash";
import { useSpecimen } from "slices/specimen";
import { Breakpoint, useUIState } from "slices/UIState";
import { comparators } from "./comparators";
import { intrinsicProperties } from "./intrinsicProperties";
import { BreakpointEditor } from "./BreakpointEditor";
import { Box } from "@material-ui/system";
import { propertyPaths as paths } from "./propertyPaths";

export function BreakpointListEditor() {
  const [{ breakpoints = [] }, setUIState] = useUIState();
  const [specimen] = useSpecimen();

  const properties = uniq([
    ...intrinsicProperties,
    ...flat(paths, (p) =>
      flat(specimen?.nodeStructure, (v) =>
        map(keys(get(v, p)), (k) => `${p}.${k}`)
      )
    ),
  ]);

  return (
    <Box sx={{ overflow: "auto hidden", width: "100%" }}>
      <Box sx={{ minWidth: 720 }}>
        <ListEditor<Breakpoint>
          icon={null}
          value={breakpoints}
          useDelete
          useEdit={false}
          editor={(v) => <BreakpointEditor value={v} properties={properties} />}
          create={() => ({
            active: true,
            property: properties?.[0],
            condition: comparators?.[0],
            type: undefined,
            reference: 0,
          })}
          onChange={debounce((v) => setUIState({ breakpoints: v }), 1000)}
          addItemLabel="Breakpoint"
          placeholderText="Click the button below to add a breakpoint."
        />
      </Box>
    </Box>
  );
}
