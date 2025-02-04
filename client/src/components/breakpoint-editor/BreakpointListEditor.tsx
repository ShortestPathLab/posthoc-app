import { ListEditor } from "components/generic/list-editor/ListEditor";
import { DebugLayerData } from "hooks/useBreakPoints2";
import {
  chain as _,
  filter,
  isEmpty,
  isUndefined,
  keys,
  map,
  set,
} from "lodash";
import { produce } from "produce";
import { ReactNode, useEffect, useMemo } from "react";
import { useLayer } from "slices/layers";
import {
  Breakpoint,
  BreakpointEditor,
  breakpointType,
  violations,
} from "./BreakPointEditor2";
import { comparators } from "./comparators";
import { Scroll } from "components/generic/Scrollbars";
import { Box, Typography as Type } from "@mui/material";
import { eventTypes } from "./eventTypes";

type BreakpointListEditorProps = {
  breakpoints?: Breakpoint[];
  onValueChange?: (v: Breakpoint[]) => void;
  layer?: string;
};

export function BreakpointListEditor({
  layer: key,
}: BreakpointListEditorProps) {
  const { layer, setLayer } = useLayer<DebugLayerData>(key);
  const result: Breakpoint[] = [];

  function handleBreakpointsChange(updatedBreakpoints: any) {
    if (layer) {
      if (layer?.source?.output) {
        let filteredRes = map(updatedBreakpoints, (b) => {
          if (layer?.source?.output?.[b.key])
            return { [b.key]: layer?.source?.output?.[b.key] };
        });
        filteredRes = filter(filteredRes, (v) => !isUndefined(v));
        if (!isEmpty(filteredRes)) {
          setLayer(
            produce(layer, (layer) =>
              set(layer?.source ?? {}, "output", filteredRes)
            )
          );
        }
        if (isEmpty(updatedBreakpoints)) {
          setLayer(
            produce(layer, (layer) => set(layer?.source ?? {}, "output", {}))
          );
        }
      }
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

  function renderHeading(label: ReactNode) {
    return (
      <Type component="div" variant="overline" color="text.secondary">
        {label}
      </Type>
    );
  }

  return (
    <Box sx={{ overflow: "auto hidden", width: "100%" }}>
      <Scroll x>
        <Box sx={{ minWidth: 720, mb: 2 }}>
          <Box px={2}>{renderHeading("Breakpoints")}</Box>
          <ListEditor<Breakpoint>
            sortable
            button={false}
            icon={null}
            value={result}
            deletable
            editable={false}
            editor={(v: any) => (
              <BreakpointEditor
                value={v}
                layerKey={key}
                trace={layer?.source?.trace}
              />
            )}
            create={() => ({
              active: true,
              property: properties?.[0],
              condition: comparators?.[0].key,
              eventType: eventTypes?.[0],
              reference: 0,
            })}
            onChange={(updatedBreakpoints) =>
              handleBreakpointsChange(updatedBreakpoints)
            }
            addItemLabels={["Breakpoint"]}
            placeholder="Get started by adding a breakpoint."
          />
        </Box>
        <Box sx={{ minWidth: 720, mb: 2 }}>
          <Box px={2}>{renderHeading("Violations")}</Box>
          <ListEditor
            sortable
            button={false}
            icon={null}
            value={result}
            deletable
            editable={false}
            editor={(v) => (
              <BreakpointEditor
                value={v}
                trace={layer?.source?.trace}
                layerKey={key}
              />
            )}
            create={() => ({
              active: true,
              property: properties?.[0],
              condition: "",
            })}
            onChange={(updatedBreakpoints) => {
              handleBreakpointsChange(updatedBreakpoints);
            }}
            addItemLabels={violations}
            placeholder="Certain types of errors can be detected by checking for invariant violations."
          />
        </Box>
      </Scroll>
    </Box>
  );
}
