import { Fade, LinearProgress } from "@material-ui/core";
import { getClient } from "client/getClient";
import { useState } from "react";
import { useAsyncAbortable as useAsync } from "react-async-hook";
import { AutoSizer as AutoSize } from "react-virtualized";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";
import { Flex, FlexProps } from "../Flex";
import { EventListInspector } from "./EventListInspector";
import { Renderer } from "./Renderer";

type SpecimenInspectorProps = {} & FlexProps;

export function SpecimenInspector({ ...props }: SpecimenInspectorProps) {
  const [loading, setLoading] = useState(false);
  const [{ algorithm }] = useUIState();
  const [specimen, setSpecimen] = useSpecimen();
  useAsync(
    async (signal) => {
      if (algorithm) {
        setLoading(true);
        const client = await getClient();
        const trace = await client.call("solve/pathfinding", {
          algorithm,
          end: 0,
          start: 0,
          mapType: "",
          mapURI: "",
        });
        if (!signal.aborted) {
          setSpecimen(trace);
          setLoading(false);
        }
      }
      return () => setLoading(false);
    },
    [algorithm, getClient, setLoading]
  );

  return (
    <>
      <Fade in={loading}>
        <LinearProgress variant="indeterminate" sx={{ mb: -0.5 }} />
      </Fade>
      <Flex {...props}>
        {specimen ? (
          <>
            <AutoSize>{(size) => <Renderer {...size} />}</AutoSize>
            <EventListInspector
              position="absolute"
              right={0}
              height="100%"
              maxWidth={480}
              minWidth="25vw"
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
    </>
  );
}
