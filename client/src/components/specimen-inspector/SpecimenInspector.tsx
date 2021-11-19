import { Fade, LinearProgress } from "@material-ui/core";
import { Flex, FlexProps } from "components/generic/Flex";
import { getRenderer } from "components/specimen-renderer/getRenderer";
import { SelectEvent as RendererSelectEvent } from "components/specimen-renderer/Renderer";
import { some, values } from "lodash";
import { createElement, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { EventListInspector } from "./EventListInspector";
import { SelectionMenu } from "./SelectionMenu";
import { BlurOnTwoTone as DisabledIcon } from "@material-ui/icons";

type SpecimenInspectorProps = {} & FlexProps;

export function SpecimenInspector(props: SpecimenInspectorProps) {
  const [loading] = useLoading();
  const [{ specimen, mapType, map }] = useSpecimen();
  const [renderer] = getRenderer(mapType);
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
            <AutoSize>
              {(size) =>
                createElement(renderer, {
                  ...size,
                  key: map,
                  onSelect: setSelection,
                  selection: selection?.world,
                })
              }
            </AutoSize>
            <EventListInspector
              position="absolute"
              right={0}
              height="100%"
              width="30vw"
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
            Select a map and an algorithm to get started.
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
