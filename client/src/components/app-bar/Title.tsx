import { MenuOutlined } from "@mui/icons-material";
import {
  Typography as Type,
  BoxProps,
  Box,
  IconButton,
  Popover,
  Menu,
  MenuItem,
} from "@mui/material";
import PopupState, {
  bindMenu,
  bindPopover,
  bindTrigger,
} from "material-ui-popup-state";

export function Title(props: BoxProps) {
  return (
    <Box bgcolor="primary.main" p={1} {...props}>
      {/* <Type
        variant="body1"
        color="text.secondary"
        sx={{
          color: "primary.contrastText",
          whiteSpace: "nowrap",
          fontWeight: 500,
        }}
      >
        PFAlgoViz
      </Type> */}
      <PopupState variant="popover">
        {(state) => (
          <>
            <IconButton
              {...bindTrigger(state)}
              sx={{ color: "primary.contrastText" }}
            >
              <MenuOutlined />
            </IconButton>
            <Menu {...bindMenu(state)}>
              <MenuItem disabled>Not Implemented</MenuItem>
            </Menu>
          </>
        )}
      </PopupState>
    </Box>
  );
}