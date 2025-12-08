import { MoreVertOutlined } from "@mui-symbols-material/w400";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  AddItemButton,
  ListEditor,
} from "components/generic/list-editor/ListEditor";
import { DebugLayerData } from "hooks/DebugLayerData";
import { useOptimisticTransaction } from "hooks/useOptimistic";
import { isEqual, startCase, values } from "lodash-es";
import { produce } from "immer";
import { startTransition } from "react";
import { slice } from "slices";
import { Layer } from "slices/layers";
import { idle } from "utils/idle";
import { set } from "utils/set";
import { Breakpoint, BreakpointEditor } from "./BreakpointEditor";
import handlersCollection from "./breakpoints";
import { useOne } from "slices/useOne";

type BreakpointListEditorProps = {
  breakpoints?: Breakpoint[];
  onValueChange?: (v: Breakpoint[]) => void;
  layer?: string;
};

function useBreakpoints(key?: string) {
  const one = slice.layers.one<Layer<DebugLayerData>>(key);
  const breakpoints = useOne(one, (l) => l?.source?.breakpoints, isEqual);
  const [optimistic, setOptimistic] = useOptimisticTransaction(
    breakpoints ?? [],
    (f) =>
      idle(() =>
        startTransition(() =>
          one.set((l) =>
            set(
              l,
              "source.breakpoints",
              produce(l.source?.breakpoints ?? [], f),
            ),
          ),
        ),
      ),
  );
  return [optimistic, setOptimistic] as const;
}

export function BreakpointListEditor({
  layer: key,
}: BreakpointListEditorProps) {
  const [breakpoints, setBreakpoints] = useBreakpoints(key);

  return (
    <Box sx={{ overflow: "hidden hidden", width: "100%" }}>
      <ListEditor<Breakpoint>
        value={breakpoints}
        onChange={setBreakpoints}
        sortable
        button={false}
        icon={null}
        deletable
        editable={false}
        renderEditor={({ props, handle, extras }) => (
          <>
            {handle}
            <BreakpointEditor {...props} layer={key} />
            {extras}
          </>
        )}
        create={() => ({ active: true })}
        extras={() => (
          <IconButton>
            <MoreVertOutlined />
          </IconButton>
        )}
        renderAddItem={(create) => (
          <>
            {values(handlersCollection).map(({ id, name, description }) => (
              <Tooltip key={id} title={description}>
                <AddItemButton onClick={() => create({ type: id })}>
                  {name ?? startCase(id)}
                </AddItemButton>
              </Tooltip>
            ))}
          </>
        )}
        placeholder="Certain types of errors can be detected by checking for invariant violations."
      />
    </Box>
  );
}
