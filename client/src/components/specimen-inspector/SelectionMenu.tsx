import {
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
import { Overline } from "components/generic/Overline";
import { Property } from "components/generic/Property";
import { map } from "lodash";
import { useUIState } from "slices/UIState";
import { SelectEvent as RendererSelectEvent } from "./Renderer";

type Props = {
  selection?: RendererSelectEvent;
  onClose?: () => void;
};

export function SelectionMenu({ selection, onClose }: Props) {
  const [, setUIState] = useUIState();
  const { global, world, info } = selection ?? {};
  const { current, entry } = info ?? {};

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
          <Overline>Point</Overline>
          <Property label="x" value={world?.x ?? "-"} />
          <Property label="y" value={world?.y ?? "-"} />
        </ListItemText>
      </ListItem>
      <Divider sx={{ my: 1 }} />
      {map(
        [
          {
            label: "Set Origin",
            icon: <StartIcon sx={{ transform: "scale(0.5)" }} />,
            action: () => {},
          },
          {
            label: "Set Destination",
            icon: <DestinationIcon />,
            action: () => {},
          },
          {
            label: "Go to Expansion Step",
            action: () => setUIState({ step: entry?.index ?? 0 }),
            disabled: !entry,
          },
          {
            label: "Rewind to This Step",
            action: () => setUIState({ step: current?.index ?? 0 }),
            disabled: !current,
          },
        ],
        ({ label, icon, action, disabled }) => (
          <MenuItem
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
