import { Box, Fade, LinearProgress } from "@material-ui/core";
import { BlurOnTwoTone as DisabledIcon } from "@material-ui/icons";
import { Flex, FlexProps } from "components/generic/Flex";
// import { createViews } from "components/render/renderer";
import { PixiStage } from "components/render/renderer/pixi/PixiStage";
// import { getRenderer } from "components/renderer";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { get, some, values } from "lodash";
import { createElement, useCallback, useState } from "react";
import { useInterlang } from "slices/interlang";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { InfoPanel } from "./InfoPanel";
import { SelectionMenu } from "./SelectionMenu";
import { SplitView } from "./SplitView";

import AutoSize from "react-virtualized-auto-sizer";
import { UseCanvas } from "components/render/renderer/types";
import { LazyNodeList } from "components/render/renderer/generic/NodeList";
import { Interlang } from "slices/interlang";

import traceJson from "../render/data/grid-astar.trace.json";

export const Stages = {
  "2d-pixi": PixiStage
}

const getRenderer = (name: string | undefined) => {
  if (name) {
    if (name in Stages) {
      return get(Stages, name);
    } else {
      throw new Error(`Renderer name ${name} not exist on platform`);
    }
  }
}

export function createViews(interlang: Interlang) {
  
  const views = Object.keys(interlang).map((viewName) => {
    const Stage = getRenderer(interlang?.[viewName]?.renderer);
    
    return (
      <AutoSize>
        {(size) => (
          <Fade appear in>
            <Box>
              {createElement(Stage, {
                ...size,
                view: interlang.main,
                children: (useCanvas: UseCanvas) => (
                  <>
                    <LazyNodeList
                      useCanvas={useCanvas}
                      events={traceJson.eventList}
                      step={100}
                    />
                  </>
                ),
              })}
            </Box>
          </Fade>
        )}
      </AutoSize>
    )
  });
  return views;
}


type SpecimenInspectorProps = {} & FlexProps;

export function Inspector(props: SpecimenInspectorProps) {
  const [loading] = useLoading();
  const [{ specimen, format, map }] = useSpecimen();
  const renderer = getRenderer(format);
  const [showInfo, setShowInfo] = useState(true);
  const [selection, setSelection] = useState<RendererSelectEvent | undefined>(
    undefined
  );

  const [interlang] = useInterlang();

  return (
    <>
      <Fade in={some(values(loading))}>
        <LinearProgress variant="indeterminate" sx={{ mb: -0.5, zIndex: 1 }} />
      </Fade>
      <Flex {...props}>
        <Flex>
          <SplitView
            resizable={true}
            views={createViews(interlang)}
          />
        </Flex>

        {/* {specimen ? (
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
              // right={
              //   <AutoSize>
              //     {(size) => (
              //       <Fade appear in>
              //         <Box>
              //           {createElement(renderer, {
              //             ...size,
              //             key: map,
              //             onSelect: setSelection,
              //             selection: selection?.world,
              //           })}
              //         </Box>
              //       </Fade>
              //     )}
              //   </AutoSize>
              // } 
              />
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
        )} */}
      </Flex>
      <SelectionMenu
        selection={selection}
        onClose={() => setSelection(undefined)}
      />
    </>
  );
}
