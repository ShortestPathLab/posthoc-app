import {
  Box,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@material-ui/core";
import {
  PlaceOutlined as DestinationIcon,
  TripOriginOutlined as StartIcon,
} from "@material-ui/icons";
import { Label } from "components/generic/Label";
import { Overline } from "components/generic/Overline";
import { Property } from "components/generic/Property";
import { useSnackbar } from "components/generic/Snackbar";
import { SelectEvent as RendererSelectEvent } from "components/renderer/Renderer";
import { map } from "lodash";
import { useUIState } from "slices/UIState";
import { EventLabel } from "./EventLabel";
import { PropertyList } from "./PropertyList";

type Props = {
  selection?: RendererSelectEvent;
  onClose?: () => void;
};

export function SelectionMenu({ selection, onClose }: Props) {
  const notify = useSnackbar();
  const [, setUIState] = useUIState();
  const { global, info } = selection ?? {};
  const { current, entry, node } = info ?? {};

  return (
    <Menu
      open={!!selection}
      anchorReference="anchorPosition"
      anchorPosition={{
        top: global?.y ?? 0,
        left: global?.x ?? 0,
      }}
      onClose={onClose}
    >
      <ListItem>
        <ListItemText>
          <Box>
            <Overline>Point</Overline>
            <Property label="x" value={info?.point?.x ?? "-"} />
            <Property label="y" value={info?.point?.y ?? "-"} />
          </Box>
          {current?.event && (
            <Box mt={2}>
              <EventLabel event={current?.event} />
              <PropertyList event={current?.event} variant="body1" vertical />
            </Box>
          )}
        </ListItemText>
      </ListItem>
      <Divider sx={{ my: 1 }} />
      {map(
        [
          {
            id: 1,
            label: "Set Origin",
            icon: <StartIcon sx={{ transform: "scale(0.5)" }} />,
            action: () => {
              notify("Origin set.");
              setUIState({ start: node?.key });
            },
            disabled: !node,
          },
          {
            id: 2,
            label: "Set Destination",
            icon: <DestinationIcon />,
            action: () => {
              notify("Destination set.");
              setUIState({ end: node?.key });
            },
            disabled: !node,
          },
          {
            id: 3,
            label: (
              <Label primary="Go to Expansion Step" secondary={entry?.index} />
            ),
            action: () =>
              setUIState({ step: entry?.index ?? 0, playback: "paused" }),
            disabled: !entry,
          },
          {
            id: 4,
            label: (
              <Label primary="Rewind to This Step" secondary={current?.index} />
            ),
            action: () =>
              setUIState({ step: current?.index ?? 0, playback: "paused" }),
            disabled: !current,
          },
        ],
        ({id, label, icon, action, disabled }) => (
          <MenuItem
            key={`${id}`}
            disabled={disabled}
            onClick={() => {
              action();
              onClose?.();
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        )
      )}
    </Menu>
  );
}
