import { Box, Fade, LinearProgress } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { pages } from "pages";
import { createElement } from "react";
import { useAnyLoading } from "slices/loading";
import { PanelState, useView } from "slices/view";
import { ViewTree } from "./ViewTree";

type SpecimenInspectorProps = Record<string, any> & FlexProps;

export function Inspector(props: SpecimenInspectorProps) {
  const loading = useAnyLoading();
  const [{ view }, setView] = useView();

  return (
    <>
      <Flex {...props}>
        <ViewTree<PanelState>
          root={view}
          onChange={(v) => setView(() => ({ view: v }))}
          renderLeaf={({ content }) => (
            <Fade in>
              <Box sx={{ width: "100%", height: "100%" }}>
                {createElement(pages[content?.type ?? ""]?.content)}
              </Box>
            </Fade>
          )}
        />
      </Flex>
      {/* <SelectionMenu
        selection={selection}
        onClose={() => setSelection(undefined)}
      /> */}
      <Fade in={loading}>
        <LinearProgress
          variant="indeterminate"
          sx={{ position: "absolute", bottom: 0, width: "100%", zIndex: 1 }}
        />
      </Fade>
    </>
  );
}
