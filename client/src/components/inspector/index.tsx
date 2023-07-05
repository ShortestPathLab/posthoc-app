import { BlurOnTwoTone as DisabledIcon } from "@mui/icons-material";
import { Box, Fade, LinearProgress } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { getParser } from "components/renderer";
import {
  RendererProps,
  SelectEvent as RendererSelectEvent,
} from "components/renderer/Renderer";
import { DefaultRenderer } from "components/renderer/default";
import { every, find, keyBy, some, values } from "lodash";
import { createElement, useEffect, useRef, useState } from "react";
import AutoSize from "react-virtualized-auto-sizer";
import { useLoading } from "slices/loading";
import { useRenderers } from "slices/renderers";
import { useSpecimen } from "slices/specimen";
import { InfoPanel } from "./InfoPanel";
import { SelectionMenu } from "./SelectionMenu";

type SpecimenInspectorProps = {} & FlexProps;

function TraceRenderer({ renderer, width, height }: RendererProps) {
  const [renderers] = useRenderers();
  const { renderer: r2 } = find(renderers, { key: renderer })!;
  const [{ format, map }] = useSpecimen();
  const { nodes } = getParser(format)?.(map) ?? { nodes: [] };
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      const r = new r2.constructor();
      r.setup({
        tileSubdivision: 0,
        workerCount: 4,
        tileResolution: {
          width: 256,
          height: 256,
        },
        screenSize: {
          width,
          height,
        },
      });
      const remove = r.add(nodes);
      ref.current.append(r.getView()!);
      return () => {
        r.destroy();
        ref.current?.removeChild?.(r.getView()!);
      };
    }
  }, [ref.current, width, height]);
  return <div ref={ref} />;
}

export function Inspector(props: SpecimenInspectorProps) {
  const [loading] = useLoading();
  const [{ specimen, format, map }] = useSpecimen();
  const [renderers] = useRenderers();
  const { nodes } = getParser(format)?.(map) ?? { nodes: [] };
  const renderer = find(renderers, (r) => {
    const components = keyBy(r.renderer.meta.components);
    return every(nodes, (n) => n.$ in components);
  });
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
              {(size) => (
                <Fade appear in>
                  <Box>
                    {createElement(renderer ? TraceRenderer : DefaultRenderer, {
                      ...size,
                      renderer: renderer?.key,
                      key: map,
                      onSelect: setSelection,
                      selection: selection?.world,
                    })}
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
