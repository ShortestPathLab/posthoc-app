import { Box, Fade, LinearProgress } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { useState } from "react";
import { Layers, Stack, useUIState } from "slices/UIState";
import { useAnyLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { SelectionMenu } from "./SelectionMenu";
import { StackView, ViewTree } from "./ViewTree";
import { Controls } from "components/app-bar/Controls";
import { TraceRenderer } from "./TraceRenderer";
import AutoSize from "react-virtualized-auto-sizer";
import { InfoPanel } from "./InfoPanel";
import { BlurOnTwoTone as DisabledIcon } from "@mui/icons-material";

type SpecimenInspectorProps = {} & FlexProps;

export function Inspector(props: SpecimenInspectorProps) {
  const loading = useAnyLoading();
  const [{ view }] = useUIState();
  const [{ specimen }] = useSpecimen();
  const [selection, setSelection] = useState<RendererSelectEvent | undefined>(
    undefined
  );

  return (
    <>
      <Fade in={loading}>
        <LinearProgress variant="indeterminate" sx={{ mb: -0.5, zIndex: 1 }} />
      </Fade>
      <Flex {...props}>
        {/* <ViewTree<Stack<Layers>>
          root={view}
          renderLeaf={({ content }) => (
            <StackView
              stack={content}
              renderContent={() => (
                <Box>
                  <Controls /> 
                  Test
                </Box>
              )}
            />
          )}
        /> */}
        {specimen ? (
          <Flex>
            <AutoSize>
              {(size) => (
                <Fade appear in>
                  <Box>
                    <TraceRenderer
                      {...size}
                      // onSelect={setSelection}
                      // selection={selection?.world}
                    />
                  </Box>
                </Fade>
              )}
            </AutoSize>
            <InfoPanel
              position="absolute"
              right={0}
              height="100%"
              width="25vw"
              minWidth={480}
            />
          </Flex>
        ) : (
          <Flex
            justifyContent="center"
            alignItems="center"
            color="text.secondary"
            vertical
          >
            <DisabledIcon sx={{ mb: 2 }} fontSize="large" />
            Select a map to get started.
          </Flex>
        )}
      </Flex>
      <SelectionMenu
        selection={selection}
        onClose={() => setSelection(undefined)}
      />
    </>
  );
}
