import { ListEditor } from "components/generic/list-editor/ListEditor";
import {
  DebugLayerData,
  treeToDict,
  BreakpointService,
} from "hooks/useBreakPoints2";
import { chain as _, keys, set } from "lodash";
import { produce } from "produce";
import { ReactNode, useMemo } from "react";
import { useLayer } from "slices/layers";
import { Breakpoint, BreakpointEditor, violations } from "./BreakpointEditor2";
import { comparators } from "./comparators";
import { Scroll } from "components/generic/Scrollbars";
import { Box, Typography as Type } from "@mui/material";
import { eventTypes } from "./eventTypes";
import { useTreeMemo } from "pages/tree/TreeWorkerLegacy";

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
  const trace = layer?.source?.trace;

  const { result: treeRaw } = useTreeMemo(
    {
      trace: trace?.content,
      step: trace?.content?.events?.length,
      radius: undefined,
    },
    [trace?.content]
  );

  const trees = useMemo(() => {
    return treeToDict(treeRaw?.tree ?? []);
  }, [treeRaw]);

  function handleBreakpointsChange(updatedBreakpoints: Breakpoint[]) {
    if (layer) {
      setLayer(
        produce(layer, (layer) =>
          set(layer?.source ?? {}, "breakpointInput", updatedBreakpoints)
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
              condition: "increase",
            })}
            onChange={(updatedBreakpoints) => {
              handleBreakpointsChange(updatedBreakpoints);
            }}
            addItemLabels={violations}
            placeholder="Certain types of errors can be detected by checking for invariant violations."
          />
        </Box>
      </Scroll>
      <BreakpointService
        layer={layer}
        trees={trees}
        setLayer={setLayer}
      ></BreakpointService>
    </Box>
  );
}
