import { Box, Fade, LinearProgress } from "@material-ui/core";
import { BlurOnTwoTone as DisabledIcon } from "@material-ui/icons";
import { Flex, FlexProps } from "components/generic/Flex";
import { PixiStage } from "components/render/renderer/pixi/PixiStage";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { get, some, values } from "lodash";
import { createElement, useState } from "react";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { InfoPanel } from "./InfoPanel";
import { SelectionMenu } from "./SelectionMenu";
import { SplitView } from "./SplitView";

import AutoSize from "react-virtualized-auto-sizer";
import { UseCanvas } from "components/render/renderer/types";
import { LazyNodeList } from "components/render/renderer/generic/NodeList";
import { Interlang } from "slices/specimen";

import { Playback } from "components/render/renderer/generic/Playback";
import { Event } from "components/render/types/render";

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

// FIXME I want to make it a dedicate render/renderer/index.ts but fail
// it doesn't show anything when did so
export function createViews(interlang: Interlang, eventList: Event[], step: number) {
  
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
                      events={eventList}
                      step={step}
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
  // 
  views.push(views[0]);
  return views;
}


type SpecimenInspectorProps = {} & FlexProps;

export function Inspector(props: SpecimenInspectorProps) {
  const [loading] = useLoading();
  const [{ interlang, eventList }] = useSpecimen();
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
        {interlang ? (
          <Flex>
            <Playback>
              {(eventList, step) => (
                <SplitView
                  resizable={true}
                  views={createViews(interlang, eventList, step)}
                />
              )}
            </Playback>
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
        {eventList?(
          <InfoPanel
            position="absolute"
            right={showInfo?0:'min(-25vw,-480px)'}
            height="100%"
            width="25vw"
            minWidth={480}
            show={showInfo}
            setShow={setShowInfo}
          />
        ):<></>}
      </Flex>
      <SelectionMenu
        selection={selection}
        onClose={() => setSelection(undefined)}
      />
    </>
  );
}
