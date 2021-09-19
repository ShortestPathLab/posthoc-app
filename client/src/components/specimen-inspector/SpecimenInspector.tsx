import { Fade, LinearProgress } from "@material-ui/core";
import { Flex, FlexProps } from "components/generic/Flex";
import { useState } from "react";
import { AutoSizer as AutoSize } from "react-virtualized";
import { useLoadingState } from "slices/loadingState";
import { useSpecimen } from "slices/specimen";
import { EventListInspector } from "./EventListInspector";
import { Renderer, SelectEvent as RendererSelectEvent } from "./Renderer";
import { SelectionMenu } from "./SelectionMenu";

type SpecimenInspectorProps = {} & FlexProps;

export function SpecimenInspector({ ...props }: SpecimenInspectorProps) {
  const [{ specimen: loading }] = useLoadingState();
  const [specimen] = useSpecimen();
  const [selection, setSelection] = useState<RendererSelectEvent | undefined>(
    undefined
  );

  return (
    <>
      <Fade in={loading}>
        <LinearProgress variant="indeterminate" sx={{ mb: -0.5, zIndex: 1 }} />
      </Fade>
      <Flex {...props}>
        {specimen ? (
          <>
            <AutoSize>
              {(size) => (
                <Renderer
                  {...size}
                  onSelect={setSelection}
                  selection={selection?.world}
                />
              )}
            </AutoSize>
            <EventListInspector
              position="absolute"
              right={0}
              height="100%"
              maxWidth={480}
              minWidth="30vw"
            />
          </>
        ) : (
          <Flex
            justifyContent="center"
            alignItems="center"
            color="text.secondary"
          >
            Select an algorithm to get started.
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
