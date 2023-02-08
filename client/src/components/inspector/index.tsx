import { Box, Fade, LinearProgress } from "@material-ui/core";
import { BlurOnTwoTone as DisabledIcon } from "@material-ui/icons";
import { Flex, FlexProps } from "components/generic/Flex";
import { getRenderer } from "components/renderer";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { some, values } from "lodash";
import { createElement, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { InfoPanel } from "./InfoPanel";
import { SelectionMenu } from "./SelectionMenu";
import { SplitView } from "./SplitView";

type SpecimenInspectorProps = {} & FlexProps;

export function Inspector(props: SpecimenInspectorProps) {
  const [loading] = useLoading();
  const [{ specimen, format, map }] = useSpecimen();
  const renderer = getRenderer(format);
  const [showInfo, setShowInfo] = useState(true);
  const [selection, setSelection] = useState<RendererSelectEvent | undefined>(
    undefined
  );

  return (
    <>
      <Fade in={some(values(loading))}>
        <LinearProgress variant="indeterminate" sx={{ mb: -0.5, zIndex: 1 }} />
      </Fade>
      <Flex {...props}>
        {specimen ? (
          <Flex>
            <SplitView
              resizable={true}
              left={
                <AutoSize>
                  {(size) => (
                    <Fade appear in>
                      <Box>
                        {createElement(renderer, {
                          ...size,
                          key: map,
                          onSelect: setSelection,
                          selection: selection?.world,
                        })}
                      </Box>
                    </Fade>
                  )}
                </AutoSize>
              }
              right={
                <AutoSize>
                  {(size) => (
                    <Fade appear in>
                      <Box>
                        {createElement(renderer, {
                          ...size,
                          key: map,
                          onSelect: setSelection,
                          selection: selection?.world,
                        })}
                      </Box>
                    </Fade>
                  )}
                </AutoSize>
              } />
            <InfoPanel
              position="absolute"
              right={showInfo?0:'min(-25vw,-480px)'}
              height="100%"
              width="25vw"
              minWidth={480}
              show={showInfo}
              setShow={setShowInfo}
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
