import {
  Box,
  Card,
  CardActionArea,
  CardProps,
  Divider,
  Typography as Type,
} from "@material-ui/core";
import { HideSourceOutlined as HiddenIcon } from "@material-ui/icons";
import { Flex } from "components/generic/Flex";
import { Overline, OverlineDot as Dot } from "components/generic/Overline";
import { Property } from "components/generic/Property";
import { call } from "components/script-editor/call";
import { getColorHex } from "components/specimen-renderer/colors";
import { entries, filter, map } from "lodash";
import { TraceEvent } from "protocol/Trace";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

type EventInspectorProps = {
  event?: TraceEvent;
  index?: number;
  selected?: boolean;
} & CardProps;

export function EventInspector({
  event,
  index,
  selected,
  ...props
}: EventInspectorProps) {
  const [{ specimen }] = useSpecimen();
  const [{ code }, setUIState] = useUIState();

  const cardStyles = selected
    ? {
        color: "primary.contrastText",
        bgcolor: "primary.main",
      }
    : {};

  const hidden = event
    ? !call(code ?? "", "shouldRender", [
        index ?? 0,
        event,
        specimen?.eventList ?? [],
      ])
    : false;

  return (
    <Card
      {...props}
      sx={{
        ...cardStyles,
        ...props.sx,
      }}
    >
      <CardActionArea
        sx={{ p: 2, height: "100%" }}
        onClick={() => setUIState({ step: index })}
      >
        <Flex alignItems="center">
          <Type>{index}</Type>
          <Divider sx={{ mx: 2 }} flexItem orientation="vertical" />
          <Box>
            <Overline>
              <Dot
                sx={{
                  color: getColorHex(event?.type),
                  mr: 1,
                }}
              />
              {`${event?.type ?? "unsupported"} #${event?.id ?? "-"}`}{" "}
              {hidden && (
                <HiddenIcon
                  sx={{
                    opacity: 0.56,
                    fontSize: 12,
                    ml: 1,
                    transform: "translateY(1.75px)",
                  }}
                />
              )}
            </Overline>
            <Flex flexWrap="wrap">
              {map(
                filter(
                  [
                    ["f", event?.f],
                    ["g", event?.g],
                    ...entries(event?.variables),
                  ],
                  ([, v]) => v !== undefined
                ),
                ([k, v]) => (
                  <Property label={k} value={v} type={{ variant: "body2" }} />
                )
              )}
            </Flex>
          </Box>
        </Flex>
      </CardActionArea>
    </Card>
  );
}
