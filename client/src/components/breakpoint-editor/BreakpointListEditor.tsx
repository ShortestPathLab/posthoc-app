import { Box, Typography as Type } from "@mui/material";
import { ListEditor } from "components/generic/list-editor/ListEditor";
import { Scroll } from "components/generic/Scrollbars";
import { Breakpoint, DebugLayerData } from "hooks/useBreakpoints";
import {
  BreakpointService,
  treeToDict
} from "hooks/useBreakPoints2";
import { getController } from "layers/layerControllers";
import { chain as _, keys } from "lodash";
import { useTreeMemo } from "pages/tree/TreeWorkerLegacy";
import { produce } from "produce";
import { ReactNode, useMemo } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { BreakpointEditor } from "./BreakpointEditor";
import { violations } from "./BreakpointEditor2";
import { comparators } from "./comparators";
import { eventTypes } from "./eventTypes";

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


  const properties = useMemo(
    () =>
      _(events)
        .flatMap(keys)
        .uniq()
        .filter((p) => p !== "type")
        .value(),
    [events]
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
            onChange={(f) =>
              handleBreakpointsChange(produce(breakpoints ?? [], f))
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
