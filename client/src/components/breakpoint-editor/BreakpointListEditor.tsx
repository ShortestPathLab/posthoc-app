import { Box } from "@mui/material";
import { ListEditor } from "components/generic/ListEditor";
import { debounce, flatMap as flat, get, keys, map, uniq } from "lodash";
import { Breakpoint, useUIState } from "slices/UIState";
import { BreakpointEditor } from "./BreakpointEditor";
import { comparators } from "./comparators";
import { intrinsicProperties } from "./intrinsicProperties";
import { propertyPaths as paths } from "./propertyPaths";

export function BreakpointListEditor() {
  const [{ breakpoints = [] }, setUIState] = useUIState();

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
