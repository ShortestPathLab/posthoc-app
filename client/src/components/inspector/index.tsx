import { BlurOnTwoTone as DisabledIcon } from "@material-ui/icons";
import { Flex, FlexProps } from "components/generic/Flex";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { useState, useCallback, useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { InfoPanel } from "./InfoPanel";
import { SelectionMenu } from "./SelectionMenu";
import { SplitView } from "./SplitView";

import { TraceView } from "components/render/renderer";

import { NodesMap } from "components/render/renderer/generic/NodesMap";
import React from "react";
import { LoadIndicator } from "./LoadIndicator";
import { useUIState } from "slices/UIState";

type SpecimenInspectorProps = {} & FlexProps;

export const Inspector = React.memo( function Inspector(props: SpecimenInspectorProps) {
  const [{ interlang, eventList }] = useSpecimen();
  const [showInfo, setShowInfo] = useState(true);
  const [{fixed=false}] = useUIState();
  const [selection, setSelection] = useState<RendererSelectEvent | undefined>(
    undefined
  );

  const views = useMemo(() => {
    const result:{[key: string]:React.ReactNode} = {};
    if (interlang) {
      Object.keys(interlang).forEach(viewName => {
        result[viewName] = <TraceView view={interlang?.[viewName]} viewName={viewName} />;
      })
    }
    return result;
  }, [interlang]);
  
  return (
    <>
      <LoadIndicator />
      <Flex {...props}>
        {interlang ? (
          <Flex>
            <NodesMap>
              <SplitView
                resizable={true}
                views ={ views }
              />
            </NodesMap>
          </Flex>
        ) : (
          <Flex
            justifyContent="center"
            alignItems="center"
            color="text.secondary"
            vertical
          >
            <DisabledIcon sx={{ mb: 2 }} fontSize="large" />
            Select a trace to get started.
          </Flex>
        )}
        {eventList?(
          <InfoPanel
            position={fixed?"relative":"absolute"}
            right={fixed?undefined:'min(-25vw,-480px)'}
            height="100%"
            width="25vw"
            minWidth={480}
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
