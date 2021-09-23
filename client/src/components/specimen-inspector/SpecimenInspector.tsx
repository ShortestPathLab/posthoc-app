import { Fade, LinearProgress, useTheme } from "@material-ui/core";
import { Flex, FlexProps } from "components/generic/Flex";
import { createElement, useState } from "react";
import { AutoSizer as AutoSize } from "react-virtualized";
import { useLoading } from "slices/loading";
import { useSpecimen } from "slices/specimen";
import { EventListInspector } from "./EventListInspector";
import { getRenderer } from "components/specimen-renderer/getRenderer";
import { SelectEvent as RendererSelectEvent } from "components/specimen-renderer/Renderer";
import { SelectionMenu } from "./SelectionMenu";

type SpecimenInspectorProps = {} & FlexProps;

export function SpecimenInspector(props: SpecimenInspectorProps) {
  const { palette } = useTheme();
  const [{ specimen: loading }] = useLoading();
  const [{ specimen, mapType }] = useSpecimen();
  const [selection, setSelection] = useState<RendererSelectEvent | undefined>(
    undefined
  );

  const [renderer] = getRenderer(mapType);

  const inspectorStyles = loading
    ? {
        opacity: palette.action.disabledOpacity,
        pointerEvents: "none" as const,
      }
    : {};

  return (
    <>
      <Fade in={loading}>
        <LinearProgress variant="indeterminate" sx={{ mb: -0.5, zIndex: 1 }} />
      </Fade>
      <Flex {...props}>
        {specimen ? (
          <Flex
            sx={{
              transition: ({ transitions }) => transitions.create("opacity"),
              ...inspectorStyles,
            }}
          >
            <AutoSize>
              {(size) =>
                createElement(renderer, {
                  ...size,
                  onSelect: setSelection,
                  selection: selection?.world,
                })
              }
            </AutoSize>
            <EventListInspector
              position="absolute"
              right={0}
              height="100%"
              maxWidth={480}
              minWidth="30vw"
            />
          </Flex>
        ) : (
          <Flex
            justifyContent="center"
            alignItems="center"
            color="text.secondary"
          >
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
