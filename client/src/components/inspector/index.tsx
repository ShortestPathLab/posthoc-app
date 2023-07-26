import { Box, Fade, LinearProgress } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { pages } from "pages";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { createElement, useState } from "react";
import { PanelState, useUIState } from "slices/UIState";
import { useAnyLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { SelectionMenu } from "./SelectionMenu";
import { ViewTree } from "./ViewTree";

type SpecimenInspectorProps = {} & FlexProps;

export function Inspector(props: SpecimenInspectorProps) {
  const loading = useAnyLoading();
  const [{ view }, setUIState] = useUIState();
  const [selection, setSelection] = useState<RendererSelectEvent | undefined>(
    undefined
  );

  return (
    <>
      <Flex {...props}>
        <ViewTree<PanelState>
          root={view}
          onChange={(v) => setUIState({ view: v })}
          renderLeaf={({ content }) => (
            <Fade in>
              <Box sx={{ width: "100%", height: "100%" }}>
                {createElement(pages[content?.type ?? ""]?.content)}
              </Box>
            </Fade>
          )}
        />
      </Flex>
      <SelectionMenu
        selection={selection}
        onClose={() => setSelection(undefined)}
      />
      <Fade in={loading}>
        <LinearProgress
          variant="indeterminate"
          sx={{ position: "absolute", bottom: 0, width: "100%", zIndex: 1 }}
        />
      </Fade>
    </>
  );
}
