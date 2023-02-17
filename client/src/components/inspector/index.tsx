import { BlurOnTwoTone as DisabledIcon } from "@material-ui/icons";
import { Flex, FlexProps } from "components/generic/Flex";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { useState, useCallback } from "react";
import { useSpecimen } from "slices/specimen";
import { InfoPanel } from "./InfoPanel";
import { SelectionMenu } from "./SelectionMenu";
import { SplitView } from "./SplitView";

import { createViews as cv } from "components/render/renderer";

import { Playback } from "components/render/renderer/generic/Playback";
import React from "react";
import { LoadIndicator } from "./LoadIndicator";

type SpecimenInspectorProps = {} & FlexProps;

export const Inspector = React.memo( function Inspector(props: SpecimenInspectorProps) {
  const [{ interlang, eventList }] = useSpecimen();
  const [showInfo, setShowInfo] = useState(true);
  const [resizing, setResizing] = useState(false);
  const [selection, setSelection] = useState<RendererSelectEvent | undefined>(
    undefined
  );

  const createViews = useCallback(cv, []);
  return (
    <>
      <LoadIndicator />
      <Flex {...props}>
        {interlang ? (
          <Flex>
            <Playback>
              {(eventList, step) => (
                <SplitView
                  resizable={true}
                  views={createViews(interlang, eventList, step)}
                  resizing={resizing}
                  setResizing={setResizing}
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
});
