import { Fade, LinearProgress } from "@material-ui/core";
import { BlurOnTwoTone as DisabledIcon } from "@material-ui/icons";
import { Flex, FlexProps } from "components/generic/Flex";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { some, values } from "lodash";
import { useState, useCallback } from "react";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { InfoPanel } from "./InfoPanel";
import { SelectionMenu } from "./SelectionMenu";
import { SplitView } from "./SplitView";

import { createViews as cv } from "components/render/renderer";

import { Playback } from "components/render/renderer/generic/Playback";

type SpecimenInspectorProps = {} & FlexProps;

export function Inspector(props: SpecimenInspectorProps) {
  const [loading] = useLoading();
  const [{ interlang, eventList }] = useSpecimen();
  const [showInfo, setShowInfo] = useState(true);
  const [resizing, setResizing] = useState(false);
  const [selection, setSelection] = useState<RendererSelectEvent | undefined>(
    undefined
  );

  const createViews = useCallback(cv, []);

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
}
